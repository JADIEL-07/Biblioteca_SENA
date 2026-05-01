import React, { useMemo } from 'react';
import './FloatingParticles.css';

export const FloatingParticles: React.FC = () => {
  // Generar posiciones y tamaños aleatorios para que se vean naturales, solo al montar
  const particles = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100, // posición horizontal inicial (0% a 100%)
      size: Math.random() * 6 + 3, // tamaño entre 3px y 9px
      duration: Math.random() * 20 + 10, // duración de subida (10s a 30s)
      delay: Math.random() * 15, // retraso de inicio para no salir todas a la vez
      drift: (Math.random() - 0.5) * 80 // desplazamiento horizontal lateral (-40px a 40px)
    }));
  }, []);

  return (
    <div className="particles-container">
      {particles.map(p => (
        <div 
          key={p.id} 
          className="particle" 
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `-${p.delay}s`, /* Delay negativo para que algunas ya estén en pantalla */
            '--drift': `${p.drift}px`
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};
