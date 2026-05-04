import React, { useState, useEffect } from 'react';
import { FiCalendar, FiClock, FiXCircle, FiArrowLeft } from 'react-icons/fi';

interface AprendizReservationsProps {
  onBack: () => void;
}

export const AprendizReservations: React.FC<AprendizReservationsProps> = ({ onBack }) => {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/reservations/my', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setReservations(data);
        }
      } catch (error) {
        console.error("Error fetching my reservations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  return (
    <div className="dashboard-view-container">
      <div className="view-header">
        <button className="back-link-btn" onClick={onBack}>
          <FiArrowLeft /> Volver al Inicio
        </button>
        <h2>Mis Reservas</h2>
        <p>Gestiona tus apartados de libros y equipos.</p>
      </div>

      {loading ? (
        <div className="loading-container">Cargando reservas...</div>
      ) : (
        <div className="reservations-list-wrapper">
          {reservations.length > 0 ? (
            <div className="custom-table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Elemento</th>
                    <th>Fecha Reserva</th>
                    <th>Expira en</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map(res => (
                    <tr key={res.id}>
                      <td>#{res.id}</td>
                      <td>{res.item_name}</td>
                      <td>{new Date(res.reservation_date).toLocaleDateString()}</td>
                      <td>{new Date(res.expiration_date).toLocaleString()}</td>
                      <td>
                        <span className={`status-badge ${res.status.toLowerCase()}`}>
                          {res.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <FiCalendar size={48} />
              <p>No tienes reservas activas.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
