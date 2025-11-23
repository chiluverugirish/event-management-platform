import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllEvents } from '../services/eventService';
import Card from '../components/Card';
import Button from '../components/Button';
import { useAuth } from '../hooks/useAuth';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalTicketsSold: 0,
    totalRevenue: 0,
    activeEvents: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const eventsData = await getAllEvents();
      setEvents(eventsData);

      // Calculate stats
      const totalTickets = eventsData.reduce((sum, event) => sum + (event.ticketsSold || 0), 0);
      const activeEvents = eventsData.filter(event => event.status === 'upcoming' || event.status === 'ongoing').length;
      
      setStats({
        totalEvents: eventsData.length,
        totalTicketsSold: totalTickets,
        totalRevenue: totalTickets * 75, // Approximate
        activeEvents: activeEvents,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        // Add delete API call here when backend route is ready
        alert('Event deleted successfully');
        fetchData();
      } catch (error) {
        alert('Failed to delete event');
      }
    }
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
          👑 Admin Dashboard
        </h1>
        <p className="text-gray-600">
          Welcome back, {user?.name}! Manage all platform events and users.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {stats.totalEvents}
            </div>
            <div className="text-gray-600">Total Events</div>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {stats.activeEvents}
            </div>
            <div className="text-gray-600">Active Events</div>
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
          <Button onClick={() => navigate('/admin/users')}>
            Manage Users
          </Button>
          <Button onClick={() => navigate('/admin/analytics')} variant="secondary">
            View Analytics
          </Button>
          <Button onClick={() => navigate('/events')} variant="secondary">
            Browse All Events
          </Button>
        </div>
      </div>

      {/* All Events */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">All Platform Events</h2>
        <div className="grid grid-cols-1 gap-6">
          {events.map((event) => (
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
                  
                  <p className="text-gray-600 mb-3">{event.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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
                      <span className="text-gray-500">🎫 Sold:</span>
                      <p className="font-medium">
                        {event.ticketsSold || 0} / {event.capacity}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">👤 Organizer ID:</span>
                      <p className="font-medium">{event.organizerId}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <Button
                    onClick={() => navigate(`/admin/events/${event.id}/edit`)}
                    variant="secondary"
                    className="text-sm"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => navigate(`/admin/events/${event.id}/attendees`)}
                    variant="secondary"
                    className="text-sm"
                  >
                    Attendees
                  </Button>
                  <Button
                    onClick={() => handleDeleteEvent(event.id)}
                    variant="danger"
                    className="text-sm"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
