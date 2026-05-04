import React, { useState, useEffect } from 'react';
import { 
  FiSearch, FiFilter, FiPackage, FiMapPin, FiInfo, 
  FiArrowLeft, FiGrid, FiList, FiBook, FiCpu, FiTool,
  FiMaximize, FiBookmark, FiChevronDown, FiCalendar,
  FiChevronLeft, FiChevronRight, FiX
} from 'react-icons/fi';
import { CustomSelect } from '../admin/CustomSelect';
import './AprendizCatalog.css';

interface Item {
  id: number;
  name: string;
  code: string;
  category_name: string;
  status_name: string;
  location_name: string;
  brand: string | null;
  model: string | null;
  image_url: string | null;
  description: string;
  stock: number;
}

interface FilterData {
  categories: { id: number, name: string }[];
  statuses: { id: number, name: string }[];
}

export const AprendizCatalog: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filters, setFilters] = useState<FilterData>({ categories: [], statuses: [] });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        search: searchTerm,
        category_id: filterCategory === 'ALL' ? '' : filterCategory
      });

      const [iRes, fRes] = await Promise.all([
        fetch(`/api/v1/items/?${params.toString()}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/v1/items/filters', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (iRes.ok) {
        const data = await iRes.json();
        setItems(Array.isArray(data) ? data : []);
      }
      if (fRes.ok) {
        const fData = await fRes.json();
        setFilters(fData);
      }
    } catch (error) {
      console.error('Error fetching catalog:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm, filterCategory]);

  const getCategoryIcon = (cat: string) => {
    const c = cat.toLowerCase();
    if (c.includes('libro')) return <FiBook />;
    if (c.includes('equipo') || c.includes('computo')) return <FiCpu />;
    if (c.includes('herramienta')) return <FiTool />;
    return <FiPackage />;
  };

  const getStatusClass = (status: string) => {
    const s = status.toUpperCase();
    if (s === 'EXCELENTE' || s === 'BUENO' || s === 'DISPONIBLE') return 'status-available';
    if (s === 'REGULAR' || s === 'EN MANTENIMIENTO') return 'status-warning';
    if (s === 'MALO' || s === 'DAÑADO' || s === 'PRESTADO') return 'status-unavailable';
    return '';
  };

  return (
    <div className="aprendiz-catalog-container fade-in">
      {/* 1. Header Section */}
      <div className="catalog-header-pro">
        <div className="header-info">
          <h1>Explorar inventario</h1>
          <p>Encuentra libros, herramientas y equipos disponibles para préstamo.</p>
        </div>
        
        <div className="header-actions">
          <div className="search-wrapper-pro">
            <FiSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Buscar por nombre, marca o código..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn-scan-pro">
            <FiMaximize /> Escanear código
          </button>
        </div>
      </div>

      {/* 2. Filters Bar */}
      <div className="filters-bar-pro">
        <button className="btn-filter-main">
          <FiFilter /> Filtros
        </button>
        
        <div className="filter-selects">
          <CustomSelect 
            label="Estado"
            options={[{ id: 'ALL', name: 'Todas' }, ...filters.statuses]}
            value={filterCategory} // Reutilizando estados si es necesario
            onChange={() => {}}
          />
          <CustomSelect 
            label="Categoría"
            options={[{ id: 'ALL', name: 'Todas' }, ...filters.categories]}
            value={filterCategory}
            onChange={setFilterCategory}
          />
          <CustomSelect 
            label="Ubicación"
            options={[{ id: 'ALL', name: 'Todas' }]}
            value={'ALL'}
            onChange={() => {}}
          />
          <CustomSelect 
            label="Tipo de elemento"
            options={[{ id: 'ALL', name: 'Todos' }]}
            value={'ALL'}
            onChange={() => {}}
          />
        </div>

      </div>

      {/* 3. Results Info */}
      <div className="results-info-bar">
        <span>Mostrando {items.length} resultados</span>
        <div className="sort-wrapper">
          <span>Ordenar por: <strong>Más recientes</strong></span>
          <FiChevronDown />
        </div>
      </div>

      {/* 4. Catalog Content */}
      {loading ? (
        <div className="catalog-loading">
          <div className="spinner"></div>
          <p>Cargando catálogo...</p>
        </div>
      ) : (
        <div className={`catalog-view-pro ${viewMode}`}>
          {items.map(item => (
            <div key={item.id} className="item-card-pro">
              <div className="card-image-area">
                <span className={`status-badge-pro ${getStatusClass(item.status_name)}`}>
                  {item.status_name}
                </span>
                <button className="btn-bookmark">
                  <FiBookmark />
                </button>
                <div className="image-holder">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} />
                  ) : (
                    <div className="placeholder-icon">{getCategoryIcon(item.category_name)}</div>
                  )}
                </div>
              </div>
              
              <div className="card-body-pro">
                <h3>{item.name}</h3>
                <div className="item-location-label">
                  <FiMapPin /> {item.location_name}
                </div>
                
                <div className="card-actions-row">
                  <button 
                    className="btn-reserve-pro"
                    disabled={item.stock === 0 || getStatusClass(item.status_name) === 'status-unavailable'}
                  >
                    <FiCalendar /> Reservar
                  </button>
                  <button className="btn-info-circle" onClick={() => setSelectedItem(item)}>
                    <FiInfo />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="catalog-modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="catalog-modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-close-btn" onClick={() => setSelectedItem(null)}>
              <FiX />
            </div>
            
            <div className="modal-grid">
              <div className="modal-left">
                <div className="modal-image-container">
                  {selectedItem.image_url ? (
                    <img src={selectedItem.image_url} alt={selectedItem.name} />
                  ) : (
                    <div className="modal-placeholder">
                      {getCategoryIcon(selectedItem.category_name)}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="modal-right">
                <div className="modal-header-info">
                  <span className="modal-badge">{selectedItem.category_name}</span>
                  <h2>{selectedItem.name}</h2>
                  <span className={`modal-status ${getStatusClass(selectedItem.status_name)}`}>
                    {selectedItem.status_name}
                  </span>
                </div>

                <div className="modal-description">
                  <h4>Descripción</h4>
                  <p>{selectedItem.description || 'Sin descripción disponible.'}</p>
                </div>

                <div className="modal-specs">
                  <div className="spec-item">
                    <label>Código</label>
                    <span>{selectedItem.code}</span>
                  </div>
                  <div className="spec-item">
                    <label>Marca / Modelo</label>
                    <span>{selectedItem.brand || 'N/A'} {selectedItem.model ? `/ ${selectedItem.model}` : ''}</span>
                  </div>
                  <div className="spec-item">
                    <label>Ubicación</label>
                    <span>{selectedItem.location_name}</span>
                  </div>
                  <div className="spec-item">
                    <label>Disponibilidad</label>
                    <span>{selectedItem.stock > 0 ? `${selectedItem.stock} unidades` : 'No disponible'}</span>
                  </div>
                </div>

                <div className="modal-actions">
                  <button 
                    className="btn-reserve" 
                    disabled={selectedItem.stock === 0 || getStatusClass(selectedItem.status_name) === 'status-unavailable'}
                  >
                    Solicitar Reserva
                  </button>
                  <button className="btn-secondary" onClick={() => setSelectedItem(null)}>
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
