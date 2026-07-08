require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

/**
 * Promove (ou despromove) uma conta a admin, pelo email. NÃO apaga dados.
 *
 * Uso:
 *   node src/scripts/make-admin.js <email>            -> torna admin
 *   node src/scripts/make-admin.js <email> user       -> volta a utilizador normal
 */
async function run() {
  const email = (process.argv[2] || '').trim().toLowerCase();
  const role = (process.argv[3] || 'admin').trim().toLowerCase();

  if (!email) {
    console.error('Falta o email. Ex: node src/scripts/make-admin.js exemplo@gmail.com');
    process.exit(1);
  }
  if (!['admin', 'user'].includes(role)) {
    console.error("O papel deve ser 'admin' ou 'user'.");
    process.exit(1);
  }

  await connectDB();

  const user = await User.findOne({ email });
  if (!user) {
    console.error(`Nenhuma conta encontrada com o email: ${email}`);
    await mongoose.connection.close();
    process.exit(1);
  }

  user.role = role;
  await user.save();

  console.log(`✔ ${user.name} (${email}) agora tem o papel: ${role}`);
  await mongoose.connection.close();
  process.exit(0);
}

run().catch(async (err) => {
  console.error('Erro:', err.message);
  process.exit(1);
});
