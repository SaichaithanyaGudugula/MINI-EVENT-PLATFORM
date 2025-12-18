import { useEffect, useState } from 'react';
import { deleteEvent, getMyEvents } from '../api/events';
import EventCard from '../components/EventCard.jsx';
import Loader from '../components/Loader.jsx';
import EmptyState from '../components/EmptyState.jsx';

const MyEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const loadEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getMyEvents();
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

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    setActionLoading(true);
    try {
      await deleteEvent(id);
      await loadEvents();
    } catch (err) {
      alert(err?.response?.data?.message || 'Unable to delete');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="page-header">
        <h2>My Events</h2>
        <p className="muted">Manage events you created.</p>
      </div>
      {error && <p className="error">{error}</p>}
      {events.length === 0 ? (
        <EmptyState title="You haven't created any events yet" />
      ) : (
        <div className="grid">
          {events.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              isOwner
              onDelete={handleDelete}
              loading={actionLoading}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyEventsPage;


