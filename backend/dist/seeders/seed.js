"use strict";
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
exports.seedDatabase = void 0;
// Database Seeder - Sample Data
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = __importDefault(require("../config/db"));
const User_1 = __importDefault(require("../models/User"));
const Event_1 = __importDefault(require("../models/Event"));
const Ticket_1 = __importDefault(require("../models/Ticket"));
const Attendee_1 = __importDefault(require("../models/Attendee"));
const seedDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("🌱 Starting database seeding...");
        // Sync database models (alter: true will update existing tables)
        console.log("📊 Syncing database models...");
        yield db_1.default.sync({ alter: true });
        console.log("✅ Database models synced");
        // Clear existing data
        yield Attendee_1.default.destroy({ where: {} });
        yield Ticket_1.default.destroy({ where: {} });
        yield Event_1.default.destroy({ where: {} });
        yield User_1.default.destroy({ where: {} });
        // Hash password
        const hashedPassword = yield bcryptjs_1.default.hash("password123", 10);
        // Create Users with different roles
        const users = yield User_1.default.bulkCreate([
            {
                name: "Admin User",
                email: "admin@eventmanagement.com",
                password: hashedPassword,
                role: "admin",
            },
            {
                name: "John Organizer",
                email: "john.organizer@example.com",
                password: hashedPassword,
                role: "organizer",
            },
            {
                name: "Sarah Events",
                email: "sarah.events@example.com",
                password: hashedPassword,
                role: "organizer",
            },
            {
                name: "Mike Attendee",
                email: "mike@example.com",
                password: hashedPassword,
                role: "attendee",
            },
            {
                name: "Emma Watson",
                email: "emma@example.com",
                password: hashedPassword,
                role: "attendee",
            },
            {
                name: "David Brown",
                email: "david@example.com",
                password: hashedPassword,
                role: "attendee",
            },
        ]);
        console.log(`✅ Created ${users.length} users`);
        // Create Events
        const events = yield Event_1.default.bulkCreate([
            {
                title: "Tech Conference 2025",
                description: "Annual technology conference featuring the latest innovations in AI, cloud computing, and software development. Join industry leaders and network with professionals.",
                date: new Date("2025-12-15T09:00:00Z"),
                endDate: new Date("2025-12-15T18:00:00Z"),
                location: "San Francisco Convention Center, CA",
                capacity: 500,
                ticketsSold: 0,
                status: "upcoming",
                organizerId: users[1].id, // John Organizer
                ticketTypes: {
                    General: { price: 50, available: 300 },
                    VIP: { price: 150, available: 150 },
                    "Early Bird": { price: 35, available: 50 },
                },
            },
            {
                title: "Music Festival 2025",
                description: "Three-day music festival featuring top artists from around the world. Multiple stages, food vendors, and camping options available.",
                date: new Date("2025-11-30T10:00:00Z"),
                endDate: new Date("2025-12-02T23:00:00Z"),
                location: "Central Park, New York, NY",
                capacity: 1000,
                ticketsSold: 0,
                status: "upcoming",
                organizerId: users[2].id, // Sarah Events
                ticketTypes: {
                    "Single Day": { price: 80, available: 400 },
                    "3-Day Pass": { price: 200, available: 400 },
                    VIP: { price: 350, available: 200 },
                },
            },
            {
                title: "Web Development Workshop",
                description: "Hands-on workshop covering modern web development with React, Node.js, and TypeScript. Perfect for beginners and intermediate developers.",
                date: new Date("2025-12-01T14:00:00Z"),
                endDate: new Date("2025-12-01T17:00:00Z"),
                location: "Online (Zoom)",
                capacity: 100,
                ticketsSold: 0,
                status: "upcoming",
                organizerId: users[1].id,
                ticketTypes: {
                    Standard: { price: 25, available: 80 },
                    Premium: { price: 45, available: 20 },
                },
            },
            {
                title: "Startup Networking Event",
                description: "Connect with entrepreneurs, investors, and innovators. Pitch your ideas, find co-founders, and explore investment opportunities.",
                date: new Date("2025-12-20T18:00:00Z"),
                endDate: new Date("2025-12-20T21:00:00Z"),
                location: "Silicon Valley Innovation Hub, CA",
                capacity: 200,
                ticketsSold: 0,
                status: "upcoming",
                organizerId: users[2].id,
                ticketTypes: {
                    General: { price: 0, available: 150 },
                    Entrepreneur: { price: 30, available: 50 },
                },
            },
            {
                title: "Digital Marketing Summit",
                description: "Learn the latest strategies in SEO, social media marketing, content creation, and analytics. Featuring expert speakers and case studies.",
                date: new Date("2026-01-10T09:00:00Z"),
                endDate: new Date("2026-01-10T17:00:00Z"),
                location: "Chicago Business Center, IL",
                capacity: 300,
                ticketsSold: 0,
                status: "upcoming",
                organizerId: users[1].id,
                ticketTypes: {
                    Standard: { price: 75, available: 200 },
                    Premium: { price: 125, available: 80 },
                    "Group of 5": { price: 300, available: 20 },
                },
            },
            {
                title: "AI & Machine Learning Conference",
                description: "Explore cutting-edge developments in artificial intelligence, machine learning, and deep learning. Workshops, demos, and networking included.",
                date: new Date("2026-01-25T09:00:00Z"),
                endDate: new Date("2026-01-25T18:00:00Z"),
                location: "Boston Tech Hub, MA",
                capacity: 400,
                ticketsSold: 0,
                status: "upcoming",
                organizerId: users[2].id,
                ticketTypes: {
                    General: { price: 100, available: 250 },
                    VIP: { price: 200, available: 100 },
                    Student: { price: 50, available: 50 },
                },
            },
            {
                title: "Food & Wine Festival",
                description: "Celebrate culinary excellence with tastings from top chefs, wine pairings, cooking demonstrations, and live entertainment.",
                date: new Date("2025-12-08T12:00:00Z"),
                endDate: new Date("2025-12-08T20:00:00Z"),
                location: "Napa Valley Expo, CA",
                capacity: 600,
                ticketsSold: 0,
                status: "upcoming",
                organizerId: users[1].id,
                ticketTypes: {
                    General: { price: 65, available: 400 },
                    VIP: { price: 120, available: 150 },
                    "Chef's Table": { price: 250, available: 50 },
                },
            },
            {
                title: "Fitness & Wellness Expo",
                description: "Discover the latest in fitness trends, nutrition, wellness products, and healthy living. Free workout sessions and expert talks included.",
                date: new Date("2025-12-12T10:00:00Z"),
                endDate: new Date("2025-12-12T18:00:00Z"),
                location: "Miami Convention Center, FL",
                capacity: 800,
                ticketsSold: 0,
                status: "upcoming",
                organizerId: users[2].id,
                ticketTypes: {
                    General: { price: 20, available: 600 },
                    VIP: { price: 50, available: 200 },
                },
            },
        ]);
        console.log(`✅ Created ${events.length} events`);
        // Create some sample tickets for demonstration
        const tickets = yield Ticket_1.default.bulkCreate([
            {
                userId: users[3].id, // Mike Attendee
                eventId: events[0].id,
                type: "General",
                price: 50,
                qrCode: "sample-qr-code-1.png",
                bookingDate: new Date(),
                paymentStatus: "completed",
                paymentId: "pi_sample_123456",
                status: "active",
            },
            {
                userId: users[4].id, // Emma Watson
                eventId: events[0].id,
                type: "VIP",
                price: 150,
                qrCode: "sample-qr-code-2.png",
                bookingDate: new Date(),
                paymentStatus: "completed",
                paymentId: "pi_sample_123457",
                status: "active",
            },
            {
                userId: users[5].id, // David Brown
                eventId: events[1].id,
                type: "Single Day",
                price: 80,
                qrCode: "sample-qr-code-3.png",
                bookingDate: new Date(),
                paymentStatus: "completed",
                paymentId: "pi_sample_123458",
                status: "active",
            },
        ]);
        console.log(`✅ Created ${tickets.length} sample tickets`);
        // Update tickets sold count
        yield Event_1.default.update({ ticketsSold: 2 }, { where: { id: events[0].id } });
        yield Event_1.default.update({ ticketsSold: 1 }, { where: { id: events[1].id } });
        // Create attendees from tickets
        const attendees = yield Attendee_1.default.bulkCreate([
            {
                ticketId: tickets[0].id,
                name: users[3].name,
                email: users[3].email,
                phone: "+1234567890",
                checkedIn: false,
            },
            {
                ticketId: tickets[1].id,
                name: users[4].name,
                email: users[4].email,
                phone: "+1234567891",
                checkedIn: false,
            },
            {
                ticketId: tickets[2].id,
                name: users[5].name,
                email: users[5].email,
                phone: "+1234567892",
                checkedIn: false,
            },
        ]);
        console.log(`✅ Created ${attendees.length} attendees`);
        console.log("\n🎉 Database seeding completed successfully!");
        console.log("\n📋 Test Credentials:");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("🔑 Admin Account:");
        console.log("   Email: admin@eventmanagement.com");
        console.log("   Password: password123");
        console.log("   Role: admin");
        console.log("\n🔑 Organizer Account 1:");
        console.log("   Email: john.organizer@example.com");
        console.log("   Password: password123");
        console.log("   Role: organizer");
        console.log("\n🔑 Organizer Account 2:");
        console.log("   Email: sarah.events@example.com");
        console.log("   Password: password123");
        console.log("   Role: organizer");
        console.log("\n🔑 Attendee Account:");
        console.log("   Email: mike@example.com");
        console.log("   Password: password123");
        console.log("   Role: attendee");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    }
    catch (error) {
        console.error("❌ Error seeding database:", error);
        throw error;
    }
});
exports.seedDatabase = seedDatabase;
// Run seeder if this file is executed directly
if (require.main === module) {
    (0, exports.seedDatabase)()
        .then(() => {
        console.log("✅ Seeding completed. Exiting...");
        process.exit(0);
    })
        .catch((error) => {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    });
}
