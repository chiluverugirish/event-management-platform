// src/server.ts
import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import sequelize, { createDatabaseIfNotExists } from "./config/db";

// Routes
import authRoutes from "./routes/authRoutes";
import eventRoutes from "./routes/eventRoutes";
import ticketRoutes from "./routes/ticketRoutes";
import attendeeRoutes from "./routes/attendeeRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Welcome route
app.get("/", (req, res) => {
  res.json({
    message: "🎉 Welcome to Event Management API",
    version: "2.0.0",
    features: [
      "Event creation and scheduling",
      "Multiple ticket types with pricing",
      "Payment processing (Stripe simulation)",
      "QR code generation for tickets",
      "Attendee management and check-in system",
      "Real-time analytics dashboard",
      "Automated email notifications",
      "JWT authentication"
    ],
    endpoints: {
      auth: {
        register: "POST /api/auth/register",
        login: "POST /api/auth/login"
      },
      events: {
        getAll: "GET /api/events",
        getOne: "GET /api/events/:id",
        create: "POST /api/events (protected)",
        update: "PUT /api/events/:id (protected)",
        delete: "DELETE /api/events/:id (protected)"
      },
      tickets: {
        book: "POST /api/tickets (protected)",
        myTickets: "GET /api/tickets/my-tickets (protected)",
        cancel: "PUT /api/tickets/cancel/:id (protected)"
      },
      attendees: {
        getEventAttendees: "GET /api/attendees/event/:eventId (protected)",
        checkIn: "POST /api/attendees/checkin (protected)",
        undoCheckIn: "POST /api/attendees/undo-checkin/:attendeeId (protected)",
        stats: "GET /api/attendees/stats/:eventId (protected)"
      },
      analytics: {
        dashboard: "GET /api/analytics/dashboard",
        eventStats: "GET /api/analytics/event/:eventId (protected)",
        revenue: "GET /api/analytics/revenue (protected)"
      }
    },
    documentation: "See README.md for full API documentation"
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/attendees", attendeeRoutes);
app.use("/api/analytics", analyticsRoutes);

// Initialize database
const initializeDatabase = async () => {
  try {
    // Create database if it doesn't exist
    await createDatabaseIfNotExists();
    
    // Connect and sync tables
    await sequelize.sync();
    console.log("✅ Database connected successfully!");
    console.log("📊 All models synced");
  } catch (err) {
    console.log("❌ Database connection failed:", err);
  }
};

initializeDatabase();

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🚀 Event Management API Server                          ║
║                                                            ║
║   📍 Server: http://localhost:${PORT}                        ║
║   📚 API Docs: http://localhost:${PORT}/                     ║
║   🔐 Authentication: JWT                                   ║
║   💳 Payment: Stripe Simulation                           ║
║   📧 Notifications: Nodemailer                            ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});
