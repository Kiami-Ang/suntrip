import { io } from 'socket.io-client';
import { getSocketUrl } from './config';

let socket = null;

export const getSocket = (token) => {
  if (!token) return null;
  if (!socket) {
    socket = io(getSocketUrl(), {
      auth: { token },
      autoConnect: true,
      reconnection: false,
      timeout: 4000,
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
