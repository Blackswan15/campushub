import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import PropTypes from 'prop-types';

const initialFormState = {
  title: '', description: '', date: '', venue: '', type: 'club', ref_id: '',
  subEvents: [{ name: 'Main Event', type: 'general', capacity: '' }],
};

const EventForm = ({ departments, clubs, editingEventId, editData, onSuccess, onCancel }) => {
  const [form, setForm] = useState(initialFormState);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editData) {
      setForm(editData);
    } else {
      setForm(initialFormState);
    }
  }, [editData]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubEventChange = (index, field, value) => {
    const newSubEvents = [...form.subEvents];
    newSubEvents[index][field] = value;
    setForm({ ...form, subEvents: newSubEvents });
  };

  const addSubEvent = () => setForm({
    ...form,
    subEvents: [...form.subEvents, { name: '', type: 'technical', capacity: '' }],
  });

  const removeSubEvent = (index) => setForm({
    ...form,
    subEvents: form.subEvents.filter((_, i) => i !== index),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        ref_id: parseInt(form.ref_id),
        subEvents: form.subEvents.map(se => ({ ...se, capacity: se.capacity ? parseInt(se.capacity) : null })),
      };

      if (editingEventId) {
        await api.put(`/events/${editingEventId}`, payload);
        toast.success('Event updated successfully!');
      } else {
        await api.post('/events', payload);
        toast.success('Event submitted for approval!');
      }

      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save event.');
    } finally {
      setSubmitting(false);
    }
  };

  const refOptions = form.type === 'department' ? departments : clubs;

  return (
    <div className="card mb-6 border-cyan-200">
      <h2 className="text-xl font-serif-italic mb-6 text-gray-800">
        {editingEventId ? 'Edit Event' : 'Create New Event'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
            <input name="title" value={form.title} onChange={handleChange} placeholder="Event title" className="input-field" required />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Describe the event..." className="input-field resize-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
            <input name="date" type="datetime-local" value={form.date} onChange={handleChange} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
            <input name="venue" value={form.venue} onChange={handleChange} placeholder="Auditorium, Room 101..." className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select name="type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value, ref_id: '' })} className="input-field">
              <option value="club">Club</option>
              <option value="department">Department</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {form.type === 'department' ? 'Department' : 'Club'}
            </label>
            <select name="ref_id" value={form.ref_id} onChange={handleChange} className="input-field" required>
              <option value="">Select {form.type}...</option>
              {refOptions.map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Sub-Events section */}
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-800">Competitions / Sub-Events</h3>
            <button type="button" onClick={addSubEvent} className="text-cyan-600 text-sm hover:underline font-medium">+ Add Sub-Event</button>
          </div>
          <div className="space-y-4">
            {form.subEvents.map((se, index) => (
              <div key={index} className="flex flex-wrap sm:flex-nowrap items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <input
                  placeholder="Name (e.g. Coding)"
                  value={se.name}
                  onChange={(e) => handleSubEventChange(index, 'name', e.target.value)}
                  className="input-field flex-1 min-w-[150px]" required
                />
                <select
                  value={se.type}
                  onChange={(e) => handleSubEventChange(index, 'type', e.target.value)}
                  className="input-field w-36"
                >
                  <option value="general">General</option>
                  <option value="technical">Technical</option>
                  <option value="non-technical">Non-Tech</option>
                </select>
                <input
                  type="number"
                  placeholder="Capacity"
                  value={se.capacity}
                  onChange={(e) => handleSubEventChange(index, 'capacity', e.target.value)}
                  className="input-field w-24"
                />
                {form.subEvents.length > 1 && (
                  <button type="button" onClick={() => removeSubEvent(index)} className="text-red-500 hover:text-red-700 p-2">✕</button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-60">
            {submitting ? 'Saving...' : editingEventId ? 'Save Changes' : 'Submit Event for Approval'}
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

EventForm.propTypes = {
  departments: PropTypes.array.isRequired,
  clubs: PropTypes.array.isRequired,
  editingEventId: PropTypes.number,
  editData: PropTypes.object,
  onSuccess: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default EventForm;
