import express from "express";
import { authenticateJWT } from "../middlewares/authMiddleware";
import {
  getEventAttendees,
  checkInAttendee,
  undoCheckIn,
  getCheckInStats
} from "../controllers/attendeeController";

const router = express.Router();

// Get all attendees for an event (protected)
router.get("/event/:eventId", authenticateJWT, getEventAttendees);

// Check-in attendee (protected)
router.post("/checkin", authenticateJWT, checkInAttendee);

// Undo check-in (protected)
router.post("/undo-checkin/:attendeeId", authenticateJWT, undoCheckIn);

// Get check-in statistics for an event (protected)
router.get("/stats/:eventId", authenticateJWT, getCheckInStats);

export default router;
