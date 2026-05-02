import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    const token = localStorage.getItem('empay_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/auth/me');
      // Backend returns { success, data: { user } }
      setUser(response.data.data.user);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      // Only clear token on 401, not on network errors
      if (error.response?.status === 401) {
        localStorage.removeItem('empay_token');
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    // Backend returns { success, data: { user, token } }
    const { token, user } = response.data.data;
    localStorage.setItem('empay_token', token);
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('empay_token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    fetchCurrentUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
