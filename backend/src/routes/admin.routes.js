const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const RechargeVoucher = require('../models/RechargeVoucher');
const AdminAuditLog = require('../models/AdminAuditLog');
const Notification = require('../models/Notification');
const { auth, adminOnly, asyncHandler } = require('../middleware/auth');
const { AppError } = require('../middleware/error');
const { parseAmountKz, toKz } = require('../utils/money');
const walletService = require('../services/wallet.service');
const { logAdminAction } = require('../services/admin.service');
const { notify } = require('../services/notification.service');
const { sendPasswordResetEmail, emailEnabled } = require('../services/email.service');

const router = express.Router();

router.use(auth, adminOnly);

const MIN_VOUCHER = 10000; // 100 Kz

function escapeRx(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function findTarget(id) {
  if (!mongoose.isValidObjectId(id)) throw new AppError('Utilizador inválido', 400);
  const user = await User.findById(id);
  if (!user) throw new AppError('Utilizador não encontrado', 404);
  await user.clearExpiredBan();
  return user;
}

function assertNotSelf(admin, target) {
  if (String(admin._id) === String(target._id)) {
    throw new AppError('Não podes aplicar esta acção à tua própria conta', 400);
  }
}

// ─── Estatísticas ────────────────────────────────────────────────────────────
router.get(
  '/stats',
  asyncHandler(async (_req, res) => {
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      clients,
      drivers,
      businesses,
      admins,
      blockedPermanent,
      blockedTemporary,
      verified,
      newToday,
      newWeek,
      balanceAgg,
      txToday,
      volumeAgg,
      vouchersActive,
      vouchersRedeemed,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ userType: 'client' }),
      User.countDocuments({ userType: 'driver' }),
      User.countDocuments({ userType: 'business' }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ status: 'blocked', banType: 'permanent' }),
      User.countDocuments({ status: 'blocked', banType: 'temporary', blockedUntil: { $gt: now } }),
      User.countDocuments({ emailVerified: true }),
      User.countDocuments({ createdAt: { $gte: dayAgo } }),
      User.countDocuments({ createdAt: { $gte: weekAgo } }),
      User.aggregate([{ $group: { _id: null, total: { $sum: '$balanceCents' } } }]),
      Transaction.countDocuments({ createdAt: { $gte: dayAgo }, status: 'completed' }),
      Transaction.aggregate([
        { $match: { createdAt: { $gte: weekAgo }, status: 'completed', direction: 'credit' } },
        { $group: { _id: null, total: { $sum: '$amountCents' }, count: { $sum: 1 } } },
      ]),
      RechargeVoucher.countDocuments({ status: 'active' }),
      RechargeVoucher.countDocuments({ status: 'redeemed' }),
    ]);

    res.json({
      users: {
        total: totalUsers,
        clients,
        drivers,
        businesses,
        admins,
        blockedPermanent,
        blockedTemporary,
        verified,
        newToday,
        newWeek,
      },
      money: {
        totalBalance: toKz(balanceAgg[0]?.total || 0),
        totalBalanceCents: balanceAgg[0]?.total || 0,
        volumeWeek: toKz(volumeAgg[0]?.total || 0),
        volumeWeekCents: volumeAgg[0]?.total || 0,
        creditsWeek: volumeAgg[0]?.count || 0,
        transactionsToday: txToday,
      },
      vouchers: { active: vouchersActive, redeemed: vouchersRedeemed },
    });
  })
);

// ─── Utilizadores ────────────────────────────────────────────────────────────
router.get(
  '/users',
  asyncHandler(async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const q = String(req.query.q || '').trim();
    const filter = {};

    if (q) {
      const rx = new RegExp(escapeRx(q), 'i');
      filter.$or = [{ name: rx }, { email: rx }, { phone: rx }, { businessName: rx }];
    }
    if (req.query.role === 'admin' || req.query.role === 'user') filter.role = req.query.role;
    if (req.query.userType && ['client', 'driver', 'business'].includes(req.query.userType)) {
      filter.userType = req.query.userType;
    }
    if (req.query.status === 'active') filter.status = 'active';
    if (req.query.status === 'blocked') filter.status = 'blocked';
    if (req.query.banType === 'temporary' || req.query.banType === 'permanent') {
      filter.status = 'blocked';
      filter.banType = req.query.banType;
    }
    if (req.query.emailVerified === 'true') filter.emailVerified = true;
    if (req.query.emailVerified === 'false') filter.emailVerified = false;

    const [items, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    // Auto-clear expired bans on listed users (best-effort)
    for (const u of items) {
      // eslint-disable-next-line no-await-in-loop
      await u.clearExpiredBan();
    }

    res.json({
      users: items.map((u) => u.toPublic()),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    });
  })
);

router.get(
  '/users/:id',
  asyncHandler(async (req, res) => {
    const user = await findTarget(req.params.id);
    const [recentTx, vouchersRedeemed, notificationsUnread] = await Promise.all([
      Transaction.find({ userId: user._id }).sort({ createdAt: -1 }).limit(20),
      RechargeVoucher.countDocuments({ redeemedBy: user._id }),
      Notification.countDocuments({ userId: user._id, read: false }),
    ]);
    res.json({
      user: user.toPublic(),
      recentTransactions: recentTx.map((t) => t.toJSON()),
      vouchersRedeemed,
      notificationsUnread,
    });
  })
);

// Banir: body { type: 'temporary'|'permanent', days?: number, hours?: number, reason?: string }
router.post(
  '/users/:id/ban',
  asyncHandler(async (req, res) => {
    const target = await findTarget(req.params.id);
    assertNotSelf(req.user, target);
    if (target.role === 'admin') throw new AppError('Não podes banir outro administrador', 403);

    const type = String(req.body.type || '').toLowerCase();
    const reason = String(req.body.reason || '').trim().slice(0, 500);

    if (type === 'permanent') {
      target.status = 'blocked';
      target.banType = 'permanent';
      target.blockedUntil = null;
      target.banReason = reason;
      target.bannedAt = new Date();
      target.bannedBy = req.user._id;
      await target.save();
      await logAdminAction({
        admin: req.user,
        action: 'ban_permanent',
        targetUser: target,
        reason,
      });
      notify(target._id, {
        type: 'security',
        title: 'Conta bloqueada',
        body: reason ? `A tua conta foi bloqueada permanentemente. Motivo: ${reason}` : 'A tua conta foi bloqueada permanentemente.',
      });
      return res.json({ message: 'Conta bloqueada permanentemente', user: target.toPublic() });
    }

    if (type === 'temporary') {
      const days = Number(req.body.days) || 0;
      const hours = Number(req.body.hours) || 0;
      const minutes = Number(req.body.minutes) || 0;
      const ms = ((days * 24 + hours) * 60 + minutes) * 60 * 1000;
      if (ms < 60 * 1000) throw new AppError('Duração mínima: 1 minuto', 400);
      if (ms > 365 * 24 * 60 * 60 * 1000) throw new AppError('Duração máxima: 365 dias', 400);

      const until = new Date(Date.now() + ms);
      target.status = 'blocked';
      target.banType = 'temporary';
      target.blockedUntil = until;
      target.banReason = reason;
      target.bannedAt = new Date();
      target.bannedBy = req.user._id;
      await target.save();
      await logAdminAction({
        admin: req.user,
        action: 'ban_temporary',
        targetUser: target,
        reason,
        metadata: { until: until.toISOString(), days, hours, minutes },
      });
      notify(target._id, {
        type: 'security',
        title: 'Conta suspensa',
        body: `A tua conta está suspensa até ${until.toISOString().slice(0, 16).replace('T', ' ')} UTC.${reason ? ` Motivo: ${reason}` : ''}`,
      });
      return res.json({ message: 'Conta suspensa temporariamente', user: target.toPublic() });
    }

    throw new AppError("type deve ser 'temporary' ou 'permanent'", 400);
  })
);

router.post(
  '/users/:id/unban',
  asyncHandler(async (req, res) => {
    const target = await findTarget(req.params.id);
    assertNotSelf(req.user, target);

    target.status = 'active';
    target.banType = 'none';
    target.blockedUntil = null;
    target.banReason = '';
    target.bannedAt = null;
    target.bannedBy = null;
    await target.save();

    await logAdminAction({
      admin: req.user,
      action: 'unban',
      targetUser: target,
      reason: req.body.reason || '',
    });
    notify(target._id, {
      type: 'security',
      title: 'Conta reactivada',
      body: 'A tua conta foi reactivada. Já podes voltar a usar a SunTrip.',
    });

    res.json({ message: 'Conta reactivada', user: target.toPublic() });
  })
);

// Promover / despromover
router.post(
  '/users/:id/role',
  asyncHandler(async (req, res) => {
    const target = await findTarget(req.params.id);
    assertNotSelf(req.user, target);

    const role = String(req.body.role || '').toLowerCase();
    if (role !== 'admin' && role !== 'user') {
      throw new AppError("role deve ser 'admin' ou 'user'", 400);
    }
    if (target.role === role) {
      return res.json({ message: 'Sem alterações', user: target.toPublic() });
    }

    // Impede remover o último admin
    if (role === 'user' && target.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) throw new AppError('Não podes remover o último administrador', 400);
    }

    target.role = role;
    await target.save();

    await logAdminAction({
      admin: req.user,
      action: role === 'admin' ? 'role_promote' : 'role_demote',
      targetUser: target,
      reason: req.body.reason || '',
      metadata: { role },
    });
    notify(target._id, {
      type: 'security',
      title: role === 'admin' ? 'Promovido a administrador' : 'Cargo alterado',
      body:
        role === 'admin'
          ? 'A tua conta passou a ter permissões de administrador.'
          : 'As permissões de administrador foram removidas da tua conta.',
    });

    res.json({
      message: role === 'admin' ? 'Utilizador promovido a admin' : 'Admin despromovido a user',
      user: target.toPublic(),
    });
  })
);

router.post(
  '/users/:id/verify-email',
  asyncHandler(async (req, res) => {
    const target = await findTarget(req.params.id);
    target.emailVerified = true;
    target.emailVerifyCode = null;
    target.emailVerifyExpires = null;
    await target.save();
    await logAdminAction({
      admin: req.user,
      action: 'verify_email',
      targetUser: target,
    });
    res.json({ message: 'Email marcado como verificado', user: target.toPublic() });
  })
);

router.post(
  '/users/:id/send-reset',
  asyncHandler(async (req, res) => {
    const target = await findTarget(req.params.id);
    if (!emailEnabled()) throw new AppError('Envio de email indisponível', 503);
    const code = target.generateResetCode();
    await target.save();
    try {
      await sendPasswordResetEmail(target.email, code, target.name);
    } catch (err) {
      console.error('[admin] send-reset:', err.message);
      throw new AppError('Não foi possível enviar o email', 502);
    }
    await logAdminAction({
      admin: req.user,
      action: 'send_reset',
      targetUser: target,
    });
    res.json({ message: 'Código de recuperação enviado' });
  })
);

// Ajuste de saldo: { amount: number (Kz, +/-), reason?: string }
router.post(
  '/users/:id/adjust-balance',
  asyncHandler(async (req, res) => {
    const target = await findTarget(req.params.id);
    const raw = Number(req.body.amount);
    if (!Number.isFinite(raw) || raw === 0) throw new AppError('Indica um valor (Kz) diferente de 0', 400);

    const absCents = parseAmountKz(Math.abs(raw), { min: 100 }); // mínimo 1 Kz
    const deltaCents = raw > 0 ? absCents : -absCents;
    const reason = String(req.body.reason || '').trim().slice(0, 200);

    const result = await walletService.adjustBalance(target._id, deltaCents, {
      description: reason || (deltaCents > 0 ? 'Crédito administrativo' : 'Débito administrativo'),
      adminId: req.user._id,
    });

    await logAdminAction({
      admin: req.user,
      action: 'adjust_balance',
      targetUser: target,
      reason,
      metadata: { deltaCents, amountKz: toKz(Math.abs(deltaCents)) },
    });
    notify(target._id, {
      type: 'info',
      title: deltaCents > 0 ? 'Saldo creditado' : 'Saldo debitado',
      body: `Um administrador ${deltaCents > 0 ? 'adicionou' : 'removeu'} ${toKz(Math.abs(deltaCents))} Kz.${reason ? ` Motivo: ${reason}` : ''}`,
      metadata: { amount: toKz(Math.abs(deltaCents)) },
    });

    res.json({
      message: 'Saldo actualizado',
      balance: toKz(result.balanceCents),
      transaction: result.transaction.toJSON(),
      user: result.user.toPublic(),
    });
  })
);

// ─── Transacções ─────────────────────────────────────────────────────────────
router.get(
  '/transactions',
  asyncHandler(async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 30));
    const filter = {};

    if (req.query.type && ['deposit', 'transfer', 'qr_payment', 'voucher', 'admin_adjust'].includes(req.query.type)) {
      filter.type = req.query.type;
    }
    if (req.query.direction === 'credit' || req.query.direction === 'debit') {
      filter.direction = req.query.direction;
    }
    if (req.query.userId && mongoose.isValidObjectId(req.query.userId)) {
      filter.userId = req.query.userId;
    }
    if (req.query.from || req.query.to) {
      filter.createdAt = {};
      if (req.query.from) filter.createdAt.$gte = new Date(req.query.from);
      if (req.query.to) filter.createdAt.$lte = new Date(req.query.to);
    }

    const [items, total] = await Promise.all([
      Transaction.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Transaction.countDocuments(filter),
    ]);

    // Anexa nomes dos utilizadores
    const userIds = [...new Set(items.map((t) => String(t.userId)))];
    const users = await User.find({ _id: { $in: userIds } }).select('name email');
    const map = Object.fromEntries(users.map((u) => [String(u._id), u]));

    res.json({
      transactions: items.map((t) => ({
        ...t.toJSON(),
        userName: map[String(t.userId)]?.name || '',
        userEmail: map[String(t.userId)]?.email || '',
      })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    });
  })
);

// ─── Vouchers ────────────────────────────────────────────────────────────────
router.get(
  '/vouchers',
  asyncHandler(async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 30));
    const filter = {};
    if (req.query.status === 'active' || req.query.status === 'redeemed') {
      filter.status = req.query.status;
    }
    if (req.query.q) {
      filter.code = new RegExp(escapeRx(String(req.query.q).trim()), 'i');
    }

    const [items, total] = await Promise.all([
      RechargeVoucher.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      RechargeVoucher.countDocuments(filter),
    ]);

    const redeemerIds = items.filter((v) => v.redeemedBy).map((v) => v.redeemedBy);
    const redeemers = await User.find({ _id: { $in: redeemerIds } }).select('name email');
    const rMap = Object.fromEntries(redeemers.map((u) => [String(u._id), u]));

    res.json({
      vouchers: items.map((v) => ({
        ...v.toJSON(),
        redeemedByName: v.redeemedBy ? rMap[String(v.redeemedBy)]?.name || '' : '',
        redeemedByEmail: v.redeemedBy ? rMap[String(v.redeemedBy)]?.email || '' : '',
        batchId: v.batchId,
      })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    });
  })
);

router.post(
  '/vouchers/generate',
  asyncHandler(async (req, res) => {
    const amountCents = parseAmountKz(req.body.amount, { min: MIN_VOUCHER });
    const quantity = Math.min(Math.max(Number(req.body.quantity) || 1, 1), 100);
    const vouchers = await walletService.generateVouchers({
      amountCents,
      quantity,
      createdBy: req.user._id,
    });
    await logAdminAction({
      admin: req.user,
      action: 'voucher_generate',
      metadata: { quantity: vouchers.length, amountCents, codes: vouchers.map((v) => v.code) },
    });
    res.status(201).json({
      vouchers: vouchers.map((v) => v.toJSON()),
      count: vouchers.length,
      amount: toKz(amountCents),
    });
  })
);

// ─── Auditoria ───────────────────────────────────────────────────────────────
router.get(
  '/audit',
  asyncHandler(async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 30));
    const filter = {};
    if (req.query.action) filter.action = req.query.action;

    const [items, total] = await Promise.all([
      AdminAuditLog.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      AdminAuditLog.countDocuments(filter),
    ]);

    res.json({
      logs: items.map((l) => l.toJSON()),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    });
  })
);

module.exports = router;
