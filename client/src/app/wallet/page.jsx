'use client';

import { useEffect, useState } from 'react';
import { Plus, Send, Search } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppLayout from '@/components/AppLayout';
import TransactionRow from '@/components/TransactionRow';
import api from '@/lib/api';
import { formatKz } from '@/lib/format';
import { useAuth } from '@/context/AuthContext';

export default function WalletPage() {
  const { user, updateUser } = useAuth();
  const [history, setHistory] = useState([]);
  const [tab, setTab] = useState('deposit');
  const [amount, setAmount] = useState('');
  const [recipientId, setRecipientId] = useState('');
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const loadHistory = () => {
    api.get('/wallet/history').then(({ data }) => setHistory(data.transactions));
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const searchUsers = async (q) => {
    setSearch(q);
    if (q.length < 2) return setUsers([]);
    const { data } = await api.get(`/users/search?q=${encodeURIComponent(q)}`);
    setUsers(data.users);
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const { data } = await api.post('/wallet/deposit', { amount: Number(amount) });
      updateUser({ ...user, balance: data.balance });
      setMessage({ type: 'success', text: 'Depósito realizado com sucesso' });
      setAmount('');
      loadHistory();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Erro no depósito' });
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const { data } = await api.post('/wallet/transfer', {
        recipientId,
        amount: Number(amount),
      });
      updateUser({ ...user, balance: data.balance });
      setMessage({ type: 'success', text: 'Transferência concluída' });
      setAmount('');
      setRecipientId('');
      setSearch('');
      loadHistory();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Erro na transferência' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <AppLayout title="Carteira Virtual">
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="card text-center">
            <p className="text-sm text-gray-400">Saldo actual</p>
            <p className="text-3xl font-bold text-suntrip-yellow">{formatKz(user?.balance)}</p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTab('deposit')}
              className={`flex-1 rounded-xl py-3 text-sm font-medium ${tab === 'deposit' ? 'bg-suntrip-yellow text-black' : 'bg-suntrip-card'}`}
            >
              <Plus className="mx-auto mb-1" size={18} /> Adicionar
            </button>
            <button
              type="button"
              onClick={() => setTab('transfer')}
              className={`flex-1 rounded-xl py-3 text-sm font-medium ${tab === 'transfer' ? 'bg-suntrip-yellow text-black' : 'bg-suntrip-card'}`}
            >
              <Send className="mx-auto mb-1" size={18} /> Transferir
            </button>
          </div>

          <div className="card">
            {message.text && (
              <div
                className={`mb-4 rounded-xl px-4 py-3 text-sm ${
                  message.type === 'success'
                    ? 'bg-suntrip-yellow/10 text-suntrip-yellow'
                    : 'bg-red-500/10 text-red-400'
                }`}
              >
                {message.text}
              </div>
            )}
            {tab === 'deposit' ? (
              <form onSubmit={handleDeposit} className="space-y-4">
                <div>
                  <label className="label">Valor a adicionar (Kz)</label>
                  <input
                    type="number"
                    className="input"
                    min={100}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">Mínimo: 100 Kz</p>
                </div>
                <button type="submit" className="btn-primary w-full" disabled={loading}>
                  Adicionar saldo
                </button>
              </form>
            ) : (
              <form onSubmit={handleTransfer} className="space-y-4">
                <div>
                  <label className="label">Destinatário</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3.5 text-gray-500" size={18} />
                    <input
                      className="input pl-10"
                      placeholder="Nome, email ou telefone"
                      value={search}
                      onChange={(e) => searchUsers(e.target.value)}
                    />
                  </div>
                  {users.length > 0 && (
                    <ul className="mt-2 max-h-40 overflow-y-auto rounded-xl border border-suntrip-ocean/20">
                      {users.map((u) => (
                        <li key={u.id}>
                          <button
                            type="button"
                            className="w-full px-4 py-3 text-left text-sm hover:bg-suntrip-card-light"
                            onClick={() => {
                              setRecipientId(u.id);
                              setSearch(u.name);
                              setUsers([]);
                            }}
                          >
                            {u.name} · {u.email}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div>
                  <label className="label">Valor (Kz)</label>
                  <input
                    type="number"
                    className="input"
                    min={50}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn-primary w-full" disabled={loading || !recipientId}>
                  Transferir
                </button>
              </form>
            )}
          </div>

          <div className="card">
            <h3 className="mb-4 font-semibold">Histórico financeiro</h3>
            {history.length ? history.map((tx) => <TransactionRow key={tx.id} tx={tx} />) : (
              <p className="text-sm text-gray-500">Sem movimentos</p>
            )}
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
