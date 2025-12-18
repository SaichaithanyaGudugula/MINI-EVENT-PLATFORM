import { useEffect, useState } from 'react';
import { getEvents, rsvpJoin, rsvpLeave } from '../api/events';
import { useAuth } from '../hooks/useAuth';
import EventCard from '../components/EventCard.jsx';
import Loader from '../components/Loader.jsx';
import EmptyState from '../components/EmptyState.jsx';

const EventsPage = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const loadEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getEvents();
      setEvents(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleRsvpJoin = async (id) => {
    setActionLoading(true);
    try {
      await rsvpJoin(id);
      await loadEvents();
    } catch (err) {
      alert(err?.response?.data?.message || 'Unable to RSVP'); // simple alert for brevity
    } finally {
      setActionLoading(false);
    }
  };

  const handleRsvpLeave = async (id) => {
    setActionLoading(true);
    try {
      await rsvpLeave(id);
      await loadEvents();
    } catch (err) {
      alert(err?.response?.data?.message || 'Unable to cancel RSVP');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="page-header">
        <h2>Upcoming Events</h2>
        <p className="muted">Find and RSVP to events.</p>
      </div>
      {error && <p className="error">{error}</p>}
      {events.length === 0 ? (
        <EmptyState title="No events yet" />
      ) : (
        <div className="grid">
          {events.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              isOwner={event.createdBy?._id === user?._id}
              onRsvpJoin={handleRsvpJoin}
              onRsvpLeave={handleRsvpLeave}
              loading={actionLoading}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default EventsPage;


