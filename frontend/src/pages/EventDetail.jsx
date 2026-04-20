import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import EventInfoCard from '../components/event/EventInfoCard';
import SubEventCard from '../components/event/SubEventCard';

const EventDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(null);
  const [registrations, setRegistrations] = useState({});
  const [showTicket, setShowTicket] = useState(null);

  useEffect(() => {
    fetchEventData();
  }, [id, user]);

  const fetchEventData = () => {
    api.get(`/events/${id}`)
      .then(({ data }) => { setEvent(data); setLoading(false); })
      .catch(() => { toast.error('Event not found.'); navigate('/dashboard'); });

    // Check user's existing registrations
    if (user) {
      api.get('/registrations/me').then(({ data }) => {
        const regMap = {};
        data.forEach(r => { if (r.sub_event_id) regMap[r.sub_event_id] = r.registration_id; });
        setRegistrations(regMap);
      });
    }
  };

  const handleRegister = async (subEventId) => {
    if (!user) { navigate('/login'); return; }
    setRegistering(subEventId);
    try {
      const { data } = await api.post(`/sub-events/${subEventId}/register`);
      setRegistrations({ ...registrations, [subEventId]: data.registration_id });
      setShowTicket(subEventId);
      toast.success('Successfully registered!');
      fetchEventData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setRegistering(null);
    }
  };

  const handleToggleTicket = (subEventId) => {
    setShowTicket(showTicket === subEventId ? null : subEventId);
  };

  if (loading) return <LoadingSpinner fullScreen />;

  const subEvents = event.sub_events || [];

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4">
        <button onClick={() => navigate(-1)} className="text-sm text-cyan-600 hover:underline mb-6 flex items-center gap-1">
          ← Back
        </button>

        <EventInfoCard event={event} />

        {/* Sub Events / Competitions */}
        {event.status === 'approved' && (
          <div>
            <h2 className="text-2xl font-serif-italic text-gray-800 mb-4 px-1">Competitions / Activities</h2>
            <div className="space-y-4">
              {subEvents.length === 0 ? (
                <div className="text-center p-8 bg-gray-100 rounded-xl text-gray-500">
                  No activities listed for this event.
                </div>
              ) : (
                subEvents.map(se => (
                  <SubEventCard
                    key={se.id}
                    subEvent={se}
                    event={event}
                    user={user}
                    isRegistered={!!registrations[se.id]}
                    regId={registrations[se.id]}
                    showTicket={showTicket === se.id}
                    registering={registering === se.id}
                    onRegister={handleRegister}
                    onToggleTicket={handleToggleTicket}
                  />
                ))
              )}
            </div>

            {!user && (
              <div className="mt-8 text-center bg-cyan-50 p-6 rounded-2xl border border-cyan-100">
                <p className="text-cyan-800 mb-3 font-medium">Want to participate in these competitions?</p>
                <button onClick={() => navigate('/login')} className="btn-primary">
                  Login as Student to Register
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetail;
