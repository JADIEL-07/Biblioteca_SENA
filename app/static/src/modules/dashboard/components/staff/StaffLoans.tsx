import React, { useState, useEffect, useRef } from 'react';
import { FiSearch, FiCheckCircle, FiClock, FiXCircle, FiPackage, FiUser, FiCamera } from 'react-icons/fi';
import './StaffLoans.css';

interface Reservation {
  id: number; item_id: number; item_name: string;
  user_name: string; document: string;
  start_date: string; end_date: string; status: string;
}

interface Loan {
  id: number; item_name: string; user_name: string;
  loan_date: string; due_date: string;
  return_date: string | null; status: string;
}

export const StaffLoans: React.FC<{ user: any }> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'scan' | 'history'>('scan');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [scanInput, setScanInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scanInputRef = useRef<HTMLInputElement>(null);

  const token = () => localStorage.getItem('token');
  const depId = user?.dependency_id;

  const fetchReservations = async () => {
    try {
      // Filtrar reservas que pertenecen a los items de esta dependencia
      const res = await fetch(`/api/v1/reservations/?dependency_id=${depId || ''}`, {
        headers: { Authorization: `Bearer ${token()}` }
      });
      if (res.ok) {
        const data = await res.json();
        setReservations(data.filter((r: any) => r.status === 'PENDING'));
      }
    } catch (e) { console.error(e); }
  };

  const fetchLoans = async () => {
    try {
      const res = await fetch(`/api/v1/loans/?dependency_id=${depId || ''}`, {
        headers: { Authorization: `Bearer ${token()}` }
      });
      if (res.ok) setLoans(await res.json());
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (activeTab === 'scan') fetchReservations();
    else fetchLoans();
  }, [activeTab]);

  const handleApproveReservation = async (id: number) => {
    if (!window.confirm('¿Confirmar entrega de este elemento al aprendiz?')) return;
    try {
      const res = await fetch(`/api/v1/reservations/${id}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token()}` }
      });
      if (res.ok) {
        alert('Préstamo creado y elemento entregado con éxito.');
        fetchReservations();
      } else {
        const err = await res.json();
        alert(`Error: ${err.error || 'No se pudo aprobar'}`);
      }
    } catch (e) { alert('Error de red'); }
  };

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanInput.trim()) return;
    
    // Buscar si el input coincide con alguna reserva por ID o documento de usuario
    const match = reservations.find(r => 
      r.id.toString() === scanInput.trim() || 
      r.document === scanInput.trim()
    );

    if (match) {
      handleApproveReservation(match.id);
    } else {
      alert(`No se encontró reserva pendiente para el código o documento: ${scanInput}`);
    }
    setScanInput('');
  };

  return (
    <div className="staff-loans-container">
      <div className="staff-loans-header">
        <h1>Punto de Atención y Préstamos</h1>
        <div className="tabs">
          <button className={`tab-btn ${activeTab === 'scan' ? 'active' : ''}`} onClick={() => setActiveTab('scan')}>
            <FiCheckCircle /> Entregar Reservas
          </button>
          <button className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
            <FiClock /> Historial de Préstamos
          </button>
        </div>
      </div>

      {activeTab === 'scan' && (
        <div className="scan-section">
          <div className="scanner-card">
            <h2><FiCamera /> Escáner Rápido</h2>
            <p>Escanea el código de barras de la reserva o la tarjeta de identidad del aprendiz para hacer la entrega automática.</p>
            <form onSubmit={handleScanSubmit} className="scan-form">
              <input 
                ref={scanInputRef}
                type="text" 
                placeholder="Escanea aquí..." 
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                autoFocus
              />
              <button type="submit" className="btn btn-primary">Procesar</button>
            </form>
          </div>

          <div className="reservations-list-card">
            <h3>Reservas Virtuales Pendientes</h3>
            <div className="res-grid">
              {reservations.length > 0 ? reservations.map(r => (
                <div key={r.id} className="res-card">
                  <div className="res-header">
                    <span className="res-id">#{r.id}</span>
                    <span className="badge warning">Pendiente</span>
                  </div>
                  <div className="res-body">
                    <p><FiPackage /> <strong>Elemento:</strong> {r.item_name}</p>
                    <p><FiUser /> <strong>Aprendiz:</strong> {r.user_name} ({r.document})</p>
                    <p><FiClock /> <strong>Fecha Req:</strong> {new Date(r.start_date).toLocaleDateString()}</p>
                  </div>
                  <div className="res-footer">
                    <button className="btn btn-success" onClick={() => handleApproveReservation(r.id)}>
                      Entregar Ahora
                    </button>
                  </div>
                </div>
              )) : (
                <div className="empty-state">No hay reservas pendientes en tu dependencia.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="history-section">
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Elemento</th>
                  <th>Usuario</th>
                  <th>Fecha Préstamo</th>
                  <th>Fecha Vencimiento</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {loans.length > 0 ? loans.map(l => (
                  <tr key={l.id}>
                    <td>{l.id}</td>
                    <td>{l.item_name}</td>
                    <td>{l.user_name}</td>
                    <td>{new Date(l.loan_date).toLocaleDateString()}</td>
                    <td>{new Date(l.due_date).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${l.status === 'ACTIVE' ? 'primary' : l.status === 'RETURNED' ? 'success' : 'danger'}`}>
                        {l.status}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={6} style={{ textAlign: 'center' }}>No hay historial registrado.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
