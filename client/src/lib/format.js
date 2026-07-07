export const formatKz = (amount) =>
  new Intl.NumberFormat('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
    amount || 0
  ) + ' Kz';

export const formatDate = (date) =>
  new Intl.DateTimeFormat('pt-AO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));

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

export const txStatusLabel = {
  pending: 'Pendente',
  completed: 'Concluído',
  failed: 'Falhou',
  cancelled: 'Cancelado',
};

/** Rótulos profissionais para o histórico */
export const txDisplayStatus = {
  pending: 'Pendente',
  completed: 'Pago',
  failed: 'Cancelado',
  cancelled: 'Cancelado',
};

export const txStatusStyles = {
  pending: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  completed: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  failed: 'bg-red-500/15 text-red-300 border-red-500/30',
  cancelled: 'bg-red-500/15 text-red-300 border-red-500/30',
};
