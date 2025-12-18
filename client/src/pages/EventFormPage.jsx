import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createEvent, getEvent, updateEvent } from '../api/events';
import EventForm from '../components/EventForm.jsx';

const EventFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getEvent(id);
        setInitialData(data);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load event');
      } finally {
        setLoading(false);
      }
    };
    if (isEdit) load();
  }, [id, isEdit]);

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    setError('');
    try {
      if (isEdit) {
        await updateEvent(id, payload);
      } else {
        await createEvent(payload);
      }
      navigate('/my-events');
    } catch (err) {
      setError(err?.response?.data?.message || 'Save failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <div className="page-header">
        <h2>{isEdit ? 'Edit Event' : 'Create Event'}</h2>
        <p className="muted">
          {isEdit ? 'Update your event details.' : 'Publish a new event.'}
        </p>
      </div>
      {error && <p className="error">{error}</p>}
      <EventForm onSubmit={handleSubmit} initialData={initialData || {}} submitting={submitting} />
    </div>
  );
};

export default EventFormPage;


