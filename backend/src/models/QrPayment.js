const mongoose = require('mongoose');
const { toKz } = require('../utils/money');

const qrPaymentSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, index: true },
    // Quem RECEBE (normalmente o motorista)
    payeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    payeeName: { type: String, default: '' },
    amountCents: { type: Number, required: true, min: 1 },
    description: { type: String, default: 'Pagamento de corrida' },
    status: { type: String, enum: ['active', 'paid', 'expired'], default: 'active' },
    paidById: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

qrPaymentSchema.methods.toJSON = function toJSON() {
  return {
    code: this.code,
    payeeId: this.payeeId?.toString(),
    payeeName: this.payeeName,
    amount: toKz(this.amountCents),
    amountCents: this.amountCents,
    description: this.description,
    status: this.status,
    expiresAt: this.expiresAt,
  };
};

module.exports = mongoose.model('QrPayment', qrPaymentSchema);
