import express from "express";
import { authenticateJWT } from "../middlewares/authMiddleware";
import {
  getDashboardAnalytics,
  getEventAnalytics,
  getRevenueAnalytics
} from "../controllers/analyticsController";

const router = express.Router();

// Get dashboard analytics (protected - optional auth for public stats)
router.get("/dashboard", getDashboardAnalytics);

// Get event-specific analytics (protected)
router.get("/event/:eventId", authenticateJWT, getEventAnalytics);

// Get revenue analytics (protected)
router.get("/revenue", authenticateJWT, getRevenueAnalytics);

export default router;
