import { useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import PropTypes from 'prop-types';

const ClubRequestForm = ({ onSuccess, onCancel }) => {
  const [clubForm, setClubForm] = useState({ name: '', description: '', image_url: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/clubs', clubForm);
      toast.success('Club request submitted! Awaiting admin approval.');
      setClubForm({ name: '', description: '', image_url: '' });
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed.');
    }
  };

  return (
    <div className="card mb-6 border-cyan-200">
      <h2 className="text-xl font-serif-italic mb-4 text-gray-800">Request a New Club</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Club name"
          value={clubForm.name}
          onChange={(e) => setClubForm({ ...clubForm, name: e.target.value })}
          className="input-field"
          required
        />
        <input
          type="url"
          placeholder="Image URL (optional)"
          value={clubForm.image_url}
          onChange={(e) => setClubForm({ ...clubForm, image_url: e.target.value })}
          className="input-field"
        />
        <textarea
          placeholder="What is this club about?"
          value={clubForm.description}
          onChange={(e) => setClubForm({ ...clubForm, description: e.target.value })}
          rows={3}
          className="input-field resize-none"
          required
        />
        <div className="flex gap-3">
          <button type="submit" className="btn-primary">Submit Request</button>
          <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
};

ClubRequestForm.propTypes = {
  onSuccess: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default ClubRequestForm;
