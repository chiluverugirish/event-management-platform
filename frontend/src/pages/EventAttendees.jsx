import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Card from '../components/Card';
import Button from '../components/Button';
import Loader from '../components/Loader';

const EventAttendees = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchData();
  }, [eventId]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch event details
      const eventResponse = await axios.get(
        `http://localhost:5050/api/events/${eventId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEvent(eventResponse.data);

      // Fetch attendees
      const attendeesResponse = await axios.get(
        `http://localhost:5050/api/attendees/event/${eventId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAttendees(attendeesResponse.data);

      // Fetch check-in stats
      const statsResponse = await axios.get(
        `http://localhost:5050/api/attendees/stats/${eventId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStats(statsResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to load attendees');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (attendeeId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5050/api/attendees/checkin`,
        { attendeeId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('✅ Check-in successful!');
      fetchData();
    } catch (error) {
      console.error('Error checking in:', error);
      alert(error.response?.data?.message || 'Failed to check in');
    }
  };

  const handleUndoCheckIn = async (attendeeId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5050/api/attendees/undo-checkin/${attendeeId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('✅ Check-in undone!');
      fetchData();
    } catch (error) {
      console.error('Error undoing check-in:', error);
      alert(error.response?.data?.message || 'Failed to undo check-in');
    }
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          onClick={() => navigate(-1)}
          variant="secondary"
          className="mb-4"
        >
          ← Back
        </Button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Event Attendees
        </h1>
        {event && (
          <p className="text-gray-600">
            {event.title} - {new Date(event.date).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {stats.totalAttendees}
              </div>
              <div className="text-gray-600">Total Attendees</div>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {stats.checkedIn}
              </div>
              <div className="text-gray-600">Checked In</div>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">
                {stats.notCheckedIn}
              </div>
              <div className="text-gray-600">Not Checked In</div>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">
                {stats.checkInPercentage}%
              </div>
              <div className="text-gray-600">Check-in Rate</div>
            </div>
          </Card>
        </div>
      )}

      {/* Attendees List */}
      <Card>
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Attendee List ({attendees.length})
        </h2>

        {attendees.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👥</div>
            <p className="text-gray-600">No attendees yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Phone
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Ticket Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Check-in Time
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {attendees.map((attendee) => (
                  <tr key={attendee.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {attendee.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {attendee.email}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {attendee.phone || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                        {attendee.Ticket?.type || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {attendee.checkedIn ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                          ✓ Checked In
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {attendee.checkInTime 
                        ? new Date(attendee.checkInTime).toLocaleString()
                        : '-'
                      }
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      {attendee.checkedIn ? (
                        <button
                          onClick={() => handleUndoCheckIn(attendee.id)}
                          className="text-orange-600 hover:text-orange-700 font-medium"
                        >
                          Undo
                        </button>
                      ) : (
                        <button
                          onClick={() => handleCheckIn(attendee.id)}
                          className="text-green-600 hover:text-green-700 font-medium"
                        >
                          Check In
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default EventAttendees;
