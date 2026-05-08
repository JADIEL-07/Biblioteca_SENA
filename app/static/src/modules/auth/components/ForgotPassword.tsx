import { useState, useEffect } from 'react';
import { FiMail, FiArrowLeft, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import './LoginForm.css';
import { FloatingParticles } from '../../../components/ui/FloatingParticles';

export const ForgotPassword: React.FC = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return document.body.classList.contains('theme-light') ? 'light' : 'dark';
  });

  useEffect(() => {
    const isLightNow = document.body.classList.contains('theme-light');
    setTheme(isLightNow ? 'light' : 'dark');

    const observer = new MutationObserver(() => {
      const isLight = document.body.classList.contains('theme-light');
      setTheme(isLight ? 'light' : 'dark');
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  const currentBg = theme === 'light'
    ? '/assets/images/Tema blanco.png'
    : '/assets/images/Tema oscuro.png';

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email.trim()) {
      setError('Por favor ingresa tu correo institucional');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: email })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error al procesar solicitud');

      setMessage(data.message);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="background-image-container">
        <img src={currentBg} alt="Biblioteca SENA" />
        <div className="bg-overlay"></div>
      </div>
      <FloatingParticles />
      
      <div className="login-form-centered">
        <div className="clean-form">
          <div className="sena-logo">
            <img src="https://upload.wikimedia.org/wikipedia/commons/8/83/Sena_Colombia_logo.svg" alt="Logo SENA" className="sena-logo-img" />
          </div>
          
          <div className="form-header">
            <h3 className="login-title">Recuperar Contraseña</h3>
            <p>Ingresa tu correo para recibir un enlace de restauración</p>
          </div>

          {error && <div className="alert-error fade-in"><FiAlertCircle /> {error}</div>}
          {message && <div className="alert-success fade-in"><FiCheckCircle /> {message}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className={`input-group ${error ? 'has-error' : ''}`}>
              <label className="input-label">Correo Institucional</label>
              <div className="input-field-wrapper">
                <FiMail className="input-icon" />
                <input
                  type="email"
                  className="clean-input"
                  placeholder="usuario@mi.sena.edu.co"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar enlace'}
            </button>
          </form>

          <button className="back-btn" onClick={() => history.back()} disabled={loading}>
            <FiArrowLeft /> Volver al inicio de sesión
          </button>
        </div>
      </div>
    </div>
  );
};
