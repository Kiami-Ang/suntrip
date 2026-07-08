import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { errMsg } from '../api';
import { formatDate, formatKz, typeLabel, banLabel, txTypeLabel } from '../utils';

export default function UserDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState('');

  const load = async () => {
    try {
      const res = await api.get(`/admin/users/${id}`);
      setData(res.data);
    } catch (e) {
      setError(errMsg(e));
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const act = async (key, fn) => {
    setBusy(key);
    setError('');
    try {
      const res = await fn();
      setMsg(res.data.message || 'Feito');
      await load();
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setBusy('');
    }
  };

  if (error && !data) return <div className="error-box">{error}</div>;
  if (!data) return <p className="page-sub">A carregar…</p>;

  const u = data.user;

  return (
    <>
      <p className="page-sub">
        <Link to="/users">← Utilizadores</Link>
      </p>
      <h1 className="page-title">{u.name}</h1>
      <p className="page-sub">
        {u.email} · {u.phone}
      </p>

      {msg ? <div className="success-box">{msg}</div> : null}
      {error ? <div className="error-box">{error}</div> : null}

      <div className="stats">
        <div className="stat">
          <div className="label">Saldo</div>
          <div className="value" style={{ fontSize: 18 }}>
            {formatKz(u.balance)}
          </div>
        </div>
        <div className="stat">
          <div className="label">Tipo</div>
          <div className="value" style={{ fontSize: 18 }}>
            {typeLabel[u.userType]}
          </div>
        </div>
        <div className="stat">
          <div className="label">Estado</div>
          <div className="value" style={{ fontSize: 18 }}>
            {banLabel[u.banType] || u.status}
          </div>
        </div>
        <div className="stat">
          <div className="label">Cargo</div>
          <div className="value" style={{ fontSize: 18 }}>
            {u.role}
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Detalhes</h3>
        <table>
          <tbody>
            <tr>
              <td>Email verificado</td>
              <td>{u.emailVerified ? 'Sim' : 'Não'}</td>
            </tr>
            <tr>
              <td>Criado</td>
              <td>{formatDate(u.createdAt)}</td>
            </tr>
            <tr>
              <td>Última actividade</td>
              <td>{formatDate(u.lastActiveAt)}</td>
            </tr>
            {u.banReason ? (
              <tr>
                <td>Motivo do ban</td>
                <td>{u.banReason}</td>
              </tr>
            ) : null}
            {u.blockedUntil ? (
              <tr>
                <td>Suspenso até</td>
                <td>{formatDate(u.blockedUntil)}</td>
              </tr>
            ) : null}
            <tr>
              <td>Vouchers usados</td>
              <td>{data.vouchersRedeemed}</td>
            </tr>
            {u.businessName ? (
              <tr>
                <td>Negócio</td>
                <td>
                  {u.businessName} ({u.businessCategory || '—'})
                </td>
              </tr>
            ) : null}
            {u.vehiclePlate ? (
              <tr>
                <td>Matrícula</td>
                <td>{u.vehiclePlate}</td>
              </tr>
            ) : null}
          </tbody>
        </table>

        <div className="toolbar" style={{ marginTop: 16, marginBottom: 0 }}>
          {!u.emailVerified ? (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={!!busy}
              onClick={() => act('verify', () => api.post(`/admin/users/${id}/verify-email`))}
            >
              {busy === 'verify' ? '…' : 'Verificar email'}
            </button>
          ) : null}
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            disabled={!!busy}
            onClick={() => act('reset', () => api.post(`/admin/users/${id}/send-reset`))}
          >
            {busy === 'reset' ? '…' : 'Enviar recuperação'}
          </button>
          <Link className="btn btn-ghost btn-sm" to={`/transactions?userId=${id}`}>
            Ver transacções
          </Link>
        </div>
      </div>

      <div className="card">
        <h3>Movimentos recentes</h3>
        {data.recentTransactions.length === 0 ? (
          <div className="empty">Sem movimentos</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Tipo</th>
                <th>Direcção</th>
                <th>Valor</th>
                <th>Descrição</th>
              </tr>
            </thead>
            <tbody>
              {data.recentTransactions.map((t) => (
                <tr key={t.id}>
                  <td>{formatDate(t.createdAt)}</td>
                  <td>{txTypeLabel[t.type] || t.type}</td>
                  <td>{t.direction === 'credit' ? 'Crédito' : 'Débito'}</td>
                  <td style={{ color: t.direction === 'credit' ? 'var(--success)' : 'var(--text)' }}>
                    {t.direction === 'credit' ? '+' : '−'}
                    {formatKz(t.amount)}
                  </td>
                  <td>{t.description || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
