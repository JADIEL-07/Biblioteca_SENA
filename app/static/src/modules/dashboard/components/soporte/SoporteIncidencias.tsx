import React, { useState, useEffect, useMemo } from 'react';
import { FiAlertCircle, FiCheck, FiClock, FiUser, FiEye, FiActivity, FiBriefcase } from 'react-icons/fi';
import './SoporteIncidencias.css';

interface Incident {
  id: number;
  subject: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: string;
  reported_by: string;
  support_person: string;
  created_at: string;
  photo: string | null;
}

interface SoporteIncidenciasProps {
  user: any;
}

export const SoporteIncidencias: React.FC<SoporteIncidenciasProps> = ({ user }) => {
  const [unassigned, setUnassigned] = useState<Incident[]>([]);
  const [myCases, setMyCases] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'disponibles' | 'mis_casos'>('disponibles');

  // Preview photo states
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [previewIncident, setPreviewIncident] = useState<Incident | null>(null);

  const fetchIncidents = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch unassigned tickets
      const unassignedRes = await fetch('/api/v1/reports_mgmt/unassigned', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (unassignedRes.ok) {
        setUnassigned(await unassignedRes.json());
      }

      // Fetch my tickets
      const myRes = await fetch('/api/v1/reports_mgmt/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (myRes.ok) {
        setMyCases(await myRes.json());
      }
    } catch (error) {
      console.error("Error fetching incidents:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleTakeCase = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/v1/reports_mgmt/${id}/take`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        alert("¡Has tomado el caso con éxito! Ahora aparecerá en la sección 'Mis Casos'.");
        setLoading(true);
        await fetchIncidents();
      } else {
        const err = await res.json();
        alert(err.error || "No se pudo tomar el caso.");
      }
    } catch (error) {
      console.error("Error taking case:", error);
      alert("Error de conexión al tomar el caso.");
    }
  };

  const getSeverityBadge = (sev: string) => {
    const s = sev.toUpperCase();
    if (s === 'LOW') return <span className="severity-badge low">Baja</span>;
    if (s === 'MEDIUM') return <span className="severity-badge medium">Media</span>;
    if (s === 'HIGH') return <span className="severity-badge high">Alta</span>;
    return <span className="severity-badge critical">Crítica</span>;
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

  const handleOpenPreview = (incident: Incident) => {
    if (incident.photo) {
      setPreviewPhoto(incident.photo);
      setPreviewIncident(incident);
    }
  };

  const handleClosePreview = () => {
    setPreviewPhoto(null);
    setPreviewIncident(null);
  };

  const currentList = activeTab === 'disponibles' ? unassigned : myCases;

  return (
    <div className="incidencias-container fade-in">
      <div className="incidencias-header-section">
        <h1>Bandeja de Incidencias</h1>
        <p>Gestiona, asigna y da seguimiento a los reportes de daños enviados por los aprendices.</p>

        {/* SUMMARY STATS GRID */}
        <div className="incidencias-summary-grid">
          <div className="incidencia-stat-card">
            <div className="stat-icon-wrapper available">
              <FiAlertCircle size={22} />
            </div>
            <div className="stat-content">
              <h5>Por atender (Disponibles)</h5>
              <h3>{unassigned.length}</h3>
              <p>Esperando técnico</p>
            </div>
          </div>

          <div className="incidencia-stat-card">
            <div className="stat-icon-wrapper my-cases">
              <FiBriefcase size={22} />
            </div>
            <div className="stat-content">
              <h5>Mis casos en progreso</h5>
              <h3>{myCases.length}</h3>
              <p>Asignados a mí</p>
            </div>
          </div>

          <div className="incidencia-stat-card">
            <div className="stat-icon-wrapper total">
              <FiActivity size={22} />
            </div>
            <div className="stat-content">
              <h5>Total gestionados</h5>
              <h3>{unassigned.length + myCases.length}</h3>
              <p>Incidencias activas</p>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="incidencias-tabs">
          <button
            className={`incidencias-tab-btn ${activeTab === 'disponibles' ? 'active' : ''}`}
            onClick={() => setActiveTab('disponibles')}
          >
            Disponibles ({unassigned.length})
          </button>
          <button
            className={`incidencias-tab-btn ${activeTab === 'mis_casos' ? 'active' : ''}`}
            onClick={() => setActiveTab('mis_casos')}
          >
            Mis Casos ({myCases.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner-container">
          <div className="spinner"></div>
          <p>Cargando incidencias...</p>
        </div>
      ) : currentList.length === 0 ? (
        <div className="incidencias-empty-state">
          <FiCheckCircle size={48} style={{ color: '#39A900' }} />
          <p>No hay reportes de incidencias en esta sección.</p>
        </div>
      ) : (
        <div className="incidencias-table-wrapper">
          <table className="incidencias-table">
            <thead>
              <tr>
                <th>Asunto / Incidencia</th>
                <th>Reportado por</th>
                <th>Fecha de Reporte</th>
                <th>Gravedad</th>
                <th>Evidencia</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentList.map((inc) => (
                <tr key={inc.id}>
                  <td data-label="Asunto" className="item-col" style={{ maxWidth: '300px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <span style={{ color: '#ffffff', fontWeight: 600 }}>{inc.subject}</span>
                      <span style={{ fontSize: '0.85rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {inc.description}
                      </span>
                    </div>
                  </td>
                  <td data-label="Reportado por">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FiUser size={14} style={{ color: '#94a3b8' }} />
                      <span>{inc.reported_by}</span>
                    </div>
                  </td>
                  <td data-label="Fecha">
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ color: '#ffffff' }}>{formatDate(inc.created_at).split(' ')[0]}</span>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{formatDate(inc.created_at).split(' ').slice(1).join(' ')}</span>
                    </div>
                  </td>
                  <td data-label="Gravedad">{getSeverityBadge(inc.severity)}</td>
                  <td data-label="Evidencia">
                    {inc.photo ? (
                      <button className="photo-thumbnail-btn" onClick={() => handleOpenPreview(inc)} title="Ver imagen adjunta">
                        <img src={inc.photo} alt="Evidencia" />
                      </button>
                    ) : (
                      <div className="photo-thumbnail-btn" style={{ cursor: 'default' }} title="Sin foto adjunta">
                        <span className="no-img-icon">📷</span>
                      </div>
                    )}
                  </td>
                  <td data-label="Acciones">
                    {activeTab === 'disponibles' ? (
                      <button className="btn-take-case" onClick={() => handleTakeCase(inc.id)}>
                        <FiCheck size={16} /> Tomar caso
                      </button>
                    ) : (
                      <span className="btn-my-case-active">
                        <FiClock size={16} /> En Progreso
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* FULL-SCREEN GLASSMORPHISM IMAGE PREVIEW MODAL */}
      {previewPhoto && previewIncident && (
        <div className="img-preview-overlay" onClick={handleClosePreview}>
          <div className="img-preview-container" onClick={(e) => e.stopPropagation()}>
            <button className="btn-close-preview" onClick={handleClosePreview}>&times;</button>
            <img src={previewPhoto} alt="Evidencia de daño" />
            <div className="img-preview-caption">
              <h4>{previewIncident.subject}</h4>
              <p>Reportado por <strong>{previewIncident.reported_by}</strong> • {formatDate(previewIncident.created_at)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
