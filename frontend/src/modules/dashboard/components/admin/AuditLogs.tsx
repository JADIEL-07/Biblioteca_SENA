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
  user_phone: string | null;
  user_role: string | null;
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
  const [actionType, setActionType] = useState('ALL');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (actionType && actionType !== 'ALL') params.append('action_type', actionType);

      const response = await fetch(`/api/v1/audit/?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (!response.ok) {
        if (response.status === 403) throw new Error("Acceso denegado: Se requieren permisos de administrador.");
        throw new Error(`Error ${response.status}: No se pudo cargar la auditoría.`);
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        setLogs(data);
      } else {
        setLogs([]);
      }
    } catch (error: any) {
      console.error('Error fetching audit:', error);
      setError(error.message || "Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchLogs();
    }, 400); // 400ms de espera antes de buscar
    return () => clearTimeout(timeoutId);
  }, [searchTerm, startDate, endDate, actionType]);

  const getActionClass = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes('LOGIN')) return 'login';
    if (act.includes('INSERT')) return 'insert';
    if (act.includes('UPDATE')) return 'update';
    if (act.includes('DELETE')) return 'delete';
    if (act.includes('SECURITY')) return 'security';
    return '';
  };

  // Ya no filtramos localmente porque el backend ya lo hace, 
  // pero mantenemos la variable para no romper el resto del componente
  // y agregamos seguridad ante valores nulos por si acaso.
  const filteredLogs = logs.filter(log => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    
    return (
      (log.user?.toLowerCase() || '').includes(s) || 
      (log.user_email?.toLowerCase() || '').includes(s) || 
      (log.user_id?.toLowerCase() || '').includes(s) || 
      (log.user_phone?.toLowerCase() || '').includes(s) || 
      (log.action?.toLowerCase() || '').includes(s) || 
      (log.entity?.toLowerCase() || '').includes(s) ||
      (log.ip?.toLowerCase() || '').includes(s) ||
      (log.details?.toLowerCase() || '').includes(s) ||
      log.id.toString().includes(searchTerm)
    );
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

      {/* BARRA DE FILTROS COMPLEJA */}
      <div className="loan-filters-complex audit-filters">
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
          <div className="filter-item btn-refresh-col">
            <label>ACTUALIZAR</label>
            <button className="btn-refresh-audit" onClick={fetchLogs}>
              <FiRefreshCw className={loading ? 'spin' : ''} /> <span>Refrescar Log</span>
            </button>
          </div>
        </div>

        <div className="filter-row second-row">
          <div className="filter-item date-filter">
            <label>DESDE</label>
            <div className="input-with-icon">
              <FiCalendar />
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
          </div>
          <div className="filter-item date-filter">
            <label>HASTA</label>
            <div className="input-with-icon">
              <FiCalendar />
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
          <div className="filter-item type-filter">
            <label>TIPO DE ACCIÓN</label>
            <div className="input-with-icon">
              <FiActivity />
              <select 
                className="audit-type-select"
                value={actionType} 
                onChange={(e) => setActionType(e.target.value)}
              >
                <option value="ALL">Todas las acciones</option>
                <option value="LOGIN">Inicios de sesión</option>
                <option value="INSERT">Creaciones (Nuevos)</option>
                <option value="UPDATE">Ediciones (Cambios)</option>
                <option value="DELETE">Eliminaciones</option>
                <option value="SECURITY">Seguridad / Bloqueos</option>
              </select>
            </div>
          </div>
          <div className="filter-item-actions">
            <button className="btn-reset-audit" onClick={() => {
              setSearchTerm(''); setStartDate(''); setEndDate(''); setActionType('ALL');
            }}>Limpiar</button>
          </div>
        </div>
      </div>

      {/* TABLA DE AUDITORÍA */}
      <div className="audit-table-wrapper responsive-table">
        <table className="audit-table">
          <thead>
            <tr>
              <th className="col-id">ID</th>
              <th className="col-date">Fecha / Hora</th>
              <th>Usuario / Rol</th>
              <th>Acción</th>
              <th className="col-entity">Entidad / Recurso</th>
              <th className="col-ip">IP Origen</th>
              <th style={{ textAlign: 'center' }}>Detalles</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="loading-cell">Escaneando registros en tiempo real...</td></tr>
            ) : error ? (
              <tr><td colSpan={7} className="no-data-cell" style={{ color: '#ef4444' }}>{error}</td></tr>
            ) : filteredLogs.length === 0 ? (
              <tr><td colSpan={7} className="no-data-cell">No se encontraron registros para los filtros seleccionados.</td></tr>
            ) : (
              filteredLogs.map(log => (
                <tr key={log.id}>
                  <td className="col-id"><span className="id-badge">#{log.id}</span></td>
                  <td className="col-date">
                    <div className="date-cell">
                      <strong>{new Date(log.created_at).toLocaleDateString()}</strong>
                      <small>{new Date(log.created_at).toLocaleTimeString()}</small>
                    </div>
                  </td>
                  <td>
                    <div className="user-info-cell">
                      <span className="u-name">{log.user || 'SISTEMA'}</span>
                      <span className="u-role">{log.user_role || 'SISTEMA'}</span>
                      <span className="u-email">{log.user_email || 'automated-task'}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`action-pill ${getActionClass(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="col-entity">
                    <div className="entity-info-cell">
                      <strong>{log.entity_name || log.entity}</strong>
                      <small>{log.entity.toUpperCase()} (ID: {log.entity_id})</small>
                    </div>
                  </td>
                  <td className="col-ip">
                    <div className="ip-badge"><FiGlobe /> {log.ip}</div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
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
