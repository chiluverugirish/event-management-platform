import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, getCurrentUser } from '../services/authService';
import Loader from '../components/Loader';

/**
 * Protected Route Component
 * Redirects to login if user is not authenticated
 * Supports role-based access control
 */
const ProtectedRoute = ({ children, requiredRole }) => {
  const [loading, setLoading] = React.useState(true);
  const authenticated = isAuthenticated();
  const user = getCurrentUser();

  React.useEffect(() => {
    // Small delay to check authentication
    setTimeout(() => setLoading(false), 100);
  }, []);

  if (loading) {
    return <Loader fullScreen />;
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access
  if (requiredRole) {
    if (!user || user.role !== requiredRole) {
      // Redirect to appropriate dashboard based on actual role
      if (user?.role === 'admin') {
        return <Navigate to="/admin/dashboard" replace />;
      } else if (user?.role === 'organizer') {
        return <Navigate to="/organizer/dashboard" replace />;
      } else {
        return <Navigate to="/dashboard" replace />;
      }
    }
  }

  return children;
};

export default ProtectedRoute;
