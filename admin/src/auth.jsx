import React, { createContext, useContext, useMemo, useState } from 'react';
import api from './api';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('st_admin_user') || 'null');
    } catch {
      return null;
    }
  });

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.user?.role !== 'admin') {
      throw new Error('Esta conta não tem permissões de administrador.');
    }
    localStorage.setItem('st_admin_token', data.accessToken);
    if (data.refreshToken) localStorage.setItem('st_admin_refresh', data.refreshToken);
    localStorage.setItem('st_admin_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('st_admin_token');
    localStorage.removeItem('st_admin_refresh');
    localStorage.removeItem('st_admin_user');
    setUser(null);
  };

  const value = useMemo(() => ({ user, login, logout, isAdmin: user?.role === 'admin' }), [user]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth outside provider');
  return ctx;
}
