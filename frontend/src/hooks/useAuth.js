import { useState, useEffect } from 'react';
import { getCurrentUser, isAuthenticated, logout as logoutService } from '../services/authService';

/**
 * Custom hook for authentication
 * Manages user state and authentication status
 */
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated on mount
    if (isAuthenticated()) {
      const currentUser = getCurrentUser();
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const logout = () => {
    logoutService();
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  return {
    user,
    loading,
    isAuthenticated: isAuthenticated(),
    logout,
    updateUser,
  };
};
