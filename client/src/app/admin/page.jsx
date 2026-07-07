'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppLayout from '@/components/AppLayout';
import api from '@/lib/api';
import { formatKz, formatDate, txTypeLabel } from '@/lib/format';

export default function AdminPage() {
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const load =
      tab === 'users'
        ? api.get('/admin/users')
        : tab === 'transactions'
          ? api.get('/admin/transactions')
          : api.get('/admin/payments');
    load
      .then(({ data }) => {
        if (tab === 'users') setUsers(data.users);
        else if (tab === 'transactions') setTransactions(data.transactions);
        else setPayments(data.payments);
      })
      .finally(() => setLoading(false));
  }, [tab]);

  return (
    <ProtectedRoute adminOnly>
      <AppLayout title="Painel Administrativo">
        <div className="flex gap-2 border-b border-suntrip-ocean/20 pb-4">
          {['users', 'transactions', 'payments'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-lg px-4 py-2 text-sm capitalize ${
                tab === t ? 'bg-suntrip-yellow/20 text-suntrip-yellow' : 'text-gray-500'
              }`}
            >
              {t === 'users' ? 'Utilizadores' : t === 'transactions' ? 'Transações' : 'Pagamentos'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-suntrip-yellow border-t-transparent" />
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            {tab === 'users' && (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-suntrip-ocean/20 text-gray-500">
                    <th className="py-3 pr-4">Nome</th>
                    <th className="py-3 pr-4">Email</th>
                    <th className="py-3 pr-4">Saldo</th>
                    <th className="py-3">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-suntrip-ocean/20/30">
                      <td className="py-3 pr-4">{u.name}</td>
                      <td className="py-3 pr-4 text-gray-400">{u.email}</td>
                      <td className="py-3 pr-4 text-suntrip-ocean">{formatKz(u.balance)}</td>
                      <td className="py-3">{u.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {tab === 'transactions' && (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-suntrip-ocean/20 text-gray-500">
                    <th className="py-3 pr-4">Utilizador</th>
                    <th className="py-3 pr-4">Tipo</th>
                    <th className="py-3 pr-4">Valor</th>
                    <th className="py-3">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t.id} className="border-b border-suntrip-ocean/20/30">
                      <td className="py-3 pr-4">{t.user?.name || '—'}</td>
                      <td className="py-3 pr-4">{txTypeLabel[t.type]}</td>
                      <td className="py-3 pr-4">{formatKz(t.amount)}</td>
                      <td className="py-3 text-gray-500">{formatDate(t.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {tab === 'payments' && (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-suntrip-ocean/20 text-gray-500">
                    <th className="py-3 pr-4">De</th>
                    <th className="py-3 pr-4">Tipo</th>
                    <th className="py-3 pr-4">Valor</th>
                    <th className="py-3">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id} className="border-b border-suntrip-ocean/20/30">
                      <td className="py-3 pr-4">{p.user?.name}</td>
                      <td className="py-3 pr-4">{txTypeLabel[p.type]}</td>
                      <td className="py-3 pr-4 text-suntrip-ocean">{formatKz(p.amount)}</td>
                      <td className="py-3 text-gray-500">{formatDate(p.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </AppLayout>
    </ProtectedRoute>
  );
}
