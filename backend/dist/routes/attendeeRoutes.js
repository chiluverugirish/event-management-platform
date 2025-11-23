"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const attendeeController_1 = require("../controllers/attendeeController");
const router = express_1.default.Router();
// Get all attendees for an event (protected)
router.get("/event/:eventId", authMiddleware_1.authenticateJWT, attendeeController_1.getEventAttendees);
// Check-in attendee (protected)
router.post("/checkin", authMiddleware_1.authenticateJWT, attendeeController_1.checkInAttendee);
// Undo check-in (protected)
router.post("/undo-checkin/:attendeeId", authMiddleware_1.authenticateJWT, attendeeController_1.undoCheckIn);
// Get check-in statistics for an event (protected)
router.get("/stats/:eventId", authMiddleware_1.authenticateJWT, attendeeController_1.getCheckInStats);
exports.default = router;
