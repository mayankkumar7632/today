// KaamSetu - Authentication Context
// This file manages user authentication state across the application

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

// Create the context
const AuthContext = createContext(null);

// Auth Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in when app loads
  useEffect(() => {
    const token = localStorage.getItem('kaamsetu_token');
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  // Load user data from server
  const loadUser = async () => {
    try {
      const response = await authAPI.getMe();
      setUser(response.data);
    } catch (err) {
      // Token is invalid or expired
      localStorage.removeItem('kaamsetu_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Register new user
  const register = async (userData) => {
    try {
      setError(null);
      const response = await authAPI.register(userData);
      localStorage.setItem('kaamsetu_token', response.token);
      setUser(response.user);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Login user
  const login = async (credentials) => {
    try {
      setError(null);
      const response = await authAPI.login(credentials);
      localStorage.setItem('kaamsetu_token', response.token);
      setUser(response.user);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('kaamsetu_token');
    setUser(null);
  };

  // Update the signed-in user's details after a profile save.
  const updateUser = (userUpdates) => {
    setUser((currentUser) => currentUser ? { ...currentUser, ...userUpdates } : currentUser);
  };

  // Clear error
  const clearError = () => setError(null);

  // Value provided to child components
  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    updateUser,
    clearError,
    loadUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
