import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// ─── DATA ───────────────────────────────────────────────────────────────────

const encargado = {
  nombre: "Mtro. Jorge Reyes Vargas",
  cargo: "Jefe de Vinculación y Estadías",
  departamento: "Servicios Escolares — UTEQ",
  correo: "j.reyes@uteq.edu.mx",
  extension: "Ext. 2041",
};

const empresasEspera = [
  {
    id: 1,
    nombre: "Grupo Innovatek S.A.",
    sector: "Tecnología",
    contacto: "Ing. Luis Barrera",
    correo: "l.barrera@innovatek.mx",
    telefono: "+52 442 890 1234",
    rfc: "GIN180320XY1",
    direccion: "Blvd. Bernardo Quintana 555, Querétaro",
    sitio: "innovatek.mx",
    empleados: "50–150",
    fundacion: "2018",
    convenio: "Estadías profesionales",
    carreras: "Ing. Sistemas, Mecatrónica",
    solicitud: "28 Feb 2026",
    descripcion: "Empresa de desarrollo de software especializada en soluciones ERP para PYMES. Solicita convenio para recibir estudiantes en estadía.",
    estado: "pendiente",
  },
  {
    id: 2,
    nombre: "Constructora Norteña del Bajío",
    sector: "Construcción",
    contacto: "Arq. Patricia Soto",
    correo: "psoto@constructoranortena.mx",
    telefono: "+52 442 334 5678",
    rfc: "CNB150712AB3",
    direccion: "Carretera a San Luis 2200, Querétaro",
    sitio: "constructoranortena.mx",
    empleados: "300–500",
    fundacion: "2015",
    convenio: "Empleo y estadías",
    carreras: "Ing. Civil, Administración",
    solicitud: "25 Feb 2026",
    descripcion: "Constructora con proyectos de infraestructura en el Bajío. Interesada en contratar egresados y recibir practicantes.",
    estado: "pendiente",
  },
  {
    id: 3,
    nombre: "FinTech Soluciones MX",
    sector: "Finanzas / Tecnología",
    contacto: "Lic. Andrea Ramírez",
    correo: "a.ramirez@fintechsoluciones.mx",
    telefono: "+52 55 6712 3456",
    rfc: "FSM200101CD5",
    direccion: "Paseo de la República 890, Querétaro",
    sitio: "fintechsoluciones.mx",
    empleados: "20–50",
    fundacion: "2020",
    convenio: "Estadías profesionales",
    carreras: "Contaduría, Ing. en Sistemas",
    solicitud: "20 Feb 2026",
    descripcion: "Startup fintech en etapa de crecimiento. Busca talento universitario para áreas de desarrollo y finanzas.",
    estado: "pendiente",
  },
  {
    id: 4,
    nombre: "Logística Bajío Express",
    sector: "Logística y Transporte",
    contacto: "Lic. Roberto Cruz",
    correo: "rcruz@bajioexpress.mx",
    telefono: "+52 442 567 8901",
    rfc: "LBE190505EF6",
    direccion: "Carretera a Celaya km 12, Querétaro",
    sitio: "bajioexpress.mx",
    empleados: "150–300",
    fundacion: "2019",
    convenio: "Empleo",
    carreras: "Administración, Ing. Industrial",
    solicitud: "15 Feb 2026",
    descripcion: "Empresa de logística y distribución regional. Requiere personal en áreas de operaciones y administración.",
    estado: "pendiente",
  },
];

const empresasRelacionadas = [
  { id: 10, nombre: "TechGroup S.A. de C.V.", sector: "Tecnología", convenio: "Estadías y empleo", aprobacion: "10 Ene 2026", folio: "UTEQ-EMP-2026-0048", vacantes: 3, contratados: 16, estado: "activa" },
  { id: 11, nombre: "Soluciones Digitales QRO", sector: "Software", convenio: "Estadías profesionales", aprobacion: "05 Nov 2025", folio: "UTEQ-EMP-2025-0091", vacantes: 2, contratados: 8, estado: "activa" },
  { id: 12, nombre: "Manufactura Integral S.A.", sector: "Manufactura", convenio: "Empleo", aprobacion: "22 Ago 2025", folio: "UTEQ-EMP-2025-0067", vacantes: 0, contratados: 11, estado: "inactiva" },
  { id: 13, nombre: "Agro Innovación del Bajío", sector: "Agroindustria", convenio: "Estadías profesionales", aprobacion: "14 Mar 2025", folio: "UTEQ-EMP-2025-0034", vacantes: 1, contratados: 5, estado: "activa" },
  { id: 14, nombre: "Centro Médico Querétaro", sector: "Salud", convenio: "Estadías y empleo", aprobacion: "01 Feb 2025", folio: "UTEQ-EMP-2025-0019", vacantes: 2, contratados: 9, estado: "activa" },
  { id: 15, nombre: "Grupo Editorial Noreste", sector: "Comunicación", convenio: "Empleo", aprobacion: "30 Nov 2024", folio: "UTEQ-EMP-2024-0108", vacantes: 0, contratados: 4, estado: "inactiva" },
  { id: 16, nombre: "AutoParts Bajío S.A.", sector: "Automotriz", convenio: "Estadías profesionales", aprobacion: "15 Sep 2024", folio: "UTEQ-EMP-2024-0083", vacantes: 4, contratados: 22, estado: "activa" },
  { id: 17, nombre: "Diseño y Espacios QRO", sector: "Diseño / Arquitectura", convenio: "Estadías profesionales", aprobacion: "10 Jul 2024", folio: "UTEQ-EMP-2024-0061", vacantes: 1, contratados: 7, estado: "activa" },
];

// ─── STYLES ─────────────────────────────────────────────────────────────────

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
    --green: #166534;
    --green-bg: #dcfce7;
    --green-border: #86efac;
    --red: #991b1b;
    --red-bg: #fee2e2;
    --red-border: #fca5a5;
    --amber: #92400e;
    --amber-bg: #fef3c7;
    --amber-border: #fcd34d;
    --text: #1a2340;
    --muted: #71706F;
    --muted2: #8a8f9e;
    --font: 'Montserrat', sans-serif;
    --layout-max: 1280px;
  }

  body { font-family: var(--font); background: var(--bg); color: var(--text); min-height: 100dvh; }

  .app { display: flex; min-height: 100dvh; }

  /* ── SIDEBAR ── */
  .sidebar {
    width: 236px;
    background: var(--primary-dark);
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
  }

  .sidebar-logo {
    padding: 24px;
    border-bottom: 1px solid rgba(255,255,255,0.1);
  }

  .brand { font-size: 18px; font-weight: 800; color: #fff; letter-spacing: -0.3px; }
  .brand span { color: #7eb8f7; }
  .brand-sub { font-size: 10px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 1.5px; margin-top: 3px; font-weight: 500; }

  .nav-wrap { padding: 12px; flex: 1; }
  .nav-group-label {
    font-size: 9px; text-transform: uppercase; letter-spacing: 1.8px;
    color: rgba(255,255,255,0.35); padding: 8px 12px 6px; font-weight: 600;
  }

  .nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: 8px;
    cursor: pointer; transition: all 0.15s;
    color: rgba(255,255,255,0.6); font-size: 13.5px; font-weight: 500;
    margin-bottom: 2px;
  }
  .nav-item:hover { background: rgba(255,255,255,0.08); color: #fff; }
  .nav-item.active { background: var(--primary); color: #fff; }
  .nav-icon { font-size: 15px; width: 20px; text-align: center; }

  .sidebar-user {
    padding: 14px 12px;
    border-top: 1px solid rgba(255,255,255,0.1);
    display: flex; align-items: center; gap: 10px;
  }

  .user-avatar {
    width: 36px; height: 36px; border-radius: 50%;
    background: var(--primary);
    border: 2px solid rgba(255,255,255,0.25);
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 13px; color: white; flex-shrink: 0;
  }
  .user-name { font-size: 12px; font-weight: 700; color: #fff; line-height: 1.3; }
  .user-role { font-size: 10px; color: rgba(255,255,255,0.45); }

  /* ── MAIN ── */
  .main { flex: 1; overflow-y: auto; }

  .topbar {
    padding: 14px clamp(14px, 2.2vw, 28px);
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
    position: sticky; top: 0; z-index: 20;
    box-shadow: 0 2px 8px rgba(35,46,86,0.07);
  }

  .topbar,
  .content {
    width: min(100%, var(--layout-max));
    margin: 0 auto;
  }

  .topbar-left { display: flex; flex-direction: column; gap: 2px; }
  .topbar-title { font-size: 18px; font-weight: 700; color: var(--text); }
  .topbar-sub { font-size: 12px; color: var(--muted); font-weight: 500; }

  .topbar-right { display: flex; align-items: center; gap: 10px; }

  /* ── BUTTONS ── */
  .btn {
    padding: 9px 18px; border-radius: 8px; font-size: 13px; font-weight: 600;
    cursor: pointer; border: none; transition: all 0.18s; font-family: var(--font);
  }
  .btn-primary { background: var(--primary); color: white; }
  .btn-primary:hover { background: var(--primary-dark); box-shadow: 0 4px 14px rgba(36,78,124,0.25); transform: translateY(-1px); }
  .btn-ghost { background: white; color: var(--primary); border: 1.5px solid var(--primary); }
  .btn-ghost:hover { background: var(--primary); color: white; }
  .btn-approve { background: #22c55e; color: white; padding: 7px 14px; font-size: 12px; }
  .btn-approve:hover { background: #16a34a; }
  .btn-reject { background: white; color: #dc2626; border: 1.5px solid #dc2626; padding: 7px 14px; font-size: 12px; }
  .btn-reject:hover { background: #dc2626; color: white; }

  /* ── CONTENT ── */
  .content { padding: 22px clamp(14px, 2.2vw, 28px); }

  /* ── METRICS ── */
  .metrics { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 28px; }

  .metric-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 12px; padding: 20px; position: relative; overflow: hidden;
    box-shadow: 0 2px 8px rgba(35,46,86,0.06); transition: box-shadow 0.2s;
  }
  .metric-card:hover { box-shadow: 0 6px 20px rgba(35,46,86,0.11); }
  .metric-card::before {
    content:''; position: absolute; top:0; left:0; right:0; height:3px;
    background: var(--mc, var(--primary)); border-radius: 12px 12px 0 0;
  }
  .mc-label { font-size:10px; text-transform:uppercase; letter-spacing:1.2px; color:var(--muted); font-weight:700; margin-bottom:10px; }
  .mc-val { font-size:30px; font-weight:800; color:var(--text); line-height:1; margin-bottom:6px; }
  .mc-sub { font-size:12px; color:var(--muted); }
  .mc-icon { position:absolute; right:18px; top:18px; font-size:24px; opacity:0.08; }

  /* ── ENCARGADO CARD ── */
  .encargado-card {
    background: var(--primary-dark);
    border-radius: 14px;
    padding: 24px 28px;
    margin-bottom: 24px;
    display: flex; align-items: center; gap: 20px;
    box-shadow: 0 4px 20px rgba(35,46,86,0.2);
    position: relative; overflow: hidden;
  }
  .encargado-card::after {
    content:'';
    position:absolute; right:-30px; top:-30px;
    width:160px; height:160px; border-radius:50%;
    background: rgba(255,255,255,0.04);
    pointer-events:none;
  }
  .enc-avatar {
    width: 60px; height: 60px; border-radius: 50%;
    background: var(--primary);
    border: 3px solid rgba(255,255,255,0.25);
    display: flex; align-items: center; justify-content: center;
    font-size: 22px; font-weight: 800; color: white; flex-shrink: 0;
  }
  .enc-name { font-size: 18px; font-weight: 700; color: white; margin-bottom: 3px; }
  .enc-cargo { font-size: 13px; color: rgba(255,255,255,0.65); margin-bottom: 10px; }
  .enc-tags { display:flex; gap:8px; flex-wrap:wrap; }
  .enc-tag {
    padding: 4px 12px; border-radius: 20px;
    background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15);
    font-size: 11px; color: rgba(255,255,255,0.8); font-weight: 500;
  }

  /* ── SECTION HEADER ── */
  .section-hdr {
    display:flex; align-items:center; justify-content:space-between;
    margin-bottom: 14px;
  }
  .section-title { font-size:15px; font-weight:700; color:var(--text); }
  .section-count {
    font-size:11px; font-weight:500; color:var(--muted); margin-left:8px;
  }

  /* ── BADGE ── */
  .badge {
    display:inline-flex; align-items:center; gap:5px;
    padding:4px 10px; border-radius:20px;
    font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.4px;
  }
  .badge::before { content:''; width:5px; height:5px; border-radius:50%; background:currentColor; }
  .badge-pending { background: var(--amber-bg); color: var(--amber); }
  .badge-approved { background: var(--green-bg); color: var(--green); }
  .badge-rejected { background: var(--red-bg); color: var(--red); }
  .badge-active { background: var(--green-bg); color: var(--green); }
  .badge-inactive { background: #f3f4f6; color: #6b7280; }

  /* ── EMPRESAS EN ESPERA ── */
  .espera-list { display:flex; flex-direction:column; gap:12px; margin-bottom:32px; }

  .espera-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 12px; overflow: hidden;
    box-shadow: 0 2px 8px rgba(35,46,86,0.05);
    transition: box-shadow 0.2s;
  }
  .espera-card:hover { box-shadow: 0 6px 20px rgba(35,46,86,0.1); }

  .espera-card.approved { border-left: 4px solid #22c55e; }
  .espera-card.rejected { border-left: 4px solid #ef4444; }
  .espera-card.pending { border-left: 4px solid var(--amber-border); }

  .espera-header {
    display:flex; align-items:center; justify-content:space-between;
    padding: 16px 20px; cursor:pointer;
  }

  .espera-header-left { display:flex; align-items:center; gap:14px; }
  .espera-logo {
    width:42px; height:42px; border-radius:10px; background:var(--surface2);
    border: 1px solid var(--border); display:flex; align-items:center;
    justify-content:center; font-weight:800; font-size:14px; color:var(--primary);
    flex-shrink:0;
  }
  .espera-nombre { font-size:14px; font-weight:700; color:var(--text); }
  .espera-meta { font-size:12px; color:var(--muted); margin-top:2px; }

  .espera-header-right { display:flex; align-items:center; gap:10px; }
  .espera-fecha { font-size:11px; color:var(--muted2); }
  .expand-arrow { font-size:12px; color:var(--muted); transition:transform 0.2s; }
  .expand-arrow.open { transform: rotate(180deg); }

  .espera-body {
    border-top: 1px solid var(--border);
    padding: 20px;
    display:grid; grid-template-columns: 1fr 1fr; gap:0;
  }

  .espera-info-col { padding-right:24px; }
  .espera-info-col + .espera-info-col { padding-right:0; padding-left:24px; border-left:1px solid var(--border); }

  .info-block { margin-bottom:16px; }
  .info-label { font-size:10px; text-transform:uppercase; letter-spacing:1px; color:var(--muted); font-weight:700; margin-bottom:4px; }
  .info-val { font-size:13.5px; color:var(--text); font-weight:500; }
  .info-val.blue { color:var(--primary); }

  .espera-desc {
    font-size:13px; color:var(--muted); line-height:1.6;
    background:var(--surface2); border-radius:8px;
    padding:12px 14px; margin-bottom:16px; border:1px solid var(--border);
  }

  .espera-actions { display:flex; gap:8px; padding-top:4px; }

  .rechazo-input {
    width:100%; background:var(--bg); border:1.5px solid var(--border);
    border-radius:8px; padding:10px 12px; font-size:13px;
    color:var(--text); font-family:var(--font); outline:none;
    transition:border-color 0.15s; resize:vertical; min-height:72px;
    margin-top:10px;
  }
  .rechazo-input:focus { border-color:#dc2626; }

  .rechazo-label { font-size:11px; font-weight:700; color:#dc2626; text-transform:uppercase; letter-spacing:0.8px; margin-top:12px; }

  /* ── EMPRESAS RELACIONADAS ── */
  .rel-table-wrap {
    background:var(--surface); border:1px solid var(--border);
    border-radius:12px; overflow:hidden;
    box-shadow:0 2px 8px rgba(35,46,86,0.06);
  }

  .rel-table-hdr {
    display:grid; grid-template-columns:2fr 1fr 1.5fr 1fr 80px 90px 90px;
    padding:11px 20px; background:var(--surface2);
    border-bottom:1px solid var(--border);
    font-size:10px; text-transform:uppercase; letter-spacing:1px;
    color:var(--muted); font-weight:700;
  }

  .rel-table-row {
    display:grid; grid-template-columns:2fr 1fr 1.5fr 1fr 80px 90px 90px;
    padding:14px 20px; border-bottom:1px solid var(--border);
    align-items:center; transition:background 0.15s; cursor:pointer;
  }
  .rel-table-row:last-child { border-bottom:none; }
  .rel-table-row:hover { background:#f7f9fc; }

  .rel-nombre { font-size:13.5px; font-weight:600; color:var(--text); }
  .rel-sector { font-size:12px; color:var(--muted); margin-top:2px; }
  .rel-folio { font-size:11px; color:var(--muted2); font-family:monospace; }
  .rel-num { font-size:16px; font-weight:800; color:var(--text); font-family:var(--font); }

  /* ── MODAL ── */
  .overlay {
    position:fixed; inset:0; background:rgba(35,46,86,0.45);
    backdrop-filter:blur(4px); z-index:100;
    display:flex; align-items:center; justify-content:center; padding:24px;
  }

  .modal {
    background:var(--surface); border:1px solid var(--border2);
    border-radius:16px; padding:28px; width:100%; max-width:600px;
    box-shadow:0 24px 60px rgba(35,46,86,0.2); max-height:90vh; overflow-y:auto;
  }

  .modal-title { font-size:16px; font-weight:700; color:var(--text); margin-bottom:20px; }

  .modal-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }

  .mfield-label { font-size:10px; color:var(--muted); text-transform:uppercase; letter-spacing:1px; font-weight:700; margin-bottom:4px; }
  .mfield-val { font-size:13.5px; color:var(--text); font-weight:500; }
  .mfield-val.blue { color:var(--primary); }

  .modal-divider { border:none; border-top:1px solid var(--border); margin:18px 0; }

  .modal-section-title { font-size:11px; font-weight:700; color:var(--primary); text-transform:uppercase; letter-spacing:1.2px; margin-bottom:14px; }

  .modal-status-banner {
    display:flex; align-items:center; gap:14px;
    padding:14px 18px; border-radius:10px; margin-bottom:18px;
  }
  .status-icon { font-size:20px; font-weight:800; width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0; }

  /* ── TABS ── */
  .tabs {
    display:flex; gap:4px; background:var(--surface); border:1px solid var(--border);
    border-radius:10px; padding:4px; width:fit-content; margin-bottom:20px;
    box-shadow:0 1px 4px rgba(35,46,86,0.06);
  }
  .tab {
    padding:7px 18px; border-radius:7px; font-size:13px; font-weight:600;
    cursor:pointer; transition:all 0.15s; color:var(--muted);
    border:none; background:transparent; font-family:var(--font);
  }
  .tab.active { background:var(--primary); color:white; }

  /* ── NOTIF ── */
  .notif {
    display:inline-flex; align-items:center; justify-content:center;
    width:18px; height:18px; border-radius:50%; background:#ef4444;
    color:white; font-size:10px; font-weight:800; margin-left:6px;
  }

  @media (max-width: 1200px) {
    .metrics { grid-template-columns: repeat(2, 1fr); }
    .rel-table-hdr,
    .rel-table-row { grid-template-columns: 2fr 1fr 1.4fr 1fr 80px 90px; }
    .rel-table-hdr > :last-child,
    .rel-table-row > :last-child { display: none; }
  }

  @media (max-width: 960px) {
    .app { flex-direction: column; }
    .sidebar { width: 100%; }
    .nav-wrap { display: flex; flex-wrap: wrap; gap: 8px; }
    .nav-group-label { width: 100%; }
    .topbar,
    .content { width: 100%; }
    .content,
    .topbar { padding-left: 16px; padding-right: 16px; }
    .espera-body,
    .modal-grid { grid-template-columns: 1fr; }
    .espera-info-col,
    .espera-info-col + .espera-info-col {
      padding: 0;
      border-left: none;
    }
  }
`;

// ─── HELPERS ────────────────────────────────────────────────────────────────

const initials = (name) => name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

// ─── COMPONENT ──────────────────────────────────────────────────────────────

export default function DashboardVinculacion() {
  const navigate = useNavigate();
  const [view, setView] = useState("dashboard");
  const [expanded, setExpanded] = useState(null);
  const [estados, setEstados] = useState({});       // {id: "approved"|"rejected"}
  const [razones, setRazones] = useState({});        // {id: string}
  const [showRazon, setShowRazon] = useState(null);  // id empresa mostrando input rechazo
  const [modalEmpresa, setModalEmpresa] = useState(null);
  const [tabRel, setTabRel] = useState("todas");

  const pendientes = empresasEspera.filter(e => !estados[e.id]);
  const procesadas = empresasEspera.filter(e => estados[e.id]);

  const relFiltradas = tabRel === "todas"
    ? empresasRelacionadas
    : empresasRelacionadas.filter(e => e.estado === tabRel);

  const aprobar = (id) => {
    setEstados(prev => ({ ...prev, [id]: "approved" }));
    setShowRazon(null);
  };

  const rechazar = (id) => {
    setEstados(prev => ({ ...prev, [id]: "rejected" }));
    setShowRazon(null);
  };

  const estadoCard = (e) => {
    const s = estados[e.id];
    if (s === "approved") return "approved";
    if (s === "rejected") return "rejected";
    return "pending";
  };

  return (
    <>
      <style>{styles}</style>
      <div className="app">

        {/* ── SIDEBAR ── */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="brand">Skill<span>Match</span></div>
            <div className="brand-sub">Vinculación UTEQ</div>
          </div>

          <div className="nav-wrap">
            <div className="nav-group-label">Principal</div>
            <div className={`nav-item ${view === "dashboard" ? "active" : ""}`} onClick={() => setView("dashboard")}>
              <span className="nav-icon">▦</span> Dashboard
            </div>
            <div className={`nav-item ${view === "espera" ? "active" : ""}`} onClick={() => setView("espera")}>
              <span className="nav-icon">⏳</span> Empresas en espera
              {pendientes.length > 0 && <span className="notif">{pendientes.length}</span>}
            </div>
            <div className={`nav-item ${view === "relacionadas" ? "active" : ""}`} onClick={() => setView("relacionadas")}>
              <span className="nav-icon">🤝</span> Empresas relacionadas
            </div>
            <div className="nav-group-label" style={{marginTop:"8px"}}>Cuenta</div>
            <div className="nav-item">
              <span className="nav-icon">⊙</span> Configuración
            </div>
            <div className="nav-item" onClick={() => navigate("/login")}>
              <span className="nav-icon">→</span> Cerrar sesión
            </div>
          </div>

          <div className="sidebar-user">
            <div className="user-avatar">JR</div>
            <div>
              <div className="user-name">Mtro. Jorge Reyes</div>
              <div className="user-role">Jefe de Vinculación</div>
            </div>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main className="main">

          {/* ════ DASHBOARD ════ */}
          {view === "dashboard" && (
            <>
              <div className="topbar">
                <div className="topbar-left">
                  <div className="topbar-title">Dashboard — Vinculación</div>
                  <div className="topbar-sub">Departamento de Servicios Escolares · UTEQ</div>
                </div>
              </div>

              <div className="content">

                {/* ENCARGADO */}
                <div className="encargado-card">
                  <div className="enc-avatar">JR</div>
                  <div>
                    <div className="enc-name">{encargado.nombre}</div>
                    <div className="enc-cargo">{encargado.cargo}</div>
                    <div className="enc-tags">
                      <span className="enc-tag">📧 {encargado.correo}</span>
                      <span className="enc-tag">☎ {encargado.extension}</span>
                      <span className="enc-tag">🏫 {encargado.departamento}</span>
                    </div>
                  </div>
                </div>

                {/* METRICS */}
                <div className="metrics">
                  <div className="metric-card" style={{"--mc":"#244E7C"}}>
                    <span className="mc-icon">🤝</span>
                    <div className="mc-label">Empresas relacionadas</div>
                    <div className="mc-val">{empresasRelacionadas.length}</div>
                    <div className="mc-sub">UTEQ + SkillMatch</div>
                  </div>
                  <div className="metric-card" style={{"--mc":"#f59e0b"}}>
                    <span className="mc-icon">⏳</span>
                    <div className="mc-label">En espera de revisión</div>
                    <div className="mc-val">{pendientes.length}</div>
                    <div className="mc-sub">solicitudes pendientes</div>
                  </div>
                  <div className="metric-card" style={{"--mc":"#22c55e"}}>
                    <span className="mc-icon">✓</span>
                    <div className="mc-label">Aprobadas hoy</div>
                    <div className="mc-val">{Object.values(estados).filter(v=>v==="approved").length}</div>
                    <div className="mc-sub">esta sesión</div>
                  </div>
                  <div className="metric-card" style={{"--mc":"#232E56"}}>
                    <span className="mc-icon">👥</span>
                    <div className="mc-label">Estudiantes colocados</div>
                    <div className="mc-val">85</div>
                    <div className="mc-sub">ciclo 2025–2026</div>
                  </div>
                </div>

                {/* RESUMEN ESPERA */}
                <div className="section-hdr">
                  <div className="section-title">
                    Solicitudes recientes
                    <span className="section-count">{empresasEspera.length} empresas</span>
                  </div>
                  <button className="btn btn-ghost" style={{fontSize:"12px",padding:"7px 14px"}} onClick={()=>setView("espera")}>
                    Ver todas →
                  </button>
                </div>

                <div className="espera-list">
                  {empresasEspera.slice(0,3).map(e => (
                    <div className={`espera-card ${estadoCard(e)}`} key={e.id}>
                      <div className="espera-header" onClick={() => setExpanded(expanded === e.id ? null : e.id)}>
                        <div className="espera-header-left">
                          <div className="espera-logo">{initials(e.nombre)}</div>
                          <div>
                            <div className="espera-nombre">{e.nombre}</div>
                            <div className="espera-meta">{e.sector} · Solicitado: {e.solicitud}</div>
                          </div>
                        </div>
                        <div className="espera-header-right">
                          <span className={`badge badge-${estadoCard(e) === "approved" ? "approved" : estadoCard(e) === "rejected" ? "rejected" : "pending"}`}>
                            {estadoCard(e) === "approved" ? "Aprobada" : estadoCard(e) === "rejected" ? "Rechazada" : "Pendiente"}
                          </span>
                          <span className={`expand-arrow ${expanded === e.id ? "open" : ""}`}>▼</span>
                        </div>
                      </div>
                      {expanded === e.id && <EsperaBody e={e} estados={estados} razones={razones} setRazones={setRazones} showRazon={showRazon} setShowRazon={setShowRazon} aprobar={aprobar} rechazar={rechazar} />}
                    </div>
                  ))}
                </div>

                {/* RESUMEN RELACIONADAS */}
                <div className="section-hdr">
                  <div className="section-title">
                    Empresas relacionadas — UTEQ & SkillMatch
                    <span className="section-count">{empresasRelacionadas.length} activas</span>
                  </div>
                  <button className="btn btn-ghost" style={{fontSize:"12px",padding:"7px 14px"}} onClick={()=>setView("relacionadas")}>
                    Ver todas →
                  </button>
                </div>

                <RelTable empresas={empresasRelacionadas.slice(0,4)} onView={setModalEmpresa} />
              </div>
            </>
          )}

          {/* ════ EMPRESAS EN ESPERA ════ */}
          {view === "espera" && (
            <>
              <div className="topbar">
                <div className="topbar-left">
                  <div className="topbar-title">Empresas en espera de revisión</div>
                  <div className="topbar-sub">{pendientes.length} pendientes · {procesadas.length} procesadas</div>
                </div>
              </div>

              <div className="content">
                {pendientes.length > 0 && (
                  <>
                    <div className="section-hdr" style={{marginBottom:"14px"}}>
                      <div className="section-title">Pendientes de revisión <span className="section-count">{pendientes.length}</span></div>
                    </div>
                    <div className="espera-list">
                      {pendientes.map(e => (
                        <div className="espera-card pending" key={e.id}>
                          <div className="espera-header" onClick={() => setExpanded(expanded === e.id ? null : e.id)}>
                            <div className="espera-header-left">
                              <div className="espera-logo">{initials(e.nombre)}</div>
                              <div>
                                <div className="espera-nombre">{e.nombre}</div>
                                <div className="espera-meta">{e.sector} · {e.contacto} · Solicitado: {e.solicitud}</div>
                              </div>
                            </div>
                            <div className="espera-header-right">
                              <span className="badge badge-pending">Pendiente</span>
                              <span className={`expand-arrow ${expanded === e.id ? "open" : ""}`}>▼</span>
                            </div>
                          </div>
                          {expanded === e.id && <EsperaBody e={e} estados={estados} razones={razones} setRazones={setRazones} showRazon={showRazon} setShowRazon={setShowRazon} aprobar={aprobar} rechazar={rechazar} />}
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {procesadas.length > 0 && (
                  <>
                    <div className="section-hdr" style={{marginTop:"8px", marginBottom:"14px"}}>
                      <div className="section-title">Ya procesadas <span className="section-count">{procesadas.length}</span></div>
                    </div>
                    <div className="espera-list">
                      {procesadas.map(e => (
                        <div className={`espera-card ${estadoCard(e)}`} key={e.id}>
                          <div className="espera-header" onClick={() => setExpanded(expanded === e.id ? null : e.id)}>
                            <div className="espera-header-left">
                              <div className="espera-logo">{initials(e.nombre)}</div>
                              <div>
                                <div className="espera-nombre">{e.nombre}</div>
                                <div className="espera-meta">{e.sector} · {e.contacto} · Solicitado: {e.solicitud}</div>
                              </div>
                            </div>
                            <div className="espera-header-right">
                              <span className={`badge badge-${estados[e.id] === "approved" ? "approved" : "rejected"}`}>
                                {estados[e.id] === "approved" ? "Aprobada" : "Rechazada"}
                              </span>
                              {estados[e.id] === "rejected" && razones[e.id] && (
                                <span style={{fontSize:"11px", color:"#dc2626", maxWidth:"180px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>
                                  Motivo: {razones[e.id]}
                                </span>
                              )}
                              <span className={`expand-arrow ${expanded === e.id ? "open" : ""}`}>▼</span>
                            </div>
                          </div>
                          {expanded === e.id && <EsperaBody e={e} estados={estados} razones={razones} setRazones={setRazones} showRazon={showRazon} setShowRazon={setShowRazon} aprobar={aprobar} rechazar={rechazar} />}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          {/* ════ EMPRESAS RELACIONADAS ════ */}
          {view === "relacionadas" && (
            <>
              <div className="topbar">
                <div className="topbar-left">
                  <div className="topbar-title">Empresas relacionadas con UTEQ & SkillMatch</div>
                  <div className="topbar-sub">{empresasRelacionadas.length} empresas con convenio activo o histórico</div>
                </div>
              </div>

              <div className="content">
                <div className="tabs">
                  {[["todas","Todas"], ["activa","Activas"], ["inactiva","Inactivas"]].map(([k,l])=>(
                    <button key={k} className={`tab ${tabRel===k?"active":""}`} onClick={()=>setTabRel(k)}>{l}</button>
                  ))}
                </div>
                <RelTable empresas={relFiltradas} onView={setModalEmpresa} />
              </div>
            </>
          )}

        </main>
      </div>

      {/* ── MODAL EMPRESA ── */}
      {modalEmpresa && (
        <div className="overlay" onClick={() => setModalEmpresa(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px"}}>
              <div style={{display:"flex", alignItems:"center", gap:"12px"}}>
                <div style={{width:"44px",height:"44px",borderRadius:"10px",background:"var(--primary)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"800",fontSize:"15px",color:"white"}}>
                  {initials(modalEmpresa.nombre)}
                </div>
                <div>
                  <div className="modal-title" style={{marginBottom:"0"}}>{modalEmpresa.nombre}</div>
                  <div style={{fontSize:"12px",color:"var(--muted)"}}>{modalEmpresa.sector}</div>
                </div>
              </div>
              <span className={`badge badge-${modalEmpresa.estado === "activa" ? "active" : "inactive"}`}>
                {modalEmpresa.estado === "activa" ? "Activa" : "Inactiva"}
              </span>
            </div>

            <div style={{
              background:"var(--green-bg)", border:"1.5px solid var(--green-border)",
              borderRadius:"10px", padding:"12px 16px", marginBottom:"18px",
              display:"flex", alignItems:"center", gap:"12px"
            }}>
              <span style={{fontSize:"18px",color:"#22c55e",fontWeight:"800"}}>✓</span>
              <div>
                <div style={{fontSize:"13px",fontWeight:"700",color:"var(--green)"}}>Aprobada por Servicios Escolares UTEQ</div>
                <div style={{fontSize:"12px",color:"var(--green)",marginTop:"1px"}}>Aprobación: {modalEmpresa.aprobacion} · Folio: <span style={{fontFamily:"monospace",fontWeight:"700"}}>{modalEmpresa.folio}</span></div>
              </div>
            </div>

            <div className="modal-section-title">Datos del convenio</div>
            <div className="modal-grid" style={{marginBottom:"16px"}}>
              {[
                ["Tipo de convenio", modalEmpresa.convenio],
                ["Vacantes activas", modalEmpresa.vacantes],
                ["Estudiantes contratados", modalEmpresa.contratados],
                ["Estatus", modalEmpresa.estado === "activa" ? "Vigente y activo" : "Sin actividad reciente"],
              ].map(([l,v])=>(
                <div key={l}>
                  <div className="mfield-label">{l}</div>
                  <div className="mfield-val">{v}</div>
                </div>
              ))}
            </div>

            <div style={{textAlign:"right", marginTop:"8px"}}>
              <button className="btn btn-ghost" onClick={() => setModalEmpresa(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── SUB-COMPONENT: Cuerpo expandible de empresa en espera ──────────────────

function EsperaBody({ e, estados, razones, setRazones, showRazon, setShowRazon, aprobar, rechazar }) {
  const estado = estados[e.id];
  return (
    <div className="espera-body">
      {/* COLUMNA IZQUIERDA */}
      <div className="espera-info-col">
        <div className="info-block">
          <div className="info-label">Descripción de la solicitud</div>
          <div className="espera-desc">{e.descripcion}</div>
        </div>
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px"}}>
          <div className="info-block">
            <div className="info-label">Razón social / RFC</div>
            <div className="info-val">{e.nombre}</div>
            <div className="info-val" style={{fontSize:"12px", color:"var(--muted)", marginTop:"2px", fontFamily:"monospace"}}>{e.rfc}</div>
          </div>
          <div className="info-block">
            <div className="info-label">Sector</div>
            <div className="info-val">{e.sector}</div>
          </div>
          <div className="info-block">
            <div className="info-label">Dirección</div>
            <div className="info-val">{e.direccion}</div>
          </div>
          <div className="info-block">
            <div className="info-label">Sitio web</div>
            <div className="info-val blue">{e.sitio}</div>
          </div>
          <div className="info-block">
            <div className="info-label">Empleados</div>
            <div className="info-val">{e.empleados}</div>
          </div>
          <div className="info-block">
            <div className="info-label">Año de fundación</div>
            <div className="info-val">{e.fundacion}</div>
          </div>
        </div>
      </div>

      {/* COLUMNA DERECHA */}
      <div className="espera-info-col">
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px", marginBottom:"16px"}}>
          <div className="info-block">
            <div className="info-label">Contacto</div>
            <div className="info-val">{e.contacto}</div>
          </div>
          <div className="info-block">
            <div className="info-label">Teléfono</div>
            <div className="info-val blue">{e.telefono}</div>
          </div>
          <div className="info-block" style={{gridColumn:"1/-1"}}>
            <div className="info-label">Correo electrónico</div>
            <div className="info-val blue">{e.correo}</div>
          </div>
          <div className="info-block">
            <div className="info-label">Tipo de convenio solicitado</div>
            <div className="info-val">{e.convenio}</div>
          </div>
          <div className="info-block">
            <div className="info-label">Carreras de interés</div>
            <div className="info-val">{e.carreras}</div>
          </div>
        </div>

        {/* ESTADO / ACCIONES */}
        {!estado && (
          <>
            {showRazon === e.id ? (
              <div>
                <div className="rechazo-label">Motivo de rechazo</div>
                <textarea
                  className="rechazo-input"
                  placeholder="Escribe el motivo del rechazo para notificar a la empresa..."
                  value={razones[e.id] || ""}
                  onChange={ev => setRazones(r => ({...r, [e.id]: ev.target.value}))}
                />
                <div className="espera-actions" style={{marginTop:"10px"}}>
                  <button className="btn btn-reject" onClick={() => rechazar(e.id)} disabled={!razones[e.id]?.trim()}>
                    Confirmar rechazo
                  </button>
                  <button className="btn btn-ghost" style={{fontSize:"12px",padding:"7px 14px"}} onClick={()=>setShowRazon(null)}>
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="espera-actions">
                <button className="btn btn-approve" onClick={() => aprobar(e.id)}>✓ Aprobar empresa</button>
                <button className="btn btn-reject" onClick={() => setShowRazon(e.id)}>✕ Rechazar</button>
              </div>
            )}
          </>
        )}

        {estado === "approved" && (
          <div style={{background:"var(--green-bg)", border:"1.5px solid var(--green-border)", borderRadius:"10px", padding:"14px 16px"}}>
            <div style={{fontSize:"13px", fontWeight:"700", color:"var(--green)"}}>✓ Empresa aprobada por Servicios Escolares UTEQ</div>
            <div style={{fontSize:"12px", color:"var(--green)", marginTop:"4px"}}>Se generará el folio de aprobación y se notificará a la empresa.</div>
          </div>
        )}

        {estado === "rejected" && (
          <div style={{background:"var(--red-bg)", border:"1.5px solid var(--red-border)", borderRadius:"10px", padding:"14px 16px"}}>
            <div style={{fontSize:"13px", fontWeight:"700", color:"var(--red)"}}>✕ Empresa rechazada</div>
            {razones[e.id] && (
              <div style={{fontSize:"12px", color:"var(--red)", marginTop:"4px"}}>
                <strong>Motivo:</strong> {razones[e.id]}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SUB-COMPONENT: Tabla empresas relacionadas ──────────────────────────────

function RelTable({ empresas, onView }) {
  return (
    <div className="rel-table-wrap">
      <div className="rel-table-hdr">
        <div>Empresa</div>
        <div>Sector</div>
        <div>Folio</div>
        <div>Aprobación</div>
        <div>Vacantes</div>
        <div>Contratados</div>
        <div>Estado</div>
      </div>
      {empresas.map(e => (
        <div className="rel-table-row" key={e.id} onClick={() => onView(e)}>
          <div>
            <div className="rel-nombre">{e.nombre}</div>
            <div className="rel-sector">{e.convenio}</div>
          </div>
          <div style={{fontSize:"13px", color:"var(--muted2)"}}>{e.sector}</div>
          <div className="rel-folio">{e.folio}</div>
          <div style={{fontSize:"13px", color:"var(--muted2)"}}>{e.aprobacion}</div>
          <div><span className="rel-num">{e.vacantes}</span></div>
          <div><span className="rel-num">{e.contratados}</span></div>
          <div>
            <span className={`badge badge-${e.estado === "activa" ? "active" : "inactive"}`}>
              {e.estado === "activa" ? "Activa" : "Inactiva"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
