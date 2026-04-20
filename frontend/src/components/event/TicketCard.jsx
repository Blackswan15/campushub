import { User } from 'lucide-react';
import PropTypes from 'prop-types';

const TicketCard = ({ event, subEvent, regId, date, userName }) => {
  return (
    <div className="mt-5 pt-5 border-t border-gray-100 flex justify-center">
      <div className="w-full max-w-sm border-2 border-cyan-500 rounded-xl p-5 bg-white">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h4 className="text-lg font-serif-italic text-gray-900">{event.title}</h4>
            <p className="text-xs font-bold uppercase text-cyan-700">{subEvent.name}</p>
          </div>
          <span className="text-xs font-bold bg-cyan-500 text-white px-2 py-1 rounded-bl-lg">Valid Ticket</span>
        </div>
        <div className="flex gap-4 mb-3 text-sm">
          <div>
            <p className="text-xs text-gray-400 uppercase font-semibold">Reg. ID</p>
            <p className="font-bold font-mono bg-gray-50 px-2 py-0.5 rounded border border-gray-100">REG-{regId}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase font-semibold">Date</p>
            <p className="font-semibold text-gray-800">{date.toLocaleDateString('en-IN')}</p>
          </div>
        </div>
        <div className="border-t border-dashed border-gray-200 pt-3">
          <p className="text-xs text-gray-400 uppercase font-semibold">Participant</p>
          <p className="font-bold text-gray-900 flex items-center gap-2">
            <User size={16} className="text-gray-400" />
            {userName}
          </p>
        </div>
      </div>
    </div>
  );
};

TicketCard.propTypes = {
  event: PropTypes.shape({
    title: PropTypes.string.isRequired,
  }).isRequired,
  subEvent: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }).isRequired,
  regId: PropTypes.number.isRequired,
  date: PropTypes.instanceOf(Date).isRequired,
  userName: PropTypes.string.isRequired,
};

export default TicketCard;
