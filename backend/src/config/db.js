const mongoose = require('mongoose');
const env = require('./env');

mongoose.set('strictQuery', true);

async function connectDB() {
  try {
    await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('[db] MongoDB ligado');
  } catch (err) {
    console.error('[db] Falha ao ligar ao MongoDB:', err.message);
    process.exit(1);
  }

  mongoose.connection.on('disconnected', () => {
    console.warn('[db] MongoDB desligado');
  });
}

module.exports = connectDB;
