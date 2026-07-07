require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/db');

async function seed() {
  await connectDB();

  const accounts = [
    {
      name: 'Admin SunTrip',
      email: 'admin@gmail.com',
      phone: '900000001',
      password: 'admin123',
      role: 'admin',
      userType: 'client',
    },
    {
      name: 'Maria Cliente',
      email: 'cliente@gmail.com',
      phone: '923456789',
      password: 'demo123',
      role: 'user',
      userType: 'client',
      bankAccount: 'AO06000000000000000000',
      address: 'Luanda, Talatona',
    },
    {
      name: 'João Motorista',
      email: 'motorista@gmail.com',
      phone: '912345678',
      password: 'demo123',
      role: 'user',
      userType: 'driver',
      bankAccount: 'AO06000000000000000001',
      driverLicense: 'CC-123456',
      vehiclePlate: 'LD-45-23-AB',
      idDocument: 'BI 123456789LA045',
    },
  ];

  for (const acc of accounts) {
    const exists = await User.findOne({ email: acc.email });
    if (!exists) {
      await User.create(acc);
      console.log('Criado:', acc.email, '/', acc.password, `(${acc.userType || acc.role})`);
    } else {
      console.log('Já existe:', acc.email);
    }
  }

  await mongoose.disconnect();
  console.log('Seed concluído');
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
