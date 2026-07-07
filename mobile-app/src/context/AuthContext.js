import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from '../services/api';
import { clearSession, getToken, getUser, saveSession } from '../services/storage';
import { connectSocket, disconnectSocket } from '../services/socket';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const applySession = useCallback((data) => {
    setUser(data.user);
    connectSocket(data.token);
    return data;
  }, []);

  const refreshUser = useCallback(async () => {
    const token = await getToken();
    if (!token) {
      setUser(null);
      return;
    }
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
      await saveSession({ token, user: data.user });
      connectSocket(token);
    } catch (err) {
      if (err.response?.status === 401) {
        await clearSession();
        disconnectSocket();
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    (async () => {
      const stored = await getUser();
      const token = await getToken();
      if (stored) setUser(stored);
      if (token) {
        connectSocket(token);
        await refreshUser();
      }
      setLoading(false);
    })();
  }, [refreshUser]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    await saveSession(data);
    return applySession(data);
  };

  const registerClient = async (payload) => {
    const { data } = await api.post('/auth/register/client', payload);
    await saveSession(data);
    return applySession(data);
  };

  const registerDriver = async (payload) => {
    const { data } = await api.post('/auth/register/driver', payload);
    await saveSession(data);
    return applySession(data);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      /* ignore */
    }
    await clearSession();
    disconnectSocket();
    setUser(null);
  };

  const updateUser = useCallback(async (u) => {
    setUser(u);
    const token = await getToken();
    if (token) await saveSession({ token, user: u });
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
        isDriver: user?.userType === 'driver',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth dentro de AuthProvider');
  return ctx;
}
