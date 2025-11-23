import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Default role is 'attendee' if not specified
    const userRole = role || 'attendee';
    
    // Validate role
    if (!['admin', 'organizer', 'attendee'].includes(userRole)) {
      return res.status(400).json({ message: "Invalid role. Must be admin, organizer, or attendee" });
    }

    const user = await User.create({ 
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
  } catch (error: any) {
    res.status(500).json({ message: "Error registering user", error: error.message });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) return res.status(404).json({ message: "User not found" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, role: user.role }, 
      process.env.JWT_SECRET as string, 
      { expiresIn: "1d" }
    );

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
  } catch (error: any) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};
