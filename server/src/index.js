require('dotenv').config();
const http = require('http');
const path = require('path');
const os = require('os');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const connectDB = require('./config/db');
const User = require('./models/User');
const { setUserOnline, setUserOffline, getOnlineUsers } = require('./socket/online');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const walletRoutes = require('./routes/wallet');
const qrRoutes = require('./routes/qr');
const bankRoutes = require('./routes/bank');
const transactionRoutes = require('./routes/transactions');
const adminRoutes = require('./routes/admin');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const server = http.createServer(app);

const isDev = process.env.NODE_ENV !== 'production';

const corsOrigin = (_origin, callback) => {
  callback(null, true);
};

const io = new Server(server, {
  cors: { origin: isDev ? true : corsOrigin, methods: ['GET', 'POST'] },
});

app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads')));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'SunTrip API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/bank', bankRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/dashboard', dashboardRoutes);

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Unauthorized'));
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return next(new Error('Unauthorized'));
    socket.userId = user._id.toString();
    socket.userData = { name: user.name, avatar: user.avatar, email: user.email };
    next();
  } catch {
    next(new Error('Unauthorized'));
  }
});

io.on('connection', (socket) => {
  setUserOnline(socket.userId, socket.userData);
  io.emit('online:update', getOnlineUsers());

  socket.on('heartbeat', () => {
    setUserOnline(socket.userId, socket.userData);
    io.emit('online:update', getOnlineUsers());
  });

  socket.on('disconnect', () => {
    setUserOffline(socket.userId);
    io.emit('online:update', getOnlineUsers());
  });
});

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

function getLocalIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === 'IPv4' && !net.internal) return net.address;
    }
  }
  return 'localhost';
}

connectDB()
  .then(() => {
    server.listen(PORT, HOST, () => {
      const ip = getLocalIp();
      console.log('');
      console.log('  SunTrip API a correr');
      console.log(`  Local:   http://localhost:${PORT}`);
      console.log(`  Rede:    http://${ip}:${PORT}`);
      console.log(`  Site:    http://${ip}:3000  (nos outros dispositivos)`);
      console.log('');
    });
  })
  .catch((err) => {
    console.error('Falha ao conectar MongoDB:', err.message);
    process.exit(1);
  });

module.exports = { app, io };
