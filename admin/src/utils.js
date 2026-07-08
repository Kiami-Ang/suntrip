export const formatKz = (n) =>
  `${new Intl.NumberFormat('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(n) || 0)} Kz`;

export const formatDate = (d) => {
  if (!d) return '—';
  const x = new Date(d);
  return x.toLocaleString('pt-PT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const typeLabel = {
  client: 'Cliente',
  driver: 'Motorista',
  business: 'Negócio',
};

export const banLabel = {
  none: 'Activo',
  temporary: 'Suspenso',
  permanent: 'Banido',
};

export const auditLabel = {
  ban_temporary: 'Suspensão temporária',
  ban_permanent: 'Banimento permanente',
  unban: 'Reactivação',
  role_promote: 'Promoção a admin',
  role_demote: 'Despromoção',
  verify_email: 'Email verificado',
  voucher_generate: 'Vouchers gerados',
  adjust_balance: 'Ajuste de saldo',
  send_reset: 'Código de recuperação',
};

export const txTypeLabel = {
  deposit: 'Depósito',
  transfer: 'Transferência',
  qr_payment: 'Pagamento QR',
  voucher: 'Voucher',
  admin_adjust: 'Ajuste admin',
};
