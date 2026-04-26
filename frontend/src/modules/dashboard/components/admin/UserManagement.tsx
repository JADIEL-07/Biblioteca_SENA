import React, { useState, useEffect } from 'react';
import { 
  FiUsers, FiUserCheck, FiUserX, FiLock, FiSearch, FiFilter, 
  FiEdit2, FiShield, FiPower, FiUnlock, FiEye, FiMoreVertical 
} from 'react-icons/fi';
import './UserManagement.css';

interface UserStats {
  total: number;
  active: number;
  inactive: number;
  blocked: number;
  by_role: Record<string, number>;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  is_blocked: boolean;
  last_login: string | null;
  failed_attempts: number;
  created_at: string;
}

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [uData, sData] = await Promise.all([
        fetch(`/api/v1/users_mgmt/?search=${searchTerm}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }).then(r => r.json()),
        fetch('/api/v1/users_mgmt/stats', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }).then(r => r.json())
      ]);
      setUsers(uData);
      setStats(sData);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchTerm]);

  const handleToggleActive = async (id: string) => {
    try {
      const response = await fetch(`/api/v1/users_mgmt/${id}/toggle-active`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) fetchData();
    } catch (error) { console.error(error); }
  };

  const handleUnblock = async (id: string) => {
    try {
      const response = await fetch(`/api/v1/users_mgmt/${id}/unblock`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) fetchData();
    } catch (error) { console.error(error); }
  };

  const filteredUsers = users.filter(u => {
    const s = searchTerm.toLowerCase();
    const matchesSearch = u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s) || u.id.includes(searchTerm);
    const matchesRole = filterRole === 'ALL' || u.role === filterRole;
    const matchesStatus = 
      filterStatus === 'ALL' || 
      (filterStatus === 'ACTIVE' && u.is_active && !u.is_blocked) ||
      (filterStatus === 'INACTIVE' && !u.is_active) ||
      (filterStatus === 'BLOCKED' && u.is_blocked);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="users-mgmt-container fade-in">
      {/* 1. MÉTRICAS */}
      <div className="users-stats-grid">
        <div className="stat-card">
          <div className="stat-icon total"><FiUsers /></div>
          <div className="stat-info">
            <span className="label">Total Usuarios</span>
            <span className="value">{stats?.total || 0}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon active"><FiUserCheck /></div>
          <div className="stat-info">
            <span className="label">Activos</span>
            <span className="value">{stats?.active || 0}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon inactive"><FiUserX /></div>
          <div className="stat-info">
            <span className="label">Inactivos</span>
            <span className="value">{stats?.inactive || 0}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blocked"><FiLock /></div>
          <div className="stat-info">
            <span className="label">Bloqueados</span>
            <span className="value">{stats?.blocked || 0}</span>
          </div>
        </div>
      </div>

      {/* 2. FILTROS */}
      <div className="users-filters-bar">
        <div className="search-box">
          <FiSearch />
          <input 
            type="text" 
            placeholder="Buscar por nombre, email o ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <FiFilter />
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
            <option value="ALL">Todos los Roles</option>
            <option value="ADMIN">Administradores</option>
            <option value="APRENDIZ">Aprendices</option>
            <option value="OPERADOR">Operadores</option>
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="ALL">Todos los Estados</option>
            <option value="ACTIVE">Activos</option>
            <option value="INACTIVE">Inactivos</option>
            <option value="BLOCKED">Bloqueados</option>
          </select>
        </div>
      </div>

      {/* 3. TABLA PRINCIPAL */}
      <div className="users-table-wrapper">
        <table className="users-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Último Acceso</th>
              <th>Intentos</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="td-center">Cargando cuentas...</td></tr>
            ) : filteredUsers.map(user => (
              <tr key={user.id}>
                <td>
                  <div className="user-profile-cell">
                    <div className="avatar-mini">{user.name ? user.name[0].toUpperCase() : '?'}</div>
                    <div className="user-info">
                      <span className="name">{user.name}</span>
                      <span className="email">{user.email} <small>(#{user.id})</small></span>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`role-badge ${user.role.toLowerCase()}`}>{user.role}</span>
                </td>
                <td>
                  {user.is_blocked ? (
                    <span className="status-pill blocked">Bloqueado</span>
                  ) : user.is_active ? (
                    <span className="status-pill active">Activo</span>
                  ) : (
                    <span className="status-pill inactive">Inactivo</span>
                  )}
                </td>
                <td className="date-cell">
                  {user.last_login ? new Date(user.last_login).toLocaleString() : 'Nunca'}
                </td>
                <td>
                  <span className={`attempts-badge ${user.failed_attempts > 0 ? 'warning' : ''}`}>
                    {user.failed_attempts}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-icon" onClick={() => handleToggleActive(user.id)} title={user.is_active ? "Desactivar" : "Activar"}>
                      <FiPower style={{ color: user.is_active ? '#ef4444' : '#39A900' }} />
                    </button>
                    {user.is_blocked && (
                      <button className="btn-icon" onClick={() => handleUnblock(user.id)} title="Desbloquear">
                        <FiUnlock style={{ color: '#39A900' }} />
                      </button>
                    )}
                    <button className="btn-icon" onClick={() => { setSelectedUser(user); setShowDetail(true); }} title="Ver Detalle">
                      <FiEye />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 4. MODAL DETALLE (Simplificado) */}
      {showDetail && selectedUser && (
        <div className="user-modal-overlay" onClick={() => setShowDetail(false)}>
          <div className="user-modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detalle del Usuario</h3>
              <button className="btn-close" onClick={() => setShowDetail(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="profile-header">
                <div className="avatar-large">{selectedUser.name ? selectedUser.name[0].toUpperCase() : '?'}</div>
                <h4>{selectedUser.name || 'Sin Nombre'}</h4>
                <span className="role-tag">{selectedUser.role}</span>
              </div>
              <div className="info-grid">
                <div className="info-item"><label>ID Documento</label><span>{selectedUser.id}</span></div>
                <div className="info-item"><label>Email</label><span>{selectedUser.email}</span></div>
                <div className="info-item"><label>Estado Cuenta</label><span>{selectedUser.is_active ? 'Habilitada' : 'Deshabilitada'}</span></div>
                <div className="info-item"><label>Registro</label><span>{new Date(selectedUser.created_at).toLocaleDateString()}</span></div>
              </div>
              <div className="modal-actions-pro">
                <button className="btn-pro edit"><FiEdit2 /> Editar Datos</button>
                <button className="btn-pro shield"><FiShield /> Cambiar Rol</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
