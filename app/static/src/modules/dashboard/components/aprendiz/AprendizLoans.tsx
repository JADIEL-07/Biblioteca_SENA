import React, { useState, useEffect } from 'react';
import { FiBook, FiClock, FiCheckCircle, FiAlertCircle, FiArrowLeft } from 'react-icons/fi';

interface AprendizLoansProps {
  onBack: () => void;
}

export const AprendizLoans: React.FC<AprendizLoansProps> = ({ onBack }) => {
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/loans/my', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setLoans(data);
        }
      } catch (error) {
        console.error("Error fetching my loans:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLoans();
  }, []);

  return (
    <div className="dashboard-view-container">
      <div className="view-header">
        <button className="back-link-btn" onClick={onBack}>
          <FiArrowLeft /> Volver al Inicio
        </button>
        <h2>Mis Préstamos</h2>
        <p>Consulta el estado de tus préstamos de libros y equipos.</p>
      </div>

      {loading ? (
        <div className="loading-container">Cargando préstamos...</div>
      ) : (
        <div className="loans-list-wrapper">
          {loans.length > 0 ? (
            <div className="custom-table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Elementos</th>
                    <th>Fecha Préstamo</th>
                    <th>Fecha Entrega</th>
                    <th>Estado</th>
                    <th>Multa</th>
                  </tr>
                </thead>
                <tbody>
                  {loans.map(loan => (
                    <tr key={loan.id}>
                      <td>#{loan.id}</td>
                      <td>
                        {loan.items.map((it: any) => (
                          <div key={it.id} className="table-item-name">
                            <FiBook size={12} /> {it.name}
                          </div>
                        ))}
                      </td>
                      <td>{new Date(loan.loan_date).toLocaleDateString()}</td>
                      <td>{new Date(loan.due_date).toLocaleDateString()}</td>
                      <td>
                        <span className={`status-badge ${loan.status.toLowerCase()}`}>
                          {loan.status === 'ACTIVE' ? 'Activo' : 
                           loan.status === 'RETURNED' ? 'Devuelto' : 
                           loan.status === 'OVERDUE' ? 'Vencido' : loan.status}
                        </span>
                      </td>
                      <td>
                        {loan.fine_amount > 0 ? (
                          <span className="fine-text">${loan.fine_amount}</span>
                        ) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <FiBook size={48} />
              <p>No tienes registros de préstamos todavía.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
