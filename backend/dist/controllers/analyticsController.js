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
exports.getRevenueAnalytics = exports.getEventAnalytics = exports.getDashboardAnalytics = void 0;
const sequelize_1 = require("sequelize");
const Event_1 = __importDefault(require("../models/Event"));
const Ticket_1 = __importDefault(require("../models/Ticket"));
const User_1 = __importDefault(require("../models/User"));
const Attendee_1 = __importDefault(require("../models/Attendee"));
/**
 * Analytics Controller
 * Provides dashboard analytics and statistics
 */
// 🟢 Get overall analytics dashboard
const getDashboardAnalytics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        // Total events
        const totalEvents = yield Event_1.default.count();
        const upcomingEvents = yield Event_1.default.count({
            where: {
                date: { [sequelize_1.Op.gte]: new Date() },
                status: 'upcoming'
            }
        });
        const completedEvents = yield Event_1.default.count({
            where: { status: 'completed' }
        });
        // Total tickets
        const totalTickets = yield Ticket_1.default.count();
        const activeTickets = yield Ticket_1.default.count({
            where: { status: 'active' }
        });
        const usedTickets = yield Ticket_1.default.count({
            where: { status: 'used' }
        });
        // Revenue (sum of ticket prices where payment is completed)
        const revenueData = yield Ticket_1.default.findAll({
            attributes: [
                [(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('price')), 'totalRevenue']
            ],
            where: { paymentStatus: 'completed' },
            raw: true
        });
        const totalRevenue = ((_b = revenueData[0]) === null || _b === void 0 ? void 0 : _b.totalRevenue) || 0;
        // Total users
        const totalUsers = yield User_1.default.count();
        // Total attendees checked in
        const totalCheckedIn = yield Attendee_1.default.count({
            where: { checkedIn: true }
        });
        // Recent events
        const recentEvents = yield Event_1.default.findAll({
            order: [['createdAt', 'DESC']],
            limit: 5
        });
        // Popular events (most tickets sold)
        const popularEvents = yield Event_1.default.findAll({
            order: [['ticketsSold', 'DESC']],
            limit: 5
        });
        // User-specific stats if authenticated
        let userStats = null;
        if (userId) {
            const userTickets = yield Ticket_1.default.count({
                where: { userId }
            });
            const userEvents = yield Event_1.default.count({
                where: { organizerId: userId }
            });
            userStats = {
                ticketsPurchased: userTickets,
                eventsCreated: userEvents
            };
        }
        res.status(200).json({
            overview: {
                totalEvents,
                upcomingEvents,
                completedEvents,
                totalTickets,
                activeTickets,
                usedTickets,
                totalRevenue: parseFloat(totalRevenue).toFixed(2),
                totalUsers,
                totalCheckedIn
            },
            recentEvents,
            popularEvents,
            userStats
        });
    }
    catch (err) {
        res.status(500).json({
            message: "Error fetching analytics",
            error: err.message
        });
    }
});
exports.getDashboardAnalytics = getDashboardAnalytics;
// 🔵 Get event-specific analytics
const getEventAnalytics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { eventId } = req.params;
        const event = yield Event_1.default.findByPk(eventId);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }
        // Ticket sales by type
        const ticketsByType = yield Ticket_1.default.findAll({
            attributes: [
                'type',
                [(0, sequelize_1.fn)('COUNT', (0, sequelize_1.col)('id')), 'count'],
                [(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('price')), 'revenue']
            ],
            where: { eventId },
            group: ['type'],
            raw: true
        });
        // Tickets by payment status
        const ticketsByPaymentStatus = yield Ticket_1.default.findAll({
            attributes: [
                'paymentStatus',
                [(0, sequelize_1.fn)('COUNT', (0, sequelize_1.col)('id')), 'count']
            ],
            where: { eventId },
            group: ['paymentStatus'],
            raw: true
        });
        // Check-in stats
        const totalTickets = yield Ticket_1.default.count({ where: { eventId } });
        const checkedInCount = yield Attendee_1.default.count({
            where: { checkedIn: true },
            include: [{
                    model: Ticket_1.default,
                    where: { eventId },
                    attributes: []
                }]
        });
        // Sales over time (daily)
        const salesOverTime = yield Ticket_1.default.findAll({
            attributes: [
                [(0, sequelize_1.fn)('DATE', (0, sequelize_1.col)('createdAt')), 'date'],
                [(0, sequelize_1.fn)('COUNT', (0, sequelize_1.col)('id')), 'count'],
                [(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('price')), 'revenue']
            ],
            where: { eventId },
            group: [(0, sequelize_1.fn)('DATE', (0, sequelize_1.col)('createdAt'))],
            order: [[(0, sequelize_1.fn)('DATE', (0, sequelize_1.col)('createdAt')), 'ASC']],
            raw: true
        });
        // Capacity analysis
        const capacityUsed = (event.ticketsSold / event.capacity) * 100;
        res.status(200).json({
            event: {
                id: event.id,
                title: event.title,
                date: event.date,
                capacity: event.capacity,
                ticketsSold: event.ticketsSold,
                capacityUsed: capacityUsed.toFixed(2) + '%'
            },
            ticketsByType,
            ticketsByPaymentStatus,
            checkInStats: {
                total: totalTickets,
                checkedIn: checkedInCount,
                notCheckedIn: totalTickets - checkedInCount,
                percentage: totalTickets > 0 ? ((checkedInCount / totalTickets) * 100).toFixed(2) : 0
            },
            salesOverTime
        });
    }
    catch (err) {
        res.status(500).json({
            message: "Error fetching event analytics",
            error: err.message
        });
    }
});
exports.getEventAnalytics = getEventAnalytics;
// 🔹 Get revenue analytics
const getRevenueAnalytics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Total revenue by status
        const revenueByStatus = yield Ticket_1.default.findAll({
            attributes: [
                'paymentStatus',
                [(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('price')), 'revenue'],
                [(0, sequelize_1.fn)('COUNT', (0, sequelize_1.col)('id')), 'count']
            ],
            group: ['paymentStatus'],
            raw: true
        });
        // Revenue by event
        const revenueByEvent = yield Ticket_1.default.findAll({
            attributes: [
                'eventId',
                [(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('price')), 'revenue'],
                [(0, sequelize_1.fn)('COUNT', (0, sequelize_1.col)('id')), 'ticketsSold']
            ],
            where: { paymentStatus: 'completed' },
            group: ['eventId'],
            include: [{ model: Event_1.default, attributes: ['title', 'date'] }],
            order: [[(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('price')), 'DESC']],
            limit: 10
        });
        // Monthly revenue trend
        const monthlyRevenue = yield Ticket_1.default.findAll({
            attributes: [
                [(0, sequelize_1.fn)('DATE_FORMAT', (0, sequelize_1.col)('createdAt'), '%Y-%m'), 'month'],
                [(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('price')), 'revenue'],
                [(0, sequelize_1.fn)('COUNT', (0, sequelize_1.col)('id')), 'tickets']
            ],
            where: { paymentStatus: 'completed' },
            group: [(0, sequelize_1.fn)('DATE_FORMAT', (0, sequelize_1.col)('createdAt'), '%Y-%m')],
            order: [[(0, sequelize_1.fn)('DATE_FORMAT', (0, sequelize_1.col)('createdAt'), '%Y-%m'), 'DESC']],
            limit: 12,
            raw: true
        });
        res.status(200).json({
            revenueByStatus,
            revenueByEvent,
            monthlyRevenue
        });
    }
    catch (err) {
        res.status(500).json({
            message: "Error fetching revenue analytics",
            error: err.message
        });
    }
});
exports.getRevenueAnalytics = getRevenueAnalytics;
