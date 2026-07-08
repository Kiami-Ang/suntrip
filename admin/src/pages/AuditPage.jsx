import React, { useCallback, useEffect, useState } from 'react';
import api, { errMsg } from '../api';
import { formatDate, auditLabel } from '../utils';

export default function AuditPage() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [action, setAction] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(
    async (page = 1) => {
      try {
        const { data } = await api.get('/admin/audit', {
          params: { page, limit: 40, action: action || undefined },
        });
        setLogs(data.logs);
        setPagination(data.pagination);
      } catch (e) {
        setError(errMsg(e));
      }
    },
    [action]
  );

  useEffect(() => {
    load(1);
  }, [load]);

  return (
    <>
      <h1 className="page-title">Auditoria</h1>
      <p className="page-sub">Histórico imutável de acções administrativas</p>
      {error ? <div className="error-box">{error}</div> : null}

      <div className="toolbar">
        <select value={action} onChange={(e) => setAction(e.target.value)}>
          <option value="">Todas as acções</option>
          {Object.entries(auditLabel).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <button type="button" className="btn btn-secondary" onClick={() => load(1)}>
          Filtrar
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Admin</th>
              <th>Acção</th>
              <th>Alvo</th>
              <th>Motivo</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="empty">
                  Sem registos
                </td>
              </tr>
            ) : (
              logs.map((l) => (
                <tr key={l.id}>
                  <td>{formatDate(l.createdAt)}</td>
                  <td className="mono">{l.adminEmail}</td>
                  <td>
                    <span className="badge badge-info">{auditLabel[l.action] || l.action}</span>
                  </td>
                  <td className="mono">{l.targetEmail || '—'}</td>
                  <td>{l.reason || JSON.stringify(l.metadata || {}) || '—'}</td>
                </tr>
              ))
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
