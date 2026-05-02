import { useState, useRef, useEffect } from 'react';
import { LoginForm } from './modules/auth/components/LoginForm';
import { Terms } from './modules/legal/components/Terms';
import { Privacy } from './modules/legal/components/Privacy';
import { ForgotPassword } from './modules/auth/components/ForgotPassword';
import { ResetPassword } from './modules/auth/components/ResetPassword';
import { UserDashboard } from './modules/dashboard/components/UserDashboard';
import { AdminDashboard } from './modules/dashboard/components/admin/AdminDashboard';
import {
  FaTwitter,
  FaFacebookF,
  FaInstagram,
  FaYoutube
} from 'react-icons/fa';
import {
  FiHome,
  FiMail,
  FiUser,
  FiHelpCircle,
  FiUserPlus,
  FiMenu,
  FiX,
  FiSettings,
  FiRefreshCw,
  FiLogOut,
  FiLayout
} from 'react-icons/fi';
import { SERVICES_DATA } from './shared/constants';
const senaBg = '/assets/images/sena-library-bg.png';
import { FloatingParticles } from './components/ui/FloatingParticles';

/**
 * Datos de los servicios ofrecidos por la plataforma.
 * Centralizado para facilitar el mantenimiento y la escalabilidad.
 */

function App() {
  // Detectar sesión existente al cargar
  const storedUser = localStorage.getItem('user');
  const [loggedUser, setLoggedUser] = useState<any>(
    storedUser ? JSON.parse(storedUser) : null
  );

  const [isDashboardActive, setIsDashboardActive] = useState(storedUser ? true : false);
  const [dashboardSection, setDashboardSection] = useState('home');
  const [menuOpenLanding, setMenuOpenLanding] = useState(false);
  const menuRefLanding = useRef<HTMLDivElement>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const mobileNavRef = useRef<HTMLDivElement>(null);

  const [theme, setTheme] = useState<'dark' | 'light'>(
    (localStorage.getItem('dashboard-theme') as 'dark' | 'light') ?? 'dark'
  );

  const [authMode, setAuthMode] = useState<'login' | 'register' | 'terms' | 'privacy' | 'forgot-password' | 'guest-dashboard' | null>(() => {
    if (window.location.pathname === '/reset-password' || window.location.search.includes('token=')) {
      return 'forgot-password';
    }
    return null;
  });

  // Sincronizar tema con el widget de accesibilidad
  useEffect(() => {
    const syncTheme = () => {
      const storedTheme = (localStorage.getItem('dashboard-theme') as 'dark' | 'light') ?? 'dark';
      setTheme(storedTheme);
    };
    window.addEventListener('storage', syncTheme);
    return () => window.removeEventListener('storage', syncTheme);
  }, []);

  // Cerrar dropdown de la landing al hacer click fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRefLanding.current && !menuRefLanding.current.contains(e.target as Node)) {
        setMenuOpenLanding(false);
      }
      if (mobileNavRef.current && !mobileNavRef.current.contains(e.target as Node)) {
        setMobileNavOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [authMode]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setLoggedUser(null);
    setAuthMode(null);
    setIsDashboardActive(false);
  };

  const isResetPage = window.location.pathname === '/reset-password' || window.location.search.includes('token=');
  if (isResetPage) return <ResetPassword />;

  // Si hay usuario en sesión o modo invitado activo, mostrar dashboard en pantalla completa
  const isGuestMode = authMode === 'guest-dashboard';
  if ((loggedUser && isDashboardActive) || isGuestMode) {
    const dashboardUser = isGuestMode
      ? { nombre: 'Invitado SENA', rol: { nombre: 'Invitado' }, id: 0 }
      : loggedUser;

    const handleUserUpdate = (updatedUser: any) => {
      const newUser = { ...loggedUser, ...updatedUser };
      setLoggedUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
    };

    if ((loggedUser.role?.name || loggedUser.rol?.nombre) === 'ADMIN') {
      return (
        <AdminDashboard 
          user={dashboardUser}
          onLogout={handleLogout}
          onUserUpdate={handleUserUpdate}
        />
      );
    }

    return (
      <UserDashboard
        user={dashboardUser}
        onLogout={isGuestMode ? () => setAuthMode(null) : handleLogout}
        onGoToHome={() => {
          if (isGuestMode) setAuthMode(null);
          else setIsDashboardActive(false);
        }}
        onLogin={() => setAuthMode('login')}
        onRegister={() => setAuthMode('register')}
        initialSection={dashboardSection}
      />
    );
  }

  const isHome = authMode === null;

  return (
    <div className={`home-wrapper ${theme === 'light' ? 'theme-light' : 'theme-dark'}`}>

      {/* Navegación Superior Persistente */}
      <nav className={`main-nav ${authMode === 'login' || authMode === 'register' ? 'no-glass' : ''}`} ref={mobileNavRef}>
        <div className="nav-logo">
          <div className="mini-logo-box">
            <img src="https://upload.wikimedia.org/wikipedia/commons/8/83/Sena_Colombia_logo.svg" alt="SENA Logo" />
          </div>
          <span>BIBLIOTECA & ALMACÉN SENA</span>
        </div>

        <button
          className={`nav-hamburger ${mobileNavOpen ? 'open' : ''}`}
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          aria-label={mobileNavOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={mobileNavOpen}
        >
          {mobileNavOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>

        <div className={`nav-links ${mobileNavOpen ? 'mobile-open' : ''}`}>
          <a href="#" onClick={(e) => { e.preventDefault(); setAuthMode(null); setIsDashboardActive(false); setMobileNavOpen(false); }}>
            <FiHome className="nav-icon" /> INICIO
          </a>
          <a href="#contact" onClick={() => setMobileNavOpen(false)}>
            <FiMail className="nav-icon" /> CONTACTO
          </a>
          <a href="#help" onClick={() => setMobileNavOpen(false)}>
            <FiHelpCircle className="nav-icon" /> AYUDA
          </a>

          {loggedUser ? (
            <div className="user-menu-landing" ref={menuRefLanding}>
              <button
                className={`user-menu-trigger ${menuOpenLanding ? 'active' : ''}`}
                onClick={() => setMenuOpenLanding(!menuOpenLanding)}
              >
                <div className="nav-avatar">{(loggedUser.name || loggedUser.nombre || '').split(' ').map((n: any) => n[0]).slice(0, 2).join('').toUpperCase()}</div>
                <span className="menu-hamburguer-icon">
                  {menuOpenLanding ? <FiX size={18} /> : <FiMenu size={18} />}
                </span>
              </button>

              {menuOpenLanding && (
                <div className="user-dropdown crystal-dark">
                  <div className="dropdown-profile">
                    <div className="dropdown-avatar">{(loggedUser.name || loggedUser.nombre || '').split(' ').map((n: any) => n[0]).slice(0, 2).join('').toUpperCase()}</div>
                    <div className="dropdown-user-info">
                      <span className="dropdown-name">{loggedUser.name || loggedUser.nombre}</span>
                      <span className="dropdown-role">{(loggedUser.role?.name || loggedUser.rol?.nombre) ?? 'Usuario'}</span>
                    </div>
                  </div>
                  <div className="dropdown-divider" />

                  <button className="dropdown-item" onClick={() => { setIsDashboardActive(true); setDashboardSection('config'); setMenuOpenLanding(false); }}>
                    <span className="dropdown-item-icon"><FiSettings /></span>
                    Configuración y Privacidad
                  </button>

                  <button className="dropdown-item" onClick={() => { setIsDashboardActive(true); setDashboardSection('update'); setMenuOpenLanding(false); }}>
                    <span className="dropdown-item-icon"><FiRefreshCw /></span>
                    Actualizar Información
                  </button>

                  <div className="dropdown-divider" />
                  <button className="dropdown-item logout" onClick={handleLogout}>
                    <span className="dropdown-item-icon"><FiLogOut /></span>
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <a href="#" className="nav-link-login" onClick={(e) => { e.preventDefault(); setAuthMode('login'); setMobileNavOpen(false); }}>
                <FiUser className="nav-icon" /> INICIAR SESIÓN
              </a>
              <a href="#" className="btn-create-account" onClick={(e) => { e.preventDefault(); setAuthMode('register'); setMobileNavOpen(false); }}>
                <FiUserPlus className="nav-icon" /> CREAR CUENTA
              </a>
            </>
          )}
        </div>
      </nav>

      {/* RENDERIZADO CONDICIONAL DE CONTENIDO */}
      {isHome ? (
        <section className="hero-section">
          <div className="hero-bg">
            <img src={senaBg} alt="Fondo Biblioteca & Almacén SENA" className="bw-filter" />
            <div className="hero-overlay"></div>
            <FloatingParticles />
          </div>

          <div className="hero-content">
            <h1>SISTEMA INTEGRAL: BIBLIOTECA, ALMACÉN E INVENTARIO</h1>
            <p>Gestión unificada de material bibliográfico, equipos, herramientas e insumos para el centro de formación.</p>
          </div>

          <div className="services-grid-overlay">
            {SERVICES_DATA.map((service) => (
              <div key={service.id} className="service-card-mini">
                <div className="service-icon-wrapper-mini">
                  {service.icon || <span>📦</span>}
                </div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </div>
            ))}
          </div>

          <div className="hero-cta-footer">
            <p className="privacy-text">
              Al hacer clic en Comienza ahora, aceptas nuestros <a href="#" onClick={(e) => { e.preventDefault(); setAuthMode('terms'); }}>terminos</a> y <a href="#" onClick={(e) => { e.preventDefault(); setAuthMode('privacy'); }}>politica de privacidad</a>
            </p>
            <button
              className="btn cta-home-btn"
              onClick={() => loggedUser ? setIsDashboardActive(true) : setAuthMode('guest-dashboard')}
            >
              COMIENZA AHORA
            </button>
          </div>
        </section>
      ) : (
        <div className="content-view-container">
          {authMode === 'login' || authMode === 'register' ? (
            <LoginForm
              mode={authMode}
              onBack={() => setAuthMode(null)}
              onForgotPassword={() => setAuthMode('forgot-password')}
              onSwitchMode={(mode) => setAuthMode(mode)}
              onLoginSuccess={(user) => {
                setLoggedUser(user);
                setIsDashboardActive(true);
              }}
            />
          ) : authMode === 'terms' ? (
            <Terms onBack={() => setAuthMode(null)} />
          ) : authMode === 'privacy' ? (
            <Privacy onBack={() => setAuthMode(null)} />
          ) : authMode === 'forgot-password' ? (
            <ForgotPassword onBack={() => setAuthMode('login')} />
          ) : null}
        </div>
      )}

      {/* FOOTER PERSISTENTE (Opcional, pero se mantiene para balance visual) */}
      <footer className="main-footer">
        <div className="footer-container">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/8/83/Sena_Colombia_logo.svg"
            alt="Logo SENA Blanco"
            className="footer-logo"
          />
          <span className="footer-divider">|</span>
          <div className="footer-socials">
            <FaTwitter title="Twitter" />
            <FaFacebookF title="Facebook" />
            <FaInstagram title="Instagram" />
            <FaYoutube title="YouTube" />
          </div>
          <span className="footer-divider">|</span>
          <div className="footer-info-block">
            <div className="info-row-top">
              <a href="https://maps.app.goo.gl/1A9ELVhK6hsYwj2TA" target="_blank" rel="noopener noreferrer" className="location-link">
                <strong>Sede SENA</strong> - Vélez, Santander
              </a>
              <span className="divider-sm">|</span>
              <span>Atención al ciudadano: 018000910270</span>
              <span className="divider-sm">|</span>
              <span>Biblioteca y Almacén @ 2026</span>
            </div>
            <div className="schedule-row">
              <span>🕒 <strong>Lunes a Viernes:</strong> 6:00 AM – 10:00 PM (Miércoles desde 6:30 AM)</span>
              <span className="divider-ghost">|</span>
              <span><strong>Sábado y Domingo:</strong> Cerrado</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
