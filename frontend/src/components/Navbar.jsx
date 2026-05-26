import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/tasks', label: 'Tasks' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/dashboard" className="font-bold text-blue-600 text-lg tracking-tight">
          MyApp
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === to
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* User menu */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 hidden sm:block">{user?.name}</span>
          <button
            onClick={logout}
            className="btn-secondary text-xs px-3 py-1.5"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
