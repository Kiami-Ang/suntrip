import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config';

let socket = null;

export function connectSocket(token) {
  if (!token) return null;
  disconnectSocket();
  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    timeout: 8000,
  });
  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function emitHeartbeat() {
  socket?.emit('heartbeat');
}
