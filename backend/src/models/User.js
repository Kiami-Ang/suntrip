const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { toKz } = require('../utils/money');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },

    passwordHash: { type: String, required: true },
    // PIN de 4-6 dígitos para confirmar pagamentos (definido após o registo)
    pinHash: { type: String, default: null },

    userType: { type: String, enum: ['client', 'driver', 'business'], default: 'client' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    status: { type: String, enum: ['active', 'blocked'], default: 'active' },

    // Verificação de email real (código de 6 dígitos enviado por email)
    emailVerified: { type: Boolean, default: false },
    emailVerifyCode: { type: String, default: null },
    emailVerifyExpires: { type: Date, default: null },

    // Recuperação de palavra-passe
    resetCode: { type: String, default: null },
    resetExpires: { type: Date, default: null },

    // Saldo em CÊNTIMOS (inteiro). Nunca negativo.
    balanceCents: { type: Number, default: 0, min: 0 },

    avatar: { type: String, default: '' },

    // Dados de cliente
    bankAccount: { type: String, default: '' },
    address: { type: String, default: '' },

    // Dados de motorista
    driverLicense: { type: String, default: '' },
    vehiclePlate: { type: String, default: '' },
    idDocument: { type: String, default: '' },
    professionalNotes: { type: String, default: '' },

    // Dados de entidade comercial (negócio/loja)
    businessName: { type: String, default: '' },
    businessNif: { type: String, default: '' },
    businessCategory: { type: String, default: '' },

    lastActiveAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

userSchema.methods.setPassword = async function setPassword(password) {
  this.passwordHash = await bcrypt.hash(password, 12);
};

userSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.methods.setPin = async function setPin(pin) {
  this.pinHash = await bcrypt.hash(String(pin), 10);
};

userSchema.methods.comparePin = function comparePin(pin) {
  if (!this.pinHash) return Promise.resolve(false);
  return bcrypt.compare(String(pin), this.pinHash);
};

// Gera um código de verificação de email (6 dígitos, válido 30 min)
userSchema.methods.generateEmailCode = function generateEmailCode() {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  this.emailVerifyCode = code;
  this.emailVerifyExpires = new Date(Date.now() + 30 * 60 * 1000);
  this.emailVerified = false;
  return code;
};

// Gera um código de recuperação de palavra-passe (6 dígitos, válido 30 min)
userSchema.methods.generateResetCode = function generateResetCode() {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  this.resetCode = code;
  this.resetExpires = new Date(Date.now() + 30 * 60 * 1000);
  return code;
};

userSchema.methods.toPublic = function toPublic() {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    phone: this.phone,
    userType: this.userType,
    role: this.role,
    status: this.status,
    balance: toKz(this.balanceCents),
    balanceCents: this.balanceCents,
    hasPin: Boolean(this.pinHash),
    emailVerified: this.emailVerified,
    avatar: this.avatar,
    bankAccount: this.bankAccount,
    address: this.address,
    driverLicense: this.driverLicense,
    vehiclePlate: this.vehiclePlate,
    idDocument: this.idDocument,
    professionalNotes: this.professionalNotes,
    businessName: this.businessName,
    businessNif: this.businessNif,
    businessCategory: this.businessCategory,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);
