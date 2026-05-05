import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiAlertCircle, FiPhone, FiCreditCard } from 'react-icons/fi';
import './LoginForm.css';
import { FloatingParticles } from '../../../components/ui/FloatingParticles';
const senaBg = '/assets/images/sena-library-bg.png';

interface LoginFormProps {
  mode: 'login' | 'register';
  onForgotPassword?: () => void;
  onLoginSuccess?: (user: any) => void;
  onSwitchMode?: (mode: 'login' | 'register') => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ mode, onLoginSuccess }) => {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [documentType, setDocumentType] = useState('CC');
  const [documentNumber, setDocumentNumber] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errors, setErrors] = useState({ nombre: '', email: '', phone: '', password: '', documentNumber: '' });

  const isRegister = mode === 'register';

  const validateFields = () => {
    let currentErrors = { nombre: '', email: '', phone: '', password: '', documentNumber: '' };
    let hasError = false;

    if (isRegister) {
      if (!nombre.trim()) {
        currentErrors.nombre = 'Este campo es requerido';
        hasError = true;
      }
      if (!email.trim()) {
        currentErrors.email = 'Este campo es requerido';
        hasError = true;
      }
      if (!documentNumber.trim()) {
        currentErrors.documentNumber = 'El número de documento es requerido';
        hasError = true;
      }
    } else {
      if (!nombre.trim()) {
        currentErrors.nombre = 'El número de documento es requerido';
        hasError = true;
      }
    }

    // Validación de Contraseña
    const restrictedChars = /[_.,:;'+-]/;
    if (!password) {
      currentErrors.password = 'La contraseña es requerida';
      hasError = true;
    } else if (password.length < 8) {
      currentErrors.password = 'Mínimo 8 caracteres';
      hasError = true;
    } else if (/\s/.test(password)) {
      currentErrors.password = 'No se permiten espacios';
      hasError = true;
    } else if (restrictedChars.test(password)) {
      currentErrors.password = 'Sin caracteres especiales (_-.,:;\'+)';
      hasError = true;
    }

    setErrors(currentErrors);
    return !hasError;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    setSuccessMsg('');
    
    if (!validateFields()) return;

    setLoading(true);
    try {
      const endpoint = isRegister ? '/api/v1/auth/register' : '/api/v1/auth/login';
      const payload = isRegister 
        ? { 
            name: nombre, 
            email: email, 
            password, 
            phone, 
            document_type: documentType, 
            document_number: documentNumber 
          }
        : { nombre, password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : {};

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Error en la operación');
      }

      if (isRegister) {
        setSuccessMsg('¡Registro exitoso! Ya puedes iniciar sesión.');
        // Limpiar campos
        setNombre(''); setEmail(''); setPhone(''); setPassword('');
      } else {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setSuccessMsg('Inicio de sesión exitoso. Redirigiendo...');
        if (onLoginSuccess) onLoginSuccess(data.user);
        setTimeout(() => {
          const role = data.user?.role?.name || data.user?.rol?.nombre;
          navigate(role === 'ADMIN' ? '/admin' : '/dashboard');
        }, 800);
      }
    } catch (err: any) {
      setServerError(err.message);
      // Desaparecer mensaje después de 3 segundos
      setTimeout(() => setServerError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="background-image-container">
        <img src={senaBg} alt="Biblioteca SENA" />
        <div className="bg-overlay"></div>
      </div>
      
      <FloatingParticles />
      <div className="login-form-centered">
        <div className={`clean-form ${isRegister ? 'register-mode' : ''}`}>
          <div className="sena-logo">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/8/83/Sena_Colombia_logo.svg" 
              alt="Logo SENA" 
              className="sena-logo-img"
            />
          </div>
          
          <div className="form-header">
            <h3 className="login-title">{isRegister ? 'Crear Cuenta' : 'Iniciar Sesión'}</h3>
            <p>{isRegister ? 'Completa tus datos de registro' : 'Ingresa tus credenciales de acceso'}</p>
          </div>

          {serverError && <div className="alert-error fade-in"><FiAlertCircle /> {serverError}</div>}
          {successMsg && <div className="alert-success fade-in">{successMsg}</div>}
          
          <form onSubmit={handleSubmit} noValidate>
            
            {/* Campo Identificador: Nombre en Registro, Documento en Login */}
            <div className={`input-group ${errors.nombre ? 'has-error' : ''}`}>
              <label className="input-label">
                {isRegister ? 'Nombre Completo' : 'Número de Documento'}
              </label>
              <div className="input-field-wrapper">
                <FiUser className="input-icon" />
                <input
                  type="text"
                  className="clean-input"
                  placeholder={isRegister ? 'Ej. Juan Pérez' : 'Ingresa tu documento'}
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  disabled={loading}
                />
              </div>
              {errors.nombre && <span className="error-message"><FiAlertCircle/> {errors.nombre}</span>}
            </div>

            {/* Campos de Documento solo en Registro */}
            {isRegister && (
              <div className="form-row-register">
                <div className="input-group">
                  <label className="input-label">Tipo</label>
                  <select 
                    className="clean-select"
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                  >
                    <option value="CC">CC</option>
                    <option value="TI">TI</option>
                    <option value="CE">CE</option>
                    <option value="PEP">PEP</option>
                  </select>
                </div>
                <div className={`input-group ${errors.documentNumber ? 'has-error' : ''}`} style={{ flex: 2 }}>
                  <label className="input-label">Número de Documento</label>
                  <div className="input-field-wrapper">
                    <FiCreditCard className="input-icon" />
                    <input
                      type="text"
                      className="clean-input"
                      placeholder="Ej. 1098..."
                      value={documentNumber}
                      onChange={(e) => setDocumentNumber(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Correo solo en Registro */}
            {isRegister && (
              <div className={`input-group ${errors.email ? 'has-error' : ''}`}>
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
                {errors.email && <span className="error-message"><FiAlertCircle/> {errors.email}</span>}
              </div>
            )}

            {isRegister && (
              <div className={`input-group ${errors.phone ? 'has-error' : ''}`}>
                <label className="input-label">Número de Teléfono</label>
                <div className="input-field-wrapper">
                  <FiPhone className="input-icon" />
                  <input
                    type="tel"
                    className="clean-input"
                    placeholder="Ej. 310 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={loading}
                  />
                </div>
                {errors.phone && <span className="error-message"><FiAlertCircle/> {errors.phone}</span>}
              </div>
            )}

            <div className={`input-group ${errors.password ? 'has-error' : ''}`}>
              <label className="input-label">Contraseña</label>
              <div className="input-field-wrapper">
                <FiLock className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="clean-input password-input"
                  placeholder="Tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button 
                  type="button" 
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.password && <span className="error-message"><FiAlertCircle/> {errors.password}</span>}
            </div>

            {!isRegister && (
              <div style={{ textAlign: 'right' }}>
                <a 
                  href="#" 
                  className="forgot-password"
                  onClick={(e) => { e.preventDefault(); navigate('/forgot-password'); }}
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
            )}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Procesando...' : (isRegister ? 'Registrarse ahora' : 'Ingresar a la Plataforma')}
            </button>
          </form>
          
          <div className="auth-footer">
            {isRegister ? (
              <p>
                ¿Ya tienes cuenta?{' '}
                <button 
                  type="button" 
                  className="switch-mode-btn"
                  onClick={() => navigate('/login')}
                  disabled={loading}
                >
                  Iniciar sesión
                </button>
              </p>
            ) : (
              <p>
                ¿No tienes cuenta?{' '}
                <button
                  type="button"
                  className="switch-mode-btn"
                  onClick={() => navigate('/register')}
                  disabled={loading}
                >
                  Regístrate aquí
                </button>
              </p>
            )}
          </div>

          <button className="back-btn" onClick={() => history.back()} disabled={loading}>
            Volver al inicio
          </button>
          <div style={{ height: '20px' }}></div>
        </div>
      </div>
    </div>
  );
};
