import React, { useState, useEffect, useRef } from 'react';
import { 
  FiSearch, FiFilter, FiPlus, FiDownload, FiEye, FiEdit2, 
  FiMoreVertical, FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight, 
  FiX, FiSave, FiCamera, FiRefreshCcw 
} from 'react-icons/fi';
import './InventoryManagement.css';

interface Item {
  id: number;
  name: string;
  code: string;
  category_id: number;
  category_name: string;
  status_id: number;
  status_name: string;
  location_id: number;
  location_name: string;
  brand: string | null;
  model: string | null;
  serial_number: string | null;
  image_url: string | null;
  stock: number;
}

interface FilterData {
  categories: { id: number, name: string }[];
  statuses: { id: number, name: string }[];
  locations: { id: number, name: string }[];
}

export const InventoryManagement: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterLocation, setFilterLocation] = useState('ALL');
  const [filters, setFilters] = useState<FilterData>({ categories: [], statuses: [], locations: [] });

  // Modal & Camera State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [newItem, setNewItem] = useState({
    name: '', code: '', category_id: '', location_id: '', 
    status_id: '', brand: '', model: '', serial_number: '', 
    stock: 1, image_url: '', description: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        category_id: filterCategory,
        status_id: filterStatus,
        location_id: filterLocation
      });

      const [itemsRes, filtersRes] = await Promise.all([
        fetch(`/api/v1/items/?${params.toString()}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/v1/items/filters', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (itemsRes.ok) setItems(await itemsRes.json());
      if (filtersRes.ok) {
        const fData = await filtersRes.json();
        setFilters(fData);
        if (fData.categories.length > 0 && !newItem.category_id) {
          setNewItem(prev => ({ 
            ...prev, 
            category_id: fData.categories[0].id.toString(),
            status_id: fData.statuses[0].id.toString(),
            location_id: fData.locations[0].id.toString()
          }));
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchTerm, filterCategory, filterStatus, filterLocation]);

  // Camera Functions
  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("No se pudo acceder a la cámara.");
      setShowCamera(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        
        // Aplicar espejo al canvas para que la foto coincida con la vista previa
        context.translate(canvasRef.current.width, 0);
        context.scale(-1, 1);
        
        context.drawImage(videoRef.current, 0, 0);
        const photoData = canvasRef.current.toDataURL('image/jpeg', 0.7);
        setNewItem({ ...newItem, image_url: photoData });
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/v1/items/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify(newItem)
      });
      if (response.ok) {
        setShowAddModal(false);
        setNewItem({
          name: '', code: '', category_id: filters.categories[0]?.id.toString() || '', 
          location_id: filters.locations[0]?.id.toString() || '', 
          status_id: filters.statuses[0]?.id.toString() || '', 
          brand: '', model: '', serial_number: '', 
          stock: 1, image_url: '', description: ''
        });
        fetchData();
      }
    } catch (error) {
      console.error('Error creating item:', error);
    }
  };

  const getStatusClass = (status: string) => {
    const s = status.toUpperCase();
    if (s.includes('DISPONIBLE')) return 'disponible';
    if (s.includes('PRESTADO')) return 'prestado';
    if (s.includes('MANTENIMIENTO')) return 'mantenimiento';
    if (s.includes('DAÑADO')) return 'dañado';
    return '';
  };

  const getCategoryClass = (cat: string) => {
    const c = cat.toLowerCase();
    if (c.includes('libro')) return 'libro';
    if (c.includes('equipo')) return 'equipo';
    if (c.includes('herramienta')) return 'herramienta';
    return '';
  };

  return (
    <div className="inventory-management">
      <div className="inventory-toolbar">
        <div className="toolbar-left">
          <div className="search-container-pro">
            <FiSearch className="search-icon" />
            <input type="text" placeholder="Buscar por nombre, código o categoría..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <select className="filter-select-pro" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="ALL">Categoría: Todas</option>
            {filters.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select className="filter-select-pro" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="ALL">Estado: Todos</option>
            {filters.statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div className="toolbar-right">
          <button className="btn-icon-pro"><FiDownload /> Exportar</button>
          <button className="btn-add-pro" onClick={() => setShowAddModal(true)}>
            <FiPlus /> Nuevo Elemento
          </button>
        </div>
      </div>

      <div className="inventory-table-container">
        <table className="inventory-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>ID</th>
              <th>Código</th>
              <th>Nombre del Elemento</th>
              <th>Categoría</th>
              <th>Marca / Modelo</th>
              <th>Ubicación</th>
              <th>Stock</th>
              <th>Estado</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: '3rem' }}>Cargando...</td></tr>
            ) : items.map(item => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>
                  <div className="item-profile-cell">
                    <img src={item.image_url || 'https://via.placeholder.com/48'} alt={item.name} className="item-thumb" />
                    <div className="item-main-info">
                      <strong>{item.code}</strong>
                      <small>{item.serial_number || 'S/N'}</small>
                    </div>
                  </div>
                </td>
                <td>{item.name}</td>
                <td><span className={`cat-badge ${getCategoryClass(item.category_name)}`}>{item.category_name}</span></td>
                <td>
                  <div className="item-main-info">
                    <strong>{item.brand || 'Genérico'}</strong>
                    <small>{item.model || 'N/A'}</small>
                  </div>
                </td>
                <td>{item.location_name}</td>
                <td><strong>{item.stock}</strong></td>
                <td><span className={`status-pill-inv ${getStatusClass(item.status_name)}`}>{item.status_name}</span></td>
                <td style={{ textAlign: 'right' }}>
                  <div className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                    <button className="btn-action-inv"><FiEye /></button>
                    <button className="btn-action-inv"><FiEdit2 /></button>
                    <button className="btn-action-inv"><FiMoreVertical /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="inv-modal-overlay">
          <div className="inv-modal">
            <div className="inv-modal-header">
              <h3><FiPlus /> Registrar Nuevo Elemento</h3>
              <button className="btn-close" onClick={() => { stopCamera(); setShowAddModal(false); }}><FiX /></button>
            </div>
            <form onSubmit={handleCreate} className="inv-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Nombre del Elemento</label>
                  <input required type="text" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Código / Referencia</label>
                  <input required type="text" value={newItem.code} onChange={e => setNewItem({...newItem, code: e.target.value})} />
                </div>
                
                {/* Visualizador de Imagen / Cámara */}
                <div className="form-group full-width camera-section">
                  <label>Imagen del Material</label>
                  <div className="photo-manager">
                    {showCamera ? (
                      <div className="camera-view">
                        <video 
                          ref={videoRef} 
                          autoPlay 
                          playsInline 
                        />
                        <div className="camera-controls">
                          <button type="button" onClick={capturePhoto} className="btn-capture"><FiCamera /> Tomar Foto</button>
                          <button type="button" onClick={stopCamera} className="btn-cancel-cam">Cancelar</button>
                        </div>
                      </div>
                    ) : (
                      <div className="photo-preview-area">
                        <img src={newItem.image_url || 'https://via.placeholder.com/150'} alt="Vista previa" />
                        <div className="photo-actions">
                          <button type="button" onClick={startCamera} className="btn-action-cam"><FiCamera /> Usar Cámara</button>
                          <input 
                            type="text" 
                            placeholder="O pega URL de imagen..." 
                            value={newItem.image_url.startsWith('data:') ? 'Imagen capturada' : newItem.image_url} 
                            onChange={e => setNewItem({...newItem, image_url: e.target.value})}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <canvas ref={canvasRef} style={{ display: 'none' }} />
                </div>

                <div className="form-group">
                  <label>Categoría</label>
                  <select value={newItem.category_id} onChange={e => setNewItem({...newItem, category_id: e.target.value})}>
                    {filters.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Ubicación</label>
                  <select value={newItem.location_id} onChange={e => setNewItem({...newItem, location_id: e.target.value})}>
                    {filters.locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Marca</label>
                  <input type="text" value={newItem.brand} onChange={e => setNewItem({...newItem, brand: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Modelo</label>
                  <input type="text" value={newItem.model} onChange={e => setNewItem({...newItem, model: e.target.value})} />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => { stopCamera(); setShowAddModal(false); }}>Cancelar</button>
                <button type="submit" className="btn-submit"><FiSave /> Guardar Elemento</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
