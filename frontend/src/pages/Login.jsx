import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { startAuthentication } from '@simplewebauthn/browser';
import '../CSS/Login.css';
import { AUTH_BASE } from '../config/api';

const API_BASE = AUTH_BASE;

const features = [
  {
    title: 'Sube tus proyectos académicos',
    desc: 'Muestra tu portafolio con evidencias reales',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
  {
    title: 'Conecta con empresas reales',
    desc: 'Empresas buscan perfiles como el tuyo',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    title: 'Genera tu CV en segundos',
    desc: 'Descarga tu CV profesional en PDF',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
];

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ correo: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingBio, setLoadingBio] = useState(false);

  // ESTADOS PARA EL CAPTCHA MATEMÁTICO
  const [showCaptcha, setShowCaptcha] = useState(false); 
  const [captcha, setCaptcha] = useState({ num1: 0, num2: 0 });
  const [captchaInput, setCaptchaInput] = useState('');

  // Generar números aleatorios al cargar el componente
  const generarCaptcha = () => {
    setCaptcha({
      num1: Math.floor(Math.random() * 10) + 1, // Número entre 1 y 10
      num2: Math.floor(Math.random() * 10) + 1
    });
    setCaptchaInput('');
  };

  useEffect(() => {
    generarCaptcha();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLoginSuccess = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.usuario));

    const rol = String(data.usuario.id_rol);

    if (rol === '3') {
      navigate('/dashboard-empresa');
    } else if (rol === '4') {
      navigate('/dashboard-profesores');
    } else if (rol === '1') {
      navigate('/dashboard-vinculacion');
    } else if (rol === '5') {
      navigate('/');
    } else {
      navigate('/dashboard-estudiante');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 1. Si el captcha aún no es visible, lo mostramos y detenemos el login
    if (!showCaptcha) {
      setShowCaptcha(true);
      setError('Antes debes de completar el captcha por seguridad.');
      return;
    }

    // 2. Si ya es visible, validamos que la respuesta sea correcta
    const respuestaCorrecta = captcha.num1 + captcha.num2;
    if (parseInt(captchaInput) !== respuestaCorrecta) {
      setError('El CAPTCHA es incorrecto. Por favor, resuelve la suma correctamente.');
      generarCaptcha(); // Cambia los números si se equivoca
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          correo: form.correo,
          password: form.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.mensaje || 'Error al iniciar sesión.');
        generarCaptcha(); // Cambiamos el captcha por seguridad si falla el login
        return;
      }

      handleLoginSuccess(data);
    } catch (err) {
      setError('Error de conexión con el servidor: ' + err.message);
      generarCaptcha();
    } finally {
      setLoading(false);
    }
  };

  // LOGIN 100% SIN CORREO (Usernameless) - Omite el Captcha por completo
  const handleFaceIDLogin = async () => {
    setError('');
    setLoadingBio(true);
    try {
      const resOptions = await fetch(`${API_BASE}/biometric-login-options`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}) 
      });

      const options = await resOptions.json();
      if (!resOptions.ok) throw new Error(options.mensaje || 'Error al conectar con el servidor.');

      const asseResp = await startAuthentication(options);

      const resVerify = await fetch(`${API_BASE}/biometric-login-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authResponse: asseResp,
          challenge: options.challenge
        })
      });

      const result = await resVerify.json();
      if (!resVerify.ok) throw new Error(result.mensaje || 'Error en la verificación biométrica.');

      handleLoginSuccess(result);
    } catch (err) {
      console.error(err);
      setError(err.message === 'The operation either timed out or was not allowed. See: https://www.w3.org/TR/webauthn-2/#sctn-privacy-considerations-client.' 
        ? 'Operación cancelada o dispositivo no reconocido.' 
        : err.message);
    } finally {
      setLoadingBio(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-left-panel">
        <div className="login-circle1" />
        <div className="login-circle2" />
        <div className="login-left-content">
          <div className="login-logo-row">
            <div className="login-logo-icon">
              <svg width="20" height="20" viewBox="0 0 36 32" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="18,2 34,10 18,18 2,10" />
                <polyline points="2,16 18,24 34,16" />
                <polyline points="2,22 18,30 34,22" />
              </svg>
            </div>
            <span className="login-logo-text">SkillMatch</span>
          </div>

          <h1 className="login-heading">Conecta tu talento con oportunidades reales</h1>
          <p className="login-subheading">
            La plataforma que vincula estudiantes de la UTEQ con empresas que buscan exactamente lo que tú sabes hacer.
          </p>

          <div className="login-feature-list">
            {features.map((f, i) => (
              <div key={i} className="login-feature-item">
                <div className="login-feature-icon">{f.icon}</div>
                <div>
                  <p className="login-feature-title">{f.title}</p>
                  <p className="login-feature-desc">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="login-right-panel">
        <div className="login-form-container">
          <button 
            type="button" 
            className="login-back-btn" 
            onClick={() => navigate('/')}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'none',
                border: 'none',
                color: '#71706F',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                marginBottom: '24px',
                padding: '0',
                transition: 'color 0.2s'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Regresar al inicio
          </button>

          <h2 className="login-form-title">Bienvenido de nuevo</h2>
          <p className="login-form-subtitle">Ingresa tus datos para continuar</p>

          {error && (
            <div className="login-error-msg">
              {error}
            </div>
          )}

 {/* FORMULARIO MANUAL (CON CAPTCHA) */}
          <form onSubmit={handleSubmit}>
            <div className="login-field-group">
              <label className="login-label">Correo electrónico</label>
              <div className="login-input-wrapper">
                <svg className="login-input-icon" viewBox="0 0 24 24" fill="none" stroke="#71706F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <input
                  type="email"
                  placeholder="correo@uteq.edu.mx"
                  name="correo"
                  value={form.correo}
                  onChange={handleChange}
                  className="login-input"
                  required
                />
              </div>
            </div>

            <div className="login-field-group" style={{ marginBottom: showCaptcha ? '16px' : '24px' }}>
              <label className="login-label">Contraseña</label>
              <div className="login-input-wrapper">
                <svg className="login-input-icon" viewBox="0 0 24 24" fill="none" stroke="#71706F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  type="password"
                  placeholder="••••••••"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="login-input"
                  required
                  minLength={8}
                />
              </div>
            </div>

            {/* EL CAPTCHA SE MUESTRA SOLO SI showCaptcha ES TRUE */}
            {showCaptcha && (
              <div className="login-field-group" style={{ marginBottom: '24px', animation: 'fadeIn 0.3s ease-in-out' }}>
                <label className="login-label">Verificación de seguridad (CAPTCHA)</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div style={{ 
                    background: '#f1f5f9', 
                    padding: '10px 15px', 
                    borderRadius: '8px', 
                    fontWeight: '800', 
                    color: '#232E56', 
                    letterSpacing: '2px', 
                    border: '1px dashed #cbd5e1',
                    userSelect: 'none'
                  }}>
                    {captcha.num1} + {captcha.num2} = ?
                  </div>
                  <input
                    type="number"
                    placeholder="Respuesta"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    className="login-input"
                    style={{ flex: 1, paddingLeft: '15px' }}
                    required
                  />
                  <button 
                    type="button" 
                    onClick={generarCaptcha} 
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', padding: '0 5px' }} 
                    title="Cambiar suma"
                  >
                    🔄
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="login-submit-btn"
              disabled={loading}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </form>

 {/* BIOMETRÍA SEPARADA DEL FORMULARIO */}
          <div style={{ margin: '16px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ flex: 1, height: '1px', background: '#dde2ee' }}></div>
            <span style={{ fontSize: '12px', color: '#8a8f9e', fontWeight: '600' }}>O TAMBIÉN</span>
            <div style={{ flex: 1, height: '1px', background: '#dde2ee' }}></div>
          </div>

          <button
            type="button"
            className="login-submit-btn"
            onClick={handleFaceIDLogin}
            disabled={loadingBio}
            style={{
              background: 'white',
              color: '#244E7C',
              border: '1.5px solid #244E7C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px'
            }}
          >
            {loadingBio ? (
              'Validando biometría...'
            ) : (
              <>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8 3H5a2 2 0 0 0-2 2v3" />
                      <path d="M16 3h3a2 2 0 0 1 2 2v3" />
                      <path d="M3 16v3a2 2 0 0 0 2 2h3" />
                      <path d="M21 16v3a2 2 0 0 1-2 2h-3" />
                      <path d="M8 8h.01" />
                      <path d="M16 8h.01" />
                      <path d="M12 12v3" />
                      <path d="M8 16a4 4 0 0 0 8 0" />
                  </svg>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12" />
                      <path d="M5 15C5 15 6 13 12 13C18 13 19 15 19 15" />
                      <path d="M8 18C8 18 9 16 12 16C15 16 16 18 16 18" />
                      <path d="M12 22V19" />
                      <path d="M9 9C9 9 10 7 12 7C14 7 15 9 15 9" />
                      <path d="M12 11V10" />
                  </svg>
                </div>
                Entrar con datos biométricos
              </>
            )}
          </button>

          <p className="login-register-row">
            ¿No tienes cuenta?{' '}
            <button
              className="login-register-link"
              onClick={() => navigate('/registro')}
            >
              Regístrate aquí
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}