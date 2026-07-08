const AdminAuditLog = require('../models/AdminAuditLog');

async function logAdminAction({
  admin,
  action,
  targetUser = null,
  reason = '',
  metadata = {},
}) {
  try {
    return await AdminAuditLog.create({
      adminId: admin._id,
      adminEmail: admin.email,
      action,
      targetUserId: targetUser?._id || null,
      targetEmail: targetUser?.email || '',
      reason: String(reason || '').slice(0, 500),
      metadata,
    });
  } catch (err) {
    console.error('[admin-audit] falha:', err.message);
    return null;
  }
}

module.exports = { logAdminAction };
