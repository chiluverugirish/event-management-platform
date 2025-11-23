# 🎉 Event Management Platform - Complete Full-Stack Application

A comprehensive event management system with advanced features including event scheduling, ticket booking with multiple types, payment processing, QR code generation, attendee check-in system, and real-time analytics dashboard.

---

## ✨ Features

### 🎯 Core Functionality

- ✅ **Event Creation & Scheduling** - Create events with start/end times, locations, and capacity management
- ✅ **Multiple Ticket Types** - Support for General, VIP, Early Bird tickets with dynamic pricing
- ✅ **Payment Processing** - Integrated Stripe/PayPal simulation with transaction tracking
- ✅ **QR Code Generation** - Unique QR codes for each ticket for validation
- ✅ **Attendee Management** - Track all attendees with detailed information
- ✅ **Check-in System** - Real-time check-in with QR code scanning
- ✅ **Analytics Dashboard** - Comprehensive stats on events, tickets, revenue, and check-ins
- ✅ **Automated Notifications** - Email confirmations with QR codes and event reminders
- ✅ **JWT Authentication** - Secure user authentication and authorization
- ✅ **TypeScript** - Full type safety across all entities

### 🛡️ Security & Quality

- JWT-based authentication
- Password hashing with bcrypt
- Protected API routes
- Input validation
- Error handling
- Type-safe codebase with TypeScript

---

## 🏗️ Project Structure

```
event-management-platform/
│
├── backend/                    # Express.js API Server
│   ├── src/
│   │   ├── config/            # Database, mailer, payment config
│   │   ├── controllers/       # Business logic
│   │   │   ├── authController.ts
│   │   │   ├── eventController.ts
│   │   │   ├── ticketController.ts
│   │   │   ├── attendeeController.ts      ✨ NEW
│   │   │   └── analyticsController.ts     ✨ NEW
│   │   ├── models/            # Sequelize models
│   │   │   ├── User.ts
│   │   │   ├── Event.ts       # Enhanced with ticketTypes, status
│   │   │   ├── Ticket.ts      # Enhanced with payment, pricing
│   │   │   └── Attendee.ts    # Enhanced with check-in tracking
│   │   ├── routes/            # API routes
│   │   │   ├── authRoutes.ts
│   │   │   ├── eventRoutes.ts
│   │   │   ├── ticketRoutes.ts
│   │   │   ├── attendeeRoutes.ts          ✨ NEW
│   │   │   └── analyticsRoutes.ts         ✨ NEW
│   │   ├── middlewares/       # Auth & error handling
│   │   └── server.ts          # Main server file
│   ├── tickets/               # Generated QR codes
│   ├── test-api.http          # API testing file
│   ├── API_DOCUMENTATION.md   ✨ NEW - Complete API docs
│   ├── package.json
│   └── .env
│
├── frontend/                   # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API integration
│   │   ├── layouts/           # Layout wrappers
│   │   ├── hooks/             # Custom React hooks
│   │   ├── utils/             # Helper functions
│   │   └── ...
│   ├── package.json
│   └── .env
│
└── README.md                  # This file
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js (v16+)
- MySQL Server
- npm or yarn

### 1️⃣ Clone & Setup

```bash
# Navigate to project directory
cd "d:\New folder\event-management-platform"
```

### 2️⃣ Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies (if not already installed)
npm install

# Configure environment variables
# Edit backend/.env with your MySQL credentials

# Start backend server
npm run dev
```

✅ Backend runs at: **http://localhost:5050**

### 3️⃣ Frontend Setup

```bash
# Open new terminal and navigate to frontend
cd frontend

# Install dependencies
npm install

# Start frontend dev server
npm run dev
```

✅ Frontend runs at: **http://localhost:3000**

### 4️⃣ Open Application

Open your browser and visit: **http://localhost:3000**

---

## 📚 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Events

- `GET /api/events` - Get all events (public)
- `GET /api/events/:id` - Get single event (public)
- `POST /api/events` - Create event (protected)
- `PUT /api/events/:id` - Update event (protected)
- `DELETE /api/events/:id` - Delete event (protected)

### Tickets

- `POST /api/tickets` - Book ticket with payment (protected)
- `GET /api/tickets/my-tickets` - Get user's tickets (protected)
- `PUT /api/tickets/cancel/:id` - Cancel ticket (protected)

### Attendees & Check-in ✨ NEW

- `GET /api/attendees/event/:eventId` - Get event attendees (protected)
- `POST /api/attendees/checkin` - Check-in attendee (protected)
- `POST /api/attendees/undo-checkin/:attendeeId` - Undo check-in (protected)
- `GET /api/attendees/stats/:eventId` - Get check-in stats (protected)

### Analytics Dashboard ✨ NEW

- `GET /api/analytics/dashboard` - Get overall analytics
- `GET /api/analytics/event/:eventId` - Get event analytics (protected)
- `GET /api/analytics/revenue` - Get revenue analytics (protected)

📖 **Full API Documentation:** See `backend/API_DOCUMENTATION.md`

---

## 🔧 Tech Stack

### Backend

- **Express.js** - Web framework
- **TypeScript** - Type safety
- **MySQL + Sequelize** - Database & ORM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Nodemailer** - Email notifications
- **QRCode** - QR code generation
- **Stripe API** - Payment simulation

### Frontend

- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **Axios** - HTTP client

---

## 📊 Database Schema

### Enhanced Models

#### **Events**

```typescript
{
  id, title, description, date, endDate, location,
  capacity, ticketsSold, status, organizerId,
  ticketTypes: {
    General: { price: 50, available: 300 },
    VIP: { price: 150, available: 100 }
  }
}
```

#### **Tickets**

```typescript
{
  id, eventId, userId, type, price, qrCode, paymentStatus, paymentId, status;
}
```

#### **Attendees** ✨ NEW

```typescript
{
  id, ticketId, name, email, phone, checkedIn, checkInTime;
}
```

---

## 🎟️ Features in Action

### 1. Ticket Booking Flow

1. User selects event and ticket type (General/VIP/Early Bird)
2. Payment is processed (simulated Stripe)
3. Unique QR code is generated
4. Ticket saved to database
5. Email sent with QR code and ticket details
6. Attendee record created

### 2. Check-in System

1. Scan QR code or enter ticket ID
2. System validates ticket
3. Mark attendee as checked-in
4. Update ticket status to "used"
5. Record check-in time
6. Display attendee information

### 3. Analytics Dashboard

- Total events, tickets sold, revenue
- Check-in rates and statistics
- Revenue by event and ticket type
- Sales trends over time
- Popular events ranking

---

## 📧 Email Notifications

Automated emails are sent for:

- ✅ Ticket booking confirmation with QR code
- ✅ Event reminders (24 hours before)
- ✅ Check-in confirmation

**Email Template Includes:**

- Event details (title, date, location)
- Ticket type and price
- Payment confirmation
- QR code image
- Check-in instructions

---

## 💳 Payment System

**Simulated Stripe/PayPal Integration:**

- 95% success rate simulation
- Realistic payment IDs generated
- Transaction tracking
- Refund support for cancelled tickets
- Payment status tracking (pending, completed, failed, refunded)

---

## 🧪 Testing

### Using REST Client (VS Code)

Open `backend/test-api.http` and run requests directly from VS Code

### Test Scenarios:

1. **Complete Booking Flow**

   - Register → Login → Create Event → Book Ticket → Check-in

2. **Event Management**

   - Create multiple events with different ticket types
   - Update event capacity and status
   - View analytics

3. **Analytics Dashboard**
   - View overall statistics
   - Monitor event performance
   - Track revenue and check-ins

---

## 🔐 Environment Variables

### Backend (.env)

```env
PORT=5050
JWT_SECRET=your_secret_key
DB_HOST=127.0.0.1
DB_USER=root
DB_PASS=your_password
DB_NAME=event_management
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
STRIPE_KEY=test_stripe_key
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5050/api
```

---

## 🎯 Key Features Implemented

### ✅ Requirements Met

1. **Event Management**

   - ✅ Event creation with scheduling
   - ✅ Date and time management
   - ✅ Capacity tracking
   - ✅ Event status (upcoming, ongoing, completed, cancelled)

2. **Ticket System**

   - ✅ Multiple ticket types (General, VIP, Early Bird)
   - ✅ Dynamic pricing per type
   - ✅ QR code generation
   - ✅ Payment processing integration

3. **Attendee Management**

   - ✅ Attendee registration with tickets
   - ✅ Check-in system with QR validation
   - ✅ Check-in statistics
   - ✅ Undo check-in functionality

4. **Payment Processing**

   - ✅ Stripe/PayPal simulation
   - ✅ Transaction tracking
   - ✅ Payment status management
   - ✅ Refund support

5. **Notifications**

   - ✅ Automated email confirmations
   - ✅ QR code in emails
   - ✅ Event reminders
   - ✅ HTML email templates

6. **Analytics Dashboard**

   - ✅ Overall statistics
   - ✅ Event-specific analytics
   - ✅ Revenue tracking
   - ✅ Check-in metrics

7. **Security & Type Safety**
   - ✅ JWT authentication
   - ✅ TypeScript across all entities
   - ✅ Protected routes
   - ✅ Input validation

---

## 📱 Frontend Features

- Modern, responsive UI with Tailwind CSS
- User authentication (Login/Signup)
- Event browsing and booking
- My Tickets page with QR codes
- Dashboard with statistics
- Protected routes
- Error handling and loading states

---

## 🚨 Troubleshooting

### Backend won't start

```bash
# Check MySQL is running
Get-Service MySQL80

# Verify database credentials in backend/.env
# Check if port 5050 is available
```

### Frontend won't start

```bash
# Delete node_modules and reinstall
cd frontend
Remove-Item node_modules -Recurse -Force
npm install
```

### Database errors

```bash
# Database will be created automatically on first run
# Make sure MySQL credentials in .env are correct
```

---

## 👨‍💻 Author

**Yashwant Reddy**

---

## 📄 License

ISC

---

## 🎉 What's New in This Version

### ✨ Major Enhancements

1. **Enhanced Ticket System**

   - Multiple ticket types with pricing
   - Payment integration
   - Automated QR generation
   - Email confirmations

2. **Attendee Management**

   - Complete check-in system
   - QR code validation
   - Check-in statistics
   - Undo functionality

3. **Analytics Dashboard**

   - Real-time statistics
   - Revenue tracking
   - Event performance metrics
   - Sales trends

4. **Better Organization**
   - Separate backend/frontend folders
   - Complete API documentation
   - Enhanced TypeScript types
   - Improved error handling

---

## 🚀 Get Started Now!

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev

# Open browser
http://localhost:3000
```

**Enjoy building amazing events! 🎊**
