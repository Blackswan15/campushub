import PropTypes from 'prop-types';

const StatusBadge = ({ status }) => {
  const cls = {
    pending: 'badge-pending',
    approved: 'badge-approved',
    rejected: 'badge-rejected',
  };
  return <span className={cls[status] || 'badge-pending'}>{status}</span>;
};

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
};

export default StatusBadge;
