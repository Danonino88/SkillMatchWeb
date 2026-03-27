import { useState, useEffect } from 'react';
import '../CSS/DashboardEmpresas.css';

const API_BASE = 'http://localhost:3000/api';

export default function DashboardEmpresas() {
  const [view, setView] = useState("dashboard"); 
  const [tabVacantes, setTabVacantes] = useState("todas");
  const [tabPerfil, setTabPerfil] = useState("vacantes");
  const [editingPerfil, setEditingPerfil] = useState(false);
  
  const [metricas, setMetricas] = useState({ activas: 0, postulaciones: 0, revisados: 0, contrataciones: 0 });
  const [vacantes, setVacantes] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  const [showModalForm, setShowModalForm] = useState(false);
  const [editingId, setEditingId] = useState(null); 
  const [loadingModal, setLoadingModal] = useState(false); 
  const [savingVacante, setSavingVacante] = useState(false);
  const [formError, setFormError] = useState("");

  const initialFormState = {
    titulo: "", categoria: "Tecnología", nivel: "JUNIOR", descripcion: "", requisitos: "", estado: "abierta"
  };
  const [formVacante, setFormVacante] = useState(initialFormState);

  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedVacante, setSelectedVacante] = useState(null);
  const [postulantes, setPostulantes] = useState([]); // 🟢 ESTADO PARA POSTULANTES REALES
  
  const [companyData, setCompanyData] = useState({
    razonSocial: "TechGroup S.A. de C.V.", rfc: "TGR120415AB3", sector: "Tecnología de la Información",
    industria: "Software y Servicios Digitales", tamanio: "150–300 empleados", anioFundacion: "2012",
    ubicacion: "Querétaro, Qro., México", direccion: "Av. Tecnológico 1000, CP 76148", sitioWeb: "techgroup.mx",
    correoGeneral: "contacto@techgroup.mx", responsableRH: "Lic. María González", correoRH: "rh@techgroup.mx",
    telefono: "+52 442 123 4567", linkedin: "linkedin.com/company/techgroup", estado: "aprobada",
    folioAprobacion: "UTEQ-EMP-2026-0048", fechaAprobacion: "10 de enero de 2026"
  });

  useEffect(() => {
    cargarDashboard();
  }, []);

  const cargarDashboard = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return; 
      const res = await fetch(`${API_BASE}/vacantes/dashboard`, { headers: { 'Authorization': `Bearer ${token}` } });
      const json = await res.json();
      if (json.ok) {
        setMetricas(json.data.metricas);
        setVacantes(json.data.vacantes);
        if (json.data.estudiantes) {
          setEstudiantes(json.data.estudiantes); 
        }
      }
    } catch (error) {
      console.error("Error al cargar dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const abrirModalCrear = () => {
    setEditingId(null);
    setFormVacante(initialFormState);
    setFormError("");
    setShowModalForm(true);
  };

  const abrirModalEditar = async (id_vacante) => {
    setFormError("");
    setEditingId(id_vacante);
    setShowModalForm(true); 
    setLoadingModal(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/vacantes/${id_vacante}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      
      if (json.ok) {
        setFormVacante({
          titulo: json.vacante.titulo,
          categoria: json.vacante.categoria,
          nivel: json.vacante.nivel,
          descripcion: json.vacante.descripcion,
          requisitos: json.vacante.requisitos || "",
          estado: json.vacante.estado
        });
      } else {
        setFormError("No se pudo cargar la info: " + json.mensaje);
      }
    } catch (error) {
      setFormError("Error de red al cargar la vacante.");
    } finally {
      setLoadingModal(false);
    }
  };

  const guardarVacante = async () => {
    setFormError("");
    if (!formVacante.titulo || !formVacante.descripcion) {
      return setFormError("⚠️ El título y la descripción son obligatorios.");
    }

    setSavingVacante(true);
    try {
      const token = localStorage.getItem('token');
      const isEdit = editingId !== null;
      const url = isEdit ? `${API_BASE}/vacantes/${editingId}` : `${API_BASE}/vacantes`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formVacante)
      });
      
      const json = await res.json();
      if (json.ok) {
        setShowModalForm(false);
        cargarDashboard(); 
        if (showViewModal && selectedVacante && selectedVacante.id_vacante === editingId) {
          abrirModalVer(editingId);
        }
      } else {
        setFormError(json.mensaje);
      }
    } catch (error) {
      setFormError("Error de conexión al servidor.");
    } finally {
      setSavingVacante(false);
    }
  };

  // 🟢 ACTUALIZADA PARA CARGAR POSTULANTES REALES
  const abrirModalVer = async (id_vacante) => {
    const vacanteBasica = vacantes.find(v => v.id_vacante === id_vacante);
    setSelectedVacante(vacanteBasica || { id_vacante, titulo: "Cargando..." });
    setPostulantes([]); // Limpiar la lista al abrir
    setShowViewModal(true); 
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/vacantes/${id_vacante}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      
      if (json.ok) {
        setSelectedVacante(prev => ({ ...prev, ...json.vacante }));
        setPostulantes(json.postulantes || []); // Llenar con datos reales
      }
    } catch (error) {
      console.error("Error al cargar detalles completos", error);
    }
  };

  const formatearFecha = (fechaString) => {
    if(!fechaString) return "-";
    return new Date(fechaString).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const vacantesFiltradas = tabVacantes === "todas" ? vacantes : vacantes.filter((v) => v.estado.toLowerCase() === tabVacantes);
  const initials = (name) => name ? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "UT";

  return (
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
          <div className={`nav-item`} onClick={abrirModalCrear}>
            <span className="icon">+</span> Nueva Oferta
          </div>
          <div className={`nav-item ${view === "candidatos" ? "active" : ""}`} onClick={() => setView("candidatos")}>
            <span className="icon">◆</span> Candidatos
          </div>
        </nav>
        <div className="sidebar-bottom">
          <button 
            onClick={() => { localStorage.removeItem('token'); window.location.href = '/'; }}
            style={{ width: "100%", padding: "10px", background: "rgba(239,68,68,0.2)", border: "1px solid #ef4444", borderRadius: "8px", color: "#fca5a5", fontWeight: "600", cursor: "pointer" }}
          >
            ← Cerrar sesión
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main">
        {view === "dashboard" && (
          <>
            <div className="topbar">
              <div className="topbar-title">Dashboard <span>Empresas</span></div>
              <div className="topbar-actions">
                <button className="btn btn-ghost">↓ Exportar</button>
                <button className="btn btn-primary" onClick={abrirModalCrear}>+ Crear nueva oferta</button>
              </div>
            </div>

            <div className="content">
              {/* METRICS */}
              <div className="metrics-grid">
                <div className="metric-card" style={{"--card-accent": "#244E7C"}}>
                  <div className="metric-label">Vacantes Activas</div>
                  <div className="metric-value">{metricas.activas}</div>
                </div>
                <div className="metric-card" style={{"--card-accent": "#1a9e5c"}}>
                  <div className="metric-label">Postulaciones Totales</div>
                  <div className="metric-value">{metricas.postulaciones}</div>
                </div>
                <div className="metric-card" style={{"--card-accent": "#d97706"}}>
                  <div className="metric-label">Candidatos Revisados</div>
                  <div className="metric-value">{metricas.revisados}</div>
                </div>
                <div className="metric-card" style={{"--card-accent": "#232E56"}}>
                  <div className="metric-label">Contrataciones</div>
                  <div className="metric-value">{metricas.contrataciones}</div>
                </div>
              </div>

              {/* VACANTES TABLE */}
              <div className="section-header">
                <div className="section-title">Mis Vacantes <span className="count">{vacantes.length} registradas</span></div>
              </div>

              <div className="tabs">
                {["todas", "abierta", "cerrada"].map((t) => (
                  <button key={t} className={`tab ${tabVacantes === t ? "active" : ""}`} onClick={() => setTabVacantes(t)}>
                    {t === 'abierta' ? 'Activa' : t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>

              <div className="table-wrap">
                <div className="table-header">
                  <div>Vacante</div><div>Nivel</div><div>Fecha</div><div>Postulaciones</div><div>Estado</div><div>Acciones</div>
                </div>
                {loading ? (
                  <div style={{padding: "20px", textAlign: "center"}}>Cargando...</div>
                ) : vacantesFiltradas.length === 0 ? (
                   <div style={{padding: "20px", textAlign: "center"}}>No hay vacantes.</div>
                ) : (
                  vacantesFiltradas.map((v) => (
                    <div className="table-row" key={v.id_vacante}>
                      <div>
                        <div className="vacante-title">{v.titulo}</div>
                        <div className="vacante-area">{v.categoria}</div>
                      </div>
                      <div>
                        <span className={`badge ${v.nivel === "SENIOR" ? "badge-amber" : "badge-green"}`}>{v.nivel}</span>
                      </div>
                      <div style={{fontSize: "13px"}}>{formatearFecha(v.fecha_registro)}</div>
                      <div><span className="post-count">{v.total_postulaciones || 0}</span></div>
                      <div>
                        <span className={`badge ${v.estado === "abierta" ? "badge-green" : v.estado === "pausada" ? "badge-amber" : "badge-red"}`}>
                          {v.estado === 'abierta' ? 'ACTIVA' : v.estado.toUpperCase()}
                        </span>
                      </div>
                      <div className="table-actions">
                        <button className="action-btn" onClick={(e) => { e.preventDefault(); abrirModalVer(v.id_vacante); }}>Ver</button>
                        <button className="action-btn" onClick={(e) => { e.preventDefault(); abrirModalEditar(v.id_vacante); }}>Editar</button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* ESTUDIANTES DESTACADOS */}
              <div className="section-header">
                <div className="section-title">
                  Estudiantes Destacados UTEQ <span className="count">{estudiantes.length} disponibles</span>
                </div>
                <button className="btn btn-ghost" style={{fontSize: "12px", padding: "7px 14px"}} onClick={() => setView("candidatos")}>
                  Ver todos →
                </button>
              </div>

              <div className="estudiantes-grid">
                {estudiantes.length > 0 ? (
                  estudiantes.slice(0, 4).map((e) => (
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
                          <div className="est-stat-val">{e.habilidades?.length || 0}</div>
                          <div className="est-stat-label">Skills</div>
                        </div>
                        <div className="est-stat-item">
                          <div className="est-stat-val" style={{fontSize: "13px", color: "var(--muted2)"}}>{e.disponible}</div>
                          <div className="est-stat-label">Disponible</div>
                        </div>
                      </div>
                      <div className="skills-list">
                        {e.habilidades && e.habilidades.map((h, idx) => (
                          <span key={idx} className="skill-tag">{h}</span>
                        ))}
                      </div>
                      <div style={{display: "flex", gap: "8px"}}>
                        <button className="btn btn-primary" style={{fontSize: "12px", padding: "7px 14px", flex: 1}}>Ver perfil</button>
                        <button className="btn btn-ghost" style={{fontSize: "12px", padding: "7px 14px"}}>Contactar</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{padding: "20px", color: "var(--muted)"}}>No hay estudiantes registrados por ahora.</div>
                )}
              </div>
            </div>
          </>
        )}

        {view === "candidatos" && (
           <>
             <div className="topbar">
               <div className="topbar-title">Directorio de Estudiantes <span>Talento UTEQ</span></div>
               <div className="topbar-actions">
                 <button className="btn btn-ghost" onClick={() => setView("dashboard")}>← Regresar al Dashboard</button>
               </div>
             </div>
             
             <div className="content">
                <div className="section-header">
                  <div className="section-title">
                    Todos los Estudiantes <span className="count">{estudiantes.length} disponibles en la plataforma</span>
                  </div>
                </div>

                <div className="estudiantes-grid">
                  {estudiantes.length > 0 ? (
                    estudiantes.map((e) => (
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
                            <div className="est-stat-val">{e.habilidades?.length || 0}</div>
                            <div className="est-stat-label">Skills</div>
                          </div>
                          <div className="est-stat-item">
                            <div className="est-stat-val" style={{fontSize: "13px", color: "var(--muted2)"}}>{e.disponible}</div>
                            <div className="est-stat-label">Disponible</div>
                          </div>
                        </div>
                        <div className="skills-list">
                          {e.habilidades && e.habilidades.map((h, idx) => (
                            <span key={idx} className="skill-tag">{h}</span>
                          ))}
                        </div>
                        <div style={{display: "flex", gap: "8px"}}>
                          <button className="btn btn-primary" style={{fontSize: "12px", padding: "7px 14px", flex: 1}}>Ver perfil completo</button>
                          <button className="btn btn-ghost" style={{fontSize: "12px", padding: "7px 14px"}}>Contactar</button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{padding: "20px", color: "var(--muted)"}}>No hay estudiantes en la plataforma aún.</div>
                  )}
                </div>
             </div>
           </>
        )}

        {view === "perfil" && (
           <div className="content">
             <div className="profile-hero">
                <div className="company-logo-big">TG</div>
                <div className="company-meta">
                  <div style={{display:"flex", alignItems:"center", gap:"12px", marginBottom:"4px", flexWrap:"wrap"}}>
                    <div className="company-name">{companyData.razonSocial}</div>
                    <span style={{ display:"inline-flex", alignItems:"center", gap:"6px", padding:"5px 14px", borderRadius:"20px", background:"#dcfce7", border:"1.5px solid #86efac", color:"#166534", fontSize:"11px", fontWeight:"700" }}>
                      ✓ Aprobada
                    </span>
                  </div>
                  <div className="company-sector">{companyData.sector}</div>
                </div>
              </div>
             <button className="btn btn-primary" onClick={() => setView("dashboard")}>← Regresar al Dashboard</button>
           </div>
        )}
      </main>

      {/* MODAL CREAR / EDITAR */}
      {showModalForm && (
        <div className="modal-overlay" onClick={() => setShowModalForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">{editingId ? "✎ Editar Oferta" : "+ Crear Nueva Oferta"}</div>
            
            {formError && <div className="error-msg">{formError}</div>}
            
            {loadingModal ? (
              <div style={{textAlign:"center", padding:"40px"}}>Cargando información de la vacante...</div>
            ) : (
              <>
                <div className="form-group">
                  <label className="form-label">Título del puesto</label>
                  <input className="form-input" value={formVacante.titulo} onChange={(e) => setFormVacante({...formVacante, titulo: e.target.value})} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Área</label>
                    <select className="form-select" value={formVacante.categoria} onChange={(e) => setFormVacante({...formVacante, categoria: e.target.value})}>
                      <option value="Tecnología">Tecnología</option>
                      <option value="Diseño">Diseño</option>
                      <option value="Administración">Administración</option>
                      <option value="Finanzas">Finanzas</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nivel</label>
                    <select className="form-select" value={formVacante.nivel} onChange={(e) => setFormVacante({...formVacante, nivel: e.target.value})}>
                      <option value="JUNIOR">Junior</option>
                      <option value="SEMI-SENIOR">Semi-Senior</option>
                      <option value="SENIOR">Senior</option>
                      <option value="LEAD">Lead</option>
                    </select>
                  </div>
                </div>

                {editingId && (
                  <div className="form-group">
                    <label className="form-label">Estado de la vacante</label>
                    <select className="form-select" value={formVacante.estado} onChange={(e) => setFormVacante({...formVacante, estado: e.target.value})}>
                      <option value="abierta">🟢 Activa</option>
                      <option value="pausada">🟡 Pausada</option>
                      <option value="cerrada">🔴 Cerrada</option>
                    </select>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Descripción</label>
                  <textarea className="form-textarea" value={formVacante.descripcion} onChange={(e) => setFormVacante({...formVacante, descripcion: e.target.value})} />
                </div>

                <div className="form-group">
                  <label className="form-label">Requisitos</label>
                  <textarea className="form-textarea" value={formVacante.requisitos} onChange={(e) => setFormVacante({...formVacante, requisitos: e.target.value})} />
                </div>
                
                <div className="modal-actions">
                  <button className="btn btn-ghost" onClick={() => setShowModalForm(false)}>Cancelar</button>
                  <button className="btn btn-primary" onClick={guardarVacante} disabled={savingVacante}>
                    {savingVacante ? "Guardando..." : (editingId ? "Guardar cambios ✓" : "Publicar oferta")}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* MODAL VER (AHORA CARGA LOS POSTULANTES REALES) */}
      {showViewModal && selectedVacante && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-wide-header">
              <div>
                <div style={{fontSize: "22px", fontWeight: "800", color: "var(--text)"}}>{selectedVacante.titulo}</div>
                <div style={{fontSize: "13px", color: "var(--muted)", marginTop: "4px"}}>
                  {selectedVacante.categoria} • {selectedVacante.nivel} • Publicada: {formatearFecha(selectedVacante.fecha_registro)}
                </div>
              </div>
              <div style={{display: "flex", gap: "10px", alignItems: "center"}}>
                <span className={`badge ${selectedVacante.estado === 'abierta' ? 'badge-green' : 'badge-red'}`} style={{fontSize:"13px", padding:"6px 12px"}}>
                  {selectedVacante.estado === 'abierta' ? 'ACTIVA' : selectedVacante.estado?.toUpperCase()}
                </span>
                <button className="modal-close-btn" onClick={() => setShowViewModal(false)}>×</button>
              </div>
            </div>

            <div className="modal-wide-body">
              <div className="modal-col-left">
                <div style={{fontSize: "13px", fontWeight: "700", color: "var(--primary)", textTransform: "uppercase", marginBottom: "10px"}}>
                  Descripción del Puesto
                </div>
                <div className="vacante-detalle-text">
                  {selectedVacante.descripcion || <span style={{color:"var(--muted)"}}>Cargando descripción...</span>}
                </div>

                {selectedVacante.requisitos && (
                  <>
                    <div style={{fontSize: "13px", fontWeight: "700", color: "var(--primary)", textTransform: "uppercase", marginBottom: "10px"}}>
                      Requisitos
                    </div>
                    <div className="vacante-detalle-text">
                      {selectedVacante.requisitos}
                    </div>
                  </>
                )}

                <div style={{marginTop: "30px", borderTop: "1px solid var(--border)", paddingTop: "20px"}}>
                  <button 
                    className="btn btn-ghost" 
                    onClick={() => {
                      setShowViewModal(false); 
                      abrirModalEditar(selectedVacante.id_vacante); 
                    }}
                  >
                    ✎ Editar esta vacante
                  </button>
                </div>
              </div>

              <div className="modal-col-right">
                <div style={{padding:"24px", paddingBottom:"10px", fontSize: "13px", fontWeight: "700", color: "var(--primary)", textTransform: "uppercase", display:"flex", justifyContent:"space-between", position:"sticky", top:0, background:"#f8fafc"}}>
                  <span>Candidatos Postulados</span>
                  <span style={{background:"var(--primary)", color:"white", padding:"2px 8px", borderRadius:"10px", fontSize:"11px"}}>
                    {selectedVacante.total_postulaciones || 0}
                  </span>
                </div>

                <div style={{padding:"0 24px 24px", display: "flex", flexDirection: "column", gap: "12px"}}>
                  {postulantes.length > 0 ? (
                    postulantes.map((p) => (
                      <div className="alumno-mini-card" key={`post-${p.id}`}>
                        <div className="al-mini-avatar">{initials(p.nombre)}</div>
                        <div className="al-mini-info">
                          <div className="al-mini-name">{p.nombre}</div>
                          <div className="al-mini-carrera">{p.carrera}</div>
                        </div>
                        <button className="btn btn-ghost" style={{padding:"4px 8px", fontSize:"10px"}}>Ver CV</button>
                      </div>
                    ))
                  ) : (
                    <div style={{background: "white", padding: "16px", borderRadius: "10px", border: "1px dashed var(--border2)"}}>
                      <div style={{fontSize:"13px", fontWeight:"600", marginBottom:"4px"}}>Aún no hay postulaciones</div>
                      <div style={{fontSize:"12px", color:"var(--muted)", lineHeight:"1.5"}}>
                        Cuando un estudiante de la UTEQ se postule a esta vacante, aparecerá aquí.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}