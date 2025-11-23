# Payment System Testing Guide

## 🧪 Test Scenarios for ACID-Compliant Payment System

### Setup

1. Ensure backend server is running: `npm run dev`
2. Database is connected and seeded
3. Have user credentials ready (or use seed data)

---

## Test Case 1: Successful Payment & Ticket Creation ✅

**Objective**: Verify complete happy path flow

### Steps:

1. Login as attendee
2. Browse to an event with available capacity
3. Click "Book Ticket"
4. Select ticket type
5. Complete payment

### Expected Results:

- ✅ Payment processed successfully (97% chance in simulation)
- ✅ Ticket created in database with status: 'active'
- ✅ Event tickets sold incremented by 1
- ✅ Attendee record created
- ✅ QR code generated with full event details
- ✅ Confirmation email sent with QR code and payment details
- ✅ Email includes: Event name, date, location, ticket type, payment ID

### Verification:

```bash
# Check ticket in database
SELECT * FROM tickets WHERE userId = <user_id> ORDER BY createdAt DESC LIMIT 1;

# Check event capacity updated
SELECT ticketsSold FROM events WHERE id = <event_id>;

# Check attendee created
SELECT * FROM attendees WHERE ticketId = <ticket_id>;
```

---

## Test Case 2: Payment Failure (No Ticket Created) ❌

**Objective**: Verify transaction rollback on payment failure

### Steps:

1. Login as attendee
2. Attempt to book ticket
3. Payment fails (3% chance in simulation, may need multiple attempts)

### Expected Results:

- ❌ Payment fails with error message
- ❌ NO ticket created in database
- ❌ Event tickets sold remains unchanged
- ❌ NO attendee record created
- ❌ NO email sent
- ✅ User receives clear error message

### Verification:

```bash
# Verify no ticket was created
SELECT COUNT(*) FROM tickets WHERE userId = <user_id> AND createdAt > NOW() - INTERVAL '1 minute';
# Should return 0

# Verify event capacity unchanged
SELECT ticketsSold FROM events WHERE id = <event_id>;
# Should be same as before attempt
```

---

## Test Case 3: Sold Out Event 🚫

**Objective**: Verify capacity constraint enforcement

### Steps:

1. Find or create event with capacity = 1
2. User A books ticket (should succeed)
3. User B attempts to book ticket (should fail)

### Expected Results:

- ✅ User A: Ticket created successfully
- ❌ User B: "Event is sold out" error
- ❌ User B: NO ticket created
- ❌ User B: NO payment processed
- ✅ Event tickets sold = capacity (not exceeded)

### Verification:

```bash
# Check event is at capacity
SELECT ticketsSold, capacity FROM events WHERE id = <event_id>;
# ticketsSold should equal capacity

# Try to book (should fail)
# Verify error response: "Event is sold out"
```

---

## Test Case 4: Concurrent Booking (Race Condition) 🏃‍♂️🏃‍♀️

**Objective**: Verify row-level locking prevents overselling

### Steps:

1. Find event with capacity = 1, tickets sold = 0
2. Simultaneously (within 1 second) have 2 users book ticket

### Expected Results:

- ✅ First request: Locks event row, creates ticket
- ✅ Second request: Waits for lock, sees sold out, fails
- ✅ Event tickets sold = 1 (NOT 2)
- ✅ Only 1 ticket exists in database

### Manual Test (Using Postman/Curl):

```bash
# Terminal 1
curl -X POST http://localhost:5000/api/tickets/book \
  -H "Authorization: Bearer <token1>" \
  -H "Content-Type: application/json" \
  -d '{"eventId": 1, "type": "General"}' &

# Terminal 2 (run immediately after)
curl -X POST http://localhost:5000/api/tickets/book \
  -H "Authorization: Bearer <token2>" \
  -H "Content-Type: application/json" \
  -d '{"eventId": 1, "type": "General"}' &
```

---

## Test Case 5: Database Error After Payment ⚠️

**Objective**: Verify transaction rollback on database errors

### Simulation:

- Temporarily break database constraint (e.g., invalid foreign key)
- Attempt to book ticket

### Expected Results:

- ✅ Payment processed
- ❌ Ticket creation fails (constraint violation)
- ✅ Transaction rolled back
- ❌ NO ticket in database
- ✅ Event capacity unchanged
- ⚠️ Note: In real system, refund would be triggered

---

## Test Case 6: Email Failure (Non-Critical) 📧

**Objective**: Verify ticket valid even if email fails

### Simulation:

- Set invalid EMAIL_USER or EMAIL_PASS in .env
- Book ticket

### Expected Results:

- ✅ Payment processed
- ✅ Ticket created in database
- ✅ Transaction committed
- ⚠️ Email fails (logged as warning)
- ✅ User can still access ticket via "My Tickets"
- ✅ QR code available in database

---

## Test Case 7: QR Code Content Verification 🔍

**Objective**: Verify QR code contains all event details

### Steps:

1. Book ticket successfully
2. Get QR code from email or database
3. Decode QR code

### Expected QR Code Data:

```json
{
  "ticketId": "TKT-1732392000000-1-abc123",
  "eventId": 1,
  "eventTitle": "Tech Conference 2025",
  "eventDate": "2025-12-15T18:00:00.000Z",
  "eventLocation": "Convention Center, New York",
  "userId": 1,
  "userName": "John Doe",
  "userEmail": "john@example.com",
  "ticketType": "VIP",
  "price": 150,
  "paymentId": "pi_1732392001234_xyz789",
  "issuedAt": "2025-11-23T10:30:00.000Z",
  "status": "active"
}
```

### Decode QR Online:

https://zxing.org/w/decode.jspx

---

## Test Case 8: Ticket Cancellation with Refund 💰

**Objective**: Verify ACID-compliant cancellation

### Steps:

1. Book ticket successfully
2. Cancel ticket via API or UI

### Expected Results:

- ✅ Refund processed (98% success rate in simulation)
- ✅ Ticket status changed to 'cancelled'
- ✅ Payment status changed to 'refunded'
- ✅ Event tickets sold decremented
- ✅ All changes within transaction
- ✅ Cancellation email sent

### Verification:

```bash
# Check ticket status
SELECT status, paymentStatus FROM tickets WHERE id = <ticket_id>;
# Should show: status='cancelled', paymentStatus='refunded'

# Check event capacity restored
SELECT ticketsSold FROM events WHERE id = <event_id>;
# Should be decremented by 1
```

---

## Test Case 9: Cannot Cancel Used Ticket 🎫

**Objective**: Verify business rule enforcement

### Steps:

1. Book ticket
2. Admin marks ticket as 'used' (checked in)
3. Attempt to cancel

### Expected Results:

- ❌ Cancellation rejected
- ✅ Error: "Cannot cancel a used ticket"
- ✅ Ticket status remains 'used'
- ✅ No refund processed

---

## Test Case 10: Payment Verification ✔️

**Objective**: Verify payment verification step

### Test Payment IDs:

- Valid: `pi_1732392000000_abc123` ✅
- Invalid format: `invalid_payment_id` ❌
- Non-existent: `pi_9999999999999_xyz999` (may pass in simulation)

### Expected Behavior:

- Valid format + exists in store → Verified ✅
- Invalid format → Rejected ❌
- Valid format but not in store → Fallback verification

---

## 🔧 Manual Testing Tools

### Postman Collection

**1. Login**

```
POST http://localhost:5000/api/auth/login
Body:
{
  "email": "john@example.com",
  "password": "password123"
}
```

**2. Book Ticket**

```
POST http://localhost:5000/api/tickets/book
Headers:
  Authorization: Bearer <token>
Body:
{
  "eventId": 1,
  "type": "General",
  "paymentMethod": "credit_card"
}
```

**3. Get My Tickets**

```
GET http://localhost:5000/api/tickets/my-tickets
Headers:
  Authorization: Bearer <token>
```

**4. Cancel Ticket**

```
DELETE http://localhost:5000/api/tickets/:id
Headers:
  Authorization: Bearer <token>
```

---

## 🐛 Debug Checklist

When testing, watch for these log messages:

### Success Flow:

```
🔄 Processing payment: pi_...
✅ Payment successful: pi_...
✅ Payment verified successfully: pi_...
✅ Ticket created in database: 123
✅ Event tickets sold updated: 5
✅ Attendee record created
✅ Transaction committed successfully
✅ QR code saved as tickets/ticket-123.png
✅ Confirmation email sent to user@example.com
```

### Failure Flow:

```
❌ Payment failed: Insufficient funds
🔄 Transaction rolled back due to error
```

---

## 📊 Performance Testing

### Load Test Scenario:

1. Create event with capacity = 100
2. Simulate 150 concurrent booking requests
3. Expected: 100 succeed, 50 fail with "sold out"
4. Verify: ticketsSold exactly = 100 (no overselling)

### Tools:

- Apache JMeter
- Artillery.io
- k6.io

---

## ✅ Acceptance Criteria

All tests must pass with these requirements:

1. ✅ Payment processed BEFORE ticket creation
2. ✅ Email sent ONLY AFTER successful payment
3. ✅ QR code contains complete event details
4. ✅ Transaction rolled back on ANY error
5. ✅ No partial states in database
6. ✅ Concurrent requests handled correctly (no overselling)
7. ✅ Refunds processed atomically
8. ✅ Business rules enforced (can't cancel used ticket)
9. ✅ Clear error messages for all failure cases
10. ✅ Non-critical failures (email) don't invalidate ticket

---

**Happy Testing! 🚀**
