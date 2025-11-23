"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/eventRoutes.ts
const express_1 = __importDefault(require("express"));
const eventController_1 = require("../controllers/eventController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
// Public: get all events
router.get("/", eventController_1.getEvents);
// Public: get single event
router.get("/:id", eventController_1.getEvent);
// Protected: create, update, delete events
router.post("/", authMiddleware_1.authenticateJWT, eventController_1.createEvent);
router.put("/:id", authMiddleware_1.authenticateJWT, eventController_1.updateEvent);
router.delete("/:id", authMiddleware_1.authenticateJWT, eventController_1.deleteEvent);
exports.default = router;
