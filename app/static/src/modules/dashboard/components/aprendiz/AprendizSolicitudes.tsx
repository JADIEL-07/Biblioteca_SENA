import React, { useState, useEffect, useCallback } from 'react';
import { FiHeadphones, FiClock, FiAlertCircle, FiCheckCircle, FiMessageSquare, FiArrowLeft, FiInbox } from 'react-icons/fi';
import { ChatWindow } from '../../../shared/ChatWindow';
import './AprendizSolicitudes.css';

interface TicketSummary {
  id: number;
  subject: string;
  status: string;
  severity: string;
  assigned_to_name: string | null;
  created_at: string;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
}

export const AprendizSolicitudes: React.FC = () => {
  const [tickets, setTickets] = useState<TicketSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<TicketSummary | null>(null);

  const fetchTickets = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/v1/chat/tickets/mine', {
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
    // Refrescar la lista cada 10s en background
    const interval = setInterval(fetchTickets, 10000);
    return () => clearInterval(interval);
  }, [fetchTickets]);

  const formatDate = (iso: string | null) => {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      const now = new Date();
      const isToday = d.toDateString() === now.toDateString();
      if (isToday) {
        return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
      }
      return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
    } catch {
      return '';
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    if (s === 'OPEN') return <span className="ticket-status-badge open"><FiClock size={12} /> Esperando</span>;
    if (s === 'IN_PROGRESS') return <span className="ticket-status-badge in-progress"><FiMessageSquare size={12} /> En conversación</span>;
    if (s === 'CLOSED') return <span className="ticket-status-badge closed"><FiCheckCircle size={12} /> Resuelto</span>;
    return <span className="ticket-status-badge">{status}</span>;
  };

  if (selectedTicket) {
    return (
      <div className="aprendiz-solicitudes-container fade-in">
        <button className="back-to-list-btn" onClick={() => { setSelectedTicket(null); fetchTickets(); }}>
          <FiArrowLeft size={16} /> Volver a mis solicitudes
        </button>
        <ChatWindow
          endpoint={`/api/v1/chat/tickets/${selectedTicket.id}/messages`}
          title={selectedTicket.assigned_to_name ? `Soporte: ${selectedTicket.assigned_to_name}` : 'Esperando agente de soporte...'}
          subtitle={`Solicitud #${selectedTicket.id} · ${selectedTicket.subject}`}
          emptyMessage="Aún no hay mensajes en esta conversación."
          disabled={selectedTicket.status === 'CLOSED' || selectedTicket.status === 'CANCELLED'}
          disabledReason={selectedTicket.status === 'CLOSED' ? 'Esta solicitud fue cerrada por Soporte.' : 'Esta solicitud fue cancelada.'}
        />
      </div>
    );
  }

  return (
    <div className="aprendiz-solicitudes-container fade-in">
      <div className="aprendiz-solicitudes-header">
        <div className="header-icon-wrapper">
          <FiHeadphones size={28} />
        </div>
        <div>
          <h1>Mis Solicitudes</h1>
          <p>Conversaciones con el equipo de Soporte Técnico. Pueden iniciarse desde el Asistente cuando no logra resolver tu duda.</p>
        </div>
      </div>

      {loading ? (
        <div className="solicitudes-loading">Cargando tus solicitudes...</div>
      ) : tickets.length === 0 ? (
        <div className="solicitudes-empty">
          <FiInbox size={48} />
          <h3>Aún no tienes solicitudes</h3>
          <p>
            Si el asistente no puede resolver tu duda, te ofrecerá crear una solicitud para que un agente de Soporte
            Técnico te atienda por chat. Ve al <strong>Asistente personal</strong> e intenta preguntar.
          </p>
        </div>
      ) : (
        <div className="solicitudes-list">
          {tickets.map((t) => (
            <button key={t.id} className="solicitud-item" onClick={() => setSelectedTicket(t)}>
              <div className="solicitud-item-left">
                <div className="solicitud-icon">
                  <FiHeadphones />
                </div>
                <div className="solicitud-content">
                  <div className="solicitud-top-row">
                    <h4>{t.subject}</h4>
                    {t.unread_count > 0 && (
                      <span className="unread-badge">{t.unread_count}</span>
                    )}
                  </div>
                  <p className="solicitud-preview">
                    {t.last_message ? t.last_message : 'Sin mensajes todavía.'}
                  </p>
                  <div className="solicitud-meta">
                    {getStatusBadge(t.status)}
                    {t.assigned_to_name && (
                      <span className="solicitud-assignee">· Atiende: {t.assigned_to_name}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="solicitud-time">
                {formatDate(t.last_message_at || t.created_at)}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
