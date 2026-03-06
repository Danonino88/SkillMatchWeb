import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');

  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

  :root {
    --primary: #244E7C;
    --primary-dark: #232E56;
    --bg: #f4f6fa;
    --surface: #ffffff;
    --border: #dde2ee;
    --text: #1a2340;
    --muted: #71706F;
    --font: 'Montserrat', sans-serif;
    --layout-max: 1240px;
  }

  body {
    font-family: var(--font);
    background: var(--surface);
    color: var(--text);
    min-height: 100dvh;
    overflow-x: hidden;
  }

  /* ── LAYOUT DOS COLUMNAS ── */
  .login-wrap {
    display: flex;
    min-height: 100dvh;
  }

  /* ── LADO IZQUIERDO ── */
  .login-left {
    width: 40%;
    background: linear-gradient(145deg, var(--primary-dark) 0%, #1e3f6e 55%, #244E7C 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: clamp(24px, 3vw, 36px);
    position: relative;
    overflow: hidden;
    flex-shrink: 0;
  }

  /* patrón de + en fondo */
  .login-left::before {
    content: '';
    position: absolute; inset: 0;
    background-image: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
    background-size: 36px 36px;
    pointer-events: none;
  }

  .left-content {
    position: relative; z-index: 2;
    display: flex; flex-direction: column;
    align-items: center; text-align: center;
    max-width: 440px;
  }

  /* icono de capas */
  .brand-icon {
    width: 72px; height: 72px;
    background: rgba(255,255,255,0.12);
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 20px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 20px;
  }

  .left-title {
    font-size: 28px; font-weight: 800;
    color: white; letter-spacing: -0.5px;
    margin-bottom: 14px;
  }

  .left-desc {
    font-size: 14px; color: rgba(255,255,255,0.65);
    line-height: 1.6; margin-bottom: 24px;
    max-width: 320px;
  }

  /* grid de stats */
  .stats-grid {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 10px; width: 100%;
  }

  .stat-card {
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 12px; padding: 18px 20px;
    text-align: center;
  }

  .stat-num {
    font-size: 26px; font-weight: 900;
    color: white; line-height: 1; margin-bottom: 4px;
  }

  .stat-label {
    font-size: 12px; color: rgba(255,255,255,0.6);
    font-weight: 500;
  }

  /* ── LADO DERECHO ── */
  .login-right {
    width: 60%;
    display: flex; flex-direction: column;
    padding: clamp(22px, 3vw, 34px) clamp(18px, 2.8vw, 38px);
    overflow-y: auto;
    max-width: none;
    margin: 0;
    justify-content: center;
  }

  .back-link {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 13px; font-weight: 600; color: var(--muted);
    cursor: pointer; transition: color 0.15s;
    margin-bottom: 20px; background: none; border: none;
    font-family: var(--font);
  }
  .back-link:hover { color: var(--primary); }

  .form-brand {
    display: flex; align-items: center; gap: 7px;
    font-size: 11px; font-weight: 800; color: var(--primary);
    text-transform: uppercase; letter-spacing: 2px;
    margin-bottom: 14px;
  }
  .form-brand-icon { font-size: 13px; }

  .form-title {
    font-size: clamp(30px, 3.2vw, 36px); font-weight: 800;
    color: var(--text); letter-spacing: -0.8px;
    margin-bottom: 6px;
  }

  .form-subtitle {
    font-size: 15px; color: var(--muted);
    margin-bottom: 24px; font-weight: 400;
  }

  /* ── SELECTOR DE ROL ── */
  .role-selector {
    display: flex; gap: 8px;
    margin-bottom: 20px;
  }

  .role-btn {
    flex: 1; padding: 10px 16px; border-radius: 10px;
    font-size: 13px; font-weight: 700; font-family: var(--font);
    cursor: pointer; transition: all 0.18s;
    border: 1.5px solid var(--border);
    background: var(--bg); color: var(--muted);
    display: flex; align-items: center; justify-content: center; gap: 7px;
  }
  .role-btn.active {
    background: var(--primary-dark); color: white;
    border-color: var(--primary-dark);
    box-shadow: 0 4px 12px rgba(35,46,86,0.2);
  }
  .role-btn:not(.active):hover {
    border-color: var(--primary); color: var(--primary);
    background: #f0f5ff;
  }

  /* ── FORM FIELDS ── */
  .form-group { margin-bottom: 16px; }

  .field-label {
    font-size: 13px; font-weight: 700; color: var(--text);
    margin-bottom: 8px; display: block;
  }

  .field-wrap {
    position: relative; display: flex; align-items: center;
  }

  .field-icon {
    position: absolute; left: 14px;
    font-size: 15px; color: var(--muted);
    pointer-events: none;
  }

  .field-input {
    width: 100%;
    padding: 13px 14px 13px 42px;
    border: 1.5px solid var(--border);
    border-radius: 10px;
    font-size: 14px; color: var(--text);
    font-family: var(--font);
    background: var(--bg);
    outline: none;
    transition: border-color 0.18s, box-shadow 0.18s;
  }
  .field-input::placeholder { color: #b0b8cc; }
  .field-input:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(36,78,124,0.1);
    background: white;
  }

  .field-toggle {
    position: absolute; right: 14px;
    background: none; border: none; cursor: pointer;
    font-size: 16px; color: var(--muted);
    padding: 0; transition: color 0.15s;
  }
  .field-toggle:hover { color: var(--primary); }

  .forgot-link {
    display: block; text-align: right;
    font-size: 13px; font-weight: 700; color: var(--primary);
    cursor: pointer; margin-top: 8px;
    background: none; border: none; font-family: var(--font);
    transition: color 0.15s;
  }
  .forgot-link:hover { color: var(--primary-dark); }

  /* ── BOTÓN INGRESAR ── */
  .btn-submit {
    width: 100%; padding: 15px;
    border-radius: 10px; font-size: 15px; font-weight: 700;
    font-family: var(--font);
    background: var(--primary-dark); color: white;
    border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 10px;
    transition: all 0.2s;
    margin-top: 14px;
    box-shadow: 0 4px 16px rgba(35,46,86,0.25);
  }
  .btn-submit:hover {
    background: var(--primary);
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(35,46,86,0.3);
  }

  /* ── DIVISOR Y REGISTRO ── */
  .divider {
    display: flex; align-items: center; gap: 14px;
    margin: 18px 0 14px;
  }

  @media (max-width: 1024px) {
    body { overflow-y: auto; }
    .login-wrap { flex-direction: column; }
    .login-left,
    .login-right {
      width: 100%;
      max-width: none;
    }
    .login-left { min-height: 280px; }
    .login-right { padding: 22px 18px 28px; }
    .form-title { font-size: 30px; }
  }
  .divider-line { flex: 1; height: 1px; background: var(--border); }
  .divider-text { font-size: 12px; color: var(--muted); font-weight: 500; }

  .register-row {
    text-align: center; font-size: 14px; color: var(--muted);
  }
  .register-link {
    font-weight: 800; color: var(--primary); cursor: pointer;
    background: none; border: none; font-family: var(--font);
    font-size: 14px; transition: color 0.15s;
  }
  .register-link:hover { color: var(--primary-dark); }
  .register-sub {
    font-size: 13px; color: var(--muted);
    margin-left: 4px; font-weight: 400;
  }
`;

export default function Login() {
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <>
      <style>{styles}</style>
      <div className="login-wrap">

        {/* ── IZQUIERDA ── */}
        <div className="login-left">
          <div className="left-content">

            {/* icono capas SVG igual al de la foto */}
            <div className="brand-icon">
              <svg width="36" height="32" viewBox="0 0 36 32" fill="none">
                <polygon points="18,2 34,10 18,18 2,10" stroke="white" strokeWidth="2.2" strokeLinejoin="round" fill="none"/>
                <polyline points="2,16 18,24 34,16" stroke="white" strokeWidth="2.2" strokeLinejoin="round" fill="none"/>
                <polyline points="2,22 18,30 34,22" stroke="white" strokeWidth="2.2" strokeLinejoin="round" fill="none"/>
              </svg>
            </div>

            <div className="left-title">Bienvenido de vuelta</div>
            <p className="left-desc">
              Accede a tu cuenta y descubre los mejores proyectos escolares validados por la UTEQ.
            </p>

            <div className="stats-grid">
              {[
                { num: "+500", label: "Estudiantes activos" },
                { num: "+120", label: "Proyectos validados" },
                { num: "+30",  label: "Empresas aliadas" },
                { num: "4.8★", label: "Calificación promedio" },
              ].map(s => (
                <div className="stat-card" key={s.label}>
                  <div className="stat-num">{s.num}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* ── DERECHA ── */}
        <div className="login-right">

          <button className="back-link" onClick={() => navigate("/")}>← Volver al inicio</button>

          <div className="form-brand">
            <span className="form-brand-icon">⚡</span> SKILLMATCH
          </div>

          <h1 className="form-title">Iniciar sesión</h1>
          <p className="form-subtitle">Ingresa tus credenciales para continuar</p>

          {/* correo */}
          <div className="form-group">
            <label className="field-label">Correo electrónico</label>
            <div className="field-wrap">
              <span className="field-icon">✉</span>
              <input
                className="field-input"
                type="email"
                placeholder="tucorreo@uteq.edu.mx"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* contraseña */}
          <div className="form-group">
            <label className="field-label">Contraseña</label>
            <div className="field-wrap">
              <input
                className="field-input"
                style={{paddingLeft:"14px"}}
                type={showPass ? "text" : "password"}
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button className="field-toggle" onClick={() => setShowPass(!showPass)}>
                {showPass ? "🙈" : "👁"}
              </button>
            </div>
            <button className="forgot-link">¿Olvidaste tu contraseña?</button>
          </div>

          {/* botón */}
          <button className="btn-submit" onClick={() => navigate("/dashboard-empresa")}>
            → Ingresar
          </button>

          <div className="divider">
            <div className="divider-line" />
            <span className="divider-text">¿No tienes cuenta?</span>
            <div className="divider-line" />
          </div>

          <div className="register-row">
            <button className="register-link" onClick={() => navigate("/registro")}>Registrarse</button>
            <span className="register-sub">— es gratis y solo toma un minuto</span>
          </div>

        </div>
      </div>
    </>
  );
}
