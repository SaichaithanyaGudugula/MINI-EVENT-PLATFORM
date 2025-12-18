import { Link } from 'react-router-dom';

const EventCard = ({
  event,
  onRsvpJoin,
  onRsvpLeave,
  onDelete,
  isOwner,
  loading,
}) => {
  const attendeesCount = event.attendeesCount ?? event.attendees?.length ?? 0;
  const isFull = event.isFull ?? attendeesCount >= event.capacity;
  const isAttending = event.isAttending ?? false;

  return (
    <div className="card">
      {event.imageUrl && <img src={event.imageUrl} alt={event.title} className="card-img" />}
      <div className="card-content">
        <div className="card-header">
          <h3>{event.title}</h3>
          <span className="capacity">
            {attendeesCount} / {event.capacity}
          </span>
        </div>
        <p className="muted">{new Date(event.dateTime).toLocaleString()}</p>
        <p className="muted">{event.location}</p>
        <p>{event.description}</p>
        <div className="card-actions">
          {!isOwner && (
            <>
              {!isAttending && (
                <button
                  type="button"
                  onClick={() => onRsvpJoin(event._id)}
                  disabled={loading || isFull}
                >
                  {isFull ? 'Full' : 'Join'}
                </button>
              )}
              {isAttending && (
                <button type="button" className="secondary" onClick={() => onRsvpLeave(event._id)} disabled={loading}>
                  Leave
                </button>
              )}
            </>
          )}
          {isOwner && (
            <div className="owner-actions">
              <Link to={`/events/${event._id}/edit`} className="secondary small">
                Edit
              </Link>
              <button type="button" className="danger small" onClick={() => onDelete(event._id)} disabled={loading}>
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;


