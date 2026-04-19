import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import EventCard from '../components/EventCard';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('departments');
  const [departments, setDepartments] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [loadingEvents, setLoadingEvents] = useState(false);

  useEffect(() => {
    api.get('/departments').then(({ data }) => setDepartments(data));
    api.get('/clubs').then(({ data }) => setClubs(data));
  }, []);

  const handleSelect = async (id, type) => {
    setSelectedId(id);
    setLoadingEvents(true);
    try {
      const { data } = await api.get('/events', { params: { type, ref_id: id } });
      setEvents(data);
    } catch {
      toast.error('Failed to load events.');
    } finally {
      setLoadingEvents(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setSelectedId(null);
    setLoadingEvents(true);
    try {
      const { data } = await api.get('/events', { params: { search } });
      setEvents(data);
    } catch {
      toast.error('Search failed.');
    } finally {
      setLoadingEvents(false);
    }
  };

  const currentList = activeTab === 'departments' ? departments : clubs;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif-italic text-gray-900">Explore Events</h1>
          <p className="text-gray-500 mt-1">Browse events by department or club</p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-3 mb-8">
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field flex-1 max-w-md"
          />
          <button type="submit" className="btn-primary px-6">Search</button>
          {search && (
            <button
              type="button"
              onClick={() => { setSearch(''); setEvents([]); setSelectedId(null); }}
              className="btn-secondary px-4"
            >
              Clear
            </button>
          )}
        </form>

        <div className="flex gap-2 mb-6">
          {['departments', 'clubs'].map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setSelectedId(null); setEvents([]); }}
              className={`px-5 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-cyan-500 text-white shadow-md shadow-cyan-200'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-cyan-400'
              }`}
            >
              {tab === 'departments' ? ' Departments' : ' Clubs'}
            </button>
          ))}
        </div>

        {!selectedId && !search ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {currentList.length === 0 ? (
              <p className="col-span-full text-center text-gray-400 py-10">Nothing found.</p>
            ) : (
              currentList.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item.id, activeTab === 'departments' ? 'department' : 'club')}
                  className="card p-0 overflow-hidden cursor-pointer hover:scale-[1.03] hover:shadow-xl hover:shadow-cyan-100 transition-all duration-300 bg-white"
                >
                  <div className="bg-gray-100 h-40 w-full overflow-hidden border-b border-gray-100">
                    <img
                      src={item.image_url || (activeTab === 'departments' 
                        ? 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80' 
                        : 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=600&q=80')}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-gray-800 text-lg leading-snug">{item.name}</h3>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div>
            {!search && (
              <div className="mb-6 flex items-center justify-between bg-white px-5 py-3 rounded-2xl shadow-sm border border-gray-100">
                <button 
                  onClick={() => { setSelectedId(null); setEvents([]); }}
                  className="text-cyan-600 hover:text-cyan-800 font-medium flex items-center gap-2 transition-colors px-3 py-1.5 rounded-lg hover:bg-cyan-50"
                >
                  <span>←</span> Back to {activeTab === 'departments' ? 'Departments' : 'Clubs'}
                </button>
                <h2 className="text-lg font-serif-italic font-medium text-gray-800">
                  {currentList.find(i => i.id === selectedId)?.name} Events
                </h2>
              </div>
            )}
            
            {loadingEvents ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-20 text-gray-400 bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="text-5xl mb-4"></div>
                <p>No events found for this selection.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
