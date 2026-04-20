import PropTypes from 'prop-types';

const RegistrationsModal = ({ activeRegs, onClose }) => {
  if (!activeRegs) return null;

  return (
    <div className="fixed inset-0 min-h-screen bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl m-auto top-[10%] relative">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-serif-italic text-gray-900">{activeRegs.sub_event}</h2>
            <p className="text-sm text-gray-500">Part of {activeRegs.event}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center">✕</button>
        </div>

        <div className="flex gap-4 mb-6 text-sm text-gray-600 bg-cyan-50 p-3 rounded-xl border border-cyan-100">
          <div>Total Registered: <span className="font-semibold text-cyan-800">{activeRegs.registered_count}</span></div>
          {activeRegs.capacity && <div>Capacity: <span className="font-semibold">{activeRegs.capacity}</span></div>}
        </div>

        <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-xl">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
              <tr>
                <th className="p-3 font-medium text-gray-600">Name</th>
                <th className="p-3 font-medium text-gray-600">Email</th>
                <th className="p-3 font-medium text-gray-600">Registered At</th>
              </tr>
            </thead>
            <tbody>
              {activeRegs.registrations.length === 0 ? (
                <tr><td colSpan="3" className="p-4 text-center text-gray-500">No registrations yet.</td></tr>
              ) : (
                activeRegs.registrations.map(r => (
                  <tr key={r.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="p-3 font-medium text-gray-800">{r.name}</td>
                    <td className="p-3 text-gray-600">{r.email}</td>
                    <td className="p-3 text-xs text-gray-500">{new Date(r.registered_at).toLocaleString('en-IN')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

RegistrationsModal.propTypes = {
  activeRegs: PropTypes.shape({
    sub_event: PropTypes.string,
    event: PropTypes.string,
    capacity: PropTypes.number,
    registered_count: PropTypes.number,
    registrations: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
      email: PropTypes.string,
      registered_at: PropTypes.string,
    })),
  }),
  onClose: PropTypes.func.isRequired,
};

export default RegistrationsModal;
