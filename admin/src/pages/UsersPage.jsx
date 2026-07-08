import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../api';
import Modal from '../components/Modal';
import { formatDate, formatKz, typeLabel, banLabel } from '../utils';
import { useAuth } from '../auth';

function StatusBadge({ user }) {
  if (user.status === 'blocked' || user.banType === 'permanent' || user.banType === 'temporary') {
    const temp = user.banType === 'temporary';
    return (
      <span className={`badge ${temp ? 'badge-warn' : 'badge-danger'}`}>
        {banLabel[user.banType] || 'Bloqueado'}
      </span>
    );
  }
  return <span className="badge badge-ok">Activo</span>;
}

export default function UsersPage() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [role, setRole] = useState('');
  const [userType, setUserType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  const [modal, setModal] = useState(null); // { type, user }
  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);

  const load = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get('/admin/users', {
          params: {
            page,
            limit: 20,
            q: q || undefined,
            status: status || undefined,
            role: role || undefined,
            userType: userType || undefined,
          },
        });
        setUsers(data.users);
        setPagination(data.pagination);
      } catch (e) {
        setError(errMsg(e));
      } finally {
        setLoading(false);
      }
    },
    [q, status, role, userType]
  );

  useEffect(() => {
    load(1);
  }, [load]);

  const open = (type, user) => {
    setMsg('');
    setError('');
    setForm({
      reason: '',
      days: 7,
      hours: 0,
      amount: '',
      role: user.role === 'admin' ? 'user' : 'admin',
    });
    setModal({ type, user });
  };

  const close = () => {
    if (!busy) setModal(null);
  };

  const run = async () => {
    if (!modal) return;
    setBusy(true);
    setError('');
    try {
      const id = modal.user.id;
      let res;
      if (modal.type === 'ban_temp') {
        res = await api.post(`/admin/users/${id}/ban`, {
          type: 'temporary',
          days: Number(form.days) || 0,
          hours: Number(form.hours) || 0,
          reason: form.reason,
        });
      } else if (modal.type === 'ban_perm') {
        res = await api.post(`/admin/users/${id}/ban`, {
          type: 'permanent',
          reason: form.reason,
        });
      } else if (modal.type === 'unban') {
        res = await api.post(`/admin/users/${id}/unban`, { reason: form.reason });
      } else if (modal.type === 'role') {
        res = await api.post(`/admin/users/${id}/role`, { role: form.role, reason: form.reason });
      } else if (modal.type === 'adjust') {
        res = await api.post(`/admin/users/${id}/adjust-balance`, {
          amount: Number(form.amount),
          reason: form.reason,
        });
      } else if (modal.type === 'verify') {
        res = await api.post(`/admin/users/${id}/verify-email`);
      } else if (modal.type === 'reset') {
        res = await api.post(`/admin/users/${id}/send-reset`);
      }
      setMsg(res?.data?.message || 'Feito');
      setModal(null);
      await load(pagination.page);
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const titles = {
    ban_temp: 'Suspender temporariamente',
    ban_perm: 'Banir permanentemente',
    unban: 'Reactivar conta',
    role: 'Alterar cargo',
    adjust: 'Ajustar saldo',
    verify: 'Verificar email',
    reset: 'Enviar recuperação',
  };

  return (
    <>
      <h1 className="page-title">Utilizadores</h1>
      <p className="page-sub">Banir, promover, ajustar saldo e gerir contas</p>

      {msg ? <div className="success-box">{msg}</div> : null}
      {error && !modal ? <div className="error-box">{error}</div> : null}

      <div className="toolbar">
        <input
          placeholder="Pesquisar nome, email, telefone…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && load(1)}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Estado: todos</option>
          <option value="active">Activos</option>
          <option value="blocked">Bloqueados</option>
        </select>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">Cargo: todos</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <select value={userType} onChange={(e) => setUserType(e.target.value)}>
          <option value="">Tipo: todos</option>
          <option value="client">Cliente</option>
          <option value="driver">Motorista</option>
          <option value="business">Negócio</option>
        </select>
        <button type="button" className="btn btn-secondary" onClick={() => load(1)} disabled={loading}>
          {loading ? '…' : 'Filtrar'}
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Contacto</th>
              <th>Tipo</th>
              <th>Saldo</th>
              <th>Estado</th>
              <th>Cargo</th>
              <th>Acções</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty">
                  Nenhum utilizador
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const isMe = u.id === me?.id;
                const blocked = u.status === 'blocked';
                return (
                  <tr key={u.id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{u.name}</div>
                      <div className="mono" style={{ color: 'var(--muted)' }}>
                        {u.emailVerified ? '✓ ' : ''}
                        {formatDate(u.createdAt)}
                      </div>
                    </td>
                    <td>
                      <div className="mono">{u.email}</div>
                      <div style={{ color: 'var(--muted)' }}>{u.phone}</div>
                    </td>
                    <td>
                      <span className="badge badge-info">{typeLabel[u.userType] || u.userType}</span>
                    </td>
                    <td>{formatKz(u.balance)}</td>
                    <td>
                      <StatusBadge user={u} />
                      {blocked && u.banReason ? (
                        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4, maxWidth: 140 }}>
                          {u.banReason}
                        </div>
                      ) : null}
                      {u.banType === 'temporary' && u.blockedUntil ? (
                        <div style={{ fontSize: 11, color: 'var(--warn)', marginTop: 2 }}>
                          até {formatDate(u.blockedUntil)}
                        </div>
                      ) : null}
                    </td>
                    <td>
                      {u.role === 'admin' ? (
                        <span className="badge badge-warn">Admin</span>
                      ) : (
                        <span className="badge badge-mute">User</span>
                      )}
                    </td>
                    <td>
                      <div className="actions">
                        <Link className="btn btn-ghost btn-sm" to={`/users/${u.id}`}>
                          Ver
                        </Link>
                        {!isMe && !blocked && u.role !== 'admin' ? (
                          <>
                            <button type="button" className="btn btn-warn btn-sm" onClick={() => open('ban_temp', u)}>
                              Suspender
                            </button>
                            <button type="button" className="btn btn-danger btn-sm" onClick={() => open('ban_perm', u)}>
                              Banir
                            </button>
                          </>
                        ) : null}
                        {!isMe && blocked ? (
                          <button type="button" className="btn btn-primary btn-sm" onClick={() => open('unban', u)}>
                            Reactivar
                          </button>
                        ) : null}
                        {!isMe ? (
                          <button type="button" className="btn btn-secondary btn-sm" onClick={() => open('role', u)}>
                            {u.role === 'admin' ? 'Despromover' : 'Promover'}
                          </button>
                        ) : null}
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => open('adjust', u)}>
                          Saldo
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          disabled={pagination.page <= 1}
          onClick={() => load(pagination.page - 1)}
        >
          Anterior
        </button>
        <span>
          Página {pagination.page} / {pagination.pages} ({pagination.total})
        </span>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          disabled={pagination.page >= pagination.pages}
          onClick={() => load(pagination.page + 1)}
        >
          Seguinte
        </button>
      </div>

      <Modal
        open={!!modal}
        title={modal ? titles[modal.type] : ''}
        desc={modal ? `${modal.user.name} · ${modal.user.email}` : ''}
        onClose={close}
        footer={
          <>
            <button type="button" className="btn btn-ghost" onClick={close} disabled={busy}>
              Cancelar
            </button>
            <button
              type="button"
              className={`btn ${modal?.type === 'ban_perm' ? 'btn-danger' : 'btn-primary'}`}
              onClick={run}
              disabled={busy}
            >
              {busy ? '…' : 'Confirmar'}
            </button>
          </>
        }
      >
        {error && modal ? <div className="error-box">{error}</div> : null}

        {modal?.type === 'ban_temp' ? (
          <>
            <div className="row-2">
              <div className="field">
                <label>Dias</label>
                <input
                  type="number"
                  min="0"
                  value={form.days}
                  onChange={(e) => setForm({ ...form, days: e.target.value })}
                />
              </div>
              <div className="field">
                <label>Horas</label>
                <input
                  type="number"
                  min="0"
                  value={form.hours}
                  onChange={(e) => setForm({ ...form, hours: e.target.value })}
                />
              </div>
            </div>
            <div className="field">
              <label>Motivo</label>
              <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
            </div>
          </>
        ) : null}

        {modal?.type === 'ban_perm' || modal?.type === 'unban' ? (
          <div className="field">
            <label>Motivo</label>
            <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
          </div>
        ) : null}

        {modal?.type === 'role' ? (
          <>
            <div className="field">
              <label>Novo cargo</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="admin">Administrador</option>
                <option value="user">Utilizador</option>
              </select>
            </div>
            <div className="field">
              <label>Motivo (opcional)</label>
              <input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
            </div>
          </>
        ) : null}

        {modal?.type === 'adjust' ? (
          <>
            <div className="field">
              <label>Valor em Kz (+ credita / − debita)</label>
              <input
                type="number"
                step="0.01"
                placeholder="ex: 1000 ou -500"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Motivo</label>
              <input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
            </div>
          </>
        ) : null}

        {modal?.type === 'verify' ? (
          <p className="desc">Marca o email como verificado sem código.</p>
        ) : null}
        {modal?.type === 'reset' ? (
          <p className="desc">Envia um código de recuperação para o email da conta.</p>
        ) : null}
      </Modal>
    </>
  );
}
