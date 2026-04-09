import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../CSS/VerAlumno.css';

const API_BASE = 'https://skillmatch-backend-duiu.onrender.com/api';

export default function VerAlumno() {
  const { id } = useParams(); // Obtenemos el ID del alumno desde la URL
  const navigate = useNavigate();
  
  const [alumno, setAlumno] = useState(null);
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0); // Al entrar, subir al inicio de la página
    cargarPerfilAlumno();
  }, [id]);

  const cargarPerfilAlumno = async () => {
    try {
      const token = localStorage.getItem('token');
      // Suponiendo que tienes un endpoint que devuelve info de un alumno específico
      const res = await fetch(`${API_BASE}/estudiante/perfil-publico/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();

      if (data.ok) {
        setAlumno(data.alumno);
        setProyectos(data.proyectos || []);
      } else {
        setError(data.mensaje || 'No se pudo cargar el perfil.');
      }
    } catch (err) {
      setError('Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const initials = (name) => name ? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "ST";

  if (loading) return <div className="loading-screen">Cargando perfil del estudiante...</div>;
  if (error) return <div className="error-screen"><h3>{error}</h3><button onClick={() => navigate(-1)}>Volver</button></div>;

  return (
    <div className="perfil-alumno-container">
      {/* Botón de regreso */}
      <div className="back-nav">
        <button className="btn-back" onClick={() => navigate(-1)}>
          ← Volver al Directorio
        </button>
      </div>

      <div className="perfil-layout">
        {/* COLUMNA IZQUIERDA: Info General */}
        <aside className="perfil-sidebar">
          <div className="perfil-card-main">
            <div className="perfil-avatar-large">{initials(alumno?.nombre)}</div>
            <h1 className="perfil-nombre">{alumno?.nombre} {alumno?.apellido}</h1>
            <p className="perfil-carrera-tag">{alumno?.carrera}</p>
            <div className="perfil-badge-uteq">Estudiante UTEQ ✓</div>
            
            <div className="perfil-stats-row">
              <div className="stat-box">
                <div className="stat-val">{proyectos.length}</div>
                <div className="stat-lab">Proyectos</div>
              </div>
              <div className="stat-box">
                <div className="stat-val">Verificado</div>
                <div className="stat-lab">Estado</div>
              </div>
            </div>

            <button className="btn-contactar-primary">Contactar Estudiante</button>
          </div>

          <div className="perfil-info-extra">
            <h3>Información de Contacto</h3>
            <div className="info-item">
              <span className="info-icon">📧</span>
              <span>{alumno?.correo}</span>
            </div>
            <div className="info-item">
              <span className="info-icon">🎓</span>
              <span>{alumno?.matricula}</span>
            </div>
            <div className="info-item">
              <span className="info-icon">📅</span>
              <span>{alumno?.semestre}° Cuatrimestre</span>
            </div>
          </div>
        </aside>

        {/* COLUMNA DERECHA: Proyectos y Experiencia */}
        <main className="perfil-content">
          <section className="perfil-section">
            <h2 className="section-title">Habilidades y Tecnologías</h2>
            <div className="skills-grid-full">
              {/* Aquí mapearíamos las skills reales cuando las tengamos */}
              <span className="skill-badge-big">React.js</span>
              <span className="skill-badge-big">Node.js</span>
              <span className="skill-badge-big">SQL Server</span>
              <span className="skill-badge-big">UI/UX Design</span>
              <span className="skill-badge-big">GitHub</span>
            </div>
          </section>

          <section className="perfil-section">
            <h2 className="section-title">Portafolio de Proyectos Académicos</h2>
            {proyectos.length === 0 ? (
              <div className="no-projects">Este estudiante aún no ha registrado proyectos públicos.</div>
            ) : (
              <div className="proyectos-ver-list">
                {proyectos.map((p) => (
                  <div className="proyecto-ver-card" key={p.id_proyecto}>
                    <div className="proy-header">
                      <h3>{p.titulo}</h3>
                      <span className="proy-fecha">{new Date(p.fecha_registro).toLocaleDateString()}</span>
                    </div>
                    <p className="proy-desc">{p.descripcion}</p>
                    
                    <div className="proy-techs">
                      {p.tecnologias?.split(',').map((tech, i) => (
                        <span key={i} className="tech-tag-mini">{tech.trim()}</span>
                      ))}
                    </div>

                    <div className="proy-footer">
                      <button className="btn-ver-evidencia">Ver Evidencias del Proyecto</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}