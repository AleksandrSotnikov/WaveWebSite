import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Navbar() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="text-2xl font-bold">
            🌊 Wave Studio
          </Link>

          {/* Navigation Links */}
          <div className="flex space-x-6">
            <Link to="/dashboard" className="hover:bg-blue-700 px-3 py-2 rounded transition">
              📊 Dashboard
            </Link>
            <Link to="/clients" className="hover:bg-blue-700 px-3 py-2 rounded transition">
              👥 Clients
            </Link>
            <Link to="/trainers" className="hover:bg-blue-700 px-3 py-2 rounded transition">
              🧑‍🏫 Trainers
            </Link>
            <Link to="/subscriptions" className="hover:bg-blue-700 px-3 py-2 rounded transition">
              🎫 Subscriptions
            </Link>
            <Link to="/schedule" className="hover:bg-blue-700 px-3 py-2 rounded transition">
              📅 Schedule
            </Link>
            <Link to="/reports" className="hover:bg-blue-700 px-3 py-2 rounded transition">
              📈 Reports
            </Link>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition font-semibold"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
