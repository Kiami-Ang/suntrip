require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const QrPayment = require('../models/QrPayment');

async function seed() {
  await connectDB();

  console.log('[seed] A recriar base de dados (limpa)...');
  await mongoose.connection.dropDatabase();

  // Recria os índices definidos nos modelos (inclui o índice parcial de reference)
  await Promise.all([User.syncIndexes(), Transaction.syncIndexes(), QrPayment.syncIndexes()]);

  const demo = [
    { name: 'Admin SunTrip', email: 'admin@gmail.com', phone: '923000000', userType: 'client', role: 'admin' },
    { name: 'Cliente Demo', email: 'cliente@gmail.com', phone: '923111111', userType: 'client' },
    {
      name: 'Motorista Demo',
      email: 'motorista@gmail.com',
      phone: '923222222',
      userType: 'driver',
      bankAccount: 'AO06000000000000000000000',
      driverLicense: 'AO-123456',
      vehiclePlate: 'LD-45-23-AB',
      idDocument: '000000000LA000',
    },
  ];

  for (const d of demo) {
    const user = new User(d);
    await user.setPassword('123456');
    await user.setPin('1234');
    await user.save();
    console.log(`[seed] Criado: ${d.email} (senha: 123456, PIN: 1234)`);
  }

  console.log('[seed] Concluído. Saldos começam a 0 Kz.');
  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error('[seed] Erro:', err);
  process.exit(1);
});
