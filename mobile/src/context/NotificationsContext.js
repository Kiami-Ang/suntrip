import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import { connectSocket, getSocket } from '../services/socket';
import { useAuth } from './AuthContext';

const NotificationsContext = createContext(null);

export function NotificationsProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.notifications || []);
      setUnread(data.unread || 0);
    } catch {
      // silencioso
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
    try {
      await api.post('/notifications/read-all');
    } catch {
      // silencioso
    }
  }, []);

  const markRead = useCallback(async (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnread((u) => Math.max(0, u - 1));
    try {
      await api.post(`/notifications/${id}/read`);
    } catch {
      // silencioso
    }
  }, []);

  // Carrega ao autenticar; limpa ao sair.
  useEffect(() => {
    if (isAuthenticated) {
      refresh();
    } else {
      setNotifications([]);
      setUnread(0);
    }
  }, [isAuthenticated, refresh]);

  // Escuta notificações em tempo real.
  const handlerRef = useRef();
  useEffect(() => {
    if (!isAuthenticated) return undefined;
    let socket;
    let mounted = true;

    const onNew = (n) => {
      setNotifications((prev) => [n, ...prev].slice(0, 50));
      setUnread((u) => u + 1);
    };
    handlerRef.current = onNew;

    (async () => {
      socket = await connectSocket();
      if (!socket || !mounted) return;
      socket.on('notification:new', onNew);
    })();

    return () => {
      mounted = false;
      const s = getSocket();
      s?.off?.('notification:new', handlerRef.current);
    };
  }, [isAuthenticated]);

  const value = { notifications, unread, loading, refresh, markAllRead, markRead };
  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications deve ser usado dentro de NotificationsProvider');
  return ctx;
}

export default NotificationsContext;
