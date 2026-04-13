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
          </div>
        </aside>

        {/* COLUMNA DERECHA: Proyectos y Contacto */}
        <main className="perfil-content">
          
          <section className="perfil-section">
            <h2 className="section-title">Información de Contacto</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px' }}>
              
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ background: '#e0e7ff', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                  📧
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Correo Electrónico</div>
                  <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '600', marginTop: '2px' }}>{alumno?.correo}</div>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ background: '#dcfce7', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                  🎓
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Matrícula</div>
                  <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '600', marginTop: '2px' }}>{alumno?.matricula}</div>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ background: '#fef3c7', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                  📅
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nivel Académico</div>
                  <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '600', marginTop: '2px' }}>{alumno?.semestre}° Cuatrimestre</div>
                </div>
              </div>

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
                      {p.tecnologias?.split(',').map((tech, i) => {
                        const cleanTech = tech.replace(/[\[\]"']/g, '').trim();
                        if (!cleanTech) return null;
                        return (
                          <span key={i} className="tech-tag-mini">{cleanTech}</span>
                        );
                      })}
                    </div>

                    <div className="proy-footer">
                      {/* 🟢 CORRECCIÓN: La ruta ahora coincide con tu App.jsx (/proyecto/:id) 🟢 */}
                      <button 
                        className="btn-ver-evidencia"
                        onClick={() => navigate(`/proyecto/${p.id_proyecto}`)}
                      >
                        Ver Evidencias del Proyecto
                      </button>
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