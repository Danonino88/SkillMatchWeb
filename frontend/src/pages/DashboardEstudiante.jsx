import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const API_BASE = 'http://localhost:3000/api';

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
    --green: #244E7C;
    --green-bg: #e8f0fb;
    --green-border: #a5c9f5;
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

  .main { flex: 1; overflow-y: auto; }

  .topbar {
    padding: 14px clamp(14px, 2.2vw, 28px);
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
    position: sticky; top: 0; z-index: 20;
    box-shadow: 0 2px 8px rgba(35,46,86,0.07);
  }
  .topbar-left { display: flex; flex-direction: column; gap: 2px; }
  .topbar-title { font-size: 18px; font-weight: 700; color: var(--text); }
  .topbar-sub { font-size: 12px; color: var(--muted); font-weight: 500; }

  .content { padding: 22px clamp(14px, 2.2vw, 28px); max-width: var(--layout-max); margin: 0 auto; }

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

  .perfil-card {
    background: var(--primary-dark);
    border-radius: 14px;
    padding: 24px 28px;
    margin-bottom: 24px;
    display: flex; align-items: center; gap: 20px;
    box-shadow: 0 4px 20px rgba(35,46,86,0.2);
    position: relative; overflow: hidden;
  }
  .perfil-card::after {
    content:''; position:absolute; right:-30px; top:-30px;
    width:160px; height:160px; border-radius:50%;
    background: rgba(255,255,255,0.04); pointer-events:none;
  }
  .perf-avatar {
    width: 60px; height: 60px; border-radius: 50%;
    background: var(--primary);
    border: 3px solid rgba(255,255,255,0.25);
    display: flex; align-items: center; justify-content: center;
    font-size: 22px; font-weight: 800; color: white; flex-shrink: 0;
  }
  .perf-name { font-size: 18px; font-weight: 700; color: white; margin-bottom: 3px; }
  .perf-cargo { font-size: 13px; color: rgba(255,255,255,0.65); margin-bottom: 10px; }
  .perf-tags { display:flex; gap:8px; flex-wrap:wrap; }
  .perf-tag {
    padding: 4px 12px; border-radius: 20px;
    background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15);
    font-size: 11px; color: rgba(255,255,255,0.8); font-weight: 500;
  }

  .section-hdr { display:flex; align-items:center; justify-content:space-between; margin-bottom: 14px; }
  .section-title { font-size:15px; font-weight:700; color:var(--text); }
  .section-count { font-size:11px; font-weight:500; color:var(--muted); margin-left:8px; }

  .btn {
    padding: 9px 18px; border-radius: 8px; font-size: 13px; font-weight: 600;
    cursor: pointer; border: none; transition: all 0.18s; font-family: var(--font);
  }
  .btn-primary { background: var(--primary); color: white; }
  .btn-primary:hover { background: var(--primary-dark); box-shadow: 0 4px 14px rgba(36,78,124,0.25); transform: translateY(-1px); }
  .btn-ghost { background: white; color: var(--primary); border: 1.5px solid var(--primary); }
  .btn-ghost:hover { background: var(--primary); color: white; }
  .btn-danger { background: #b91c1c; color: white; }
  .btn-danger:hover { background: #991b1b; }
  .btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none !important; }

  .badge {
    display:inline-flex; align-items:center; gap:5px;
    padding:4px 10px; border-radius:20px;
    font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.4px;
  }
  .badge::before { content:''; width:5px; height:5px; border-radius:50%; background:currentColor; }
  .badge-pending { background: var(--amber-bg); color: var(--amber); }
  .badge-approved { background: var(--green-bg); color: var(--green); }
  .badge-active { background: var(--green-bg); color: var(--green); }
  .badge-inactive { background: #f3f4f6; color: #6b7280; }

  .upload-form-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 14px; padding: 24px;
    box-shadow: 0 2px 8px rgba(35,46,86,0.06);
  }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
  .form-field { display: flex; flex-direction: column; gap: 6px; }
  .form-label { font-size: 11px; font-weight: 700; color: var(--text); text-transform: uppercase; letter-spacing: 0.8px; }
  .form-input, .form-select, .form-textarea {
    padding: 10px 12px; border: 1.5px solid var(--border); border-radius: 8px;
    font-size: 13px; color: var(--text); font-family: var(--font);
    background: var(--bg); outline: none; transition: border-color 0.15s;
  }
  .form-input:focus, .form-select:focus, .form-textarea:focus { border-color: var(--primary); background: white; }
  .form-textarea { min-height: 110px; resize: vertical; }

  .alert {
    padding: 12px 16px; border-radius: 10px; font-size: 13px; font-weight: 600;
    margin-bottom: 16px; display: flex; align-items: center; gap: 10px;
  }
  .alert-success { background: var(--green-bg); border: 1.5px solid var(--green-border); color: var(--green); }
  .alert-error { background: var(--red-bg); border: 1.5px solid var(--red-border); color: var(--red); }

  .docs-table-wrap {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 12px; overflow: hidden;
    box-shadow: 0 2px 8px rgba(35,46,86,0.06);
  }
  .docs-table-hdr {
    display: grid; grid-template-columns: 2fr 1fr 1fr 1fr;
    padding: 11px 20px; background: var(--surface2);
    border-bottom: 1px solid var(--border);
    font-size: 10px; text-transform: uppercase; letter-spacing: 1px;
    color: var(--muted); font-weight: 700;
  }
  .docs-table-row {
    display: grid; grid-template-columns: 2fr 1fr 1fr 1fr;
    padding: 14px 20px; border-bottom: 1px solid var(--border);
    align-items: center; transition: background 0.15s;
  }
  .docs-table-row:last-child { border-bottom: none; }
  .docs-table-row:hover { background: #f7f9fc; }
  .doc-nombre { font-size: 13.5px; font-weight: 600; color: var(--text); }

  .empty-state {
    text-align: center; padding: 48px 24px;
    color: var(--muted);
  }
  .empty-icon { font-size: 40px; margin-bottom: 12px; opacity: 0.4; }
  .empty-title { font-size: 14px; font-weight: 700; margin-bottom: 6px; }
  .empty-sub { font-size: 13px; }

  .proyecto-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 12px; padding: 18px; margin-bottom: 12px;
    display: flex; align-items: flex-start; gap: 16px;
    box-shadow: 0 2px 8px rgba(35,46,86,0.06);
    transition: box-shadow 0.2s;
  }
  .proyecto-card:hover { box-shadow: 0 6px 20px rgba(35,46,86,0.11); }
  .proyecto-icon { font-size: 28px; flex-shrink: 0; }
  .proyecto-info { flex: 1; }
  .proyecto-name { font-size: 14px; font-weight: 700; color: var(--text); margin-bottom: 4px; }
  .proyecto-meta { font-size: 11px; color: var(--muted); margin-bottom: 8px; }
  .proyecto-desc { font-size: 12px; color: var(--muted2); margin-bottom: 10px; line-height: 1.5; }

  .perfil-view {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 14px; padding: 32px;
    box-shadow: 0 2px 8px rgba(35,46,86,0.06);
  }
  .perfil-head {
    display: flex; gap: 24px; align-items: flex-start; margin-bottom: 32px;
    border-bottom: 1px solid var(--border); padding-bottom: 24px;
  }
  .perfil-avatar-large {
    width: 100px; height: 100px; border-radius: 50%;
    background: var(--primary); border: 3px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    font-size: 40px; font-weight: 800; color: white; flex-shrink: 0;
  }
  .perfil-header-info { flex: 1; }
  .perfil-full-name { font-size: 24px; font-weight: 800; color: var(--text); margin-bottom: 8px; }
  .perfil-email { font-size: 14px; color: var(--muted2); margin-bottom: 4px; }
  .perfil-role { font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; font-weight: 700; }

  .perfil-fields {
    display: grid; grid-template-columns: 1fr 1fr; gap: 24px;
  }
  .perfil-field { display: flex; flex-direction: column; }
  .perfil-field-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--muted); font-weight: 700; margin-bottom: 8px; }
  .perfil-field-value { font-size: 14px; font-weight: 600; color: var(--text); }

  .loading-box, .error-box {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 18px;
    margin-bottom: 18px;
  }
  .error-box { border-color: var(--red-border); background: var(--red-bg); color: var(--red); }

  @media (max-width: 960px) {
    .app { flex-direction: column; }
    .sidebar { width: 100%; }
    .metrics { grid-template-columns: repeat(2, 1fr); }
    .form-row { grid-template-columns: 1fr; }
    .perfil-head { flex-direction: column; align-items: center; text-align: center; }
    .perfil-fields { grid-template-columns: 1fr; }
  }
`;

const initials = (name) =>
  name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'ES';

const formatFecha = (fecha) => {
  if (!fecha) return '—';
  const d = new Date(fecha);
  if (Number.isNaN(d.getTime())) return fecha;
  return d.toLocaleDateString('es-MX');
};

const badgeClassByEstado = (estado) => {
  if (estado === 'completado') return 'badge badge-active';
  if (estado === 'pausado') return 'badge badge-pending';
  return 'badge badge-approved';
};

const tecnologiasDisponibles = [
  'React',
  'Node.js',
  'Express',
  'MySQL',
  'PostgreSQL',
  'MongoDB',
  'JavaScript',
  'TypeScript',
  'PHP',
  'Laravel',
  'Python',
  'Django',
  'Java',
  'Spring Boot',
  'Flutter',
  'Firebase',
  'HTML',
  'CSS',
  'Tailwind',
  'Bootstrap',
  'Git',
  'GitHub',
  'Docker',
  'API REST'
];

export default function DashboardEstudiante() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [tecnologiasSeleccionadas, setTecnologiasSeleccionadas] = useState([]);
  const [imgPrincipal, setImgPrincipal] = useState(null);
  const imgProyectoRef = useRef(null);

  const toggleTecnologia = (tech) => {
  setTecnologiasSeleccionadas((prev) =>
    prev.includes(tech)
      ? prev.filter((t) => t !== tech)
      : [...prev, tech]
  );
};

const generarPDFPerfil = () => {
  const doc = new jsPDF();

  const estudianteInfo = dashboardData?.estudiante || {};
  const resumen = dashboardData?.resumen || {};

  const nombreCompleto = user.nombre
    ? `${user.nombre} ${user.apellido}`
    : 'Estudiante';

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('SkillMatch - Perfil del Estudiante', 14, 18);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-MX')}`, 14, 26);

  doc.setDrawColor(36, 78, 124);
  doc.line(14, 30, 196, 30);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Información del estudiante', 14, 40);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);

  const infoLines = [
    `Nombre: ${nombreCompleto}`,
    `Correo: ${user.correo || '—'}`,
    `Matrícula: ${estudianteInfo.matricula || '—'}`,
    `Carrera: ${estudianteInfo.carrera || '—'}`,
    `Semestre: ${estudianteInfo.semestre || '—'}`,
    `Proyectos registrados: ${resumen.proyectos_propios || 0}`,
    `Documentos / evidencias: ${resumen.documentos || 0}`,
  ];

  let y = 48;
  infoLines.forEach((line) => {
    doc.text(line, 14, y);
    y += 7;
  });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Proyectos realizados', 14, y + 6);

  const rows =
    proyectos.length > 0
      ? proyectos.map((p, index) => [
          index + 1,
          p.titulo || 'Sin título',
          p.descripcion || 'Sin descripción',
          p.estado || '—',
          formatFecha(p.fecha_registro),
        ])
      : [['—', 'Sin proyectos registrados', '', '', '']];

  autoTable(doc, {
    startY: y + 10,
    head: [['#', 'Proyecto', 'Descripción', 'Estado', 'Fecha']],
    body: rows,
    styles: {
      fontSize: 10,
      cellPadding: 3,
      overflow: 'linebreak',
      valign: 'middle',
    },
    headStyles: {
      fillColor: [36, 78, 124],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 42 },
      2: { cellWidth: 78 },
      3: { cellWidth: 24 },
      4: { cellWidth: 26 },
    },
  });

  const nombreArchivo = `perfil_${nombreCompleto.replace(/\s+/g, '_')}.pdf`;
  doc.save(nombreArchivo);
};

  const [view, setView] = useState('dashboard');

  const [dashboardData, setDashboardData] = useState(null);
  const [proyectos, setProyectos] = useState([]);
  const [evidencias, setEvidencias] = useState([]);

  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [loadingProyectos, setLoadingProyectos] = useState(false);
  const [loadingEvidencias, setLoadingEvidencias] = useState(false);
  const [globalError, setGlobalError] = useState('');

  const [tituloProyecto, setTituloProyecto] = useState('');
  const [descProyecto, setDescProyecto] = useState('');
  const [estadoProyecto, setEstadoProyecto] = useState('en progreso');

  const [savingProyecto, setSavingProyecto] = useState(false);
  const [uploadResult, setUploadResult] = useState('');
  const [uploadError, setUploadError] = useState('');

  const [editingProyectoId, setEditingProyectoId] = useState(null);

  const [archivoEvidencia, setArchivoEvidencia] = useState(null);
  const [tipoEvidencia, setTipoEvidencia] = useState('');
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState('');

  const evidenciaRef = useRef(null);

  const nombreCompleto = user.nombre ? `${user.nombre} ${user.apellido}` : 'Estudiante';

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const cargarDashboard = async () => {
    try {
      setLoadingDashboard(true);
      setGlobalError('');

      const res = await fetch(`${API_BASE}/estudiante/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.mensaje || 'No se pudo cargar el dashboard');
      }

      setDashboardData(data.dashboard);
    } catch (error) {
      setGlobalError(error.message);
    } finally {
      setLoadingDashboard(false);
    }
  };

  const cargarProyectos = async () => {
    try {
      setLoadingProyectos(true);

      const res = await fetch(`${API_BASE}/estudiante/proyectos`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.mensaje || 'No se pudieron cargar los proyectos');
      }

      setProyectos(data.proyectos || []);
    } catch (error) {
      setUploadError(error.message);
    } finally {
      setLoadingProyectos(false);
    }
  };

  const cargarEvidencias = async () => {
    try {
      setLoadingEvidencias(true);

      const res = await fetch(`${API_BASE}/estudiante/evidencias`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.mensaje || 'No se pudieron cargar las evidencias');
      }

      setEvidencias(data.evidencias || []);
    } catch (error) {
      setGlobalError(error.message);
    } finally {
      setLoadingEvidencias(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    cargarDashboard();
    cargarProyectos();
    cargarEvidencias();
  }, []);

  const limpiarFormularioProyecto = () => {
  setTituloProyecto('');
  setDescProyecto('');
  setEstadoProyecto('en progreso');
  setTecnologiasSeleccionadas([]);
  setImgPrincipal(null);
  setEditingProyectoId(null);
  setUploadError('');
  setUploadResult('');

  if (imgProyectoRef.current) {
    imgProyectoRef.current.value = '';
  }
};

  const limpiarFormularioEvidencia = () => {
    setArchivoEvidencia(null);
    setTipoEvidencia('');
    setProyectoSeleccionado('');
    setUploadError('');
    setUploadResult('');
    if (evidenciaRef.current) {
      evidenciaRef.current.value = '';
    }
  };

  const handleGuardarProyecto = async () => {
  setUploadError('');
  setUploadResult('');

  if (!tituloProyecto.trim()) {
    setUploadError('El título del proyecto es obligatorio.');
    return;
  }

  setSavingProyecto(true);

  try {
    const formData = new FormData();
    formData.append('titulo', tituloProyecto);
    formData.append('descripcion', descProyecto);
    formData.append('estado', estadoProyecto);
    formData.append('tecnologias', tecnologiasSeleccionadas.join(','));

    if (imgPrincipal) {
      formData.append('img_principal', imgPrincipal);
    }

    let res;

    if (editingProyectoId) {
      res = await fetch(`${API_BASE}/estudiante/proyectos/${editingProyectoId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
    } else {
      res = await fetch(`${API_BASE}/estudiante/proyectos`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
    }

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.mensaje || 'No se pudo guardar el proyecto');
    }

    setUploadResult(
      editingProyectoId
        ? 'Proyecto actualizado correctamente.'
        : 'Proyecto registrado correctamente.'
    );

    limpiarFormularioProyecto();
    await cargarProyectos();
    await cargarDashboard();
    setView('proyectos');
  } catch (error) {
    setUploadError(error.message);
  } finally {
    setSavingProyecto(false);
  }
};

const handleEditarProyecto = (proyecto) => {
  setTituloProyecto(proyecto.titulo || '');
  setDescProyecto(proyecto.descripcion || '');
  setEstadoProyecto(proyecto.estado || 'en progreso');
  setTecnologiasSeleccionadas(
    proyecto.tecnologias ? proyecto.tecnologias.split(',').map(t => t.trim()).filter(Boolean) : []
  );
  setImgPrincipal(null);
  setEditingProyectoId(proyecto.id_proyecto);
  setUploadError('');
  setUploadResult('');
  setView('subir');
};

  const handleEliminarProyecto = async (id) => {
    const confirmar = window.confirm('¿Seguro que deseas eliminar este proyecto?');
    if (!confirmar) return;

    try {
      const res = await fetch(`${API_BASE}/estudiante/proyectos/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.mensaje || 'No se pudo eliminar el proyecto');
      }

      await cargarProyectos();
      await cargarDashboard();
      await cargarEvidencias();
    } catch (error) {
      setGlobalError(error.message);
    }
  };

  const handleSubirEvidencia = async () => {
    setUploadError('');
    setUploadResult('');

    if (!proyectoSeleccionado) {
      setUploadError('Debes seleccionar un proyecto.');
      return;
    }

    if (!archivoEvidencia) {
      setUploadError('Debes seleccionar un archivo.');
      return;
    }

    setSavingProyecto(true);

    try {
      const formData = new FormData();
      formData.append('id_proyecto', proyectoSeleccionado);
      formData.append('tipo', tipoEvidencia || 'archivo');
      formData.append('archivo', archivoEvidencia);

      const res = await fetch(`${API_BASE}/estudiante/evidencias`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.mensaje || 'No se pudo subir la evidencia');
      }

      setUploadResult('Evidencia subida correctamente.');
      limpiarFormularioEvidencia();
      await cargarEvidencias();
      await cargarDashboard();
    } catch (error) {
      setUploadError(error.message);
    } finally {
      setSavingProyecto(false);
    }
  };

  const handleEliminarEvidencia = async (id) => {
    const confirmar = window.confirm('¿Seguro que deseas eliminar esta evidencia?');
    if (!confirmar) return;

    try {
      const res = await fetch(`${API_BASE}/estudiante/evidencias/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.mensaje || 'No se pudo eliminar la evidencia');
      }

      await cargarEvidencias();
      await cargarDashboard();
    } catch (error) {
      setGlobalError(error.message);
    }
  };

  const estudianteInfo = dashboardData?.estudiante || {};
  const resumen = dashboardData?.resumen || {};

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="brand">Skill<span>Match</span></div>
            <div className="brand-sub">Portal Estudiante</div>
          </div>

          <div className="nav-wrap">
            <div className="nav-group-label">Principal</div>

            <div className={`nav-item ${view === 'dashboard' ? 'active' : ''}`} onClick={() => setView('dashboard')}>
              <span className="nav-icon">◊</span> Dashboard
            </div>

            <div className={`nav-item ${view === 'proyectos' ? 'active' : ''}`} onClick={() => setView('proyectos')}>
              <span className="nav-icon">□</span> Mis proyectos
            </div>

            <div className={`nav-item ${view === 'documentos' ? 'active' : ''}`} onClick={() => setView('documentos')}>
              <span className="nav-icon">▮</span> Documentos
            </div>

            <div className="nav-group-label" style={{ marginTop: '8px' }}>Cuenta</div>

            <div className={`nav-item ${view === 'perfil' ? 'active' : ''}`} onClick={() => setView('perfil')}>
              <span className="nav-icon">●</span> Mi perfil
            </div>

            <div className="nav-item" onClick={cerrarSesion}>
              <span className="nav-icon">→</span> Cerrar sesión
            </div>
          </div>

          <div className="sidebar-user">
            <div className="user-avatar">{initials(nombreCompleto)}</div>
            <div>
              <div className="user-name">{nombreCompleto}</div>
              <div className="user-role">Estudiante</div>
            </div>
          </div>
        </aside>

        <main className="main">
          {globalError && (
            <div style={{ padding: '16px 20px 0 20px' }}>
              <div className="error-box">{globalError}</div>
            </div>
          )}

          {view === 'dashboard' && (
            <>
              <div className="topbar">
                <div className="topbar-left">
                  <div className="topbar-title">Dashboard — Estudiante</div>
                  <div className="topbar-sub">Bienvenido, {user.nombre || 'Estudiante'} · {user.correo}</div>
                </div>
                <button className="btn btn-primary" onClick={() => { limpiarFormularioProyecto(); setView('subir'); }}>
                  + Subir proyecto
                </button>
              </div>

              <div className="content">
                {loadingDashboard ? (
                  <div className="loading-box">Cargando dashboard...</div>
                ) : (
                  <>
                    <div className="perfil-card">
                      <div className="perf-avatar">{initials(nombreCompleto)}</div>
                      <div>
                        <div className="perf-name">{nombreCompleto}</div>
                        <div className="perf-cargo">
                          {estudianteInfo.carrera || 'Estudiante activo'} — SkillMatch
                        </div>
                        <div className="perf-tags">
                          <span className="perf-tag">📧 {user.correo}</span>
                          <span className="perf-tag">🎓 {estudianteInfo.matricula || 'Sin matrícula'}</span>
                          <span className="perf-tag">📚 {estudianteInfo.semestre ? `${estudianteInfo.semestre}° cuatrimestre` : 'Semestre no disponible'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="metrics">
                      <div className="metric-card" style={{ '--mc': '#244E7C' }}>
                        <span className="mc-icon">□</span>
                        <div className="mc-label">Proyectos propios</div>
                        <div className="mc-val">{resumen.proyectos_propios || 0}</div>
                        <div className="mc-sub">registrados en plataforma</div>
                      </div>

                      <div className="metric-card" style={{ '--mc': '#22c55e' }}>
                        <span className="mc-icon">▲</span>
                        <div className="mc-label">Carrera</div>
                        <div className="mc-val" style={{ fontSize: '18px', lineHeight: 1.2 }}>
                          {estudianteInfo.carrera || '—'}
                        </div>
                        <div className="mc-sub">perfil académico</div>
                      </div>

                      <div className="metric-card" style={{ '--mc': '#f59e0b' }}>
                        <span className="mc-icon">▬</span>
                        <div className="mc-label">Matrícula</div>
                        <div className="mc-val" style={{ fontSize: '24px' }}>
                          {estudianteInfo.matricula || '—'}
                        </div>
                        <div className="mc-sub">identificador escolar</div>
                      </div>

                      <div className="metric-card" style={{ '--mc': '#232E56' }}>
                        <span className="mc-icon">▮</span>
                        <div className="mc-label">Documentos</div>
                        <div className="mc-val">{resumen.documentos || 0}</div>
                        <div className="mc-sub">relacionados a proyectos</div>
                      </div>
                    </div>

                    <div className="section-hdr">
                      <div className="section-title">Acceso rápido</div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
                      {[
                        { icon: '□', title: 'Mis proyectos', sub: 'Gestiona tus proyectos académicos', action: () => setView('proyectos') },
                        { icon: '▮', title: 'Documentos', sub: 'Consulta tus documentos asociados', action: () => setView('documentos') },
                        { icon: '●', title: 'Mi perfil', sub: 'Datos personales y académicos', action: () => setView('perfil') },
                      ].map((item, i) => (
                        <div
                          key={i}
                          onClick={item.action}
                          style={{
                            background: 'white',
                            border: '1px solid var(--border)',
                            borderRadius: '12px',
                            padding: '20px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: '0 2px 8px rgba(35,46,86,0.06)',
                          }}
                        >
                          <div style={{ fontSize: '28px', marginBottom: '10px' }}>{item.icon}</div>
                          <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text)', marginBottom: '4px' }}>{item.title}</div>
                          <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{item.sub}</div>
                        </div>
                      ))}
                    </div>

                    {proyectos.length > 0 && (
                      <>
                        <div className="section-hdr">
                          <div className="section-title">
                            Últimos proyectos <span className="section-count">{proyectos.length}</span>
                          </div>
                          <button className="btn btn-ghost" style={{ fontSize: '12px', padding: '7px 14px' }} onClick={() => setView('proyectos')}>
                            Ver todos →
                          </button>
                        </div>

                        <div>
                          {proyectos.slice(0, 3).map((p) => (
                            <div key={p.id_proyecto} className="proyecto-card">
                              <div className="proyecto-icon">□</div>
                              <div className="proyecto-info">
                                <div className="proyecto-name">{p.titulo}</div>
                                <div className="proyecto-meta">
                                  Fecha: {formatFecha(p.fecha_registro)}
                                </div>
                                <div className="proyecto-desc">
                                  {p.descripcion || 'Sin descripción'}
                                </div>
                              </div>
                              <div>
                                <span className={badgeClassByEstado(p.estado)}>
                                  {p.estado}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </>
          )}

          {view === 'subir' && (
            <>
              <div className="topbar">
                <div className="topbar-left">
                  <div className="topbar-title">
                    {editingProyectoId ? 'Editar proyecto' : 'Subir proyecto'}
                  </div>
                  <div className="topbar-sub">
                    Registra tu proyecto académico en la plataforma
                  </div>
                </div>
              </div>

              <div className="content">
                <div style={{ maxWidth: '760px' }}>
                  {uploadResult && (
                    <div className="alert alert-success">
                      <span>✓</span> {uploadResult}
                    </div>
                  )}

                  {uploadError && (
                    <div className="alert alert-error">
                      <span>✕</span> {uploadError}
                    </div>
                  )}

                  <div className="upload-form-card">
                    <div className="section-hdr" style={{ marginBottom: '20px' }}>
                      <div className="section-title">Información del proyecto</div>
                    </div>

                    <div className="form-row">
                      <div className="form-field" style={{ gridColumn: '1 / -1' }}>
                        <label className="form-label">Título del proyecto *</label>
                        <input
                          className="form-input"
                          type="text"
                          placeholder="Ej: Sistema de gestión de inventarios"
                          value={tituloProyecto}
                          onChange={(e) => setTituloProyecto(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-field" style={{ gridColumn: '1 / -1' }}>
                        <label className="form-label">Descripción</label>
                        <textarea
                          className="form-textarea"
                          placeholder="Describe brevemente tu proyecto"
                          value={descProyecto}
                          onChange={(e) => setDescProyecto(e.target.value)}
                        />
                      </div>
                    </div>

                                  <div className="form-row">
                <div className="form-field" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Imagen principal</label>
                  <input
                    className="form-input"
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    ref={imgProyectoRef}
                    onChange={(e) => {
                      if (e.target.files[0]) {
                        setImgPrincipal(e.target.files[0]);
                      }
                    }}
                  />
                  {imgPrincipal && (
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '6px' }}>
                      Imagen seleccionada: <strong>{imgPrincipal.name}</strong>
                    </div>
                  )}
                </div>
              </div>


                              <div className="form-row">
                  <div className="form-field" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Tecnologías usadas</label>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                      {tecnologiasDisponibles.map((tech) => {
                        const selected = tecnologiasSeleccionadas.includes(tech);

                        return (
                          <button
                            key={tech}
                            type="button"
                            onClick={() => toggleTecnologia(tech)}
                            style={{
                              padding: '7px 12px',
                              borderRadius: '20px',
                              border: selected ? '1px solid var(--primary)' : '1px solid var(--border)',
                              background: selected ? 'var(--primary)' : 'white',
                              color: selected ? 'white' : 'var(--text)',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'all 0.15s'
                            }}
                          >
                            {tech}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                    <div className="form-row">
                      <div className="form-field">
                        <label className="form-label">Estado</label>
                        <select
                          className="form-select"
                          value={estadoProyecto}
                          onChange={(e) => setEstadoProyecto(e.target.value)}
                        >
                          <option value="en progreso">En progreso</option>
                          <option value="completado">Completado</option>
                          <option value="pausado">Pausado</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '24px', justifyContent: 'flex-end' }}>
                      <button
                        className="btn btn-ghost"
                        onClick={limpiarFormularioProyecto}
                        disabled={savingProyecto}
                      >
                        Limpiar
                      </button>

                      <button
                        className="btn btn-primary"
                        onClick={handleGuardarProyecto}
                        disabled={savingProyecto}
                      >
                        {savingProyecto
                          ? 'Guardando...'
                          : editingProyectoId
                            ? 'Guardar cambios'
                            : '+ Registrar proyecto'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {view === 'documentos' && (
            <>
              <div className="topbar">
                <div className="topbar-left">
                  <div className="topbar-title">Documentos / Evidencias</div>
                  <div className="topbar-sub">{evidencias.length} archivos asociados a tus proyectos</div>
                </div>
              </div>

              <div className="content">
                {uploadResult && (
                  <div className="alert alert-success">
                    <span>✓</span> {uploadResult}
                  </div>
                )}

                {uploadError && (
                  <div className="alert alert-error">
                    <span>✕</span> {uploadError}
                  </div>
                )}

                <div className="upload-form-card" style={{ marginBottom: '20px' }}>
                  <div className="section-hdr" style={{ marginBottom: '20px' }}>
                    <div className="section-title">Subir evidencia</div>
                  </div>

                  <div className="form-row">
                    <div className="form-field">
                      <label className="form-label">Proyecto *</label>
                      <select
                        className="form-select"
                        value={proyectoSeleccionado}
                        onChange={(e) => setProyectoSeleccionado(e.target.value)}
                      >
                        <option value="">Selecciona un proyecto</option>
                        {proyectos.map((p) => (
                          <option key={p.id_proyecto} value={p.id_proyecto}>
                            {p.titulo}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-field">
                      <label className="form-label">Tipo</label>
                      <input
                        className="form-input"
                        type="text"
                        placeholder="Ej: imagen, pdf, zip, fuente"
                        value={tipoEvidencia}
                        onChange={(e) => setTipoEvidencia(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-field" style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label">Archivo *</label>
                      <input
                        className="form-input"
                        type="file"
                        ref={evidenciaRef}
                        onChange={(e) => {
                          if (e.target.files[0]) {
                            setArchivoEvidencia(e.target.files[0]);
                          }
                        }}
                      />
                    </div>
                  </div>

                  {archivoEvidencia && (
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '12px' }}>
                      Archivo seleccionado: <strong>{archivoEvidencia.name}</strong>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button
                      className="btn btn-ghost"
                      onClick={limpiarFormularioEvidencia}
                      disabled={savingProyecto}
                    >
                      Limpiar
                    </button>

                    <button
                      className="btn btn-primary"
                      onClick={handleSubirEvidencia}
                      disabled={savingProyecto}
                    >
                      {savingProyecto ? 'Subiendo...' : 'Subir evidencia'}
                    </button>
                  </div>
                </div>

                {loadingEvidencias ? (
                  <div className="loading-box">Cargando evidencias...</div>
                ) : evidencias.length === 0 ? (
                  <div className="docs-table-wrap">
                    <div className="empty-state">
                      <div className="empty-icon">📂</div>
                      <div className="empty-title">No tienes evidencias registradas</div>
                      <div className="empty-sub">Sube tu primer archivo para que aparezca aquí</div>
                    </div>
                  </div>
                ) : (
                  <DocsTable evidencias={evidencias} onEliminar={handleEliminarEvidencia} />
                )}
              </div>
            </>
          )}

          {view === 'proyectos' && (
            <>
              <div className="topbar">
                <div className="topbar-left">
                  <div className="topbar-title">Mis proyectos</div>
                  <div className="topbar-sub">{proyectos.length} proyectos en tu cartera académica</div>
                </div>
                <button className="btn btn-primary" onClick={() => { limpiarFormularioProyecto(); setView('subir'); }}>
                  + Agregar proyecto
                </button>
              </div>

              <div className="content">
                {loadingProyectos ? (
                  <div className="loading-box">Cargando proyectos...</div>
                ) : proyectos.length === 0 ? (
                  <div className="docs-table-wrap">
                    <div className="empty-state">
                      <div className="empty-icon">□</div>
                      <div className="empty-title">No tienes proyectos aún</div>
                      <div className="empty-sub">Comienza registrando tu primer proyecto</div>
                      <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => { limpiarFormularioProyecto(); setView('subir'); }}>
                        + Agregar primer proyecto
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                                    {proyectos.map((p) => (
                  <div key={p.id_proyecto} className="proyecto-card">
                    <div className="proyecto-icon">□</div>

                    <div className="proyecto-info">
                      <div className="proyecto-name">{p.titulo}</div>

                      <div className="proyecto-meta">
                        Actualizado: {formatFecha(p.fecha_registro)}
                      </div>

                      <div className="proyecto-desc">
                        {p.descripcion || 'Sin descripción'}
                      </div>

                      {p.img_principal && (
                        <div style={{ marginBottom: '10px' }}>
                          <img
                            src={`http://localhost:3000/uploads/${p.img_principal}`}
                            alt={p.titulo}
                            style={{
                              width: '100%',
                              maxWidth: '220px',
                              height: '120px',
                              objectFit: 'cover',
                              borderRadius: '10px',
                              border: '1px solid var(--border)'
                            }}
                          />
                        </div>
                      )}

                      {p.tecnologias && (
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                          {p.tecnologias.split(',').map((tech, idx) => (
                            <span
                              key={idx}
                              style={{
                                padding: '4px 10px',
                                borderRadius: '16px',
                                background: 'var(--surface2)',
                                border: '1px solid var(--border)',
                                fontSize: '11px',
                                fontWeight: '600',
                                color: 'var(--muted)'
                              }}
                            >
                              {tech.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span className={badgeClassByEstado(p.estado)}>
                        {p.estado}
                      </span>

                      <button
                        className="btn btn-ghost"
                        style={{ fontSize: '12px', padding: '7px 14px' }}
                        onClick={() => handleEditarProyecto(p)}
                      >
                        Editar
                      </button>

                      <button
                        className="btn btn-danger"
                        style={{ fontSize: '12px', padding: '7px 14px' }}
                        onClick={() => handleEliminarProyecto(p.id_proyecto)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
                                  </div>
                                )}
                              </div>
                            </>
                          )}

          {view === 'perfil' && (
            <>
              <div className="topbar">
                <div className="topbar-left">
                  <div className="topbar-title">Mi perfil</div>
                  <div className="topbar-sub">Información personal y académica</div>
                </div>
                  <button className="btn btn-primary" onClick={generarPDFPerfil}>
                    Descargar mI portafolio de proyectos
                  </button>

              </div>

              <div className="content">
                <div className="perfil-view">
                  <div className="perfil-head">
                    <div className="perfil-avatar-large">{initials(nombreCompleto)}</div>
                    <div className="perfil-header-info">
                      <div className="perfil-full-name">{nombreCompleto}</div>
                      <div className="perfil-email">{user.correo}</div>
                      <div className="perfil-role">Estudiante activo</div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      Información personal
                    </div>

                    <div className="perfil-fields">
                      <div className="perfil-field">
                        <div className="perfil-field-label">Nombre completo</div>
                        <div className="perfil-field-value">{nombreCompleto}</div>
                      </div>

                      <div className="perfil-field">
                        <div className="perfil-field-label">Correo institucional</div>
                        <div className="perfil-field-value">{user.correo}</div>
                      </div>

                      <div className="perfil-field">
                        <div className="perfil-field-label">Matrícula</div>
                        <div className="perfil-field-value">{estudianteInfo.matricula || '—'}</div>
                      </div>

                      <div className="perfil-field">
                        <div className="perfil-field-label">Carrera</div>
                        <div className="perfil-field-value">{estudianteInfo.carrera || '—'}</div>
                      </div>

                      <div className="perfil-field">
                        <div className="perfil-field-label">Semestre</div>
                        <div className="perfil-field-value">{estudianteInfo.semestre || '—'}</div>
                      </div>

                      <div className="perfil-field">
                        <div className="perfil-field-label">ID de usuario</div>
                        <div className="perfil-field-value">#{user.id_usuario}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
}

function DocsTable({ evidencias, onEliminar }) {
  return (
    <div className="docs-table-wrap">
      <div className="docs-table-hdr">
        <div>Archivo</div>
        <div>Proyecto</div>
        <div>Tipo</div>
        <div>Fecha</div>
        <div>Acciones</div>
      </div>

      {evidencias.map((ev) => (
        <div className="docs-table-row" key={ev.id_evidencia}>
          <div>
            <div className="doc-nombre">
              {ev.nombre_original || ev.ruta_archivo?.split('/').pop()}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
              <a
                href={`http://localhost:3000/uploads/${ev.ruta_archivo}`}
                target="_blank"
                rel="noreferrer"
                style={{ color: 'var(--primary)' }}
              >
                Ver archivo
              </a>
            </div>
          </div>

          <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
            {ev.proyecto_titulo}
          </div>

          <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
            {ev.tipo || 'archivo'}
          </div>

          <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
            {formatFecha(ev.fecha_subida)}
          </div>

          <div>
            <button
              className="btn btn-danger"
              style={{ fontSize: '12px', padding: '7px 14px' }}
              onClick={() => onEliminar(ev.id_evidencia)}
            >
              Eliminar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}