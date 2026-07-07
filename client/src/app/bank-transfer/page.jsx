'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppLayout from '@/components/AppLayout';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const banks = ['BAI', 'BFA', 'BIC', 'BPC', 'Standard Bank', 'Atlântico', 'Sol', 'Outro'];

export default function BankTransferPage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    recipientName: '',
    bank: banks[0],
    iban: '',
    reference: '',
    amount: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const { data } = await api.post('/bank/transfer', {
        ...form,
        amount: Number(form.amount),
      });
      updateUser({ ...user, balance: data.balance });
      setMessage({ type: 'success', text: 'Transferência bancária registada com sucesso' });
      setForm({ recipientName: '', bank: banks[0], iban: '', reference: '', amount: '' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Erro na transferência' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <AppLayout title="Transferência Bancária">
        <form onSubmit={handleSubmit} className="card mx-auto max-w-lg space-y-4">
          {message.text && (
            <div
              className={`rounded-xl px-4 py-3 text-sm ${
                message.type === 'success' ? 'bg-suntrip-ocean/10 text-suntrip-ocean' : 'bg-red-500/10 text-red-400'
              }`}
            >
              {message.text}
            </div>
          )}
          <div>
            <label className="label">Nome do destinatário</label>
            <input name="recipientName" className="input" value={form.recipientName} onChange={handleChange} required />
          </div>
          <div>
            <label className="label">Banco</label>
            <select name="bank" className="input" value={form.bank} onChange={handleChange}>
              {banks.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">IBAN</label>
            <input name="iban" className="input font-mono" value={form.iban} onChange={handleChange} placeholder="AO06..." required />
          </div>
          <div>
            <label className="label">Referência</label>
            <input name="reference" className="input" value={form.reference} onChange={handleChange} required />
          </div>
          <div>
            <label className="label">Valor (Kz)</label>
            <input name="amount" type="number" className="input" min={100} value={form.amount} onChange={handleChange} required />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'A processar...' : 'Enviar transferência'}
          </button>
        </form>
      </AppLayout>
    </ProtectedRoute>
  );
}

