const mongoose = require('mongoose');
const { toKz } = require('../utils/money');

/**
 * Ledger de transações. Cada movimento gera uma entrada por utilizador
 * envolvido (débito e/ou crédito). Entradas ligadas partilham o mesmo `groupId`.
 * `reference` garante idempotência (impede pagamentos duplicados).
 */
const transactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    type: {
      type: String,
      enum: ['deposit', 'transfer', 'qr_payment', 'voucher'],
      required: true,
    },
    direction: { type: String, enum: ['credit', 'debit'], required: true },

    amountCents: { type: Number, required: true, min: 1 },
    // Saldo do utilizador imediatamente após o movimento (auditoria)
    balanceAfterCents: { type: Number, required: true, min: 0 },

    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'reversed'],
      default: 'completed',
    },

    description: { type: String, default: '' },

    counterpartyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    counterpartyName: { type: String, default: '' },

    // Liga as duas pontas de uma transferência / pagamento
    groupId: { type: String, index: true, default: null },
    // Chave de idempotência (única apenas quando é uma string presente)
    reference: { type: String },

    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

// Índice único parcial: só aplica a unicidade quando `reference` é uma string.
// (Evita colisões entre movimentos sem referência.)
transactionSchema.index(
  { reference: 1 },
  { unique: true, partialFilterExpression: { reference: { $type: 'string' } } }
);
transactionSchema.index({ userId: 1, createdAt: -1 });

transactionSchema.methods.toJSON = function toJSON() {
  return {
    id: this._id.toString(),
    type: this.type,
    direction: this.direction,
    amount: toKz(this.amountCents),
    amountCents: this.amountCents,
    balanceAfter: toKz(this.balanceAfterCents),
    status: this.status,
    description: this.description,
    counterpartyId: this.counterpartyId ? this.counterpartyId.toString() : null,
    counterpartyName: this.counterpartyName,
    groupId: this.groupId,
    reference: this.reference,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('Transaction', transactionSchema);
