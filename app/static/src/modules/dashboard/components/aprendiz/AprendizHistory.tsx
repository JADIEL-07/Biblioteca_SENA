import React, { useState, useEffect } from 'react';
import { FiBookOpen, FiCalendar, FiClock } from 'react-icons/fi';


interface Row {
  kind: 'LOAN' | 'RESERVATION';
  id: number;
  date: string | null;
  due_date?: string | null;
  return_date?: string | null;
  ready_at?: string | null;
  expiration_date?: string | null;
  status: string;
  items: { id: number; name: string; category: string }[];
  fine_amount?: number;
}

const loanLabel = (s: string) => ({ ACTIVE: 'Activo', RETURNED: 'Devuelto', OVERDUE: 'Vencido' }[s] || s);
const resLabel  = (s: string) => ({
  QUEUED: 'En cola', READY: 'Disponible', CLAIMED: 'Reclamada',
  EXPIRED: 'Expirada', CANCELLED: 'Cancelada',
}[s] || s);

export const AprendizHistory: React.FC = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'LOAN' | 'RESERVATION'>('ALL');

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('token');
        const r = await fetch('/api/v1/history/my', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (r.ok) setRows(await r.json());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = rows.filter(r => filter === 'ALL' || r.kind === filter);

  return (
    <div className="dashboard-view-container">


      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {(['ALL', 'LOAN', 'RESERVATION'] as const).map(f => (
          <button
            key={f}
            className={`filter-pill ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'ALL' ? 'Todos' : f === 'LOAN' ? 'Préstamos' : 'Reservas'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-container">Cargando historial…</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <FiClock size={48} />
          <p>No se encontraron registros en el historial.</p>
        </div>
      ) : (
        <div className="custom-table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>#</th>
                <th>Fecha</th>
                <th>Elementos</th>
                <th>Estado</th>
                <th>Detalles</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={`${r.kind}-${r.id}`}>
                  <td>
                    {r.kind === 'LOAN'
                      ? <><FiBookOpen /> Préstamo</>
                      : <><FiCalendar /> Reserva</>}
                  </td>
                  <td>#{r.id}</td>
                  <td>{r.date ? new Date(r.date).toLocaleString('es-CO') : '—'}</td>
                  <td>{r.items.map(i => i.name).join(', ') || '—'}</td>
                  <td>
                    <span className={`status-badge ${r.status.toLowerCase()}`}>
                      {r.kind === 'LOAN' ? loanLabel(r.status) : resLabel(r.status)}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    {r.kind === 'LOAN' && r.due_date && (
                      <>Vence: {new Date(r.due_date).toLocaleDateString('es-CO')}<br/></>
                    )}
                    {r.kind === 'LOAN' && r.return_date && (
                      <>Devuelto: {new Date(r.return_date).toLocaleDateString('es-CO')}<br/></>
                    )}
                    {r.kind === 'LOAN' && r.fine_amount! > 0 && (
                      <>Multa: ${r.fine_amount}</>
                    )}
                    {r.kind === 'RESERVATION' && r.expiration_date && (
                      <>Expira: {new Date(r.expiration_date).toLocaleString('es-CO')}</>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
