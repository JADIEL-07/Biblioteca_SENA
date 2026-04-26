import React, { useState, useEffect } from 'react';
import { 
  FiTool, FiAlertTriangle, FiCheckCircle, FiClock, FiDollarSign, 
  FiUser, FiPackage, FiFilter, FiSearch, FiPlus, FiMoreVertical, FiCalendar 
} from 'react-icons/fi';
import './MaintenanceManagement.css';

interface Maintenance {
  id: number;
  item_name: string;
  item_category?: string;
  item_id: number;
  reported_by_name: string;
  reported_by_email: string;
  technician_name: string;
  technician_email: string;
  item_code: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  report_date: string;
  maintenance_type: 'PREVENTIVE' | 'CORRECTIVE';
  cost: number;
}

export const MaintenanceManagement: React.FC = () => {
  const [records, setRecords] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const categories = Array.from(new Set(records.map(r => r.item_category || 'N/A')));

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        startDate: startDate,
        endDate: endDate,
        severity: filterSeverity
      });

      const response = await fetch(`/api/v1/maintenance/?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setRecords(data);
      }
    } catch (error) {
      console.error('Error fetching maintenance:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchTerm, startDate, endDate, filterSeverity]);

  const getSeverityBadge = (sev: string) => {
    return <span className={`sev-badge ${sev.toLowerCase()}`}>{sev}</span>;
  };

  const getStatusBadge = (status: string) => {
    return <span className={`status-pill ${status.toLowerCase()}`}>{status}</span>;
  };

  const filteredRecords = records.filter(r => {
    const s = searchTerm.toLowerCase();
    const maintDate = new Date(r.report_date);
    
    const matchesSearch = 
      r.item_name.toLowerCase().includes(s) || 
      (r.item_code?.toLowerCase() || '').includes(s) ||
      r.reported_by_name.toLowerCase().includes(s) ||
      (r.reported_by_email?.toLowerCase() || '').includes(s) ||
      (r.technician_name?.toLowerCase() || '').includes(s) ||
      r.id.toString().includes(searchTerm);
    const matchesSev = filterSeverity === 'ALL' || r.severity === filterSeverity;
    const matchesCategory = filterCategory === 'ALL' || r.item_category === filterCategory;
    
    const start = startDate ? new Date(startDate + 'T00:00:00') : null;
    const end = endDate ? new Date(endDate + 'T23:59:59') : null;
    let matchesDate = true;
    if (start && maintDate < start) matchesDate = false;
    if (end && maintDate > end) matchesDate = false;
    
    return matchesSearch && matchesSev && matchesCategory && matchesDate;
  });

  return (
    <div className="maint-mgmt-container fade-in">
      <div className="maint-mgmt-header">
        <div className="header-title">
          <div className="header-icon-box"><FiTool /></div>
          <div>
            <h1>Gestión Técnica (Mantenimiento)</h1>
            <p>Control de reparaciones, diagnósticos y costos</p>
          </div>
        </div>
      </div>

      <div className="maint-stats-summary">
        <div className="mini-stat">
          <FiAlertTriangle className="icon critical" />
          <div><span>Críticos</span><strong>{records.filter(r => r.severity === 'CRITICAL').length}</strong></div>
        </div>
        <div className="mini-stat">
          <FiClock className="icon pending" />
          <div><span>Pendientes</span><strong>{records.filter(r => r.status === 'PENDING').length}</strong></div>
        </div>
        <div className="mini-stat">
          <FiDollarSign className="icon cost" />
          <div><span>Costo Total</span><strong>${records.reduce((acc, curr) => acc + curr.cost, 0).toLocaleString()}</strong></div>
        </div>
      </div>

      {/* FILTROS COMPLEJOS */}
      <div className="loan-filters-complex">
        <div className="filter-row">
          <div className="filter-item search">
            <label>BÚSQUEDA RÁPIDA</label>
            <div className="input-with-icon">
              <FiSearch />
              <input 
                type="text" 
                placeholder="Nombre o ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="filter-item">
            <label>CATEGORÍA DEL ELEMENTO</label>
            <div className="input-with-icon">
              <FiPackage />
              <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                <option value="ALL">Todas las categorias</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="filter-row">
          <div className="filter-item">
            <label>DESDE (FECHA)</label>
            <div className="input-with-icon">
              <FiCalendar />
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
          </div>

          <div className="filter-item">
            <label>HASTA (FECHA)</label>
            <div className="input-with-icon">
              <FiCalendar />
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          
          <div className="filter-item-actions">
            <button className="btn-reset" onClick={() => {
              setStartDate('');
              setEndDate('');
              setFilterCategory('ALL');
              setSearchTerm('');
              setFilterSeverity('ALL');
            }}>Limpiar Filtros</button>
          </div>
        </div>
      </div>

      <div className="maint-table-wrapper">
        <table className="maint-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Equipo / Elemento</th>
              <th>Reportado por</th>
              <th>Técnico</th>
              <th>Gravedad</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th>Costo</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} className="td-center">Cargando reportes técnicos...</td></tr>
            ) : filteredRecords.map(m => (
              <tr key={m.id}>
                <td><span className="id-badge">#{m.id}</span></td>
                <td>
                  <div className="item-cell">
                    <FiPackage className="cell-icon" />
                    <div className="cell-text">
                      <span className="main">{m.item_name}</span>
                      <span className="sub">ID: #{m.item_id}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="user-cell">
                    <FiUser className="cell-icon" />
                    <span>{m.reported_by_name}</span>
                  </div>
                </td>
                <td>
                  <div className="user-cell">
                    <FiTool className="cell-icon" />
                    <span>{m.technician_name}</span>
                  </div>
                </td>
                <td>{getSeverityBadge(m.severity)}</td>
                <td><span className="type-badge">{m.maintenance_type}</span></td>
                <td>{getStatusBadge(m.status)}</td>
                <td className="cost-cell">${m.cost.toLocaleString()}</td>
                <td className="date-cell">{new Date(m.report_date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
