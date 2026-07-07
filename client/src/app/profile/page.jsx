'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppLayout from '@/components/AppLayout';
import api, { getUploadUrl } from '@/lib/api';
import { formatKz } from '@/lib/format';
import { useAuth } from '@/context/AuthContext';
import { sanitizeAngolanPhoneInput } from '@/lib/validation';

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateUser, logout } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [message, setMessage] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put('/users/profile', form);
      updateUser(data.user);
      setMessage('Perfil actualizado');
    } catch {
      setMessage('Erro ao guardar');
    }
  };

  const handleAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('avatar', file);
    try {
      const { data } = await api.post('/users/avatar', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser(data.user);
      setMessage('Avatar actualizado');
    } catch {
      setMessage('Erro no upload');
    }
  };

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const typeLabel =
    user?.role === 'admin'
      ? 'Administrador'
      : user?.userType === 'driver'
        ? 'Motorista'
        : 'Cliente';

  return (
    <ProtectedRoute>
      <AppLayout title="Meu Perfil">
        <div className="mx-auto max-w-md space-y-6">
          <div className="card flex flex-col items-center text-center">
            <label className="group relative cursor-pointer">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-suntrip-yellow bg-suntrip-card text-3xl font-bold text-suntrip-yellow">
                {user?.avatar ? (
                  <img src={getUploadUrl(user.avatar)} alt="" className="h-full w-full object-cover" />
                ) : (
                  user?.name?.charAt(0)?.toUpperCase()
                )}
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
              <span className="mt-2 block text-xs text-suntrip-ocean group-hover:underline">Alterar foto</span>
            </label>
            <h2 className="mt-4 text-xl font-semibold">{user?.name}</h2>
            <p className="text-suntrip-muted">{user?.email}</p>
            <span className="mt-2 rounded-full bg-suntrip-ocean/20 px-3 py-1 text-xs text-suntrip-yellow">
              {typeLabel}
            </span>
            <p className="mt-3 text-lg font-bold text-suntrip-ocean">{formatKz(user?.balance)}</p>
          </div>

          {message && <p className="text-center text-sm text-suntrip-ocean">{message}</p>}

          <form onSubmit={handleSave} className="card space-y-4">
            <div>
              <label className="label">Nome</label>
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="label">Telefone</label>
              <input
                className="input"
                inputMode="numeric"
                maxLength={9}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: sanitizeAngolanPhoneInput(e.target.value) })}
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" value={user?.email || ''} disabled />
            </div>

            {user?.userType === 'driver' && (
              <>
                <div>
                  <label className="label">Matrícula</label>
                  <input className="input" value={user?.vehiclePlate || ''} disabled />
                </div>
                <div>
                  <label className="label">Carta de condução</label>
                  <input className="input" value={user?.driverLicense || ''} disabled />
                </div>
              </>
            )}

            {user?.userType === 'client' && user?.bankAccount && (
              <div>
                <label className="label">Conta bancária</label>
                <input className="input" value={user.bankAccount} disabled />
              </div>
            )}

            <button type="submit" className="btn-primary w-full">
              Guardar alterações
            </button>
          </form>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/40 py-3 text-sm font-medium text-red-300 transition hover:bg-red-500/10"
          >
            <LogOut size={18} />
            Sair da conta
          </button>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
