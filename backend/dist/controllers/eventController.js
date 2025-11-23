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
exports.deleteEvent = exports.updateEvent = exports.getEvent = exports.getEvents = exports.createEvent = void 0;
const Event_1 = __importDefault(require("../models/Event"));
// 🟢 Create Event
const createEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { title, description, date, endDate, location, capacity, ticketTypes } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!title || !description || !date || !location || capacity === undefined) {
            return res.status(400).json({ message: "All required fields must be provided" });
        }
        const event = yield Event_1.default.create({
            title,
            description,
            date,
            endDate: endDate || null,
            location,
            capacity,
            organizerId: userId || null,
            ticketTypes: ticketTypes || {
                General: { price: 0, available: capacity }
            },
            status: 'upcoming',
            ticketsSold: 0
        });
        res.status(201).json({
            message: "Event created successfully",
            event
        });
    }
    catch (err) {
        console.error("Error creating event:", err);
        res.status(500).json({
            message: "Error creating event",
            error: err.message
        });
    }
});
exports.createEvent = createEvent;
// 🔵 Get all events
const getEvents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const events = yield Event_1.default.findAll();
        res.status(200).json(events);
    }
    catch (err) {
        res.status(500).json({ message: "Error fetching events", error: err.message });
    }
});
exports.getEvents = getEvents;
// 🔹 Get single event by ID
const getEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const event = yield Event_1.default.findByPk(req.params.id);
        if (!event)
            return res.status(404).json({ message: "Event not found" });
        res.status(200).json(event);
    }
    catch (err) {
        res.status(500).json({ message: "Error fetching event", error: err.message });
    }
});
exports.getEvent = getEvent;
// 🔹 Update event by ID
const updateEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const event = yield Event_1.default.findByPk(req.params.id);
        if (!event)
            return res.status(404).json({ message: "Event not found" });
        yield event.update(req.body);
        res.status(200).json({ message: "Event updated", event });
    }
    catch (err) {
        res.status(500).json({ message: "Error updating event", error: err.message });
    }
});
exports.updateEvent = updateEvent;
// 🔹 Delete event by ID
const deleteEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const event = yield Event_1.default.findByPk(req.params.id);
        if (!event)
            return res.status(404).json({ message: "Event not found" });
        yield event.destroy();
        res.status(200).json({ message: "Event deleted" });
    }
    catch (err) {
        res.status(500).json({ message: "Error deleting event", error: err.message });
    }
});
exports.deleteEvent = deleteEvent;
