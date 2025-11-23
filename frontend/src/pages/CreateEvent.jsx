import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    endDate: '',
    location: '',
    capacity: '',
  });
  
  const [ticketTypes, setTicketTypes] = useState([
    { name: 'General', price: '', available: '' }
  ]);

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
    setLoading(true);

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
      await axios.post(
        'http://localhost:5050/api/events',
        {
          ...formData,
          capacity: parseInt(formData.capacity),
          ticketTypes: ticketTypesObj
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert('✅ Event created successfully!');
      navigate('/organizer/dashboard');
    } catch (error) {
      console.error('Error creating event:', error);
      alert(error.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Create New Event
        </h1>
        <p className="text-gray-600">
          Fill in the details below to create your event
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

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : '✅ Create Event'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/organizer/dashboard')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateEvent;
