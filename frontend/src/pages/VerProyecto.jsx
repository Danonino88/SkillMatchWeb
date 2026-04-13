import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../CSS/LandingPage.css'; 

const API_BASE = 'https://skillmatch-backend-duiu.onrender.com/api';

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
  const [comentarios, setComentarios] = useState([]); 
  const [loading, setLoading] = useState(true);

  const [estrellasReview, setEstrellasReview] = useState(5);
  const [comentarioReview, setComentarioReview] = useState('');
  const [enviandoReview, setEnviandoReview] = useState(false);

  useEffect(() => {
    const cargarDetalle = async () => {
      try {
        const res = await fetch(`${API_BASE}/public/proyectos/${id}`);
        const data = await res.json();

        if (data.ok) {
          setProyecto(data.proyecto);
          setEvidencias(data.evidencias || []);
          setColaboradores(data.colaboradores || []); 
          setComentarios(data.comentarios || []); 
        }
      } catch (error) {
        console.error("Error al cargar detalle:", error);
      } finally {
        setLoading(false);
      }
    };
    cargarDetalle();
  }, [id]);

  const handleEnviarReseña = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    if (!token) {
      return alert("Debes iniciar sesión para comentar.");
    }

    setEnviandoReview(true);
    try {
      const res = await fetch(`${API_BASE}/public/proyectos/${id}/calificar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ estrellas: estrellasReview, comentario: comentarioReview })
      });
      const data = await res.json();
      
      if (data.ok) {
        alert("¡Tu reseña ha sido publicada!");
        window.location.reload(); 
      } else {
        alert(data.mensaje || "Error al guardar reseña");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión al enviar la reseña.");
    } finally {
      setEnviandoReview(false);
    }
  };

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
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
            <span className="uteq-chip" style={{ position: 'static' }}>✓ Proyecto UTEQ</span>
            <span style={{ background: '#e2e8f0', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
              {proyecto.area_trabajo}
            </span>
            <span style={{ background: '#fef3c7', color: '#d97706', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
              ⭐ {Number(proyecto.rating).toFixed(1)} ({proyecto.total_reviews} reseñas)
            </span>
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 42px)', color: '#232E56', fontWeight: '800', marginBottom: '10px', lineHeight: '1.2' }}>
            {proyecto.titulo}
          </h1>
          
          <div style={{ fontSize: '15px', color: '#64748b', padding: '15px', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'inline-block', maxWidth: '100%' }}>
            <div style={{wordBreak: 'break-word'}}>Realizado por: <strong style={{ color: '#232E56' }}>{proyecto.nombre} {proyecto.apellido}</strong> <span style={{ fontSize: '12px', background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: '10px', marginLeft: '5px' }}>Creador</span></div>
            
            {colaboradores.length > 0 && (
              <div style={{ marginTop: '12px', borderTop: '1px dashed #cbd5e1', paddingTop: '12px' }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#232E56', marginBottom: '8px' }}>Colaboradores del proyecto:</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {colaboradores.map((colab, idx) => (
                    <div key={idx} style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span>👥</span>
                      <strong style={{ color: '#334155' }}>{colab.nombre} {colab.apellido}</strong>
                      <span style={{ color: '#94a3b8', display: 'none' }}>•</span> {/* Ocultamos el puntito en pantallas chicas si hace falta, o lo dejamos y el wrap hace su magia */}
                      <a href={`mailto:${colab.correo}`} style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '13px', wordBreak: 'break-all' }}>{colab.correo}</a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* 🟢 CAMBIO PRINCIPAL AQUÍ: Usamos la clase ver-proyecto-grid 🟢 */}
        <div className="ver-proyecto-grid">
          <div>
            <div style={{ 
              borderRadius: '16px', 
              overflow: 'hidden', 
              boxShadow: '0 8px 20px rgba(0,0,0,0.1)', 
              background: '#fff', 
              width: '100%',
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

            <section className="detail-card" style={{ background: '#fff', padding: 'clamp(20px, 3vw, 30px)', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ borderBottom: '2px solid #232E56', display: 'inline-block', marginBottom: '20px' }}>Descripción del Proyecto</h3>
              <p style={{ lineHeight: '1.8', color: '#334155', fontSize: '15px', whiteSpace: 'pre-line' }}>{proyecto.descripcion}</p>

              <div className="ver-proyecto-info-grid">
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
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', textDecoration: 'none', color: '#232E56', fontWeight: '600', wordBreak: 'break-word' }}>
                        <span style={{ fontSize: '20px', flexShrink: 0 }}>📄</span> {pdf.nombre_original}
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
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px', textAlign: 'center', wordBreak: 'break-word' }}>
                          {vid.nombre_original}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {evidencias.length === 0 && <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>El equipo aún no ha subido archivos de evidencia para este proyecto.</p>}
            </section>

            <section style={{ marginTop: '50px', borderTop: '2px solid #e2e8f0', paddingTop: '40px' }}>
              <h2 style={{ color: '#232E56', marginBottom: '25px' }}>Reseñas y Comentarios</h2>

              {localStorage.getItem('token') ? (
                <div style={{ background: '#f8fafc', padding: 'clamp(15px, 3vw, 25px)', borderRadius: '16px', border: '1px solid #cbd5e1', marginBottom: '40px' }}>
                  <h4 style={{ marginBottom: '15px', color: '#1e293b', fontSize: '16px' }}>Deja tu opinión sobre este proyecto</h4>
                  <form onSubmit={handleEnviarReseña} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '14px', color: '#475569', fontWeight: 'bold' }}>Calificación:</label>
                      <select 
                        value={estrellasReview} 
                        onChange={(e) => setEstrellasReview(Number(e.target.value))} 
                        style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: 'white', fontSize: '14px', width: '100%' }}
                      >
                        <option value={5}>⭐⭐⭐⭐⭐ (5/5 Excelente)</option>
                        <option value={4}>⭐⭐⭐⭐ (4/5 Muy bueno)</option>
                        <option value={3}>⭐⭐⭐ (3/5 Bueno)</option>
                        <option value={2}>⭐⭐ (2/5 Regular)</option>
                        <option value={1}>⭐ (1/5 Deficiente)</option>
                      </select>
                    </div>

                    <textarea
                      placeholder="Escribe aquí tu comentario, sugerencia o feedback para el equipo..."
                      value={comentarioReview}
                      onChange={(e) => setComentarioReview(e.target.value)}
                      style={{ 
                        width: '100%', minHeight: '100px', padding: '15px', 
                        borderRadius: '12px', border: '1px solid #cbd5e1', 
                        resize: 'vertical', outline: 'none', fontFamily: 'inherit'
                      }}
                      required
                    ></textarea>

                    <button 
                      type="submit" 
                      disabled={enviandoReview} 
                      style={{ 
                        alignSelf: 'flex-start', background: '#2563eb', color: 'white', 
                        padding: '12px 24px', borderRadius: '8px', border: 'none', 
                        fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s', width: '100%' 
                      }}
                    >
                      {enviandoReview ? 'Publicando...' : 'Publicar reseña'}
                    </button>
                  </form>
                </div>
              ) : (
                <div style={{ background: '#f1f5f9', padding: '30px', borderRadius: '16px', textAlign: 'center', marginBottom: '40px', border: '2px dashed #cbd5e1' }}>
                  <div style={{ fontSize: '30px', marginBottom: '10px' }}>💬</div>
                  <h4 style={{ color: '#1e293b', marginBottom: '8px' }}>¿Qué te pareció este proyecto?</h4>
                  <p style={{ color: '#64748b', marginBottom: '20px', fontSize: '14px' }}>Inicia sesión o crea una cuenta rápida para dejar tu comentario.</p>
                  <button 
                    onClick={() => navigate('/login')} 
                    style={{ background: '#232E56', color: 'white', padding: '10px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Iniciar sesión para comentar
                  </button>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {comentarios.length > 0 ? (
                  comentarios.map((c, i) => (
                    <div key={i} style={{ background: 'white', padding: 'clamp(15px, 3vw, 25px)', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '35px', height: '35px', background: '#e2e8f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#475569', flexShrink: 0 }}>
                            {c.nombre.charAt(0)}{c.apellido.charAt(0)}
                          </div>
                          <div>
                            <strong style={{ color: '#232E56', display: 'block' }}>{c.nombre} {c.apellido}</strong>
                            <div style={{ fontSize: '12px', color: '#94a3b8' }}>{new Date(c.fecha_registro).toLocaleDateString('es-MX')}</div>
                          </div>
                        </div>
                        <span style={{ color: '#f59e0b', fontSize: '16px', letterSpacing: '2px', whiteSpace: 'nowrap' }}>
                          {'★'.repeat(c.estrellas)}{'☆'.repeat(5 - c.estrellas)}
                        </span>
                      </div>
                      <p style={{ color: '#334155', fontSize: '14px', lineHeight: '1.6', background: '#f8fafc', padding: '15px', borderRadius: '8px', wordBreak: 'break-word' }}>
                        {c.comentario || <span style={{ fontStyle: 'italic', color: '#94a3b8' }}>El usuario dejó una calificación sin comentario de texto.</span>}
                      </p>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                    <div style={{ fontSize: '40px', marginBottom: '10px' }}>📭</div>
                    <p style={{ fontStyle: 'italic' }}>Aún no hay reseñas. ¡Sé el primero en dar tu opinión!</p>
                  </div>
                )}
              </div>
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