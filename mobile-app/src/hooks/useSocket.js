import { useEffect, useState } from 'react';
import { emitHeartbeat, getSocket } from '../services/socket';
import { useAuth } from '../context/AuthContext';

export function useOnlineUsers() {
  const { user } = useAuth();
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    if (!user) return undefined;
    const socket = getSocket();
    if (!socket) return undefined;

    const onUpdate = (users) => {
      setOnlineCount(Array.isArray(users) ? users.length : 0);
    };

    socket.on('online:update', onUpdate);
    emitHeartbeat();

    const interval = setInterval(emitHeartbeat, 30000);

    return () => {
      socket.off('online:update', onUpdate);
      clearInterval(interval);
    };
  }, [user]);

  return onlineCount;
}
