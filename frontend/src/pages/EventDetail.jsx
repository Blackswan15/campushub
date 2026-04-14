import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock, User, CheckCircle2, Download, Printer } from 'lucide-react';
import html2canvas from 'html2canvas';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const EventDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(null); // stores active subEvent id
  const [registrations, setRegistrations] = useState({}); // sub_event_id -> registration_id Map
  const [showQR, setShowQR] = useState(null);

  useEffect(() => {
    fetchEventData();
  }, [id, user]);

  const fetchEventData = () => {
    api.get(`/events/${id}`)
      .then(({ data }) => { setEvent(data); setLoading(false); })
      .catch(() => { toast.error('Event not found.'); navigate('/dashboard'); });

    // Check registrations
    if (user) {
      api.get('/registrations/me').then(({ data }) => {
        const regMap = {};
        data.forEach(r => { if(r.sub_event_id) regMap[r.sub_event_id] = r.registration_id; });
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
      setShowQR(subEventId);
      toast.success('Successfully registered!');
      
      // refresh capacity stats
      fetchEventData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setRegistering(null);
    }
  };

  const handleDownloadTicket = async (seId) => {
    try {
      const element = document.getElementById(`ticket-${seId}`);
      if (!element) {
        throw new Error('Ticket element not found in DOM.');
      }
      
      // Ensure fonts and styles are ready before generating canvas
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
      // Wait for any React renders or layout shifts to complete
      await new Promise(resolve => setTimeout(resolve, 300));

      const canvas = await html2canvas(element, { 
        scale: 2, 
        useCORS: true, 
        backgroundColor: '#ffffff',
        logging: true
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `Ticket-REG-${registrations[seId]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Error generating ticket image:", err);
      toast.error(`Download failed: ${err.message || err}`);
    }
  };

  const handlePrintTicket = async (seId) => {
    try {
      const element = document.getElementById(`ticket-${seId}`);
      if (!element) {
        throw new Error('Ticket element not found in DOM.');
      }

      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
      await new Promise(resolve => setTimeout(resolve, 300));

      const canvas = await html2canvas(element, { 
        scale: 2, 
        useCORS: true, 
        backgroundColor: '#ffffff',
        logging: true
      });
      const dataUrl = canvas.toDataURL('image/png');
      const printWindow = window.open('', '_blank');
      
      if (!printWindow) {
        throw new Error('Popup blocker prevented printing. Please allow popups.');
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Print Ticket</title>
            <style>
              @media print {
                body { margin: 0; }
                img { max-width: 100%; border: none !important; box-shadow: none !important; }
              }
            </style>
          </head>
          <body style="margin:0;display:flex;justify-content:center;align-items:center;height:100vh;">
            <img src="${dataUrl}" style="max-width:100%; border: 1px solid #ccc; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);" onload="setTimeout(() => { window.print(); window.close(); }, 300);"/>
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch (err) {
      console.error("Error printing ticket:", err);
      toast.error(`Print failed: ${err.message || err}`);
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

  // Separate sub_events by type for nice grouping, or just list them.
  const subEvents = event.sub_events || [];

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4">
        <button onClick={() => navigate(-1)} className="text-sm text-cyan-600 hover:underline mb-6 flex items-center gap-1">
          ← Back
        </button>

        <div className="card border-t-4 border-cyan-500 mb-6 px-6 py-6 rounded-2xl bg-white shadow-sm">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold text-cyan-600 uppercase tracking-wide bg-cyan-50 px-3 py-1 rounded-full border border-cyan-100">
                {event.type === 'department' ? '🎓 Department' : '🏆 Club'} · {event.source_name}
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

        {/* Competitions / Sub Events */}
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
                    <div key={se.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      
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
                            <Users size={14} className="text-cyan-600"/> 
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

                      <div className="mt-2 md:mt-0 md:min-w-[160px] flex flex-col gap-2">
                        {isRegistered ? (
                           <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center transition-all">
                             <div className="flex items-center justify-center gap-1 text-emerald-700 font-semibold mb-2">
                               <CheckCircle2 size={16} /> Registered
                             </div>
                             <button
                               onClick={() => setShowQR(showQR === se.id ? null : se.id)}
                               className="text-xs font-medium bg-white text-emerald-700 border border-emerald-200 w-full py-1.5 rounded-lg hover:bg-emerald-100 transition-colors"
                             >
                               {showQR === se.id ? 'Hide Ticket' : 'View Ticket'}
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

                      {/* Display Ticket dynamically for this specific sub-event */}
                      {showQR === se.id && isRegistered && (
                        <div className="w-full mt-5 pt-5 border-t border-gray-100 flex flex-col items-center basis-full">
                          
                          {/* The Ticket Element */}
                          <div 
                            id={`ticket-${se.id}`} 
                            style={{ 
                              position: 'relative',
                              overflow: 'hidden',
                              display: 'flex',
                              flexDirection: 'column',
                              width: '100%',
                              maxWidth: '384px',
                              userSelect: 'none',
                              backgroundColor: '#ffffff', 
                              border: '2px solid #06b6d4',
                              borderRadius: '12px',
                              padding: '24px',
                              textAlign: 'left',
                              color: '#111827',
                              fontFamily: 'Inter, sans-serif',
                              boxSizing: 'border-box'
                            }}
                          >
                            <div 
                              style={{ 
                                position: 'absolute',
                                top: '0',
                                right: '0',
                                fontSize: '10px',
                                fontWeight: 'bold',
                                padding: '4px 12px',
                                borderBottomLeftRadius: '12px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                backgroundColor: '#06b6d4', 
                                color: '#ffffff' 
                              }}
                            >
                              Valid Ticket
                            </div>
                            <div 
                              style={{ 
                                paddingBottom: '16px',
                                marginBottom: '16px',
                                marginTop: '8px',
                                borderBottom: '1px solid #f3f4f6' 
                              }}
                            >
                              <h4 
                                style={{ 
                                  fontSize: '20px',
                                  fontFamily: 'Lora, serif',
                                  fontStyle: 'italic',
                                  lineHeight: '1.25',
                                  marginBottom: '4px',
                                  color: '#111827',
                                  margin: '0 0 4px 0'
                                }}
                              >
                                {event.title}
                              </h4>
                              <p 
                                style={{ 
                                  fontSize: '12px',
                                  fontWeight: 'bold',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.025em',
                                  color: '#0e7490',
                                  margin: '0'
                                }}
                              >
                                {se.name}
                              </p>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                              <div style={{ flex: 1 }}>
                                <p 
                                  style={{ 
                                    fontSize: '10px',
                                    fontWeight: '600',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    marginBottom: '4px',
                                    color: '#9ca3af',
                                    margin: '0 0 4px 0'
                                  }}
                                >
                                  Registration ID
                                </p>
                                <p 
                                  style={{ 
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    fontFamily: 'monospace',
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    display: 'inline-block',
                                    color: '#1f2937', 
                                    backgroundColor: '#f9fafb', 
                                    border: '1px solid #f3f4f6',
                                    margin: '0'
                                  }}
                                >
                                  REG-{regId}
                                </p>
                              </div>
                              <div style={{ flex: 1 }}>
                                <p 
                                  style={{ 
                                    fontSize: '10px',
                                    fontWeight: '600',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    marginBottom: '4px',
                                    color: '#9ca3af',
                                    margin: '0 0 4px 0'
                                  }}
                                >
                                  Date
                                </p>
                                <p 
                                  style={{ 
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#1f2937',
                                    margin: '0'
                                  }}
                                >
                                  {date.toLocaleDateString('en-IN')}
                                </p>
                              </div>
                            </div>
                          
                            <div 
                              style={{ 
                                marginTop: 'auto',
                                paddingTop: '16px',
                                borderTop: '1px dashed #e5e7eb' 
                              }}
                            >
                              <p 
                                style={{ 
                                  fontSize: '10px',
                                  fontWeight: '600',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.05em',
                                  marginBottom: '4px',
                                  color: '#9ca3af',
                                  margin: '0 0 4px 0'
                                }}
                              >
                                Participant
                              </p>
                              <p 
                                style={{ 
                                  fontSize: '16px',
                                  fontWeight: 'bold',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  color: '#111827',
                                  margin: '0'
                                }}
                              >
                                <User size={16} color="#9ca3af" style={{ flexShrink: 0 }} />
                                {user.name}
                              </p>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-3 mt-5">
                            <button 
                              onClick={() => handleDownloadTicket(se.id)}
                              className="flex items-center gap-1.5 text-sm font-medium bg-gray-50 text-gray-700 border border-gray-200 py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors shadow-sm"
                            >
                              <Download size={16} className="text-cyan-600"/> Download
                            </button>
                            <button 
                              onClick={() => handlePrintTicket(se.id)}
                              className="flex items-center gap-1.5 text-sm font-medium bg-gray-50 text-gray-700 border border-gray-200 py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors shadow-sm"
                            >
                              <Printer size={16} className="text-cyan-600"/> Print
                            </button>
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
