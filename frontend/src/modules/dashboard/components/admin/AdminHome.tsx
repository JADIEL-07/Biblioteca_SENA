import React from 'react';
import { 
  FiBox, FiCheckCircle, FiBookOpen, FiTool, FiCalendar
} from 'react-icons/fi';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';

export const AdminHome: React.FC = () => {
  // Datos mock para gráficos
  const lineData = [
    { name: 'Ene', value: 60 },
    { name: 'Feb', value: 70 },
    { name: 'Mar', value: 105 },
    { name: 'Abr', value: 90 },
    { name: 'May', value: 130 },
    { name: 'Jun', value: 120 },
    { name: 'Jul', value: 170 }, // Simula el pico del final
  ];

  const pieData = [
    { name: 'Disponible', value: 842, color: '#39A900' },
    { name: 'Prestado', value: 305, color: '#eab308' },
    { name: 'En mantenimiento', value: 58, color: '#f97316' },
    { name: 'Dañado', value: 23, color: '#ef4444' },
    { name: 'Perdido', value: 20, color: '#64748b' },
  ];

  return (
    <div className="admin-home-content">
      {/* ── KPI CARDS ── */}
      <div className="admin-kpi-grid">
        <div className="admin-kpi-card">
          <div className="kpi-icon-box" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#39A900' }}>
            <FiBox />
          </div>
          <div className="kpi-info">
            <span className="kpi-title">Total de elementos</span>
            <span className="kpi-value">1.248</span>
            <span className="kpi-sub green">↑ 12 este mes</span>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="kpi-icon-box" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#39A900' }}>
            <FiCheckCircle />
          </div>
          <div className="kpi-info">
            <span className="kpi-title">Disponibles</span>
            <span className="kpi-value">842</span>
            <span className="kpi-sub green">67.6% del total</span>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="kpi-icon-box" style={{ background: 'rgba(234, 179, 8, 0.1)', color: '#eab308' }}>
            <FiBookOpen />
          </div>
          <div className="kpi-info">
            <span className="kpi-title">Prestados</span>
            <span className="kpi-value">305</span>
            <span className="kpi-sub yellow">24.4% del total</span>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="kpi-icon-box" style={{ background: 'rgba(249, 115, 22, 0.1)', color: '#f97316' }}>
            <FiTool />
          </div>
          <div className="kpi-info">
            <span className="kpi-title">En mantenimiento</span>
            <span className="kpi-value">58</span>
            <span className="kpi-sub orange">4.7% del total</span>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="kpi-icon-box" style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' }}>
            <FiCalendar />
          </div>
          <div className="kpi-info">
            <span className="kpi-title">Reservas activas</span>
            <span className="kpi-value">43</span>
            <span className="kpi-sub green">↑ 5 hoy</span>
          </div>
        </div>
      </div>

      <div className="admin-main-grid">
        {/* COLUMNA IZQUIERDA/CENTRO */}
        <div className="admin-charts-col">
          <div className="charts-row">
            {/* Préstamos por mes */}
            <div className="admin-card line-chart-card">
              <div className="admin-card-header">
                <h3>Préstamos por mes</h3>
                <select className="admin-select"><option>Este año</option></select>
              </div>
              <div className="chart-container" style={{ height: 250, marginTop: '1rem' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                      itemStyle={{ color: '#39A900' }}
                    />
                    <Line type="monotone" dataKey="value" stroke="#39A900" strokeWidth={3} dot={{ r: 4, fill: '#39A900' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Elementos por estado */}
            <div className="admin-card donut-chart-card">
              <div className="admin-card-header">
                <h3>Elementos por estado</h3>
              </div>
              <div className="donut-content" style={{ display: 'flex', alignItems: 'center', height: '250px' }}>
                <div style={{ width: '60%', height: '100%', position: 'relative' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Etiqueta Central */}
                  <div className="donut-center-label" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--admin-text-primary)' }}>1.248</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>Total</div>
                  </div>
                </div>
                <div className="donut-legend" style={{ width: '40%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {pieData.map(item => (
                    <div key={item.name} className="legend-item" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: item.color, marginTop: '0.3rem' }} />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--admin-text-primary)' }}>{item.name}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)' }}>{item.value} ({(item.value/1248*100).toFixed(1)}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="charts-row bottom-row">
            {/* Próximas devoluciones */}
            <div className="admin-card lists-card">
              <div className="admin-card-header">
                <h3>Próximas devoluciones</h3>
              </div>
              <div className="returns-list" style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="return-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <img src="https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&q=80&w=60&h=60" alt="Proyector" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Proyector Epson X41</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>Juan Pérez</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.85rem', color: '#ef4444', fontWeight: 'bold' }}>Hoy</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>23:59</div>
                  </div>
                </div>

                <div className="return-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <img src="https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80&w=60&h=60" alt="Portátil" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Portátil HP 250 G8</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>María López</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.85rem' }}>22 Jun 2025</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>23:59</div>
                  </div>
                </div>

                <div className="return-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <img src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=60&h=60" alt="Cámara" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Cámara Canon EOS 2000D</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>Carlos Ramírez</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.85rem' }}>24 Jun 2025</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>23:59</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Categorías principales */}
            <div className="admin-card categories-card">
              <div className="admin-card-header">
                <h3>Categorías principales</h3>
              </div>
              <div className="categories-bars" style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {[
                  { name: 'Equipos tecnológicos', val: 482, pct: 38.6 },
                  { name: 'Libros', val: 325, pct: 26.0 },
                  { name: 'Herramientas', val: 218, pct: 17.5 },
                  { name: 'Mobiliario', val: 123, pct: 9.9 },
                  { name: 'Otros', val: 100, pct: 8.0 }
                ].map(cat => (
                  <div key={cat.name} className="cat-bar-item">
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                      <span style={{ color: 'var(--admin-text-secondary)' }}>{cat.name}</span>
                      <span style={{ color: 'var(--admin-text-muted)' }}>{cat.val} ({cat.pct}%)</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--admin-border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${cat.pct}%`, height: '100%', backgroundColor: '#39A900', borderRadius: '3px' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA */}
        <div className="admin-side-col">
          <div className="admin-card activity-card" style={{ height: '100%' }}>
            <div className="admin-card-header">
              <h3>Actividad reciente</h3>
            </div>
            <div className="activity-list" style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="activity-item" style={{ display: 'flex', gap: '1rem' }}>
                <div className="activity-icon" style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(34, 197, 94, 0.1)', color: '#39A900', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FiBookOpen />
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Juan Pérez</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--admin-text-secondary)' }}>Prestó "Proyector Epson"</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', marginTop: '0.2rem' }}>Hace 15 minutos</div>
                </div>
              </div>

              <div className="activity-item" style={{ display: 'flex', gap: '1rem' }}>
                <div className="activity-icon" style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(234, 179, 8, 0.1)', color: '#eab308', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FiCalendar />
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>María López</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--admin-text-secondary)' }}>Reservó "Cámara Canon"</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', marginTop: '0.2rem' }}>Hace 1 hora</div>
                </div>
              </div>

              <div className="activity-item" style={{ display: 'flex', gap: '1rem' }}>
                <div className="activity-icon" style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(249, 115, 22, 0.1)', color: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FiTool />
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Carlos Ramírez</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--admin-text-secondary)' }}>Reportó daño en "Portátil HP"</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', marginTop: '0.2rem' }}>Hace 2 horas</div>
                </div>
              </div>

              <div className="activity-item" style={{ display: 'flex', gap: '1rem' }}>
                <div className="activity-icon" style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FiBox />
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Ana Torres</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--admin-text-secondary)' }}>Devolvió "Micrófono Shure"</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', marginTop: '0.2rem' }}>Hace 3 horas</div>
                </div>
              </div>
              
              <div className="activity-item" style={{ display: 'flex', gap: '1rem' }}>
                <div className="activity-icon" style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(34, 197, 94, 0.1)', color: '#39A900', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FiBookOpen />
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Luis Gómez</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--admin-text-secondary)' }}>Prestó "Libro Redes"</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', marginTop: '0.2rem' }}>Hace 4 horas</div>
                </div>
              </div>
            </div>
            <button className="view-all-activity" style={{ marginTop: 'auto', width: '100%', padding: '0.75rem', background: 'transparent', border: '1px solid rgba(34, 197, 94, 0.3)', color: '#39A900', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
              Ver todas las actividades
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
