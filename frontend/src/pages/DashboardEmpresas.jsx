import { useState } from 'react';

const mockVacantes = [
  { id: 1, titulo: "Desarrollador Frontend React", area: "Tecnología", postulaciones: 14, estado: "activa", fecha: "20 Feb 2026", nivel: "Junior" },
  { id: 2, titulo: "Analista de Datos", area: "Ciencias de Datos", postulaciones: 9, estado: "activa", fecha: "15 Feb 2026", nivel: "Semi-Senior" },
  { id: 3, titulo: "Diseñador UX/UI", area: "Diseño", postulaciones: 22, estado: "cerrada", fecha: "01 Ene 2026", nivel: "Junior" },
  { id: 4, titulo: "Ingeniero DevOps", area: "Infraestructura", postulaciones: 6, estado: "activa", fecha: "25 Feb 2026", nivel: "Senior" },
  { id: 5, titulo: "Contador Junior", area: "Finanzas", postulaciones: 17, estado: "cerrada", fecha: "10 Dic 2025", nivel: "Junior" },
];

const mockEstudiantes = [
  { id: 1, nombre: "Daniela Ramos", carrera: "Ing. en Sistemas", promedio: 9.2, habilidades: ["React", "Node.js", "SQL"], validado: true, disponible: "Inmediata" },
  { id: 2, nombre: "Carlos Méndez", carrera: "Ing. Industrial", promedio: 8.8, habilidades: ["AutoCAD", "SolidWorks", "Lean"], validado: true, disponible: "Jun 2026" },
  { id: 3, nombre: "Sofía Herrera", carrera: "Contaduría", promedio: 9.5, habilidades: ["Excel", "SAP", "Contabilidad"], validado: true, disponible: "Inmediata" },
  { id: 4, nombre: "Miguel Torres", carrera: "Diseño Gráfico", promedio: 8.4, habilidades: ["Figma", "Illustrator", "Photoshop"], validado: true, disponible: "Ago 2026" },
];

const colaboraciones = [
  { año: "2025", proyectos: 3, contratados: 8, area: "Tecnología" },
  { año: "2024", proyectos: 2, contratados: 5, area: "Administración" },
  { año: "2023", proyectos: 1, contratados: 3, area: "Diseño" },
];

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  :root {
    --bg: #f4f6fa;
    --surface: #ffffff;
    --surface2: #eef1f7;
    --border: #dde2ee;
    --border2: #c8cfdf;
    --primary: #244E7C;
    --primary-dark: #232E56;
    --green: #1a9e5c;
    --amber: #d97706;
    --red: #dc2626;
    --text: #1a2340;
    --muted: #71706F;
    --muted2: #8a8f9e;
    --layout-max: 1280px;
  }

  body {
    font-family: 'Montserrat', sans-serif;
    background: var(--bg);
    color: var(--text);
    min-height: 100dvh;
    overflow-x: hidden;
  }

  .app { display: flex; min-height: 100dvh; }

  /* SIDEBAR */
  .sidebar {
    width: 236px;
    background: var(--primary-dark);
    display: flex;
    flex-direction: column;
    padding: 0;
    flex-shrink: 0;
  }

  .sidebar-logo {
    padding: 24px 24px 20px;
    border-bottom: 1px solid rgba(255,255,255,0.1);
    margin-bottom: 8px;
  }

  .sidebar-logo .brand {
    font-family: 'Montserrat', sans-serif;
    font-size: 18px;
    font-weight: 800;
    letter-spacing: -0.3px;
    color: #ffffff;
  }

  .sidebar-logo .brand span { color: #7eb8f7; }

  .sidebar-logo .subtitle {
    font-size: 10px;
    color: rgba(255,255,255,0.4);
    text-transform: uppercase;
    letter-spacing: 1.5px;
    margin-top: 3px;
    font-weight: 500;
  }

  .nav-section { padding: 8px 12px; }
  .nav-label {
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 1.8px;
    color: rgba(255,255,255,0.35);
    padding: 8px 12px 6px;
    font-weight: 600;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.15s;
    color: rgba(255,255,255,0.6);
    font-size: 13.5px;
    font-weight: 500;
  }

  .nav-item:hover { background: rgba(255,255,255,0.08); color: #fff; }
  .nav-item.active { background: var(--primary); color: #fff; }
  .nav-item .icon { font-size: 16px; width: 20px; text-align: center; }

  .sidebar-bottom {
    margin-top: auto;
    padding: 16px 12px;
    border-top: 1px solid rgba(255,255,255,0.1);
  }

  .company-badge {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.15s;
  }

  .company-badge:hover { background: rgba(255,255,255,0.08); }

  .company-avatar {
    width: 34px; height: 34px;
    background: var(--primary);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 13px; color: white;
    flex-shrink: 0;
    border: 1px solid rgba(255,255,255,0.2);
  }

  .company-info .name { font-size: 13px; font-weight: 600; color: #fff; }
  .company-info .role { font-size: 11px; color: rgba(255,255,255,0.45); }

  /* MAIN */
  .main { flex: 1; overflow-y: auto; background: var(--bg); }

  .topbar {
    padding: 14px clamp(14px, 2.2vw, 28px);
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--surface);
    position: sticky;
    top: 0;
    z-index: 10;
    box-shadow: 0 2px 8px rgba(35,46,86,0.06);
  }

  .topbar,
  .content {
    width: min(100%, var(--layout-max));
    margin: 0 auto;
  }

  .topbar-title {
    font-family: 'Montserrat', sans-serif;
    font-size: 20px;
    font-weight: 700;
    color: var(--text);
    letter-spacing: -0.3px;
  }

  .topbar-title span { color: var(--muted); font-weight: 500; font-size: 14px; margin-left: 10px; }

  .topbar-actions { display: flex; gap: 10px; align-items: center; }

  .btn {
    padding: 9px 18px;
    border-radius: 8px;
    font-size: 13.5px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    transition: all 0.2s;
    font-family: 'Montserrat', sans-serif;
  }

  .btn-primary {
    background: var(--primary);
    color: white;
    border: none;
  }

  .btn-primary:hover {
    background: var(--primary-dark);
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(36,78,124,0.25);
  }

  .btn-ghost {
    background: white;
    color: var(--primary);
    border: 1.5px solid var(--primary);
  }

  .btn-ghost:hover {
    background: var(--primary);
    color: white;
  }

  /* CONTENT */
  .content { padding: 22px clamp(14px, 2.2vw, 28px); }

  /* METRICS GRID */
  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 24px;
  }

  .metric-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 20px;
    position: relative;
    overflow: hidden;
    transition: box-shadow 0.2s;
    box-shadow: 0 2px 8px rgba(35,46,86,0.06);
  }

  .metric-card:hover { box-shadow: 0 6px 20px rgba(35,46,86,0.12); }

  .metric-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: var(--card-accent, var(--primary));
    border-radius: 12px 12px 0 0;
  }

  .metric-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    color: var(--muted);
    margin-bottom: 10px;
    font-weight: 600;
  }

  .metric-value {
    font-family: 'Montserrat', sans-serif;
    font-size: 32px;
    font-weight: 800;
    color: var(--text);
    line-height: 1;
    margin-bottom: 8px;
  }

  .metric-sub { font-size: 12px; color: var(--muted); }
  .metric-sub .up { color: var(--green); font-weight: 600; }
  .metric-sub .down { color: var(--red); font-weight: 600; }

  .metric-icon {
    position: absolute;
    right: 20px; top: 20px;
    font-size: 22px;
    opacity: 0.1;
  }

  /* SECTION */
  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .section-title {
    font-family: 'Montserrat', sans-serif;
    font-size: 16px;
    font-weight: 700;
    color: var(--text);
  }

  .section-title .count {
    font-family: 'Montserrat', sans-serif;
    font-size: 12px;
    font-weight: 500;
    color: var(--muted);
    margin-left: 8px;
  }

  /* TABS */
  .tabs {
    display: flex;
    gap: 4px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 4px;
    margin-bottom: 16px;
    width: fit-content;
    box-shadow: 0 1px 4px rgba(35,46,86,0.06);
  }

  .tab {
    padding: 7px 16px;
    border-radius: 7px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
    color: var(--muted);
    border: none;
    background: transparent;
    font-family: 'Montserrat', sans-serif;
  }

  .tab.active {
    background: var(--primary);
    color: white;
    font-weight: 600;
  }

  /* VACANTES TABLE */
  .table-wrap {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    overflow: hidden;
    margin-bottom: 24px;
    box-shadow: 0 2px 8px rgba(35,46,86,0.06);
  }

  .table-header {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr 100px 120px;
    padding: 12px 20px;
    background: var(--surface2);
    border-bottom: 1px solid var(--border);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--muted);
    font-weight: 700;
  }

  .table-row {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr 100px 120px;
    padding: 14px 20px;
    border-bottom: 1px solid var(--border);
    align-items: center;
    transition: background 0.15s;
    cursor: pointer;
  }

  .table-row:last-child { border-bottom: none; }
  .table-row:hover { background: #f7f9fc; }

  .vacante-title { font-size: 13.5px; font-weight: 600; color: var(--text); }
  .vacante-area { font-size: 12px; color: var(--muted); margin-top: 2px; }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .badge-green { background: #dcfce7; color: #166534; }
  .badge-red { background: #fee2e2; color: #991b1b; }
  .badge-blue { background: #dbeafe; color: #1e40af; }
  .badge-amber { background: #fef3c7; color: #92400e; }

  .badge::before {
    content: '';
    width: 5px; height: 5px;
    border-radius: 50%;
    background: currentColor;
  }

  .post-count {
    font-family: 'Montserrat', sans-serif;
    font-size: 16px;
    font-weight: 700;
    color: var(--text);
  }

  .table-actions { display: flex; gap: 6px; }

  .action-btn {
    padding: 5px 12px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    border: 1.5px solid var(--border2);
    background: transparent;
    color: var(--primary);
    transition: all 0.15s;
    font-family: 'Montserrat', sans-serif;
  }

  .action-btn:hover { background: var(--primary); color: white; border-color: var(--primary); }

  /* ESTUDIANTES GRID */
  .estudiantes-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    margin-bottom: 24px;
  }

  .estudiante-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 20px;
    transition: all 0.2s;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(35,46,86,0.06);
  }

  .estudiante-card:hover {
    border-color: var(--primary);
    box-shadow: 0 8px 24px rgba(36,78,124,0.12);
    transform: translateY(-2px);
  }

  .est-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
  }

  .est-avatar {
    width: 40px; height: 40px;
    border-radius: 10px;
    background: var(--primary);
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 15px; color: white;
    flex-shrink: 0;
  }

  .est-name { font-size: 14px; font-weight: 700; color: var(--text); }
  .est-carrera { font-size: 12px; color: var(--muted); }

  .est-stats {
    display: flex;
    gap: 16px;
    margin-bottom: 12px;
    padding: 10px 0;
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
  }

  .est-stat-item { text-align: center; }
  .est-stat-val { font-size: 16px; font-weight: 700; color: var(--text); font-family: 'Montserrat', sans-serif; }
  .est-stat-label { font-size: 10px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.8px; font-weight: 600; }

  .skills-list { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 12px; }

  .skill-tag {
    padding: 3px 8px;
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    color: var(--primary);
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
  }

  .uteq-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 8px;
    background: #dcfce7;
    border: 1px solid #86efac;
    color: #166534;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.8px;
  }

  /* PROFILE PAGE */
  .profile-hero {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 32px;
    margin-bottom: 16px;
    display: flex;
    gap: 24px;
    align-items: flex-start;
    box-shadow: 0 2px 8px rgba(35,46,86,0.06);
  }

  .company-logo-big {
    width: 80px; height: 80px;
    background: var(--primary);
    border-radius: 16px;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Montserrat', sans-serif;
    font-size: 28px; font-weight: 800; color: white;
    flex-shrink: 0;
    box-shadow: 0 8px 24px rgba(36,78,124,0.2);
  }

  .company-meta { flex: 1; }
  .company-name {
    font-family: 'Montserrat', sans-serif;
    font-size: 24px; font-weight: 700;
    color: var(--text); letter-spacing: -0.3px;
    margin-bottom: 4px;
  }

  .company-sector {
    font-size: 14px; color: var(--muted);
    margin-bottom: 16px;
  }

  .company-tags { display: flex; flex-wrap: wrap; gap: 8px; }

  .company-tag {
    padding: 4px 12px;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 20px;
    font-size: 12px;
    color: var(--muted);
    font-weight: 500;
  }

  /* STATS ROW */
  .stats-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 16px;
  }

  .stat-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 20px;
    text-align: center;
    box-shadow: 0 2px 8px rgba(35,46,86,0.06);
  }

  .stat-number {
    font-family: 'Montserrat', sans-serif;
    font-size: 28px; font-weight: 800;
    color: var(--primary);
    margin-bottom: 4px;
  }

  .stat-label { font-size: 12px; color: var(--muted); font-weight: 500; }

  /* HISTORIAL */
  .historial-list { display: flex; flex-direction: column; gap: 10px; }

  .historial-item {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 16px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: all 0.15s;
    box-shadow: 0 1px 4px rgba(35,46,86,0.05);
  }

  .historial-item:hover { border-color: var(--primary); box-shadow: 0 4px 12px rgba(36,78,124,0.1); }

  .historial-year {
    font-family: 'Montserrat', sans-serif;
    font-size: 18px; font-weight: 800;
    color: var(--primary);
    width: 60px;
  }

  .historial-info { flex: 1; padding: 0 20px; }
  .historial-title { font-size: 14px; font-weight: 600; color: var(--text); }
  .historial-sub { font-size: 12px; color: var(--muted); margin-top: 2px; }

  .historial-stats { display: flex; gap: 20px; text-align: center; }
  .hstat-val { font-size: 16px; font-weight: 700; color: var(--text); font-family: 'Montserrat', sans-serif; }
  .hstat-label { font-size: 10px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.8px; font-weight: 600; }

  /* MODAL */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(35,46,86,0.5);
    backdrop-filter: blur(4px);
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
  }

  .modal {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 32px;
    width: 100%;
    max-width: 520px;
    box-shadow: 0 24px 64px rgba(35,46,86,0.2);
  }

  .modal-title {
    font-family: 'Montserrat', sans-serif;
    font-size: 18px; font-weight: 700;
    color: var(--text); margin-bottom: 24px;
  }

  .form-group { margin-bottom: 16px; }
  .form-label { font-size: 12px; color: var(--muted); margin-bottom: 6px; display: block; text-transform: uppercase; letter-spacing: 0.8px; font-weight: 600; }

  .form-input, .form-select, .form-textarea {
    width: 100%;
    background: var(--bg);
    border: 1.5px solid var(--border);
    border-radius: 8px;
    padding: 10px 12px;
    font-size: 14px;
    color: var(--text);
    font-family: 'Montserrat', sans-serif;
    outline: none;
    transition: border-color 0.15s;
  }

  .form-input:focus, .form-select:focus, .form-textarea:focus {
    border-color: var(--primary);
  }

  .form-textarea { min-height: 80px; resize: vertical; }

  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

  .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 24px; }

  @media (max-width: 1200px) {
    .metrics-grid,
    .stats-row { grid-template-columns: repeat(2, 1fr); }
    .table-header,
    .table-row { grid-template-columns: 2fr 1fr 1fr 1fr 100px; }
    .table-header > :last-child,
    .table-row > :last-child { display: none; }
  }

  @media (max-width: 960px) {
    .app { flex-direction: column; }
    .sidebar { width: 100%; }
    .nav-section { display: flex; gap: 8px; flex-wrap: wrap; }
    .nav-label { width: 100%; }
    .topbar,
    .content { width: 100%; }
    .content,
    .topbar { padding-left: 16px; padding-right: 16px; }
    .estudiantes-grid,
    .form-row { grid-template-columns: 1fr; }
    .profile-hero { flex-direction: column; }
  }
`;

export default function DashboardEmpresas() {
  const [view, setView] = useState("dashboard");
  const [tabVacantes, setTabVacantes] = useState("todas");
  const [showModal, setShowModal] = useState(false);
  const [tabPerfil, setTabPerfil] = useState("vacantes");
  const [editingPerfil, setEditingPerfil] = useState(false);
  
  // Company data with approval status
  const [companyData, setCompanyData] = useState({
    razonSocial: "TechGroup S.A. de C.V.",
    rfc: "TGR120415AB3",
    sector: "Tecnología de la Información",
    industria: "Software y Servicios Digitales",
    tamanio: "150–300 empleados",
    anioFundacion: "2012",
    ubicacion: "Querétaro, Qro., México",
    direccion: "Av. Tecnológico 1000, CP 76148",
    sitioWeb: "techgroup.mx",
    correoGeneral: "contacto@techgroup.mx",
    responsableRH: "Lic. María González",
    correoRH: "rh@techgroup.mx",
    telefono: "+52 442 123 4567",
    linkedin: "linkedin.com/company/techgroup",
    estado: "aprobada", // 'aprobada', 'pendiente', 'rechazada'
    folioAprobacion: "UTEQ-EMP-2026-0048",
    fechaAprobacion: "10 de enero de 2026"
  });

  const vacantesFiltradas =
    tabVacantes === "todas"
      ? mockVacantes
      : mockVacantes.filter((v) => v.estado === tabVacantes);

  const initials = (name) =>
    name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="brand">Skill<span>Match</span></div>
            <div className="subtitle">Portal Empresas</div>
          </div>

          <nav className="nav-section">
            <div className="nav-label">Principal</div>
            <div className={`nav-item ${view === "dashboard" ? "active" : ""}`} onClick={() => setView("dashboard")}>
              <span className="icon">▦</span> Dashboard
            </div>
            <div className={`nav-item ${view === "perfil" ? "active" : ""}`} onClick={() => setView("perfil")}>
              <span className="icon">◉</span> Perfil Empresa
            </div>
            <div className={`nav-item ${view === "vacantes" ? "active" : ""}`} onClick={() => { setView("dashboard"); setShowModal(true); }}>
              <span className="icon">+</span> Nueva Oferta
            </div>
            <div className={`nav-item ${view === "candidatos" ? "active" : ""}`} onClick={() => setView("dashboard")}>
              <span className="icon">◆</span> Candidatos
            </div>
          </nav>

          <nav className="nav-section">
            <div className="nav-label">Cuenta</div>
            <div className="nav-item">
              <span className="icon">⊙</span> Configuración
            </div>
          </nav>

          <div className="sidebar-bottom">
            <div className="company-badge" onClick={() => setView("perfil")}>
              <div className="company-avatar">TG</div>
              <div className="company-info">
                <div className="name">TechGroup S.A.</div>
                <div className="role">Administrador</div>
              </div>
            </div>
            <button 
              onClick={() => { 
                sessionStorage.clear(); 
                window.location.href = '/'; 
              }}
              style={{
                width: "calc(100% - 16px)",
                marginTop: "12px",
                padding: "10px 12px",
                background: "rgba(239, 68, 68, 0.2)",
                border: "1.5px solid #ef4444",
                borderRadius: "8px",
                color: "#fca5a5",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.15s",
                fontFamily: "'Montserrat', sans-serif"
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(239, 68, 68, 0.3)";
                e.target.style.color = "#fecaca";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "rgba(239, 68, 68, 0.2)";
                e.target.style.color = "#fca5a5";
              }}
            >
              ← Cerrar sesión
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <main className="main">
          {view === "dashboard" && (
            <>
              <div className="topbar">
                <div>
                  <div className="topbar-title">Dashboard <span>Empresas</span></div>
                </div>
                <div className="topbar-actions">
                  <button className="btn btn-ghost">↓ Exportar</button>
                  <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Crear nueva oferta</button>
                </div>
              </div>

              <div className="content">
                {/* METRICS */}
                <div className="metrics-grid">
                  <div className="metric-card" style={{"--card-accent": "#244E7C"}}>
                    <span className="metric-icon">▦</span>
                    <div className="metric-label">Vacantes Activas</div>
                    <div className="metric-value">3</div>
                    <div className="metric-sub"><span className="up">↑ 1</span> vs mes anterior</div>
                  </div>
                  <div className="metric-card" style={{"--card-accent": "#1a9e5c"}}>
                    <span className="metric-icon">✉</span>
                    <div className="metric-label">Postulaciones Totales</div>
                    <div className="metric-value">68</div>
                    <div className="metric-sub"><span className="up">↑ 23%</span> este mes</div>
                  </div>
                  <div className="metric-card" style={{"--card-accent": "#d97706"}}>
                    <span className="metric-icon">●</span>
                    <div className="metric-label">Candidatos Revisados</div>
                    <div className="metric-value">31</div>
                    <div className="metric-sub">de 68 postulaciones</div>
                  </div>
                  <div className="metric-card" style={{"--card-accent": "#232E56"}}>
                    <span className="metric-icon">▲</span>
                    <div className="metric-label">Contrataciones</div>
                    <div className="metric-value">5</div>
                    <div className="metric-sub">Ciclo 2025–2026</div>
                  </div>
                </div>

                {/* VACANTES */}
                <div className="section-header">
                  <div className="section-title">
                    Mis Vacantes <span className="count">{mockVacantes.length} registradas</span>
                  </div>
                </div>

                <div className="tabs">
                  {["todas", "activa", "cerrada"].map((t) => (
                    <button key={t} className={`tab ${tabVacantes === t ? "active" : ""}`} onClick={() => setTabVacantes(t)}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>

                <div className="table-wrap">
                  <div className="table-header">
                    <div>Vacante</div>
                    <div>Nivel</div>
                    <div>Fecha</div>
                    <div>Postulaciones</div>
                    <div>Estado</div>
                    <div>Acciones</div>
                  </div>
                  {vacantesFiltradas.map((v) => (
                    <div className="table-row" key={v.id}>
                      <div>
                        <div className="vacante-title">{v.titulo}</div>
                        <div className="vacante-area">{v.area}</div>
                      </div>
                      <div>
                        <span className={`badge ${v.nivel === "Senior" ? "badge-amber" : v.nivel === "Semi-Senior" ? "badge-blue" : "badge-green"}`}>
                          {v.nivel}
                        </span>
                      </div>
                      <div style={{fontSize: "13px", color: "var(--muted2)"}}>{v.fecha}</div>
                      <div><span className="post-count">{v.postulaciones}</span></div>
                      <div>
                        <span className={`badge ${v.estado === "activa" ? "badge-green" : "badge-red"}`}>
                          {v.estado}
                        </span>
                      </div>
                      <div className="table-actions">
                        <button className="action-btn">Ver</button>
                        <button className="action-btn">Editar</button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ESTUDIANTES */}
                <div className="section-header">
                  <div className="section-title">
                    Estudiantes Validados UTEQ <span className="count">{mockEstudiantes.length} disponibles</span>
                  </div>
                  <button className="btn btn-ghost" style={{fontSize: "12px", padding: "7px 14px"}}>Ver todos →</button>
                </div>

                <div className="estudiantes-grid">
                  {mockEstudiantes.map((e) => (
                    <div className="estudiante-card" key={e.id}>
                      <div className="est-header">
                        <div className="est-avatar">{initials(e.nombre)}</div>
                        <div>
                          <div className="est-name">{e.nombre}</div>
                          <div className="est-carrera">{e.carrera}</div>
                        </div>
                        <div style={{marginLeft: "auto"}}>
                          <span className="uteq-badge">✓ UTEQ</span>
                        </div>
                      </div>
                      <div className="est-stats">
                        <div className="est-stat-item">
                          <div className="est-stat-val">{e.promedio}</div>
                          <div className="est-stat-label">Promedio</div>
                        </div>
                        <div className="est-stat-item">
                          <div className="est-stat-val">{e.habilidades.length}</div>
                          <div className="est-stat-label">Skills</div>
                        </div>
                        <div className="est-stat-item">
                          <div className="est-stat-val" style={{fontSize: "13px", color: "var(--muted2)"}}>{e.disponible}</div>
                          <div className="est-stat-label">Disponible</div>
                        </div>
                      </div>
                      <div className="skills-list">
                        {e.habilidades.map((h) => (
                          <span key={h} className="skill-tag">{h}</span>
                        ))}
                      </div>
                      <div style={{display: "flex", gap: "8px"}}>
                        <button className="btn btn-primary" style={{fontSize: "12px", padding: "7px 14px", flex: 1}}>Ver perfil</button>
                        <button className="btn btn-ghost" style={{fontSize: "12px", padding: "7px 14px"}}>Contactar</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {view === "perfil" && (
            <>
              <div className="topbar">
                <div className="topbar-title">Perfil Empresa</div>
                <div className="topbar-actions">
                  <button className="btn btn-ghost" onClick={() => setView("dashboard")}>← Dashboard</button>
                  <button className="btn btn-primary" onClick={() => setEditingPerfil(!editingPerfil)}>
                    {editingPerfil ? "✓ Guardar cambios" : "✎ Editar perfil"}
                  </button>
                </div>
              </div>

              <div className="content">
                {/* HERO */}
                <div className="profile-hero">
                  <div className="company-logo-big">TG</div>
                  <div className="company-meta">
                    <div style={{display:"flex", alignItems:"center", gap:"12px", marginBottom:"4px", flexWrap:"wrap"}}>
                      <div className="company-name">TechGroup S.A. de C.V.</div>
                      {companyData.estado === 'aprobada' && (
                        <span style={{
                          display:"inline-flex", alignItems:"center", gap:"6px",
                          padding:"5px 14px", borderRadius:"20px",
                          background:"#dcfce7", border:"1.5px solid #86efac",
                          color:"#166534", fontSize:"11px", fontWeight:"700",
                          letterSpacing:"0.5px", whiteSpace:"nowrap"
                        }}>
                          ✓ Aprobada por Servicios Escolares UTEQ
                        </span>
                      )}
                      {companyData.estado === 'pendiente' && (
                        <span style={{
                          display:"inline-flex", alignItems:"center", gap:"6px",
                          padding:"5px 14px", borderRadius:"20px",
                          background:"#fef3c7", border:"1.5px solid #fcd34d",
                          color:"#92400e", fontSize:"11px", fontWeight:"700",
                          letterSpacing:"0.5px", whiteSpace:"nowrap"
                        }}>
                          ⏳ Validación en curso
                        </span>
                      )}
                      {companyData.estado === 'rechazada' && (
                        <span style={{
                          display:"inline-flex", alignItems:"center", gap:"6px",
                          padding:"5px 14px", borderRadius:"20px",
                          background:"#fee2e2", border:"1.5px solid #fca5a5",
                          color:"#991b1b", fontSize:"11px", fontWeight:"700",
                          letterSpacing:"0.5px", whiteSpace:"nowrap"
                        }}>
                          ✗ Solicitud rechazada
                        </span>
                      )}
                    </div>
                    <div className="company-sector">Tecnología de la Información · Querétaro, México</div>
                    <div className="company-tags">
                      <span className="company-tag">□ Empresa mediana</span>
                      <span className="company-tag">◇ Fundada 2012</span>
                      <span className="company-tag">● 150–300 empleados</span>
                      <span className="company-tag">→ techgroup.mx</span>
                    </div>
                  </div>
                </div>

                {/* STATS ROW */}
                <div className="stats-row">
                  <div className="stat-card">
                    <div className="stat-number">3</div>
                    <div className="stat-label">Vacantes activas</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">16</div>
                    <div className="stat-label">Estudiantes contratados</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">6</div>
                    <div className="stat-label">Proyectos con UTEQ</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">3</div>
                    <div className="stat-label">Años de colaboración</div>
                  </div>
                </div>

                {/* TABS PERFIL */}
                <div className="tabs">
                  {[["vacantes", "Vacantes activas"], ["historial", "Historial"], ["info", "Información de la empresa"]].map(([key, label]) => (
                    <button key={key} className={`tab ${tabPerfil === key ? "active" : ""}`} onClick={() => setTabPerfil(key)}>
                      {label}
                    </button>
                  ))}
                </div>

                {tabPerfil === "vacantes" && (
                  <div className="table-wrap">
                    <div className="table-header">
                      <div>Vacante</div>
                      <div>Nivel</div>
                      <div>Fecha</div>
                      <div>Postulaciones</div>
                      <div>Estado</div>
                      <div>Acciones</div>
                    </div>
                    {mockVacantes.filter((v) => v.estado === "activa").map((v) => (
                      <div className="table-row" key={v.id}>
                        <div>
                          <div className="vacante-title">{v.titulo}</div>
                          <div className="vacante-area">{v.area}</div>
                        </div>
                        <div>
                          <span className={`badge ${v.nivel === "Senior" ? "badge-amber" : v.nivel === "Semi-Senior" ? "badge-blue" : "badge-green"}`}>
                            {v.nivel}
                          </span>
                        </div>
                        <div style={{fontSize: "13px", color: "var(--muted2)"}}>{v.fecha}</div>
                        <div><span className="post-count">{v.postulaciones}</span></div>
                        <div><span className="badge badge-green">Activa</span></div>
                        <div className="table-actions">
                          <button className="action-btn">Ver</button>
                          <button className="action-btn">Editar</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {tabPerfil === "historial" && (
                  <div>
                    <div className="section-header" style={{marginBottom: "16px"}}>
                      <div className="section-title">Historial de colaboraciones</div>
                    </div>
                    <div className="historial-list">
                      {colaboraciones.map((c) => (
                        <div className="historial-item" key={c.año}>
                          <div className="historial-year">{c.año}</div>
                          <div className="historial-info">
                            <div className="historial-title">Colaboración en {c.area}</div>
                            <div className="historial-sub">Proyectos conjuntos con UTEQ · Ciclo académico {c.año}</div>
                          </div>
                          <div className="historial-stats">
                            <div>
                              <div className="hstat-val">{c.proyectos}</div>
                              <div className="hstat-label">Proyectos</div>
                            </div>
                            <div>
                              <div className="hstat-val">{c.contratados}</div>
                              <div className="hstat-label">Contratados</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {tabPerfil === "info" && (
                  <div style={{display:"flex", flexDirection:"column", gap:"16px"}}>

                    {/* ESTADO VALIDACIÓN UTEQ */}
                    <div style={{
                      background: companyData.estado === 'aprobada' ? "#f0fdf4" : companyData.estado === 'pendiente' ? "#fef3c7" : "#fee2e2",
                      border: companyData.estado === 'aprobada' ? "1.5px solid #86efac" : companyData.estado === 'pendiente' ? "1.5px solid #fcd34d" : "1.5px solid #fca5a5",
                      borderRadius:"12px", padding:"20px 24px",
                      display:"flex", alignItems:"center", justifyContent:"space-between",
                      flexWrap:"wrap", gap:"12px"
                    }}>
                      <div style={{display:"flex", alignItems:"center", gap:"14px"}}>
                        <div style={{
                          width:"48px", height:"48px", borderRadius:"50%",
                          background: companyData.estado === 'aprobada' ? "#22c55e" : companyData.estado === 'pendiente' ? "#eab308" : "#ef4444",
                          display:"flex", alignItems:"center",
                          justifyContent:"center", fontSize:"22px", color:"white",
                          fontWeight:"800", flexShrink:"0"
                        }}>
                          {companyData.estado === 'aprobada' ? '✓' : companyData.estado === 'pendiente' ? '⏳' : '✗'}
                        </div>
                        <div>
                          <div style={{fontSize:"15px", fontWeight:"700", color: companyData.estado === 'aprobada' ? "#14532d" : companyData.estado === 'pendiente' ? "#78350f" : "#7f1d1d"}}>
                            {companyData.estado === 'aprobada' ? 'Empresa validada y aprobada' : companyData.estado === 'pendiente' ? 'Validación en curso' : 'Solicitud rechazada'}
                          </div>
                          <div style={{fontSize:"13px", color: companyData.estado === 'aprobada' ? "#166534" : companyData.estado === 'pendiente' ? "#92400e" : "#991b1b", marginTop:"3px"}}>
                            {companyData.estado === 'aprobada' ? `Revisión completada · Aprobada el ${companyData.fechaAprobacion}` : companyData.estado === 'pendiente' ? 'Tu solicitud está siendo revisada por Servicios Escolares UTEQ' : 'Contacta con Servicios Escolares para más información'}
                          </div>
                        </div>
                      </div>
                      {companyData.estado === 'aprobada' && (
                        <div style={{
                          background:"white", border: "1px solid #86efac",
                          borderRadius:"8px", padding:"10px 16px", textAlign:"right"
                        }}>
                          <div style={{fontSize:"10px", color:"#166534", fontWeight:"700", textTransform:"uppercase", letterSpacing:"1px"}}>Folio de aprobación</div>
                          <div style={{fontSize:"15px", fontWeight:"800", color:"#14532d", marginTop:"2px", fontFamily:"monospace"}}>{companyData.folioAprobacion}</div>
                        </div>
                      )}
                    </div>

                    {/* DATOS GENERALES */}
                    <div className="table-wrap" style={{padding:"24px", marginBottom:"0"}}>
                      <div style={{fontSize:"12px", fontWeight:"700", color:"var(--primary)", textTransform:"uppercase", letterSpacing:"1.2px", marginBottom:"16px", paddingBottom:"12px", borderBottom:"1px solid var(--border)"}}>
                        Datos generales
                      </div>
                      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"20px"}}>
                        {[
                          ["Razón social", "razonSocial"],
                          ["RFC", "rfc"],
                          ["Sector", "sector"],
                          ["Industria", "industria"],
                          ["Tamaño de empresa", "tamanio"],
                          ["Año de fundación", "anioFundacion"],
                          ["Ubicación", "ubicacion"],
                          ["Dirección", "direccion"],
                        ].map(([label, key]) => (
                          <div key={key}>
                            <div style={{fontSize:"11px", color:"var(--muted)", textTransform:"uppercase", letterSpacing:"1px", marginBottom:"4px", fontWeight:"600"}}>{label}</div>
                            {editingPerfil ? (
                              <input
                                type="text"
                                value={companyData[key]}
                                onChange={(e) => setCompanyData({...companyData, [key]: e.target.value})}
                                style={{
                                  fontSize:"14px", color:"var(--text)", fontWeight:"500",
                                  width:"100%", padding:"8px 12px", border:"1px solid var(--border)",
                                  borderRadius:"6px", fontFamily:"'Montserrat', sans-serif",
                                  background:"var(--bg)"
                                }}
                              />
                            ) : (
                              <div style={{fontSize:"14px", color:"var(--text)", fontWeight:"500"}}>{companyData[key]}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* CONTACTO */}
                    <div className="table-wrap" style={{padding:"24px", marginBottom:"0"}}>
                      <div style={{fontSize:"12px", fontWeight:"700", color:"var(--primary)", textTransform:"uppercase", letterSpacing:"1.2px", marginBottom:"16px", paddingBottom:"12px", borderBottom:"1px solid var(--border)"}}>
                        Contacto y comunicación
                      </div>
                      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"20px"}}>
                        {[
                          ["Sitio web", "sitioWeb"],
                          ["Correo general", "correoGeneral"],
                          ["Responsable de RH", "responsableRH"],
                          ["Correo RH", "correoRH"],
                          ["Teléfono", "telefono"],
                          ["LinkedIn", "linkedin"],
                        ].map(([label, key]) => (
                          <div key={key}>
                            <div style={{fontSize:"11px", color:"var(--muted)", textTransform:"uppercase", letterSpacing:"1px", marginBottom:"4px", fontWeight:"600"}}>{label}</div>
                            {editingPerfil ? (
                              <input
                                type="text"
                                value={companyData[key]}
                                onChange={(e) => setCompanyData({...companyData, [key]: e.target.value})}
                                style={{
                                  fontSize:"14px", color:"var(--text)", fontWeight:"500",
                                  width:"100%", padding:"8px 12px", border:"1px solid var(--border)",
                                  borderRadius:"6px", fontFamily:"'Montserrat', sans-serif",
                                  background:"var(--bg)"
                                }}
                              />
                            ) : (
                              <div style={{fontSize:"14px", color:"var(--primary)", fontWeight:"500"}}>{companyData[key]}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* CONVENIO UTEQ */}
                    <div className="table-wrap" style={{padding:"24px", marginBottom:"0"}}>
                      <div style={{fontSize:"12px", fontWeight:"700", color:"var(--primary)", textTransform:"uppercase", letterSpacing:"1.2px", marginBottom:"16px", paddingBottom:"12px", borderBottom:"1px solid var(--border)"}}>
                        Convenio con UTEQ — Servicios Escolares
                      </div>
                      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"20px"}}>
                        {[
                          ["Tipo de convenio", "Estadías profesionales y empleo"],
                          ["Vigencia", "Enero 2026 – Diciembre 2027"],
                          ["Modalidades aceptadas", "Presencial, Híbrido"],
                          ["Carreras vinculadas", "Ing. Sistemas, Diseño, Administración"],
                          ["Responsable UTEQ", "Mtro. Jorge Reyes — Servicios Escolares"],
                          ["Estatus del convenio", "Vigente y activo"],
                        ].map(([label, value]) => (
                          <div key={label}>
                            <div style={{fontSize:"11px", color:"var(--muted)", textTransform:"uppercase", letterSpacing:"1px", marginBottom:"4px", fontWeight:"600"}}>{label}</div>
                            <div style={{fontSize:"14px", color:"var(--text)", fontWeight:"500"}}>{value}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>

      {/* MODAL NUEVA OFERTA */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">+ Crear nueva oferta</div>
            <div className="form-group">
              <label className="form-label">Título del puesto</label>
              <input className="form-input" placeholder="Ej. Desarrollador Backend Node.js" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Área</label>
                <select className="form-select">
                  <option>Tecnología</option>
                  <option>Diseño</option>
                  <option>Finanzas</option>
                  <option>Ingeniería</option>
                  <option>Administración</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Nivel</label>
                <select className="form-select">
                  <option>Junior</option>
                  <option>Semi-Senior</option>
                  <option>Senior</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Descripción</label>
              <textarea className="form-textarea" placeholder="Describe las responsabilidades y requisitos del puesto..." />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Modalidad</label>
                <select className="form-select">
                  <option>Presencial</option>
                  <option>Remoto</option>
                  <option>Híbrido</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Cierre</label>
                <input className="form-input" type="date" />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={() => setShowModal(false)}>Publicar oferta →</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
