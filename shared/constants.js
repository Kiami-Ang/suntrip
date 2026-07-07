const CURRENCY = 'Kz';
const CURRENCY_SYMBOL = 'Kz';

const TRANSACTION_TYPES = {
  DEPOSIT: 'deposit',
  TRANSFER: 'transfer',
  QR_PAYMENT: 'qr_payment',
  QR_RECEIVE: 'qr_receive',
  BANK_TRANSFER: 'bank_transfer',
};

const TRANSACTION_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
};

const MIN_DEPOSIT = 100;
const MIN_TRANSFER = 50;

module.exports = {
  CURRENCY,
  CURRENCY_SYMBOL,
  TRANSACTION_TYPES,
  TRANSACTION_STATUS,
  MIN_DEPOSIT,
  MIN_TRANSFER,
};
