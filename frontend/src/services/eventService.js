import api from './api';

/**
 * Event Service
 * Handles all event-related API calls
 */

// Get all events (public)
export const getAllEvents = async () => {
  try {
    const response = await api.get('/events');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch events' };
  }
};

// Get single event by ID (public)
export const getEventById = async (id) => {
  try {
    const response = await api.get(`/events/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch event' };
  }
};

// Create new event (protected)
export const createEvent = async (eventData) => {
  try {
    const response = await api.post('/events', eventData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create event' };
  }
};

// Update event (protected)
export const updateEvent = async (id, eventData) => {
  try {
    const response = await api.put(`/events/${id}`, eventData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update event' };
  }
};

// Delete event (protected)
export const deleteEvent = async (id) => {
  try {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete event' };
  }
};
