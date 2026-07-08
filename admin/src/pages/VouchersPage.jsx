import React, { useCallback, useEffect, useState } from 'react';
import api, { errMsg } from '../api';
import { formatDate, formatKz } from '../utils';

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [amount, setAmount] = useState('1000');
  const [quantity, setQuantity] = useState('5');
  const [generated, setGenerated] = useState([]);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(
    async (page = 1) => {
      try {
        const { data } = await api.get('/admin/vouchers', {
          params: { page, limit: 30, status: status || undefined, q: q || undefined },
        });
        setVouchers(data.vouchers);
        setPagination(data.pagination);
      } catch (e) {
        setError(errMsg(e));
      }
    },
    [status, q]
  );

  useEffect(() => {
    load(1);
  }, [load]);

  const generate = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    setMsg('');
    try {
      const { data } = await api.post('/admin/vouchers/generate', {
        amount: Number(amount),
        quantity: Number(quantity),
      });
      setGenerated(data.vouchers.map((v) => v.code));
      setMsg(`${data.count} voucher(s) de ${formatKz(data.amount)} criados`);
      await load(1);
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const copyAll = async () => {
    await navigator.clipboard.writeText(generated.join('\n'));
    setMsg('Códigos copiados');
  };

  return (
    <>
      <h1 className="page-title">Vouchers</h1>
      <p className="page-sub">Gerar e acompanhar códigos de recarga</p>

      {msg ? <div className="success-box">{msg}</div> : null}
      {error ? <div className="error-box">{error}</div> : null}

      <div className="card">
        <h3>Gerar novos</h3>
        <form className="toolbar" onSubmit={generate}>
          <div className="field" style={{ margin: 0 }}>
            <label>Valor (Kz)</label>
            <input type="number" min="100" value={amount} onChange={(e) => setAmount(e.target.value)} required />
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label>Quantidade</label>
            <input
              type="number"
              min="1"
              max="100"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={busy} style={{ alignSelf: 'end' }}>
            {busy ? 'A gerar…' : 'Gerar'}
          </button>
        </form>

        {generated.length > 0 ? (
          <div style={{ marginTop: 12 }}>
            <div className="toolbar">
              <strong>Últimos gerados</strong>
              <button type="button" className="btn btn-ghost btn-sm" onClick={copyAll}>
                Copiar todos
              </button>
            </div>
            <pre
              className="mono"
              style={{
                background: 'var(--navy)',
                padding: 12,
                borderRadius: 8,
                border: '1px solid var(--border)',
                maxHeight: 160,
                overflow: 'auto',
              }}
            >
              {generated.join('\n')}
            </pre>
          </div>
        ) : null}
      </div>

      <div className="toolbar">
        <input placeholder="Pesquisar código…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Todos</option>
          <option value="active">Activos</option>
          <option value="redeemed">Usados</option>
        </select>
        <button type="button" className="btn btn-secondary" onClick={() => load(1)}>
          Filtrar
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Valor</th>
              <th>Estado</th>
              <th>Usado por</th>
              <th>Criado</th>
            </tr>
          </thead>
          <tbody>
            {vouchers.map((v) => (
              <tr key={v.id}>
                <td className="mono">{v.code}</td>
                <td>{formatKz(v.amount)}</td>
                <td>
                  <span className={`badge ${v.status === 'active' ? 'badge-ok' : 'badge-mute'}`}>
                    {v.status === 'active' ? 'Activo' : 'Usado'}
                  </span>
                </td>
                <td>
                  {v.redeemedByName || '—'}
                  {v.redeemedByEmail ? (
                    <div className="mono" style={{ color: 'var(--muted)', fontSize: 11 }}>
                      {v.redeemedByEmail}
                    </div>
                  ) : null}
                </td>
                <td>{formatDate(v.createdAt)}</td>
              </tr>
            ))}
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
          Página {pagination.page} / {pagination.pages}
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
    </>
  );
}
