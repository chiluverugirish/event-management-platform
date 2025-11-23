# 🎭 User Roles & Permissions

## Role System Overview

The Event Management Platform now includes a **3-tier role-based access control (RBAC) system**:

### 1. 👑 **Admin Role**

**Full platform access and control**

**Capabilities:**

- ✅ View all events, tickets, and users across the platform
- ✅ Create, edit, and delete any event (regardless of organizer)
- ✅ Manage all users and their permissions
- ✅ Access complete analytics for all events
- ✅ Manage check-ins for any event
- ✅ Process refunds and cancellations
- ✅ View revenue analytics for entire platform
- ✅ Perform administrative operations

**Use Cases:**

- Platform administrators
- System moderators
- Customer support managers

---

### 2. 🎪 **Organizer Role**

**Event creation and management**

**Capabilities:**

- ✅ Create new events
- ✅ Edit and delete their own events
- ✅ View attendee list for their events
- ✅ Manage check-ins for their events
- ✅ View analytics for their events
- ✅ View revenue for their events
- ✅ Book tickets for other events (as an attendee)

**Restrictions:**

- ❌ Cannot modify other organizers' events
- ❌ Cannot access platform-wide analytics
- ❌ Cannot manage users

**Use Cases:**

- Event creators
- Conference organizers
- Festival promoters
- Workshop hosts

---

### 3. 🎟️ **Attendee Role** (Default)

**Standard user access**

**Capabilities:**

- ✅ Browse all available events
- ✅ Book tickets for events
- ✅ View their own tickets
- ✅ Cancel their bookings
- ✅ View their booking history
- ✅ Receive QR codes and confirmations

**Restrictions:**

- ❌ Cannot create events
- ❌ Cannot access analytics
- ❌ Cannot manage check-ins
- ❌ Cannot view other users' tickets

**Use Cases:**

- Regular platform users
- Event attendees
- Ticket buyers

---

## 📊 Database Schema

### Updated User Model

```typescript
{
  id: number;
  name: string;
  email: string;
  password: string;
  role: "admin" | "organizer" | "attendee"; // NEW
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 🔐 Authentication & Authorization

### JWT Token Structure

When a user logs in, the JWT token now includes:

```json
{
  "id": 1,
  "role": "admin",
  "iat": 1700000000,
  "exp": 1700086400
}
```

### Middleware

**1. `authenticateJWT`** - Verifies JWT token and extracts user info

```typescript
// Adds to request: req.userId, req.userRole
```

**2. `checkRole(['admin', 'organizer'])`** - Restricts access by role

```typescript
// Usage in routes:
router.post(
  "/events",
  authenticateJWT,
  checkRole(["admin", "organizer"]),
  createEvent
);
```

**3. Helper Middlewares:**

- `isAdmin` - Only admins
- `isAdminOrOrganizer` - Admins and organizers

---

## 🔑 Test Accounts (Seeded Data)

### Admin Account

```
Email: admin@eventmanagement.com
Password: password123
Role: admin
```

### Organizer Accounts

```
Email: john.organizer@example.com
Password: password123
Role: organizer

Email: sarah.events@example.com
Password: password123
Role: organizer
```

### Attendee Accounts

```
Email: mike@example.com
Password: password123
Role: attendee

Email: emma@example.com
Password: password123
Role: attendee

Email: david@example.com
Password: password123
Role: attendee
```

---

## 📝 API Changes

### Registration Endpoint

**POST** `/api/auth/register`

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "organizer" // Optional: defaults to "attendee"
}
```

**Valid Roles:** `admin`, `organizer`, `attendee`

**Response:**

```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "organizer",
    "createdAt": "2025-11-23T15:30:00.000Z"
  }
}
```

### Login Endpoint

**POST** `/api/auth/login`

**Response:**

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "organizer"
  }
}
```

---

## 🛡️ Route Protection Examples

### Admin Only

```typescript
router.delete("/users/:id", authenticateJWT, isAdmin, deleteUser);
router.get(
  "/analytics/platform",
  authenticateJWT,
  isAdmin,
  getPlatformAnalytics
);
```

### Admin or Organizer

```typescript
router.post("/events", authenticateJWT, isAdminOrOrganizer, createEvent);
router.get(
  "/analytics/event/:id",
  authenticateJWT,
  isAdminOrOrganizer,
  getEventAnalytics
);
```

### Any Authenticated User

```typescript
router.post("/tickets/book", authenticateJWT, bookTicket);
router.get("/tickets/my-tickets", authenticateJWT, getMyTickets);
```

---

## 📦 Seeded Data Summary

### 6 Users Created:

- 1 Admin
- 2 Organizers
- 3 Attendees

### 8 Events Created:

1. **Tech Conference 2025** (Organizer: John)

   - 3 ticket types: General ($50), VIP ($150), Early Bird ($35)
   - Capacity: 500

2. **Music Festival 2025** (Organizer: Sarah)

   - 3 ticket types: Single Day ($80), 3-Day Pass ($200), VIP ($350)
   - Capacity: 1000

3. **Web Development Workshop** (Organizer: John)

   - 2 ticket types: Standard ($25), Premium ($45)
   - Capacity: 100

4. **Startup Networking Event** (Organizer: Sarah)

   - 2 ticket types: General (FREE), Entrepreneur ($30)
   - Capacity: 200

5. **Digital Marketing Summit** (Organizer: John)

   - 3 ticket types: Standard ($75), Premium ($125), Group of 5 ($300)
   - Capacity: 300

6. **AI & Machine Learning Conference** (Organizer: Sarah)

   - 3 ticket types: General ($100), VIP ($200), Student ($50)
   - Capacity: 400

7. **Food & Wine Festival** (Organizer: John)

   - 3 ticket types: General ($65), VIP ($120), Chef's Table ($250)
   - Capacity: 600

8. **Fitness & Wellness Expo** (Organizer: Sarah)
   - 2 ticket types: General ($20), VIP ($50)
   - Capacity: 800

### 3 Sample Tickets:

- Mike booked General ticket for Tech Conference
- Emma booked VIP ticket for Tech Conference
- David booked Single Day ticket for Music Festival

---

## 🚀 Running the Seeder

To populate your database with sample data:

```bash
npm run seed
```

This will:

1. Sync database models (add role column if missing)
2. Clear existing data
3. Create 6 users with different roles
4. Create 8 diverse events
5. Create 3 sample tickets
6. Create 3 attendees

---

## 💡 Future Enhancements

Potential role system improvements:

- [ ] **Super Admin** - Platform owner with billing access
- [ ] **Moderator** - Can approve/reject events
- [ ] **Vendor** - Special access for food/merchandise vendors
- [ ] **Volunteer** - Check-in access without full organizer rights
- [ ] **Custom Permissions** - Granular permission system
- [ ] **Team Management** - Organizers can add team members
- [ ] **Role Hierarchy** - Inheritance of permissions

---

## 📚 Documentation

For complete API documentation, see:

- `backend/API_DOCUMENTATION.md`
- `README.md`
- `STATUS.md`

---

**Last Updated:** November 23, 2025  
**Version:** 2.0.0 (with RBAC)
