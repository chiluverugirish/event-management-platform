import { Request, Response } from "express";
import Event from "../models/Event";

// 🟢 Create Event
export const createEvent = async (req: any, res: Response) => {
  try {
    const { title, description, date, endDate, location, capacity, ticketTypes } = req.body;
    const userId = req.user?.id;

    if (!title || !description || !date || !location || capacity === undefined) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    const event = await Event.create({
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
  } catch (err: any) {
    console.error("Error creating event:", err);
    res.status(500).json({ 
      message: "Error creating event", 
      error: err.message 
    });
  }
};

// 🔵 Get all events
export const getEvents = async (req: Request, res: Response) => {
  try {
    const events = await Event.findAll();
    res.status(200).json(events);
  } catch (err: any) {
    res.status(500).json({ message: "Error fetching events", error: err.message });
  }
};

// 🔹 Get single event by ID
export const getEvent = async (req: Request, res: Response) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.status(200).json(event);
  } catch (err: any) {
    res.status(500).json({ message: "Error fetching event", error: err.message });
  }
};

// 🔹 Update event by ID
export const updateEvent = async (req: Request, res: Response) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    await event.update(req.body);
    res.status(200).json({ message: "Event updated", event });
  } catch (err: any) {
    res.status(500).json({ message: "Error updating event", error: err.message });
  }
};

// 🔹 Delete event by ID
export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    await event.destroy();
    res.status(200).json({ message: "Event deleted" });
  } catch (err: any) {
    res.status(500).json({ message: "Error deleting event", error: err.message });
  }
};
