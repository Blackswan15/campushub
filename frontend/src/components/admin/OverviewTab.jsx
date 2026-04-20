import PropTypes from 'prop-types';

const OverviewTab = ({ overview }) => {
  if (!overview) return null;

  const stats = [
    { label: 'Total Users', value: overview.totalUsers, color: 'bg-cyan-50 text-cyan-700' },
    { label: 'Approved Events', value: overview.totalEvents, color: 'bg-emerald-50 text-emerald-700' },
    { label: 'Pending Events', value: overview.pendingEvents, color: 'bg-amber-50 text-amber-700' },
    { label: 'Active Clubs', value: overview.totalClubs, color: 'bg-purple-50 text-purple-700' },
    { label: 'Pending Clubs', value: overview.pendingClubs, color: 'bg-orange-50 text-orange-700' },
    { label: 'Registrations', value: overview.totalRegistrations, color: 'bg-blue-50 text-blue-700' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className={`card ${stat.color} text-center`}>
          <p className="text-3xl font-bold mb-1">{stat.value}</p>
          <p className="text-xs font-medium opacity-80">{stat.label}</p>
        </div>
      ))}
    </div>
  );
};

OverviewTab.propTypes = {
  overview: PropTypes.shape({
    totalUsers: PropTypes.number,
    totalEvents: PropTypes.number,
    pendingEvents: PropTypes.number,
    totalClubs: PropTypes.number,
    pendingClubs: PropTypes.number,
    totalRegistrations: PropTypes.number,
  }),
};

export default OverviewTab;
