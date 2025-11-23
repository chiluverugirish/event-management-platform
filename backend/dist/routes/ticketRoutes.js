"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ticketController_1 = require("../controllers/ticketController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
// Book a ticket (POST)
router.post("/", authMiddleware_1.authenticateJWT, ticketController_1.bookTicket);
// Get tickets for logged-in user (GET)
router.get("/my-tickets", authMiddleware_1.authenticateJWT, ticketController_1.getMyTickets);
// Cancel ticket (PUT)
router.put("/cancel/:id", authMiddleware_1.authenticateJWT, ticketController_1.cancelTicket);
exports.default = router;
