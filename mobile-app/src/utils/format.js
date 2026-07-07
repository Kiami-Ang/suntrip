export const formatKz = (amount) =>
  `${new Intl.NumberFormat('pt-AO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0)} Kz`;

export const formatDateOnly = (date) =>
  new Intl.DateTimeFormat('pt-AO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));

export const formatTimeOnly = (date) =>
  new Intl.DateTimeFormat('pt-AO', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));

export const txTypeLabel = {
  deposit: 'Depósito',
  transfer: 'Transferência',
  qr_payment: 'Pagamento QR',
  qr_receive: 'Recebido QR',
  bank_transfer: 'Transferência Bancária',
};

export const txDisplayStatus = {
  pending: 'Pendente',
  completed: 'Pago',
  failed: 'Cancelado',
  cancelled: 'Cancelado',
};

export const txStatusColor = {
  pending: '#fbbf24',
  completed: '#34d399',
  failed: '#f87171',
  cancelled: '#f87171',
};
