import React, { useState, useEffect } from 'react';
import { getMyTickets } from '../services/ticketService';
import Card from '../components/Card';
import Loader from '../components/Loader';
import { formatDate, getErrorMessage } from '../utils/helpers';

/**
 * My Tickets Page - View user's booked tickets
 */
const MyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const data = await getMyTickets();
      setTickets(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" text="Loading your tickets..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Tickets</h1>
          <p className="text-xl text-gray-600">View and manage your booked tickets</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg max-w-2xl">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Tickets List */}
        {tickets.length === 0 ? (
          <Card className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Tickets Yet</h3>
            <p className="text-gray-600">You haven't booked any tickets. Browse events to get started!</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {tickets.map((ticket) => (
              <Card key={ticket.id} className="flex flex-col">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">
                        {ticket.Event?.title || 'Event'}
                      </h3>
                      <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full">
                        {ticket.type}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{formatDate(ticket.Event?.date)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{ticket.Event?.location}</span>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-3 text-center">Your QR Code</p>
                    <div className="flex justify-center">
                      <img 
                        src={ticket.qrCode} 
                        alt="Ticket QR Code" 
                        className="w-48 h-48 border-4 border-white shadow-sm rounded-lg"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-3 text-center">
                      Show this QR code at the event entrance
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTickets;
