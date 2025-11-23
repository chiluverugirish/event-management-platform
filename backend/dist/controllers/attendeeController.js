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
exports.getCheckInStats = exports.undoCheckIn = exports.checkInAttendee = exports.getEventAttendees = void 0;
const Attendee_1 = __importDefault(require("../models/Attendee"));
const Ticket_1 = __importDefault(require("../models/Ticket"));
const Event_1 = __importDefault(require("../models/Event"));
const User_1 = __importDefault(require("../models/User"));
/**
 * Attendee Controller
 * Manages attendee operations and check-in system
 */
// 🟢 Get all attendees for an event (Protected - organizers only)
const getEventAttendees = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { eventId } = req.params;
        const attendees = yield Attendee_1.default.findAll({
            include: [
                {
                    model: Ticket_1.default,
                    where: { eventId },
                    include: [
                        { model: Event_1.default },
                        { model: User_1.default, attributes: ['id', 'name', 'email'] }
                    ]
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(attendees);
    }
    catch (err) {
        res.status(500).json({
            message: "Error fetching attendees",
            error: err.message
        });
    }
});
exports.getEventAttendees = getEventAttendees;
// 🔵 Check-in attendee using ticket ID or QR code
const checkInAttendee = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { ticketId, qrCode } = req.body;
        if (!ticketId && !qrCode) {
            return res.status(400).json({
                message: "Ticket ID or QR code is required"
            });
        }
        // Find ticket
        let ticket;
        if (qrCode) {
            ticket = yield Ticket_1.default.findOne({ where: { qrCode } });
        }
        else {
            ticket = yield Ticket_1.default.findByPk(ticketId);
        }
        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found" });
        }
        // Check if ticket is active
        if (ticket.status !== 'active') {
            return res.status(400).json({
                message: `Ticket is ${ticket.status}. Cannot check in.`
            });
        }
        // Find or create attendee
        let attendee = yield Attendee_1.default.findOne({
            where: { ticketId: ticket.id }
        });
        if (!attendee) {
            // Get user info
            const user = yield User_1.default.findByPk(ticket.userId);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            // Create attendee record
            attendee = yield Attendee_1.default.create({
                ticketId: ticket.id,
                name: user.name,
                email: user.email,
                checkedIn: true,
                checkInTime: new Date()
            });
        }
        else {
            // Update check-in status
            if (attendee.checkedIn) {
                return res.status(400).json({
                    message: "Attendee already checked in",
                    checkInTime: attendee.checkInTime
                });
            }
            attendee.checkedIn = true;
            attendee.checkInTime = new Date();
            yield attendee.save();
        }
        // Update ticket status
        ticket.status = 'used';
        yield ticket.save();
        // Get complete data
        const attendeeData = yield Attendee_1.default.findByPk(attendee.id, {
            include: [
                {
                    model: Ticket_1.default,
                    include: [
                        { model: Event_1.default },
                        { model: User_1.default, attributes: ['id', 'name', 'email'] }
                    ]
                }
            ]
        });
        res.status(200).json({
            message: "Check-in successful",
            attendee: attendeeData
        });
    }
    catch (err) {
        res.status(500).json({
            message: "Error checking in attendee",
            error: err.message
        });
    }
});
exports.checkInAttendee = checkInAttendee;
// 🔹 Undo check-in (in case of mistake)
const undoCheckIn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { attendeeId } = req.params;
        const attendee = yield Attendee_1.default.findByPk(attendeeId);
        if (!attendee) {
            return res.status(404).json({ message: "Attendee not found" });
        }
        if (!attendee.checkedIn) {
            return res.status(400).json({
                message: "Attendee is not checked in"
            });
        }
        // Update attendee
        attendee.checkedIn = false;
        attendee.checkInTime = null;
        yield attendee.save();
        // Update ticket status back to active
        const ticket = yield Ticket_1.default.findByPk(attendee.ticketId);
        if (ticket) {
            ticket.status = 'active';
            yield ticket.save();
        }
        res.status(200).json({
            message: "Check-in undone successfully",
            attendee
        });
    }
    catch (err) {
        res.status(500).json({
            message: "Error undoing check-in",
            error: err.message
        });
    }
});
exports.undoCheckIn = undoCheckIn;
// 🔹 Get check-in statistics for an event
const getCheckInStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { eventId } = req.params;
        const totalTickets = yield Ticket_1.default.count({
            where: { eventId, status: ['active', 'used'] }
        });
        const checkedInCount = yield Attendee_1.default.count({
            where: { checkedIn: true },
            include: [{
                    model: Ticket_1.default,
                    where: { eventId },
                    attributes: []
                }]
        });
        const notCheckedInCount = totalTickets - checkedInCount;
        // Get recent check-ins
        const recentCheckIns = yield Attendee_1.default.findAll({
            where: { checkedIn: true },
            include: [{
                    model: Ticket_1.default,
                    where: { eventId },
                    include: [{ model: User_1.default, attributes: ['name', 'email'] }]
                }],
            order: [['checkInTime', 'DESC']],
            limit: 10
        });
        res.status(200).json({
            totalTickets,
            checkedIn: checkedInCount,
            notCheckedIn: notCheckedInCount,
            checkInPercentage: totalTickets > 0 ?
                ((checkedInCount / totalTickets) * 100).toFixed(2) : 0,
            recentCheckIns
        });
    }
    catch (err) {
        res.status(500).json({
            message: "Error fetching check-in stats",
            error: err.message
        });
    }
});
exports.getCheckInStats = getCheckInStats;
