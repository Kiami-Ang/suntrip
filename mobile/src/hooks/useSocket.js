import { useEffect, useRef, useState } from 'react';
import { connectSocket, getSocket } from '../services/socket';

/**
 * Liga aos eventos do Socket.io.
 * onReceived: callback quando o utilizador recebe dinheiro.
 */
export function useSocket({ onReceived } = {}) {
  const [onlineCount, setOnlineCount] = useState(0);
  const cbRef = useRef(onReceived);
  cbRef.current = onReceived;

  useEffect(() => {
    let socket;
    let mounted = true;

    (async () => {
      socket = await connectSocket();
      if (!socket || !mounted) return;

      const handleOnline = (count) => setOnlineCount(count);
      const handleReceived = (data) => cbRef.current?.(data);

      socket.on('online:count', handleOnline);
      socket.on('wallet:received', handleReceived);

      socket._suntripCleanup = () => {
        socket.off('online:count', handleOnline);
        socket.off('wallet:received', handleReceived);
      };
    })();

    return () => {
      mounted = false;
      const s = getSocket();
      s?._suntripCleanup?.();
    };
  }, []);

  return { onlineCount };
}

export default useSocket;
