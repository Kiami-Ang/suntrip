'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppLayout from '@/components/AppLayout';
import api from '@/lib/api';
import { formatKz } from '@/lib/format';

export default function GenerateQrPage() {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('Corrida de táxi');
  const [qr, setQr] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/qr/generate', {
        amount: Number(amount),
        description,
      });
      setQr(data);
      setCopied(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao gerar QR');
    } finally {
      setLoading(false);
    }
  };

  const copyCode = async () => {
    if (!qr?.payment?.code) return;
    try {
      await navigator.clipboard.writeText(qr.payment.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* fallback */
    }
  };

  return (
    <ProtectedRoute>
      <AppLayout title="Gerar QR Code">
        <div className="mx-auto max-w-md space-y-6">
          <form onSubmit={handleGenerate} className="card space-y-4">
            {error && <p className="text-sm text-red-400">{error}</p>}
            <div>
              <label className="label">Valor (Kz)</label>
              <input
                type="number"
                className="input"
                min={1}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Descrição</label>
              <input
                className="input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'A gerar...' : 'Gerar QR Code'}
            </button>
          </form>

          {qr && (
            <div className="card animate-slide-up space-y-4 text-center">
              <p className="text-2xl font-bold text-suntrip-yellow">{formatKz(qr.payment.amount)}</p>
              <p className="text-sm text-suntrip-muted">{qr.payment.description}</p>

              <div className="rounded-xl border-2 border-suntrip-yellow bg-suntrip-navy-light p-4">
                <p className="text-xs text-suntrip-muted">Código para o passageiro (sem câmara)</p>
                <p className="mt-2 font-mono text-2xl font-bold tracking-widest text-suntrip-yellow">
                  {qr.payment.code}
                </p>
                <button type="button" onClick={copyCode} className="btn-secondary mx-auto mt-3 text-sm">
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? 'Copiado!' : 'Copiar código'}
                </button>
              </div>

              <div className="mx-auto inline-block rounded-2xl bg-white p-4">
                <img src={qr.qrDataUrl} alt="QR Code SunTrip" width={260} height={260} className="mx-auto" />
              </div>
              <p className="text-xs text-suntrip-muted">
                Válido 15 min · Passageiro: cole o código em <strong>Ler QR</strong> ou leia a imagem
              </p>
            </div>
          )}
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
