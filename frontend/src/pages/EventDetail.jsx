import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock, User, CheckCircle2 } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const date = new Date(event.date);
  const formatted = date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const time = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const subEvents = event.sub_events || [];

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4">
        <button onClick={() => navigate(-1)} className="text-sm text-cyan-600 hover:underline mb-6 flex items-center gap-1">
          ← Back
        </button>

        {/* Event Info Card */}
        <div className="card border-t-4 border-cyan-500 mb-6 px-6 py-6 rounded-2xl bg-white shadow-sm">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold text-cyan-600 uppercase tracking-wide bg-cyan-50 px-3 py-1 rounded-full border border-cyan-100">
                {event.type === 'department' ? 'Department' : 'Club'} · {event.source_name}
              </span>
              {event.status === 'approved' && (
                <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded">✓ Approved</span>
              )}
            </div>
            <h1 className="text-4xl font-serif-italic text-gray-900 leading-tight mb-2">{event.title}</h1>
          </div>

          {/* Meta grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-cyan-100 rounded-xl flex items-center justify-center">
                <Calendar size={16} className="text-cyan-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Date</p>
                <p className="text-sm font-semibold text-gray-800">{formatted}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-cyan-100 rounded-xl flex items-center justify-center">
                <Clock size={16} className="text-cyan-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Time</p>
                <p className="text-sm font-semibold text-gray-800">{time}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-cyan-100 rounded-xl flex items-center justify-center">
                <MapPin size={16} className="text-cyan-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Venue</p>
                <p className="text-sm font-semibold text-gray-800">{event.venue}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-cyan-100 rounded-xl flex items-center justify-center">
                <User size={16} className="text-cyan-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Organizer</p>
                <p className="text-sm font-semibold text-gray-800">{event.organizer_name}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">About this event</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{event.description}</p>
          </div>
        </div>

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
                subEvents.map(se => {
                  const isRegistered = !!registrations[se.id];
                  const regId = registrations[se.id];
                  const isFull = se.capacity !== null && se.remaining_seats <= 0;

                  return (
                    <div key={se.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Sub-event info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${
                              se.type === 'technical' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              se.type === 'non-technical' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                              'bg-gray-50 text-gray-700 border-gray-200'
                            }`}>
                              {se.type.replace('-', ' ')}
                            </span>
                          </div>
                          <h3 className="text-xl font-bold text-gray-800 capitalize mb-1">{se.name}</h3>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1 font-medium bg-gray-50 px-2 py-1 rounded-lg border border-gray-100 text-gray-600">
                              <Users size={14} className="text-cyan-600" />
                              {se.registered_count} registered
                            </span>
                            {se.capacity !== null && (
                              <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100 text-gray-600">
                                <span className={`font-semibold ${se.remaining_seats > 10 ? 'text-emerald-600' : 'text-amber-500'}`}>
                                  {se.remaining_seats} seats left
                                </span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="mt-2 md:mt-0 md:min-w-[160px] flex flex-col gap-2">
                          {isRegistered ? (
                            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
                              <div className="flex items-center justify-center gap-1 text-emerald-700 font-semibold mb-2">
                                <CheckCircle2 size={16} /> Registered
                              </div>
                              <button
                                onClick={() => setShowTicket(showTicket === se.id ? null : se.id)}
                                className="text-xs font-medium bg-white text-emerald-700 border border-emerald-200 w-full py-1.5 rounded-lg hover:bg-emerald-100 transition-colors"
                              >
                                {showTicket === se.id ? 'Hide Ticket' : 'View Ticket'}
                              </button>
                            </div>
                          ) : isFull ? (
                            <div className="bg-gray-100 text-gray-500 text-center py-2.5 rounded-xl font-medium border border-gray-200 cursor-not-allowed">
                              Seat Full
                            </div>
                          ) : user?.role === 'student' ? (
                            <button
                              onClick={() => handleRegister(se.id)}
                              disabled={registering === se.id}
                              className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white py-2.5 px-4 rounded-xl font-semibold transition-all shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed w-full"
                            >
                              {registering === se.id ? 'Registering...' : 'Register Now'}
                            </button>
                          ) : null}
                        </div>
                      </div>

                      {/* Inline Ticket (shown when toggled) */}
                      {showTicket === se.id && isRegistered && (
                        <div className="mt-5 pt-5 border-t border-gray-100 flex justify-center">
                          <div className="w-full max-w-sm border-2 border-cyan-500 rounded-xl p-5 bg-white">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="text-lg font-serif-italic text-gray-900">{event.title}</h4>
                                <p className="text-xs font-bold uppercase text-cyan-700">{se.name}</p>
                              </div>
                              <span className="text-xs font-bold bg-cyan-500 text-white px-2 py-1 rounded-bl-lg">Valid Ticket</span>
                            </div>
                            <div className="flex gap-4 mb-3 text-sm">
                              <div>
                                <p className="text-xs text-gray-400 uppercase font-semibold">Reg. ID</p>
                                <p className="font-bold font-mono bg-gray-50 px-2 py-0.5 rounded border border-gray-100">REG-{regId}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400 uppercase font-semibold">Date</p>
                                <p className="font-semibold text-gray-800">{date.toLocaleDateString('en-IN')}</p>
                              </div>
                            </div>
                            <div className="border-t border-dashed border-gray-200 pt-3">
                              <p className="text-xs text-gray-400 uppercase font-semibold">Participant</p>
                              <p className="font-bold text-gray-900 flex items-center gap-2">
                                <User size={16} className="text-gray-400" />
                                {user.name}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
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
