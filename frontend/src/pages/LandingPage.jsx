import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../CSS/LandingPage.css'; // 🟢 Importamos los estilos desde la carpeta CSS

const API_BASE = 'http://localhost:3000/api';

const QR_PATTERN = [
  [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0],
  [0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1],
  [1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0],
  [1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 0, 0],
  [1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0],
  [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 1, 0, 1, 1, 0, 1, 0],
  [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 0],
];

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

  const [proyectos, setProyectos] = useState([]);
  const [loadingProyectos, setLoadingProyectos] = useState(true);
  const [proyectosCalificados, setProyectosCalificados] = useState([]);

  useEffect(() => {
    const cargarProyectos = async () => {
      try {
        const res = await fetch(`${API_BASE}/public/proyectos`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.mensaje || 'No se pudieron cargar los proyectos');
        }

        setProyectos(data.proyectos || []);
      } catch (error) {
        console.error('Error al cargar proyectos públicos:', error);
        setProyectos([]);
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
        userRating: Math.round(p.rating || 4),
      }))
    );
  }, [proyectos]);

  const calificarProyecto = (index, estrellas) => {
    setProyectosCalificados((prev) =>
      prev.map((p, i) =>
        i === index ? { ...p, userRating: estrellas } : p
      )
    );
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
              <button className="nav-link" onClick={() => navigate("/registro")}>Registrarse</button>
              <button className="nav-link" onClick={() => navigate("/login")}>Iniciar sesión</button>
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
            {/* 🔴 Cuadros blancos eliminados */}
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
              <svg width="140" height="140" viewBox="0 0 190 190" style={{ borderRadius: "8px", background: "white", padding: "6px" }}>
                {QR_PATTERN.map((row, ri) =>
                  row.map((cell, ci) =>
                    cell ? (
                      <rect key={`${ri}-${ci}`} x={ci * 10} y={ri * 10} width={9} height={9} rx={1} fill="#232E56" />
                    ) : null
                  )
                )}
              </svg>
              <div className="qr-label">ESCANEA EL QR</div>
              <div className="qr-sub">Accede al chatbot</div>
              <button className="btn-chatbot">Abrir chatbot →</button>
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
              Proyectos
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
                          src={`http://localhost:3000/uploads/${p.img_principal}`}
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

                      <div className="project-rating">
                        <div className="rating-left">
                          <StarRating rating={p.rating} />
                          <span className="rating-num">{Number(p.rating).toFixed(1)}</span>
                        </div>

                        <InteractiveStars
                          value={p.userRating}
                          onRate={(stars) => calificarProyecto(i, stars)}
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
    </>
  );
}