import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Loader from '../components/Loader';

const EditEvent = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [event, setEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    endDate: '',
    location: '',
    capacity: '',
    status: 'upcoming',
  });
  
  const [ticketTypes, setTicketTypes] = useState([
    { name: 'General', price: '', available: '' }
  ]);

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5050/api/events/${eventId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      const eventData = response.data;
      setEvent(eventData);
      
      // Set form data
      setFormData({
        title: eventData.title || '',
        description: eventData.description || '',
        date: eventData.date ? new Date(eventData.date).toISOString().slice(0, 16) : '',
        endDate: eventData.endDate ? new Date(eventData.endDate).toISOString().slice(0, 16) : '',
        location: eventData.location || '',
        capacity: eventData.capacity || '',
        status: eventData.status || 'upcoming',
      });

      // Parse ticket types
      let parsedTicketTypes = [];
      if (eventData.ticketTypes) {
        const types = typeof eventData.ticketTypes === 'string' 
          ? JSON.parse(eventData.ticketTypes) 
          : eventData.ticketTypes;
        
        parsedTicketTypes = Object.entries(types).map(([name, details]) => ({
          name,
          price: details.price,
          available: details.available
        }));
      }
      
      if (parsedTicketTypes.length > 0) {
        setTicketTypes(parsedTicketTypes);
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      alert('Failed to load event');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleTicketTypeChange = (index, field, value) => {
    const newTicketTypes = [...ticketTypes];
    newTicketTypes[index][field] = value;
    setTicketTypes(newTicketTypes);
  };

  const addTicketType = () => {
    setTicketTypes([...ticketTypes, { name: '', price: '', available: '' }]);
  };

  const removeTicketType = (index) => {
    if (ticketTypes.length > 1) {
      setTicketTypes(ticketTypes.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Convert ticket types array to object format
      const ticketTypesObj = {};
      ticketTypes.forEach(ticket => {
        if (ticket.name && ticket.price && ticket.available) {
          ticketTypesObj[ticket.name] = {
            price: parseFloat(ticket.price),
            available: parseInt(ticket.available)
          };
        }
      });

      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5050/api/events/${eventId}`,
        {
          ...formData,
          capacity: parseInt(formData.capacity),
          ticketTypes: ticketTypesObj
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert('✅ Event updated successfully!');
      navigate(-1);
    } catch (error) {
      console.error('Error updating event:', error);
      alert(error.response?.data?.message || 'Failed to update event');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Edit Event
        </h1>
        <p className="text-gray-600">
          Update your event details
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Basic Information</h2>
            
            <div className="space-y-4">
              <Input
                label="Event Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Tech Conference 2025"
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe your event..."
                  required
                />
              </div>

              <Input
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Convention Center, NYC"
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Capacity"
                  name="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={handleChange}
                  placeholder="Maximum number of attendees"
                  required
                  min="1"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Date & Time</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Start Date & Time"
                name="date"
                type="datetime-local"
                value={formData.date}
                onChange={handleChange}
                required
              />

              <Input
                label="End Date & Time"
                name="endDate"
                type="datetime-local"
                value={formData.endDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Ticket Types */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Ticket Types</h2>
            
            <div className="space-y-4">
              {ticketTypes.map((ticket, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium text-gray-900">
                      Ticket Type {index + 1}
                    </h3>
                    {ticketTypes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTicketType(index)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label="Type Name"
                      value={ticket.name}
                      onChange={(e) => handleTicketTypeChange(index, 'name', e.target.value)}
                      placeholder="e.g., VIP, General"
                      required
                    />
                    
                    <Input
                      label="Price ($)"
                      type="number"
                      value={ticket.price}
                      onChange={(e) => handleTicketTypeChange(index, 'price', e.target.value)}
                      placeholder="0"
                      required
                      min="0"
                      step="0.01"
                    />
                    
                    <Input
                      label="Available Tickets"
                      type="number"
                      value={ticket.available}
                      onChange={(e) => handleTicketTypeChange(index, 'available', e.target.value)}
                      placeholder="0"
                      required
                      min="1"
                    />
                  </div>
                </div>
              ))}
              
              <Button
                type="button"
                onClick={addTicketType}
                variant="secondary"
              >
                ➕ Add Another Ticket Type
              </Button>
            </div>
          </div>

          {/* Current Stats */}
          {event && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-2">Current Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Tickets Sold:</span>
                  <p className="font-bold">{event.ticketsSold || 0}</p>
                </div>
                <div>
                  <span className="text-gray-600">Remaining:</span>
                  <p className="font-bold">{event.capacity - (event.ticketsSold || 0)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Created:</span>
                  <p className="font-bold">{new Date(event.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : '💾 Save Changes'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default EditEvent;
