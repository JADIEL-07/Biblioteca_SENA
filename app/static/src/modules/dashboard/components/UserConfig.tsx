import React, { useState } from 'react';
import {
  FiUser, FiMail, FiLock, FiShield, FiMonitor,
  FiBell, FiClock, FiTrash2, FiUpload, FiDownload,
  FiSmartphone, FiTablet, FiGlobe, FiCheck, FiX,
  FiAlertTriangle, FiEye, FiEyeOff, FiInfo, FiLogOut
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

type TabId =
  | 'personal-info' | 'email'
  | 'password' | '2fa' | 'sessions'
  | 'notifications' | 'alerts'
  | 'privacy' | 'history' | 'delete-account';

export const UserConfig: React.FC<UserConfigProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<TabId>('personal-info');

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

  const userName = user.name || user.nombre || '';
  const userEmail = user.email || user.correo || '';

  const [formData, setFormData] = useState({
    nombres: userName.split(' ').slice(0, -1).join(' ') || userName,
    apellidos: userName.split(' ').slice(-1).join(' ') || '',
    tipoDoc: 'Cédula de ciudadanía',
    numDoc: String(user.id || ''),
    telefono: '',
    programa: 'Desarrollo de Software',
    fechaNac: '',
    biografia: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const navItems: { id: TabId; label: string; icon: JSX.Element; group?: string; danger?: boolean }[] = [
    { id: 'personal-info', label: 'Información personal', icon: <FiUser /> },
    { id: 'email', label: 'Correo electrónico', icon: <FiMail /> },
    { id: 'password', label: 'Cambiar contraseña', icon: <FiLock />, group: 'SEGURIDAD' },
    { id: '2fa', label: 'Autenticación en dos pasos', icon: <FiShield /> },
    { id: 'sessions', label: 'Sesiones activas', icon: <FiMonitor /> },
    { id: 'notifications', label: 'Preferencias de notificaciones', icon: <FiBell />, group: 'NOTIFICACIONES' },
    { id: 'alerts', label: 'Alertas y recordatorios', icon: <FiClock /> },
    { id: 'privacy', label: 'Privacidad y datos', icon: <FiShield />, group: 'PRIVACIDAD' },
    { id: 'history', label: 'Historial de accesos', icon: <FiClock />, group: 'ACTIVIDAD' },
    { id: 'delete-account', label: 'Eliminar cuenta', icon: <FiTrash2 />, group: 'AVANZADO', danger: true },
  ];

  return (
    <div className="user-config-container">
      <aside className="config-sidebar">


        <nav className="config-nav">
          {navItems.map((item, idx) => (
            <React.Fragment key={item.id}>
              {item.group && <div className="config-nav-group">{item.group}</div>}
              <button
                className={`config-nav-item ${activeTab === item.id ? 'active' : ''} ${item.danger ? 'danger' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <span className="config-icon">{item.icon}</span> {item.label}
              </button>
            </React.Fragment>
          ))}
        </nav>
      </aside>

      <main className="config-main-content">
        {activeTab === 'personal-info' && (
          <div className="config-section fade-in">


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
                  <input type="text" name="numDoc" value={formData.numDoc} onChange={handleChange} disabled />
                </div>
                <div className="form-group">
                  <label>Teléfono</label>
                  <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} placeholder="+57 300 123 4567" />
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
                <button className="btn-save" onClick={() => alert('Información personal guardada (UI demo).')}>Guardar cambios</button>
              </div>
            </div>

            <div className="config-card">
              <h3>Foto de perfil</h3>
              <div className="profile-photo-area">
                <div className="photo-avatar-large">{getInitials(userName || '??')}</div>
                <div className="photo-actions">
                  <span className="photo-hint">JPG o PNG. Máx. 2MB</span>
                  <div className="photo-buttons">
                    <button className="btn-upload"><FiUpload /> Cambiar foto</button>
                    <button className="btn-delete"><FiTrash2 /> Eliminar foto</button>
                  </div>
                </div>
              </div>
            </div>

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
                    maxLength={200}
                    placeholder="Cuéntanos un poco sobre ti..."
                  />
                  <span className="char-count">{formData.biografia.length}/200</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'email' && <EmailPanel currentEmail={userEmail} />}
        {activeTab === 'password' && <PasswordPanel />}
        {activeTab === '2fa' && <TwoFAPanel />}
        {activeTab === 'sessions' && <SessionsPanel />}
        {activeTab === 'notifications' && <NotificationsPanel />}
        {activeTab === 'alerts' && <AlertsPanel />}
        {activeTab === 'privacy' && <PrivacyPanel />}
        {activeTab === 'history' && <HistoryPanel />}
        {activeTab === 'delete-account' && <DeleteAccountPanel userName={userName} />}
      </main>
    </div>
  );
};

/* ─────────────────────────  PANELES  ───────────────────────── */

const EmailPanel: React.FC<{ currentEmail: string }> = ({ currentEmail }) => {
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="config-section fade-in">


      <div className="config-card">
        <h3>Correo actual</h3>
        <div className="info-row">
          <FiMail className="info-icon" />
          <span className="info-value">{currentEmail || 'No registrado'}</span>
          <span className="badge badge-verified"><FiCheck /> Verificado</span>
        </div>
      </div>

      <div className="config-card">
        <h3>Cambiar correo</h3>
        <p className="card-hint">Recibirás un enlace de verificación en el correo nuevo.</p>
        <div className="form-grid">
          <div className="form-group full-width">
            <label>Nuevo correo electrónico</label>
            <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="ejemplo@correo.com" />
          </div>
          <div className="form-group full-width">
            <label>Contraseña actual (para confirmar)</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
        </div>
        <div className="form-actions">
          <button
            className="btn-save"
            disabled={!newEmail || !password}
            onClick={() => alert(`Se enviará verificación a ${newEmail} (pendiente de endpoint backend).`)}
          >
            Enviar verificación
          </button>
        </div>
      </div>
    </div>
  );
};

const PasswordPanel: React.FC = () => {
  const [oldP, setOldP] = useState('');
  const [newP, setNewP] = useState('');
  const [confP, setConfP] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const strength = (() => {
    let s = 0;
    if (newP.length >= 8) s++;
    if (/[A-Z]/.test(newP)) s++;
    if (/[0-9]/.test(newP)) s++;
    if (/[^A-Za-z0-9]/.test(newP)) s++;
    return s;
  })();
  const strengthLabel = ['Muy débil', 'Débil', 'Regular', 'Buena', 'Fuerte'][strength];

  const submit = async () => {
    if (newP !== confP) { alert('Las contraseñas no coinciden.'); return; }
    if (strength < 3) { alert('La contraseña debe ser al menos "Buena".'); return; }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/v1/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ old_password: oldP, new_password: newP })
      });
      if (res.ok) {
        alert('Contraseña actualizada correctamente.');
        setOldP(''); setNewP(''); setConfP('');
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'No se pudo cambiar la contraseña.');
      }
    } catch {
      alert('Error de conexión con el servidor.');
    }
  };

  return (
    <div className="config-section fade-in">


      <div className="config-card">
        <div className="form-grid">
          <div className="form-group full-width">
            <label>Contraseña actual</label>
            <div className="password-input">
              <input type={showOld ? 'text' : 'password'} value={oldP} onChange={(e) => setOldP(e.target.value)} />
              <button type="button" onClick={() => setShowOld(!showOld)} aria-label="Ver">{showOld ? <FiEyeOff /> : <FiEye />}</button>
            </div>
          </div>
          <div className="form-group full-width">
            <label>Nueva contraseña</label>
            <div className="password-input">
              <input type={showNew ? 'text' : 'password'} value={newP} onChange={(e) => setNewP(e.target.value)} />
              <button type="button" onClick={() => setShowNew(!showNew)} aria-label="Ver">{showNew ? <FiEyeOff /> : <FiEye />}</button>
            </div>
            {newP && (
              <div className="strength-meter">
                <div className={`strength-bar lvl-${strength}`} />
                <span className="strength-label">{strengthLabel}</span>
              </div>
            )}
            <ul className="password-rules">
              <li className={newP.length >= 8 ? 'ok' : ''}><FiCheck /> Mínimo 8 caracteres</li>
              <li className={/[A-Z]/.test(newP) ? 'ok' : ''}><FiCheck /> Al menos una mayúscula</li>
              <li className={/[0-9]/.test(newP) ? 'ok' : ''}><FiCheck /> Al menos un número</li>
              <li className={/[^A-Za-z0-9]/.test(newP) ? 'ok' : ''}><FiCheck /> Un carácter especial</li>
            </ul>
          </div>
          <div className="form-group full-width">
            <label>Confirmar nueva contraseña</label>
            <input type="password" value={confP} onChange={(e) => setConfP(e.target.value)} />
            {confP && confP !== newP && <span className="field-error">Las contraseñas no coinciden.</span>}
          </div>
        </div>
        <div className="form-actions">
          <button className="btn-save" disabled={!oldP || !newP || !confP} onClick={submit}>Actualizar contraseña</button>
        </div>
      </div>
    </div>
  );
};

const TwoFAPanel: React.FC = () => {
  const [enabled, setEnabled] = useState(false);
  return (
    <div className="config-section fade-in">


      <div className="config-card">
        <div className="toggle-row">
          <div>
            <h3 style={{ marginBottom: 4 }}>Estado actual</h3>
            <p className="card-hint">{enabled ? 'Activada — se solicitará un código en cada inicio de sesión.' : 'Desactivada — solo se pide tu contraseña.'}</p>
          </div>
          <label className="switch">
            <input type="checkbox" checked={enabled} onChange={() => setEnabled(!enabled)} />
            <span className="slider" />
          </label>
        </div>
      </div>

      {enabled && (
        <div className="config-card">
          <h3>Configura tu app autenticadora</h3>
          <div className="qr-block">
            <div className="qr-placeholder">
              <FiShield size={64} />
              <span>Código QR<br />(generado por backend)</span>
            </div>
            <div className="qr-instructions">
              <ol>
                <li>Instala una app autenticadora (Google Authenticator, Authy).</li>
                <li>Escanea el código QR con la app.</li>
                <li>Ingresa el código de 6 dígitos para confirmar.</li>
              </ol>
              <div className="form-group">
                <label>Código de verificación</label>
                <input type="text" inputMode="numeric" maxLength={6} placeholder="••••••" />
              </div>
              <button className="btn-save" onClick={() => alert('2FA verificada (pendiente de endpoint backend).')}>Verificar y activar</button>
            </div>
          </div>
        </div>
      )}

      <div className="config-card">
        <h3>Métodos de respaldo</h3>
        <div className="method-row">
          <div className="method-info">
            <FiSmartphone className="method-icon" />
            <div>
              <strong>SMS</strong>
              <span className="card-hint">Recibe un código por mensaje al móvil registrado.</span>
            </div>
          </div>
          <button className="btn-secondary" disabled={!enabled}>Configurar</button>
        </div>
        <div className="method-row">
          <div className="method-info">
            <FiMail className="method-icon" />
            <div>
              <strong>Correo electrónico</strong>
              <span className="card-hint">Recibe un código en tu correo si pierdes la app.</span>
            </div>
          </div>
          <button className="btn-secondary" disabled={!enabled}>Configurar</button>
        </div>
      </div>
    </div>
  );
};

const SessionsPanel: React.FC = () => {
  const sessions = [
    { id: 1, device: 'Windows · Chrome', icon: <FiMonitor />, location: 'Vélez, Santander', lastActive: 'Activa ahora', current: true },
    { id: 2, device: 'Android · Móvil', icon: <FiSmartphone />, location: 'Bogotá, Colombia', lastActive: 'Hace 2 días', current: false },
    { id: 3, device: 'iPad · Safari', icon: <FiTablet />, location: 'Bucaramanga', lastActive: 'Hace 1 semana', current: false },
  ];

  return (
    <div className="config-section fade-in">


      <div className="config-card">
        {sessions.map(s => (
          <div key={s.id} className="session-row">
            <div className="session-info">
              <span className="session-icon">{s.icon}</span>
              <div>
                <strong>{s.device}{s.current && <span className="badge badge-current">Esta sesión</span>}</strong>
                <span className="card-hint"><FiGlobe /> {s.location} · {s.lastActive}</span>
              </div>
            </div>
            {!s.current && (
              <button className="btn-danger-outline" onClick={() => alert(`Sesión cerrada en ${s.device} (pendiente de endpoint backend).`)}>
                <FiLogOut /> Cerrar
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="config-card">
        <div className="toggle-row">
          <div>
            <h3 style={{ marginBottom: 4 }}>Cerrar todas las demás sesiones</h3>
            <p className="card-hint">Salta los dispositivos que ya no usas.</p>
          </div>
          <button className="btn-danger" onClick={() => alert('Sesiones remotas cerradas (pendiente de endpoint).')}>Cerrar todo</button>
        </div>
      </div>
    </div>
  );
};

const NotificationsPanel: React.FC = () => {
  const [prefs, setPrefs] = useState({
    loanReminder: true,
    loanOverdue: true,
    reservationReady: true,
    newCatalogItems: false,
    weeklySummary: true,
    promotions: false,
  });
  const toggle = (k: keyof typeof prefs) => setPrefs({ ...prefs, [k]: !prefs[k] });

  const items: { k: keyof typeof prefs; title: string; desc: string }[] = [
    { k: 'loanReminder', title: 'Recordatorios de préstamos', desc: 'Avísame antes de la fecha de devolución.' },
    { k: 'loanOverdue', title: 'Préstamos vencidos', desc: 'Notifícame si tengo elementos atrasados.' },
    { k: 'reservationReady', title: 'Reserva lista', desc: 'Cuando un elemento reservado esté disponible.' },
    { k: 'newCatalogItems', title: 'Nuevos elementos', desc: 'Cuando se añadan recursos al catálogo.' },
    { k: 'weeklySummary', title: 'Resumen semanal', desc: 'Un correo con tu actividad cada semana.' },
    { k: 'promotions', title: 'Promociones SENA', desc: 'Eventos, talleres y novedades institucionales.' },
  ];

  return (
    <div className="config-section fade-in">


      <div className="config-card">
        <h3>Tipos de notificación</h3>
        {items.map(it => (
          <div key={it.k} className="toggle-row">
            <div>
              <strong>{it.title}</strong>
              <span className="card-hint">{it.desc}</span>
            </div>
            <label className="switch">
              <input type="checkbox" checked={prefs[it.k]} onChange={() => toggle(it.k)} />
              <span className="slider" />
            </label>
          </div>
        ))}
      </div>

      <div className="config-card">
        <h3>Canal de envío</h3>
        <div className="channel-grid">
          <label className="channel-option">
            <input type="checkbox" defaultChecked /><span>Correo electrónico</span>
          </label>
          <label className="channel-option">
            <input type="checkbox" defaultChecked /><span>Notificación en la app</span>
          </label>
          <label className="channel-option">
            <input type="checkbox" /><span>SMS</span>
          </label>
        </div>
        <div className="form-actions">
          <button className="btn-save" onClick={() => alert('Preferencias guardadas (pendiente de endpoint).')}>Guardar preferencias</button>
        </div>
      </div>
    </div>
  );
};

const AlertsPanel: React.FC = () => {
  const [reminderDays, setReminderDays] = useState(2);
  const [quietStart, setQuietStart] = useState('22:00');
  const [quietEnd, setQuietEnd] = useState('07:00');

  return (
    <div className="config-section fade-in">


      <div className="config-card">
        <h3>Recordatorios de devolución</h3>
        <p className="card-hint">Te avisaremos antes del vencimiento de tus préstamos.</p>
        <div className="form-group">
          <label>Anticipación (días)</label>
          <input type="number" min={1} max={7} value={reminderDays} onChange={e => setReminderDays(Number(e.target.value))} />
        </div>
      </div>

      <div className="config-card">
        <h3>Modo silencio</h3>
        <p className="card-hint">No te molestaremos durante este horario.</p>
        <div className="form-grid">
          <div className="form-group">
            <label>Desde</label>
            <input type="time" value={quietStart} onChange={(e) => setQuietStart(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Hasta</label>
            <input type="time" value={quietEnd} onChange={(e) => setQuietEnd(e.target.value)} />
          </div>
        </div>
        <div className="form-actions">
          <button className="btn-save" onClick={() => alert('Configuración de alertas guardada.')}>Guardar</button>
        </div>
      </div>
    </div>
  );
};

const PrivacyPanel: React.FC = () => {
  const [profileVisible, setProfileVisible] = useState(true);
  const [showActivity, setShowActivity] = useState(false);
  const [analytics, setAnalytics] = useState(true);

  return (
    <div className="config-section fade-in">


      <div className="config-card">
        <h3>Visibilidad</h3>
        <div className="toggle-row">
          <div>
            <strong>Perfil visible para otros aprendices</strong>
            <span className="card-hint">Tu nombre y programa serán visibles dentro de la plataforma.</span>
          </div>
          <label className="switch">
            <input type="checkbox" checked={profileVisible} onChange={() => setProfileVisible(!profileVisible)} />
            <span className="slider" />
          </label>
        </div>
        <div className="toggle-row">
          <div>
            <strong>Mostrar actividad reciente</strong>
            <span className="card-hint">Permite que se vea cuándo accediste por última vez.</span>
          </div>
          <label className="switch">
            <input type="checkbox" checked={showActivity} onChange={() => setShowActivity(!showActivity)} />
            <span className="slider" />
          </label>
        </div>
      </div>

      <div className="config-card">
        <h3>Análisis de uso</h3>
        <div className="toggle-row">
          <div>
            <strong>Permitir analítica anónima</strong>
            <span className="card-hint">Nos ayuda a mejorar la plataforma. Sin datos personales identificables.</span>
          </div>
          <label className="switch">
            <input type="checkbox" checked={analytics} onChange={() => setAnalytics(!analytics)} />
            <span className="slider" />
          </label>
        </div>
      </div>

      <div className="config-card">
        <h3>Mis datos</h3>
        <p className="card-hint">Descarga una copia de toda la información asociada a tu cuenta (formato JSON).</p>
        <div className="form-actions">
          <button className="btn-secondary" onClick={() => alert('Solicitud de descarga enviada (pendiente de endpoint).')}>
            <FiDownload /> Descargar mis datos
          </button>
        </div>
      </div>
    </div>
  );
};

const HistoryPanel: React.FC = () => {
  const events = [
    { date: 'Hoy 09:24', action: 'Inicio de sesión', device: 'Windows · Chrome', ip: '192.168.101.12', ok: true },
    { date: 'Ayer 18:11', action: 'Cierre de sesión', device: 'Android · Móvil', ip: '186.81.45.10', ok: true },
    { date: 'Ayer 14:05', action: 'Inicio de sesión', device: 'Android · Móvil', ip: '186.81.45.10', ok: true },
    { date: 'Hace 3 días 22:47', action: 'Intento fallido', device: 'iPhone · Safari', ip: '190.245.1.2', ok: false },
    { date: 'Hace 5 días 08:30', action: 'Cambio de contraseña', device: 'Windows · Chrome', ip: '192.168.101.12', ok: true },
  ];

  return (
    <div className="config-section fade-in">


      <div className="config-card">
        <ul className="event-list">
          {events.map((e, i) => (
            <li key={i} className={`event-item ${e.ok ? '' : 'failed'}`}>
              <span className="event-icon">{e.ok ? <FiCheck /> : <FiAlertTriangle />}</span>
              <div className="event-body">
                <strong>{e.action}</strong>
                <span className="card-hint">{e.device} · IP {e.ip}</span>
              </div>
              <span className="event-date">{e.date}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="config-card info-card">
        <FiInfo />
        <p>Si no reconoces alguno de estos accesos, cambia tu contraseña y revisa tus sesiones activas.</p>
      </div>
    </div>
  );
};

const DeleteAccountPanel: React.FC<{ userName: string }> = ({ userName }) => {
  const [confirmText, setConfirmText] = useState('');
  const [reason, setReason] = useState('');
  const phrase = `ELIMINAR ${userName.split(' ')[0]?.toUpperCase() || 'CUENTA'}`;

  return (
    <div className="config-section fade-in">


      <div className="config-card warning-card">
        <FiAlertTriangle />
        <div>
          <strong>Lo que pasará:</strong>
          <ul>
            <li>Tu acceso al sistema será desactivado inmediatamente.</li>
            <li>Tu información personal y biografía serán eliminadas.</li>
            <li>El historial de préstamos se conserva por trazabilidad institucional.</li>
            <li>Si tienes préstamos activos, debes devolverlos antes.</li>
          </ul>
        </div>
      </div>

      <div className="config-card">
        <h3>¿Por qué te vas? <span className="card-hint" style={{ marginLeft: 8, fontWeight: 400 }}>(opcional)</span></h3>
        <select value={reason} onChange={(e) => setReason(e.target.value)}>
          <option value="">Selecciona un motivo</option>
          <option>Ya no uso la plataforma</option>
          <option>Encontré una herramienta mejor</option>
          <option>Problemas de privacidad</option>
          <option>La interfaz es difícil</option>
          <option>Otro</option>
        </select>
      </div>

      <div className="config-card">
        <h3>Confirmación</h3>
        <p className="card-hint">Para continuar, escribe exactamente: <strong>{phrase}</strong></p>
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder={phrase}
          style={{ marginTop: 8 }}
        />
        <div className="form-actions">
          <button
            className="btn-danger"
            disabled={confirmText !== phrase}
            onClick={() => {
              if (confirm('¿Estás 100% seguro? Esta acción es definitiva.')) {
                alert('Cuenta marcada para eliminación (pendiente de endpoint backend).');
              }
            }}
          >
            <FiTrash2 /> Eliminar mi cuenta permanentemente
          </button>
        </div>
      </div>
    </div>
  );
};
