'use client';

import { useEffect, useState } from 'react';
import { Calendar, Filter } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppLayout from '@/components/AppLayout';
import TransactionRow from '@/components/TransactionRow';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { formatKz } from '@/lib/format';

const PERIODS = [
  { id: '', label: 'Tudo' },
  { id: 'today', label: 'Hoje' },
  { id: 'week', label: 'Semana' },
  { id: 'month', label: 'Mês' },
];

const STATUSES = [
  { id: '', label: 'Todos' },
  { id: 'pago', label: 'Pago' },
  { id: 'pendente', label: 'Pendente' },
  { id: 'cancelado', label: 'Cancelado' },
];

export default function TransactionsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState({ period: '', status: '' });
  const [loading, setLoading] = useState(true);

  const counterpartyLabel = user?.userType === 'driver' ? 'Cliente' : 'Motorista';

  useEffect(() => {
    const params = new URLSearchParams();
    if (filter.period) params.set('period', filter.period);
    if (filter.status) params.set('status', filter.status);
    params.set('limit', '50');

    setLoading(true);
    api
      .get(`/transactions?${params}`)
      .then(({ data }) => {
        setTransactions(data.transactions);
        setTotal(data.total);
      })
      .finally(() => setLoading(false));
  }, [filter]);

  const totalPaid = transactions
    .filter((t) => t.status === 'completed')
    .reduce((s, t) => s + t.amount, 0);

  return (
    <ProtectedRoute>
      <AppLayout title="Histórico de Transações">
        <div className="mx-auto max-w-2xl space-y-5">
          <section className="card-elevated flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-suntrip-muted">
                Resumo do período
              </p>
              <p className="mt-1 text-2xl font-bold text-suntrip-yellow">{transactions.length}</p>
              <p className="text-xs text-suntrip-muted">transações · {total} no total</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-suntrip-muted">Volume pago</p>
              <p className="text-lg font-semibold text-emerald-400">{formatKz(totalPaid)}</p>
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-suntrip-muted">
              <Calendar size={16} className="text-suntrip-ocean" />
              Período
            </div>
            <div className="flex flex-wrap gap-2">
              {PERIODS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setFilter((f) => ({ ...f, period: p.id }))}
                  className={`filter-chip ${filter.period === p.id ? 'filter-chip-active' : ''}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-suntrip-muted">
              <Filter size={16} className="text-suntrip-ocean" />
              Estado
            </div>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setFilter((f) => ({ ...f, status: s.id }))}
                  className={`filter-chip ${filter.status === s.id ? 'filter-chip-active' : ''}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </section>

          <section className="section-card divide-y divide-suntrip-border/60 p-0">
            {loading ? (
              <div className="flex justify-center py-14">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-suntrip-yellow border-t-transparent" />
              </div>
            ) : transactions.length ? (
              transactions.map((tx) => (
                <TransactionRow key={tx.id} tx={tx} counterpartyLabel={counterpartyLabel} />
              ))
            ) : (
              <p className="py-12 text-center text-sm text-suntrip-muted">
                Nenhuma transação encontrada neste período
              </p>
            )}
          </section>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
