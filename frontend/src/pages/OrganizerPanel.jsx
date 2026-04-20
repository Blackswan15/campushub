import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ClubRequestForm from '../components/organizer/ClubRequestForm';
import EventForm from '../components/organizer/EventForm';
import RegistrationsModal from '../components/organizer/RegistrationsModal';
import OrganizerEventCard from '../components/organizer/OrganizerEventCard';

const OrganizerPanel = () => {
  const { user } = useAuth();
  const isPendingOrg = user?.role === 'pending_org';

  const [events, setEvents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeClubReq, setActiveClubReq] = useState(isPendingOrg);
  const [activeRegs, setActiveRegs] = useState(null);
  const [editingEventId, setEditingEventId] = useState(null);
  const [editData, setEditData] = useState(null);

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

  const editEvent = (ev) => {
    setEditData({
      title: ev.title,
      description: ev.description,
      date: new Date(ev.date).toISOString().slice(0, 16),
      venue: ev.venue,
      type: ev.type,
      ref_id: ev.ref_id,
      subEvents: (ev.sub_events && ev.sub_events.length > 0)
        ? ev.sub_events.map(se => ({ ...se, capacity: se.capacity || '' }))
        : [{ name: 'Main Event', type: 'general', capacity: '' }],
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

  const viewRegistrations = async (subEvent) => {
    try {
      const { data } = await api.get(`/sub-events/${subEvent.id}/registrations`);
      setActiveRegs(data);
    } catch (err) {
      toast.error('Failed to load registrations');
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingEventId(null);
    setEditData(null);
    fetchEvents();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingEventId(null);
    setEditData(null);
  };

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
                  setEditData(null);
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
          <ClubRequestForm
            onSuccess={() => setActiveClubReq(false)}
            onCancel={() => setActiveClubReq(false)}
          />
        )}

        {showForm && (
          <EventForm
            departments={departments}
            clubs={clubs}
            editingEventId={editingEventId}
            editData={editData}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        )}

        <RegistrationsModal activeRegs={activeRegs} onClose={() => setActiveRegs(null)} />

        {/* Events List */}
        <h2 className="text-xl font-serif-italic text-gray-800 mb-4">Your Events</h2>
        {loading ? (
          <LoadingSpinner />
        ) : events.length === 0 ? (
          <EmptyState emoji="📋" message="No events yet." subMessage="Create your first event!" />
        ) : (
          <div className="space-y-6">
            {events.map((ev) => (
              <OrganizerEventCard
                key={ev.id}
                event={ev}
                onEdit={editEvent}
                onDelete={deleteEvent}
                onViewRegistrations={viewRegistrations}
                onDeleteSubEvent={deleteSubEvent}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizerPanel;
