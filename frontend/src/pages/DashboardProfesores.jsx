import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

// Mock data
const mockHorarios = [
  {
    id: 1,
    nombre: "Horario Primavera 2026",
    archivo: "horario_primavera_2026.pdf",
    fechaSubida: "2026-03-10",
    tamaño: "2.4 MB",
    estado: "activo"
  },
  {
    id: 2,
    nombre: "Horario Invierno 2025",
    archivo: "horario_invierno_2025.pdf",
    fechaSubida: "2025-12-15",
    tamaño: "2.1 MB",
    estado: "archivado"
  }
];

const mockProyectos = [
  {
    id: 1,
    titulo: "Sistema de Gestión de Inventario",
    estudiante: "Carlos Díaz",
    carrera: "Ing. en Sistemas",
    estado: "en_progreso",
    progreso: 65,
    fechaAsignacion: "2026-02-20",
    descripcion: "Desarrollo de un sistema web para gestionar inventario de la UTEQ",
    calificacion: null
  },
  {
    id: 2,
    titulo: "App de Sostenibilidad Ambiental",
    estudiante: "Marina Sánchez",
    carrera: "Ing. en Sistemas",
    estado: "en_progreso",
    progreso: 45,
    fechaAsignacion: "2026-02-28",
    descripcion: "Aplicación móvil para monitoreo de huella de carbono",
    calificacion: null
  },
  {
    id: 3,
    titulo: "Plataforma de E-learning UTEQ",
    estudiante: "Miguel Rodríguez",
    carrera: "Diseño Gráfico",
    estado: "completado",
    progreso: 100,
    fechaAsignacion: "2026-01-15",
    descripcion: "Diseño UI/UX para plataforma educativa",
    calificacion: 9.2
  },
  {
    id: 4,
    titulo: "Base de Datos Distribuida",
    estudiante: "Ana Martínez",
    carrera: "Ing. en Sistemas",
    estado: "en_progreso",
    progreso: 80,
    fechaAsignacion: "2026-02-10",
    descripcion: "Implementación de arquitectura de bases de datos distribuida",
    calificacion: null
  }
];

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  :root {
    --primary: #244E7C;
    --primary-dark: #232E56;
    --secondary: #244E7C;
    --amber: #92400e;
    --red: #991b1b;
    --text: #1a1a1a;
    --muted: #666666;
    --muted2: #999999;
    --bg: #f4f6fa;
    --surface: #ffffff;
    --border: #e0e0e0;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Montserrat', sans-serif; background: var(--bg); color: var(--text); }

  .app { display: flex; min-height: 100vh; background: var(--bg); }

  /* SIDEBAR */
  .sidebar {
    width: 280px;
    background: linear-gradient(135deg, #1a1f38 0%, #232E56 100%);
    padding: 24px 0;
    display: flex;
    flex-direction: column;
    box-shadow: 2px 0 8px rgba(35, 46, 86, 0.1);
    position: fixed;
    height: 100vh;
    left: 0;
    top: 0;
    z-index: 10;
    overflow-y: auto;
  }

  .sidebar-logo {
    padding: 0 20px 24px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    margin-bottom: 12px;
  }

  .brand {
    font-size: 20px;
    font-weight: 800;
    color: white;
    letter-spacing: -0.5px;
    font-family: 'Montserrat', sans-serif;
  }

  .brand span { color: #7eb8f7; }

  .subtitle {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.6);
    margin-top: 4px;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: 600;
  }

  .nav-section {
    padding: 12px 8px;
  }

  .nav-label {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
    letter-spacing: 1px;
    padding: 12px 16px 8px;
    font-weight: 700;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    border-radius: 8px;
    margin: 4px 8px;
    transition: all 0.15s;
    font-size: 14px;
    font-weight: 500;
  }

  .nav-item:hover { background: rgba(255, 255, 255, 0.1); color: white; }
  .nav-item.active { background: #244E7C; color: white; }

  .icon { font-size: 16px; width: 20px; text-align: center; }

  .sidebar-bottom {
    margin-top: auto;
    padding: 12px 8px 24px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .logout-btn {
    width: calc(100% - 16px);
    margin: 0 8px;
    padding: 12px 16px;
    background: rgba(239, 68, 68, 0.2);
    border: 1.5px solid #ef4444;
    border-radius: 8px;
    color: #fca5a5;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
    font-family: 'Montserrat', sans-serif;
  }

  .logout-btn:hover { background: rgba(239, 68, 68, 0.3); color: #fecaca; }

  /* MAIN */
  .main {
    flex: 1;
    margin-left: 280px;
    display: flex;
    flex-direction: column;
    background: var(--bg);
  }

  .topbar {
    background: var(--surface);
    padding: 20px 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--border);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  }

  .topbar-title {
    font-size: 24px;
    font-weight: 700;
    color: var(--text);
    font-family: 'Montserrat', sans-serif;
  }

  .topbar-title span { color: var(--primary); }

  .topbar-actions {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .btn {
    padding: 10px 18px;
    border-radius: 8px;
    border: none;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
    font-family: 'Montserrat', sans-serif;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .btn-primary {
    background: var(--primary);
    color: white;
  }

  .btn-primary:hover { background: var(--primary-dark); }

  .btn-ghost {
    background: transparent;
    color: var(--primary);
    border: 1.5px solid var(--primary);
  }

  .btn-ghost:hover { background: var(--primary); color: white; }

  .content {
    flex: 1;
    padding: 32px;
    overflow-y: auto;
  }

  /* SECTION HEADER */
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }

  .section-title {
    font-size: 18px;
    font-weight: 700;
    color: var(--text);
  }

  .count { color: var(--muted); font-size: 14px; margin-left: 8px; }

  /* METRICS */
  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 32px;
  }

  .metric-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
    transition: all 0.15s;
  }

  .metric-card:hover { box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); }

  .metric-icon {
    font-size: 28px;
    margin-bottom: 12px;
    display: block;
  }

  .metric-label {
    font-size: 12px;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .metric-value {
    font-size: 32px;
    font-weight: 800;
    color: var(--primary);
    margin-bottom: 4px;
  }

  .metric-sub {
    font-size: 12px;
    color: var(--muted2);
  }

  /* HORARIOS TABLE */
  .table-wrap {
    background: var(--surface);
    border-radius: 12px;
    border: 1px solid var(--border);
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
    margin-bottom: 32px;
  }

  .table-header {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr 100px;
    gap: 16px;
    padding: 16px 20px;
    background: #f9fafb;
    border-bottom: 1px solid var(--border);
    font-size: 12px;
    font-weight: 700;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .table-row {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr 100px;
    gap: 16px;
    padding: 16px 20px;
    border-bottom: 1px solid var(--border);
    align-items: center;
    transition: background 0.15s;
  }

  .table-row:hover { background: #fafbfc; }
  .table-row:last-child { border-bottom: none; }

  .file-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--text);
  }

  .file-sub {
    font-size: 12px;
    color: var(--muted2);
    margin-top: 2px;
  }

  /* BADGES */
  .badge {
    display: inline-flex;
    align-items: center;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    width: fit-content;
  }

  .badge-green {
    background: #e8f0fb;
    color: #244E7C;
    border: 1px solid #a5c9f5;
  }

  .badge-amber {
    background: #fef3c7;
    color: #92400e;
    border: 1px solid #fcd34d;
  }

  .badge-blue {
    background: #dbeafe;
    color: #1e40af;
    border: 1px solid #93c5fd;
  }

  /* TABLE ACTIONS */
  .table-actions {
    display: flex;
    gap: 6px;
  }

  .action-btn {
    padding: 6px 12px;
    background: transparent;
    border: 1.5px solid var(--border);
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    color: var(--primary);
    transition: all 0.15s;
    font-family: 'Montserrat', sans-serif;
  }

  .action-btn:hover {
    background: var(--primary);
    color: white;
    border-color: var(--primary);
  }

  /* PROYECTOS CARDS */
  .proyectos-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    margin-bottom: 32px;
  }

  .proyecto-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
    transition: all 0.15s;
  }

  .proyecto-card:hover { box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1); }

  .proyecto-header {
    margin-bottom: 16px;
  }

  .proyecto-titulo {
    font-size: 16px;
    font-weight: 700;
    color: var(--text);
    margin-bottom: 6px;
  }

  .proyecto-estudiante {
    font-size: 13px;
    color: var(--muted);
    margin-bottom: 2px;
  }

  .proyecto-carrera {
    font-size: 12px;
    color: var(--muted2);
  }

  .proyecto-info {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--border);
  }

  .info-item {
    display: flex;
    flex-direction: column;
  }

  .info-label {
    font-size: 11px;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 600;
    margin-bottom: 4px;
  }

  .info-value {
    font-size: 14px;
    color: var(--text);
    font-weight: 500;
  }

  .progress-bar {
    width: 100%;
    height: 6px;
    background: #e5e7eb;
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 8px;
  }

  .progress-fill {
    height: 100%;
    background: var(--primary);
    transition: width 0.3s;
  }

  .progress-text {
    font-size: 12px;
    color: var(--muted2);
  }

  .proyecto-actions {
    display: flex;
    gap: 8px;
    margin-top: 16px;
  }

  .proyecto-actions .btn {
    flex: 1;
    padding: 8px 12px;
    font-size: 12px;
  }

  /* MODAL */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(35, 46, 86, 0.5);
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
    max-width: 600px;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 24px 64px rgba(35, 46, 86, 0.2);
  }

  .modal-title {
    font-family: 'Montserrat', sans-serif;
    font-size: 18px;
    font-weight: 700;
    color: var(--text);
    margin-bottom: 24px;
  }

  .form-group { margin-bottom: 16px; }

  .form-label {
    font-size: 12px;
    color: var(--muted);
    margin-bottom: 6px;
    display: block;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    font-weight: 600;
  }

  .form-input, .form-textarea {
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

  .form-input:focus, .form-textarea:focus { border-color: var(--primary); }

  .form-textarea { min-height: 100px; resize: vertical; }

  .modal-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    margin-top: 24px;
  }

  .file-input-wrapper {
    position: relative;
    display: inline-block;
    cursor: pointer;
  }

  .file-input-label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 18px;
    background: var(--primary);
    color: white;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    transition: all 0.15s;
  }

  .file-input-label:hover { background: var(--primary-dark); }

  .file-input-wrapper input { display: none; }

  .file-uploadzone {
    border: 2px dashed var(--primary);
    border-radius: 12px;
    padding: 32px;
    text-align: center;
    cursor: pointer;
    transition: all 0.15s;
    background: rgba(36, 78, 124, 0.02);
  }

  .file-uploadzone:hover {
    border-color: var(--primary-dark);
    background: rgba(36, 78, 124, 0.05);
  }

  .upload-icon { font-size: 32px; margin-bottom: 12px; }
  .upload-text { font-size: 14px; color: var(--text); font-weight: 600; }
  .upload-sub { font-size: 12px; color: var(--muted); margin-top: 4px; }

  @media (max-width: 1200px) {
    .proyectos-grid { grid-template-columns: 1fr; }
    .metrics-grid { grid-template-columns: repeat(2, 1fr); }
  }

  @media (max-width: 960px) {
    .app { flex-direction: column; }
    .sidebar { width: 100%; position: relative; height: auto; }
    .main { margin-left: 0; }
    .metrics-grid { grid-template-columns: 1fr; }
  }
`;

export default function DashboardProfesores() {
  const navigate = useNavigate();
  const [view, setView] = useState("dashboard");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showProyectoModal, setShowProyectoModal] = useState(false);
  const [selectedProyecto, setSelectedProyecto] = useState(null);
  const [horarios, setHorarios] = useState(mockHorarios);
  const [proyectos, setProyectos] = useState(mockProyectos);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
    }
  };

  const handleUploadHorario = () => {
    if (fileName) {
      const nuevoHorario = {
        id: Math.max(...horarios.map(h => h.id), 0) + 1,
        nombre: fileName,
        archivo: fileName,
        fechaSubida: new Date().toISOString().split("T")[0],
        tamaño: "2.4 MB",
        estado: "activo"
      };
      setHorarios([nuevoHorario, ...horarios]);
      setFileName("");
      setShowUploadModal(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleVerProyecto = (proyecto) => {
    setSelectedProyecto(proyecto);
    setShowProyectoModal(true);
  };

  const handleEliminarHorario = (id) => {
    setHorarios(horarios.filter(h => h.id !== id));
  };

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="brand">Skill<span>Match</span></div>
            <div className="subtitle">Portal Profesores</div>
          </div>

          <nav className="nav-section">
            <div className="nav-label">Principal</div>
            <div className={`nav-item ${view === "dashboard" ? "active" : ""}`} onClick={() => setView("dashboard")}>
              <span className="icon">▦</span> Dashboard
            </div>
            <div className={`nav-item ${view === "horarios" ? "active" : ""}`} onClick={() => setView("horarios")}>
              <span className="icon">▬</span> Horarios
            </div>
            <div className={`nav-item ${view === "proyectos" ? "active" : ""}`} onClick={() => setView("proyectos")}>
              <span className="icon">●</span> Proyectos
            </div>
          </nav>

          <nav className="nav-section">
            <div className="nav-label">Cuenta</div>
            <div className="nav-item">
              <span className="icon">⊙</span> Configuración
            </div>
          </nav>

          <div className="sidebar-bottom">
            <button
              className="logout-btn"
              onClick={() => {
                sessionStorage.clear();
                window.location.href = "/";
              }}
            >
              ← Cerrar sesión
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <main className="main">
          {/* TOPBAR */}
          <div className="topbar">
            <div>
              <div className="topbar-title">Dashboard <span>Profesores</span></div>
            </div>
            <div className="topbar-actions">
              {view === "dashboard" && (
                <button className="btn btn-primary" onClick={() => setShowUploadModal(true)}>
                  + Subir horario
                </button>
              )}
            </div>
          </div>

          {/* CONTENT */}
          <div className="content">
            {view === "dashboard" && (
              <>
                {/* METRICS */}
                <div className="metrics-grid">
                  <div className="metric-card">
                    <span className="metric-icon">●</span>
                    <div className="metric-label">Proyectos asignados</div>
                    <div className="metric-value">{proyectos.length}</div>
                    <div className="metric-sub">para seguimiento</div>
                  </div>
                  <div className="metric-card">
                    <span className="metric-icon">▬</span>
                    <div className="metric-label">Horarios publicados</div>
                    <div className="metric-value">{horarios.length}</div>
                    <div className="metric-sub">{horarios.filter(h => h.estado === "activo").length} activo</div>
                  </div>
                  <div className="metric-card">
                    <span className="metric-icon">□</span>
                    <div className="metric-label">Última actividad</div>
                    <div className="metric-value">Hoy</div>
                    <div className="metric-sub">13 de Marzo 2026</div>
                  </div>
                </div>

                {/* SECTION - HORARIOS RECIENTES */}
                <div className="section-header">
                  <div className="section-title">
                    Horarios recientes <span className="count">{horarios.length} total</span>
                  </div>
                  <button className="btn btn-primary" onClick={() => setShowUploadModal(true)}>
                    + Subir horario
                  </button>
                </div>

                <div className="table-wrap">
                  <div className="table-header">
                    <div>Nombre del archivo</div>
                    <div>Fecha de subida</div>
                    <div>Tamaño</div>
                    <div>Estado</div>
                    <div>Acciones</div>
                  </div>
                  {horarios.map((horario) => (
                    <div className="table-row" key={horario.id}>
                      <div>
                        <div className="file-name">📎 {horario.archivo}</div>
                        <div className="file-sub">{horario.nombre}</div>
                      </div>
                      <div style={{ fontSize: "13px", color: "var(--muted2)" }}>{horario.fechaSubida}</div>
                      <div style={{ fontSize: "13px", color: "var(--muted2)" }}>{horario.tamaño}</div>
                      <div>
                        <span className={`badge ${horario.estado === "activo" ? "badge-green" : "badge-amber"}`}>
                          {horario.estado === "activo" ? "✓ Activo" : "✗ Archivado"}
                        </span>
                      </div>
                      <div className="table-actions">
                        <button className="action-btn">Descargar</button>
                        <button
                          className="action-btn"
                          onClick={() => handleEliminarHorario(horario.id)}
                          style={{ color: "#991b1b", borderColor: "#fca5a5" }}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* SECTION - PROYECTOS ASIGNADOS */}
                <div className="section-header">
                  <div className="section-title">
                    Proyectos asignados <span className="count">{proyectos.length} activos</span>
                  </div>
                </div>

                <div className="proyectos-grid">
                  {proyectos.map((proyecto) => (
                    <div className="proyecto-card" key={proyecto.id}>
                      <div className="proyecto-header">
                        <div className="proyecto-titulo">{proyecto.titulo}</div>
                        <div className="proyecto-estudiante">👤 {proyecto.estudiante}</div>
                        <div className="proyecto-carrera">{proyecto.carrera}</div>
                      </div>

                      <div className="proyecto-info">
                        <div className="info-item">
                          <div className="info-label">Estado</div>
                          <span
                            className={`badge ${
                              proyecto.estado === "en_progreso" ? "badge-blue" : "badge-green"
                            }`}
                          >
                            {proyecto.estado === "en_progreso" ? "En progreso" : "Completado"}
                          </span>
                        </div>
                        <div className="info-item">
                          <div className="info-label">Calificación</div>
                          <div className="info-value">
                            {proyecto.calificacion ? `${proyecto.calificacion}/10` : "Por calificar"}
                          </div>
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "6px", fontWeight: "600" }}>
                          Progreso
                        </div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${proyecto.progreso}%` }}></div>
                        </div>
                        <div className="progress-text">{proyecto.progreso}% completado</div>
                      </div>

                      <div className="proyecto-actions">
                        <button
                          className="btn btn-ghost"
                          style={{ flex: 1, fontSize: "12px", padding: "8px 12px" }}
                          onClick={() => handleVerProyecto(proyecto)}
                        >
                          Ver detalles
                        </button>
                        {proyecto.calificacion === null && (
                          <button
                            className="btn btn-primary"
                            style={{ flex: 1, fontSize: "12px", padding: "8px 12px" }}
                            onClick={() => handleVerProyecto(proyecto)}
                          >
                            Calificar
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {view === "horarios" && (
              <>
                <div className="section-header">
                  <div className="section-title">
                    Gestionar horarios <span className="count">{horarios.length} archivos</span>
                  </div>
                  <button className="btn btn-primary" onClick={() => setShowUploadModal(true)}>
                    + Subir nuevo horario
                  </button>
                </div>

                <div className="table-wrap">
                  <div className="table-header">
                    <div>Nombre del archivo</div>
                    <div>Fecha de subida</div>
                    <div>Tamaño</div>
                    <div>Estado</div>
                    <div>Acciones</div>
                  </div>
                  {horarios.map((horario) => (
                    <div className="table-row" key={horario.id}>
                      <div>
                        <div className="file-name">📎 {horario.archivo}</div>
                        <div className="file-sub">{horario.nombre}</div>
                      </div>
                      <div style={{ fontSize: "13px", color: "var(--muted2)" }}>{horario.fechaSubida}</div>
                      <div style={{ fontSize: "13px", color: "var(--muted2)" }}>{horario.tamaño}</div>
                      <div>
                        <span className={`badge ${horario.estado === "activo" ? "badge-green" : "badge-amber"}`}>
                          {horario.estado === "activo" ? "✓ Activo" : "✗ Archivado"}
                        </span>
                      </div>
                      <div className="table-actions">
                        <button className="action-btn">Descargar</button>
                        <button
                          className="action-btn"
                          onClick={() => handleEliminarHorario(horario.id)}
                          style={{ color: "#991b1b", borderColor: "#fca5a5" }}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {view === "proyectos" && (
              <>
                <div className="section-header">
                  <div className="section-title">
                    Proyectos asignados <span className="count">{proyectos.length} total</span>
                  </div>
                </div>

                <div className="proyectos-grid">
                  {proyectos.map((proyecto) => (
                    <div className="proyecto-card" key={proyecto.id}>
                      <div className="proyecto-header">
                        <div className="proyecto-titulo">{proyecto.titulo}</div>
                        <div className="proyecto-estudiante">👤 {proyecto.estudiante}</div>
                        <div className="proyecto-carrera">{proyecto.carrera}</div>
                      </div>

                      <div className="proyecto-info">
                        <div className="info-item">
                          <div className="info-label">Estado</div>
                          <span
                            className={`badge ${
                              proyecto.estado === "en_progreso" ? "badge-blue" : "badge-green"
                            }`}
                          >
                            {proyecto.estado === "en_progreso" ? "En progreso" : "Completado"}
                          </span>
                        </div>
                        <div className="info-item">
                          <div className="info-label">Calificación</div>
                          <div className="info-value">
                            {proyecto.calificacion ? `${proyecto.calificacion}/10` : "Por calificar"}
                          </div>
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "6px", fontWeight: "600" }}>
                          Progreso
                        </div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${proyecto.progreso}%` }}></div>
                        </div>
                        <div className="progress-text">{proyecto.progreso}% completado</div>
                      </div>

                      <div className="proyecto-actions">
                        <button
                          className="btn btn-ghost"
                          style={{ flex: 1, fontSize: "12px", padding: "8px 12px" }}
                          onClick={() => handleVerProyecto(proyecto)}
                        >
                          Ver detalles
                        </button>
                        {proyecto.calificacion === null && (
                          <button
                            className="btn btn-primary"
                            style={{ flex: 1, fontSize: "12px", padding: "8px 12px" }}
                            onClick={() => handleVerProyecto(proyecto)}
                          >
                            Calificar
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {/* MODAL SUBIR HORARIO */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">▬ Subir horario</div>

            <div className="file-uploadzone" onClick={() => fileInputRef.current?.click()}>
              <div className="upload-icon">📄</div>
              <div className="upload-text">Haz clic para seleccionar un archivo</div>
              <div className="upload-sub">O arrastra tu PDF aquí</div>
            </div>

            <div style={{ marginTop: "16px" }}>
              {fileName && (
                <div style={{ padding: "12px", background: "#e8f0fb", border: "1px solid #a5c9f5", borderRadius: "8px", marginBottom: "16px" }}>
                  <div style={{ fontSize: "13px", color: "#244E7C", fontWeight: "600" }}>
                    ✓ Archivo seleccionado
                  </div>
                  <div style={{ fontSize: "12px", color: "#244E7C", marginTop: "4px" }}>
                    {fileName}
                  </div>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Nombre del horario</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ej. Horario Primavera 2026"
                defaultValue={fileName.replace(".pdf", "").replace(".doc", "")}
              />
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              style={{ display: "none" }}
              onChange={handleFileSelect}
            />

            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowUploadModal(false)}>
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                onClick={handleUploadHorario}
                disabled={!fileName}
              >
                Subir horario
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLES PROYECTO */}
      {showProyectoModal && selectedProyecto && (
        <div className="modal-overlay" onClick={() => setShowProyectoModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">● {selectedProyecto.titulo}</div>

            <div style={{ marginBottom: "20px" }}>
              <div className="info-label" style={{ marginBottom: "8px" }}>Estudiante responsable</div>
              <div style={{ fontSize: "14px", fontWeight: "600", marginBottom: "12px" }}>
                {selectedProyecto.estudiante} - {selectedProyecto.carrera}
              </div>

              <div className="info-label" style={{ marginBottom: "8px" }}>Descripción</div>
              <div style={{ fontSize: "14px", color: "var(--text)", marginBottom: "16px", lineHeight: "1.6" }}>
                {selectedProyecto.descripcion}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <div className="info-label">Estado</div>
                  <span
                    className={`badge ${
                      selectedProyecto.estado === "en_progreso" ? "badge-blue" : "badge-green"
                    }`}
                  >
                    {selectedProyecto.estado === "en_progreso" ? "En progreso" : "Completado"}
                  </span>
                </div>
                <div>
                  <div className="info-label">Calificación</div>
                  <div style={{ fontSize: "16px", fontWeight: "700", color: "var(--primary)" }}>
                    {selectedProyecto.calificacion ? `${selectedProyecto.calificacion}/10` : "Por calificar"}
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "6px", fontWeight: "600" }}>
                  Progreso
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${selectedProyecto.progreso}%` }}></div>
                </div>
                <div className="progress-text">{selectedProyecto.progreso}% completado</div>
              </div>
            </div>

            {selectedProyecto.calificacion === null && (
              <div style={{ marginBottom: "16px" }}>
                <label className="form-label">Calificación (0-10)</label>
                <input
                  type="number"
                  className="form-input"
                  min="0"
                  max="10"
                  step="0.1"
                  placeholder="Ingresa la calificación"
                />
              </div>
            )}

            <div>
              <label className="form-label">Comentarios o retroalimentación</label>
              <textarea
                className="form-textarea"
                placeholder="Deja tus comentarios sobre el trabajo del estudiante..."
              ></textarea>
            </div>

            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowProyectoModal(false)}>
                Cerrar
              </button>
              <button className="btn btn-primary" onClick={() => setShowProyectoModal(false)}>
                {selectedProyecto.calificacion === null ? "✓ Guardar calificación" : "✓ Guardar cambios"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
