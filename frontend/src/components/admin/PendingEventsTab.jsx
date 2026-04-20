import PropTypes from 'prop-types';
import StatusBadge from '../StatusBadge';

const PendingEventsTab = ({ events, onUpdateStatus }) => {
  if (events.length === 0) {
    return (
      <div className="text-center text-gray-400 py-16">
        <p>No pending events.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((ev) => (
        <div key={ev.id} className="card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <StatusBadge status={ev.status} />
              <span className="text-xs text-gray-400">{ev.type} · {ev.source_name}</span>
            </div>
            <h3 className="font-semibold text-gray-800 font-serif-italic">{ev.title}</h3>
            <p className="text-sm text-gray-500">{ev.venue} · by {ev.organizer_name}</p>
            <p className="text-xs text-gray-400 mt-1 line-clamp-2">{ev.description}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => onUpdateStatus(ev.id, 'approved')}
              className="bg-emerald-500 text-white text-sm px-4 py-2 rounded-xl hover:bg-emerald-600 transition-colors"
            >
              Approve
            </button>
            <button
              onClick={() => onUpdateStatus(ev.id, 'rejected')}
              className="bg-red-500 text-white text-sm px-4 py-2 rounded-xl hover:bg-red-600 transition-colors"
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

PendingEventsTab.propTypes = {
  events: PropTypes.array.isRequired,
  onUpdateStatus: PropTypes.func.isRequired,
};

export default PendingEventsTab;
