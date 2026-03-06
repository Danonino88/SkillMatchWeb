import { useNavigate } from 'react-router-dom';


const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');

  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

  html, body, #root {
    margin: 0; padding: 0; width: 100%; height: 100%;
    overflow-x: hidden;
  }

  :root {
    --primary: #244E7C;
    --primary-dark: #232E56;
    --primary-light: #3a6fa8;
    --bg: #f4f6fa;
    --surface: #ffffff;
    --border: #dde2ee;
    --text: #1a2340;
    --muted: #71706F;
    --font: 'Montserrat', sans-serif;
    --content-max: 1180px;
  }

  html { scroll-behavior: smooth; }
  body { font-family: var(--font); background: var(--surface); color: var(--text); overflow-x: hidden; }

  /* Zoom visual para que toda la pantalla se perciba mas grande */
  .landing-zoom {
    zoom: 1.3;
  }

  /* ── NAV ── */
  .nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
    background: var(--primary-dark);
    padding: 0 clamp(14px, 3vw, 40px);
    display: flex; align-items: center; justify-content: space-between;
    height: 64px;
    border-bottom: 2px solid rgba(126,184,247,0.15);
    box-shadow: 0 2px 20px rgba(0,0,0,0.25);
  }

  .nav-brand {
    display: flex; align-items: center; gap: 10px;
    text-decoration: none; flex-shrink: 0;
  }

  .nav-logo-icon {
    width: 38px; height: 38px; border-radius: 10px;
    background: linear-gradient(135deg, var(--primary), #3a6fa8);
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  }

  .nav-brand-text {
    font-size: 20px; font-weight: 900; color: white; letter-spacing: -0.5px;
  }
  .nav-brand-text span { color: #7eb8f7; }

  .nav-links {
    display: flex;
    align-items: center;
    gap: 0;
  }

  .nav-link {
    padding: 8px 12px; border-radius: 8px;
    font-size: 13.5px; font-weight: 600; color: rgba(255,255,255,0.7);
    cursor: pointer; transition: all 0.15s; border: none; background: transparent;
    font-family: var(--font); white-space: nowrap;
  }
  .nav-link:hover { color: white; background: rgba(255,255,255,0.08); }

  .nav-link-highlight { display: none; }

  .nav-right { display: flex; align-items: center; gap: 0; flex-shrink: 0; }

  .nav-actions {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 0;
  }

  .btn-nav-login { display: none; }
  .btn-nav-register { display: none; }

  /* ── HERO ── */
  .hero {
    width: 100%;
    min-height: auto;
    background: linear-gradient(135deg, var(--primary-dark) 0%, #1e3f6e 50%, #244E7C 100%);
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 78px clamp(14px, 3vw, 40px) 8px;
    position: relative;
    overflow: hidden;
    box-sizing: border-box;
  }

  .hero::before {
    content: '';
    position: absolute; inset: 0;
    background-image: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
    background-size: 36px 36px;
    pointer-events: none;
  }

  .hero-inner {
    width: 100%;
    max-width: var(--content-max);
    margin: 0 auto;
    display: grid;
    grid-template-columns: minmax(0, 1fr) 340px;
    align-items: center;
    gap: clamp(16px, 2.4vw, 28px);
    position: relative;
    z-index: 2;
  }

  .hero-left { max-width: 580px; animation: fadeUp 0.7s ease both; }

  .hero-eyebrow {
    display: flex; align-items: center; gap: 8px;
    font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.6);
    text-transform: uppercase; letter-spacing: 1.6px; margin-bottom: 12px;
  }
  .hero-eyebrow-icon { color: #7eb8f7; }

  .hero-title {
    font-size: clamp(38px, 5vw, 54px);
    font-weight: 900;
    color: white;
    line-height: 1.02;
    letter-spacing: -1.3px;
    margin-bottom: 10px;
  }
  .hero-title-accent { color: #7eb8f7; }

  .hero-desc {
    font-size: 14px;
    color: rgba(255,255,255,0.72);
    line-height: 1.55;
    margin-bottom: 16px;
    font-weight: 400;
    max-width: 560px;
  }

  .btn-comenzar {
    display: inline-flex; align-items: center; gap: 10px;
    padding: 11px 24px; border-radius: 10px;
    font-size: 14px; font-weight: 700; font-family: var(--font);
    background: white; color: var(--primary); border: none; cursor: pointer;
    transition: all 0.2s; box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  }
  .btn-comenzar:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,0,0,0.2); }

  .hero-right {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
    max-width: 320px;
    animation: fadeUp 0.7s ease 0.15s both;
  }

  .proyecto-card {
    background: rgba(255,255,255,0.1);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 14px; padding: 14px 16px;
  }

  .proyecto-card-label {
    font-size: 9px; text-transform: uppercase; letter-spacing: 1.8px;
    color: rgba(255,255,255,0.45); font-weight: 700; margin-bottom: 8px;
  }
  .proyecto-card-title { font-size: 15px; font-weight: 700; color: white; margin-bottom: 8px; }

  .skill-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px; }
  .skill-tag {
    padding: 3px 10px; border-radius: 6px;
    background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.2);
    font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.85);
  }

  .stars { font-size: 12px; margin-bottom: 6px; }
  .star-filled { color: #7eb8f7; }
  .star-empty { color: rgba(255,255,255,0.2); }

  .uteq-validated {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 10px; border-radius: 6px;
    background: rgba(126,184,247,0.2); border: 1px solid rgba(126,184,247,0.4);
    font-size: 11px; font-weight: 700; color: #7eb8f7;
  }

  /* ── CHATBOT ── */
  .chatbot-section {
    padding: 42px clamp(14px, 3vw, 40px);
    background: white;
    display: flex;
    justify-content: center;
    width: 100%;
  }

  .chatbot-inner {
    width: min(100%, var(--content-max));
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 30px;
  }

  .chatbot-left { max-width: 560px; }

  .chatbot-badge {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 5px 14px; border-radius: 20px;
    background: #f0f4ff; border: 1px solid #c7d7f5;
    font-size: 11px; font-weight: 700; color: var(--primary);
    text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px;
  }

  .chatbot-title {
    font-size: 28px; font-weight: 800; color: var(--text);
    letter-spacing: -0.6px; margin-bottom: 16px;
  }

  .chatbot-desc {
    font-size: 14px; color: var(--muted); line-height: 1.6; margin-bottom: 18px;
  }

  .chatbot-features { display: flex; gap: 14px; flex-wrap: wrap; }
  .chatbot-feat {
    display: flex; align-items: center; gap: 8px;
    font-size: 13px; font-weight: 600; color: var(--text);
  }
  .chatbot-feat-icon { color: var(--primary); }

  .chatbot-right {
    background: var(--bg); border: 1px solid var(--border);
    border-radius: 16px; padding: 18px 20px;
    display: flex; flex-direction: column; align-items: center;
    gap: 14px; min-width: 220px;
  }

  .qr-label {
    font-size: 11px; font-weight: 700; color: var(--text);
    text-transform: uppercase; letter-spacing: 1.5px; text-align: center;
  }
  .qr-sub { font-size: 12px; color: var(--muted); text-align: center; }

  .btn-chatbot {
    padding: 11px 24px; border-radius: 8px;
    font-size: 13px; font-weight: 700; font-family: var(--font);
    background: var(--primary); color: white; border: none; cursor: pointer;
    transition: all 0.2s; width: 100%; text-align: center;
  }
  .btn-chatbot:hover { background: var(--primary-dark); }

  /* ── QUIÉNES SOMOS ── */
  .about-section {
    padding: 42px clamp(14px, 3vw, 40px);
    background: var(--bg);
    display: flex;
    justify-content: center;
    width: 100%;
  }

  .about-inner {
    width: min(100%, var(--content-max));
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 30px;
  }

  .about-left { max-width: 560px; }

  .section-label {
    display: flex; align-items: center; gap: 8px;
    font-size: 11px; text-transform: uppercase; letter-spacing: 2px;
    color: var(--primary); font-weight: 700; margin-bottom: 14px;
  }

  .about-title {
    font-size: 26px; font-weight: 800; color: var(--text);
    letter-spacing: -0.5px; margin-bottom: 14px;
  }

  .about-desc {
    font-size: 14px; color: var(--muted); line-height: 1.6; margin-bottom: 8px;
  }

  .about-items { display: flex; flex-direction: column; gap: 12px; margin-top: 16px; }

  .about-item { display: flex; align-items: flex-start; gap: 14px; }

  .about-item-icon {
    width: 36px; height: 36px; border-radius: 8px;
    background: white; border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; flex-shrink: 0;
  }

  .about-item-title { font-size: 14px; font-weight: 700; color: var(--text); margin-bottom: 2px; }
  .about-item-desc { font-size: 13px; color: var(--muted); }

  .about-right {
    width: 260px; height: 260px; border-radius: 20px;
    background: linear-gradient(135deg, #dbe4f0, #c5d4e8);
    flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    position: relative; overflow: hidden;
  }
  .about-right::after {
    content: ''; position: absolute; bottom: -40px; right: -40px;
    width: 180px; height: 180px; border-radius: 50%; background: rgba(36,78,124,0.15);
  }

  /* ── PROYECTOS ── */
  .projects-section {
    padding: 42px clamp(14px, 3vw, 40px);
    background: var(--bg);
    width: 100%;
  }

  .projects-inner {
    width: min(100%, var(--content-max));
    margin: 0 auto;
  }

  .projects-grid {
    display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; margin-top: 20px;
  }

  .project-card {
    background: white; border-radius: 16px; overflow: hidden;
    border: 1px solid var(--border);
    box-shadow: 0 2px 10px rgba(35,46,86,0.06);
    transition: all 0.2s; position: relative;
  }
  .project-card:hover { transform: translateY(-4px); box-shadow: 0 10px 28px rgba(35,46,86,0.12); }

  .project-thumb {
    height: 130px; display: flex; align-items: center; justify-content: center;
    position: relative;
  }
  .project-thumb-1 { background: linear-gradient(135deg, #dbeafe, #e0f2fe); }
  .project-thumb-2 { background: linear-gradient(135deg, #d1fae5, #e0f2fe); }
  .project-thumb-3 { background: linear-gradient(135deg, #ede9fe, #fce7f3); }

  .project-thumb-icon { font-size: 52px; opacity: 0.75; }

  .uteq-chip {
    position: absolute; top: 12px; right: 12px;
    padding: 4px 10px; border-radius: 6px;
    background: var(--primary); color: white;
    font-size: 10px; font-weight: 700;
  }

  .project-body { padding: 14px 15px; }
  .project-title { font-size: 14px; font-weight: 700; color: var(--text); margin-bottom: 8px; }

  .project-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px; }
  .project-tag {
    padding: 3px 9px; border-radius: 6px;
    background: var(--bg); border: 1px solid var(--border);
    font-size: 11px; font-weight: 600; color: var(--muted);
  }

  .project-rating { display: flex; align-items: center; gap: 6px; }
  .rating-stars { font-size: 13px; }
  .rating-star-filled { color: #4a90d9; }
  .rating-star-empty { color: #d1d5db; }
  .rating-num { font-size: 13px; font-weight: 700; color: var(--text); }

  /* ── TESTIMONIOS ── */
  .testimonios-section {
    padding: 42px clamp(14px, 3vw, 40px);
    background: white;
    width: 100%;
  }

  .testimonios-inner {
    width: min(100%, var(--content-max));
    margin: 0 auto;
  }

  .testimonios-grid {
    display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; margin-top: 20px;
  }

  .testimonio-card {
    background: var(--bg); border: 1px solid var(--border);
    border-radius: 14px; padding: 18px;
    border-left: 3px solid var(--primary);
    transition: box-shadow 0.2s;
  }
  .testimonio-card:hover { box-shadow: 0 6px 20px rgba(35,46,86,0.1); }

  .quote-mark {
    font-size: 22px; font-weight: 900; color: var(--border);
    margin-bottom: 8px; display: block; line-height: 1;
  }

  .testimonio-text {
    font-size: 13px; color: var(--text); line-height: 1.6; margin-bottom: 14px;
  }

  .testimonio-author { display: flex; align-items: center; gap: 12px; }
  .author-avatar {
    width: 38px; height: 38px; border-radius: 50%;
    background: var(--primary); color: white;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 700; flex-shrink: 0;
  }
  .author-name { font-size: 13.5px; font-weight: 700; color: var(--text); }
  .author-role { font-size: 12px; color: var(--muted); }

  /* ── ALIADOS ── */
  .aliados-bar {
    background: var(--primary-dark);
    padding: 16px clamp(14px, 3vw, 40px);
  }

  .aliados-label {
    font-size: 10px; text-transform: uppercase; letter-spacing: 2px;
    color: rgba(255,255,255,0.4); font-weight: 700; text-align: center; margin-bottom: 10px;
  }

  .aliados-list {
    display: flex; align-items: center; justify-content: center;
    gap: 12px; flex-wrap: wrap;
  }

  .aliado-chip {
    display: flex; align-items: center; gap: 8px;
    padding: 9px 20px; border-radius: 8px;
    background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12);
    font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.8);
    transition: all 0.2s; cursor: pointer;
  }
  .aliado-chip:hover { background: rgba(255,255,255,0.14); color: white; }

  /* ── FOOTER ── */
  .footer {
    background: var(--primary-dark);
    padding: 20px clamp(14px, 3vw, 40px);
    border-top: 1px solid rgba(255,255,255,0.08);
    display: flex;
    justify-content: center;
    width: 100%;
  }

  .footer-inner {
    width: min(100%, var(--content-max));
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 20px;
  }

  @media (max-width: 1080px) {
    .hero-inner {
      grid-template-columns: 1fr;
      gap: 12px;
    }

    .hero-right {
      max-width: 420px;
    }

    .chatbot-inner,
    .about-inner {
      flex-direction: column;
      align-items: flex-start;
      gap: 14px;
    }

    .about-right {
      width: min(100%, 360px);
      height: 190px;
    }

    .projects-grid,
    .testimonios-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 760px) {
    .landing-zoom {
      zoom: 0;
    }

    .nav {
      padding-left: 10px;
      padding-right: 10px;
    }

    .nav-links {
      display: none;
    }

    .hero {
      padding-top: 74px;
      padding-bottom: 8px;
    }

    .chatbot-section,
    .about-section,
    .projects-section,
    .testimonios-section {
      padding-top: 30px;
      padding-bottom: 30px;
    }

    .projects-grid,
    .testimonios-grid {
      grid-template-columns: 1fr;
      margin-top: 24px;
      gap: 14px;
    }

    .footer-inner {
      flex-direction: column;
      align-items: flex-start;
    }
  }
  .footer-brand { font-size: 18px; font-weight: 800; color: white; }
  .footer-brand span { color: #7eb8f7; }
  .footer-tagline { font-size: 12px; color: rgba(255,255,255,0.35); margin-top: 3px; }
  .footer-links { display: flex; gap: 24px; }
  .footer-link { font-size: 13px; color: rgba(255,255,255,0.5); cursor: pointer; transition: color 0.2s; font-weight: 500; }
  .footer-link:hover { color: white; }
  .footer-copy { font-size: 12px; color: rgba(255,255,255,0.25); }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .fade-in { animation: fadeUp 0.6s ease both; }
`;

const QR_PATTERN = [
  [1,1,1,1,1,1,1,0,1,0,1,0,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,1,0,0,1,0,0,1,0,0,0,0,0,1],
  [1,0,1,1,1,0,1,0,1,0,1,0,1,0,1,1,1,0,1],
  [1,0,1,1,1,0,1,0,0,0,0,1,1,0,1,1,1,0,1],
  [1,0,1,1,1,0,1,0,1,1,0,0,1,0,1,1,1,0,1],
  [1,0,0,0,0,0,1,0,0,1,0,1,1,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,0,1,0,1,0,1,1,1,1,1,1,1],
  [0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0],
  [1,0,1,1,0,1,1,1,0,1,1,0,1,0,1,1,0,1,0],
  [0,1,0,0,1,0,0,0,1,0,0,1,0,1,1,0,1,0,1],
  [1,1,1,0,1,1,1,0,1,1,0,0,1,0,0,1,1,1,0],
  [0,0,0,0,0,0,0,0,1,0,1,0,0,1,0,0,0,1,0],
  [1,1,1,1,1,1,1,0,0,1,0,1,1,0,1,0,1,0,1],
  [1,0,0,0,0,0,1,0,1,0,1,1,0,1,0,1,0,0,0],
  [1,0,1,1,1,0,1,0,0,1,0,0,1,0,1,0,1,1,0],
  [1,0,1,1,1,0,1,0,1,1,1,0,0,1,0,0,1,0,1],
  [1,0,1,1,1,0,1,0,0,0,1,1,1,0,1,1,0,1,0],
  [1,0,0,0,0,0,1,0,1,0,0,1,0,1,1,0,0,0,1],
  [1,1,1,1,1,1,1,0,0,1,1,0,1,0,0,1,1,0,0],
];

const proyectos = [
  { title: "Sistema ERP Empresarial", tags: ["React","Node.js","MySQL"], rating: 5.0, thumb: 1, icon: "🖥️" },
  { title: "App Móvil de Salud", tags: ["Flutter","Firebase","Dart"], rating: 4.0, thumb: 2, icon: "📱" },
  { title: "Plataforma E-Learning", tags: ["Vue.js","Django","PostgreSQL"], rating: 4.8, thumb: 3, icon: "🗄️" },
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
        <span key={i} className={i < Math.round(rating) ? "rating-star-filled" : "rating-star-empty"}>★</span>
      ))}
    </span>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  return (
    <>
      <style>{styles}</style>

      <div className="landing-zoom">

      {/* ── NAV ── */}
      <nav className="nav">
        <div className="nav-brand">
          <div className="nav-logo-icon">⚡</div>
          <div className="nav-brand-text">Skill<span>Match</span></div>
        </div>

        <div className="nav-actions">
          <div className="nav-links">
            <button className="nav-link" onClick={() => document.getElementById("chatbot")?.scrollIntoView({behavior:"smooth"})}>Chatbot</button>
            <button className="nav-link" onClick={() => document.getElementById("proyectos")?.scrollIntoView({behavior:"smooth"})}>Mejores trabajos</button>
          </div>

          <div className="nav-right">
            <button className="nav-link" onClick={() => navigate("/registro")}>Registrarse</button>
            <button className="nav-link" onClick={() => navigate("/login")}>Iniciar sesión</button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero" id="hero">
        <div className="hero-inner">
          <div className="hero-left">
            <div className="hero-eyebrow">
              <span className="hero-eyebrow-icon">⚡</span>
              PLATAFORMA DE TALENTO UNIVERSITARIO
            </div>
            <h1 className="hero-title">
              Bienvenido a{" "}
              <span className="hero-title-accent">SkillMatch</span>
            </h1>
            <p className="hero-desc">
              Conectamos a estudiantes talentosos de la UTEQ con empresas que buscan proyectos innovadores. Descubre, valida y potencia el talento del futuro.
            </p>
            <button className="btn-comenzar" onClick={() => navigate("/registro")}>→ Comenzar</button>
          </div>

          <div className="hero-right">
            <div className="proyecto-card">
              <div className="proyecto-card-label">PROYECTO DESTACADO</div>
              <div className="proyecto-card-title">Sistema de Gestión ERP</div>
              <div className="skill-tags">
                <span className="skill-tag">React</span>
                <span className="skill-tag">Node.js</span>
                <span className="skill-tag">MySQL</span>
              </div>
              <div className="stars">
                <span className="star-filled">★★★★★</span>
              </div>
              <span className="uteq-validated">✓ Validado UTEQ</span>
            </div>
            <div className="proyecto-card">
              <div className="proyecto-card-label">NUEVO TALENTO</div>
              <div className="proyecto-card-title">App Móvil de Salud</div>
              <div className="skill-tags">
                <span className="skill-tag">Flutter</span>
                <span className="skill-tag">Firebase</span>
              </div>
              <div className="stars">
                <span className="star-filled">★★★★</span>
                <span className="star-empty">★</span>
              </div>
              <span className="uteq-validated">✓ Validado UTEQ</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── CHATBOT ── */}
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
            <svg width="140" height="140" viewBox="0 0 190 190" style={{borderRadius:"8px", background:"white", padding:"6px"}}>
              {QR_PATTERN.map((row, ri) =>
                row.map((cell, ci) =>
                  cell ? (
                    <rect key={`${ri}-${ci}`} x={ci*10} y={ri*10} width={9} height={9} rx={1} fill="#232E56" />
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

      {/* ── QUIÉNES SOMOS ── */}
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
            <svg width="160" height="130" viewBox="0 0 160 130" style={{position:"relative",zIndex:2}}>
              <g transform="translate(80,20)">
                <polygon points="-55,0 0,-18 55,0 0,18" fill="none" stroke="#244E7C" strokeWidth="3" strokeLinejoin="round"/>
              </g>
              <g transform="translate(80,55)">
                <polygon points="-55,0 0,-18 55,0 0,18" fill="none" stroke="#244E7C" strokeWidth="3" strokeLinejoin="round"/>
              </g>
              <g transform="translate(80,90)">
                <polygon points="-55,0 0,-18 55,0 0,18" fill="none" stroke="#244E7C" strokeWidth="3" strokeLinejoin="round"/>
              </g>
            </svg>
          </div>
        </div>
      </section>

      {/* ── PROYECTOS ── */}
      <section className="projects-section" id="proyectos">
        <div className="projects-inner">
          <div className="section-label">📁 PROYECTOS ESCOLARES</div>
          <h2 style={{fontSize:"28px",fontWeight:"800",color:"var(--text)",letterSpacing:"-0.5px"}}>Mejores trabajos</h2>
          <div className="projects-grid">
            {proyectos.map((p, i) => (
              <div className="project-card fade-in" key={p.title} style={{animationDelay:`${i*0.1}s`}}>
                <div className={`project-thumb project-thumb-${p.thumb}`}>
                  <span className="project-thumb-icon">{p.icon}</span>
                  <span className="uteq-chip">✓ UTEQ</span>
                </div>
                <div className="project-body">
                  <div className="project-title">{p.title}</div>
                  <div className="project-tags">
                    {p.tags.map(t => <span className="project-tag" key={t}>{t}</span>)}
                  </div>
                  <div className="project-rating">
                    <StarRating rating={p.rating} />
                    <span className="rating-num">{p.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIOS ── */}
      <section className="testimonios-section" id="testimonios">
        <div className="testimonios-inner">
          <div className="section-label">💬 TESTIMONIOS</div>
          <h2 style={{fontSize:"28px",fontWeight:"800",color:"var(--text)",letterSpacing:"-0.5px"}}>Lo que dicen de nosotros</h2>
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

      {/* ── ALIADOS ── */}
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

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-inner">
          <div>
            <div className="footer-brand">Skill<span>Match</span></div>
            <div className="footer-tagline">Plataforma de vinculación UTEQ · Querétaro, México</div>
          </div>
          <div className="footer-links">
            {["Inicio","Chatbot","Estudiantes","Empresas","Contacto"].map(l => (
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