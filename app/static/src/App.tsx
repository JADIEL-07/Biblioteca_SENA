import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { LoginForm } from './modules/auth/components/LoginForm';
import { Terms } from './modules/legal/components/Terms';
import { Privacy } from './modules/legal/components/Privacy';
import { ForgotPassword } from './modules/auth/components/ForgotPassword';
import { ResetPassword } from './modules/auth/components/ResetPassword';
import { UserDashboard } from './modules/dashboard/components/UserDashboard';
import { AdminDashboard } from './modules/dashboard/components/admin/AdminDashboard';
import { BibliotecarioDashboard } from './modules/dashboard/components/bibliotecario/BibliotecarioDashboard';
import { AlmacenistaDashboard } from './modules/dashboard/components/almacenista/AlmacenistaDashboard';
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
} from 'react-icons/fi';

import { SERVICES_DATA } from './shared/constants';
const senaBg = '/assets/images/sena-library-bg.png';
import { FloatingParticles } from './components/ui/FloatingParticles';

// ── Landing Page ──────────────────────────────────────────────────────────────
function Landing({ loggedUser, onLogout }: { loggedUser: any; onLogout: () => void }) {
  const navigate = useNavigate();
  const [menuOpenLanding, setMenuOpenLanding] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [theme] = useState<'dark' | 'light'>(
    (localStorage.getItem('dashboard-theme') as 'dark' | 'light') ?? 'dark'
  );

  return (
    <div className={`home-wrapper ${theme === 'light' ? 'theme-light' : 'theme-dark'}`}>
      <nav className="main-nav">
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
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/'); setMobileNavOpen(false); }}>
            <FiHome className="nav-icon" /> INICIO
          </a>
          <a href="#contact" onClick={() => setMobileNavOpen(false)}>
            <FiMail className="nav-icon" /> CONTACTO
          </a>
          <a href="#help" onClick={() => setMobileNavOpen(false)}>
            <FiHelpCircle className="nav-icon" /> AYUDA
          </a>

          {loggedUser ? (
            <div className="nav-avatar" style={{ overflow: 'hidden' }}>
              {loggedUser.profile_image
                ? <img src={loggedUser.profile_image} alt="Perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : (loggedUser.name || loggedUser.nombre || '').split(' ').map((n: any) => n[0]).slice(0, 2).join('').toUpperCase()
              }
            </div>
          ) : (
            <>
              <a href="#" className="nav-link-login" onClick={(e) => { e.preventDefault(); navigate('/login'); setMobileNavOpen(false); }}>
                <FiUser className="nav-icon" /> INICIAR SESIÓN
              </a>
              <a href="#" className="btn-create-account" onClick={(e) => { e.preventDefault(); navigate('/register'); setMobileNavOpen(false); }}>
                <FiUserPlus className="nav-icon" /> CREAR CUENTA
              </a>
            </>
          )}
        </div>
      </nav>

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
            Al hacer clic en Comienza ahora, aceptas nuestros{' '}
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/terms'); }}>terminos</a>{' '}
            y{' '}
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/privacy'); }}>politica de privacidad</a>
          </p>
          <button
            className="btn cta-home-btn"
            onClick={() => {
              if (loggedUser) {
                const role = (loggedUser.role?.name || loggedUser.rol?.nombre || '').toUpperCase();
                navigate(role === 'ADMIN' ? '/admin' : role === 'BIBLIOTECARIO' ? '/bibliotecario' : role === 'ALMACENISTA' ? '/almacenista' : '/dashboard');
              } else {
                navigate('/dashboard/guest');
              }
            }}
          >
            COMIENZA AHORA
          </button>
        </div>
      </section>

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

// ── Root App ──────────────────────────────────────────────────────────────────
function AppRoutes() {
  const storedUser = localStorage.getItem('user');
  const [loggedUser, setLoggedUser] = useState<any>(storedUser ? JSON.parse(storedUser) : null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setLoggedUser(null);
  };

  const handleLoginSuccess = (user: any) => {
    setLoggedUser(user);
  };

  const handleUserUpdate = (updatedUser: any) => {
    const newUser = { ...loggedUser, ...updatedUser };
    setLoggedUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const rawRole = loggedUser?.role?.name || loggedUser?.rol?.nombre || '';
  const userRole = rawRole.toUpperCase();
  const isAdmin = userRole === 'ADMIN';
  const isBibliotecario = userRole === 'BIBLIOTECARIO';
  const isAlmacenista = userRole === 'ALMACENISTA';
  const isStaff = isBibliotecario || isAlmacenista;

  return (
    <Routes>
      {/* Public pages */}
      <Route path="/" element={<Landing loggedUser={loggedUser} onLogout={handleLogout} />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Auth */}
      <Route
        path="/login"
        element={
          loggedUser
            ? <Navigate to={isAdmin ? '/admin' : isBibliotecario ? '/bibliotecario' : isAlmacenista ? '/almacenista' : '/dashboard'} replace />
            : <LoginForm mode="login" onLoginSuccess={handleLoginSuccess} />
        }
      />
      <Route
        path="/register"
        element={
          loggedUser
            ? <Navigate to={isAdmin ? '/admin' : isBibliotecario ? '/bibliotecario' : isAlmacenista ? '/almacenista' : '/dashboard'} replace />
            : <LoginForm mode="register" onLoginSuccess={handleLoginSuccess} />
        }
      />

      {/* Admin dashboard */}
      <Route
        path="/admin/*"
        element={
          loggedUser && isAdmin
            ? <AdminDashboard user={loggedUser} onLogout={handleLogout} onUserUpdate={handleUserUpdate} />
            : <Navigate to="/login" replace />
        }
      />

      {/* Bibliotecario dashboard */}
      <Route
        path="/bibliotecario/*"
        element={
          loggedUser && isBibliotecario
            ? <BibliotecarioDashboard user={loggedUser} onLogout={handleLogout} onUserUpdate={handleUserUpdate} />
            : <Navigate to="/login" replace />
        }
      />

      {/* Almacenista dashboard */}
      <Route
        path="/almacenista/*"
        element={
          loggedUser && isAlmacenista
            ? <AlmacenistaDashboard user={loggedUser} onLogout={handleLogout} onUserUpdate={handleUserUpdate} />
            : <Navigate to="/login" replace />
        }
      />

      {/* User / Aprendiz / Guest dashboard */}
      <Route
        path="/dashboard/*"
        element={
          <UserDashboard
            user={loggedUser ?? { nombre: 'Invitado SENA', rol: { nombre: 'Invitado' }, id: 0 }}
            onLogout={loggedUser ? handleLogout : () => {}}
            onGoToHome={() => {}}
            onLogin={() => {}}
            onRegister={() => {}}
            onUserUpdate={loggedUser ? handleUserUpdate : undefined}
          />
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}


function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
