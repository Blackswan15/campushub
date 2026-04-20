import { Users, CheckCircle2 } from 'lucide-react';
import PropTypes from 'prop-types';
import TicketCard from './TicketCard';

const SubEventCard = ({ subEvent, event, user, isRegistered, regId, showTicket, registering, onRegister, onToggleTicket }) => {
  const isFull = subEvent.capacity !== null && subEvent.remaining_seats <= 0;
  const date = new Date(event.date);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Sub-event info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${
              subEvent.type === 'technical' ? 'bg-blue-50 text-blue-700 border-blue-200' :
              subEvent.type === 'non-technical' ? 'bg-purple-50 text-purple-700 border-purple-200' :
              'bg-gray-50 text-gray-700 border-gray-200'
            }`}>
              {subEvent.type.replace('-', ' ')}
            </span>
          </div>
          <h3 className="text-xl font-bold text-gray-800 capitalize mb-1">{subEvent.name}</h3>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span className="flex items-center gap-1 font-medium bg-gray-50 px-2 py-1 rounded-lg border border-gray-100 text-gray-600">
              <Users size={14} className="text-cyan-600" />
              {subEvent.registered_count} registered
            </span>
            {subEvent.capacity !== null && (
              <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100 text-gray-600">
                <span className={`font-semibold ${subEvent.remaining_seats > 10 ? 'text-emerald-600' : 'text-amber-500'}`}>
                  {subEvent.remaining_seats} seats left
                </span>
              </span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-2 md:mt-0 md:min-w-[160px] flex flex-col gap-2">
          {isRegistered ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-emerald-700 font-semibold mb-2">
                <CheckCircle2 size={16} /> Registered
              </div>
              <button
                onClick={() => onToggleTicket(subEvent.id)}
                className="text-xs font-medium bg-white text-emerald-700 border border-emerald-200 w-full py-1.5 rounded-lg hover:bg-emerald-100 transition-colors"
              >
                {showTicket ? 'Hide Ticket' : 'View Ticket'}
              </button>
            </div>
          ) : isFull ? (
            <div className="bg-gray-100 text-gray-500 text-center py-2.5 rounded-xl font-medium border border-gray-200 cursor-not-allowed">
              Seat Full
            </div>
          ) : user?.role === 'student' ? (
            <button
              onClick={() => onRegister(subEvent.id)}
              disabled={registering}
              className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white py-2.5 px-4 rounded-xl font-semibold transition-all shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed w-full"
            >
              {registering ? 'Registering...' : 'Register Now'}
            </button>
          ) : null}
        </div>
      </div>

      {/* Inline Ticket (shown when toggled) */}
      {showTicket && isRegistered && (
        <TicketCard
          event={event}
          subEvent={subEvent}
          regId={regId}
          date={date}
          userName={user.name}
        />
      )}
    </div>
  );
};

SubEventCard.propTypes = {
  subEvent: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    capacity: PropTypes.number,
    remaining_seats: PropTypes.number,
    registered_count: PropTypes.number,
  }).isRequired,
  event: PropTypes.object.isRequired,
  user: PropTypes.object,
  isRegistered: PropTypes.bool.isRequired,
  regId: PropTypes.number,
  showTicket: PropTypes.bool.isRequired,
  registering: PropTypes.bool.isRequired,
  onRegister: PropTypes.func.isRequired,
  onToggleTicket: PropTypes.func.isRequired,
};

export default SubEventCard;
