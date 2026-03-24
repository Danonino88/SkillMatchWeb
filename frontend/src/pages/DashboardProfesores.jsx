import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import '../CSS/DashboardProfesores.css'; // 🟢 Importamos los estilos desde la carpeta CSS

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