import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { encryptCredentials } from '../utils/crypto';

const API_BASE = 'http://localhost/SkillMatchWeb/backend';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');

  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

  :root {
    --primary: #244E7C;
    --primary-dark: #232E56;
    --bg: #f4f6fa;
    --border: #dde2ee;
    --text: #1a2340;
    --muted: #71706F;
    --font: 'Montserrat', sans-serif;
  }

  body { font-family: var(--font); }

  .login-wrap {
    min-height: 100dvh; display: flex;
    align-items: center; justify-content: center;
    background: var(--bg); font-family: var(--font);
  }

  .login-card {
    background: #fff; border-radius: 16px;
    padding: 44px 40px; width: 420px;
    box-shadow: 0 4px 32px rgba(35,46,86,0.10);
  }

  .login-brand { display: flex; align-items: center; gap: 10px; margin-bottom: 28px; }
  .login-brand-icon {
    width: 36px; height: 36px; border-radius: 9px;
    background: var(--primary-dark);
    display: flex; align-items: center; justify-content: center;
  }
  .login-brand-name { font-size: 18px; font-weight: 800; color: var(--text); }
  .login-brand-name span { color: var(--primary); }

  .login-title    { font-size: 26px; font-weight: 800; color: var(--text); letter-spacing: -0.5px; margin-bottom: 4px; }
  .login-subtitle { font-size: 13.5px; color: var(--muted); margin-bottom: 24px; }

  .login-alert {
    padding: 12px 14px; border-radius: 9px; font-size: 13px;
    font-weight: 600; margin-bottom: 16px;
    background: #fff0f0; border: 1.5px solid #f5c6cb; color: #c0392b;
  }

  .login-form { display: flex; flex-direction: column; gap: 6px; }

  .field-label { font-size: 12.5px; font-weight: 700; color: var(--text); margin-bottom: 5px; display: block; }

  .field-wrap { position: relative; display: flex; align-items: center; margin-bottom: 14px; }
  .field-icon { position: absolute; left: 12px; font-size: 13px; color: #b0b8cc; pointer-events: none; }

  .field-input {
    width: 100%; padding: 12px 12px 12px 36px;
    border: 1.5px solid var(--border); border-radius: 9px;
    font-size: 13px; color: var(--text); font-family: var(--font);
    background: var(--bg); outline: none;
    transition: border-color 0.18s, box-shadow 0.18s;
  }
  .field-input:focus {
    border-color: var(--primary); box-shadow: 0 0 0 3px rgba(36,78,124,0.1); background: white;
  }
  .field-input.no-icon { padding-left: 12px; }

  .field-toggle {
    position: absolute; right: 12px; background: none; border: none;
    cursor: pointer; font-size: 14px; color: var(--muted); padding: 0;
  }

  .btn-login {
    width: 100%; padding: 14px; border-radius: 10px;
    font-size: 15px; font-weight: 700; font-family: var(--font);
    background: var(--primary-dark); color: white; border: none; cursor: pointer;
    transition: all 0.2s; box-shadow: 0 4px 16px rgba(35,46,86,0.25);
    margin-top: 4px;
  }
  .btn-login:hover:not(:disabled) { background: var(--primary); transform: translateY(-1px); }
  .btn-login:disabled { opacity: 0.6; cursor: not-allowed; }

  .login-footer { text-align: center; font-size: 13.5px; color: var(--muted); margin-top: 20px; }
  .login-link {
    font-weight: 800; color: var(--primary); cursor: pointer;
    background: none; border: none; font-family: var(--font); font-size: 13.5px;
  }
  .login-link:hover { color: var(--primary-dark); }

  .login-divider {
    display: flex; align-items: center; gap: 12px; margin: 20px 0 16px;
  }
  .login-divider-line { flex: 1; height: 1px; background: var(--border); }
  .login-divider-text { font-size: 11px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; }

  @media (max-width: 480px) {
    .login-card { width: 100%; margin: 16px; padding: 32px 24px; }
  }
`;

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm]         = useState({ correo: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // PUNTO B: Cifrado híbrido RSA+AES antes de enviar al servidor
      // 1. Se obtiene la clave pública RSA del servidor
      // 2. Se genera clave AES-256 e IV aleatorio únicos para esta sesión
      // 3. Las credenciales se cifran con AES, la clave AES se cifra con RSA
      const payload = await encryptCredentials(form.correo, form.password);

      const res = await fetch(`${API_BASE}/auth/login.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al iniciar sesión.');
        return;
      }

      sessionStorage.setItem('user', JSON.stringify(data.user));

      const rol = data.user.nombre_rol?.toLowerCase();
      if (rol === 'empresa')       navigate('/dashboard-empresa');
      else if (rol === 'profesor') navigate('/dashboard-vinculacion');
      else                         navigate('/dashboard');

    } catch (err) {
      setError('Error de conexión o cifrado: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="login-wrap">
        <div className="login-card">

          <div className="login-brand">
            <div className="login-brand-icon">
              <svg width="20" height="18" viewBox="0 0 36 32" fill="none">
                <polygon points="18,2 34,10 18,18 2,10" stroke="white" strokeWidth="2.5" strokeLinejoin="round" fill="none"/>
                <polyline points="2,16 18,24 34,16" stroke="white" strokeWidth="2.5" strokeLinejoin="round" fill="none"/>
                <polyline points="2,22 18,30 34,22" stroke="white" strokeWidth="2.5" strokeLinejoin="round" fill="none"/>
              </svg>
            </div>
            <div className="login-brand-name">Skill<span>Match</span></div>
          </div>

          <h1 className="login-title">Bienvenido de nuevo</h1>
          <p className="login-subtitle">Inicia sesión en tu cuenta</p>

          {error && <div className="login-alert">{error}</div>}

          <form className="login-form" onSubmit={handleSubmit}>
            <label className="field-label">Correo electrónico</label>
            <div className="field-wrap">
              <span className="field-icon">✉</span>
              <input
                className="field-input"
                type="email"
                name="correo"
                value={form.correo}
                onChange={handleChange}
                placeholder="tu@correo.com"
                required
                autoComplete="email"
              />
            </div>

            <label className="field-label">Contraseña</label>
            <div className="field-wrap">
              <input
                className="field-input no-icon"
                type={showPass ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Mín. 8 caracteres"
                required
                minLength={8}
                autoComplete="current-password"
              />
              <button type="button" className="field-toggle" onClick={() => setShowPass(!showPass)}>
                {showPass ? "🙈" : "👁"}
              </button>
            </div>

            <button className="btn-login" type="submit" disabled={loading}>
              {loading ? 'Cifrando y enviando...' : 'Iniciar sesión'}
            </button>
          </form>

          <div className="login-divider">
            <div className="login-divider-line"/>
            <span className="login-divider-text">¿Nuevo aquí?</span>
            <div className="login-divider-line"/>
          </div>

          <div className="login-footer">
            ¿No tienes cuenta?{' '}
            <button className="login-link" onClick={() => navigate('/registro')}>Regístrate gratis</button>
          </div>

        </div>
      </div>
    </>
  );
}