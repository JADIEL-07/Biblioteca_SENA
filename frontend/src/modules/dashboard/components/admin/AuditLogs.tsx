import React, { useState, useEffect } from 'react';
import { 
  FiShield, FiRefreshCw, FiSearch, FiCalendar, FiUser, 
  FiEye, FiFilter, FiActivity, FiGlobe 
} from 'react-icons/fi';
import './AuditLogs.css';

interface AuditLog {
  id: number;
  user: string;
  user_id: string | null;
  user_email: string | null;
  action: string;
  entity: string;
  entity_id: number;
  entity_name: string | null;
  ip: string;
  user_agent: string;
  details: string | null;
  created_at: string;
}

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        startDate: startDate,
        endDate: endDate
      });
      const response = await fetch(`/api/v1/audit/?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (response.ok) setLogs(data);
    } catch (error) {
      console.error('Error fetching audit:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [searchTerm, startDate, endDate]);

  const getActionClass = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes('LOGIN')) return 'login';
    if (act.includes('INSERT')) return 'insert';
    if (act.includes('UPDATE')) return 'update';
    if (act.includes('DELETE')) return 'delete';
    if (act.includes('SECURITY')) return 'security';
    return '';
  };

  const filteredLogs = logs.filter(log => {
    const s = searchTerm.toLowerCase();
    const logDate = new Date(log.created_at);
    
    const matchesSearch = 
      log.user.toLowerCase().includes(s) || 
      log.action.toLowerCase().includes(s) || 
      log.entity.toLowerCase().includes(s) ||
      log.id.toString().includes(searchTerm);
    
    const start = startDate ? new Date(startDate + 'T00:00:00') : null;
    const end = endDate ? new Date(endDate + 'T23:59:59') : null;
    let matchesDate = true;
    if (start && logDate < start) matchesDate = false;
    if (end && logDate > end) matchesDate = false;
    
    return matchesSearch && matchesDate;
  });

  return (
    <div className="audit-management fade-in">
      <div className="audit-header">
        <div className="header-title">
          <div className="header-icon-box"><FiShield /></div>
          <div>
            <h1>Auditoría del Sistema</h1>
            <p>Registro completo de transacciones y seguridad</p>
          </div>
        </div>
      </div>

      {/* BARRA DE FILTROS COMPLEJA (Consistente con los demás) */}
      <div className="loan-filters-complex">
        <div className="filter-row">
          <div className="filter-item search">
            <label>BÚSQUEDA GLOBAL</label>
            <div className="input-with-icon">
              <FiSearch />
              <input 
                type="text" 
                placeholder="Usuario, acción, ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="filter-item">
            <label>ACTUALIZAR</label>
            <button className="btn-reset" onClick={fetchLogs} style={{ width: '100%', height: '45px' }}>
              <FiRefreshCw className={loading ? 'spin' : ''} /> Refrescar Log
            </button>
          </div>
        </div>

        <div className="filter-row">
          <div className="filter-item">
            <label>DESDE (FECHA)</label>
            <div className="input-with-icon">
              <FiCalendar />
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
          </div>
          <div className="filter-item">
            <label>HASTA (FECHA)</label>
            <div className="input-with-icon">
              <FiCalendar />
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
          <div className="filter-item-actions">
            <button className="btn-reset" onClick={() => {
              setSearchTerm(''); setStartDate(''); setEndDate('');
            }}>Limpiar</button>
          </div>
        </div>
      </div>

      {/* TABLA DE AUDITORÍA */}
      <div className="audit-table-wrapper">
        <table className="audit-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha / Hora</th>
              <th>Usuario</th>
              <th>Acción</th>
              <th>Entidad</th>
              <th>IP Origen</th>
              <th>Detalles</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>Escaneando registros...</td></tr>
            ) : filteredLogs.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>No hay registros para este filtro.</td></tr>
            ) : (
              filteredLogs.map(log => (
                <tr key={log.id}>
                  <td><span className="id-badge">#{log.id}</span></td>
                  <td>
                    <div className="date-cell">
                      <strong>{new Date(log.created_at).toLocaleDateString()}</strong><br/>
                      <small>{new Date(log.created_at).toLocaleTimeString()}</small>
                    </div>
                  </td>
                  <td>
                    <div className="user-info-cell">
                      <span className="u-name">{log.user || 'SISTEMA'}</span>
                      <span className="u-email">{log.user_email || 'automated-task'}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`action-pill ${getActionClass(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <strong>{log.entity}</strong>
                      <small>ID: {log.entity_id}</small>
                    </div>
                  </td>
                  <td>
                    <div className="ip-badge"><FiGlobe /> {log.ip}</div>
                  </td>
                  <td>
                    <button className="btn-detail" onClick={() => setSelectedLog(log)}>
                      <FiEye />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DETALLE JSON */}
      {selectedLog && (
        <div className="audit-modal-overlay" onClick={() => setSelectedLog(null)}>
          <div className="audit-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detalle de Transacción #{selectedLog.id}</h3>
              <button className="btn-close" onClick={() => setSelectedLog(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                <strong>User Agent:</strong> {selectedLog.user_agent}
              </div>
              <div className="json-viewer">
                {selectedLog.details ? (
                  <pre>{JSON.stringify(JSON.parse(selectedLog.details), null, 2)}</pre>
                ) : (
                  '// Sin cambios de datos registrados.'
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
