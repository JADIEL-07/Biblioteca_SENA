import React from 'react';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid 
} from 'recharts';
import { 
  FiAlertCircle, FiTool, FiMonitor, FiClipboard, FiBox, 
  FiPlus, FiUserCheck, FiUpload, FiSearch, FiArrowRight,
  FiAlertTriangle, FiInfo
} from 'react-icons/fi';
import './SoporteDashboard.css';

interface UserData {
  id: number;
  name?: string;
  nombre?: string;
}

interface SoporteHomeProps {
  user: UserData;
}

const pieData = [
  { name: 'Abiertas', value: 7, color: '#3B82F6' },
  { name: 'En proceso', value: 8, color: '#A855F7' },
  { name: 'Pendientes repuestos', value: 4, color: '#F97316' },
  { name: 'En espera usuario', value: 2, color: '#EAB308' },
  { name: 'Resueltas', value: 2, color: '#22C55E' },
];

const barData = [
  { name: 'Hardware', value: 9 },
  { name: 'Software', value: 6 },
  { name: 'Red / Conectividad', value: 4 },
  { name: 'Periféricos', value: 3 },
  { name: 'Otros', value: 1 },
];

const equiposPieData = [
  { name: 'Operativos', value: 142, color: '#22C55E' },
  { name: 'En mantenimiento', value: 10, color: '#F97316' },
  { name: 'Fuera de servicio', value: 6, color: '#EF4444' },
];

export const SoporteHome: React.FC<SoporteHomeProps> = ({ user }) => {
  const firstName = (user.name || user.nombre || 'Soporte Técnico').split(' ')[0];

  return (
    <div className="soporte-home fade-in">
      {/* HEADER ROW */}
      <div className="sh-header">
        <div className="sh-header-text">
          <h1>¡Hola, {firstName}!👋</h1>
          <p>Aquí tienes un resumen del estado técnico de la sede.</p>
        </div>
        <div className="sh-header-actions">
          <span className="sh-update-text">Última actualización: 21/05/2025 10:30 a. m.</span>
          <button className="sh-btn-outline">
            <FiUpload className="sh-icon" /> Actualizar
          </button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="sh-stats-grid">
        <div className="sh-stat-card">
          <div className="sh-stat-info">
            <span className="sh-stat-title">Incidencias abiertas</span>
            <span className="sh-stat-value">7</span>
            <span className="sh-stat-sub red">Prioritarias: 2</span>
          </div>
          <div className="sh-stat-icon-wrapper blue">
            <FiAlertCircle />
          </div>
        </div>

        <div className="sh-stat-card">
          <div className="sh-stat-info">
            <span className="sh-stat-title">En mantenimiento</span>
            <span className="sh-stat-value">5</span>
            <span className="sh-stat-sub gray">Equipos en proceso</span>
          </div>
          <div className="sh-stat-icon-wrapper orange">
            <FiTool />
          </div>
        </div>

        <div className="sh-stat-card">
          <div className="sh-stat-info">
            <span className="sh-stat-title">Equipos operativos</span>
            <span className="sh-stat-value">142</span>
            <span className="sh-stat-sub gray">Total en buen estado</span>
          </div>
          <div className="sh-stat-icon-wrapper green">
            <FiMonitor />
          </div>
        </div>

        <div className="sh-stat-card">
          <div className="sh-stat-info">
            <span className="sh-stat-title">Órdenes de trabajo</span>
            <span className="sh-stat-value">12</span>
            <span className="sh-stat-sub gray">Esta semana</span>
          </div>
          <div className="sh-stat-icon-wrapper purple">
            <FiClipboard />
          </div>
        </div>

        <div className="sh-stat-card">
          <div className="sh-stat-info">
            <span className="sh-stat-title">Repuestos en stock bajo</span>
            <span className="sh-stat-value">6</span>
            <span className="sh-stat-sub gray underline">Ver detalles</span>
          </div>
          <div className="sh-stat-icon-wrapper yellow">
            <FiBox />
          </div>
        </div>
      </div>

      {/* CHARTS & QUICK ACTIONS */}
      <div className="sh-charts-row">
        <div className="sh-panel">
          <div className="sh-panel-header">
            <h3>Incidencias por estado</h3>
          </div>
          <div className="sh-chart-container pie-container">
            <ResponsiveContainer width="50%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="sh-pie-legend">
              {pieData.map((item, idx) => (
                <div key={idx} className="sh-legend-item">
                  <span className="sh-dot" style={{ backgroundColor: item.color }}></span>
                  <span className="sh-legend-name">{item.name}</span>
                  <span className="sh-legend-value">{item.value} ({Math.round((item.value / 23) * 100)}%)</span>
                </div>
              ))}
            </div>
            <div className="sh-pie-center-text">
              <span className="total-label">Total</span>
              <span className="total-value">23</span>
            </div>
          </div>
          <div className="sh-panel-footer">
            <a href="#">Ver todas las incidencias <FiArrowRight /></a>
          </div>
        </div>

        <div className="sh-panel">
          <div className="sh-panel-header flex-between">
            <h3>Incidencias por categoría</h3>
            <select className="sh-select"><option>Esta semana</option></select>
          </div>
          <div className="sh-chart-container bar-container">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--soporte-border)" />
                <XAxis dataKey="name" stroke="var(--soporte-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--soporte-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'var(--soporte-card-hover)', opacity: 0.6 }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {
                    barData.map((_, index) => {
                      const colors = ['#3B82F6', '#22C55E', '#F97316', '#A855F7', '#EAB308'];
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                    })
                  }
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="sh-panel-footer">
            <a href="#">Ver reporte completo <FiArrowRight /></a>
          </div>
        </div>

        <div className="sh-panel action-panel">
          <div className="sh-panel-header">
            <h3>Acciones rápidas</h3>
          </div>
          <div className="sh-actions-list">
            <button className="sh-action-btn"><FiPlus className="icon blue" /> Nueva incidencia</button>
            <button className="sh-action-btn"><FiClipboard className="icon yellow" /> Nueva orden de trabajo</button>
            <button className="sh-action-btn"><FiUserCheck className="icon purple" /> Asignar mantenimiento</button>
            <button className="sh-action-btn"><FiTool className="icon green" /> Registrar reparación</button>
            <button className="sh-action-btn"><FiBox className="icon cyan" /> Solicitar repuesto</button>
            <button className="sh-action-btn"><FiSearch className="icon blue" /> Buscar equipo</button>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTIONS */}
      <div className="sh-bottom-grid">
        {/* Incidencias recientes */}
        <div className="sh-panel col-span-2">
          <div className="sh-panel-header flex-between">
            <h3>Incidencias recientes</h3>
            <a href="#" className="sh-link">Ver todas <FiArrowRight /></a>
          </div>
          <div className="sh-table-container">
            <table className="sh-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Título</th>
                  <th>Equipo</th>
                  <th>Estado</th>
                  <th>Prioridad</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span className="sh-id-tag red"><FiMonitor/> INC-00023</span></td>
                  <td>Portátil no enciende</td>
                  <td>Laptop Dell Inspiron 15</td>
                  <td><span className="sh-badge badge-blue">Abierta</span></td>
                  <td><span className="sh-text-red">Alta</span></td>
                  <td className="sh-date">21/05/2025<br/>10:15 a. m.</td>
                </tr>
                <tr>
                  <td><span className="sh-id-tag orange"><FiAlertCircle/> INC-00022</span></td>
                  <td>Sin conexión a internet</td>
                  <td>Access Point - Lab 3</td>
                  <td><span className="sh-badge badge-orange">En proceso</span></td>
                  <td><span className="sh-text-orange">Media</span></td>
                  <td className="sh-date">20/05/2025<br/>09:45 a. m.</td>
                </tr>
                <tr>
                  <td><span className="sh-id-tag purple"><FiMonitor/> INC-00021</span></td>
                  <td>Impresora con atascos</td>
                  <td>HP LaserJet 426</td>
                  <td><span className="sh-badge badge-purple">Pend. repuestos</span></td>
                  <td><span className="sh-text-orange">Media</span></td>
                  <td className="sh-date">20/05/2025<br/>04:30 p. m.</td>
                </tr>
                <tr>
                  <td><span className="sh-id-tag green"><FiMonitor/> INC-00020</span></td>
                  <td>Pantalla con líneas</td>
                  <td>Monitor Samsung 24</td>
                  <td><span className="sh-badge badge-yellow">En espera usuario</span></td>
                  <td><span className="sh-text-green">Baja</span></td>
                  <td className="sh-date">20/05/2025<br/>02:10 p. m.</td>
                </tr>
                <tr>
                  <td><span className="sh-id-tag cyan"><FiMonitor/> INC-00019</span></td>
                  <td>Teclado falla varias teclas</td>
                  <td>Teclado Logitech K120</td>
                  <td><span className="sh-badge badge-green">Resuelta</span></td>
                  <td><span className="sh-text-green">Baja</span></td>
                  <td className="sh-date">19/05/2025<br/>11:20 a. m.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Próximos mantenimientos & Alertas */}
        <div className="sh-panel">
          <div className="sh-panel-header flex-between">
            <h3>Próximos mantenimientos</h3>
            <a href="#" className="sh-link">Ver calendario <FiArrowRight /></a>
          </div>
          <div className="sh-list">
            <div className="sh-list-item">
              <div className="sh-list-icon blue"><FiTool/></div>
              <div className="sh-list-content">
                <h4>Multímetro Fluke 115</h4>
                <p>Código: HER-00123 • Laboratorio 2</p>
              </div>
              <div className="sh-list-right">
                <span>23/05/2025</span>
                <small>En 2 días</small>
              </div>
            </div>
            <div className="sh-list-item">
              <div className="sh-list-icon green"><FiTool/></div>
              <div className="sh-list-content">
                <h4>Osciloscopio Tektronix</h4>
                <p>Código: HER-00077 • Laboratorio 2</p>
              </div>
              <div className="sh-list-right">
                <span>25/05/2025</span>
                <small>En 4 días</small>
              </div>
            </div>
            <div className="sh-list-item">
              <div className="sh-list-icon yellow"><FiTool/></div>
              <div className="sh-list-content">
                <h4>Taladro DeWalt DCD771</h4>
                <p>Código: HER-00101 • Taller 1</p>
              </div>
              <div className="sh-list-right">
                <span>28/05/2025</span>
                <small>En 7 días</small>
              </div>
            </div>
            <div className="sh-list-item">
              <div className="sh-list-icon purple"><FiTool/></div>
              <div className="sh-list-content">
                <h4>Impresora HP LaserJet</h4>
                <p>Código: EQP-00055 • Biblioteca</p>
              </div>
              <div className="sh-list-right">
                <span>30/05/2025</span>
                <small>En 9 días</small>
              </div>
            </div>
          </div>
        </div>

        <div className="sh-panel alerts-panel">
          <div className="sh-panel-header flex-between">
            <h3>Alertas importantes</h3>
            <a href="#" className="sh-link">Ver todas <FiArrowRight /></a>
          </div>
          <div className="sh-alerts-list">
            <div className="sh-alert-item alert-red">
              <FiAlertTriangle className="alert-icon" />
              <div className="alert-content">
                <h4>2 equipos críticos fuera de servicio</h4>
                <p>Requieren atención inmediata</p>
              </div>
              <FiArrowRight className="alert-arrow" />
            </div>
            <div className="sh-alert-item alert-orange">
              <FiAlertTriangle className="alert-icon" />
              <div className="alert-content">
                <h4>4 incidencias sin actualizar</h4>
                <p>Tienen más de 2 días sin cambios</p>
              </div>
              <FiArrowRight className="alert-arrow" />
            </div>
            <div className="sh-alert-item alert-blue">
              <FiInfo className="alert-icon" />
              <div className="alert-content">
                <h4>Repuestos en stock bajo</h4>
                <p>6 repuestos críticos con bajo inventario</p>
              </div>
              <FiArrowRight className="alert-arrow" />
            </div>
          </div>
        </div>

      </div>

      <div className="sh-bottom-grid-3">
        {/* Estado de equipos */}
        <div className="sh-panel">
           <div className="sh-panel-header">
            <h3>Estado de equipos</h3>
          </div>
          <div className="sh-chart-container pie-container small">
            <ResponsiveContainer width="50%" height="100%">
              <PieChart>
                <Pie
                  data={equiposPieData}
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {equiposPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="sh-pie-legend">
              {equiposPieData.map((item, idx) => (
                <div key={idx} className="sh-legend-item">
                  <span className="sh-dot" style={{ backgroundColor: item.color }}></span>
                  <span className="sh-legend-name">{item.name}</span>
                  <span className="sh-legend-value">{item.value} ({Math.round((item.value / 158) * 100)}%)</span>
                </div>
              ))}
            </div>
            <div className="sh-pie-center-text small-center">
              <span className="total-label">Total</span>
              <span className="total-value">158</span>
            </div>
          </div>
        </div>

        {/* Solicitudes de repuestos */}
        <div className="sh-panel col-span-2">
          <div className="sh-panel-header flex-between">
            <h3>Solicitudes de repuestos</h3>
            <a href="#" className="sh-link">Ver todas <FiArrowRight /></a>
          </div>
          <div className="sh-table-container">
            <table className="sh-table small-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Repuesto</th>
                  <th>Solicitado por</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>REP-00015</td>
                  <td>Batería para portátil Dell</td>
                  <td>Carlos Rojas</td>
                  <td><span className="sh-badge badge-green">Aprobado</span></td>
                  <td>21/05/2025</td>
                </tr>
                <tr>
                  <td>REP-00014</td>
                  <td>Cable de poder 1.5m</td>
                  <td>María Gómez</td>
                  <td><span className="sh-badge badge-orange">Pendiente</span></td>
                  <td>20/05/2025</td>
                </tr>
                <tr>
                  <td>REP-00013</td>
                  <td>Disco duro SSD 512GB</td>
                  <td>Pedro Silva</td>
                  <td><span className="sh-badge badge-blue">En camino</span></td>
                  <td>19/05/2025</td>
                </tr>
                <tr>
                  <td>REP-00012</td>
                  <td>Tóner HP 85A</td>
                  <td>Laura Martínez</td>
                  <td><span className="sh-badge badge-green">Entregado</span></td>
                  <td>18/05/2025</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Actividad técnica reciente */}
        <div className="sh-panel">
          <div className="sh-panel-header flex-between">
            <h3>Actividad técnica reciente</h3>
            <a href="#" className="sh-link">Ver todas <FiArrowRight /></a>
          </div>
          <div className="sh-timeline">
            <div className="tl-item">
              <div className="tl-icon blue"><FiUserCheck/></div>
              <div className="tl-content">
                <p><strong>Carlos Rojas</strong> actualizó la incidencia INC-00022</p>
                <span>21/05/2025 09:50 a. m.</span>
              </div>
            </div>
            <div className="tl-item">
              <div className="tl-icon red"><FiTool/></div>
              <div className="tl-content">
                <p><strong>María Gómez</strong> cerró la orden OT-00045</p>
                <span>21/05/2025 08:20 a. m.</span>
              </div>
            </div>
            <div className="tl-item">
              <div className="tl-icon green"><FiTool/></div>
              <div className="tl-content">
                <p><strong>Pedro Silva</strong> registró reparación en EQP-00067</p>
                <span>20/05/2025 04:15 p. m.</span>
              </div>
            </div>
            <div className="tl-item">
              <div className="tl-icon purple"><FiUserCheck/></div>
              <div className="tl-content">
                <p><strong>Laura Martínez</strong> asignó la incidencia INC-00023</p>
                <span>20/05/2025 10:30 a. m.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
