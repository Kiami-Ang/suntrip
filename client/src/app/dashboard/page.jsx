'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Car, Plus, FileText, TrendingUp, Wallet } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppLayout from '@/components/AppLayout';
import api from '@/lib/api';
import { formatKz, formatDate, txTypeLabel } from '@/lib/format';
import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const { user, updateUser } = useAuth();
  const [data, setData] = useState(null);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    api
      .get('/dashboard')
      .then(({ data: d }) => {
        setData(d);
        if (d.user) updateUser(d.user);
        setApiError('');
      })
      .catch(() => {
        setApiError('Sem ligação ao servidor. Verifique se a API está a correr (porta 5000).');
        setData({
          balance: user?.balance ?? 0,
          recentTransactions: [],
          onlineCount: 0,
        });
      });
  }, []);

  const balance = data?.balance ?? user?.balance ?? 0;

  return (
    <ProtectedRoute userType="client">
      <AppLayout hideTitle>
        <div className="space-y-6">
          {apiError && (
            <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              {apiError}
            </div>
          )}

          <div className="card-balance">
            <p className="text-sm text-suntrip-muted">Saldo Disponível</p>
            <p className="mt-1 text-4xl font-bold tracking-tight text-suntrip-yellow">{formatKz(balance)}</p>
            <p className="mt-2 flex items-center gap-1 text-sm text-emerald-400">
              <TrendingUp size={16} />
              Carteira SunTrip · Kz
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <Link href="/qr/scan" className="action-tile">
              <span className="action-tile-icon bg-suntrip-ocean/20">
                <Car className="text-suntrip-ocean" size={22} strokeWidth={2} />
              </span>
              <span className="text-center text-[11px] font-medium">Pagar Táxi</span>
            </Link>
            <Link href="/wallet" className="action-tile-primary">
              <span className="action-tile-icon bg-white/25">
                <Plus className="text-suntrip-navy" size={22} strokeWidth={2.5} />
              </span>
              <span className="text-center text-[11px] font-bold text-suntrip-navy">Adicionar</span>
            </Link>
            <Link href="/transactions" className="action-tile">
              <span className="action-tile-icon bg-suntrip-ocean/20">
                <FileText className="text-suntrip-ocean" size={20} strokeWidth={2} />
              </span>
              <span className="text-center text-[11px] font-medium">Extrato</span>
            </Link>
          </div>

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="section-title mb-0">Últimas transações</h2>
              <Link href="/transactions" className="text-suntrip-ocean transition hover:text-suntrip-yellow">
                <Wallet size={20} />
              </Link>
            </div>
            <div className="section-card p-0">
              {data?.recentTransactions?.length ? (
                data.recentTransactions.map((tx) => <TransactionItem key={tx.id} tx={tx} />)
              ) : (
                <p className="p-5 text-center text-sm text-suntrip-muted">Sem transações recentes</p>
              )}
            </div>
          </section>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}

function TransactionItem({ tx }) {
  const isIncoming = ['deposit', 'qr_receive'].includes(tx.type);
  return (
    <div className="flex items-center gap-4 border-b border-suntrip-ocean/10 px-5 py-4 last:border-0">
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
          isIncoming ? 'bg-emerald-500/15' : 'bg-red-500/15'
        }`}
      >
        <Car size={20} className={isIncoming ? 'text-emerald-400' : 'text-red-400'} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{txTypeLabel[tx.type] || tx.description}</p>
        <p className="text-xs text-suntrip-muted">{formatDate(tx.createdAt)}</p>
      </div>
      <p className={`shrink-0 font-semibold ${isIncoming ? 'text-emerald-400' : 'text-red-400'}`}>
        {isIncoming ? '+' : '-'}
        {formatKz(tx.amount)}
      </p>
    </div>
  );
}
