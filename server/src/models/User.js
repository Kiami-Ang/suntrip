const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    userType: { type: String, enum: ['client', 'driver', 'admin'], default: 'client' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    avatar: { type: String, default: '' },
    balance: { type: Number, default: 0, min: 0 },
    bankAccount: { type: String, default: '' },
    iban: { type: String, default: '' },
    address: { type: String, default: '' },
    driverLicense: { type: String, default: '' },
    vehiclePlate: { type: String, default: '' },
    idDocument: { type: String, default: '' },
    vehiclePhoto: { type: String, default: '' },
    professionalNotes: { type: String, default: '' },
    lastActive: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toPublic = function () {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    phone: this.phone,
    userType: this.userType,
    role: this.role,
    avatar: this.avatar,
    balance: this.balance,
    bankAccount: this.bankAccount,
    iban: this.iban,
    address: this.address,
    driverLicense: this.driverLicense,
    vehiclePlate: this.vehiclePlate,
    idDocument: this.idDocument,
    vehiclePhoto: this.vehiclePhoto,
    professionalNotes: this.professionalNotes,
  };
};

module.exports = mongoose.model('User', userSchema);
