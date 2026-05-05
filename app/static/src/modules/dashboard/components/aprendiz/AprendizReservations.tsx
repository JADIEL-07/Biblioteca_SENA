import React, { useState, useEffect, useCallback } from 'react';
import { FiCalendar, FiClock, FiCheck, FiUsers } from 'react-icons/fi';

interface Res {
  id: number;
  item_id: number;
  item_name: string;
  item_category: string;
  reservation_date: string;
  ready_at: string | null;
  expiration_date: string | null;
  status: 'QUEUED' | 'READY' | 'CLAIMED' | 'EXPIRED' | 'CANCELLED';
  queue_position: number | null;
}

const statusLabel = (s: string) => ({
  QUEUED:    'En cola',
  READY:     'Disponible',
  CLAIMED:   'Reclamada',
  EXPIRED:   'Expirada',
  CANCELLED: 'Cancelada',
}[s] || s);

const fmtRemaining = (iso: string) => {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return 'expirada';
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return `${h}h ${m}m`;
};

export const AprendizReservations: React.FC = () => {
  const [reservations, setReservations] = useState<Res[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const r = await fetch('/api/v1/reservations/my', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (r.ok) setReservations(await r.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const cancel = async (id: number) => {
    if (!confirm('¿Cancelar esta reserva?')) return;
    const token = localStorage.getItem('token');
    const r = await fetch(`/api/v1/reservations/${id}/cancel`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (r.ok) load();
    else alert('No se pudo cancelar');
  };

  return (
    <div className="dashboard-view-container">


      {loading ? (
        <div className="loading-container">Cargando reservas…</div>
      ) : reservations.length === 0 ? (
        <div className="empty-state">
          <FiCalendar size={48} />
          <p>No tienes reservas activas.</p>
        </div>
      ) : (
        <div className="custom-table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Elemento</th>
                <th>Categoría</th>
                <th>Reservada</th>
                <th>Estado</th>
                <th>Detalle</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {reservations.map(res => (
                <tr key={res.id}>
                  <td>#{res.id}</td>
                  <td>{res.item_name}</td>
                  <td>{res.item_category}</td>
                  <td>{new Date(res.reservation_date).toLocaleString('es-CO')}</td>
                  <td>
                    <span className={`status-badge ${res.status.toLowerCase()}`}>
                      {res.status === 'READY' && <FiCheck style={{ marginRight: 4 }} />}
                      {res.status === 'QUEUED' && <FiUsers style={{ marginRight: 4 }} />}
                      {statusLabel(res.status)}
                    </span>
                  </td>
                  <td>
                    {res.status === 'READY' && res.expiration_date && (
                      <span title={new Date(res.expiration_date).toLocaleString()}>
                        <FiClock /> Expira en {fmtRemaining(res.expiration_date)}
                      </span>
                    )}
                    {res.status === 'QUEUED' && res.queue_position && (
                      <span>Posición {res.queue_position} en la cola</span>
                    )}
                  </td>
                  <td>
                    {(res.status === 'QUEUED' || res.status === 'READY') && (
                      <button className="btn-text" onClick={() => cancel(res.id)}>
                        Cancelar
                      </button>
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
