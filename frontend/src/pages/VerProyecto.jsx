import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../CSS/LandingPage.css'; // Reutilizamos estilos base

const API_BASE = 'https://skillmatch-backend-duiu.onrender.com/api';

export default function VerProyecto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proyecto, setProyecto] = useState(null);
  const [evidencias, setEvidencias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDetalle = async () => {
      try {
        const res = await fetch(`${API_BASE}/public/proyectos/${id}`);
        const data = await res.json();

        if (data.ok) {
          setProyecto(data.proyecto);
          setEvidencias(data.evidencias || []);
        }
      } catch (error) {
        console.error("Error al cargar detalle:", error);
      } finally {
        setLoading(false);
      }
    };
    cargarDetalle();
  }, [id]);

  if (loading) return <div className="loading-box">Cargando proyecto académico...</div>;
  if (!proyecto) return <div className="error-box">No se encontró el proyecto solicitado.</div>;

  // Clasificación de evidencias
  const imagenes = evidencias.filter(e => e.mime_type?.includes('image'));
  const pdfs = evidencias.filter(e => e.mime_type?.includes('pdf') || e.nombre_original?.endsWith('.pdf'));
  const videos = evidencias.filter(e => e.mime_type?.includes('video'));

  return (
    <div className="landing-zoom" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      {/* Navbar simple para volver */}
      <nav className="nav" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="nav-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <div className="nav-logo-icon">⚡</div>
          <div className="nav-brand-text">Skill<span>Match</span></div>
        </div>
        <button className="nav-link" onClick={() => navigate('/')}>← Volver a Proyectos</button>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 20px' }}>
        
        {/* Encabezado: Título y Categoría */}
        <header style={{ marginBottom: '30px' }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <span className="uteq-chip" style={{ position: 'static' }}>✓ Proyecto UTEQ</span>
            <span style={{ background: '#e2e8f0', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
              {proyecto.area_trabajo}
            </span>
          </div>
          <h1 style={{ fontSize: '42px', color: '#232E56', fontWeight: '800', marginBottom: '10px' }}>{proyecto.titulo}</h1>
          <p style={{ fontSize: '18px', color: '#64748b' }}>Realizado por: <strong>{proyecto.nombre} {proyecto.apellido}</strong></p>
        </header>

        {/* --- CAMBIO EN LA CUADRÍCULA: Proporción 1.5fr a 1fr --- */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px', alignItems: 'start' }}>
          
          {/* COLUMNA IZQUIERDA: Contenido Principal */}
          <div>
            {/* --- IMAGEN PRINCIPAL AJUSTADA --- */}
            <div style={{ 
              borderRadius: '16px', 
              overflow: 'hidden', 
              boxShadow: '0 8px 20px rgba(0,0,0,0.1)', 
              marginBottom: '30px', 
              background: '#fff', 
              width: '100%', 
              maxWidth: '550px', // Limita el ancho máximo
              margin: '0 auto 30px auto' // Centra la imagen y le da margen inferior
            }}>
              {proyecto.img_principal ? (
                <img 
                  src={`https://skillmatch-backend-duiu.onrender.com/uploads/${proyecto.img_principal}`} 
                  alt={proyecto.titulo}
                  style={{ 
                    width: '100%', 
                    height: 'auto', // Mantiene la proporción de la imagen
                    maxHeight: '400px', // Limita la altura máxima para que no sea gigante
                    objectFit: 'contain', // Ajusta la imagen dentro sin recortarla
                    display: 'block'
                  }}
                />
              ) : (
                <div style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#cbd5e1', fontSize: '60px' }}>💻</div>
              )}
            </div>

            {/* Detalles Detallados */}
            <section className="detail-card" style={{ background: '#fff', padding: '30px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ borderBottom: '2px solid #232E56', display: 'inline-block', marginBottom: '20px' }}>Descripción del Proyecto</h3>
              <p style={{ lineHeight: '1.8', color: '#334155', fontSize: '16px', whiteSpace: 'pre-line' }}>{proyecto.descripcion}</p>

              <div style={{ marginTop: '30px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <h4 style={{ color: '#232E56' }}>🎯 Objetivo</h4>
                  <p style={{ fontSize: '14px', color: '#475569' }}>{proyecto.objetivo || 'No especificado'}</p>
                </div>
                <div>
                  <h4 style={{ color: '#232E56' }}>🛠️ Actividades</h4>
                  <p style={{ fontSize: '14px', color: '#475569' }}>{proyecto.actividades || 'No especificado'}</p>
                </div>
              </div>
            </section>

            {/* --- SECCIÓN DE EVIDENCIAS --- */}
            <section style={{ marginTop: '40px' }}>
              <h2 style={{ color: '#232E56', marginBottom: '20px' }}>Evidencias y Entregables</h2>
              
              {/* IMÁGENES */}
              {imagenes.length > 0 && (
                <div style={{ marginBottom: '30px' }}>
                  <h4 style={{ color: '#64748b', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '1px' }}>Galería de Imágenes</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px', marginTop: '10px' }}>
                    {imagenes.map(img => (
                      <a key={img.id_evidencia} href={`https://skillmatch-backend-duiu.onrender.com/uploads/${img.ruta_archivo}`} target="_blank" rel="noreferrer">
                        <img src={`https://skillmatch-backend-duiu.onrender.com/uploads/${img.ruta_archivo}`} alt="evidencia" style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #fff', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }} />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* PDFs */}
              {pdfs.length > 0 && (
                <div style={{ marginBottom: '30px' }}>
                  <h4 style={{ color: '#64748b', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '1px' }}>Documentación PDF</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                    {pdfs.map(pdf => (
                      <a key={pdf.id_evidencia} href={`https://skillmatch-backend-duiu.onrender.com/uploads/${pdf.ruta_archivo}`} target="_blank" rel="noreferrer" 
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', textDecoration: 'none', color: '#232E56', fontWeight: '600' }}>
                        <span style={{ fontSize: '20px' }}>📄</span> {pdf.nombre_original}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* VIDEOS */}
              {videos.length > 0 && (
                <div style={{ marginBottom: '30px' }}>
                  <h4 style={{ color: '#64748b', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '1px' }}>Demos en Video</h4>
                  <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {videos.map(vid => (
                      <div key={vid.id_evidencia}>
                        <video controls style={{ width: '100%', maxWidth: '500px', borderRadius: '12px', background: '#000', display: 'block', margin: '0 auto 5px auto' }}>
                          <source src={`https://skillmatch-backend-duiu.onrender.com/uploads/${vid.ruta_archivo}`} type={vid.mime_type} />
                          Tu navegador no soporta videos.
                        </video>
                        <div style={{fontSize: '11px', color: '#64748b', textAlign: 'center'}}>{vid.nombre_original}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {evidencias.length === 0 && <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>El alumno aún no ha subido archivos de evidencia para este proyecto.</p>}
            </section>
          </div>

          {/* COLUMNA DERECHA: Ficha técnica / Sidebar */}
          <aside>
            <div style={{ background: '#fff', padding: '25px', borderRadius: '16px', border: '1px solid #e2e8f0', position: 'sticky', top: '100px' }}>
              <h3 style={{ fontSize: '18px', color: '#232E56', marginBottom: '20px' }}>Ficha Técnica</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ fontSize: '14px' }}>
                  <span style={{ color: '#64748b', display: 'block' }}>Ámbito de desarrollo:</span>
                  <strong>{proyecto.ambito_desarrollo || 'No definido'}</strong>
                </div>
                
                <div style={{ fontSize: '14px' }}>
                  <span style={{ color: '#64748b', display: 'block' }}>Nivel de Impacto:</span>
                  <strong>{proyecto.competencia_impacto === 'L' ? 'Local' : proyecto.competencia_impacto === 'R' ? 'Regional' : 'Nacional'}</strong>
                </div>

                <div style={{ fontSize: '14px' }}>
                  <span style={{ color: '#64748b', display: 'block' }}>Tecnologías:</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '5px' }}>
                    {proyecto.tecnologias?.split(',').map(t => (
                      <span key={t} style={{ background: '#f1f5f9', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>{t.trim()}</span>
                    ))}
                  </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '10px 0' }} />

                <div style={{ background: proyecto.es_innovacion ? '#f0fdf4' : '#fff7ed', padding: '10px', borderRadius: '8px', border: '1px solid', borderColor: proyecto.es_innovacion ? '#bbf7d0' : '#ffedd5' }}>
                  <span style={{ fontSize: '12px', fontWeight: 'bold', color: proyecto.es_innovacion ? '#166534' : '#9a3412' }}>
                    {proyecto.es_innovacion ? '💡 Proyecto de Innovación' : '📚 Proyecto Académico'}
                  </span>
                </div>

                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                  <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '10px' }}>¿Te interesa este talento?</p>
                  <button className="btn-comenzar" style={{ width: '100%', padding: '12px' }}>Contactar Estudiante</button>
                </div>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}