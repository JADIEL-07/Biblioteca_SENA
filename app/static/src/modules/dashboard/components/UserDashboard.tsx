import { useState, useRef, useEffect } from 'react';
import {
  FiSettings, FiRefreshCw, FiLogOut, FiMenu, FiX, FiHome, FiMail, FiHelpCircle, FiUser, FiUserPlus
} from 'react-icons/fi';
import './UserDashboard.css';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardHome } from './DashboardHome';
import { UserConfig } from './UserConfig';

interface UserData {
  id: number;
  name?: string;
  nombre?: string;
  email?: string;
  correo?: string;
  role?: { name: string };
  rol?: { nombre: string };
  perfilCompleto?: boolean;
}

interface UserDashboardProps {
  user: UserData;
  onLogout: () => void;
  onGoToHome: () => void;
  onLogin?: () => void;
  onRegister?: () => void;
  initialSection?: string;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ 
  user, onLogout, onGoToHome, onLogin, onRegister, initialSection = 'home' 
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>(initialSection);
  const [theme, setTheme] = useState<'dark' | 'light'>(
    (localStorage.getItem('dashboard-theme') as 'dark' | 'light') ?? 'dark'
  );
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialSection) {
      setActiveSection(initialSection);
    }
  }, [initialSection]);

  const isGuest = user.id === 0;
  const currentRole = user.role?.name || user.rol?.nombre;
  const isPendingUser = !isGuest && currentRole !== 'APRENDIZ' && currentRole !== 'ADMIN';

  useEffect(() => {
    const syncTheme = () => {
      const storedTheme = (localStorage.getItem('dashboard-theme') as 'dark' | 'light') ?? 'dark';
      setTheme(storedTheme);
    };
    window.addEventListener('storage', syncTheme);
    return () => window.removeEventListener('storage', syncTheme);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = (user.name || user.nombre || '??')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const menuItems = [
    { id: 'config', label: 'Configuración y Privacidad', icon: <FiSettings /> },
    { id: 'update', label: 'Actualizar Información',    icon: <FiRefreshCw /> },
  ];

  return (
    <div className={`dashboard-layout theme-${theme}`}>
      {/* TOP NAVIGATION */}
      <nav className="dashboard-topnav">
        {/* Hamburger — solo en móvil */}
        <button
          className={`topnav-hamburger ${mobileSidebarOpen ? 'open' : ''}`}
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          aria-label="Abrir menú"
        >
          {mobileSidebarOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>

        <div className="topnav-logo">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/8/83/Sena_Colombia_logo.svg"
            alt="SENA"
            className="topnav-logo-img"
          />
          <span>BIBLIOTECA & ALMACÉN SENA</span>
        </div>

        <div className="topnav-right">
          <div className="topnav-links hidden-mobile">
            {isGuest && (
              <a href="#" onClick={(e) => { e.preventDefault(); onGoToHome(); }}>
                <FiHome className="nav-icon" /> INICIO
              </a>
            )}
            <a href="#contact">
              <FiMail className="nav-icon" /> CONTACTO
            </a>
            <a href="#help">
              <FiHelpCircle className="nav-icon" /> AYUDA
            </a>
          </div>

          {isGuest ? (
            <div className="topnav-guest-actions">
              <button className="btn-text" onClick={onLogin}>INICIAR SESIÓN</button>
              <button className="btn-outline" onClick={onRegister}>CREAR CUENTA</button>
            </div>
          ) : (
            <div className="topnav-user">
              <div className="avatar-circle" style={{ cursor: 'default' }}>{initials}</div>
            </div>
          )}
        </div>
      </nav>

      {/* BODY (SIDEBAR + MAIN CONTENT) */}
      <div className="dashboard-body">
        {/* Backdrop para cerrar sidebar en móvil */}
        {mobileSidebarOpen && (
          <div className="sidebar-backdrop" onClick={() => setMobileSidebarOpen(false)} />
        )}

        <DashboardSidebar
          activeSection={activeSection}
          onNavigate={(section) => { setActiveSection(section); setMobileSidebarOpen(false); }}
          isGuest={isGuest}
          isPendingUser={isPendingUser}
          user={user}
          onLogout={onLogout}
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isOpen={mobileSidebarOpen}
        />
        
        <main className="dashboard-main-content">
          {activeSection === 'home' && (
            <DashboardHome 
              user={user} 
              isGuest={isGuest}
              isPendingUser={isPendingUser}
              onNavigate={setActiveSection}
            />
          )}
          {activeSection === 'explore' && (
            <div className="placeholder-view">
              <h2>Catálogo de elementos</h2>
              <p>Aquí se mostrarán todos los libros y equipos disponibles.</p>
            </div>
          )}
          {(activeSection === 'config' || activeSection === 'update') && !isGuest && (
            <UserConfig user={user} />
          )}
        </main>
      </div>
    </div>
  );
};
