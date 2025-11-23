import express from "express";
import { bookTicket, getMyTickets, cancelTicket } from "../controllers/ticketController";
import { authenticateJWT } from "../middlewares/authMiddleware";

const router = express.Router();

// Book a ticket (POST)
router.post("/", authenticateJWT, bookTicket);

// Get tickets for logged-in user (GET)
router.get("/my-tickets", authenticateJWT, getMyTickets);

// Cancel ticket (PUT)
router.put("/cancel/:id", authenticateJWT, cancelTicket);

export default router;
