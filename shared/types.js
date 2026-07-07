/** @typedef {'deposit' | 'transfer' | 'qr_payment' | 'qr_receive' | 'bank_transfer'} TransactionType */
/** @typedef {'pending' | 'completed' | 'failed' | 'cancelled'} TransactionStatus */

/**
 * @typedef {Object} UserPublic
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} phone
 * @property {string} [avatar]
 * @property {number} balance
 * @property {'user' | 'admin'} role
 */

/**
 * @typedef {Object} Transaction
 * @property {string} id
 * @property {string} userId
 * @property {TransactionType} type
 * @property {TransactionStatus} status
 * @property {number} amount
 * @property {string} description
 * @property {string} [recipientId]
 * @property {string} [recipientName]
 * @property {Object} [metadata]
 * @property {string} createdAt
 */

module.exports = {};
