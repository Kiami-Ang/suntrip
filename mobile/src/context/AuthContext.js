import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api, { setUnauthorizedHandler } from '../services/api';
import storage from '../services/storage';
import { connectSocket, disconnectSocket } from '../services/socket';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  const applySession = useCallback(async ({ user: u, accessToken, refreshToken }) => {
    if (accessToken) await storage.setTokens(accessToken, refreshToken);
    if (u) {
      await storage.setUser(u);
      setUser(u);
      connectSocket();
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignora — vamos limpar de qualquer forma
    }
    disconnectSocket();
    await storage.clear();
    setUser(null);
  }, []);

  // Sessão expirada de vez → força logout
  useEffect(() => {
    setUnauthorizedHandler(() => {
      disconnectSocket();
      setUser(null);
    });
  }, []);

  // Arranque: recupera sessão guardada e valida com o servidor
  useEffect(() => {
    (async () => {
      try {
        const stored = await storage.getUser();
        const token = await storage.getAccessToken();
        if (stored && token) {
          setUser(stored);
          connectSocket();
          try {
            const { data } = await api.get('/auth/me');
            setUser(data.user);
            await storage.setUser(data.user);
          } catch {
            // token pode ter expirado; interceptor trata
          }
        }
      } finally {
        setBooting(false);
      }
    })();
  }, []);

  const login = useCallback(
    async (email, password) => {
      const { data } = await api.post('/auth/login', { email, password });
      await applySession(data);
      return data.user;
    },
    [applySession]
  );

  const registerClient = useCallback(
    async (payload) => {
      const { data } = await api.post('/auth/register/client', payload);
      await applySession(data);
      return data.user;
    },
    [applySession]
  );

  const registerDriver = useCallback(
    async (payload) => {
      const { data } = await api.post('/auth/register/driver', payload);
      await applySession(data);
      return data.user;
    },
    [applySession]
  );

  const refreshUser = useCallback(async () => {
    const { data } = await api.get('/auth/me');
    setUser(data.user);
    await storage.setUser(data.user);
    return data.user;
  }, []);

  // Actualiza campos locais do utilizador (ex: saldo após operação)
  const patchUser = useCallback(async (patch) => {
    setUser((prev) => {
      const next = { ...prev, ...patch };
      storage.setUser(next);
      return next;
    });
  }, []);

  const value = {
    user,
    booting,
    isAuthenticated: !!user,
    login,
    registerClient,
    registerDriver,
    logout,
    refreshUser,
    patchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}

export default AuthContext;
