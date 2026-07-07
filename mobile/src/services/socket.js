import { io } from 'socket.io-client';
import config from '../config';
import storage from './storage';

let socket = null;

export async function connectSocket() {
  if (socket?.connected) return socket;
  const token = await storage.getAccessToken();
  if (!token) return null;

  socket = io(config.socketUrl, {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
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
