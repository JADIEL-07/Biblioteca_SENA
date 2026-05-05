import React, { useState, useEffect } from 'react';
import { FiBox, FiCheckCircle, FiBookOpen, FiClock, FiCalendar, FiAlertTriangle } from 'react-icons/fi';

interface StaffHomeProps {
  user: any;
}

export const StaffHome: React.FC<StaffHomeProps> = ({ user }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const depId = user?.dependency_id;
  const depName = user?.dependency_name || 'Mi Dependencia';

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const [itemsRes, loansRes, resvRes] = await Promise.all([
          fetch(`/api/v1/items/?dependency_id=${depId || ''}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/v1/loans/', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/v1/reservations/', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const items  = itemsRes.ok  ? await itemsRes.json()  : [];
        const loans  = loansRes.ok  ? await loansRes.json()  : [];
        const reservations = resvRes.ok ? await resvRes.json() : [];

        const available  = items.filter((i: any) => ['AVAILABLE','DISPONIBLE'].includes(i.status_name?.toUpperCase())).length;
        const loaned     = items.filter((i: any) => ['LOANED','PRESTADO'].includes(i.status_name?.toUpperCase())).length;
        const activeLoans   = Array.isArray(loans) ? loans.filter((l: any) => l.status === 'ACTIVE').length : 0;
        const pendingResvs  = Array.isArray(reservations) ? reservations.filter((r: any) => r.status === 'PENDING').length : 0;

        setData({ total: items.length, available, loaned, activeLoans, pendingResvs });
      } catch {
        setData({ total: 0, available: 0, loaned: 0, activeLoans: 0, pendingResvs: 0 });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [depId]);

  if (loading) return <div className="admin-loading">Cargando estadísticas...</div>;

  const { total, available, loaned, activeLoans, pendingResvs } = data;

  const kpis = [
    { label: 'Total de elementos', value: total,        icon: <FiBox />,          color: 'var(--sena-green)' },
    { label: 'Disponibles',        value: available,    icon: <FiCheckCircle />,  color: '#22c55e' },
    { label: 'Prestados',          value: loaned,       icon: <FiBookOpen />,     color: '#f59e0b' },
    { label: 'Préstamos activos',  value: activeLoans,  icon: <FiClock />,        color: '#3b82f6' },
    { label: 'Reservas pendientes',value: pendingResvs, icon: <FiCalendar />,     color: '#a855f7' },
  ];

  return (
    <div className="admin-home-content">
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ color: 'var(--admin-text-primary)', fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>
          Panel de {depName}
        </h2>
        <p style={{ color: 'var(--admin-text-muted)', margin: '0.25rem 0 0', fontSize: '0.9rem' }}>
          Resumen operativo de tu dependencia asignada
        </p>
      </div>

      <div className="admin-kpi-grid">
        {kpis.map((kpi, i) => (
          <div key={i} className="admin-kpi-card">
            <div className="kpi-icon-box" style={{ color: kpi.color, background: `${kpi.color}18` }}>
              {kpi.icon}
            </div>
            <div className="kpi-info">
              <span className="kpi-title">{kpi.label}</span>
              <span className="kpi-value" style={{ color: kpi.color }}>{kpi.value}</span>
            </div>
          </div>
        ))}
      </div>

      {pendingResvs > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
          borderRadius: '10px', padding: '1rem 1.25rem', marginTop: '1.5rem',
          color: '#f59e0b', fontWeight: 600
        }}>
          <FiAlertTriangle size={20} />
          Tienes {pendingResvs} reserva{pendingResvs > 1 ? 's' : ''} pendiente{pendingResvs > 1 ? 's' : ''} por atender en Préstamos & Reservas.
        </div>
      )}
    </div>
  );
};
