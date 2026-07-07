const Notification = require('../models/Notification');
const { getIO } = require('../socket');

/**
 * Cria uma notificação e envia-a em tempo real (se o utilizador estiver online).
 */
async function notify(userId, { type = 'info', title, body = '', metadata = {} }) {
  try {
    const doc = await Notification.create({ userId, type, title, body, metadata });
    getIO()?.to(`user:${String(userId)}`).emit('notification:new', doc.toJSON());
    return doc;
  } catch (err) {
    console.error('[notify] falha ao criar notificação:', err.message);
    return null;
  }
}

module.exports = { notify };
