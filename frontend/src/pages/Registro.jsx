import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:3000/api';

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
  }

  body { font-family: var(--font); background: var(--surface); color: var(--text); min-height: 100dvh; overflow-x: hidden; }

  .reg-wrap { display: flex; min-height: 100dvh; }

  .reg-left {
    flex: 1; display: flex; flex-direction: column;
    padding: clamp(20px, 2.5vw, 30px) clamp(16px, 2.7vw, 34px);
    overflow-y: auto; background: white;
  }

  .back-link {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 13px; font-weight: 600; color: var(--muted);
    cursor: pointer; transition: color 0.15s; margin-bottom: 16px;
    background: none; border: none; font-family: var(--font);
  }
  .back-link:hover { color: var(--primary); }

  .reg-brand { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
  .reg-brand-icon {
    width: 32px; height: 32px; border-radius: 8px;
    background: var(--primary-dark);
    display: flex; align-items: center; justify-content: center;
  }
  .reg-brand-name { font-size: 16px; font-weight: 800; color: var(--text); }
  .reg-brand-name span { color: var(--primary); }

  .reg-title { font-size: 28px; font-weight: 800; color: var(--text); letter-spacing: -0.6px; margin-bottom: 12px; }

  .tab-selector {
    display: flex; border-radius: 10px; overflow: hidden;
    border: 1.5px solid var(--border); margin-bottom: 14px;
  }
  .tab-btn {
    flex: 1; padding: 11px 16px; font-size: 13.5px; font-weight: 700; font-family: var(--font);
    cursor: pointer; border: none; transition: all 0.18s;
    display: flex; align-items: center; justify-content: center; gap: 7px;
    background: var(--bg); color: var(--muted);
  }
  .tab-btn.active { background: var(--primary-dark); color: white; }
  .tab-btn:not(.active):hover { background: #eef2fa; color: var(--primary); }

  .reg-notice {
    background: #eff6ff; border: 1.5px solid #bfdbfe;
    border-radius: 10px; padding: 12px 16px;
    font-size: 13px; color: var(--text); line-height: 1.55; margin-bottom: 14px;
  }
  .reg-notice strong { font-weight: 700; }

  .form-section { display: flex; align-items: center; gap: 12px; margin: 14px 0 10px; }
  .form-section-line { flex: 1; height: 1px; background: var(--border); }
  .form-section-label {
    font-size: 10px; font-weight: 700; color: var(--muted);
    text-transform: uppercase; letter-spacing: 1.5px; white-space: nowrap;
  }

  .field-row { display: grid; gap: 10px; margin-bottom: 10px; }
  .field-row-1 { grid-template-columns: 1fr; }
  .field-row-2 { grid-template-columns: 1fr 1fr; }
  .field-row-3 { grid-template-columns: 1fr 1fr 1fr; }

  .form-group { display: flex; flex-direction: column; gap: 5px; }
  .field-label { font-size: 12.5px; font-weight: 700; color: var(--text); }
  .field-wrap { position: relative; display: flex; align-items: center; }
  .field-icon { position: absolute; left: 12px; font-size: 13px; color: #b0b8cc; pointer-events: none; }

  .field-input, .field-select {
    width: 100%; padding: 11px 12px 11px 34px;
    border: 1.5px solid var(--border); border-radius: 9px;
    font-size: 13px; color: var(--text); font-family: var(--font);
    background: var(--bg); outline: none; appearance: none;
    transition: border-color 0.18s, box-shadow 0.18s;
  }
  .field-input::placeholder { color: #b0b8cc; }
  .field-input:focus, .field-select:focus {
    border-color: var(--primary); box-shadow: 0 0 0 3px rgba(36,78,124,0.1); background: white;
  }
  .field-input.no-icon { padding-left: 12px; }

  .field-toggle {
    position: absolute; right: 12px; background: none; border: none;
    cursor: pointer; font-size: 14px; color: var(--muted); padding: 0; transition: color 0.15s;
  }
  .field-toggle:hover { color: var(--primary); }

  .terms-row {
    display: flex; align-items: flex-start; gap: 10px;
    margin: 12px 0 10px; font-size: 13px; color: var(--text); cursor: pointer;
  }
  .terms-check { width: 16px; height: 16px; accent-color: var(--primary-dark); margin-top: 1px; flex-shrink: 0; }
  .terms-link { font-weight: 700; color: var(--primary); cursor: pointer; }

  .btn-submit {
    width: 100%; padding: 14px; border-radius: 10px;
    font-size: 15px; font-weight: 700; font-family: var(--font);
    background: var(--primary-dark); color: white; border: none; cursor: pointer;
    transition: all 0.2s; box-shadow: 0 4px 16px rgba(35,46,86,0.25);
  }
  .btn-submit:hover:not(:disabled) { background: var(--primary); transform: translateY(-1px); }
  .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

  .login-row { text-align: center; font-size: 13.5px; color: var(--muted); margin-top: 14px; }
  .login-link {
    font-weight: 800; color: var(--primary); cursor: pointer;
    background: none; border: none; font-family: var(--font); font-size: 13.5px; transition: color 0.15s;
  }
  .login-link:hover { color: var(--primary-dark); }

  .alert { padding: 12px 16px; border-radius: 9px; font-size: 13px; margin-bottom: 12px; font-weight: 600; }
  .alert-error   { background: #fff0f0; border: 1.5px solid #f5c6cb; color: #c0392b; }
  .alert-success { background: #f0fff4; border: 1.5px solid #b2dfdb; color: #1b5e20; }

  .reg-right {
    width: min(44%, 560px); flex-shrink: 0;
    background: linear-gradient(145deg, var(--primary-dark) 0%, #1e3f6e 55%, #244E7C 100%);
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: clamp(24px, 2.3vw, 32px) clamp(16px, 2vw, 24px);
    position: relative; overflow: hidden;
  }
  .reg-right::before {
    content: ''; position: absolute; inset: 0;
    background-image: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
    background-size: 36px 36px; pointer-events: none;
  }

  .right-content {
    position: relative; z-index: 2;
    display: flex; flex-direction: column; align-items: center; text-align: center;
    width: min(100%, 360px);
  }

  .right-icon {
    width: 72px; height: 72px; border-radius: 20px;
    background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2);
    display: flex; align-items: center; justify-content: center; margin-bottom: 20px;
  }

  .right-title { font-size: 24px; font-weight: 800; color: white; letter-spacing: -0.5px; margin-bottom: 12px; }
  .right-desc { font-size: 14px; color: rgba(255,255,255,0.65); line-height: 1.65; margin-bottom: 22px; max-width: 280px; }

  .right-steps { display: flex; flex-direction: column; gap: 10px; width: 100%; }
  .right-step {
    display: flex; align-items: flex-start; gap: 14px;
    background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12);
    border-radius: 12px; padding: 14px 16px; text-align: left;
  }
  .step-num {
    width: 28px; height: 28px; border-radius: 50%;
    background: rgba(255,255,255,0.15);
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 800; color: white; flex-shrink: 0;
  }
  .step-title { font-size: 13px; font-weight: 700; color: white; margin-bottom: 2px; }
  .step-desc { font-size: 12px; color: rgba(255,255,255,0.6); line-height: 1.5; }

  .right-badge {
    margin-top: 18px;
    display: inline-flex; align-items: center; gap: 8px;
    padding: 8px 18px; border-radius: 20px;
    background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.18);
    font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.85);
  }

  @media (max-width: 1080px) {
    .reg-wrap { flex-direction: column; }
    .reg-left, .reg-right { width: 100%; max-width: none; }
    .reg-right { min-height: 240px; }
    .field-row-2, .field-row-3 { grid-template-columns: 1fr; }
  }
  @media (max-width: 720px) {
    .reg-left { padding: 18px 16px 24px; }
    .reg-title { font-size: 24px; }
    .tab-btn { font-size: 12.5px; padding: 10px; }
  }
`;

const carrerasDefault = [
  "Ing. en Desarrollo y Gestión de Software",
  "Ing. Mecatrónica",
  "Ing. Ambiental",
  "Ing. Redes",
];

const sectores = [
  "Tecnología / Software", "Manufactura", "Salud", "Educación",
  "Finanzas", "Construcción", "Comercio", "Agroindustria", "Logística", "Otro",
];

const stepsEstudiante = [
  { n: "1", title: "Crea tu perfil", desc: "Agrega tus habilidades y proyectos académicos" },
  { n: "2", title: "Explora oportunidades", desc: "Filtra vacantes por carrera y área de interés" },
  { n: "3", title: "Postula con un clic", desc: "Tu perfil llega verificado a la empresa" },
];

const stepsEmpresa = [
  { n: "1", title: "Solicita convenio", desc: "Completa tu registro y envía tu solicitud a Vinculación" },
  { n: "2", title: "Aprobación UTEQ", desc: "Servicios Escolares valida y aprueba tu empresa" },
  { n: "3", title: "Publica vacantes", desc: "Accede al talento universitario de la UTEQ" },
];

export default function Registro() {
  const navigate = useNavigate();

  const [tab, setTab] = useState("estudiante");
  const [showPass, setShowPass] = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [carreras] = useState(carrerasDefault);

  const [estForm, setEstForm] = useState({
    nombre: '',
    apellido: '',
    matricula: '',
    correo: '',
    password: '',
    confirmar: '',
    semestre: '',
    carrera: '',
    grupo: '',
  });

  const [empForm, setEmpForm] = useState({
    razon_social: '',
    giro: '',
    contacto: '',
    puesto: '',
    correo: '',
    password: '',
    confirmar: '',
  });

  const handleEst = (e) => setEstForm({ ...estForm, [e.target.name]: e.target.value });
  const handleEmp = (e) => setEmpForm({ ...empForm, [e.target.name]: e.target.value });

  const changeTab = (t) => {
    setTab(t);
    setError('');
    setSuccess('');
    setTerms(false);
  };

  const submitEstudiante = async () => {
    setError('');
    setSuccess('');

    if (
      !estForm.nombre ||
      !estForm.apellido ||
      !estForm.matricula ||
      !estForm.correo ||
      !estForm.password ||
      !estForm.carrera ||
      !estForm.semestre
    ) {
      return setError('Completa todos los campos obligatorios.');
    }

    if (estForm.password !== estForm.confirmar) {
      return setError('Las contraseñas no coinciden.');
    }

    if (estForm.password.length < 8) {
      return setError('La contraseña debe tener al menos 8 caracteres.');
    }

    if (!terms) {
      return setError('Debes aceptar los términos y condiciones.');
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: estForm.nombre,
          apellido: estForm.apellido,
          correo: estForm.correo,
          password: estForm.password,
          id_rol: 2,
          matricula: estForm.matricula,
          carrera: estForm.carrera,
          semestre: Number(estForm.semestre),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        return setError(data.mensaje || 'Error al registrar.');
      }

      setSuccess('¡Cuenta creada correctamente! Redirigiendo al login...');
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      setError('Error de conexión: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const submitEmpresa = async () => {
    setError('');
    setSuccess('');

    if (!empForm.razon_social || !empForm.correo || !empForm.password) {
      return setError('Completa todos los campos obligatorios.');
    }

    if (empForm.password !== empForm.confirmar) {
      return setError('Las contraseñas no coinciden.');
    }

    if (empForm.password.length < 8) {
      return setError('La contraseña debe tener al menos 8 caracteres.');
    }

    if (!terms) {
      return setError('Debes aceptar los términos y condiciones.');
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: empForm.razon_social,
          apellido: empForm.contacto || 'Empresa',
          correo: empForm.correo,
          password: empForm.password,
          id_rol: 3,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        return setError(data.mensaje || 'Error al registrar.');
      }

      setSuccess('¡Empresa registrada correctamente! Redirigiendo al login...');
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      setError('Error de conexión: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>

      <div className="reg-wrap">
        <div className="reg-left">
          <button className="back-link" onClick={() => navigate("/")}>
            ← Volver al inicio
          </button>

          <div className="reg-brand">
            <div className="reg-brand-icon">
              <svg width="18" height="16" viewBox="0 0 36 32" fill="none">
                <polygon points="18,2 34,10 18,18 2,10" stroke="white" strokeWidth="2.5" strokeLinejoin="round" fill="none" />
                <polyline points="2,16 18,24 34,16" stroke="white" strokeWidth="2.5" strokeLinejoin="round" fill="none" />
                <polyline points="2,22 18,30 34,22" stroke="white" strokeWidth="2.5" strokeLinejoin="round" fill="none" />
              </svg>
            </div>
            <div className="reg-brand-name">Skill<span>Match</span></div>
          </div>

          <h1 className="reg-title">Registrarse</h1>

          <div className="tab-selector">
            <button
              type="button"
              className={`tab-btn ${tab === "estudiante" ? "active" : ""}`}
              onClick={() => changeTab("estudiante")}
            >
              🎓 Estudiante
            </button>

            <button
              type="button"
              className={`tab-btn ${tab === "empresa" ? "active" : ""}`}
              onClick={() => changeTab("empresa")}
            >
              🏢 Empresa
            </button>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {tab === "empresa" && (
            <>
              <div className="reg-notice">
                <strong>Registro rápido.</strong> Solo pedimos lo esencial. Una vez dentro completas tu perfil con más datos de la empresa.
              </div>

              <div className="form-section">
                <div className="form-section-line" />
                <span className="form-section-label">Datos de la empresa</span>
                <div className="form-section-line" />
              </div>

              <div className="field-row field-row-1">
                <div className="form-group">
                  <label className="field-label">Nombre de la empresa</label>
                  <div className="field-wrap">
                    <span className="field-icon">🏢</span>
                    <input
                      className="field-input"
                      name="razon_social"
                      placeholder="Nombre oficial"
                      value={empForm.razon_social}
                      onChange={handleEmp}
                    />
                  </div>
                </div>
              </div>

              <div className="field-row field-row-2">
                <div className="form-group">
                  <label className="field-label">Sector / Industria</label>
                  <div className="field-wrap">
                    <span className="field-icon">🌐</span>
                    <select className="field-select" name="giro" value={empForm.giro} onChange={handleEmp}>
                      <option value="">Selecciona</option>
                      {sectores.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="field-label">Número de empleados</label>
                  <div className="field-wrap">
                    <span className="field-icon">👥</span>
                    <select className="field-select">
                      <option value="">Tamaño</option>
                      {["1–10", "11–50", "51–150", "151–300", "300–500", "500+"].map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="form-section-line" />
                <span className="form-section-label">Contacto principal</span>
                <div className="form-section-line" />
              </div>

              <div className="field-row field-row-2">
                <div className="form-group">
                  <label className="field-label">Nombre del contacto</label>
                  <div className="field-wrap">
                    <span className="field-icon">👤</span>
                    <input
                      className="field-input"
                      name="contacto"
                      placeholder="Nombre completo"
                      value={empForm.contacto}
                      onChange={handleEmp}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="field-label">Puesto</label>
                  <div className="field-wrap">
                    <span className="field-icon">🏷</span>
                    <input
                      className="field-input"
                      name="puesto"
                      placeholder="Ej. Gerente, Director TI"
                      value={empForm.puesto}
                      onChange={handleEmp}
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="form-section-line" />
                <span className="form-section-label">Datos de acceso</span>
                <div className="form-section-line" />
              </div>

              <div className="field-row field-row-1">
                <div className="form-group">
                  <label className="field-label">Correo corporativo</label>
                  <div className="field-wrap">
                    <span className="field-icon">✉</span>
                    <input
                      className="field-input"
                      name="correo"
                      placeholder="contacto@empresa.com"
                      type="email"
                      value={empForm.correo}
                      onChange={handleEmp}
                    />
                  </div>
                </div>
              </div>

              <div className="field-row field-row-2">
                <div className="form-group">
                  <label className="field-label">Contraseña</label>
                  <div className="field-wrap">
                    <input
                      className="field-input no-icon"
                      name="password"
                      type={showPass ? "text" : "password"}
                      placeholder="Mín. 8 caracteres"
                      value={empForm.password}
                      onChange={handleEmp}
                    />
                    <button type="button" className="field-toggle" onClick={() => setShowPass(!showPass)}>
                      {showPass ? "🙈" : "👁"}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="field-label">Confirmar contraseña</label>
                  <div className="field-wrap">
                    <input
                      className="field-input no-icon"
                      name="confirmar"
                      type={showPass2 ? "text" : "password"}
                      placeholder="Repite la contraseña"
                      value={empForm.confirmar}
                      onChange={handleEmp}
                    />
                    <button type="button" className="field-toggle" onClick={() => setShowPass2(!showPass2)}>
                      {showPass2 ? "🙈" : "👁"}
                    </button>
                  </div>
                </div>
              </div>

              <label className="terms-row">
                <input
                  type="checkbox"
                  className="terms-check"
                  checked={terms}
                  onChange={(e) => setTerms(e.target.checked)}
                />
                <span>
                  Acepto los <span className="terms-link">términos y condiciones</span> y la <span className="terms-link">política de privacidad</span>
                </span>
              </label>

              <button className="btn-submit" disabled={loading} onClick={submitEmpresa}>
                {loading ? 'Registrando...' : 'Registrar Empresa'}
              </button>
            </>
          )}

          {tab === "estudiante" && (
            <>
              <div className="form-section">
                <div className="form-section-line" />
                <span className="form-section-label">Datos personales</span>
                <div className="form-section-line" />
              </div>

              <div className="field-row field-row-2">
                <div className="form-group">
                  <label className="field-label">Nombre(s)</label>
                  <div className="field-wrap">
                    <span className="field-icon">👤</span>
                    <input
                      className="field-input"
                      name="nombre"
                      placeholder="Nombre(s)"
                      value={estForm.nombre}
                      onChange={handleEst}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="field-label">Apellidos</label>
                  <div className="field-wrap">
                    <span className="field-icon">👤</span>
                    <input
                      className="field-input"
                      name="apellido"
                      placeholder="Apellidos"
                      value={estForm.apellido}
                      onChange={handleEst}
                    />
                  </div>
                </div>
              </div>

              <div className="field-row field-row-2">
                <div className="form-group">
                  <label className="field-label">Matrícula</label>
                  <div className="field-wrap">
                    <span className="field-icon">🆔</span>
                    <input
                      className="field-input"
                      name="matricula"
                      placeholder="Ej. 2023371089"
                      value={estForm.matricula}
                      onChange={handleEst}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="field-label">Cuatrimestre</label>
                  <div className="field-wrap">
                    <span className="field-icon">📚</span>
                    <select className="field-select" name="semestre" value={estForm.semestre} onChange={handleEst}>
                      <option value="">Selecciona</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                        <option key={n} value={n}>{n}°</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="field-row field-row-2">
                <div className="form-group">
                  <label className="field-label">Carrera</label>
                  <div className="field-wrap">
                    <span className="field-icon">🎓</span>
                    <select className="field-select" name="carrera" value={estForm.carrera} onChange={handleEst}>
                      <option value="">Selecciona carrera</option>
                      {carreras.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="field-label">Grupo</label>
                  <div className="field-wrap">
                    <span className="field-icon">👥</span>
                    <input
                      className="field-input"
                      name="grupo"
                      placeholder="Ej. A, B, C"
                      value={estForm.grupo}
                      onChange={handleEst}
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="form-section-line" />
                <span className="form-section-label">Datos de acceso</span>
                <div className="form-section-line" />
              </div>

              <div className="field-row field-row-1">
                <div className="form-group">
                  <label className="field-label">Correo institucional</label>
                  <div className="field-wrap">
                    <span className="field-icon">✉</span>
                    <input
                      className="field-input"
                      name="correo"
                      placeholder="alumno@uteq.edu.mx"
                      type="email"
                      value={estForm.correo}
                      onChange={handleEst}
                    />
                  </div>
                </div>
              </div>

              <div className="field-row field-row-2">
                <div className="form-group">
                  <label className="field-label">Contraseña</label>
                  <div className="field-wrap">
                    <input
                      className="field-input no-icon"
                      name="password"
                      type={showPass ? "text" : "password"}
                      placeholder="Mín. 8 caracteres"
                      value={estForm.password}
                      onChange={handleEst}
                    />
                    <button type="button" className="field-toggle" onClick={() => setShowPass(!showPass)}>
                      {showPass ? "🙈" : "👁"}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="field-label">Confirmar contraseña</label>
                  <div className="field-wrap">
                    <input
                      className="field-input no-icon"
                      name="confirmar"
                      type={showPass2 ? "text" : "password"}
                      placeholder="Repite la contraseña"
                      value={estForm.confirmar}
                      onChange={handleEst}
                    />
                    <button type="button" className="field-toggle" onClick={() => setShowPass2(!showPass2)}>
                      {showPass2 ? "🙈" : "👁"}
                    </button>
                  </div>
                </div>
              </div>

              <label className="terms-row">
                <input
                  type="checkbox"
                  className="terms-check"
                  checked={terms}
                  onChange={(e) => setTerms(e.target.checked)}
                />
                <span>
                  Acepto los <span className="terms-link">términos y condiciones</span> y la <span className="terms-link">política de privacidad</span>
                </span>
              </label>

              <button className="btn-submit" disabled={loading} onClick={submitEstudiante}>
                {loading ? 'Registrando...' : 'Registrarse como Estudiante'}
              </button>
            </>
          )}

          <div className="login-row">
            ¿Ya tienes cuenta?{" "}
            <button className="login-link" onClick={() => navigate("/login")}>
              Inicia sesión
            </button>
          </div>
        </div>

        <div className="reg-right">
          <div className="right-content">
            <div className="right-icon">
              <svg width="36" height="32" viewBox="0 0 36 32" fill="none">
                <polygon points="18,2 34,10 18,18 2,10" stroke="white" strokeWidth="2.2" strokeLinejoin="round" fill="none" />
                <polyline points="2,16 18,24 34,16" stroke="white" strokeWidth="2.2" strokeLinejoin="round" fill="none" />
                <polyline points="2,22 18,30 34,22" stroke="white" strokeWidth="2.2" strokeLinejoin="round" fill="none" />
              </svg>
            </div>

            <div className="right-title">
              {tab === "estudiante" ? "Impulsa tu carrera" : "Encuentra el talento ideal"}
            </div>

            <p className="right-desc">
              {tab === "estudiante"
                ? "Regístrate y accede a proyectos reales, estadías y empleos en empresas validadas por la UTEQ."
                : "Publica vacantes y conecta con estudiantes verificados de la Universidad Tecnológica de Querétaro."}
            </p>

            <div className="right-steps">
              {(tab === "estudiante" ? stepsEstudiante : stepsEmpresa).map((s) => (
                <div className="right-step" key={s.n}>
                  <div className="step-num">{s.n}</div>
                  <div>
                    <div className="step-title">{s.title}</div>
                    <div className="step-desc">{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="right-badge">✓ Plataforma oficial UTEQ</div>
          </div>
        </div>
      </div>
    </>
  );
}