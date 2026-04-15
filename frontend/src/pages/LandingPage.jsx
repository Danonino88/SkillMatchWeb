import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react'; 
import '../CSS/LandingPage.css'; 

const API_BASE = 'https://skillmatch-backend-duiu.onrender.com/api';

const testimonios = [
  { text: "SkillMatch me ayudó a conseguir mi primer proyecto real antes de graduarme. La validación de la UTEQ le dio mucha credibilidad a mi portafolio.", name: "Andrea López", role: "Estudiante de ISC, UTEQ", init: "AL" },
  { text: "Encontramos talento increíble para nuestros proyectos de desarrollo. Los trabajos están bien documentados y el nivel técnico nos sorprendió.", name: "Carlos Mendoza", role: "CTO, TechSolutions MX", init: "CM" },
  { text: "La plataforma es intuitiva y el sistema de ranking es muy transparente. Nuestros alumnos están más motivados que nunca para publicar sus proyectos.", name: "Dra. Ramírez", role: "Docente investigadora, UTEQ", init: "DR" },
];

const aliados = [
  { icon: "🎓", name: "UTEQ" },
  { icon: "💼", name: "TechSolutions MX" },
  { icon: "🌐", name: "Innovatech" },
  { icon: "🎓", name: "UTEG" },
  { icon: "⭐", name: "StartupLab QRO" },
];

const getFileSource = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `https://skillmatch-backend-duiu.onrender.com/uploads/${path}`;
};

// Helper para sacar las iniciales del usuario
const getInitials = (nombre, apellido) => {
  if (!nombre) return 'U';
  return (nombre[0] + (apellido ? apellido[0] : '')).toUpperCase();
};

function StarRating({ rating, max = 5 }) {
  return (
    <span className="rating-stars">
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < Math.round(rating) ? "rating-star-filled" : "rating-star-empty"}>
          ★
        </span>
      ))}
    </span>
  );
}

function InteractiveStars({ value, onRate, max = 5 }) {
  return (
    <div className="stars-clickable">
      {Array.from({ length: max }, (_, i) => {
        const starValue = i + 1;
        return (
          <button
            key={starValue}
            type="button"
            className="star-btn"
            onClick={() => onRate(starValue)}
            aria-label={`Calificar con ${starValue} estrellas`}
          >
            <span className={starValue <= value ? "rating-star-filled" : "rating-star-empty"}>
              ★
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();

  // 🟢 Estados Reactivos para la autenticación y el menú 🟢
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState({});
  const [showUserMenu, setShowUserMenu] = useState(false); // Controla el modal del avatar

  const [proyectos, setProyectos] = useState([]);
  const [loadingProyectos, setLoadingProyectos] = useState(true);
  const [proyectosCalificados, setProyectosCalificados] = useState([]);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoginView, setIsLoginView] = useState(false); 
  const [authForm, setAuthForm] = useState({ nombre: '', apellido: '', correo: '', password: '' });
  const [pendingRating, setPendingRating] = useState(null); 
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const whatsappUrl = "https://wa.me/525661900743?text=Hola,%20tengo%20una%20duda%20sobre%20SkillMatch";

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      setIsAuthenticated(!!token);
      if (token) {
        setUserData(JSON.parse(localStorage.getItem('user') || '{}'));
      }
    };

    checkAuth(); 
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  useEffect(() => {
    const cargarProyectos = async () => {
      try {
        const res = await fetch(`${API_BASE}/public/proyectos`);
        const data = await res.json();

        if (data.ok) {
          setProyectos(data.proyectos || []);
        }
      } catch (error) {
        console.error('Error al cargar proyectos públicos:', error);
      } finally {
        setLoadingProyectos(false);
      }
    };

    cargarProyectos();
  }, []);

  useEffect(() => {
    setProyectosCalificados(
      proyectos.map((p) => ({
        ...p,
        userRating: Math.round(p.rating || 0), 
      }))
    );
  }, [proyectos]);

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setShowUserMenu(false);
    setUserData({});
  };

  const handleRate = async (index, id_proyecto, estrellas) => {
    const token = localStorage.getItem('token');

    if (!token) {
      setPendingRating({ index, id_proyecto, estrellas });
      setShowAuthModal(true);
      return;
    }
    enviarCalificacionBackend(id_proyecto, estrellas, token, index);
  };

  const enviarCalificacionBackend = async (id_proyecto, estrellas, token, index) => {
    try {
      const res = await fetch(`${API_BASE}/public/proyectos/${id_proyecto}/calificar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ estrellas, comentario: '' }) 
      });
      const data = await res.json();

      if (data.ok) {
        setProyectosCalificados((prev) =>
          prev.map((p, i) => (i === index ? { ...p, userRating: estrellas } : p))
        );
        alert("¡Tu calificación ha sido registrada! ⭐");
      } else {
        alert(data.mensaje || "Hubo un error al calificar.");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión al calificar.");
    }
  };

  const submitAuthModal = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    const url = isLoginView ? `${API_BASE}/auth/login` : `${API_BASE}/auth/register`;
    
    const bodyData = isLoginView 
      ? { correo: authForm.correo, password: authForm.password }
      : { 
          nombre: authForm.nombre, 
          apellido: authForm.apellido, 
          correo: authForm.correo, 
          password: authForm.password,
          id_rol: 5 
        };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });
      const data = await res.json();

      if (data.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.usuario));
        
        setIsAuthenticated(true); 
        setUserData(data.usuario);
        setShowAuthModal(false); 

        if (pendingRating) {
          await enviarCalificacionBackend(pendingRating.id_proyecto, pendingRating.estrellas, data.token, pendingRating.index);
          setPendingRating(null); 
        }
      } else {
        setAuthError(data.mensaje || 'Ocurrió un error. Inténtalo de nuevo.');
      }
    } catch (error) {
      setAuthError('Error de conexión con el servidor.');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <>
      <div className="landing-zoom">
        <nav className="nav">
          <div className="nav-brand">
            <div className="nav-logo-icon">⚡</div>
            <div className="nav-brand-text">Skill<span>Match</span></div>
          </div>

          <div className="nav-actions">
            <div className="nav-links">
              <button className="nav-link" onClick={() => document.getElementById("chatbot")?.scrollIntoView({ behavior: "smooth" })}>
                Chatbot
              </button>
              <button className="nav-link" onClick={() => document.getElementById("proyectos")?.scrollIntoView({ behavior: "smooth" })}>
                Proyectos
              </button>
            </div>

            <div className="nav-right">
              {isAuthenticated ? (
                <div style={{ position: 'relative' }}>
                  {/* Avatar Clickable */}
                  <button 
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    style={{ 
                      width: '42px', height: '42px', borderRadius: '50%', 
                      backgroundColor: '#244E7C', color: 'white', border: '2px solid #e2e8f0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', transition: 'transform 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    {getInitials(userData.nombre, userData.apellido)}
                  </button>

                  {/* 🟢 Menú desplegable flotante 🟢 */}
                  {showUserMenu && (
                    <>
                      {/* Fondo invisible para cerrar el menú al hacer clic fuera */}
                      <div 
                        style={{ position: 'fixed', inset: 0, zIndex: 98 }} 
                        onClick={() => setShowUserMenu(false)} 
                      />
                      
                      <div style={{ 
                        position: 'absolute', top: '55px', right: '0', background: 'white', 
                        borderRadius: '12px', padding: '16px', minWidth: '220px', 
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0',
                        zIndex: 99, animation: 'fadeIn 0.2s ease-in-out'
                      }}>
                        <div style={{ marginBottom: '12px' }}>
                          <strong style={{ display: 'block', color: '#232E56', fontSize: '15px' }}>
                            {userData.nombre} {userData.apellido}
                          </strong>
                          <span style={{ fontSize: '13px', color: '#64748b' }}>{userData.correo}</span>
                        </div>
                        
                        <div style={{ height: '1px', background: '#e2e8f0', margin: '12px 0' }}></div>

                        <button 
                          onClick={cerrarSesion}
                          style={{ 
                            width: '100%', textAlign: 'left', background: 'none', border: 'none', 
                            padding: '8px 0', fontSize: '14px', color: '#ef4444', fontWeight: '600', 
                            cursor: 'pointer'
                          }}
                        >
                          Cerrar sesión
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <>
                  <button className="nav-link" onClick={() => navigate("/registro")}>Registrarse</button>
                  <button className="nav-link" onClick={() => navigate("/login")}>Iniciar sesión</button>
                </>
              )}
            </div>
          </div>
        </nav>

        <section className="hero" id="hero">
          <div className="hero-inner">
            <div className="hero-left">
              <div className="hero-eyebrow">
                <span className="hero-eyebrow-icon">⚡</span>
                PLATAFORMA DE TALENTO UNIVERSITARIO
              </div>
              <h1 className="hero-title">
                Bienvenido a <span className="hero-title-accent">SkillMatch</span>
              </h1>
              <p className="hero-desc">
                Conectamos a estudiantes talentosos de la UTEQ con empresas que buscan proyectos innovadores. Descubre, valida y potencia el talento del futuro.
              </p>
              <button className="btn-comenzar" onClick={() => navigate("/registro")}>→ Comenzar</button>
            </div>
          </div>
        </section>

        <section className="chatbot-section" id="chatbot">
          <div className="chatbot-inner">
            <div className="chatbot-left">
              <div className="chatbot-badge">💬 NUEVO</div>
              <h2 className="chatbot-title">¡Puedes usar el Chatbot!</h2>
              <p className="chatbot-desc">
                Nuestro asistente inteligente está disponible 24/7 para ayudarte a consultar horarios y fechas de estadía, encontrar proyectos, resolver dudas sobre la plataforma y conectarte con las mejores oportunidades de la UTEQ.
              </p>
              <div className="chatbot-features">
                <div className="chatbot-feat"><span className="chatbot-feat-icon">⏰</span> Disponible 24/7</div>
                <div className="chatbot-feat"><span className="chatbot-feat-icon">⚡</span> Respuestas instantáneas</div>
                <div className="chatbot-feat"><span className="chatbot-feat-icon">✓</span> Validado por UTEQ</div>
              </div>
            </div>
            <div className="chatbot-right">
              <div style={{ background: 'white', padding: '12px', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <QRCodeSVG
                  value={whatsappUrl}
                  size={140}
                  level={"H"}
                  fgColor="#232E56"
                />
              </div>
              <div className="qr-label">ESCANEA EL QR</div>
              <div className="qr-sub">Accede al chatbot</div>
              <button className="btn-chatbot" onClick={() => window.open(whatsappUrl, '_blank')}>
                Abrir chatbot →
              </button>
            </div>
          </div>
        </section>

        <section className="about-section" id="about">
          <div className="about-inner">
            <div className="about-left">
              <div className="section-label">⊙ QUIÉNES SOMOS</div>
              <h2 className="about-title">Impulsamos el talento universitario</h2>
              <p className="about-desc">
                SkillMatch es la plataforma oficial de la UTEQ que conecta a estudiantes con proyectos reales, validados por docentes y reconocidos por empresas del sector tecnológico.
              </p>
              <p className="about-desc">
                Creemos que el talento no espera a graduarse. Aquí, cada proyecto cuenta.
              </p>
              <div className="about-items">
                {[
                  { icon: "✓", title: "Proyectos validados", desc: "Cada trabajo es revisado y certificado por la UTEQ" },
                  { icon: "👥", title: "Red de colaboradores", desc: "Empresas y universidades que confían en nuestro ecosistema" },
                  { icon: "⭐", title: "Ranking transparente", desc: "Sistema de calificación honesto y basado en méritos" },
                ].map(item => (
                  <div className="about-item" key={item.title}>
                    <div className="about-item-icon">{item.icon}</div>
                    <div>
                      <div className="about-item-title">{item.title}</div>
                      <div className="about-item-desc">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="about-right">
              <svg width="160" height="130" viewBox="0 0 160 130" style={{ position: "relative", zIndex: 2 }}>
                <g transform="translate(80,20)">
                  <polygon points="-55,0 0,-18 55,0 0,18" fill="none" stroke="#244E7C" strokeWidth="3" strokeLinejoin="round" />
                </g>
                <g transform="translate(80,55)">
                  <polygon points="-55,0 0,-18 55,0 0,18" fill="none" stroke="#244E7C" strokeWidth="3" strokeLinejoin="round" />
                </g>
                <g transform="translate(80,90)">
                  <polygon points="-55,0 0,-18 55,0 0,18" fill="none" stroke="#244E7C" strokeWidth="3" strokeLinejoin="round" />
                </g>
              </svg>
            </div>
          </div>
        </section>

        <section className="projects-section" id="proyectos">
          <div className="projects-inner">
            <div className="section-label">📁 PROYECTOS ESCOLARES</div>
            <h2 style={{ fontSize: "28px", fontWeight: "800", color: "var(--text)", letterSpacing: "-0.5px" }}>
              Proyectos Destacados
            </h2>

            <div className="projects-grid">
              {loadingProyectos ? (
                <div className="loading-projects">Cargando proyectos...</div>
              ) : proyectosCalificados.length === 0 ? (
                <div className="loading-projects">Aún no hay proyectos publicados.</div>
              ) : (
                proyectosCalificados.map((p, i) => (
                  <div className="project-card fade-in" key={`${p.id_proyecto}-${i}`} style={{ animationDelay: `${i * 0.1}s` }}>
                    <div className={`project-thumb ${p.img_principal ? '' : `project-thumb-${p.thumb}`}`}>
                      {p.img_principal ? (
                        <img
                          src={getFileSource(p.img_principal)}
                          alt={p.title}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      ) : (
                        <span className="project-thumb-icon">{p.icon}</span>
                      )}
                      <span className="uteq-chip">✓ UTEQ</span>
                    </div>

                    <div className="project-body">
                      <div className="project-title">{p.title}</div>
                      <div className="project-desc">{p.desc}</div>
                      <div className="project-author">Realizado por: {p.author}</div>

                      <div className="project-tags">
                        {p.tags.map((t) => (
                          <span className="project-tag" key={t}>{t}</span>
                        ))}
                      </div>

                      <button
                        className="btn-ver-proyecto"
                        onClick={() => navigate(`/proyecto/${p.id_proyecto}`)}
                        style={{
                          width: '100%',
                          padding: '10px',
                          marginTop: '10px',
                          marginBottom: '15px',
                          backgroundColor: '#232E56',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'background 0.2s'
                        }}
                      >
                        Ver proyecto →
                      </button>

                      <div className="project-rating">
                        <div className="rating-left">
                          <StarRating rating={p.rating} />
                          <span className="rating-num" style={{ marginLeft: '8px' }}>
                            {Number(p.rating).toFixed(1)} <span style={{fontSize: '10px', color: '#94a3b8'}}>({p.total_reviews})</span>
                          </span>
                        </div>

                        <InteractiveStars
                          value={p.userRating}
                          onRate={(stars) => handleRate(i, p.id_proyecto, stars)}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="testimonios-section" id="testimonios">
          <div className="testimonios-inner">
            <div className="section-label">💬 TESTIMONIOS</div>
            <h2 style={{ fontSize: "28px", fontWeight: "800", color: "var(--text)", letterSpacing: "-0.5px" }}>
              Lo que dicen de nosotros
            </h2>
            <div className="testimonios-grid">
              {testimonios.map(t => (
                <div className="testimonio-card" key={t.name}>
                  <span className="quote-mark">"</span>
                  <p className="testimonio-text">{t.text}</p>
                  <div className="testimonio-author">
                    <div className="author-avatar">{t.init}</div>
                    <div>
                      <div className="author-name">{t.name}</div>
                      <div className="author-role">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="aliados-bar">
          <div className="aliados-label">EMPRESAS QUE CONFÍAN EN SKILLMATCH</div>
          <div className="aliados-list">
            {aliados.map(a => (
              <div className="aliado-chip" key={a.name}>
                <span>{a.icon}</span> {a.name}
              </div>
            ))}
          </div>
        </div>

        <footer className="footer">
          <div className="footer-inner">
            <div>
              <div className="footer-brand">Skill<span>Match</span></div>
              <div className="footer-tagline">Plataforma de vinculación UTEQ · Querétaro, México</div>
            </div>
            <div className="footer-links">
              {["Inicio", "Chatbot", "Estudiantes", "Empresas", "Contacto"].map(l => (
                <span className="footer-link" key={l}>{l}</span>
              ))}
            </div>
            <div className="footer-copy">© 2026 SkillMatch — UTEQ. Todos los derechos reservados.</div>
          </div>
        </footer>
      </div>

      {/* 🟢 MODAL DE REGISTRO RÁPIDO / LOGIN 🟢 */}
      {showAuthModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(15, 23, 42, 0.7)', zIndex: 9999,
          display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px'
        }}>
          <div style={{
            background: 'white', padding: '30px', borderRadius: '16px', width: '100%', maxWidth: '400px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            position: 'relative'
          }}>
            <button 
              onClick={() => { setShowAuthModal(false); setPendingRating(null); }}
              style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}
            >
              ✕
            </button>
            
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '30px', marginBottom: '10px' }}>⭐</div>
              <h2 style={{ color: '#0f172a', fontSize: '20px', fontWeight: '800' }}>¡Únete para calificar!</h2>
              <p style={{ color: '#64748b', fontSize: '14px', marginTop: '5px' }}>Necesitas una cuenta básica para dejar tu reseña y apoyar este proyecto.</p>
            </div>

            <div style={{ display: 'flex', borderBottom: '2px solid #e2e8f0', marginBottom: '20px' }}>
              <button 
                onClick={() => { setIsLoginView(false); setAuthError(''); }}
                style={{ flex: 1, padding: '10px', background: 'none', border: 'none', borderBottom: !isLoginView ? '2px solid #2563eb' : 'none', color: !isLoginView ? '#2563eb' : '#64748b', fontWeight: 'bold', cursor: 'pointer', transform: 'translateY(2px)' }}
              >
                Crear Cuenta
              </button>
              <button 
                onClick={() => { setIsLoginView(true); setAuthError(''); }}
                style={{ flex: 1, padding: '10px', background: 'none', border: 'none', borderBottom: isLoginView ? '2px solid #2563eb' : 'none', color: isLoginView ? '#2563eb' : '#64748b', fontWeight: 'bold', cursor: 'pointer', transform: 'translateY(2px)' }}
              >
                Iniciar Sesión
              </button>
            </div>

            {authError && (
              <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '10px', borderRadius: '8px', fontSize: '13px', marginBottom: '15px', border: '1px solid #fecaca' }}>
                {authError}
              </div>
            )}

            <form onSubmit={submitAuthModal} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {!isLoginView && (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input type="text" placeholder="Nombre" required className="form-input" style={{ width: '100%' }} value={authForm.nombre} onChange={(e) => setAuthForm({...authForm, nombre: e.target.value})} />
                  <input type="text" placeholder="Apellidos" required className="form-input" style={{ width: '100%' }} value={authForm.apellido} onChange={(e) => setAuthForm({...authForm, apellido: e.target.value})} />
                </div>
              )}
              <input type="email" placeholder="Correo electrónico" required className="form-input" value={authForm.correo} onChange={(e) => setAuthForm({...authForm, correo: e.target.value})} />
              <input type="password" placeholder="Contraseña" required minLength="6" className="form-input" value={authForm.password} onChange={(e) => setAuthForm({...authForm, password: e.target.value})} />
              
              <button type="submit" disabled={authLoading} style={{ background: '#2563eb', color: 'white', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', marginTop: '5px' }}>
                {authLoading ? 'Procesando...' : (isLoginView ? 'Entrar y Calificar' : 'Registrarme y Calificar')}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}