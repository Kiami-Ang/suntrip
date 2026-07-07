const http = require('http');
const app = require('./app');
const env = require('./config/env');
const connectDB = require('./config/db');
const { initSocket } = require('./socket');

async function start() {
  await connectDB();

  const server = http.createServer(app);
  initSocket(server);

  server.listen(env.port, () => {
    console.log(`[server] SunTrip API a correr na porta ${env.port} (${env.nodeEnv})`);
  });
}

start().catch((err) => {
  console.error('[server] Falha ao arrancar:', err);
  process.exit(1);
});
