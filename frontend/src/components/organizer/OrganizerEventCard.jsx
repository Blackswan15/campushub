import PropTypes from 'prop-types';
import StatusBadge from '../StatusBadge';

const OrganizerEventCard = ({ event, onEdit, onDelete, onViewRegistrations, onDeleteSubEvent }) => {
  return (
    <div className="card border-l-4 border-cyan-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <StatusBadge status={event.status} />
            <span className="text-xs text-gray-400">{event.type} · {event.source_name}</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 font-serif-italic">{event.title}</h3>
          <p className="text-sm text-gray-500">{event.venue} · {new Date(event.date).toLocaleDateString('en-IN')}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => onEdit(event)}
            className="text-sm text-cyan-700 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 px-3 py-1.5 rounded-lg transition-colors font-medium"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(event.id)}
            className="text-sm text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg transition-colors font-medium"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Sub-events table */}
      <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="p-3 font-medium text-gray-600">Sub-Event / Competition</th>
              <th className="p-3 font-medium text-gray-600">Type</th>
              <th className="p-3 font-medium text-gray-600">Registrations</th>
              <th className="p-3 font-medium text-gray-600 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(event.sub_events || []).map(se => (
              <tr key={se.id} className="hover:bg-white transition-colors">
                <td className="p-3 font-medium text-gray-800">{se.name}</td>
                <td className="p-3 text-xs capitalize text-cyan-700">
                  <span className="bg-cyan-50 px-2 py-1 rounded-md border border-cyan-100">{se.type}</span>
                </td>
                <td className="p-3">
                  <span className="font-semibold text-gray-700">{se.registered_count}</span>
                  {se.capacity && <span className="text-gray-400"> / {se.capacity}</span>}
                </td>
                <td className="p-3 text-right flex items-center justify-end gap-2">
                  <button
                    onClick={() => onViewRegistrations(se)}
                    className="text-cyan-600 text-xs font-semibold hover:underline bg-white border border-cyan-200 px-3 py-1.5 rounded-lg hover:bg-cyan-50 transition-colors"
                  >
                    View Registrations
                  </button>
                  <button
                    onClick={() => onDeleteSubEvent(se)}
                    className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors"
                    title="Delete Sub-event"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

OrganizerEventCard.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    type: PropTypes.string,
    source_name: PropTypes.string,
    venue: PropTypes.string,
    date: PropTypes.string,
    sub_events: PropTypes.array,
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onViewRegistrations: PropTypes.func.isRequired,
  onDeleteSubEvent: PropTypes.func.isRequired,
};

export default OrganizerEventCard;
