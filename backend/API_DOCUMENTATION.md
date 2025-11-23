# Event Management Platform - Complete API Documentation

## 📋 Overview

A complete event management system with:

- ✅ Event creation and scheduling
- ✅ Multiple ticket types with dynamic pricing
- ✅ Payment processing (Stripe/PayPal simulation)
- ✅ QR code generation for tickets
- ✅ Attendee management and check-in system
- ✅ Real-time analytics dashboard
- ✅ Automated email notifications
- ✅ JWT authentication
- ✅ TypeScript for type safety

---

## 🔧 Tech Stack

- **Express.js** - API development
- **TypeScript** - Type safety across all entities
- **MySQL + Sequelize** - Database ORM
- **JWT** - User authentication
- **QRCode** - Ticket validation
- **Nodemailer** - Email notifications
- **Stripe API** - Payment processing (simulated)

---

## 🚀 API Endpoints

### **Authentication** (`/api/auth`)

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### Login User

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### **Events** (`/api/events`)

#### Get All Events (Public)

```http
GET /api/events
```

**Response:**

```json
[
  {
    "id": 1,
    "title": "Tech Conference 2025",
    "description": "Annual technology conference",
    "date": "2025-12-15T10:00:00.000Z",
    "endDate": "2025-12-15T18:00:00.000Z",
    "location": "Convention Center",
    "capacity": 500,
    "ticketsSold": 120,
    "status": "upcoming",
    "ticketTypes": {
      "General": { "price": 50, "available": 300 },
      "VIP": { "price": 150, "available": 100 },
      "EarlyBird": { "price": 30, "available": 100 }
    }
  }
]
```

#### Get Single Event (Public)

```http
GET /api/events/:id
```

#### Create Event (Protected)

```http
POST /api/events
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Music Festival 2025",
  "description": "Annual music festival",
  "date": "2025-08-20T14:00:00Z",
  "endDate": "2025-08-22T23:00:00Z",
  "location": "Central Park",
  "capacity": 1000,
  "ticketTypes": {
    "General": { "price": 75, "available": 700 },
    "VIP": { "price": 200, "available": 200 },
    "EarlyBird": { "price": 50, "available": 100 }
  }
}
```

#### Update Event (Protected)

```http
PUT /api/events/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "capacity": 1200,
  "status": "ongoing"
}
```

#### Delete Event (Protected)

```http
DELETE /api/events/:id
Authorization: Bearer <token>
```

---

### **Tickets** (`/api/tickets`)

#### Book Ticket (Protected)

```http
POST /api/tickets
Authorization: Bearer <token>
Content-Type: application/json

{
  "eventId": 1,
  "type": "VIP",
  "paymentMethod": "card"
}
```

**Response:**

```json
{
  "message": "Ticket booked successfully",
  "ticket": {
    "id": 1,
    "eventId": 1,
    "userId": 1,
    "type": "VIP",
    "price": "150.00",
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANS...",
    "paymentStatus": "completed",
    "paymentId": "pi_1234567890_abc123",
    "status": "active"
  },
  "payment": {
    "transactionId": "txn_1638291234",
    "amount": 150,
    "status": "completed"
  }
}
```

**Note:** QR code and ticket confirmation sent to user's email automatically.

#### Get My Tickets (Protected)

```http
GET /api/tickets/my-tickets
Authorization: Bearer <token>
```

#### Cancel Ticket (Protected)

```http
PUT /api/tickets/cancel/:id
Authorization: Bearer <token>
```

---

### **Attendees** (`/api/attendees`)

#### Get Event Attendees (Protected)

```http
GET /api/attendees/event/:eventId
Authorization: Bearer <token>
```

**Response:**

```json
[
  {
    "id": 1,
    "ticketId": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "checkedIn": true,
    "checkInTime": "2025-12-15T09:30:00.000Z",
    "Ticket": {
      "type": "VIP",
      "Event": {
        "title": "Tech Conference 2025"
      }
    }
  }
]
```

#### Check-in Attendee (Protected)

```http
POST /api/attendees/checkin
Authorization: Bearer <token>
Content-Type: application/json

{
  "ticketId": 1
}
// OR
{
  "qrCode": "data:image/png;base64,..."
}
```

**Response:**

```json
{
  "message": "Check-in successful",
  "attendee": {
    "id": 1,
    "name": "John Doe",
    "checkedIn": true,
    "checkInTime": "2025-12-15T09:30:00.000Z"
  }
}
```

#### Undo Check-in (Protected)

```http
POST /api/attendees/undo-checkin/:attendeeId
Authorization: Bearer <token>
```

#### Get Check-in Statistics (Protected)

```http
GET /api/attendees/stats/:eventId
Authorization: Bearer <token>
```

**Response:**

```json
{
  "totalTickets": 150,
  "checkedIn": 95,
  "notCheckedIn": 55,
  "checkInPercentage": "63.33",
  "recentCheckIns": [...]
}
```

---

### **Analytics** (`/api/analytics`)

#### Get Dashboard Analytics

```http
GET /api/analytics/dashboard
Authorization: Bearer <token> (optional for public stats)
```

**Response:**

```json
{
  "overview": {
    "totalEvents": 25,
    "upcomingEvents": 10,
    "completedEvents": 12,
    "totalTickets": 1250,
    "activeTickets": 890,
    "usedTickets": 320,
    "totalRevenue": "125000.00",
    "totalUsers": 450,
    "totalCheckedIn": 320
  },
  "recentEvents": [...],
  "popularEvents": [...],
  "userStats": {
    "ticketsPurchased": 5,
    "eventsCreated": 2
  }
}
```

#### Get Event Analytics (Protected)

```http
GET /api/analytics/event/:eventId
Authorization: Bearer <token>
```

**Response:**

```json
{
  "event": {
    "id": 1,
    "title": "Tech Conference 2025",
    "capacity": 500,
    "ticketsSold": 320,
    "capacityUsed": "64.00%"
  },
  "ticketsByType": [
    { "type": "General", "count": 200, "revenue": "10000.00" },
    { "type": "VIP", "count": 100, "revenue": "15000.00" },
    { "type": "EarlyBird", "count": 20, "revenue": "600.00" }
  ],
  "ticketsByPaymentStatus": [
    { "paymentStatus": "completed", "count": 310 },
    { "paymentStatus": "pending", "count": 10 }
  ],
  "checkInStats": {
    "total": 320,
    "checkedIn": 250,
    "notCheckedIn": 70,
    "percentage": "78.13"
  },
  "salesOverTime": [...]
}
```

#### Get Revenue Analytics (Protected)

```http
GET /api/analytics/revenue
Authorization: Bearer <token>
```

---

## 📊 Database Schema

### **Users**

- id (PK)
- name
- email (unique)
- password (hashed)
- createdAt
- updatedAt

### **Events**

- id (PK)
- title
- description
- date
- endDate
- location
- capacity
- ticketsSold
- status (upcoming, ongoing, completed, cancelled)
- organizerId (FK → users)
- ticketTypes (JSON)
- createdAt
- updatedAt

### **Tickets**

- id (PK)
- eventId (FK → events)
- userId (FK → users)
- type (General, VIP, EarlyBird, etc.)
- price
- qrCode (TEXT)
- paymentStatus (pending, completed, failed, refunded)
- paymentId
- status (active, cancelled, used)
- createdAt
- updatedAt

### **Attendees**

- id (PK)
- ticketId (FK → tickets)
- name
- email
- phone
- checkedIn (boolean)
- checkInTime
- createdAt
- updatedAt

---

## 🔐 Authentication

All protected routes require JWT token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Token is obtained from `/api/auth/login` endpoint.

---

## 📧 Email Notifications

Automated emails are sent for:

1. **Ticket Booking** - Confirmation with QR code
2. **Event Reminders** - 24 hours before event
3. **Check-in Confirmation** - After successful check-in

---

## 💳 Payment Processing

The system simulates Stripe/PayPal payment gateway:

- 95% success rate simulation
- Generates realistic payment IDs
- Supports refunds for cancelled tickets
- Records all transactions

---

## 🎟️ QR Code System

Each ticket has a unique QR code containing:

```json
{
  "ticketId": "TKT-1638291234-1",
  "eventId": 1,
  "userId": 1,
  "type": "VIP",
  "issuedAt": "2025-11-23T10:00:00.000Z"
}
```

QR codes are:

- Saved as PNG files in `/tickets` folder
- Embedded in confirmation emails
- Used for check-in validation

---

## 🚀 Running the Application

### Backend Setup:

```bash
cd backend
npm install
npm run dev
```

### Frontend Setup:

```bash
cd frontend
npm install
npm run dev
```

**Backend:** http://localhost:5050
**Frontend:** http://localhost:3000

---

## 📝 Environment Variables

### Backend (.env):

```env
PORT=5050
JWT_SECRET=your_secret_key
DB_HOST=127.0.0.1
DB_USER=root
DB_PASS=your_password
DB_NAME=event_management
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
STRIPE_KEY=test_stripe_key
```

### Frontend (.env):

```env
VITE_API_URL=http://localhost:5050/api
```

---

## ✨ Features Implemented

✅ Event creation and scheduling with date/time management
✅ Multiple ticket types (General, VIP, Early Bird) with dynamic pricing
✅ Payment processing with Stripe simulation
✅ QR code generation for ticket validation
✅ Attendee management system
✅ Real-time check-in system
✅ Analytics dashboard with comprehensive stats
✅ Revenue tracking and reporting
✅ Automated email notifications
✅ JWT authentication
✅ TypeScript type safety
✅ RESTful API design
✅ Error handling and validation
✅ Database relationships and constraints

---

## 👨‍💻 Author

Built by **Yashwant Reddy**

---

## 📄 License

ISC
