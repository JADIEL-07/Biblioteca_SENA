import React, { useState, useEffect, useRef } from 'react';
import { Accessibility, X, Type, Contrast, Moon, Baseline, RotateCcw } from 'lucide-react';
import './AccessibilityWidget.css';

export const AccessibilityWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [textSize, setTextSize] = useState(100);
  const [highContrast, setHighContrast] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [textSpacing, setTextSpacing] = useState(false);
  
  // Estados para el efecto de hover en los botones de tamaño
  const [hoveringPlus, setHoveringPlus] = useState(false);
  const [hoveringMinus, setHoveringMinus] = useState(false);
  
  const widgetRef = useRef<HTMLDivElement>(null);

  // Cerrar el panel al hacer clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Efectos de accesibilidad al cambiar los estados
  useEffect(() => {
    // Tamaño de texto
    document.documentElement.style.fontSize = `${textSize}%`;
  }, [textSize]);

  useEffect(() => {
    // Alto contraste
    if (highContrast) {
      document.body.classList.add('accessibility-high-contrast');
    } else {
      document.body.classList.remove('accessibility-high-contrast');
    }
  }, [highContrast]);

  useEffect(() => {
    // Espaciado de texto
    if (textSpacing) {
      document.body.classList.add('accessibility-text-spacing');
    } else {
      document.body.classList.remove('accessibility-text-spacing');
    }
  }, [textSpacing]);

  useEffect(() => {
    // Modo oscuro global
    if (darkMode) {
      document.body.classList.remove('theme-light');
      localStorage.setItem('dashboard-theme', 'dark');
    } else {
      document.body.classList.add('theme-light');
      localStorage.setItem('dashboard-theme', 'light');
    }
    window.dispatchEvent(new Event('storage'));
  }, [darkMode]);

  const increaseText = () => setTextSize(prev => Math.min(prev + 10, 150));
  const decreaseText = () => setTextSize(prev => Math.max(prev - 10, 80));

  const resetAll = () => {
    setTextSize(100);
    setHighContrast(false);
    setDarkMode(true);
    setTextSpacing(false);
  };

  return (
    <div className="accessibility-widget-container" ref={widgetRef}>
      {isOpen && (
        <div className="accessibility-panel fade-in-up">
          <div className="acc-header">
            <div className="acc-icon-box">
              <Accessibility size={24} strokeWidth={2.5} />
            </div>
            <div className="acc-title-group">
              <h3>Accesibilidad</h3>
              <p>Personaliza tu experiencia</p>
            </div>
            <button className="acc-close" onClick={() => setIsOpen(false)}>
              <X size={18} />
            </button>
          </div>

          <div className="acc-grid">
            {/* Tamaño de texto Dinámico: Rediseño según boceto */}
            <div className="acc-card size-card-custom">
              <div className="acc-card-icon-custom"><Type size={28} /></div>
              <span className="acc-card-label-custom">Letra</span>
              
              <div className="acc-stepper-base">
                <button 
                  onClick={decreaseText} 
                  className="stepper-btn-base"
                  onMouseEnter={() => setHoveringMinus(true)}
                  onMouseLeave={() => setHoveringMinus(false)}
                >
                  {hoveringMinus ? `${textSize}%` : "−"}
                </button>
                
                <button 
                  onClick={increaseText} 
                  className="stepper-btn-base"
                  onMouseEnter={() => setHoveringPlus(true)}
                  onMouseLeave={() => setHoveringPlus(false)}
                >
                  {hoveringPlus ? `${textSize}%` : "+"}
                </button>
              </div>
            </div>

            {/* Alto Contraste */}
            <button 
              className={`acc-card btn-card ${highContrast ? 'active' : ''}`}
              onClick={() => setHighContrast(!highContrast)}
            >
              <div className="acc-card-icon"><Contrast size={28} /></div>
              <span className="acc-card-label">Alto contraste</span>
            </button>

            {/* Modo oscuro */}
            <button 
              className={`acc-card btn-card ${darkMode ? 'active' : ''}`}
              onClick={() => setDarkMode(!darkMode)}
            >
              <div className="acc-card-icon"><Moon size={28} /></div>
              <span className="acc-card-label">Modo oscuro</span>
            </button>

            {/* Espaciado texto */}
            <button 
              className={`acc-card btn-card ${textSpacing ? 'active' : ''}`}
              onClick={() => setTextSpacing(!textSpacing)}
            >
              <div className="acc-card-icon"><Baseline size={28} /></div>
              <span className="acc-card-label">Espaciado<br/>texto</span>
            </button>
          </div>

          {/* Footer Reset */}
          <div className="acc-footer">
            <button className="acc-reset-btn" onClick={resetAll}>
              <RotateCcw size={16} /> 
              Restablecer todo
            </button>
          </div>
        </div>
      )}

      <button 
        className={`accessibility-btn ${isOpen ? 'pulse-off' : ''}`} 
        aria-label="Opciones de Accesibilidad"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Accessibility size={32} strokeWidth={2.5} />
      </button>
    </div>
  );
};
