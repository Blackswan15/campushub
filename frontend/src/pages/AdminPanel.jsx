import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const StatusBadge = ({ status }) => {
  const cls = { pending: 'badge-pending', approved: 'badge-approved', rejected: 'badge-rejected' };
  return <span className={cls[status] || 'badge-pending'}>{status}</span>;
};

const AdminPanel = () => {
  const [overview, setOverview] = useState(null);
  const [tab, setTab] = useState('overview');
  const [pendingEvents, setPendingEvents] = useState([]);
  const [pendingClubs, setPendingClubs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [newDept, setNewDept] = useState('');

  useEffect(() => {
    api.get('/admin/overview').then(({ data }) => setOverview(data));
  }, []);

  useEffect(() => {
    if (tab === 'events') api.get('/admin/pending-events').then(({ data }) => setPendingEvents(data));
    if (tab === 'clubs') api.get('/admin/pending-clubs').then(({ data }) => setPendingClubs(data));
    if (tab === 'departments') api.get('/departments').then(({ data }) => setDepartments(data));
    if (tab === 'users') api.get('/admin/users').then(({ data }) => setUsers(data));
  }, [tab]);

  const handleEventStatus = async (id, status) => {
    try {
      await api.put(`/events/${id}/status`, { status });
      setPendingEvents((prev) => prev.filter((e) => e.id !== id));
      toast.success(`Event ${status}!`);
      api.get('/admin/overview').then(({ data }) => setOverview(data));
    } catch { toast.error('Action failed.'); }
  };

  const handleApproveClub = async (id) => {
    try {
      await api.put(`/clubs/${id}/approve`);
      setPendingClubs((prev) => prev.filter((c) => c.id !== id));
      toast.success('Club approved!');
    } catch { toast.error('Action failed.'); }
  };

  const handleDeleteClub = async (id) => {
    try {
      await api.delete(`/clubs/${id}`);
      setPendingClubs((prev) => prev.filter((c) => c.id !== id));
      toast.success('Club deleted.');
    } catch { toast.error('Action failed.'); }
  };

  const handleAddDept = async (e) => {
    e.preventDefault();
    if (!newDept.trim()) return;
    try {
      const { data } = await api.post('/departments', { name: newDept.trim() });
      setDepartments((prev) => [...prev, data]);
      setNewDept('');
      toast.success('Department added!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed.'); }
  };

  const handleDeleteDept = async (id) => {
    try {
      await api.delete(`/departments/${id}`);
      setDepartments((prev) => prev.filter((d) => d.id !== id));
      toast.success('Department deleted.');
    } catch { toast.error('Action failed.'); }
  };

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'events', label: 'Pending Events' },
    { key: 'clubs', label: 'Pending Clubs' },
    { key: 'departments', label: 'Departments' },
    { key: 'users', label: 'Users' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif-italic text-gray-900">Admin Panel</h1>
          <p className="text-gray-500 mt-1">Manage the entire CampusHub platform</p>
        </div>

        {/* Tab Nav */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                tab === t.key
                  ? 'bg-cyan-500 text-white shadow-md shadow-cyan-200'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-cyan-400'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && overview && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: 'Total Users', value: overview.totalUsers, color: 'bg-cyan-50 text-cyan-700' },
              { label: 'Approved Events', value: overview.totalEvents, color: 'bg-emerald-50 text-emerald-700' },
              { label: 'Pending Events', value: overview.pendingEvents, color: 'bg-amber-50 text-amber-700' },
              { label: 'Active Clubs', value: overview.totalClubs, color: 'bg-purple-50 text-purple-700' },
              { label: 'Pending Clubs', value: overview.pendingClubs, color: 'bg-orange-50 text-orange-700' },
              { label: 'Registrations', value: overview.totalRegistrations, color: 'bg-blue-50 text-blue-700' },
            ].map((stat) => (
              <div key={stat.label} className={`card ${stat.color} text-center`}>
                <p className="text-3xl font-bold mb-1">{stat.value}</p>
                <p className="text-xs font-medium opacity-80">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Pending Events */}
        {tab === 'events' && (
          <div className="space-y-4">
            {pendingEvents.length === 0 ? (
              <div className="text-center text-gray-400 py-16">
                <p>No pending events.</p>
              </div>
            ) : (
              pendingEvents.map((ev) => (
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
                      onClick={() => handleEventStatus(ev.id, 'approved')}
                      className="bg-emerald-500 text-white text-sm px-4 py-2 rounded-xl hover:bg-emerald-600 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleEventStatus(ev.id, 'rejected')}
                      className="bg-red-500 text-white text-sm px-4 py-2 rounded-xl hover:bg-red-600 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Pending Clubs */}
        {tab === 'clubs' && (
          <div className="space-y-4">
            {pendingClubs.length === 0 ? (
              <div className="text-center text-gray-400 py-16">
                <p>No pending club requests.</p>
              </div>
            ) : (
              pendingClubs.map((club) => (
                <div key={club.id} className="card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 font-serif-italic mb-1">{club.name}</h3>
                    <p className="text-sm text-gray-500 mb-1">{club.description}</p>
                    <p className="text-xs text-gray-400">Requested by: {club.organizer_name}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleApproveClub(club.id)}
                      className="bg-emerald-500 text-white text-sm px-4 py-2 rounded-xl hover:bg-emerald-600 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleDeleteClub(club.id)}
                      className="bg-red-500 text-white text-sm px-4 py-2 rounded-xl hover:bg-red-600 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Departments */}
        {tab === 'departments' && (
          <div>
            <form onSubmit={handleAddDept} className="flex gap-3 mb-6">
              <input
                type="text"
                value={newDept}
                onChange={(e) => setNewDept(e.target.value)}
                placeholder="New department name..."
                className="input-field max-w-sm"
              />
              <button type="submit" className="btn-primary px-6">Add</button>
            </form>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {departments.map((d) => (
                <div key={d.id} className="card flex items-center justify-between">
                  <span className="font-medium text-gray-800">🎓 {d.name}</span>
                  <button
                    onClick={() => handleDeleteDept(d.id)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users */}
        {tab === 'users' && (
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
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
