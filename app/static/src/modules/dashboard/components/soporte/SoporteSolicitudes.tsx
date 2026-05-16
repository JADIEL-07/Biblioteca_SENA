import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FiHeadphones, FiClock, FiMessageSquare, FiArrowLeft,
  FiInbox, FiUser, FiCheckCircle
} from 'react-icons/fi';
import { ChatWindow } from '../../../shared/ChatWindow';
import './SoporteSolicitudes.css';

interface AssignedTicket {
  id: number;
  subject: string;
  status: string;
  severity: string;
  reporter_name: string;
  reporter_id: string;
  assigned_to: string | null;
  is_mine: boolean;
  is_unassigned: boolean;
  created_at: string;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
}

interface SoporteSolicitudesProps {
  user: any;
}

export const SoporteSolicitudes: React.FC<SoporteSolicitudesProps> = ({ user }) => {
  const [tickets, setTickets] = useState<AssignedTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<AssignedTicket | null>(null);
  const [activeTab, setActiveTab] = useState<'inbox' | 'mine' | 'closed'>('inbox');

  const fetchTickets = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/v1/chat/tickets/assigned', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
      }
    } catch (err) {
      console.error('Error cargando solicitudes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
    const interval = setInterval(fetchTickets, 8000);
    return () => clearInterval(interval);
  }, [fetchTickets]);

  const visibleTickets = useMemo(() => {
    if (activeTab === 'inbox') return tickets.filter((t) => t.is_unassigned && t.status === 'OPEN');
    if (activeTab === 'mine') return tickets.filter((t) => t.is_mine && t.status !== 'CLOSED' && t.status !== 'CANCELLED');
    return tickets.filter((t) => t.is_mine && (t.status === 'CLOSED' || t.status === 'CANCELLED'));
  }, [tickets, activeTab]);

  const counts = useMemo(() => ({
    inbox: tickets.filter((t) => t.is_unassigned && t.status === 'OPEN').length,
    mine: tickets.filter((t) => t.is_mine && t.status !== 'CLOSED' && t.status !== 'CANCELLED').length,
    closed: tickets.filter((t) => t.is_mine && (t.status === 'CLOSED' || t.status === 'CANCELLED')).length,
    unread: tickets.reduce((sum, t) => sum + (t.unread_count || 0), 0),
  }), [tickets]);

  const formatDate = (iso: string | null) => {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      const now = new Date();
      const isToday = d.toDateString() === now.toDateString();
      if (isToday) return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
      return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
    } catch {
      return '';
    }
  };

  if (selectedTicket) {
    const isClosed = selectedTicket.status === 'CLOSED' || selectedTicket.status === 'CANCELLED';
    return (
      <div className="soporte-solicitudes-container fade-in">
        <button className="back-to-list-btn" onClick={() => { setSelectedTicket(null); fetchTickets(); }}>
          <FiArrowLeft size={16} /> Volver a la bandeja
        </button>
        <ChatWindow
          endpoint={`/api/v1/chat/tickets/${selectedTicket.id}/messages`}
          title={`Aprendiz: ${selectedTicket.reporter_name}`}
          subtitle={`Solicitud #${selectedTicket.id} · ${selectedTicket.subject}`}
          showCloseButton={selectedTicket.is_mine && !isClosed}
          closeEndpoint={`/api/v1/chat/tickets/${selectedTicket.id}/close`}
          onClose={() => { setSelectedTicket(null); fetchTickets(); }}
          disabled={isClosed}
          disabledReason={isClosed ? 'Esta solicitud está cerrada.' : undefined}
        />
      </div>
    );
  }

  return (
    <div className="soporte-solicitudes-container fade-in">
      <div className="soporte-solicitudes-header">
        <div className="header-icon-wrapper">
          <FiHeadphones size={28} />
        </div>
        <div>
          <h1>Solicitudes de Aprendices</h1>
          <p>Chats activos con aprendices que escalaron desde el Asistente Personal. Tu canal es exclusivo con ellos.</p>
        </div>
      </div>

      <div className="soporte-stats-row">
        <div className="stat-card">
          <FiInbox size={20} />
          <div>
            <p>Bandeja sin asignar</p>
            <h3>{counts.inbox}</h3>
          </div>
        </div>
        <div className="stat-card mine">
          <FiMessageSquare size={20} />
          <div>
            <p>Mis casos activos</p>
            <h3>{counts.mine}</h3>
          </div>
        </div>
        <div className="stat-card unread">
          <FiClock size={20} />
          <div>
            <p>Mensajes sin leer</p>
            <h3>{counts.unread}</h3>
          </div>
        </div>
      </div>

      <div className="soporte-tabs">
        <button className={activeTab === 'inbox' ? 'active' : ''} onClick={() => setActiveTab('inbox')}>
          Bandeja ({counts.inbox})
        </button>
        <button className={activeTab === 'mine' ? 'active' : ''} onClick={() => setActiveTab('mine')}>
          Mis casos ({counts.mine})
        </button>
        <button className={activeTab === 'closed' ? 'active' : ''} onClick={() => setActiveTab('closed')}>
          Cerrados ({counts.closed})
        </button>
      </div>

      {loading ? (
        <div className="solicitudes-loading">Cargando solicitudes...</div>
      ) : visibleTickets.length === 0 ? (
        <div className="solicitudes-empty">
          <FiInbox size={48} />
          <p>
            {activeTab === 'inbox' && 'No hay solicitudes nuevas en la bandeja. Cuando un aprendiz escale desde el asistente, aparecerá aquí.'}
            {activeTab === 'mine' && 'No tienes casos activos. Toma uno de la bandeja para empezar.'}
            {activeTab === 'closed' && 'No tienes casos cerrados.'}
          </p>
        </div>
      ) : (
        <div className="solicitudes-list">
          {visibleTickets.map((t) => (
            <button key={t.id} className={`solicitud-row ${t.unread_count > 0 ? 'unread' : ''}`} onClick={() => setSelectedTicket(t)}>
              <div className="solicitud-row-left">
                <div className="solicitud-row-icon">
                  <FiUser />
                </div>
                <div className="solicitud-row-content">
                  <div className="solicitud-row-top">
                    <h4>{t.reporter_name}</h4>
                    {t.unread_count > 0 && <span className="unread-pill">{t.unread_count}</span>}
                  </div>
                  <p className="solicitud-row-subject">{t.subject}</p>
                  <p className="solicitud-row-preview">
                    {t.last_message || 'Sin mensajes aún.'}
                  </p>
                </div>
              </div>
              <div className="solicitud-row-right">
                <span className="solicitud-row-time">{formatDate(t.last_message_at || t.created_at)}</span>
                {t.status === 'CLOSED' && (
                  <span className="closed-tag"><FiCheckCircle size={12} /> Cerrado</span>
                )}
                {t.is_unassigned && (
                  <span className="new-tag">Nuevo</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
