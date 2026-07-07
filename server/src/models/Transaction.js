const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['deposit', 'transfer', 'qr_payment', 'qr_receive', 'bank_transfer'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled'],
      default: 'pending',
    },
    amount: { type: Number, required: true, min: 0 },
    description: { type: String, default: '' },
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    recipientName: { type: String, default: '' },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

transactionSchema.methods.toJSON = function () {
  const obj = this.toObject();
  return {
    id: obj._id.toString(),
    userId: obj.userId?.toString(),
    type: obj.type,
    status: obj.status,
    amount: obj.amount,
    description: obj.description,
    recipientId: obj.recipientId?.toString(),
    recipientName: obj.recipientName,
    metadata: obj.metadata,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
  };
};

module.exports = mongoose.model('Transaction', transactionSchema);
