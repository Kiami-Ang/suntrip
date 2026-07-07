const mongoose = require('mongoose');

const qrPaymentSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 1 },
    description: { type: String, default: 'Pagamento SunTrip' },
    status: { type: String, enum: ['active', 'paid', 'expired'], default: 'active' },
    paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('QrPayment', qrPaymentSchema);
