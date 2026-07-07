const { randomUUID } = require('crypto');
const mongoose = require('mongoose');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { AppError } = require('../middleware/error');

/** Se `reference` já foi usada, devolve a transação existente (idempotência). */
async function findByReference(reference) {
  if (!reference) return null;
  return Transaction.findOne({ reference });
}

/**
 * Depósito (carregar saldo). Crédito + registo dentro de uma transação.
 */
async function deposit(user, amountCents, { description = 'Carregamento de saldo', reference } = {}) {
  if (reference) {
    const existing = await findByReference(reference);
    if (existing) {
      const fresh = await User.findById(user._id);
      return { transaction: existing, balanceCents: fresh.balanceCents };
    }
  }

  const session = await mongoose.startSession();
  try {
    let out;
    await session.withTransaction(async () => {
      const updated = await User.findByIdAndUpdate(
        user._id,
        { $inc: { balanceCents: amountCents } },
        { new: true, session }
      );

      const doc = {
        userId: user._id,
        type: 'deposit',
        direction: 'credit',
        amountCents,
        balanceAfterCents: updated.balanceCents,
        status: 'completed',
        description,
      };
      if (reference) doc.reference = reference;

      const [tx] = await Transaction.create([doc], { session });
      out = { transaction: tx, balanceCents: updated.balanceCents };
    });
    return out;
  } finally {
    session.endSession();
  }
}

/**
 * Transferência / pagamento entre utilizadores — atómico (tudo-ou-nada).
 * type: 'transfer' (P2P) ou 'qr_payment' (pagamento de corrida).
 */
async function transfer({ sender, recipientId, amountCents, type = 'transfer', description, reference }) {
  if (String(sender._id) === String(recipientId)) {
    throw new AppError('Não pode transferir para si próprio', 400);
  }

  if (reference) {
    const existing = await Transaction.findOne({ reference });
    if (existing) {
      const fresh = await User.findById(sender._id);
      return { debit: existing, balanceCents: fresh.balanceCents, duplicated: true };
    }
  }

  const session = await mongoose.startSession();
  try {
    let out;
    await session.withTransaction(async () => {
      // Débito atómico do remetente (só desconta com saldo suficiente)
      const debited = await User.findOneAndUpdate(
        { _id: sender._id, balanceCents: { $gte: amountCents }, status: 'active' },
        { $inc: { balanceCents: -amountCents } },
        { new: true, session }
      );
      if (!debited) throw new AppError('Saldo insuficiente', 400);

      // Crédito ao destinatário
      const recipient = await User.findOneAndUpdate(
        { _id: recipientId, status: { $ne: 'blocked' } },
        { $inc: { balanceCents: amountCents } },
        { new: true, session }
      );
      if (!recipient) throw new AppError('Destinatário indisponível', 400);

      const groupId = randomUUID();

      const debitDoc = {
        userId: sender._id,
        type,
        direction: 'debit',
        amountCents,
        balanceAfterCents: debited.balanceCents,
        status: 'completed',
        description:
          description ||
          (type === 'qr_payment' ? 'Pagamento de corrida' : `Transferência para ${recipient.name}`),
        counterpartyId: recipient._id,
        counterpartyName: recipient.name,
        groupId,
      };
      if (reference) debitDoc.reference = reference;

      const creditDoc = {
        userId: recipient._id,
        type,
        direction: 'credit',
        amountCents,
        balanceAfterCents: recipient.balanceCents,
        status: 'completed',
        description: `Recebido de ${sender.name}`,
        counterpartyId: sender._id,
        counterpartyName: sender.name,
        groupId,
      };

      const [debitTx] = await Transaction.create([debitDoc], { session });
      const [creditTx] = await Transaction.create([creditDoc], { session });

      out = { debit: debitTx, credit: creditTx, balanceCents: debited.balanceCents, recipient };
    });
    return out;
  } finally {
    session.endSession();
  }
}

module.exports = { deposit, transfer, findByReference };
