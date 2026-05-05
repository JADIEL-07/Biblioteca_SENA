import React, { useState, useEffect, useCallback } from 'react';
import { FiCalendar, FiClock, FiCheck, FiUsers, FiInfo, FiImage, FiPackage } from 'react-icons/fi';
import './AprendizReservations.css';

interface Res {
  id: number;
  item_id: number;
  item_name: string;
  item_code: string;
  item_category: string;
  item_location: string;
  item_image_url: string | null;
  reservation_date: string;
  ready_at: string | null;
  expiration_date: string | null;
  status: 'QUEUED' | 'READY' | 'CLAIMED' | 'EXPIRED' | 'CANCELLED';
  queue_position: number | null;
}

const statusConfig = (s: string) => {
  switch(s) {
    case 'QUEUED': return { label: 'En espera', type: 'warning' };
    case 'READY': return { label: 'Lista para reclamar', type: 'primary' };
    case 'CLAIMED': return { label: 'Completada', type: 'success' };
    case 'EXPIRED': return { label: 'Expirada', type: 'danger' };
    case 'CANCELLED': return { label: 'Cancelada', type: 'danger' };
    default: return { label: s, type: 'default' };
  }
};

const formatTimeRemaining = (iso: string) => {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return { text: 'Expirada', isWarning: true };
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const d = Math.floor(h / 24);
  
  if (d > 0) return { text: `${d} día${d > 1 ? 's' : ''}`, isWarning: false };
  if (h > 0) return { text: `${h}h ${m}m`, isWarning: h < 12 };
  return { text: `${m}m`, isWarning: true };
};

const formatDateObj = (iso: string) => {
  const d = new Date(iso);
  const dateStr = d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeStr = d.toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase();
  return `${dateStr} - ${timeStr}`;
};

export const AprendizReservations: React.FC = () => {
  const [reservations, setReservations] = useState<Res[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'activas' | 'completadas' | 'canceladas'>('activas');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // active=false para traer todas y filtrarlas en el frontend
      const r = await fetch('/api/v1/reservations/my?active=false', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (r.ok) setReservations(await r.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const activeRes = reservations.filter(r => r.status === 'READY' || r.status === 'QUEUED');
  const completedRes = reservations.filter(r => r.status === 'CLAIMED');
  const cancelledRes = reservations.filter(r => r.status === 'CANCELLED' || r.status === 'EXPIRED');

  const getDisplayedReservations = () => {
    if (activeTab === 'activas') return activeRes;
    if (activeTab === 'completadas') return completedRes;
    return cancelledRes;
  };

  const readyToClaimCount = activeRes.filter(r => r.status === 'READY').length;
  const firstReadyRes = activeRes.find(r => r.status === 'READY' && r.expiration_date);

  return (
    <div className="res-container fade-in">
      <div className="res-header-section">
        <h1>Mis reservas</h1>
        <p>Consulta tus reservas activas y pasadas.</p>
        
        <div className="res-tabs">
          <button 
            className={`res-tab-btn ${activeTab === 'activas' ? 'active' : ''}`}
            onClick={() => setActiveTab('activas')}
          >
            Activas
          </button>
          <button 
            className={`res-tab-btn ${activeTab === 'completadas' ? 'active' : ''}`}
            onClick={() => setActiveTab('completadas')}
          >
            Completadas
          </button>
          <button 
            className={`res-tab-btn ${activeTab === 'canceladas' ? 'active' : ''}`}
            onClick={() => setActiveTab('canceladas')}
          >
            Canceladas
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner-container">
          <div className="spinner"></div>
          <p>Cargando reservas...</p>
        </div>
      ) : getDisplayedReservations().length === 0 ? (
        <div className="res-empty-state">
          <FiCalendar size={48} />
          <p>No tienes reservas en esta categoría.</p>
        </div>
      ) : (
        <div className="res-cards-list">
          {getDisplayedReservations().map(res => {
            const config = statusConfig(res.status);
            const remaining = res.expiration_date ? formatTimeRemaining(res.expiration_date) : null;
            
            return (
              <div key={res.id} className="res-item-card">
                <div className="res-item-image">
                  {res.item_image_url ? (
                    <img src={res.item_image_url} alt={res.item_name} />
                  ) : (
                    <div className="placeholder-img"><FiPackage size={32} /></div>
                  )}
                </div>
                
                <div className="res-item-details">
                  <span className={`res-status-badge ${config.type}`}>{config.label}</span>
                  <h3 className="res-item-title">{res.item_name}</h3>
                  <p className="res-item-meta">
                    Código: {res.item_code} • {res.item_location}
                  </p>
                  <p className="res-item-date">
                    Reservado el: {formatDateObj(res.reservation_date)}
                  </p>
                </div>
                
                <div className="res-item-actions">
                  {(res.status === 'READY' || res.status === 'QUEUED') && (
                    <div className="res-expiry-info">
                      <p className="expiry-label">
                        {res.status === 'READY' ? 'Expira en:' : 'Tiempo estimado:'}
                      </p>
                      {res.status === 'READY' && remaining && (
                        <>
                          <h4 className={`expiry-time ${remaining.isWarning ? 'warning-text' : 'safe-text'}`}>
                            {remaining.text}
                          </h4>
                          <p className="expiry-date">{formatDateObj(res.expiration_date!)}</p>
                        </>
                      )}
                      {res.status === 'QUEUED' && (
                        <>
                          <h4 className="expiry-time warning-text">
                            En espera
                          </h4>
                          <p className="expiry-date">Posición {res.queue_position} en la cola</p>
                        </>
                      )}
                    </div>
                  )}
                  
                  <button className="res-action-btn">Ver detalles</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
