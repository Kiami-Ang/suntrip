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

  keepAwake();
}

// Impede o servidor gratuito (Render) de adormecer: faz um pedido a si próprio
// a cada 14 min (abaixo dos 15 min de inatividade que causam o "sleep").
function keepAwake() {
  const url = process.env.RENDER_EXTERNAL_URL;
  if (!url) return; // só em produção no Render
  const ping = () => {
    fetch(`${url}/api/health`)
      .then(() => console.log('[keepAwake] ping ok'))
      .catch(() => {});
  };
  setInterval(ping, 14 * 60 * 1000);
}

start().catch((err) => {
  console.error('[server] Falha ao arrancar:', err);
  process.exit(1);
});
