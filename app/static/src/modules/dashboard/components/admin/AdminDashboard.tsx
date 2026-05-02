import React, { useState, useEffect } from 'react';
import { FiHome, FiMail, FiHelpCircle, FiMenu, FiX } from 'react-icons/fi';
import { AdminSidebar } from './AdminSidebar';
import { AdminHome } from './AdminHome';
import { UserConfig } from '../UserConfig';
import { UserManagement } from './UserManagement';
import { AuditLogs } from './AuditLogs';
import { LoanManagement } from './LoanManagement';
import { ReservationManagement } from './ReservationManagement';
import { MaintenanceManagement } from './MaintenanceManagement';
import { SystemReports } from './SystemReports';
import { InventoryManagement } from './InventoryManagement';
import { OutputManagement } from './OutputManagement';
import { ProfileOverlay } from './ProfileOverlay';
import './AdminDashboard.css';
import '../UserDashboard.css'; // Importamos los estilos base del dashboard de usuario para coherencia

interface UserData {
  id: number;
  name?: string;
  nombre?: string;
  role?: { name: string };
  rol?: { nombre: string };
  profile_image?: string;
}

interface AdminDashboardProps {
  user: UserData;
  onLogout: () => void;
  onUserUpdate: (userData: any) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout, onUserUpdate }) => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(
    (localStorage.getItem('dashboard-theme') as 'dark' | 'light') ?? 'dark'
  );

  useEffect(() => {
    const syncTheme = () => {
      const storedTheme = (localStorage.getItem('dashboard-theme') as 'dark' | 'light') ?? 'dark';
      setTheme(storedTheme);
    };
    window.addEventListener('storage', syncTheme);
    return () => window.removeEventListener('storage', syncTheme);
  }, []);

  const handleNavigate = (section: string) => {
    if (section === 'profile') {
      setShowProfileModal(true);
    } else {
      setActiveSection(section);
      setIsMobileSidebarOpen(false);
    }
  };

  const initials = (user.name || user.nombre || '??')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className={`dashboard-layout theme-${theme} admin-specific`}>
      {/* TOP NAVIGATION (Mismo diseño que el aprendiz) */}
      <nav className="dashboard-topnav">
        <button
          className="topnav-mobile-toggle"
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          aria-label={isMobileSidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={isMobileSidebarOpen}
        >
          {isMobileSidebarOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>

        <div className="topnav-logo">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/8/83/Sena_Colombia_logo.svg"
            alt="SENA"
            className="topnav-logo-img"
          />
          <span>BIBLIOTECA & ALMACÉN SENA (ADMIN)</span>
        </div>

        <div className="topnav-right">
          <div className="topnav-links hidden-mobile">
            <a href="#contact">
              <FiMail className="nav-icon" /> CONTACTO
            </a>
            <a href="#help">
              <FiHelpCircle className="nav-icon" /> AYUDA
            </a>
          </div>

          <div className="topnav-user">
            <div className="avatar-circle" style={{ background: 'var(--sena-green)', overflow: 'hidden' }}>
              {user.profile_image ? (
                <img src={user.profile_image} alt="Perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                initials
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* BODY (SIDEBAR + MAIN CONTENT) */}
      <div className="dashboard-body">
        {isMobileSidebarOpen && (
          <div
            className="sidebar-backdrop"
            onClick={() => setIsMobileSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
        <AdminSidebar
          activeSection={activeSection}
          onNavigate={handleNavigate}
          user={user}
          onLogout={onLogout}
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isMobileOpen={isMobileSidebarOpen}
        />
        
        <main className="dashboard-main-content">
          {/* Cabecera interna opcional para el título de la sección */}
          <div className="section-header" style={{ marginBottom: '1.5rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
              {activeSection === 'dashboard' && 'Panel de Control General'}
              {activeSection === 'inventory' && 'Gestión de Inventario'}
              {activeSection === 'inventory-table' && 'Tabla de Inventario'}
              {activeSection === 'inventory-locations' && 'Gestión de Ubicaciones'}
              {activeSection === 'inventory-categories' && 'Gestión de Categorías'}
              {activeSection === 'loans' && 'Control de Préstamos'}
              {activeSection === 'users' && 'Gestión de Usuarios'}
              {activeSection === 'reports' && 'Reportes Estadísticos'}
              {activeSection === 'audit' && 'Auditoría del Sistema'}
              {activeSection === 'reservations' && 'Control de Reservas'}
              {activeSection === 'maintenance' && 'Gestión de Mantenimiento'}
              {activeSection === 'exits' && 'Control de Salidas Controladas'}
              {activeSection === 'config' && 'Configuración del Sistema'}
            </h1>
          </div>

          <div className="content-container">
            {activeSection === 'dashboard' && <AdminHome />}
            {activeSection === 'config' && <UserConfig user={user} />}
            {activeSection === 'users' && <UserManagement />}
            {activeSection === 'audit' && <AuditLogs />}
            {activeSection === 'loans' && <LoanManagement />}
            {activeSection === 'reservations' && <ReservationManagement />}
            {activeSection === 'maintenance' && <MaintenanceManagement />}
            {activeSection === 'reports' && <SystemReports />}
            {activeSection === 'inventory' && <InventoryManagement />}
            {activeSection === 'inventory-table' && <InventoryManagement />}
            {activeSection === 'inventory-locations' && <InventoryManagement activeTab="locations" />}
            {activeSection === 'inventory-categories' && <InventoryManagement activeTab="categories" />}
            {activeSection === 'exits' && <OutputManagement />}
            {activeSection !== 'dashboard' && activeSection !== 'config' && activeSection !== 'users' && activeSection !== 'audit' && activeSection !== 'loans' && activeSection !== 'reservations' && activeSection !== 'maintenance' && activeSection !== 'reports' && activeSection !== 'inventory' && !activeSection.startsWith('inventory-') && activeSection !== 'exits' && (
              <div className="placeholder-view">
                <h2>Sección en construcción</h2>
                <p>El módulo de {activeSection} estará disponible pronto.</p>
              </div>
            )}
          </div>
        </main>
      </div>
      {showProfileModal && (
        <ProfileOverlay 
          user={user} 
          onClose={() => setShowProfileModal(false)} 
          onSave={(photo) => onUserUpdate({ profile_image: photo })}
        />
      )}
    </div>
  );
};
