export const formatKz = (amount) =>
  `${new Intl.NumberFormat('pt-AO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0)} Kz`;

export const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatTime = (date) => {
  const d = new Date(date);
  return d.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
};

export const formatDateTime = (date) => `${formatDate(date)} · ${formatTime(date)}`;

export const txTypeLabel = {
  deposit: 'Carregamento',
  transfer: 'Transferência',
  qr_payment: 'Pagamento QR',
  voucher: 'Recarga voucher',
  admin_adjust: 'Ajuste admin',
};

// Estado apresentado ao utilizador (profissional)
export const txStatusLabel = {
  completed: 'Concluído',
  pending: 'Pendente',
  failed: 'Cancelado',
  reversed: 'Revertido',
};

export const initials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('');
