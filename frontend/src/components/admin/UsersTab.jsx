import PropTypes from 'prop-types';

const UsersTab = ({ users }) => {
  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 border-b border-gray-100">
            <th className="pb-3 pr-4">Name</th>
            <th className="pb-3 pr-4">Email</th>
            <th className="pb-3 pr-4">Role</th>
            <th className="pb-3">Joined</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {users.map((u) => (
            <tr key={u.id}>
              <td className="py-3 pr-4 font-medium text-gray-800">{u.name}</td>
              <td className="py-3 pr-4 text-gray-500">{u.email}</td>
              <td className="py-3 pr-4">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  u.role === 'admin' ? 'bg-red-100 text-red-700' :
                  u.role === 'organizer' ? 'bg-purple-100 text-purple-700' :
                  u.role === 'pending_org' ? 'bg-amber-100 text-amber-700' :
                  'bg-cyan-100 text-cyan-700'
                }`}>
                  {u.role}
                </span>
              </td>
              <td className="py-3 text-gray-400">
                {new Date(u.created_at).toLocaleDateString('en-IN')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

UsersTab.propTypes = {
  users: PropTypes.array.isRequired,
};

export default UsersTab;
