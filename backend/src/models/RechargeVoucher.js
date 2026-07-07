const mongoose = require('mongoose');
const { toKz } = require('../utils/money');

/**
 * Voucher de recarga. Gerado pelo administrador com um valor fixo.
 * O utilizador insere o código para creditar o saldo (uso único).
 */
const rechargeVoucherSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    amountCents: { type: Number, required: true, min: 1 },
    status: { type: String, enum: ['active', 'redeemed'], default: 'active', index: true },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    batchId: { type: String, default: null },

    redeemedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    redeemedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

rechargeVoucherSchema.methods.toJSON = function toJSON() {
  return {
    id: this._id.toString(),
    code: this.code,
    amount: toKz(this.amountCents),
    amountCents: this.amountCents,
    status: this.status,
    redeemedAt: this.redeemedAt,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('RechargeVoucher', rechargeVoucherSchema);
