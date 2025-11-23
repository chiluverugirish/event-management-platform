import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Navigation Bar Component
 */
const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">E</span>
            </div>
            <span className="text-xl font-bold text-gray-900">EventHub</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/events" className="text-gray-600 hover:text-primary-600 transition-colors">
              Events
            </Link>
            {user && (
              <>
                {user.role === 'admin' && (
                  <Link to="/admin/dashboard" className="text-gray-600 hover:text-primary-600 transition-colors">
                    👑 Admin Panel
                  </Link>
                )}
                {user.role === 'organizer' && (
                  <>
                    <Link to="/organizer/dashboard" className="text-gray-600 hover:text-primary-600 transition-colors">
                      🎪 My Events
                    </Link>
                    <Link to="/organizer/create-event" className="text-gray-600 hover:text-primary-600 transition-colors">
                      ➕ Create Event
                    </Link>
                  </>
                )}
                {user.role === 'attendee' && (
                  <>
                    <Link to="/dashboard" className="text-gray-600 hover:text-primary-600 transition-colors">
                      Dashboard
                    </Link>
                    <Link to="/my-tickets" className="text-gray-600 hover:text-primary-600 transition-colors">
                      My Tickets
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 hidden sm:block">
                  Hi, <span className="font-semibold">{user.name || 'User'}</span>
                  {user.role && (
                    <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">
                      {user.role}
                    </span>
                  )}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 rounded-lg transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
