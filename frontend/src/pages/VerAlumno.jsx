import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../CSS/VerAlumno.css';

const API_BASE = 'https://skillmatch-backend-duiu.onrender.com/api';

export default function VerAlumno() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  const [alumno, setAlumno] = useState(null);
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0); 
    cargarPerfilAlumno();
  }, [id]);

  const cargarPerfilAlumno = async () => {
    try {
      const token = localStorage.getItem('token');
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

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '50px', color: '#64748b' }}>Cargando perfil del estudiante...</div>;
  if (error) return <div style={{ textAlign: 'center', padding: '50px' }}><h3 style={{ color: '#ef4444' }}>{error}</h3><button onClick={() => navigate(-1)} style={{ padding: '10px 20px', background: '#244E7C', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', marginTop: '15px' }}>Volver</button></div>;

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', padding: 'clamp(15px, 3vw, 40px)', fontFamily: "'Montserrat', sans-serif" }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* Botón de regreso */}
        <div style={{ marginBottom: '20px' }}>
          <button 
            onClick={() => navigate(-1)}
            style={{ background: 'none', border: 'none', color: '#244E7C', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            ← Volver
          </button>
        </div>

        {/* 🟢 CONTENEDOR RESPONSIVO PRINCIPAL (FLEX-WRAP) 🟢 */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', alignItems: 'flex-start' }}>
          
          {/* COLUMNA IZQUIERDA: Info General */}
          <aside style={{ flex: '1 1 300px', minWidth: '280px', background: 'white', padding: '30px 20px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', textAlign: 'center', position: 'sticky', top: '20px' }}>
            <div style={{ width: '100px', height: '100px', background: '#244E7C', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', fontWeight: '800', margin: '0 auto 20px auto', boxShadow: '0 8px 15px rgba(36,78,124,0.2)' }}>
              {initials(alumno?.nombre)}
            </div>
            <h1 style={{ color: '#232E56', fontSize: '24px', fontWeight: '800', marginBottom: '5px' }}>{alumno?.nombre} {alumno?.apellido}</h1>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '15px', fontWeight: '600' }}>{alumno?.carrera}</p>
            <div style={{ background: '#dcfce7', color: '#166534', padding: '6px 12px', borderRadius: '20px', display: 'inline-block', fontSize: '12px', fontWeight: 'bold', marginBottom: '30px' }}>
              ✓ Estudiante UTEQ
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '22px', fontWeight: '800', color: '#232E56' }}>{proyectos.length}</div>
                <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Proyectos</div>
              </div>
              <div style={{ width: '1px', background: '#e2e8f0' }}></div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '22px', fontWeight: '800', color: '#232E56' }}>Activo</div>
                <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Estado</div>
              </div>
            </div>
          </aside>

          {/* COLUMNA DERECHA: Proyectos y Contacto */}
          <main style={{ flex: '2 1 500px', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            {/* SECCIÓN CONTACTO */}
            <section style={{ background: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
              <h2 style={{ color: '#232E56', fontSize: '18px', marginBottom: '20px', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>Información de Contacto</h2>
              {/* 🟢 GRID RESPONSIVO PARA TARJETITAS 🟢 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ background: '#e0e7ff', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                    📧
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Correo Electrónico</div>
                    <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '600', marginTop: '2px', wordBreak: 'break-all' }}>{alumno?.correo}</div>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ background: '#dcfce7', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                    🎓
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Matrícula</div>
                    <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '600', marginTop: '2px' }}>{alumno?.matricula}</div>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ background: '#fef3c7', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                    📅
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nivel Académico</div>
                    <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '600', marginTop: '2px' }}>{alumno?.semestre}° Cuatrimestre</div>
                  </div>
                </div>

              </div>
            </section>

            {/* SECCIÓN PORTAFOLIO */}
            <section style={{ background: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
              <h2 style={{ color: '#232E56', fontSize: '18px', marginBottom: '20px', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>Portafolio de Proyectos Académicos</h2>
              {proyectos.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', color: '#94a3b8', fontStyle: 'italic' }}>Este estudiante aún no ha registrado proyectos públicos.</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                  {proyectos.map((p) => (
                    <div key={p.id_proyecto} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }} onMouseOver={e => e.currentTarget.style.transform='translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform='translateY(0)'}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <h3 style={{ fontSize: '16px', color: '#232E56', margin: 0, fontWeight: '800', lineHeight: '1.3' }}>{p.titulo}</h3>
                        <span style={{ fontSize: '11px', color: '#94a3b8', background: '#f1f5f9', padding: '4px 8px', borderRadius: '12px', whiteSpace: 'nowrap', marginLeft: '10px' }}>{new Date(p.fecha_registro).toLocaleDateString()}</span>
                      </div>
                      <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '15px', flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.descripcion}</p>
                      
                      {/* Tecnologías */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
                        {p.tecnologias?.split(',').map((tech, i) => {
                          const cleanTech = tech.replace(/[\[\]"']/g, '').trim();
                          if (!cleanTech) return null;
                          return (
                            <span key={i} style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '12px' }}>{cleanTech}</span>
                          );
                        })}
                      </div>

                      <button 
                        onClick={() => navigate(`/proyecto/${p.id_proyecto}`)}
                        style={{ width: '100%', padding: '12px', background: '#232E56', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' }}
                        onMouseOver={e => e.currentTarget.style.background='#1e293b'}
                        onMouseOut={e => e.currentTarget.style.background='#232E56'}
                      >
                        Ver Evidencias del Proyecto
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}