import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../CSS/Registro.css'; // 🟢 Importamos el CSS

const API_BASE = 'http://localhost:3000/api';

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
          razon_social: empForm.razon_social,
          giro: empForm.giro,
          contacto: empForm.contacto
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