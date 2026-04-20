import PropTypes from 'prop-types';

const EmptyState = ({ emoji = '📭', message, subMessage }) => {
  return (
    <div className="text-center py-16 text-gray-400">
      <div className="text-5xl mb-3">{emoji}</div>
      <p className="text-lg font-medium">{message}</p>
      {subMessage && <p className="text-sm mt-1">{subMessage}</p>}
    </div>
  );
};

EmptyState.propTypes = {
  emoji: PropTypes.string,
  message: PropTypes.string.isRequired,
  subMessage: PropTypes.string,
};

export default EmptyState;
