import React, { useState } from 'react';
import { 
  FiUser, FiMail, FiLock, FiShield, FiMonitor, 
  FiBell, FiClock, FiTrash2, FiUpload 
} from 'react-icons/fi';
import './UserConfig.css';

interface UserData {
  id?: number;
  name?: string;
  nombre?: string;
  email?: string;
  correo?: string;
  role?: { name: string };
  rol?: { nombre: string };
}

interface UserConfigProps {
  user: UserData;
}

export const UserConfig: React.FC<UserConfigProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState('personal-info');

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  const userName = user.name || user.nombre || '';
  
  const [formData, setFormData] = useState({
    nombres: userName.split(' ').slice(0, -1).join(' ') || userName,
    apellidos: userName.split(' ').slice(-1).join(' ') || '',
    tipoDoc: 'Cédula de ciudadanía',
    numDoc: '1.098.765.432',
    telefono: '+57 300 123 4567',
    programa: 'Desarrollo de Software',
    fechaNac: '2004-05-12',
    biografia: 'Aprendiz del SENA, apasionado por la tecnología y el desarrollo de software.'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="user-config-container">
      {/* ── SIDEBAR INTERNO ── */}
      <aside className="config-sidebar">
        <div className="config-sidebar-header">
          <h2>Configuración y privacidad</h2>
          <p>Administra tu cuenta, seguridad y preferencias.</p>
        </div>

        <nav className="config-nav">
          <button className={`config-nav-item ${activeTab === 'personal-info' ? 'active' : ''}`} onClick={() => setActiveTab('personal-info')}>
            <FiUser className="config-icon" /> Información personal
          </button>
          <button className={`config-nav-item ${activeTab === 'email' ? 'active' : ''}`} onClick={() => setActiveTab('email')}>
            <FiMail className="config-icon" /> Correo electrónico
          </button>

          <div className="config-nav-group">SEGURIDAD</div>
          <button className="config-nav-item"><FiLock className="config-icon" /> Cambiar contraseña</button>
          <button className="config-nav-item"><FiShield className="config-icon" /> Autenticación en dos pasos</button>
          <button className="config-nav-item"><FiMonitor className="config-icon" /> Sesiones activas</button>

          <div className="config-nav-group">NOTIFICACIONES</div>
          <button className="config-nav-item"><FiBell className="config-icon" /> Preferencias de notificaciones</button>
          <button className="config-nav-item"><FiClock className="config-icon" /> Alertas y recordatorios</button>

          <div className="config-nav-group">PRIVACIDAD</div>
          <button className="config-nav-item"><FiShield className="config-icon" /> Privacidad y datos</button>

          <div className="config-nav-group">ACTIVIDAD</div>
          <button className="config-nav-item"><FiClock className="config-icon" /> Historial de accesos</button>

          <div className="config-nav-group">AVANZADO</div>
          <button className="config-nav-item danger"><FiTrash2 className="config-icon" /> Eliminar cuenta</button>
        </nav>
      </aside>

      {/* ── CONTENIDO PRINCIPAL ── */}
      <main className="config-main-content">
        {activeTab === 'personal-info' && (
          <div className="config-section fade-in">
            <div className="config-section-header">
              <h1>Información personal</h1>
              <p>Actualiza tu información personal y de contacto.</p>
            </div>

            {/* Tarjeta: Datos personales */}
            <div className="config-card">
              <h3>Datos personales</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Nombres</label>
                  <input type="text" name="nombres" value={formData.nombres} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Apellidos</label>
                  <input type="text" name="apellidos" value={formData.apellidos} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Tipo de documento</label>
                  <select name="tipoDoc" value={formData.tipoDoc} onChange={handleChange}>
                    <option>Cédula de ciudadanía</option>
                    <option>Tarjeta de identidad</option>
                    <option>Pasaporte</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Número de documento</label>
                  <input type="text" name="numDoc" value={formData.numDoc} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Teléfono</label>
                  <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Programa de formación</label>
                  <select name="programa" value={formData.programa} onChange={handleChange}>
                    <option>Desarrollo de Software</option>
                    <option>Análisis de Datos</option>
                    <option>Redes y Seguridad</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Fecha de nacimiento</label>
                  <input type="date" name="fechaNac" value={formData.fechaNac} onChange={handleChange} />
                </div>
              </div>
              <div className="form-actions">
                <button className="btn-save">Guardar cambios</button>
              </div>
            </div>

            {/* Tarjeta: Foto de perfil */}
            <div className="config-card">
              <h3>Foto de perfil</h3>
              <div className="profile-photo-area">
                <div className="photo-avatar-large">
                  {getInitials(userName || '??')}
                </div>
                <div className="photo-actions">
                  <span className="photo-hint">JPG o PNG. Máx. 2MB</span>
                  <div className="photo-buttons">
                    <button className="btn-upload"><FiUpload /> Cambiar foto</button>
                    <button className="btn-delete"><FiTrash2 /> Eliminar foto</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Tarjeta: Sobre ti */}
            <div className="config-card">
              <h3>Sobre ti</h3>
              <div className="form-group full-width">
                <label>Biografía</label>
                <div className="textarea-wrapper">
                  <textarea 
                    name="biografia" 
                    value={formData.biografia} 
                    onChange={handleChange}
                    rows={4}
                  />
                  <span className="char-count">{formData.biografia.length}/200</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {activeTab !== 'personal-info' && (
          <div className="config-section fade-in">
            <div className="config-section-header">
              <h1>Sección en construcción</h1>
              <p>Esta pestaña se implementará próximamente.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
