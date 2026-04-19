import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const statusBadge = (status) => {
  const map = { pending: 'badge-pending', approved: 'badge-approved', rejected: 'badge-rejected' };
  return <span className={map[status] || 'badge-pending'}>{status}</span>;
};

const EventCard = ({ event, showStatus = false }) => {
  const date = new Date(event.date);
  const formatted = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const time = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="card card-hover flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between mb-2">
          <span className="text-xs font-semibold text-cyan-600 uppercase tracking-wide">
            {event.type === 'department' ? ' Dept' : ' Club'} · {event.source_name}
          </span>
          {showStatus && statusBadge(event.status)}
        </div>
        <h3 className="text-lg font-serif-italic font-semibold text-gray-900 mb-2 leading-snug">
          {event.title}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-2 mb-4">{event.description}</p>
      </div>

      {/* Meta */}
      <div className="space-y-1.5 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar size={14} className="text-cyan-500" />
          <span>{formatted}</span>
          <Clock size={14} className="text-cyan-500 ml-1" />
          <span>{time}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <MapPin size={14} className="text-cyan-500" />
          <span className="truncate">{event.venue}</span>
        </div>
        {event.registration_count !== undefined && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Users size={14} className="text-cyan-500" />
            <span>{event.registration_count} registered
              {event.capacity ? ` / ${event.capacity} max` : ''}
            </span>
          </div>
        )}
      </div>

      <Link
        to={`/events/${event.id}`}
        className="btn-primary text-sm text-center block"
      >
        View Details
      </Link>
    </div>
  );
};

// Props validation (Unit II — props validation topic)
EventCard.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    date: PropTypes.string.isRequired,
    venue: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['club', 'department']).isRequired,
    source_name: PropTypes.string,
    status: PropTypes.string,
    registration_count: PropTypes.number,
    capacity: PropTypes.number,
  }).isRequired,
  showStatus: PropTypes.bool,
};

export default EventCard;
