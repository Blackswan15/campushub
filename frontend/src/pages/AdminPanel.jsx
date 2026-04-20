import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import OverviewTab from '../components/admin/OverviewTab';
import PendingEventsTab from '../components/admin/PendingEventsTab';
import PendingClubsTab from '../components/admin/PendingClubsTab';
import DepartmentsTab from '../components/admin/DepartmentsTab';
import UsersTab from '../components/admin/UsersTab';

const AdminPanel = () => {
  const [overview, setOverview] = useState(null);
  const [tab, setTab] = useState('overview');
  const [pendingEvents, setPendingEvents] = useState([]);
  const [pendingClubs, setPendingClubs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);

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

        {tab === 'overview' && <OverviewTab overview={overview} />}
        {tab === 'events' && <PendingEventsTab events={pendingEvents} onUpdateStatus={handleEventStatus} />}
        {tab === 'clubs' && <PendingClubsTab clubs={pendingClubs} onApprove={handleApproveClub} onDelete={handleDeleteClub} />}
        {tab === 'departments' && (
          <DepartmentsTab
            departments={departments}
            onDepartmentAdded={(dept) => setDepartments((prev) => [...prev, dept])}
            onDepartmentDeleted={(id) => setDepartments((prev) => prev.filter((d) => d.id !== id))}
          />
        )}
        {tab === 'users' && <UsersTab users={users} />}
      </div>
    </div>
  );
};

export default AdminPanel;
