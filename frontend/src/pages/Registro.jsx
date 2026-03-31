import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../CSS/Registro.css';

const API_BASE = 'https://skillmatch-backend-duiu.onrender.com/api';

const carrerasDefault = [
  "Ing. en Desarrollo y Gestión de Software",
  "Ing. Mecatrónica",
  "Ing. Ambiental",
  "Ing. Redes",
];

const stepsEstudiante = [
  { n: "1", title: "Crea tu perfil", desc: "Agrega tus habilidades y proyectos académicos" },
  { n: "2", title: "Explora oportunidades", desc: "Filtra vacantes por carrera y área de interés" },
  { n: "3", title: "Postula con un clic", desc: "Tu perfil llega verificado a la empresa" },
];

const stepsProfesor = [
  { n: "1", title: "Registra tu perfil", desc: "Vincula tu cuenta académica y departamento" },
  { n: "2", title: "Gestiona proyectos", desc: "Sube y supervisa proyectos de innovación" },
  { n: "3", title: "Conecta alumnos", desc: "Ayuda a tus alumnos a encontrar oportunidades" },
];

export default function Registro() {
  const navigate = useNavigate();

  const [showPass, setShowPass] = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [carreras] = useState(carrerasDefault);
  
  // 🟢 Nuevo estado para controlar el rol seleccionado (2: Estudiante, 4: Profesor)
  const [role, setRole] = useState(2);

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
    // 🟢 Campos para Profesor
    departamento: '',
    asignaturas: '',
  });

  const handleEst = (e) => setEstForm({ ...estForm, [e.target.name]: e.target.value });

  const submitRegistro = async () => {
    setError('');
    setSuccess('');

    // Validaciones comunes
    if (!estForm.nombre || !estForm.apellido || !estForm.correo || !estForm.password) {
      return setError('Completa los campos personales básicos.');
    }

    // Validaciones específicas por Rol
    if (role === 2) { // Estudiante
      if (!estForm.matricula || !estForm.carrera || !estForm.semestre) {
        return setError('Completa los datos académicos del estudiante.');
      }
    } else if (role === 4) { // Profesor
      if (!estForm.departamento) {
        return setError('El departamento es obligatorio para profesores.');
      }
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
      // Construimos el body según el rol
      const bodyBase = {
        nombre: estForm.nombre,
        apellido: estForm.apellido,
        correo: estForm.correo,
        password: estForm.password,
        id_rol: role,
      };

      const bodyFinal = role === 2 
        ? { ...bodyBase, matricula: estForm.matricula, carrera: estForm.carrera, semestre: Number(estForm.semestre) }
        : { ...bodyBase, departamento: estForm.departamento, asignaturas: estForm.asignaturas };

      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyFinal),
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

          <h1 className="reg-title">Registro de {role === 2 ? 'Estudiante' : 'Profesor'}</h1>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            {role === 2 ? 'Únete a la red de talento de la UTEQ.' : 'Gestiona y vincula el talento de tus alumnos.'}
          </p>

          {/* 🟢 Selector de Rol */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
            <button 
              className={`nav-item ${role === 2 ? 'active' : ''}`} 
              onClick={() => setRole(2)}
              style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ddd', cursor: 'pointer', background: role === 2 ? '#244E7C' : 'white', color: role === 2 ? 'white' : '#666', fontWeight: 'bold' }}
            >
              Soy Estudiante
            </button>
            <button 
              className={`nav-item ${role === 4 ? 'active' : ''}`} 
              onClick={() => setRole(4)}
              style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ddd', cursor: 'pointer', background: role === 4 ? '#244E7C' : 'white', color: role === 4 ? 'white' : '#666', fontWeight: 'bold' }}
            >
              Soy Profesor
            </button>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

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

          {/* 🟢 Campos Condicionales según el Rol */}
          {role === 2 ? (
            <>
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
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((n) => (
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
            </>
          ) : (
            <>
              <div className="field-row field-row-1">
                <div className="form-group">
                  <label className="field-label">Departamento / Academia</label>
                  <div className="field-wrap">
                    <span className="field-icon">🏢</span>
                    <input
                      className="field-input"
                      name="departamento"
                      placeholder="Ej. Tecnologías de la Información"
                      value={estForm.departamento}
                      onChange={handleEst}
                    />
                  </div>
                </div>
              </div>
              <div className="field-row field-row-1">
                <div className="form-group">
                  <label className="field-label">Asignaturas (opcional)</label>
                  <div className="field-wrap">
                    <span className="field-icon">📖</span>
                    <input
                      className="field-input"
                      name="asignaturas"
                      placeholder="Ej. Programación Web, Base de Datos"
                      value={estForm.asignaturas}
                      onChange={handleEst}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

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
                  placeholder={role === 2 ? "alumno@uteq.edu.mx" : "profesor@uteq.edu.mx"}
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

          <button className="btn-submit" disabled={loading} onClick={submitRegistro}>
            {loading ? 'Registrando...' : `Registrarse como ${role === 2 ? 'Estudiante' : 'Profesor'}`}
          </button>

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
              {role === 2 ? 'Impulsa tu carrera' : 'Liderazgo Académico'}
            </div>
            <p className="right-desc">
              {role === 2 
                ? 'Regístrate y accede a proyectos reales, estadías y empleos en empresas validadas por la UTEQ.'
                : 'Supervisa el desarrollo de tus alumnos y gestiona proyectos de innovación institucional.'}
            </p>

            <div className="right-steps">
              {(role === 2 ? stepsEstudiante : stepsProfesor).map((s) => (
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