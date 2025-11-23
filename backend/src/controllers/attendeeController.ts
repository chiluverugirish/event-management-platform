import { Request, Response } from "express";
import Attendee from "../models/Attendee";
import Ticket from "../models/Ticket";
import Event from "../models/Event";
import User from "../models/User";

/**
 * Attendee Controller
 * Manages attendee operations and check-in system
 */

// 🟢 Get all attendees for an event (Protected - organizers only)
export const getEventAttendees = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;

    const attendees = await Attendee.findAll({
      include: [
        {
          model: Ticket,
          where: { eventId },
          include: [
            { model: Event },
            { model: User, attributes: ['id', 'name', 'email'] }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json(attendees);
  } catch (err: any) {
    res.status(500).json({ 
      message: "Error fetching attendees", 
      error: err.message 
    });
  }
};

// 🔵 Check-in attendee using ticket ID or QR code
export const checkInAttendee = async (req: Request, res: Response) => {
  try {
    const { ticketId, qrCode } = req.body;

    if (!ticketId && !qrCode) {
      return res.status(400).json({ 
        message: "Ticket ID or QR code is required" 
      });
    }

    // Find ticket
    let ticket;
    if (qrCode) {
      ticket = await Ticket.findOne({ where: { qrCode } });
    } else {
      ticket = await Ticket.findByPk(ticketId);
    }

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Check if ticket is active
    if (ticket.status !== 'active') {
      return res.status(400).json({ 
        message: `Ticket is ${ticket.status}. Cannot check in.` 
      });
    }

    // Find or create attendee
    let attendee = await Attendee.findOne({ 
      where: { ticketId: ticket.id } 
    });

    if (!attendee) {
      // Get user info
      const user = await User.findByPk(ticket.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Create attendee record
      attendee = await Attendee.create({
        ticketId: ticket.id,
        name: user.name,
        email: user.email,
        checkedIn: true,
        checkInTime: new Date()
      });
    } else {
      // Update check-in status
      if (attendee.checkedIn) {
        return res.status(400).json({ 
          message: "Attendee already checked in",
          checkInTime: attendee.checkInTime
        });
      }

      attendee.checkedIn = true;
      attendee.checkInTime = new Date();
      await attendee.save();
    }

    // Update ticket status
    ticket.status = 'used';
    await ticket.save();

    // Get complete data
    const attendeeData = await Attendee.findByPk(attendee.id, {
      include: [
        {
          model: Ticket,
          include: [
            { model: Event },
            { model: User, attributes: ['id', 'name', 'email'] }
          ]
        }
      ]
    });

    res.status(200).json({ 
      message: "Check-in successful", 
      attendee: attendeeData 
    });
  } catch (err: any) {
    res.status(500).json({ 
      message: "Error checking in attendee", 
      error: err.message 
    });
  }
};

// 🔹 Undo check-in (in case of mistake)
export const undoCheckIn = async (req: Request, res: Response) => {
  try {
    const { attendeeId } = req.params;

    const attendee = await Attendee.findByPk(attendeeId);
    if (!attendee) {
      return res.status(404).json({ message: "Attendee not found" });
    }

    if (!attendee.checkedIn) {
      return res.status(400).json({ 
        message: "Attendee is not checked in" 
      });
    }

    // Update attendee
    attendee.checkedIn = false;
    attendee.checkInTime = null as any;
    await attendee.save();

    // Update ticket status back to active
    const ticket = await Ticket.findByPk(attendee.ticketId);
    if (ticket) {
      ticket.status = 'active';
      await ticket.save();
    }

    res.status(200).json({ 
      message: "Check-in undone successfully", 
      attendee 
    });
  } catch (err: any) {
    res.status(500).json({ 
      message: "Error undoing check-in", 
      error: err.message 
    });
  }
};

// 🔹 Get check-in statistics for an event
export const getCheckInStats = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;

    const totalTickets = await Ticket.count({
      where: { eventId, status: ['active', 'used'] }
    });

    const checkedInCount = await Attendee.count({
      where: { checkedIn: true },
      include: [{
        model: Ticket,
        where: { eventId },
        attributes: []
      }]
    });

    const notCheckedInCount = totalTickets - checkedInCount;

    // Get recent check-ins
    const recentCheckIns = await Attendee.findAll({
      where: { checkedIn: true },
      include: [{
        model: Ticket,
        where: { eventId },
        include: [{ model: User, attributes: ['name', 'email'] }]
      }],
      order: [['checkInTime', 'DESC']],
      limit: 10
    });

    res.status(200).json({
      totalTickets,
      checkedIn: checkedInCount,
      notCheckedIn: notCheckedInCount,
      checkInPercentage: totalTickets > 0 ? 
        ((checkedInCount / totalTickets) * 100).toFixed(2) : 0,
      recentCheckIns
    });
  } catch (err: any) {
    res.status(500).json({ 
      message: "Error fetching check-in stats", 
      error: err.message 
    });
  }
};
