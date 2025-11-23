"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/server.ts
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const db_1 = __importStar(require("./config/db"));
// Routes
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const eventRoutes_1 = __importDefault(require("./routes/eventRoutes"));
const ticketRoutes_1 = __importDefault(require("./routes/ticketRoutes"));
const attendeeRoutes_1 = __importDefault(require("./routes/attendeeRoutes"));
const analyticsRoutes_1 = __importDefault(require("./routes/analyticsRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
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
app.use("/api/auth", authRoutes_1.default);
app.use("/api/events", eventRoutes_1.default);
app.use("/api/tickets", ticketRoutes_1.default);
app.use("/api/attendees", attendeeRoutes_1.default);
app.use("/api/analytics", analyticsRoutes_1.default);
// Initialize database
const initializeDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Create database if it doesn't exist
        yield (0, db_1.createDatabaseIfNotExists)();
        // Connect and sync tables
        yield db_1.default.sync();
        console.log("✅ Database connected successfully!");
        console.log("📊 All models synced");
    }
    catch (err) {
        console.log("❌ Database connection failed:", err);
    }
});
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
