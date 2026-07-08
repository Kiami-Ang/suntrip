const mongoose = require('mongoose');

/**
 * Registo imutável de acções administrativas (ban, unban, role, vouchers, etc.).
 */
const adminAuditLogSchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    adminEmail: { type: String, default: '' },
    action: {
      type: String,
      enum: [
        'ban_temporary',
        'ban_permanent',
        'unban',
        'role_promote',
        'role_demote',
        'verify_email',
        'voucher_generate',
        'adjust_balance',
        'send_reset',
      ],
      required: true,
      index: true,
    },
    targetUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    targetEmail: { type: String, default: '' },
    reason: { type: String, default: '' },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

adminAuditLogSchema.index({ createdAt: -1 });

adminAuditLogSchema.methods.toJSON = function toJSON() {
  return {
    id: this._id.toString(),
    adminId: this.adminId?.toString?.() || null,
    adminEmail: this.adminEmail,
    action: this.action,
    targetUserId: this.targetUserId?.toString?.() || null,
    targetEmail: this.targetEmail,
    reason: this.reason,
    metadata: this.metadata,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('AdminAuditLog', adminAuditLogSchema);
