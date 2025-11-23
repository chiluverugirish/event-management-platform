"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const analyticsController_1 = require("../controllers/analyticsController");
const router = express_1.default.Router();
// Get dashboard analytics (protected - optional auth for public stats)
router.get("/dashboard", analyticsController_1.getDashboardAnalytics);
// Get event-specific analytics (protected)
router.get("/event/:eventId", authMiddleware_1.authenticateJWT, analyticsController_1.getEventAnalytics);
// Get revenue analytics (protected)
router.get("/revenue", authMiddleware_1.authenticateJWT, analyticsController_1.getRevenueAnalytics);
exports.default = router;
