import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const StatusBadge = ({ status }) => {
  const cls = { pending: 'badge-pending', approved: 'badge-approved', rejected: 'badge-rejected' };
  return <span className={cls[status] || 'badge-pending'}>{status}</span>;
};

const OrganizerPanel = () => {
  const { user } = useAuth();
  const isPendingOrg = user?.role === 'pending_org';

  const [events, setEvents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [activeClubReq, setActiveClubReq] = useState(isPendingOrg);
  const [clubForm, setClubForm] = useState({ name: '', description: '', image_url: '' });
  
  const initialForm = { 
    title: '', description: '', date: '', venue: '', type: 'club', ref_id: '',
    subEvents: [{ name: 'Main Event', type: 'general', capacity: '' }]
  };
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [activeRegs, setActiveRegs] = useState(null); // stores { sub_event: {...}, regs: [...] }
  const [editingEventId, setEditingEventId] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, [user]);

  const fetchEvents = () => {
    Promise.all([
      api.get('/events/organizer'),
      api.get('/departments'),
      api.get('/clubs'),
    ]).then(([evts, depts, clbs]) => {
      setEvents(evts.data);
      setDepartments(depts.data);
      setClubs(clbs.data.filter(c => c.approved));
    }).finally(() => setLoading(false));
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubEventChange = (index, field, value) => {
    const newSubEvents = [...form.subEvents];
    newSubEvents[index][field] = value;
    setForm({ ...form, subEvents: newSubEvents });
  };
  const addSubEvent = () => setForm({ ...form, subEvents: [...form.subEvents, { name: '', type: 'technical', capacity: '' }] });
  const removeSubEvent = (index) => setForm({ ...form, subEvents: form.subEvents.filter((_, i) => i !== index) });

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { 
        ...form, 
        ref_id: parseInt(form.ref_id),
        subEvents: form.subEvents.map(se => ({ ...se, capacity: se.capacity ? parseInt(se.capacity) : null }))
      };
      
      if (editingEventId) {
        await api.put(`/events/${editingEventId}`, payload);
        toast.success('Event updated successfully!');
      } else {
        await api.post('/events', payload);
        toast.success('Event submitted for approval!');
      }
      
      setShowForm(false);
      setEditingEventId(null);
      setForm(initialForm);
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save event.');
    } finally {
      setSubmitting(false);
    }
  };

  const editEvent = (ev) => {
    setForm({
      title: ev.title,
      description: ev.description,
      date: new Date(ev.date).toISOString().slice(0, 16),
      venue: ev.venue,
      type: ev.type,
      ref_id: ev.ref_id,
      subEvents: (ev.sub_events && ev.sub_events.length > 0) 
        ? ev.sub_events.map(se => ({ ...se, capacity: se.capacity || '' }))
        : [{ name: 'Main Event', type: 'general', capacity: '' }]
    });
    setEditingEventId(ev.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteEvent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event and all its registrations? This action cannot be undone.")) return;
    try {
      await api.delete(`/events/${id}`);
      toast.success('Event deleted successfully.');
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete event.');
    }
  };

  const deleteSubEvent = async (se) => {
    if (!window.confirm(`Delete competition "${se.name}"?`)) return;
    try {
      await api.delete(`/sub-events/${se.id}`);
      toast.success('Sub-event deleted.');
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete sub-event.');
    }
  };

  const handleRequestClub = async (e) => {
    e.preventDefault();
    try {
      await api.post('/clubs', clubForm);
      toast.success('Club request submitted! Awaiting admin approval.');
      setActiveClubReq(false);
      setClubForm({ name: '', description: '', image_url: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed.');
    }
  };

  const viewRegistrations = async (subEvent) => {
    try {
      const { data } = await api.get(`/sub-events/${subEvent.id}/registrations`);
      setActiveRegs(data);
    } catch (err) {
      toast.error('Failed to load registrations');
    }
  };

  const refOptions = form.type === 'department' ? departments : clubs;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-serif-italic text-gray-900">Organizer Panel</h1>
            <p className="text-gray-500 mt-1">Create and manage your events</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setActiveClubReq(!activeClubReq)} className="btn-secondary text-sm">
              + Request Club
            </button>
            {!isPendingOrg && (
              <button 
                onClick={() => {
                  setForm(initialForm);
                  setEditingEventId(null);
                  setShowForm(!showForm);
                }} 
                className="btn-primary text-sm"
              >
                {showForm ? 'Close Form' : '+ Create Event'}
              </button>
            )}
          </div>
        </div>

        {/* Pending org status banner */}
        {isPendingOrg && (
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⏳</span>
              <div>
                <h3 className="font-semibold text-amber-800 mb-1">Account Pending Approval</h3>
                <p className="text-sm text-amber-700 leading-relaxed">
                  Your organizer account is awaiting admin approval. To get started, submit a <strong>Club Registration Request</strong> below.
                  Once the admin approves your club, your account will be upgraded to <strong>Organizer</strong> and you can post events.
                </p>
                <button
                  onClick={() => setActiveClubReq(true)}
                  className="mt-3 bg-amber-500 text-white text-sm px-4 py-2 rounded-xl hover:bg-amber-600 transition-colors"
                >
                  Submit Club Request →
                </button>
              </div>
            </div>
          </div>
        )}


        {activeClubReq && (
          <div className="card mb-6 border-cyan-200">
            <h2 className="text-xl font-serif-italic mb-4 text-gray-800">Request a New Club</h2>
            <form onSubmit={handleRequestClub} className="space-y-4">
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
                <button type="button" onClick={() => setActiveClubReq(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Create / Edit Event Form */}
        {showForm && (
          <div className="card mb-6 border-cyan-200">
            <h2 className="text-xl font-serif-italic mb-6 text-gray-800">
              {editingEventId ? 'Edit Event' : 'Create New Event'}
            </h2>
            <form onSubmit={handleCreateEvent} className="space-y-6">
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
                <button 
                  type="button" 
                  onClick={() => {
                    setShowForm(false);
                    setEditingEventId(null);
                    setForm(initialForm);
                  }} 
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Registrations Modal */}
        {activeRegs && (
          <div className="fixed inset-0 min-h-screen bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl m-auto top-[10%] relative">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-serif-italic text-gray-900">{activeRegs.sub_event}</h2>
                  <p className="text-sm text-gray-500">Part of {activeRegs.event}</p>
                </div>
                <button onClick={() => setActiveRegs(null)} className="text-gray-400 hover:text-gray-700 bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center">✕</button>
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
        )}

        {/* Events List */}
        <h2 className="text-xl font-serif-italic text-gray-800 mb-4">Your Events</h2>
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-3"></div>
            <p>No events yet. Create your first event!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {events.map((ev) => (
              <div key={ev.id} className="card border-l-4 border-cyan-500">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <StatusBadge status={ev.status} />
                      <span className="text-xs text-gray-400">{ev.type} · {ev.source_name}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 font-serif-italic">{ev.title}</h3>
                    <p className="text-sm text-gray-500">{ev.venue} · {new Date(ev.date).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button 
                      onClick={() => editEvent(ev)} 
                      className="text-sm text-cyan-700 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 px-3 py-1.5 rounded-lg transition-colors font-medium"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => deleteEvent(ev.id)} 
                      className="text-sm text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg transition-colors font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Sub-events table */}
                <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-100 border-b border-gray-200">
                      <tr>
                        <th className="p-3 font-medium text-gray-600">Sub-Event / Competition</th>
                        <th className="p-3 font-medium text-gray-600">Type</th>
                        <th className="p-3 font-medium text-gray-600">Registrations</th>
                        <th className="p-3 font-medium text-gray-600 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {(ev.sub_events || []).map(se => (
                        <tr key={se.id} className="hover:bg-white transition-colors">
                          <td className="p-3 font-medium text-gray-800">{se.name}</td>
                          <td className="p-3 text-xs capitalize text-cyan-700">
                            <span className="bg-cyan-50 px-2 py-1 rounded-md border border-cyan-100">{se.type}</span>
                          </td>
                          <td className="p-3">
                            <span className="font-semibold text-gray-700">{se.registered_count}</span>
                            {se.capacity && <span className="text-gray-400"> / {se.capacity}</span>}
                          </td>
                          <td className="p-3 text-right flex items-center justify-end gap-2">
                            <button 
                              onClick={() => viewRegistrations(se)}
                              className="text-cyan-600 text-xs font-semibold hover:underline bg-white border border-cyan-200 px-3 py-1.5 rounded-lg hover:bg-cyan-50 transition-colors"
                            >
                              View Registrations
                            </button>
                            <button 
                              onClick={() => deleteSubEvent(se)}
                              className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors"
                              title="Delete Sub-event"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizerPanel;
