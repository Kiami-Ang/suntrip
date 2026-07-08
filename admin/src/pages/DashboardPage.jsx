import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../api';
import { formatKz } from '../utils';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/admin/stats');
        setStats(data);
      } catch (e) {
        setError(errMsg(e));
      }
    })();
  }, []);

  if (error) return <div className="error-box">{error}</div>;
  if (!stats) return <p className="page-sub">A carregar…</p>;

  const u = stats.users;
  const m = stats.money;
  const v = stats.vouchers;

  return (
    <>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-sub">Visão geral da plataforma SunTrip</p>

      <div className="stats">
        <div className="stat">
          <div className="label">Utilizadores</div>
          <div className="value">{u.total}</div>
          <div className="hint">+{u.newToday} hoje · +{u.newWeek} esta semana</div>
        </div>
        <div className="stat">
          <div className="label">Saldo total</div>
          <div className="value" style={{ fontSize: 18 }}>{formatKz(m.totalBalance)}</div>
          <div className="hint">Em todas as carteiras</div>
        </div>
        <div className="stat">
          <div className="label">Volume (7d)</div>
          <div className="value" style={{ fontSize: 18 }}>{formatKz(m.volumeWeek)}</div>
          <div className="hint">{m.transactionsToday} txs hoje</div>
        </div>
        <div className="stat">
          <div className="label">Banidos</div>
          <div className="value">{u.blockedPermanent + u.blockedTemporary}</div>
          <div className="hint">{u.blockedTemporary} temp · {u.blockedPermanent} perm</div>
        </div>
        <div className="stat">
          <div className="label">Admins</div>
          <div className="value">{u.admins}</div>
          <div className="hint">{u.verified} emails verificados</div>
        </div>
        <div className="stat">
          <div className="label">Vouchers</div>
          <div className="value">{v.active}</div>
          <div className="hint">{v.redeemed} usados</div>
        </div>
      </div>

      <div className="card">
        <h3>Por tipo de conta</h3>
        <div className="stats" style={{ marginBottom: 0 }}>
          <div className="stat"><div className="label">Clientes</div><div className="value">{u.clients}</div></div>
          <div className="stat"><div className="label">Motoristas</div><div className="value">{u.drivers}</div></div>
          <div className="stat"><div className="label">Negócios</div><div className="value">{u.businesses}</div></div>
        </div>
      </div>

      <div className="toolbar">
        <Link className="btn btn-primary" to="/users">Gerir utilizadores</Link>
        <Link className="btn btn-secondary" to="/vouchers">Gerar vouchers</Link>
        <Link className="btn btn-ghost" to="/audit">Ver auditoria</Link>
      </div>
    </>
  );
}
