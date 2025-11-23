import api from './api';

/**
 * Ticket Service
 * Handles all ticket-related API calls
 */

// Book a ticket (protected)
export const bookTicket = async (ticketData) => {
  try {
    const response = await api.post('/tickets', ticketData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to book ticket' };
  }
};

// Get user's tickets (protected)
export const getMyTickets = async () => {
  try {
    const response = await api.get('/tickets/my-tickets');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch tickets' };
  }
};
