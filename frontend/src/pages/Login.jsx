import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../CSS/Login.css'; // 🟢 Importamos el CSS

const API_BASE = 'http://localhost:3000/api/auth';

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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          correo: form.correo,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.mensaje || 'Error al iniciar sesión.');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.usuario));

      const rol = String(data.usuario.id_rol);

      if (rol === '3') {
        navigate('/dashboard-empresa');
      } else if (rol === '4') {
        navigate('/dashboard-profesores');
      } else if (rol === '1') {
        navigate('/dashboard-vinculacion');
      } else {
        navigate('/dashboard-estudiante');
      }
    } catch (err) {
      setError('Error de conexión con el servidor: ' + err.message);
    } finally {
      setLoading(false);
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
          <h2 className="login-form-title">Bienvenido de nuevo</h2>
          <p className="login-form-subtitle">Ingresa tus datos para continuar</p>

          {error && (
            <div className="login-error-msg">
              {error}
            </div>
          )}

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

            <div className="login-field-group" style={{ marginBottom: '12px' }}>
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

            <div className="login-forgot-row">
              <button type="button" className="login-forgot-link">
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <button
              type="submit"
              className="login-submit-btn"
              disabled={loading}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </form>

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