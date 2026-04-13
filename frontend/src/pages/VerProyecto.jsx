import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../CSS/LandingPage.css'; 

const API_BASE = 'https://skillmatch-backend-duiu.onrender.com/api';

// 🟢 NUEVA FUNCIÓN: Resuelve si el archivo es local (viejo) o viene de Cloudinary (nuevo)
const getFileSource = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `https://skillmatch-backend-duiu.onrender.com/uploads/${path}`;
};

export default function VerProyecto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proyecto, setProyecto] = useState(null);
  const [evidencias, setEvidencias] = useState([]);
  const [colaboradores, setColaboradores] = useState([]); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDetalle = async () => {
      try {
        const res = await fetch(`${API_BASE}/public/proyectos/${id}`);
        const data = await res.json();

        if (data.ok) {
          setProyecto(data.proyecto);
          setEvidencias(data.evidencias || []);
          setColaboradores(data.colaboradores || []); 
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

  const imagenes = evidencias.filter(e => e.mime_type?.includes('image'));
  const pdfs = evidencias.filter(e => e.mime_type?.includes('pdf') || e.nombre_original?.endsWith('.pdf'));
  const videos = evidencias.filter(e => e.mime_type?.includes('video'));

  return (
    <div className="landing-zoom" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <nav className="nav" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="nav-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <div className="nav-logo-icon">⚡</div>
          <div className="nav-brand-text">Skill<span>Match</span></div>
        </div>
        <button className="nav-link" onClick={() => navigate(-1)}>← Volver</button>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 20px' }}>
        <header style={{ marginBottom: '30px' }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <span className="uteq-chip" style={{ position: 'static' }}>✓ Proyecto UTEQ</span>
            <span style={{ background: '#e2e8f0', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
              {proyecto.area_trabajo}
            </span>
          </div>
          <h1 style={{ fontSize: '42px', color: '#232E56', fontWeight: '800', marginBottom: '10px' }}>{proyecto.titulo}</h1>
          
          <div style={{ fontSize: '18px', color: '#64748b', padding: '15px', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'inline-block' }}>
            <div>Realizado por: <strong style={{ color: '#232E56' }}>{proyecto.nombre} {proyecto.apellido}</strong> <span style={{ fontSize: '12px', background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: '10px', marginLeft: '5px' }}>Creador</span></div>
            
            {colaboradores.length > 0 && (
              <div style={{ marginTop: '12px', borderTop: '1px dashed #cbd5e1', paddingTop: '12px' }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#232E56', marginBottom: '8px' }}>Colaboradores del proyecto:</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {colaboradores.map((colab, idx) => (
                    <div key={idx} style={{ fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>👥</span>
                      <strong style={{ color: '#334155' }}>{colab.nombre} {colab.apellido}</strong>
                      <span style={{ color: '#94a3b8' }}>•</span>
                      <a href={`mailto:${colab.correo}`} style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '14px' }}>{colab.correo}</a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px', alignItems: 'start' }}>
          <div>
            <div style={{ 
              borderRadius: '16px', 
              overflow: 'hidden', 
              boxShadow: '0 8px 20px rgba(0,0,0,0.1)', 
              background: '#fff', 
              maxWidth: '550px',
              margin: '0 0 30px 0' 
            }}>
              {proyecto.img_principal ? (
                <img 
                  src={getFileSource(proyecto.img_principal)} 
                  alt={proyecto.titulo}
                  style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', display: 'block' }}
                />
              ) : (
                <div style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#cbd5e1', fontSize: '60px' }}>💻</div>
              )}
            </div>

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

            <section style={{ marginTop: '40px' }}>
              <h2 style={{ color: '#232E56', marginBottom: '20px' }}>Evidencias y Entregables</h2>
              
              {imagenes.length > 0 && (
                <div style={{ marginBottom: '30px' }}>
                  <h4 style={{ color: '#64748b', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '1px' }}>Galería de Imágenes</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '15px', marginTop: '10px' }}>
                    {imagenes.map(img => (
                      <a key={img.id_evidencia} href={getFileSource(img.ruta_archivo)} target="_blank" rel="noreferrer" style={{ display: 'block', aspectRatio: '1 / 1' }}>
                        <img 
                          src={getFileSource(img.ruta_archivo)} 
                          alt="evidencia" 
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover', 
                            borderRadius: '8px', 
                            border: '1px solid #e2e8f0', 
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                            transition: 'transform 0.2s ease',
                            cursor: 'pointer'
                          }} 
                          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {pdfs.length > 0 && (
                <div style={{ marginBottom: '30px' }}>
                  <h4 style={{ color: '#64748b', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '1px' }}>Documentación PDF</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                    {pdfs.map(pdf => (
                      <a key={pdf.id_evidencia} href={getFileSource(pdf.ruta_archivo)} target="_blank" rel="noreferrer" 
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', textDecoration: 'none', color: '#232E56', fontWeight: '600' }}>
                        <span style={{ fontSize: '20px' }}>📄</span> {pdf.nombre_original}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {videos.length > 0 && (
                <div style={{ marginBottom: '30px' }}>
                  <h4 style={{ color: '#64748b', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '1px' }}>Demos en Video</h4>
                  <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '25px' }}>
                    {videos.map(vid => (
                      <div key={vid.id_evidencia} style={{ width: '100%', position: 'relative' }}>
                        <div style={{ width: '100%', paddingTop: '56.25%', position: 'relative', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', background: '#000' }}>
                          <video 
                            controls 
                            style={{ 
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%', 
                              height: '100%',
                              objectFit: 'contain' 
                            }}
                          >
                            <source src={getFileSource(vid.ruta_archivo)} type={vid.mime_type} />
                            Tu navegador no soporta videos.
                          </video>
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px', textAlign: 'center' }}>
                          {vid.nombre_original}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {evidencias.length === 0 && <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>El equipo aún no ha subido archivos de evidencia para este proyecto.</p>}
            </section>
          </div>

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
                    {proyecto.tecnologias?.split(',').map(t => {
                      const cleanTech = t.replace(/[\[\]"']/g, '').trim();
                      if(!cleanTech) return null;
                      return (
                        <span key={t} style={{ background: '#f1f5f9', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>{cleanTech}</span>
                      )
                    })}
                  </div>
                </div>
                <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '10px 0' }} />
                <div style={{ background: proyecto.es_innovacion ? '#f0fdf4' : '#fff7ed', padding: '10px', borderRadius: '8px', border: '1px solid', borderColor: proyecto.es_innovacion ? '#bbf7d0' : '#ffedd5' }}>
                  <span style={{ fontSize: '12px', fontWeight: 'bold', color: proyecto.es_innovacion ? '#166534' : '#9a3412' }}>
                    {proyecto.es_innovacion ? '💡 Proyecto de Innovación' : '📚 Proyecto Académico'}
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}