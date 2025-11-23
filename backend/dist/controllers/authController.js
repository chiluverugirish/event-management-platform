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
exports.loginUser = exports.registerUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password, role } = req.body;
        const existingUser = yield User_1.default.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        // Default role is 'attendee' if not specified
        const userRole = role || 'attendee';
        // Validate role
        if (!['admin', 'organizer', 'attendee'].includes(userRole)) {
            return res.status(400).json({ message: "Invalid role. Must be admin, organizer, or attendee" });
        }
        const user = yield User_1.default.create({
            name,
            email,
            password: hashedPassword,
            role: userRole
        });
        // Don't send password in response
        const userResponse = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt
        };
        res.status(201).json({ message: "User registered successfully", user: userResponse });
    }
    catch (error) {
        res.status(500).json({ message: "Error registering user", error: error.message });
    }
});
exports.registerUser = registerUser;
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield User_1.default.findOne({ where: { email } });
        if (!user)
            return res.status(404).json({ message: "User not found" });
        const isPasswordValid = yield bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid)
            return res.status(401).json({ message: "Invalid credentials" });
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
        const userResponse = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        };
        res.status(200).json({
            message: "Login successful",
            token,
            user: userResponse
        });
    }
    catch (error) {
        res.status(500).json({ message: "Error logging in", error: error.message });
    }
});
exports.loginUser = loginUser;
