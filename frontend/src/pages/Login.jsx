import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:3000/api/auth';

const styles = {
  wrapper: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: "'Montserrat', sans-serif",
  },
  leftPanel: {
    flex: 1,
    backgroundColor: '#232E56',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '48px 40px',
    position: 'relative',
    overflow: 'hidden',
  },
  circle1: {
    position: 'absolute',
    top: '-60px',
    right: '-60px',
    width: '220px',
    height: '220px',
    borderRadius: '50%',
    backgroundColor: '#244E7C',
    opacity: 0.4,
  },
  circle2: {
    position: 'absolute',
    bottom: '-80px',
    left: '-40px',
    width: '280px',
    height: '280px',
    borderRadius: '50%',
    backgroundColor: '#244E7C',
    opacity: 0.25,
  },
  leftContent: {
    position: 'relative',
    zIndex: 1,
    maxWidth: '440px',
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '40px',
  },
  logoIcon: {
    width: '36px',
    height: '36px',
    backgroundColor: '#244E7C',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontWeight: 700,
    fontSize: '20px',
    color: '#FFFFFF',
    letterSpacing: '0.5px',
  },
  heading: {
    fontWeight: 700,
    fontSize: '32px',
    color: '#FFFFFF',
    margin: '0 0 16px',
    lineHeight: 1.2,
  },
  subheading: {
    fontWeight: 400,
    fontSize: '16px',
    color: 'rgba(255,255,255,0.7)',
    margin: '0 0 48px',
    lineHeight: 1.6,
  },
  featureList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '14px',
  },
  featureIcon: {
    width: '32px',
    height: '32px',
    minWidth: '32px',
    backgroundColor: 'rgba(36,78,124,0.5)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTitle: {
    fontWeight: 600,
    fontSize: '14px',
    color: '#FFFFFF',
    margin: '0 0 2px',
  },
  featureDesc: {
    fontWeight: 400,
    fontSize: '12px',
    color: 'rgba(255,255,255,0.6)',
    margin: 0,
  },
  rightPanel: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '48px 40px',
  },
  formContainer: {
    maxWidth: '360px',
    margin: '0 auto',
    width: '100%',
  },
  formTitle: {
    fontWeight: 700,
    fontSize: '24px',
    color: '#111827',
    margin: '0 0 8px',
  },
  formSubtitle: {
    fontWeight: 400,
    fontSize: '14px',
    color: '#71706F',
    margin: '0 0 32px',
  },
  fieldGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontWeight: 600,
    fontSize: '13px',
    color: '#111827',
    marginBottom: '6px',
  },
  inputWrapper: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '16px',
    height: '16px',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '10px 12px 10px 38px',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    fontFamily: "'Montserrat', sans-serif",
    fontSize: '14px',
    color: '#111827',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  inputFocus: {
    borderColor: '#244E7C',
    boxShadow: '0 0 0 3px rgba(36,78,124,0.15)',
  },
  forgotRow: {
    textAlign: 'right',
    marginBottom: '32px',
  },
  forgotLink: {
    fontFamily: "'Montserrat', sans-serif",
    fontSize: '13px',
    color: '#244E7C',
    fontWeight: 600,
    textDecoration: 'none',
    cursor: 'pointer',
    border: 'none',
    background: 'none',
    padding: 0,
  },
  submitBtn: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#244E7C',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: 700,
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'background-color 0.2s, transform 0.1s',
  },
  submitBtnHover: {
    backgroundColor: '#1a3d63',
  },
  registerRow: {
    textAlign: 'center',
    fontFamily: "'Montserrat', sans-serif",
    fontSize: '13px',
    color: '#71706F',
    marginTop: '24px',
  },
  registerLink: {
    color: '#244E7C',
    fontWeight: 600,
    textDecoration: 'none',
    cursor: 'pointer',
    border: 'none',
    background: 'none',
    padding: 0,
  },
  errorMsg: {
    fontSize: '12px',
    color: '#DC2626',
    marginTop: '4px',
    fontWeight: 400,
  },
};

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
  const [emailFocus, setEmailFocus] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);
  const [btnHover, setBtnHover] = useState(false);
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
    <div style={styles.wrapper}>
      <div style={styles.leftPanel}>
        <div style={styles.circle1} />
        <div style={styles.circle2} />
        <div style={styles.leftContent}>
          <div style={styles.logoRow}>
            <div style={styles.logoIcon}>
              <svg width="20" height="20" viewBox="0 0 36 32" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="18,2 34,10 18,18 2,10" />
                <polyline points="2,16 18,24 34,16" />
                <polyline points="2,22 18,30 34,22" />
              </svg>
            </div>
            <span style={styles.logoText}>SkillMatch</span>
          </div>

          <h1 style={styles.heading}>Conecta tu talento con oportunidades reales</h1>
          <p style={styles.subheading}>
            La plataforma que vincula estudiantes de la UTEQ con empresas que buscan exactamente lo que tú sabes hacer.
          </p>

          <div style={styles.featureList}>
            {features.map((f, i) => (
              <div key={i} style={styles.featureItem}>
                <div style={styles.featureIcon}>{f.icon}</div>
                <div>
                  <p style={styles.featureTitle}>{f.title}</p>
                  <p style={styles.featureDesc}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={styles.rightPanel}>
        <div style={styles.formContainer}>
          <h2 style={styles.formTitle}>Bienvenido de nuevo</h2>
          <p style={styles.formSubtitle}>Ingresa tus datos para continuar</p>

          {error && (
            <p style={{ ...styles.errorMsg, marginBottom: '16px', textAlign: 'center' }}>
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Correo electrónico</label>
              <div style={styles.inputWrapper}>
                <svg style={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="#71706F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <input
                  type="email"
                  placeholder="correo@uteq.edu.mx"
                  name="correo"
                  value={form.correo}
                  onChange={handleChange}
                  onFocus={() => setEmailFocus(true)}
                  onBlur={() => setEmailFocus(false)}
                  style={{ ...styles.input, ...(emailFocus ? styles.inputFocus : {}) }}
                  required
                />
              </div>
            </div>

            <div style={{ ...styles.fieldGroup, marginBottom: '12px' }}>
              <label style={styles.label}>Contraseña</label>
              <div style={styles.inputWrapper}>
                <svg style={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="#71706F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  type="password"
                  placeholder="••••••••"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  onFocus={() => setPasswordFocus(true)}
                  onBlur={() => setPasswordFocus(false)}
                  style={{ ...styles.input, ...(passwordFocus ? styles.inputFocus : {}) }}
                  required
                  minLength={8}
                />
              </div>
            </div>

            <div style={styles.forgotRow}>
              <button type="button" style={styles.forgotLink} onClick={() => {}}>
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              onMouseEnter={() => setBtnHover(true)}
              onMouseLeave={() => setBtnHover(false)}
              style={{
                ...styles.submitBtn,
                ...(btnHover && !loading ? styles.submitBtnHover : {}),
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </form>

          <p style={styles.registerRow}>
            ¿No tienes cuenta?{' '}
            <button
              style={styles.registerLink}
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