import PropTypes from 'prop-types';

const PendingClubsTab = ({ clubs, onApprove, onDelete }) => {
  if (clubs.length === 0) {
    return (
      <div className="text-center text-gray-400 py-16">
        <p>No pending club requests.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {clubs.map((club) => (
        <div key={club.id} className="card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800 font-serif-italic mb-1">{club.name}</h3>
            <p className="text-sm text-gray-500 mb-1">{club.description}</p>
            <p className="text-xs text-gray-400">Requested by: {club.organizer_name}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => onApprove(club.id)}
              className="bg-emerald-500 text-white text-sm px-4 py-2 rounded-xl hover:bg-emerald-600 transition-colors"
            >
              Approve
            </button>
            <button
              onClick={() => onDelete(club.id)}
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

PendingClubsTab.propTypes = {
  clubs: PropTypes.array.isRequired,
  onApprove: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default PendingClubsTab;
