import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api, { errMsg } from '../api';
import { formatDate, formatKz, txTypeLabel } from '../utils';

export default function TransactionsPage() {
  const [params] = useSearchParams();
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [type, setType] = useState('');
  const [userId, setUserId] = useState(params.get('userId') || '');
  const [error, setError] = useState('');

  const load = useCallback(
    async (page = 1) => {
      try {
        const { data } = await api.get('/admin/transactions', {
          params: {
            page,
            limit: 40,
            type: type || undefined,
            userId: userId || undefined,
          },
        });
        setItems(data.transactions);
        setPagination(data.pagination);
      } catch (e) {
        setError(errMsg(e));
      }
    },
    [type, userId]
  );

  useEffect(() => {
    load(1);
  }, [load]);

  return (
    <>
      <h1 className="page-title">Transacções</h1>
      <p className="page-sub">Ledger completo da plataforma</p>
      {error ? <div className="error-box">{error}</div> : null}

      <div className="toolbar">
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">Todos os tipos</option>
          <option value="transfer">Transferência</option>
          <option value="qr_payment">Pagamento QR</option>
          <option value="voucher">Voucher</option>
          <option value="deposit">Depósito</option>
          <option value="admin_adjust">Ajuste admin</option>
        </select>
        <input
          placeholder="Filtrar por userId (opcional)"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="mono"
        />
        <button type="button" className="btn btn-secondary" onClick={() => load(1)}>
          Filtrar
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Utilizador</th>
              <th>Tipo</th>
              <th>Dir.</th>
              <th>Valor</th>
              <th>Contra-parte</th>
              <th>Descrição</th>
            </tr>
          </thead>
          <tbody>
            {items.map((t) => (
              <tr key={t.id}>
                <td>{formatDate(t.createdAt)}</td>
                <td>
                  <div>{t.userName || '—'}</div>
                  <div className="mono" style={{ color: 'var(--muted)', fontSize: 11 }}>
                    {t.userEmail}
                  </div>
                </td>
                <td>{txTypeLabel[t.type] || t.type}</td>
                <td>{t.direction === 'credit' ? 'In' : 'Out'}</td>
                <td style={{ color: t.direction === 'credit' ? 'var(--success)' : 'inherit', fontWeight: 700 }}>
                  {t.direction === 'credit' ? '+' : '−'}
                  {formatKz(t.amount)}
                </td>
                <td>{t.counterpartyName || '—'}</td>
                <td>{t.description || '—'}</td>
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
    </>
  );
}
