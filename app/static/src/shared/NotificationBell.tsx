import React, { useEffect, useRef, useState, useCallback } from 'react';
import { FiBell, FiCheck, FiClock, FiPackage, FiAlertCircle } from 'react-icons/fi';
import './NotificationBell.css';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  related_type?: string;
  related_id?: number;
  is_read: boolean;
  date: string;
}

const POLL_MS = 30000;

const iconFor = (type: string) => {
  switch (type) {
    case 'RESERVATION_READY':    return <FiCheck />;
    case 'RESERVATION_REMINDER': return <FiClock />;
    case 'RESERVATION_EXPIRED':  return <FiAlertCircle />;
    case 'LOAN_CREATED':
    case 'LOAN_RETURNED':        return <FiPackage />;
    default:                     return <FiBell />;
  }
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'ahora';
  if (min < 60) return `hace ${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `hace ${hr}h`;
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
};

export const NotificationBell: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const authHeader = (): HeadersInit => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchUnread = useCallback(async () => {
    try {
      const r = await fetch('/api/v1/notifications/unread-count', { headers: authHeader() });
      if (r.ok) {
        const data = await r.json();
        setUnread(data.count || 0);
      }
    } catch {/* swallow */}
  }, []);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/v1/notifications/?limit=20', { headers: authHeader() });
      if (r.ok) setItems(await r.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUnread();
    const id = setInterval(fetchUnread, POLL_MS);
    return () => clearInterval(id);
  }, [fetchUnread]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleToggle = () => {
    const next = !open;
    setOpen(next);
    if (next) fetchList();
  };

  const markRead = async (id: number) => {
    await fetch(`/api/v1/notifications/${id}/read`, {
      method: 'POST',
      headers: authHeader(),
    });
    setItems(prev => prev.filter(n => n.id !== id));
    fetchUnread();
  };

  const markAllRead = async () => {
    await fetch('/api/v1/notifications/read-all', {
      method: 'POST',
      headers: authHeader(),
    });
    setItems([]);
    setUnread(0);
  };

  return (
    <div className="notif-bell" ref={ref}>
      <button
        className="notif-bell-btn"
        onClick={handleToggle}
        aria-label={`Notificaciones${unread ? `, ${unread} sin leer` : ''}`}
      >
        <FiBell size={20} />
        {unread > 0 && <span className="notif-badge">{unread > 99 ? '99+' : unread}</span>}
      </button>

      {open && (
        <div className="notif-dropdown" role="menu">
          <div className="notif-dropdown-header">
            <span>Notificaciones</span>
            {items.some(n => !n.is_read) && (
              <button className="notif-link" onClick={markAllRead}>
                Marcar todas como leídas
              </button>
            )}
          </div>

          <div className="notif-list">
            {loading && <div className="notif-empty">Cargando…</div>}
            {!loading && items.length === 0 && (
              <div className="notif-empty">No tienes notificaciones</div>
            )}
            {!loading && items.map(n => (
              <button
                key={n.id}
                className={`notif-item ${n.is_read ? '' : 'unread'}`}
                onClick={() => !n.is_read && markRead(n.id)}
              >
                <span className="notif-icon">{iconFor(n.type)}</span>
                <span className="notif-body">
                  {n.title && <strong className="notif-title">{n.title}</strong>}
                  <span className="notif-msg">{n.message}</span>
                  <span className="notif-time">{formatDate(n.date)}</span>
                </span>
                {!n.is_read && <span className="notif-dot" aria-hidden />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
