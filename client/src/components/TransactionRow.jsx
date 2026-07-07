import {
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  QrCode,
  User,
} from 'lucide-react';
import {
  formatKz,
  formatDateOnly,
  formatTimeOnly,
  txTypeLabel,
  txDisplayStatus,
  txStatusStyles,
} from '@/lib/format';

const typeIcons = {
  deposit: Banknote,
  transfer: ArrowUpRight,
  qr_payment: QrCode,
  qr_receive: ArrowDownLeft,
  bank_transfer: Banknote,
};

export default function TransactionRow({ tx, counterpartyLabel = 'Motorista' }) {
  const isIncoming = ['deposit', 'qr_receive'].includes(tx.type);
  const Icon = typeIcons[tx.type] || Banknote;
  const status = tx.status || 'pending';
  const statusText = txDisplayStatus[status] || status;
  const statusClass = txStatusStyles[status] || txStatusStyles.pending;
  const motorista = tx.counterpartyName || tx.recipientName || '—';

  return (
    <article className="transaction-row group">
      <div className="flex items-start gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
            isIncoming
              ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400'
              : 'border-suntrip-ocean/25 bg-suntrip-ocean/10 text-suntrip-ocean'
          }`}
        >
          <Icon size={18} strokeWidth={2} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-suntrip-white">{txTypeLabel[tx.type] || tx.type}</p>
              <p className="text-xs text-suntrip-muted">{tx.description || '—'}</p>
            </div>
            <p
              className={`shrink-0 text-right text-sm font-bold ${
                isIncoming ? 'text-emerald-400' : 'text-suntrip-white'
              }`}
            >
              {isIncoming ? '+' : '−'}
              {formatKz(tx.amount)}
            </p>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs sm:grid-cols-4">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-suntrip-muted/80">Data</p>
              <p className="font-medium text-suntrip-white/90">{formatDateOnly(tx.createdAt)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-suntrip-muted/80">Hora</p>
              <p className="font-medium text-suntrip-white/90">{formatTimeOnly(tx.createdAt)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-suntrip-muted/80">
                {tx.counterpartyLabel || counterpartyLabel}
              </p>
              <p className="flex items-center gap-1 truncate font-medium text-suntrip-white/90">
                <User size={12} className="shrink-0 text-suntrip-muted" />
                {motorista}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-suntrip-muted/80">Estado</p>
              <span
                className={`mt-0.5 inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${statusClass}`}
              >
                {statusText}
              </span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
