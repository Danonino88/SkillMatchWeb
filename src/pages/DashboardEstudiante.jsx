import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost/SkillMatchWeb/backend';

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
  .topbar-left { display: flex; flex-direction: column; gap: 2px; }
  .topbar-title { font-size: 18px; font-weight: 700; color: var(--text); }
  .topbar-sub { font-size: 12px; color: var(--muted); font-weight: 500; }

  /* ── CONTENT ── */
  .content { padding: 22px clamp(14px, 2.2vw, 28px); max-width: var(--layout-max); margin: 0 auto; }

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

  /* ── PERFIL CARD ── */
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

  /* ── SECTION HEADER ── */
  .section-hdr { display:flex; align-items:center; justify-content:space-between; margin-bottom: 14px; }
  .section-title { font-size:15px; font-weight:700; color:var(--text); }
  .section-count { font-size:11px; font-weight:500; color:var(--muted); margin-left:8px; }

  /* ── BUTTONS ── */
  .btn {
    padding: 9px 18px; border-radius: 8px; font-size: 13px; font-weight: 600;
    cursor: pointer; border: none; transition: all 0.18s; font-family: var(--font);
  }
  .btn-primary { background: var(--primary); color: white; }
  .btn-primary:hover { background: var(--primary-dark); box-shadow: 0 4px 14px rgba(36,78,124,0.25); transform: translateY(-1px); }
  .btn-ghost { background: white; color: var(--primary); border: 1.5px solid var(--primary); }
  .btn-ghost:hover { background: var(--primary); color: white; }
  .btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none !important; }

  /* ── BADGE ── */
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

  /* ── UPLOAD ZONE ── */
  .upload-zone {
    border: 2px dashed var(--border2);
    border-radius: 14px;
    padding: 40px 24px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
    background: var(--surface);
    position: relative;
  }
  .upload-zone:hover, .upload-zone.dragover {
    border-color: var(--primary);
    background: #f0f5ff;
  }
  .upload-icon { font-size: 40px; margin-bottom: 12px; }
  .upload-title { font-size: 15px; font-weight: 700; color: var(--text); margin-bottom: 6px; }
  .upload-sub { font-size: 12px; color: var(--muted); margin-bottom: 16px; }
  .upload-types {
    display: flex; gap: 6px; justify-content: center; flex-wrap: wrap;
  }
  .upload-type {
    padding: 3px 10px; border-radius: 20px;
    background: var(--surface2); border: 1px solid var(--border);
    font-size: 10px; font-weight: 700; color: var(--muted); text-transform: uppercase;
  }

  /* ── FILE PREVIEW ── */
  .file-preview {
    display: flex; align-items: center; gap: 14px;
    background: var(--surface2); border: 1.5px solid var(--border);
    border-radius: 10px; padding: 14px 16px; margin-top: 14px;
  }
  .file-icon { font-size: 28px; flex-shrink: 0; }
  .file-name { font-size: 13px; font-weight: 700; color: var(--text); }
  .file-size { font-size: 11px; color: var(--muted); margin-top: 2px; }
  .file-remove {
    margin-left: auto; background: none; border: none;
    color: var(--muted); font-size: 18px; cursor: pointer;
    width: 28px; height: 28px; border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.15s;
  }
  .file-remove:hover { background: var(--red-bg); color: var(--red); }

  /* ── UPLOAD FORM ── */
  .upload-form-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 14px; padding: 24px;
    box-shadow: 0 2px 8px rgba(35,46,86,0.06);
  }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
  .form-field { display: flex; flex-direction: column; gap: 6px; }
  .form-label { font-size: 11px; font-weight: 700; color: var(--text); text-transform: uppercase; letter-spacing: 0.8px; }
  .form-input {
    padding: 10px 12px; border: 1.5px solid var(--border); border-radius: 8px;
    font-size: 13px; color: var(--text); font-family: var(--font);
    background: var(--bg); outline: none; transition: border-color 0.15s;
  }
  .form-input:focus { border-color: var(--primary); background: white; }
  .form-select {
    padding: 10px 12px; border: 1.5px solid var(--border); border-radius: 8px;
    font-size: 13px; color: var(--text); font-family: var(--font);
    background: var(--bg); outline: none; cursor: pointer;
    transition: border-color 0.15s;
  }
  .form-select:focus { border-color: var(--primary); background: white; }

  /* ── ALERT ── */
  .alert {
    padding: 12px 16px; border-radius: 10px; font-size: 13px; font-weight: 600;
    margin-bottom: 16px; display: flex; align-items: center; gap: 10px;
  }
  .alert-success { background: var(--green-bg); border: 1.5px solid var(--green-border); color: var(--green); }
  .alert-error { background: var(--red-bg); border: 1.5px solid var(--red-border); color: var(--red); }

  /* ── DOCS TABLE ── */
  .docs-table-wrap {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 12px; overflow: hidden;
    box-shadow: 0 2px 8px rgba(35,46,86,0.06);
  }
  .docs-table-hdr {
    display: grid; grid-template-columns: 2fr 1fr 1fr 1.5fr 80px;
    padding: 11px 20px; background: var(--surface2);
    border-bottom: 1px solid var(--border);
    font-size: 10px; text-transform: uppercase; letter-spacing: 1px;
    color: var(--muted); font-weight: 700;
  }
  .docs-table-row {
    display: grid; grid-template-columns: 2fr 1fr 1fr 1.5fr 80px;
    padding: 14px 20px; border-bottom: 1px solid var(--border);
    align-items: center; transition: background 0.15s;
  }
  .docs-table-row:last-child { border-bottom: none; }
  .docs-table-row:hover { background: #f7f9fc; }
  .doc-nombre { font-size: 13.5px; font-weight: 600; color: var(--text); }
  .doc-hash { font-size: 10px; color: var(--muted2); font-family: monospace; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 280px; }

  /* ── PROGRESS BAR ── */
  .progress-wrap { margin-top: 14px; }
  .progress-label { font-size: 11px; font-weight: 700; color: var(--muted); margin-bottom: 6px; display: flex; justify-content: space-between; }
  .progress-bar { height: 6px; background: var(--surface2); border-radius: 10px; overflow: hidden; }
  .progress-fill { height: 100%; background: var(--primary); border-radius: 10px; transition: width 0.3s ease; }

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

  /* ── EMPTY STATE ── */
  .empty-state {
    text-align: center; padding: 48px 24px;
    color: var(--muted);
  }
  .empty-icon { font-size: 40px; margin-bottom: 12px; opacity: 0.4; }
  .empty-title { font-size: 14px; font-weight: 700; margin-bottom: 6px; }
  .empty-sub { font-size: 13px; }

  /* ── PROYECTOS CARD ── */
  .proyecto-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 12px; padding: 18px; margin-bottom: 12px;
    display: flex; align-items: center; gap: 16px;
    box-shadow: 0 2px 8px rgba(35,46,86,0.06);
    transition: box-shadow 0.2s;
  }
  .proyecto-card:hover { box-shadow: 0 6px 20px rgba(35,46,86,0.11); }
  .proyecto-icon { font-size: 28px; flex-shrink: 0; }
  .proyecto-info { flex: 1; }
  .proyecto-name { font-size: 14px; font-weight: 700; color: var(--text); margin-bottom: 4px; }
  .proyecto-meta { font-size: 11px; color: var(--muted); margin-bottom: 8px; }
  .proyecto-progress { margin-bottom: 2px; }

  /* ── CALIFICACIONES TABLE ── */
  .calif-table {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 12px; overflow: hidden;
    box-shadow: 0 2px 8px rgba(35,46,86,0.06);
  }
  .calif-row {
    display: grid; grid-template-columns: 2fr 1fr 1fr;
    padding: 16px 20px; border-bottom: 1px solid var(--border);
    align-items: center;
  }
  .calif-row:last-child { border-bottom: none; }
  .calif-row:hover { background: var(--surface2); }
  .calif-materia { font-size: 13px; font-weight: 600; color: var(--text); }
  .calif-val { font-size: 15px; font-weight: 800; color: var(--primary); }
  .calif-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; background: var(--green-bg); color: var(--green); font-size: 11px; font-weight: 700; }

  /* ── PERFIL VIEW ── */
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

  @media (max-width: 960px) {
    .app { flex-direction: column; }
    .sidebar { width: 100%; }
    .metrics { grid-template-columns: repeat(2, 1fr); }
    .form-row { grid-template-columns: 1fr; }
    .docs-table-hdr, .docs-table-row { grid-template-columns: 2fr 1fr 1fr 80px; }
    .docs-table-hdr > :nth-child(4), .docs-table-row > :nth-child(4) { display: none; }
    .perfil-head { flex-direction: column; align-items: center; text-align: center; }
    .perfil-fields { grid-template-columns: 1fr; }
  }
`;

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const fileIcon = (ext) => {
  const icons = { pdf: '▬', png: '◆', jpg: '◆', jpeg: '◆', docx: '▮', xlsx: '▥' };
  return icons[ext?.toLowerCase()] || '📎';
};

const formatBytes = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const initials = (name) => name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'ES';

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function DashboardEstudiante() {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');

  const [view, setView] = useState('dashboard');

  // Formulario subir proyecto
  const [nombreProyecto, setNombreProyecto] = useState('');
  const [descProyecto, setDescProyecto] = useState('');
  const [githubLink, setGithubLink] = useState('');
  const [fileManual, setFileManual] = useState(null);
  const [dragover, setDragover] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [docs, setDocs] = useState([]);
  const fileRef = useRef();

  // CV Upload
  const [fileCv, setFileCv] = useState(null);
  const [cvUploading, setCvUploading] = useState(false);
  const [cvError, setCvError] = useState('');
  const [cvSuccess, setCvSuccess] = useState('');
  const cvRef = useRef();

  // Proyectos propios
  const [proyectos, setProyectos] = useState([
    { id: 1, nombre: 'Sistema de inventarios', estado: 'en-progreso', fecha: '2025-03-10', progreso: 65 },
    { id: 2, nombre: 'App móvil de consulta', estado: 'completado', fecha: '2025-02-28', progreso: 100 },
  ]);

  // Calificaciones
  const [calificaciones] = useState([
    { materia: 'Programación Web', calificacion: 9.2, estado: 'aprobado' },
    { materia: 'Bases de datos', calificacion: 8.8, estado: 'aprobado' },
    { materia: 'Desarrollo móvil', calificacion: 9.5, estado: 'aprobado' },
  ]);

  const nombreCompleto = user.nombre ? `${user.nombre} ${user.apellido}` : 'Estudiante';

  const handleFile = (f) => {
    const allowed = ['pdf', 'docx'];
    const ext = f.name.split('.').pop().toLowerCase();
    if (!allowed.includes(ext)) {
      setUploadError('Solo se permiten archivos PDF o DOCX para el manual.');
      return;
    }
    setFileManual(f);
    setUploadError('');
    setUploadResult(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragover(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handleUpload = async () => {
    if (!nombreProyecto.trim()) { setUploadError('El nombre del proyecto es requerido.'); return; }
    if (!fileManual) { setUploadError('Debes subir el manual de usuario.'); return; }

    setUploading(true);
    setUploadError('');
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('id_usuario', user.id_usuario);
      formData.append('nombre_proyecto', nombreProyecto);
      formData.append('desc_proyecto', descProyecto);
      formData.append('archivo', fileManual);

      const res = await fetch(`${API_BASE}/upload/upload_file.php`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setUploadError(data.error || 'Error al subir el archivo.');
        return;
      }

      setUploadResult(data);
      setDocs(prev => [{
        id: Date.now(),
        proyecto: nombreProyecto,
        github: githubLink,
        nombre: fileManual.name,
        tipo: 'Manual de usuario',
        fecha: new Date().toLocaleDateString('es-MX'),
        sha256: data.sha256,
      }, ...prev]);

      setNombreProyecto('');
      setDescProyecto('');
      setGithubLink('');
      setFileManual(null);

    } catch (err) {
      setUploadError('Error de conexión: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="app">

        {/* ── SIDEBAR ── */}
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
            <div className={`nav-item ${view === 'calificaciones' ? 'active' : ''}`} onClick={() => setView('calificaciones')}>
              <span className="nav-icon">▲</span> Calificaciones
            </div>
            <div className={`nav-item ${view === 'cv' ? 'active' : ''}`} onClick={() => setView('cv')}>
              <span className="nav-icon">▬</span> Mi CV
            </div>
            <div className={`nav-item ${view === 'documentos' ? 'active' : ''}`} onClick={() => setView('documentos')}>
              <span className="nav-icon">▮</span> Documentos
            </div>
            <div className="nav-group-label" style={{ marginTop: '8px' }}>Cuenta</div>
            <div className={`nav-item ${view === 'perfil' ? 'active' : ''}`} onClick={() => setView('perfil')}>
              <span className="nav-icon">●</span> Mi perfil
            </div>
            <div className="nav-item" onClick={() => navigate('/login')}>
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

        {/* ── MAIN ── */}
        <main className="main">

          {/* ════ DASHBOARD ════ */}
          {view === 'dashboard' && (
            <>
              <div className="topbar">
                <div className="topbar-left">
                  <div className="topbar-title">Dashboard — Estudiante</div>
                  <div className="topbar-sub">Bienvenido, {user.nombre || 'Estudiante'} · {user.correo}</div>
                </div>
                <button className="btn btn-primary" onClick={() => setView('subir')}>
                  + Subir proyecto
                </button>
              </div>

              <div className="content">

                {/* PERFIL */}
                <div className="perfil-card">
                  <div className="perf-avatar">{initials(nombreCompleto)}</div>
                  <div>
                    <div className="perf-name">{nombreCompleto}</div>
                    <div className="perf-cargo">Estudiante activo — SkillMatch</div>
                    <div className="perf-tags">
                      <span className="perf-tag">📧 {user.correo}</span>
                      <span className="perf-tag">🎓 {user.nombre_rol || 'Estudiante'}</span>
                      <span className="perf-tag">✓ Cuenta activa</span>
                    </div>
                  </div>
                </div>

                {/* METRICS */}
                <div className="metrics">
                  <div className="metric-card" style={{ '--mc': '#244E7C' }}>
                    <span className="mc-icon">□</span>
                    <div className="mc-label">Proyectos propios</div>
                    <div className="mc-val">{proyectos.length}</div>
                    <div className="mc-sub">en desarrollo</div>
                  </div>
                  <div className="metric-card" style={{ '--mc': '#22c55e' }}>
                    <span className="mc-icon">▲</span>
                    <div className="mc-label">Promedio de calificación</div>
                    <div className="mc-val">9.2</div>
                    <div className="mc-sub">excelente desempeño</div>
                  </div>
                  <div className="metric-card" style={{ '--mc': '#f59e0b' }}>
                    <span className="mc-icon">▬</span>
                    <div className="mc-label">CV registrado</div>
                    <div className="mc-val">{fileCv ? 'Sí' : 'No'}</div>
                    <div className="mc-sub">listo para empresas</div>
                  </div>
                  <div className="metric-card" style={{ '--mc': '#232E56' }}>
                    <span className="mc-icon">▮</span>
                    <div className="mc-label">Documentos</div>
                    <div className="mc-val">{docs.length}</div>
                    <div className="mc-sub">verificados</div>
                  </div>
                </div>

                {/* ACCESO RÁPIDO */}
                <div className="section-hdr">
                  <div className="section-title">Acceso rápido</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
                  {[
                    { icon: '□', title: 'Mis proyectos', sub: 'Gestiona tus proyectos académicos', action: () => setView('proyectos'), color: '#244E7C' },
                    { icon: '▲', title: 'Calificaciones', sub: 'Revisa tu desempeño académico', action: () => setView('calificaciones'), color: '#232E56' },
                    { icon: '▬', title: 'Mi CV', sub: 'Sube y actualiza tu CV', action: () => setView('cv'), color: '#166534' },
                    { icon: '●', title: 'Mi perfil', sub: 'Datos personales y contacto', action: () => setView('perfil'), color: '#f59e0b' },
                  ].map((item, i) => (
                    <div
                      key={i}
                      onClick={item.action}
                      style={{
                        background: 'white', border: '1px solid var(--border)',
                        borderRadius: '12px', padding: '20px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: '0 2px 8px rgba(35,46,86,0.06)',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 6px 20px rgba(35,46,86,0.12)')}
                      onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(35,46,86,0.06)')}
                    >
                      <div style={{ fontSize: '28px', marginBottom: '10px' }}>{item.icon}</div>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text)', marginBottom: '4px' }}>{item.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{item.sub}</div>
                    </div>
                  ))}
                </div>

                {/* ÚLTIMOS DOCS */}
                {docs.length > 0 && (
                  <>
                    <div className="section-hdr">
                      <div className="section-title">Últimos documentos subidos <span className="section-count">{docs.length}</span></div>
                      <button className="btn btn-ghost" style={{ fontSize: '12px', padding: '7px 14px' }} onClick={() => setView('documentos')}>
                        Ver todos →
                      </button>
                    </div>
                    <DocsTable docs={docs.slice(0, 3)} />
                  </>
                )}
              </div>
            </>
          )}

          {/* ════ SUBIR PROYECTO ════ */}
          {view === 'subir' && (
            <>
              <div className="topbar">
                <div className="topbar-left">
                  <div className="topbar-title">Subir proyecto</div>
                  <div className="topbar-sub">El manual de usuario se registrará con hash SHA-256 para verificación de integridad</div>
                </div>
              </div>

              <div className="content">
                <div style={{ maxWidth: '680px' }}>

                  {uploadResult && (
                    <div className="alert alert-success">
                      <span>✓</span>
                      <div>
                        <div>Proyecto registrado correctamente</div>
                        <div style={{ fontSize: '11px', fontFamily: 'monospace', marginTop: '4px', opacity: 0.8 }}>
                          SHA-256 manual: {uploadResult.sha256}
                        </div>
                      </div>
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

                    {/* Nombre y descripción */}
                    <div className="form-row">
                      <div className="form-field" style={{ gridColumn: '1 / -1' }}>
                        <label className="form-label">Nombre del proyecto *</label>
                        <input
                          className="form-input"
                          type="text"
                          placeholder="Ej: Sistema de gestión de inventarios"
                          value={nombreProyecto}
                          onChange={e => setNombreProyecto(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-field" style={{ gridColumn: '1 / -1' }}>
                        <label className="form-label">Descripción</label>
                        <input
                          className="form-input"
                          type="text"
                          placeholder="Breve descripción del proyecto"
                          value={descProyecto}
                          onChange={e => setDescProyecto(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* GitHub */}
                    <div className="form-row">
                      <div className="form-field" style={{ gridColumn: '1 / -1' }}>
                        <label className="form-label">Link de GitHub</label>
                        <input
                          className="form-input"
                          type="url"
                          placeholder="https://github.com/usuario/repositorio"
                          value={githubLink}
                          onChange={e => setGithubLink(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Manual de usuario */}
                    <div style={{ marginTop: '8px', marginBottom: '8px' }}>
                      <label className="form-label" style={{ marginBottom: '10px', display: 'block' }}>
                        Manual de usuario * <span style={{ fontWeight: '500', textTransform: 'none', color: 'var(--muted)', letterSpacing: 0 }}>(PDF o DOCX — se generará hash SHA-256)</span>
                      </label>

                      <div
                        className={`upload-zone ${dragover ? 'dragover' : ''}`}
                        onClick={() => fileRef.current?.click()}
                        onDragOver={e => { e.preventDefault(); setDragover(true); }}
                        onDragLeave={() => setDragover(false)}
                        onDrop={handleDrop}
                      >
                        <input
                          type="file"
                          ref={fileRef}
                          style={{ display: 'none' }}
                          accept=".pdf,.docx"
                          onChange={e => e.target.files[0] && handleFile(e.target.files[0])}
                        />
                        <div className="upload-icon">▬</div>
                        <div className="upload-title">Arrastra el manual aquí o haz clic para seleccionar</div>
                        <div className="upload-sub">Se calculará el hash SHA-256 automáticamente al subir</div>
                        <div className="upload-types">
                          {['PDF', 'DOCX'].map(t => (
                            <span key={t} className="upload-type">{t}</span>
                          ))}
                        </div>
                      </div>

                      {fileManual && (
                        <div className="file-preview">
                          <span className="file-icon">{fileIcon(fileManual.name.split('.').pop())}</span>
                          <div>
                            <div className="file-name">{fileManual.name}</div>
                            <div className="file-size">{formatBytes(fileManual.size)}</div>
                          </div>
                          <button className="file-remove" onClick={() => setFileManual(null)}>✕</button>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '24px', justifyContent: 'flex-end' }}>
                      <button className="btn btn-ghost" onClick={() => { setFileManual(null); setNombreProyecto(''); setDescProyecto(''); setGithubLink(''); }} disabled={uploading}>
                        Limpiar
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={handleUpload}
                        disabled={uploading}
                      >
                        {uploading ? 'Subiendo...' : '+ Registrar proyecto'}
                      </button>
                    </div>
                  </div>

                  {/* INFO SEGURIDAD */}
                  <div style={{
                    marginTop: '16px', padding: '14px 18px',
                    background: '#f0f5ff', border: '1.5px solid #c7d9f5',
                    borderRadius: '10px', fontSize: '12px', color: 'var(--primary)',
                    display: 'flex', gap: '10px', alignItems: 'flex-start',
                  }}>
                    <span style={{ fontSize: '16px' }}>●</span>
                    <div>
                      <strong>¿Por qué se hashea el manual?</strong> El hash SHA-256 del manual de usuario garantiza su integridad — si el archivo es modificado después de entregarse, el hash cambiará y la alteración será detectable. El link de GitHub no se hashea porque es una URL, no un archivo.
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ════ MIS DOCUMENTOS ════ */}
          {view === 'documentos' && (
            <>
              <div className="topbar">
                <div className="topbar-left">
                  <div className="topbar-title">Mis documentos</div>
                  <div className="topbar-sub">{docs.length} archivos registrados con hash SHA-256</div>
                </div>
                <button className="btn btn-primary" onClick={() => setView('subir')}>
                  + Subir nuevo
                </button>
              </div>

              <div className="content">
                {docs.length === 0 ? (
                  <div style={{
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: '12px', boxShadow: '0 2px 8px rgba(35,46,86,0.06)',
                  }}>
                    <div className="empty-state">
                      <div className="empty-icon">📂</div>
                      <div className="empty-title">No tienes documentos subidos</div>
                      <div className="empty-sub">Sube tu primer archivo para registrarlo con su hash SHA-256</div>
                      <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => setView('subir')}>
                        + Subir primer documento
                      </button>
                    </div>
                  </div>
                ) : (
                  <DocsTable docs={docs} />
                )}
              </div>
            </>
          )}

          {/* ════ MIS PROYECTOS ════ */}
          {view === 'proyectos' && (
            <>
              <div className="topbar">
                <div className="topbar-left">
                  <div className="topbar-title">Mis proyectos</div>
                  <div className="topbar-sub">{proyectos.length} proyectos en tu cartera académica</div>
                </div>
                <button className="btn btn-primary" onClick={() => alert('Agregar nuevo proyecto')}>
                  + Agregar proyecto
                </button>
              </div>

              <div className="content">
                {proyectos.length === 0 ? (
                  <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: '0 2px 8px rgba(35,46,86,0.06)' }}>
                    <div className="empty-state">
                      <div className="empty-icon">□</div>
                      <div className="empty-title">No tienes proyectos aún</div>
                      <div className="empty-sub">Comienza un nuevo proyecto para compartir con empresas</div>
                      <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => alert('Agregar nuevo proyecto')}>
                        + Agregar primer proyecto
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {proyectos.map(p => (
                      <div key={p.id} className="proyecto-card">
                        <div className="proyecto-icon">□</div>
                        <div className="proyecto-info">
                          <div className="proyecto-name">{p.nombre}</div>
                          <div className="proyecto-meta">Actualizado: {p.fecha} · Estado: <span style={{ textTransform: 'capitalize', fontWeight: '600', color: p.estado === 'completado' ? '#166534' : p.estado === 'en-progreso' ? '#244E7C' : '#92400e' }}>{p.estado.replace('-', ' ')}</span></div>
                          <div className="proyecto-progress">
                            <div style={{ fontSize: '10px', color: 'var(--muted)', marginBottom: '4px' }}>Progreso: {p.progreso}%</div>
                            <div style={{ height: '6px', background: 'var(--surface2)', borderRadius: '10px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', background: p.estado === 'completado' ? '#166534' : '#244E7C', width: p.progreso + '%', borderRadius: '10px' }}></div>
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn btn-ghost" style={{ fontSize: '12px', padding: '7px 14px' }}>Editar</button>
                          <button className="btn btn-ghost" style={{ fontSize: '12px', padding: '7px 14px' }}>Ver</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ════ CALIFICACIONES ════ */}
          {view === 'calificaciones' && (
            <>
              <div className="topbar">
                <div className="topbar-left">
                  <div className="topbar-title">Mis calificaciones</div>
                  <div className="topbar-sub">Desempeño académico validado por UTEQ</div>
                </div>
              </div>

              <div className="content">
                <div style={{ marginBottom: '24px' }}>
                  <div className="section-hdr">
                    <div className="section-title">Calificaciones por materia</div>
                    <div style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: '600' }}>Promedio general: 9.2</div>
                  </div>

                  <div className="calif-table">
                    <div className="calif-row" style={{ background: 'var(--surface2)', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--muted)' }}>
                      <div>Materia</div>
                      <div style={{ textAlign: 'center' }}>Calificación</div>
                      <div style={{ textAlign: 'right' }}>Estado</div>
                    </div>
                    {calificaciones.map((c, i) => (
                      <div key={i} className="calif-row">
                        <div className="calif-materia">{c.materia}</div>
                        <div style={{ textAlign: 'center' }}>
                          <span className="calif-val">{c.calificacion}</span>
                          <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '2px' }}>/ 10.0</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span className="calif-badge">✓ {c.estado.toUpperCase()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ background: 'var(--green-bg)', border: '1.5px solid var(--green-border)', borderRadius: '10px', padding: '16px', fontSize: '13px', color: 'var(--green)' }}>
                  ✓ Todas tus calificaciones han sido validadas por Servicios Escolares UTEQ y pueden ser descargadas en cualquier momento.
                </div>
              </div>
            </>
          )}

          {/* ════ MI CV ════ */}
          {view === 'cv' && (
            <>
              <div className="topbar">
                <div className="topbar-left">
                  <div className="topbar-title">Mi CV</div>
                  <div className="topbar-sub">Sube tu CV en PDF para que empresas puedan descargar tu perfil</div>
                </div>
              </div>

              <div className="content">
                <div style={{ maxWidth: '680px' }}>

                  {cvSuccess && (
                    <div className="alert alert-success">
                      <span>✓</span> {cvSuccess}
                    </div>
                  )}

                  {cvError && (
                    <div className="alert alert-error">
                      <span>✕</span> {cvError}
                    </div>
                  )}

                  <div className="upload-form-card" style={{ marginBottom: '20px' }}>
                    <div className="section-hdr" style={{ marginBottom: '20px' }}>
                      <div className="section-title">Subir CV</div>
                    </div>

                    <label style={{ display: 'block', marginBottom: '10px' }} className="form-label">
                      Archivo PDF de tu CV *
                    </label>

                    <div
                      className={`upload-zone ${dragover ? 'dragover' : ''}`}
                      onClick={() => cvRef.current?.click()}
                      onDragOver={e => { e.preventDefault(); setDragover(true); }}
                      onDragLeave={() => setDragover(false)}
                      onDrop={e => {
                        e.preventDefault();
                        setDragover(false);
                        if (e.dataTransfer.files[0]?.name.endsWith('.pdf')) setFileCv(e.dataTransfer.files[0]);
                        else setCvError('Solo se aceptan archivos PDF');
                      }}
                    >
                      <input
                        type="file"
                        ref={cvRef}
                        style={{ display: 'none' }}
                        accept=".pdf"
                        onChange={e => {
                          if (e.target.files[0]) {
                            if (e.target.files[0].name.endsWith('.pdf')) {
                              setFileCv(e.target.files[0]);
                              setCvError('');
                            } else {
                              setCvError('Solo se aceptan archivos PDF');
                            }
                          }
                        }}
                      />
                      <div className="upload-icon">▬</div>
                      <div className="upload-title">Arrastra tu CV aquí o haz clic para seleccionar</div>
                      <div className="upload-sub">Solo archivos PDF, máximo 5 MB</div>
                      <div className="upload-types">
                        <span className="upload-type">PDF</span>
                      </div>
                    </div>

                    {fileCv && (
                      <div className="file-preview">
                        <span className="file-icon">▬</span>
                        <div>
                          <div className="file-name">{fileCv.name}</div>
                          <div className="file-size">{formatBytes(fileCv.size)}</div>
                        </div>
                        <button className="file-remove" onClick={() => setFileCv(null)}>✕</button>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '10px', marginTop: '24px', justifyContent: 'flex-end' }}>
                      <button className="btn btn-ghost" onClick={() => setFileCv(null)} disabled={cvUploading}>
                        Limpiar
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={() => {
                          if (!fileCv) {
                            setCvError('Por favor selecciona un archivo PDF');
                            return;
                          }
                          setCvUploading(true);
                          setTimeout(() => {
                            setCvSuccess('¡CV subido exitosamente! Las empresas podrán descargarlo desde tu perfil.');
                            setCvUploading(false);
                            setFileCv(null);
                          }, 1000);
                        }}
                        disabled={cvUploading}
                      >
                        {cvUploading ? 'Subiendo...' : '▬ Subir mi CV'}
                      </button>
                    </div>
                  </div>

                  <div style={{ background: '#f0f5ff', border: '1.5px solid #c7d9f5', borderRadius: '10px', padding: '14px 18px', fontSize: '12px', color: 'var(--primary)', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '16px' }}>●</span>
                    <div>
                      <strong>¿Por qué subir mi CV?</strong> Cuando las empresas vean tu perfil, podrán descargar tu CV directamente. Esto es más profesional que compartir enlaces.
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ════ MI PERFIL ════ */}
          {view === 'perfil' && (
            <>
              <div className="topbar">
                <div className="topbar-left">
                  <div className="topbar-title">Mi perfil</div>
                  <div className="topbar-sub">Información personal y datos de contacto</div>
                </div>
                <button className="btn btn-primary" onClick={() => alert('Editar perfil')}>
                  ✎ Editar perfil
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
                      <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                        <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '20px', background: 'var(--green-bg)', color: 'var(--green)', fontSize: '11px', fontWeight: '700' }}>✓ Cuenta verificada</span>
                        <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '20px', background: '#f0f5ff', color: 'var(--primary)', fontSize: '11px', fontWeight: '700' }}>● Sesión activa</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>Información personal</div>
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
                        <div className="perfil-field-label">Rol</div>
                        <div className="perfil-field-value">{user.nombre_rol || 'Estudiante'}</div>
                      </div>
                      <div className="perfil-field">
                        <div className="perfil-field-label">ID de usuario</div>
                        <div className="perfil-field-value">#{user.id_usuario}</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>Estado de cuenta</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '6px', fontWeight: '700' }}>ESTADO</div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>Activo</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '6px', fontWeight: '700' }}>SEGURIDAD</div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>RSA+AES</div>
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

// ─── SUB-COMPONENT: Tabla de documentos ──────────────────────────────────────

function DocsTable({ docs }) {
  return (
    <div className="docs-table-wrap">
      <div className="docs-table-hdr" style={{ gridTemplateColumns: '2fr 1.5fr 1fr 1.5fr 80px' }}>
        <div>Archivo</div>
        <div>Proyecto</div>
        <div>Fecha</div>
        <div>Hash SHA-256</div>
        <div>Estado</div>
      </div>
      {docs.map(doc => (
        <div className="docs-table-row" key={doc.id} style={{ gridTemplateColumns: '2fr 1.5fr 1fr 1.5fr 80px' }}>
          <div>
            <div className="doc-nombre">{doc.nombre}</div>
            <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>{doc.tipo}</div>
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>{doc.proyecto}</div>
            {doc.github && (
              <a href={doc.github} target="_blank" rel="noreferrer" style={{ fontSize: '11px', color: 'var(--primary)' }}>
                → GitHub
              </a>
            )}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--muted2)' }}>{doc.fecha}</div>
          <div style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--muted2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {doc.sha256 ? doc.sha256.substring(0, 28) + '...' : '—'}
          </div>
          <div>
            <span className="badge badge-active">✓ OK</span>
          </div>
        </div>
      ))}
    </div>
  );
}