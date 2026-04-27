import React, { useState, useEffect } from 'react';
import { 
  FiUsers, FiUserCheck, FiUserX, FiLock, FiSearch, FiFilter, 
  FiEdit2, FiShield, FiPower, FiUnlock, FiEye, FiMoreVertical, FiPlus,
  FiCamera, FiX 
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
  phone: string | null;
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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roles, setRoles] = useState<string[]>([]);
  
  // Camera support
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const [newUser, setNewUser] = useState({
    id: '',
    document_type: 'CC',
    name: '',
    email: '',
    phone: '',
    role: 'APRENDIZ',
    password: '',
    formation_ficha: '',
    image_url: '' // Added image_url
  });

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

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/v1/users_mgmt/roles', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setRoles(data);
    } catch (error) { console.error(error); }
  };

  useEffect(() => {
    fetchData();
    fetchRoles();
  }, [searchTerm]);

  // Camera Functions
  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch { 
      alert('No se pudo acceder a la cámara.'); 
      setShowCamera(false); 
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')!;
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      // Mirror effect
      ctx.translate(canvasRef.current.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(videoRef.current, 0, 0);
      const photo = canvasRef.current.toDataURL('image/jpeg', 0.7);
      setNewUser(p => ({ ...p, image_url: photo }));
      stopCamera();
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/v1/users_mgmt/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify(newUser)
      });
      
      const result = await response.json();
      if (response.ok) {
        setShowCreateModal(false);
        setNewUser({
          id: '', document_type: 'CC', name: '', email: '', 
          phone: '', role: 'APRENDIZ', password: '', formation_ficha: ''
        });
        fetchData();
        alert('Usuario creado exitosamente');
      } else {
        alert(result.error || 'Error al crear usuario');
      }
    } catch (error) {
      console.error(error);
      alert('Error de conexión');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const s = searchTerm.toLowerCase();
    const matchesSearch = 
      u.name.toLowerCase().includes(s) || 
      u.email.toLowerCase().includes(s) || 
      (u.phone?.toLowerCase() || '').includes(s) ||
      u.role.toLowerCase().includes(s) ||
      u.id.includes(searchTerm);
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
        <button className="btn-add-user" onClick={() => setShowCreateModal(true)}>
          <FiPlus /> Nuevo Usuario
        </button>
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
                <td className="user-date-cell">
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

      {/* 5. MODAL CREACIÓN */}
      {showCreateModal && (
        <div className="user-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="user-modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Registrar Nuevo Usuario</h3>
              <button className="btn-close" onClick={() => setShowCreateModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <form className="user-form" onSubmit={handleCreateUser}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Tipo Documento</label>
                    <select 
                      value={newUser.document_type}
                      onChange={e => setNewUser({...newUser, document_type: e.target.value})}
                    >
                      <option value="CC">Cédula de Ciudadanía</option>
                      <option value="TI">Tarjeta de Identidad</option>
                      <option value="CE">Cédula de Extranjería</option>
                      <option value="PEP">PEP</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>N° Documento</label>
                    <input 
                      type="text" required placeholder="Ej: 1098..."
                      value={newUser.id}
                      onChange={e => setNewUser({...newUser, id: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Nombre Completo</label>
                  <input 
                    type="text" required placeholder="Nombre y Apellidos"
                    value={newUser.name}
                    onChange={e => setNewUser({...newUser, name: e.target.value})}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Email SENA</label>
                    <input 
                      type="email" required placeholder="correo@soy.sena.edu.co"
                      value={newUser.email}
                      onChange={e => setNewUser({...newUser, email: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Teléfono</label>
                    <input 
                      type="text" placeholder="Ej: 310..."
                      value={newUser.phone}
                      onChange={e => setNewUser({...newUser, phone: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Rol de Sistema</label>
                    <select 
                      value={newUser.role}
                      onChange={e => setNewUser({...newUser, role: e.target.value})}
                    >
                      {roles.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Contraseña (Opcional)</label>
                    <input 
                      type="password" placeholder="Por defecto es el Documento"
                      value={newUser.password}
                      onChange={e => setNewUser({...newUser, password: e.target.value})}
                    />
                  </div>
                </div>

                {newUser.role === 'APRENDIZ' && (
                  <div className="form-group">
                    <label>Número de Ficha</label>
                    <input 
                      type="text" placeholder="Ej: 2670..."
                      value={newUser.formation_ficha}
                      onChange={e => setNewUser({...newUser, formation_ficha: e.target.value})}
                    />
                  </div>
                )}

                <div className="form-group full-width camera-section-pro">
                  <label>Foto de Perfil</label>
                  <div className="photo-manager-pro">
                    {showCamera ? (
                      <div className="camera-view-pro">
                        <video ref={videoRef} autoPlay playsInline />
                        <div className="camera-controls-pro">
                          <button type="button" onClick={capturePhoto} className="btn-capture-pro"><FiCamera /> Tomar Foto</button>
                          <button type="button" onClick={stopCamera} className="btn-cancel-cam-pro">Cancelar</button>
                        </div>
                      </div>
                    ) : (
                      <div className="photo-preview-area-pro">
                        <div className="avatar-preview">
                          {newUser.image_url ? (
                            <img src={newUser.image_url} alt="Preview" />
                          ) : (
                            <div className="avatar-placeholder">{newUser.name ? newUser.name[0].toUpperCase() : '?'}</div>
                          )}
                        </div>
                        <div className="photo-actions-pro">
                          <button type="button" onClick={startCamera} className="btn-action-cam-pro"><FiCamera /> Usar Cámara</button>
                          <input 
                            type="text" 
                            placeholder="O pega URL de imagen..." 
                            value={newUser.image_url.startsWith('data:') ? 'Imagen capturada' : newUser.image_url} 
                            onChange={e => setNewUser({ ...newUser, image_url: e.target.value })} 
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <canvas ref={canvasRef} style={{ display: 'none' }} />
                </div>

                <button type="submit" className="btn-submit-pro" disabled={isSubmitting}>
                  {isSubmitting ? 'Registrando...' : 'Crear Usuario'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
