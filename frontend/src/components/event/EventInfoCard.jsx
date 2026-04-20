import { Calendar, MapPin, Clock, User } from 'lucide-react';
import PropTypes from 'prop-types';

const EventInfoCard = ({ event }) => {
  const date = new Date(event.date);
  const formatted = date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const time = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="card border-t-4 border-cyan-500 mb-6 px-6 py-6 rounded-2xl bg-white shadow-sm">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-semibold text-cyan-600 uppercase tracking-wide bg-cyan-50 px-3 py-1 rounded-full border border-cyan-100">
            {event.type === 'department' ? 'Department' : 'Club'} · {event.source_name}
          </span>
          {event.status === 'approved' && (
            <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded">✓ Approved</span>
          )}
        </div>
        <h1 className="text-4xl font-serif-italic text-gray-900 leading-tight mb-2">{event.title}</h1>
      </div>

      {/* Meta grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-cyan-100 rounded-xl flex items-center justify-center">
            <Calendar size={16} className="text-cyan-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Date</p>
            <p className="text-sm font-semibold text-gray-800">{formatted}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-cyan-100 rounded-xl flex items-center justify-center">
            <Clock size={16} className="text-cyan-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Time</p>
            <p className="text-sm font-semibold text-gray-800">{time}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-cyan-100 rounded-xl flex items-center justify-center">
            <MapPin size={16} className="text-cyan-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Venue</p>
            <p className="text-sm font-semibold text-gray-800">{event.venue}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-cyan-100 rounded-xl flex items-center justify-center">
            <User size={16} className="text-cyan-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Organizer</p>
            <p className="text-sm font-semibold text-gray-800">{event.organizer_name}</p>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">About this event</h2>
        <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{event.description}</p>
      </div>
    </div>
  );
};

EventInfoCard.propTypes = {
  event: PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    date: PropTypes.string.isRequired,
    venue: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    source_name: PropTypes.string,
    status: PropTypes.string,
    organizer_name: PropTypes.string,
  }).isRequired,
};

export default EventInfoCard;
