import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllEvents } from '../services/eventService';
import Card from '../components/Card';
import Button from '../components/Button';
import { useAuth } from '../hooks/useAuth';

const OrganizerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [myEvents, setMyEvents] = useState([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalTicketsSold: 0,
    totalRevenue: 0,
    upcomingEvents: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyEvents();
  }, [user]);

  const fetchMyEvents = async () => {
    try {
      const allEvents = await getAllEvents();
      // Filter events created by this organizer
      const organizerEvents = allEvents.filter(event => event.organizerId === user?.id);
      setMyEvents(organizerEvents);

      // Calculate stats
      const totalTickets = organizerEvents.reduce((sum, event) => sum + (event.ticketsSold || 0), 0);
      const upcoming = organizerEvents.filter(event => event.status === 'upcoming').length;
      
      setStats({
        totalEvents: organizerEvents.length,
        totalTicketsSold: totalTickets,
        totalRevenue: totalTickets * 75, // Approximate
        upcomingEvents: upcoming,
      });
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditEvent = (eventId) => {
    navigate(`/organizer/events/${eventId}/edit`);
  };

  const handleViewAttendees = (eventId) => {
    navigate(`/organizer/events/${eventId}/attendees`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🎪 Organizer Dashboard
        </h1>
        <p className="text-gray-600">
          Welcome back, {user?.name}! Manage your events and track performance.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {stats.totalEvents}
            </div>
            <div className="text-gray-600">My Events</div>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {stats.upcomingEvents}
            </div>
            <div className="text-gray-600">Upcoming</div>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">
              {stats.totalTicketsSold}
            </div>
            <div className="text-gray-600">Tickets Sold</div>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-600 mb-2">
              ${stats.totalRevenue.toLocaleString()}
            </div>
            <div className="text-gray-600">Est. Revenue</div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Button onClick={() => navigate('/organizer/create-event')}>
            ➕ Create New Event
          </Button>
          <Button onClick={() => navigate('/organizer/analytics')} variant="secondary">
            📊 View Analytics
          </Button>
          <Button onClick={() => navigate('/events')} variant="secondary">
            🎟️ Browse All Events
          </Button>
        </div>
      </div>

      {/* My Events */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">My Events</h2>
        
        {myEvents.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎪</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No Events Yet
              </h3>
              <p className="text-gray-600 mb-6">
                Create your first event to get started!
              </p>
              <Button onClick={() => navigate('/organizer/create-event')}>
                Create Event
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {myEvents.map((event) => (
              <Card key={event.id}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        event.status === 'upcoming' ? 'bg-green-100 text-green-800' :
                        event.status === 'ongoing' ? 'bg-blue-100 text-blue-800' :
                        event.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {event.status}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-3 line-clamp-2">{event.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">📍 Location:</span>
                        <p className="font-medium">{event.location}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">📅 Date:</span>
                        <p className="font-medium">
                          {new Date(event.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">🎫 Tickets:</span>
                        <p className="font-medium">
                          {event.ticketsSold || 0} / {event.capacity}
                        </p>
                      </div>
                    </div>

                    {/* Ticket Types */}
                    {event.ticketTypes && (
                      <div className="mt-3">
                        <span className="text-gray-500 text-sm">Ticket Types:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {Object.entries(event.ticketTypes).map(([type, details]) => (
                            <span
                              key={type}
                              className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                            >
                              {type}: ${details.price} ({details.available} available)
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      onClick={() => handleEditEvent(event.id)}
                      variant="secondary"
                      className="text-sm whitespace-nowrap"
                    >
                      ✏️ Edit
                    </Button>
                    <Button
                      onClick={() => handleViewAttendees(event.id)}
                      variant="secondary"
                      className="text-sm whitespace-nowrap"
                    >
                      👥 Attendees
                    </Button>
                    <Button
                      onClick={() => navigate(`/organizer/events/${event.id}/analytics`)}
                      variant="secondary"
                      className="text-sm whitespace-nowrap"
                    >
                      📊 Analytics
                    </Button>
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

export default OrganizerDashboard;
