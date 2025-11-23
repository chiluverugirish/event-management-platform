// src/controllers/ticketController.ts
import QRCode from "qrcode";
import fs from "fs";
import path from "path";
import Ticket from "../models/Ticket";
import Event from "../models/Event";
import User from "../models/User";
import Attendee from "../models/Attendee";
import { transporter } from "../config/mailer";
import { processPayment } from "../config/payment";

// 🟢 Book Ticket (Protected) - Enhanced with payment processing
export const bookTicket = async (req: any, res: any) => {
  try {
    const { eventId, type, paymentMethod } = req.body;
    const userId = req.user.id;

    // Check if event exists
    const event = await Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check capacity
    if (event.ticketsSold >= event.capacity) {
      return res.status(400).json({ message: "Event is sold out" });
    }

    // Get ticket price from event ticketTypes
    let ticketTypes: any = {};
    
    // Parse ticketTypes if it's a string (from database)
    if (typeof event.ticketTypes === 'string') {
      try {
        ticketTypes = JSON.parse(event.ticketTypes);
      } catch (e) {
        ticketTypes = { General: { price: 0, available: 100 } };
      }
    } else if (typeof event.ticketTypes === 'object' && event.ticketTypes !== null) {
      ticketTypes = event.ticketTypes;
    } else {
      ticketTypes = { General: { price: 0, available: 100 } };
    }
    
    // Get the specific ticket type
    const ticketType = ticketTypes[type];
    
    if (!ticketType) {
      return res.status(400).json({ 
        message: `Ticket type "${type}" not found for this event`,
        availableTypes: Object.keys(ticketTypes)
      });
    }
    
    const price = ticketType.price || 0;

    // Get user info
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Process payment
    const paymentResult = await processPayment(
      price,
      type,
      user.email,
      { eventId, userId, eventTitle: event.title }
    );

    if (!paymentResult.success) {
      return res.status(400).json({ 
        message: "Payment failed", 
        error: paymentResult.message 
      });
    }

    // Generate QR code with unique identifier
    const qrData = JSON.stringify({
      ticketId: `TKT-${Date.now()}-${userId}`,
      eventId,
      userId,
      type,
      issuedAt: new Date().toISOString()
    });
    const qrCode = await QRCode.toDataURL(qrData);

    // Create ticket in DB
    const ticket = await Ticket.create({ 
      eventId, 
      userId, 
      type, 
      price,
      qrCode,
      paymentStatus: paymentResult.status,
      paymentId: paymentResult.paymentId,
      status: 'active'
    });

    // Update event tickets sold
    event.ticketsSold = event.ticketsSold + 1;
    await event.save();

    // Create attendee record
    await Attendee.create({
      ticketId: ticket.id,
      name: user.name,
      email: user.email,
      checkedIn: false
    });

    // 🔹 Save QR code as PNG locally
    const base64Data = qrCode.replace(/^data:image\/png;base64,/, "");
    const filename = `ticket-${ticket.id}.png`;
    const folderPath = path.join(__dirname, "../../tickets");
    fs.mkdirSync(folderPath, { recursive: true });
    fs.writeFileSync(path.join(folderPath, filename), base64Data, "base64");
    console.log(`✅ QR code saved as tickets/${filename}`);

    // 🔹 Send confirmation email with QR code
    if (user.email) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: `🎟️ Your Ticket for ${event.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0284c7;">Ticket Confirmed! 🎉</h2>
            <p>Hi ${user.name},</p>
            <p>Your ticket has been successfully booked!</p>
            
            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Event Details</h3>
              <p><strong>Event:</strong> ${event.title}</p>
              <p><strong>Type:</strong> ${type}</p>
              <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
              <p><strong>Location:</strong> ${event.location}</p>
              <p><strong>Price:</strong> $${price}</p>
              <p><strong>Payment ID:</strong> ${paymentResult.paymentId}</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <h3>Your QR Code</h3>
              <img src="${qrCode}" alt="Ticket QR Code" style="max-width: 200px; border: 4px solid #0284c7; border-radius: 8px;" />
              <p style="font-size: 12px; color: #666;">Present this QR code at the event entrance</p>
            </div>

            <p style="color: #666; font-size: 14px;">
              <strong>Important:</strong> Save this email or take a screenshot of the QR code. 
              You'll need it for check-in at the event.
            </p>

            <p>See you at the event!</p>
            <p style="color: #999; font-size: 12px;">EventHub Team</p>
          </div>
        `,
      });
      console.log(`✅ Ticket email sent to ${user.email}`);
    }

    res.status(201).json({ 
      message: "Ticket booked successfully", 
      ticket,
      payment: {
        transactionId: paymentResult.transactionId,
        amount: price,
        status: paymentResult.status
      }
    });
  } catch (err: any) {
    console.error("Error booking ticket:", err);
    res.status(500).json({ 
      message: "Error booking ticket", 
      error: err.message 
    });
  }
};

// 🔵 Get all tickets for logged-in user (Protected)
export const getMyTickets = async (req: any, res: any) => {
  try {
    const tickets = await Ticket.findAll({
      where: { userId: req.user.id },
      include: [
        { model: Event },
        { model: User, attributes: ['id', 'name', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(tickets);
  } catch (err: any) {
    res.status(500).json({ 
      message: "Error fetching tickets", 
      error: err.message 
    });
  }
};

// 🔹 Cancel ticket (Protected)
export const cancelTicket = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const ticket = await Ticket.findOne({
      where: { id, userId }
    });

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    if (ticket.status === 'cancelled') {
      return res.status(400).json({ message: "Ticket is already cancelled" });
    }

    if (ticket.status === 'used') {
      return res.status(400).json({ 
        message: "Cannot cancel a used ticket" 
      });
    }

    // Update ticket status
    ticket.status = 'cancelled';
    ticket.paymentStatus = 'refunded';
    await ticket.save();

    // Update event tickets sold
    const event = await Event.findByPk(ticket.eventId);
    if (event && event.ticketsSold > 0) {
      event.ticketsSold = event.ticketsSold - 1;
      await event.save();
    }

    res.status(200).json({ 
      message: "Ticket cancelled successfully", 
      ticket 
    });
  } catch (err: any) {
    res.status(500).json({ 
      message: "Error cancelling ticket", 
      error: err.message 
    });
  }
};
