'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { getSocket, disconnectSocket } from '@/lib/socket';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('suntrip_token');
    if (!token) {
      setUser(null);
      return;
    }
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
      localStorage.setItem('suntrip_user', JSON.stringify(data.user));
      getSocket(token);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('suntrip_token');
        localStorage.removeItem('suntrip_user');
        setUser(null);
        disconnectSocket();
      }
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('suntrip_token');
    const stored = localStorage.getItem('suntrip_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        /* ignore */
      }
    }
    if (!token) {
      setLoading(false);
      return;
    }
    refreshUser().finally(() => setLoading(false));
  }, [refreshUser]);

  const saveSession = (data) => {
    localStorage.setItem('suntrip_token', data.token);
    localStorage.setItem('suntrip_user', JSON.stringify(data.user));
    setUser(data.user);
    getSocket(data.token);
    return data;
  };

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    return saveSession(data);
  };

  const registerClient = async (payload) => {
    const { data } = await api.post('/auth/register/client', payload);
    return saveSession(data);
  };

  const registerDriver = async (formData) => {
    const { data } = await api.post('/auth/register/driver', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return saveSession(data);
  };

  const logout = () => {
    localStorage.removeItem('suntrip_token');
    localStorage.removeItem('suntrip_user');
    setUser(null);
    disconnectSocket();
  };

  const updateUser = useCallback((u) => {
    setUser(u);
    localStorage.setItem('suntrip_user', JSON.stringify(u));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        registerClient,
        registerDriver,
        logout,
        refreshUser,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
