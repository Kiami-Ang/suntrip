const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const env = require('../config/env');

let io = null;
const online = new Set();

function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: env.corsOrigins.length ? env.corsOrigins : true, methods: ['GET', 'POST'] },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Unauthorized'));
      const decoded = jwt.verify(token, env.jwt.accessSecret);
      socket.userId = decoded.id;
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    online.add(socket.userId);
    socket.join(`user:${socket.userId}`);
    io.emit('online:count', online.size);

    socket.on('disconnect', () => {
      online.delete(socket.userId);
      io.emit('online:count', online.size);
    });
  });

  return io;
}

const getIO = () => io;
const getOnlineCount = () => online.size;

module.exports = { initSocket, getIO, getOnlineCount };
