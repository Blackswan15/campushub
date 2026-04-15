import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate('/');
  };

  const roleLinks = {
    admin: [
      { to: '/dashboard', label: 'Dashboard' },
      { to: '/admin', label: 'Admin Panel' },
    ],
    organizer: [
      { to: '/dashboard', label: 'Dashboard' },
      { to: '/organizer', label: 'My Events' },
    ],
    student: [
      { to: '/dashboard', label: 'Explore' },
      { to: '/my-events', label: 'My Registrations' },
    ],
    pending_org: [
      { to: '/dashboard', label: 'Explore' },
      { to: '/organizer', label: 'Register Club ' },
    ],
  };

  const links = user ? (roleLinks[user.role] || roleLinks.student) : [];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm relative">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex justify-between items-center h-12">
          
          {/* Left Section: Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <span className="text-xl font-serif-italic text-gray-800 tracking-wide">CampusHub</span>
          </Link>

          {/* Center Section: Nav Links */}
          <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2 h-full">
            {links.map((l) => {
              const isActive = location.pathname === l.to;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`relative font-medium h-full flex items-center transition-all duration-200 ${
                    isActive ? 'text-cyan-600' : 'text-gray-600 hover:text-cyan-600 border-b-2 border-transparent hover:border-cyan-200'
                  }`}
                  style={!isActive ? { paddingBottom: '2px', borderBottomColor: 'transparent' } : {}}
                >
                  {l.label}
                  {isActive && (
                    <span className="absolute bottom-[-13px] left-0 w-full h-[2px] bg-cyan-600 rounded-t-sm"></span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Section: Auth & Profile */}
          <div className="hidden md:flex items-center gap-4 shrink-0">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 border-r border-gray-200 pr-4">
                  <p className="text-sm font-medium text-gray-800 truncate max-w-[140px]" title={user.name}>
                    {user.name}
                  </p>
                  <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-1 rounded-full font-medium capitalize whitespace-nowrap">
                    {user.role.replace('_', ' ')}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="border border-cyan-500 text-cyan-600 px-4 py-1.5 rounded-lg hover:bg-cyan-500 hover:text-white transition-all duration-200 text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-cyan-600 font-medium transition-colors text-sm">
                  Login
                </Link>
                <Link to="/signup" className="btn-primary text-sm py-2 px-5 shadow-sm">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center shrink-0">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-cyan-600 focus:outline-none"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 shadow-lg absolute w-full left-0">
          <div className="flex flex-col gap-4">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setIsMenuOpen(false)}
                className={`font-medium py-1 ${
                  location.pathname === l.to ? 'text-cyan-600 border-l-2 border-cyan-600 pl-2' : 'text-gray-600 pl-2 hover:text-cyan-600'
                }`}
              >
                {l.label}
              </Link>
            ))}
            {user ? (
              <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
                <div className="flex items-center gap-2 px-2">
                  <span className="text-sm font-medium text-gray-800">{user.name}</span>
                  <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-1 rounded-full capitalize">
                    {user.role.replace('_', ' ')}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-center border border-cyan-500 text-cyan-600 px-4 py-2 rounded-lg hover:bg-cyan-500 hover:text-white transition-all font-medium text-sm mt-2"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="pt-4 border-t border-gray-100 flex flex-col gap-3 px-2">
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="text-gray-600 font-medium pb-2">
                  Login
                </Link>
                <Link to="/signup" onClick={() => setIsMenuOpen(false)} className="btn-primary text-center py-2">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
