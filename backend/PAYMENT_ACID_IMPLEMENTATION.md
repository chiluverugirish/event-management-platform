# Payment System - ACID Implementation Documentation

## 🎯 Overview

This document details the ACID-compliant payment implementation for the Event Management Platform, ensuring data consistency, reliability, and proper error handling.

## 🔐 ACID Properties Implementation

### **A - Atomicity**

All database operations in a payment transaction are treated as a single unit. Either all operations succeed, or none do.

#### Implementation:

- **Transaction Wrapper**: Every ticket booking uses `sequelize.transaction()`
- **All-or-Nothing**: Payment verification → Ticket creation → Event update → Attendee creation
- **Rollback on Failure**: Any failure at any step rolls back all changes

```typescript
transaction = await sequelize.transaction({
  isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED
});

// All operations within transaction
const ticket = await Ticket.create({...}, { transaction });
await event.save({ transaction });
await Attendee.create({...}, { transaction });

// Commit only if all succeed
await transaction.commit();
```

### **C - Consistency**

Database remains in a valid state before and after transactions.

#### Implementation:

- **Pre-validation**: Check event exists, capacity available, valid ticket type
- **Row-level Locking**: Prevents race conditions on event capacity
- **Payment Verification**: Payment must be completed before ticket creation
- **Referential Integrity**: Foreign keys ensure valid relationships

```typescript
const event = await Event.findByPk(eventId, {
  lock: transaction.LOCK.UPDATE, // Lock row for update
  transaction,
});

if (event.ticketsSold >= event.capacity) {
  await transaction.rollback();
  return error("Event is sold out");
}
```

### **I - Isolation**

Concurrent transactions don't interfere with each other.

#### Implementation:

- **Isolation Level**: `READ_COMMITTED` prevents dirty reads
- **Row-Level Locks**: Prevents concurrent modifications to same event
- **Payment Store**: Idempotency checks prevent duplicate payments

```typescript
transaction = await sequelize.transaction({
  isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
});
```

### **D - Durability**

Committed transactions persist even after system failure.

#### Implementation:

- **Database Persistence**: All data written to PostgreSQL/MySQL
- **Transaction Commit**: Explicit commit ensures data is flushed to disk
- **Payment IDs**: Unique identifiers enable recovery and verification
- **Audit Trail**: CreatedAt, updatedAt timestamps track all changes

## 🔄 Payment Flow (ACID-Compliant)

### Step-by-Step Process:

```
1. START TRANSACTION
   ├─> Input Validation
   ├─> Lock Event Row (READ_COMMITTED)
   ├─> Verify Event Capacity
   └─> Get User Details

2. PROCESS PAYMENT (External Service)
   ├─> Generate Unique Payment ID
   ├─> Call Payment Gateway
   ├─> Verify Payment Success
   └─> Store Payment Record

3. CREATE TICKET (Within Transaction)
   ├─> Generate QR Code with Event Details
   ├─> Create Ticket Record
   ├─> Update Event Tickets Sold
   └─> Create Attendee Record

4. COMMIT TRANSACTION
   ├─> All DB changes persisted
   └─> Release locks

5. POST-TRANSACTION (Non-Critical)
   ├─> Save QR Code File
   ├─> Send Confirmation Email
   └─> Return Success Response

ERROR HANDLING:
   └─> ROLLBACK TRANSACTION at ANY failure
```

## 🚨 Critical Fixes Implemented

### 1. **Payment Before Email**

**Problem**: Emails were sent before payment confirmation
**Solution**: Email only sent AFTER successful payment and ticket creation

```typescript
// ❌ BEFORE (WRONG)
await sendEmail(); // Sent even if payment fails
const payment = await processPayment();

// ✅ AFTER (CORRECT)
const payment = await processPayment();
if (!payment.success) {
  return error("Payment failed");
}
await transaction.commit(); // Commit first
await sendEmail(); // Send only after success
```

### 2. **QR Code with Event Details**

**Problem**: QR code only had ticket ID
**Solution**: QR code now contains comprehensive event and ticket information

```typescript
const qrData = JSON.stringify({
  ticketId: uniqueId,
  eventId: event.id,
  eventTitle: event.title,
  eventDate: event.date,
  eventLocation: event.location,
  userId: user.id,
  userName: user.name,
  userEmail: user.email,
  ticketType: type,
  price: price,
  paymentId: paymentResult.paymentId,
  issuedAt: new Date().toISOString(),
  status: "active",
});
```

### 3. **Payment Verification**

**Problem**: No verification that payment was actually processed
**Solution**: Dual verification system

```typescript
// Process payment
const paymentResult = await processPayment(...);

// Verify payment
const isValid = await verifyPayment(paymentResult.paymentId);
if (!isValid) {
  await transaction.rollback();
  return error("Payment verification failed");
}
```

### 4. **Race Condition Prevention**

**Problem**: Multiple users could book the last ticket simultaneously
**Solution**: Row-level locking with `LOCK.UPDATE`

```typescript
const event = await Event.findByPk(eventId, {
  lock: transaction.LOCK.UPDATE, // Exclusive lock
  transaction,
});
```

## 🛡️ Error Handling

### Transaction Rollback Strategy:

```typescript
try {
  transaction = await sequelize.transaction();

  // Validation errors → Rollback + Return 400
  if (!valid) {
    await transaction.rollback();
    return res.status(400).json({ message: "Validation error" });
  }

  // Payment errors → Rollback + Return 400
  if (!payment.success) {
    await transaction.rollback();
    return res.status(400).json({ message: "Payment failed" });
  }

  // Database errors → Rollback + Return 500
  await ticket.create({...}, { transaction });

  await transaction.commit();

} catch (err) {
  // Catch-all rollback
  if (transaction) {
    await transaction.rollback();
  }
  return res.status(500).json({ message: "System error" });
}
```

### Critical vs Non-Critical Errors:

**Critical (Rollback Transaction)**:

- Payment failures
- Database constraint violations
- Capacity exceeded
- Invalid ticket type

**Non-Critical (Log Only)**:

- Email send failures (ticket already valid)
- QR code file save failures (QR in database)

## 🔍 Payment Verification

### Idempotency:

```typescript
// Payment store tracks processed payments
const paymentStore = new Map<string, PaymentResult>();

// Check for duplicate payments
export const checkDuplicatePayment = (userId: number, eventId: number) => {
  // Query recent payments for same user/event
  // Prevent double-booking
};
```

### Verification Process:

```typescript
export const verifyPayment = async (paymentId: string): Promise<boolean> => {
  // 1. Format validation
  if (!paymentId.startsWith("pi_")) return false;

  // 2. Store lookup
  const payment = paymentStore.get(paymentId);
  if (payment) return payment.status === "completed";

  // 3. External API verification (production)
  const result = await externalPaymentAPI.verify(paymentId);
  return result.valid;
};
```

## 📊 Cancellation & Refunds

### ACID-Compliant Cancellation:

```typescript
1. START TRANSACTION
2. Lock Ticket & Event rows
3. Validate cancellation allowed
4. Process refund (if applicable)
5. Update ticket status → 'cancelled'
6. Decrement event tickets sold
7. COMMIT TRANSACTION
8. Send cancellation email (non-critical)
```

## 🧪 Testing Payment Flow

### Test Scenarios:

1. **Happy Path**: Payment succeeds, ticket created
2. **Payment Failure**: Payment fails, no ticket created
3. **Sold Out**: Capacity reached, payment rejected
4. **Concurrent Booking**: Two users, one ticket → One succeeds, one fails
5. **Database Error**: DB fails after payment → Transaction rolled back
6. **Email Failure**: Email fails → Ticket still valid

### Verification Checklist:

- [ ] Payment processed before ticket creation
- [ ] Email sent only after successful payment
- [ ] QR code contains all event details
- [ ] Transaction rolled back on any error
- [ ] No partial states in database
- [ ] Concurrent requests handled correctly
- [ ] Refunds processed properly

## 📈 Performance Considerations

### Optimizations:

1. **Connection Pooling**: Reuse database connections
2. **Transaction Timeout**: 30-second limit on transactions
3. **Lock Duration**: Minimize time holding locks
4. **Async Operations**: Payment API calls are async
5. **Cleanup**: Periodic cleanup of old payment records

### Monitoring:

```typescript
console.log("✅ Payment verified:", paymentId);
console.log("✅ Ticket created:", ticketId);
console.log("✅ Transaction committed");
console.log("⚠️ Non-critical error:", error);
console.log("❌ Critical error - rolled back:", error);
```

## 🚀 Deployment Notes

### Environment Variables:

```env
DATABASE_URL=postgresql://...
TRANSACTION_TIMEOUT=30000
PAYMENT_API_KEY=...
EMAIL_USER=...
EMAIL_PASS=...
```

### Database Configuration:

- Enable row-level locking
- Set isolation level: READ_COMMITTED
- Configure connection pool (min: 5, max: 20)
- Enable query logging for debugging

## 📚 References

- Sequelize Transactions: https://sequelize.org/docs/v6/other-topics/transactions/
- ACID Properties: Database theory
- Payment Gateway Best Practices
- PostgreSQL Locking: https://www.postgresql.org/docs/current/explicit-locking.html

---

**Last Updated**: November 23, 2025
**Version**: 2.0 (ACID-Compliant)
