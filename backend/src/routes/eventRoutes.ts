// src/routes/eventRoutes.ts
import express from "express";
import {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent,
} from "../controllers/eventController";
import { authenticateJWT } from "../middlewares/authMiddleware";

const router = express.Router();

// Public: get all events
router.get("/", getEvents);

// Public: get single event
router.get("/:id", getEvent);

// Protected: create, update, delete events
router.post("/", authenticateJWT, createEvent);
router.put("/:id", authenticateJWT, updateEvent);
router.delete("/:id", authenticateJWT, deleteEvent);

export default router;
