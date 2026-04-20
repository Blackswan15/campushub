import { useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import PropTypes from 'prop-types';

const DepartmentsTab = ({ departments, onDepartmentAdded, onDepartmentDeleted }) => {
  const [newDept, setNewDept] = useState('');

  const handleAddDept = async (e) => {
    e.preventDefault();
    if (!newDept.trim()) return;
    try {
      const { data } = await api.post('/departments', { name: newDept.trim() });
      onDepartmentAdded(data);
      setNewDept('');
      toast.success('Department added!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed.');
    }
  };

  const handleDeleteDept = async (id) => {
    try {
      await api.delete(`/departments/${id}`);
      onDepartmentDeleted(id);
      toast.success('Department deleted.');
    } catch {
      toast.error('Action failed.');
    }
  };

  return (
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
  );
};

DepartmentsTab.propTypes = {
  departments: PropTypes.array.isRequired,
  onDepartmentAdded: PropTypes.func.isRequired,
  onDepartmentDeleted: PropTypes.func.isRequired,
};

export default DepartmentsTab;
