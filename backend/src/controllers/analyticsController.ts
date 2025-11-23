import { Request, Response } from "express";
import { Op, fn, col } from "sequelize";
import Event from "../models/Event";
import Ticket from "../models/Ticket";
import User from "../models/User";
import Attendee from "../models/Attendee";

/**
 * Analytics Controller
 * Provides dashboard analytics and statistics
 */

// 🟢 Get overall analytics dashboard
export const getDashboardAnalytics = async (req: any, res: Response) => {
  try {
    const userId = req.user?.id;

    // Total events
    const totalEvents = await Event.count();
    const upcomingEvents = await Event.count({
      where: {
        date: { [Op.gte]: new Date() },
        status: 'upcoming'
      }
    });
    const completedEvents = await Event.count({
      where: { status: 'completed' }
    });

    // Total tickets
    const totalTickets = await Ticket.count();
    const activeTickets = await Ticket.count({
      where: { status: 'active' }
    });
    const usedTickets = await Ticket.count({
      where: { status: 'used' }
    });

    // Revenue (sum of ticket prices where payment is completed)
    const revenueData = await Ticket.findAll({
      attributes: [
        [fn('SUM', col('price')), 'totalRevenue']
      ],
      where: { paymentStatus: 'completed' },
      raw: true
    });
    const totalRevenue = (revenueData[0] as any)?.totalRevenue || 0;

    // Total users
    const totalUsers = await User.count();

    // Total attendees checked in
    const totalCheckedIn = await Attendee.count({
      where: { checkedIn: true }
    });

    // Recent events
    const recentEvents = await Event.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    // Popular events (most tickets sold)
    const popularEvents = await Event.findAll({
      order: [['ticketsSold', 'DESC']],
      limit: 5
    });

    // User-specific stats if authenticated
    let userStats = null;
    if (userId) {
      const userTickets = await Ticket.count({
        where: { userId }
      });
      const userEvents = await Event.count({
        where: { organizerId: userId }
      });

      userStats = {
        ticketsPurchased: userTickets,
        eventsCreated: userEvents
      };
    }

    res.status(200).json({
      overview: {
        totalEvents,
        upcomingEvents,
        completedEvents,
        totalTickets,
        activeTickets,
        usedTickets,
        totalRevenue: parseFloat(totalRevenue).toFixed(2),
        totalUsers,
        totalCheckedIn
      },
      recentEvents,
      popularEvents,
      userStats
    });
  } catch (err: any) {
    res.status(500).json({ 
      message: "Error fetching analytics", 
      error: err.message 
    });
  }
};

// 🔵 Get event-specific analytics
export const getEventAnalytics = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Ticket sales by type
    const ticketsByType = await Ticket.findAll({
      attributes: [
        'type',
        [fn('COUNT', col('id')), 'count'],
        [fn('SUM', col('price')), 'revenue']
      ],
      where: { eventId },
      group: ['type'],
      raw: true
    });

    // Tickets by payment status
    const ticketsByPaymentStatus = await Ticket.findAll({
      attributes: [
        'paymentStatus',
        [fn('COUNT', col('id')), 'count']
      ],
      where: { eventId },
      group: ['paymentStatus'],
      raw: true
    });

    // Check-in stats
    const totalTickets = await Ticket.count({ where: { eventId } });
    const checkedInCount = await Attendee.count({
      where: { checkedIn: true },
      include: [{
        model: Ticket,
        where: { eventId },
        attributes: []
      }]
    });

    // Sales over time (daily)
    const salesOverTime = await Ticket.findAll({
      attributes: [
        [fn('DATE', col('createdAt')), 'date'],
        [fn('COUNT', col('id')), 'count'],
        [fn('SUM', col('price')), 'revenue']
      ],
      where: { eventId },
      group: [fn('DATE', col('createdAt'))],
      order: [[fn('DATE', col('createdAt')), 'ASC']],
      raw: true
    });

    // Capacity analysis
    const capacityUsed = (event.ticketsSold / event.capacity) * 100;

    res.status(200).json({
      event: {
        id: event.id,
        title: event.title,
        date: event.date,
        capacity: event.capacity,
        ticketsSold: event.ticketsSold,
        capacityUsed: capacityUsed.toFixed(2) + '%'
      },
      ticketsByType,
      ticketsByPaymentStatus,
      checkInStats: {
        total: totalTickets,
        checkedIn: checkedInCount,
        notCheckedIn: totalTickets - checkedInCount,
        percentage: totalTickets > 0 ? ((checkedInCount / totalTickets) * 100).toFixed(2) : 0
      },
      salesOverTime
    });
  } catch (err: any) {
    res.status(500).json({ 
      message: "Error fetching event analytics", 
      error: err.message 
    });
  }
};

// 🔹 Get revenue analytics
export const getRevenueAnalytics = async (req: Request, res: Response) => {
  try {
    // Total revenue by status
    const revenueByStatus = await Ticket.findAll({
      attributes: [
        'paymentStatus',
        [fn('SUM', col('price')), 'revenue'],
        [fn('COUNT', col('id')), 'count']
      ],
      group: ['paymentStatus'],
      raw: true
    });

    // Revenue by event
    const revenueByEvent = await Ticket.findAll({
      attributes: [
        'eventId',
        [fn('SUM', col('price')), 'revenue'],
        [fn('COUNT', col('id')), 'ticketsSold']
      ],
      where: { paymentStatus: 'completed' },
      group: ['eventId'],
      include: [{ model: Event, attributes: ['title', 'date'] }],
      order: [[fn('SUM', col('price')), 'DESC']],
      limit: 10
    });

    // Monthly revenue trend
    const monthlyRevenue = await Ticket.findAll({
      attributes: [
        [fn('DATE_FORMAT', col('createdAt'), '%Y-%m'), 'month'],
        [fn('SUM', col('price')), 'revenue'],
        [fn('COUNT', col('id')), 'tickets']
      ],
      where: { paymentStatus: 'completed' },
      group: [fn('DATE_FORMAT', col('createdAt'), '%Y-%m')],
      order: [[fn('DATE_FORMAT', col('createdAt'), '%Y-%m'), 'DESC']],
      limit: 12,
      raw: true
    });

    res.status(200).json({
      revenueByStatus,
      revenueByEvent,
      monthlyRevenue
    });
  } catch (err: any) {
    res.status(500).json({ 
      message: "Error fetching revenue analytics", 
      error: err.message 
    });
  }
};
