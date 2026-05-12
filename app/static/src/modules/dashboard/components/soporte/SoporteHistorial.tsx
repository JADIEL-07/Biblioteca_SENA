import React, { useState, useEffect, useMemo } from 'react';
import { FiCheckCircle, FiTool, FiAlertCircle, FiTrendingUp, FiUser, FiClock, FiDollarSign, FiSearch, FiFileText } from 'react-icons/fi';
import './SoporteHistorial.css';

interface MaintenanceLog {
  id: number;
  item_name: string;
  item_code: string;
  reported_by_name: string;
  technician_name: string;
  severity: string;
  status: string;
  report_date: string;
  maintenance_type: string;
  cost: number;
}

interface IncidentLog {
  id: number;
  subject: string;
  reported_by: string;
  created_at: string;
  severity: string;
  status: string;
  support_person: string;
}

export const SoporteHistorial: React.FC = () => {
  const [maintenances, setMaintenances] = useState<MaintenanceLog[]>([]);
  const [incidents, setIncidents] = useState<IncidentLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'mantenimiento' | 'incidencias'>('mantenimiento');

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas las categorías');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch maintenance tasks
      const maintRes = await fetch('/api/v1/maintenance/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (maintRes.ok) {
        const data = await maintRes.json();
        // Filter for completed/done ones
        setMaintenances(data.filter((m: any) => m.status === 'COMPLETED'));
      }

      // Fetch apprentice incidents
      const incRes = await fetch('/api/v1/reports_mgmt/all_incidents', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (incRes.ok) {
        const data = await incRes.json();
        // Filter for resolved/closed ones
        setIncidents(data.filter((i: any) => i.status === 'RESOLVED' || i.status === 'CLOSED'));
      }
    } catch (error) {
      console.error("Error fetching historical logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalCosts = useMemo(() => {
    return maintenances.reduce((acc, m) => acc + (m.cost || 0), 0);
  }, [maintenances]);

  const filteredMaintenances = useMemo(() => {
    let filtered = [...maintenances];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(m => 
        m.item_name.toLowerCase().includes(term) ||
        m.technician_name.toLowerCase().includes(term) ||
        m.item_code.toLowerCase().includes(term)
      );
    }
    if (dateFrom) {
      filtered = filtered.filter(m => new Date(m.report_date) >= new Date(dateFrom));
    }
    if (dateTo) {
      filtered = filtered.filter(m => new Date(m.report_date) <= new Date(dateTo));
    }
    return filtered;
  }, [maintenances, searchTerm, dateFrom, dateTo]);

  const filteredIncidents = useMemo(() => {
    let filtered = [...incidents];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(i => 
        i.subject.toLowerCase().includes(term) ||
        i.reported_by.toLowerCase().includes(term)
      );
    }
    if (dateFrom) {
      filtered = filtered.filter(i => new Date(i.created_at) >= new Date(dateFrom));
    }
    if (dateTo) {
      filtered = filtered.filter(i => new Date(i.created_at) <= new Date(dateTo));
    }
    return filtered;
  }, [incidents, searchTerm, dateFrom, dateTo]);

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('Todas las categorías');
    setDateFrom('');
    setDateTo('');
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getSeverityBadge = (sev: string) => {
    const s = sev.toUpperCase();
    if (s === 'LOW') return <span className="severity-badge low">Baja</span>;
    if (s === 'MEDIUM') return <span className="severity-badge medium">Media</span>;
    if (s === 'HIGH') return <span className="severity-badge high">Alta</span>;
    return <span className="severity-badge critical">Crítica</span>;
  };

  return (
    <div className="historial-container fade-in">
      <div className="historial-header-section">
        <h1>Historial Técnico</h1>
        <p>Bitácora de mantenimientos completados y reportes de incidencias resueltos en la sede.</p>

        {/* SUMMARY CARDS */}
        <div className="admin-horizontal-stats">
          <div className="admin-stat-box">
            <div className="admin-stat-icon blue">
              <FiTool size={22} />
            </div>
            <div className="admin-stat-info">
              <p className="admin-stat-title">MANTENIMIENTOS</p>
              <h3 className="admin-stat-value">{maintenances.length}</h3>
            </div>
          </div>
          <div className="admin-stat-box">
            <div className="admin-stat-icon green">
              <FiCheckCircle size={22} />
            </div>
            <div className="admin-stat-info">
              <p className="admin-stat-title">INCIDENCIAS RESUELTAS</p>
              <h3 className="admin-stat-value">{incidents.length}</h3>
            </div>
          </div>
          <div className="admin-stat-box">
            <div className="admin-stat-icon yellow">
              <FiDollarSign size={22} />
            </div>
            <div className="admin-stat-info">
              <p className="admin-stat-title">INVERSIÓN TOTAL</p>
              <h3 className="admin-stat-value">${totalCosts.toLocaleString('es-CO')}</h3>
            </div>
          </div>
        </div>

        {/* FILTERS */}
        <div className="admin-filter-section">
          <div className="admin-filter-row">
            <div className="admin-filter-group flex-2">
              <label>BÚSQUEDA RÁPIDA</label>
              <div className="admin-input-icon">
                <FiSearch className="icon" />
                <input 
                  type="text" 
                  placeholder="Buscar por asunto, técnico o equipo..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="admin-filter-group flex-1">
              <label>TIPO DE REGISTRO</label>
              <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                <option>Todas las categorías</option>
              </select>
            </div>
          </div>
          <div className="admin-filter-row">
            <div className="admin-filter-group flex-1">
              <label>DESDE (FECHA)</label>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
            </div>
            <div className="admin-filter-group flex-1">
              <label>HASTA (FECHA)</label>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
            </div>
            <div className="admin-filter-group-btn">
              <button className="admin-btn-clear" onClick={clearFilters}>Limpiar Filtros</button>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="historial-tabs">
          <button
            className={`historial-tab-btn ${activeTab === 'mantenimiento' ? 'active' : ''}`}
            onClick={() => setActiveTab('mantenimiento')}
          >
            Mantenimientos Finalizados
          </button>
          <button
            className={`historial-tab-btn ${activeTab === 'incidencias' ? 'active' : ''}`}
            onClick={() => setActiveTab('incidencias')}
          >
            Incidencias Resueltas
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner-container">
          <div className="spinner"></div>
          <p>Cargando historial técnico...</p>
        </div>
      ) : activeTab === 'mantenimiento' ? (
        maintenances.length === 0 ? (
          <div className="historial-empty-state">
            <FiCheckCircle size={48} style={{ color: '#10b981' }} />
            <p>No se registran mantenimientos finalizados aún.</p>
          </div>
        ) : (
          <div className="historial-table-wrapper">
            <table className="historial-table">
              <thead>
                <tr>
                  <th>Equipo / Elemento</th>
                  <th>Técnico Responsable</th>
                  <th>Tipo Mantenimiento</th>
                  <th>Fecha de Reporte</th>
                  <th>Inversión / Costo</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {filteredMaintenances.map((m) => (
                  <tr key={m.id}>
                    <td data-label="Equipo" className="item-col">
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ color: 'var(--admin-text-primary)', fontWeight: 600 }}>{m.item_name}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>Código: {m.item_code}</span>
                      </div>
                    </td>
                    <td data-label="Técnico">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FiUser size={14} style={{ color: 'var(--admin-text-muted)' }} />
                        <span style={{ color: 'var(--admin-text-primary)' }}>{m.technician_name}</span>
                      </div>
                    </td>
                    <td data-label="Tipo">
                      <span style={{ textTransform: 'capitalize' }}>
                        {m.maintenance_type === 'PREVENTIVE' ? 'Preventivo' : 'Correctivo'}
                      </span>
                    </td>
                    <td data-label="Fecha">
                      <span>{formatDate(m.report_date).split(' ')[0]}</span>
                    </td>
                    <td data-label="Costo">
                      <span className="cost-label">${(m.cost || 0).toLocaleString('es-CO')}</span>
                    </td>
                    <td data-label="Estado">
                      <span style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                        Completado
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : incidents.length === 0 ? (
        <div className="historial-empty-state">
          <FiCheckCircle size={48} style={{ color: '#3b82f6' }} />
          <p>No se registran incidencias resueltas aún.</p>
        </div>
      ) : (
        <div className="historial-table-wrapper">
          <table className="historial-table">
            <thead>
              <tr>
                <th>Asunto / Incidencia</th>
                <th>Reportado por</th>
                <th>Fecha de Reporte</th>
                <th>Gravedad</th>
                <th>Atendido por</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filteredIncidents.map((i) => (
                <tr key={i.id}>
                  <td data-label="Asunto" className="item-col">
                    <span style={{ color: 'var(--admin-text-primary)', fontWeight: 600 }}>{i.subject}</span>
                  </td>
                  <td data-label="Reportado por">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FiUser size={14} style={{ color: 'var(--admin-text-muted)' }} />
                      <span style={{ color: 'var(--admin-text-primary)' }}>{i.reported_by}</span>
                    </div>
                  </td>
                  <td data-label="Fecha">
                    <span>{formatDate(i.created_at).split(' ')[0]}</span>
                  </td>
                  <td data-label="Gravedad">{getSeverityBadge(i.severity)}</td>
                  <td data-label="Atendido por">
                    <span style={{ color: '#39A900', fontWeight: 600 }}>{i.support_person}</span>
                  </td>
                  <td data-label="Estado">
                    <span style={{ color: '#39A900', background: 'rgba(57, 169, 0, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                      Resuelto
                    </span>
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
