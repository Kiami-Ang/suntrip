'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, ImageIcon, Keyboard } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppLayout from '@/components/AppLayout';
import api from '@/lib/api';
import { formatKz } from '@/lib/format';
import { useAuth } from '@/context/AuthContext';

const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export default function ScanQrPage() {
  const { user, updateUser } = useAuth();
  const [payment, setPayment] = useState(null);
  const [manualCode, setManualCode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const html5Ref = useRef(null);
  const fileInputRef = useRef(null);

  const parseCode = (raw) => {
    const text = (raw || '').trim();
    try {
      const data = JSON.parse(text);
      return data.code || text;
    } catch {
      const match = text.match(/ST-[A-Z0-9]+/i);
      return match ? match[0].toUpperCase() : text;
    }
  };

  const verifyCode = async (code) => {
    const c = parseCode(code);
    if (!c) throw new Error('Código vazio');
    const { data } = await api.get(`/qr/verify/${encodeURIComponent(c)}`);
    setPayment({ ...data.payment, code: c });
    setMessage('');
  };

  const stopScanner = async () => {
    try {
      if (html5Ref.current?.isScanning) {
        await html5Ref.current.stop();
      }
    } catch {
      /* ignore */
    }
    setScanning(false);
  };

  const startScanner = async () => {
    setMessage('');
    setScanning(true);
    try {
      const html5 = new Html5Qrcode('qr-reader');
      html5Ref.current = html5;
      await html5.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        async (decoded) => {
          await stopScanner();
          try {
            await verifyCode(decoded);
          } catch (err) {
            setMessage(err.response?.data?.message || err.message || 'QR inválido');
          }
        },
        () => {}
      );
    } catch (err) {
      setScanning(false);
      const hint = !isLocalhost
        ? 'No telemóvel via Wi‑Fi (http://192.168.x.x) a câmara está bloqueada pelo browser. Use o código ST- abaixo ou tire foto do QR.'
        : 'Permita o acesso à câmara nas definições do browser.';
      setMessage(hint);
    }
  };

  const scanFromFile = async (file) => {
    if (!file) return;
    setMessage('');
    setLoading(true);
    try {
      const html5 = new Html5Qrcode('qr-reader');
      const result = await html5.scanFile(file, true);
      await verifyCode(result);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Não foi possível ler a imagem. Introduza o código manualmente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => () => {
    stopScanner();
  }, []);

  const handlePay = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/qr/pay', { code: payment.code });
      updateUser({ ...user, balance: data.balance });
      setMessage('Pagamento confirmado!');
      setPayment(null);
      setManualCode('');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Erro no pagamento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <AppLayout title="Ler QR Code">
        <div className="mx-auto max-w-md space-y-5">
          {!isLocalhost && (
            <div className="rounded-xl border border-suntrip-ocean/40 bg-suntrip-ocean/10 px-4 py-3 text-sm text-suntrip-ocean">
              <strong>Telemóvel na rede local:</strong> a câmara só funciona com HTTPS. Use o{' '}
              <strong>código ST-</strong> que o motorista mostra (ou foto do QR abaixo).
            </div>
          )}

          <div id="qr-reader" className="min-h-[120px] overflow-hidden rounded-2xl bg-black/30" />

          {!scanning && !payment && (
            <div className="space-y-3">
              <button type="button" onClick={startScanner} className="btn-ocean w-full">
                <Camera size={20} />
                Abrir câmara
              </button>

              <button
                type="button"
                className="btn-secondary w-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
              >
                <ImageIcon size={20} />
                Ler QR de uma foto
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => scanFromFile(e.target.files?.[0])}
              />

              <div className="card space-y-3 border-suntrip-yellow/30">
                <div className="flex items-center gap-2 text-suntrip-yellow">
                  <Keyboard size={18} />
                  <span className="font-semibold">Código manual (recomendado no telemóvel)</span>
                </div>
                <p className="text-xs text-suntrip-muted">
                  O motorista vê o código ao gerar o QR (ex: ST-A1B2C3D4). Copie e cole aqui.
                </p>
                <input
                  className="input text-center font-mono text-lg tracking-wider"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                  placeholder="ST-XXXXXXXX"
                  autoCapitalize="characters"
                />
                <button
                  type="button"
                  className="btn-primary w-full"
                  disabled={loading || !manualCode.trim()}
                  onClick={async () => {
                    setLoading(true);
                    try {
                      await verifyCode(manualCode);
                    } catch (err) {
                      setMessage(err.response?.data?.message || 'Código inválido');
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  Verificar código
                </button>
              </div>
            </div>
          )}

          {scanning && (
            <button type="button" onClick={stopScanner} className="btn-secondary w-full">
              Parar câmara
            </button>
          )}

          {message && (
            <p
              className={`rounded-xl px-4 py-3 text-sm ${
                message.includes('confirmado')
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : 'bg-suntrip-card text-suntrip-muted'
              }`}
            >
              {message}
            </p>
          )}

          {payment && (
            <div className="card animate-slide-up space-y-4 border-suntrip-yellow/40">
              <h3 className="font-semibold">Confirmar pagamento</h3>
              <p className="text-2xl font-bold text-suntrip-yellow">{formatKz(payment.amount)}</p>
              <p className="text-sm text-suntrip-muted">{payment.description}</p>
              <p className="font-mono text-xs text-suntrip-ocean">{payment.code}</p>
              {payment.receiver && (
                <p className="text-sm">
                  Para: <span className="font-medium text-suntrip-yellow">{payment.receiver.name}</span>
                </p>
              )}
              <div className="flex gap-3">
                <button type="button" className="btn-secondary flex-1" onClick={() => setPayment(null)}>
                  Cancelar
                </button>
                <button type="button" className="btn-primary flex-1" onClick={handlePay} disabled={loading}>
                  {loading ? 'A processar...' : 'Confirmar'}
                </button>
              </div>
            </div>
          )}
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
