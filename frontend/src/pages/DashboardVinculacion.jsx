import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../CSS/DashboardVinculacion.css'; 
import { API_BASE, buildFileUrl } from '../config/api';

// ─── HELPERS ────────────────────────────────────────────────────────────────
const initials = (name) => name ? name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "AD";

const formatFecha = (fecha) => {
  if (!fecha) return '—';
  const d = new Date(fecha);
  return d.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
};

// Función para obtener la URL correcta del PDF
const getFileSource = (path) => {
  return buildFileUrl(path);
};

export default function DashboardVinculacion() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // ESTADO PARA EL MENÚ MÓVIL
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // ESTADOS PRINCIPALES DE VISTA
  const [view, setView] = useState("dashboard"); 
  const [chatbotTab, setChatbotTab] = useState("documento"); 

  // ESTADOS DE DATOS
  const [stats, setStats] = useState({ totalEmpresas: 0, totalEstudiantes: 0, totalProyectos: 0, vacantesActivas: 0 });
  const [empresas, setEmpresas] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [vacantes, setVacantes] = useState([]);
  
  // ESTADOS PARA HORARIOS DE PROFESORES
  const [horarios, setHorarios] = useState([]);
  const [profesoresSelect, setProfesoresSelect] = useState([]);
  const [savingHorario, setSavingHorario] = useState(false);
  const [formHorario, setFormHorario] = useState({ id_profesor: '', titulo: '', descripcion: '', archivo: null });

  const [loading, setLoading] = useState(true);

  // ESTADOS PARA FORMULARIOS DEL CHATBOT
  const [docContenido, setDocContenido] = useState("Eres el asistente de SkillMatch...\n\nFECHAS IMPORTANTES:\n- Inicio de estadía: 4 de mayo 2026\n- Fin de estadía: 31 de agosto 2026\n...");
  const [fechasPeriodo, setFechasPeriodo] = useState({
    periodo: "Mayo-Agosto 2026",
    limiteEmpresa: "2026-04-15",
    limiteCV: "2026-04-21",
    inicioEstadia: "2026-05-04",
    finEstadia: "2026-08-31",
    talleres: "Junio, Julio y Agosto",
    horas: "IDGS: 480 hrs | IMT: 480 hrs | IRIC: 480 hrs"
  });
  const [faqs, setFaqs] = useState([
    { id: 1, keywords: "seguro, accidentes", respuesta: "El costo del seguro...", activa: true },
    { id: 2, keywords: "donacion, titulacion, $695", respuesta: "El pago de donación...", activa: true },
    { id: 3, keywords: "carta presentacion", respuesta: "La carta se solicita...", activa: true },
  ]);
  const [newFaq, setNewFaq] = useState({ keywords: "", respuesta: "" });

  // ESTADOS PARA EL MODAL DE REGISTRO DE EMPRESA
  const [showModal, setShowModal] = useState(false);
  const [savingEmpresa, setSavingEmpresa] = useState(false);
  const [formEmpresa, setFormEmpresa] = useState({
    nombre: '', apellido: '', correo: '', password: '', id_rol: 3, razon_social: '', giro: '', contacto: ''
  });

  // CARGAR DATOS INICIALES
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    cargarDatosAdmin();
    cargarHorariosData(); // Cargar datos de horarios y profesores
  }, [token]);

  // FUNCIÓN PARA CAMBIAR DE VISTA Y CERRAR EL MENÚ EN MÓVIL
  const handleNavClick = (vista) => {
    setView(vista);
    setIsMobileMenuOpen(false); 
  };

  const cargarDatosAdmin = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/admin/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();

      if (json.ok) {
        setStats(json.data.stats);
        setEmpresas(json.data.empresas);
        setAlumnos(json.data.alumnos);
        setProyectos(json.data.proyectos);
        setVacantes(json.data.vacantes);
      }
    } catch (error) {
      console.error("Error al cargar datos de administración:", error);
    } finally {
      setLoading(false);
    }
  };

  // CARGAR DATOS DE HORARIOS Y PROFESORES
  const cargarHorariosData = async () => {
    try {
      const [resProfes, resHorarios] = await Promise.all([
        fetch(`${API_BASE}/admin/profesores-list`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE}/admin/horarios`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      const jsonProfes = await resProfes.json();
      const jsonHorarios = await resHorarios.json();
      if (jsonProfes.ok) setProfesoresSelect(jsonProfes.profesores);
      if (jsonHorarios.ok) setHorarios(jsonHorarios.horarios);
    } catch (error) {
      console.error("Error al cargar datos de horarios:", error);
    }
  };

  // MANEJAR SUBIDA DE HORARIOS
  const handleSubirHorario = async (e) => {
    e.preventDefault();
    if (!formHorario.id_profesor || !formHorario.titulo || !formHorario.archivo) {
      alert("⚠️ Profesor, título y archivo son obligatorios");
      return;
    }
    setSavingHorario(true);
    try {
      const formData = new FormData();
      formData.append('id_profesor', formHorario.id_profesor);
      formData.append('titulo', formHorario.titulo);
      formData.append('descripcion', formHorario.descripcion);
      formData.append('ruta_pdf', formHorario.archivo); // Debe coincidir con lo que espera Multer

      const res = await fetch(`${API_BASE}/admin/horarios`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      
      if (data.ok) {
        alert("✓ Horario subido correctamente");
        setFormHorario({ id_profesor: '', titulo: '', descripcion: '', archivo: null });
        document.getElementById('file-horario').value = ""; // Resetear el input file visualmente
        cargarHorariosData();
      } else {
        alert(data.mensaje);
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión al subir el horario");
    } finally {
      setSavingHorario(false);
    }
  };

  // ELIMINAR HORARIO
  const handleEliminarHorario = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este horario permanentemente?")) return;
    try {
      const res = await fetch(`${API_BASE}/admin/horarios/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.ok) {
        cargarHorariosData();
      } else {
        alert(data.mensaje);
      }
    } catch(error) {
      console.error(error);
    }
  };


  // FUNCIONES DE GESTIÓN (EMPRESAS, CHATBOT, ETC.)
  const handleToggleStatus = async (id, estadoActual) => {
    const nuevoEstado = estadoActual === 'habilitada' ? 'deshabilitada' : 'habilitada';
    try {
      const res = await fetch(`${API_BASE}/admin/empresas/status/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ nuevoEstado })
      });
      const data = await res.json();
      if (data.ok) cargarDatosAdmin();
    } catch (error) { console.error(error); }
  };

  const handleCrearEmpresa = async (e) => {
    e.preventDefault();
    setSavingEmpresa(true);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formEmpresa)
      });
      const data = await res.json();
      if (data.ok) {
        alert("Empresa registrada exitosamente");
        setShowModal(false);
        cargarDatosAdmin();
        setFormEmpresa({ nombre: '', apellido: '', correo: '', password: '', id_rol: 3, razon_social: '', giro: '', contacto: '' });
      } else { alert(data.mensaje); }
    } catch (error) { console.error(error); }
    finally { setSavingEmpresa(false); }
  };

  const handleAddFaq = (e) => {
    e.preventDefault();
    if (!newFaq.keywords || !newFaq.respuesta) return;
    setFaqs([...faqs, { id: Date.now(), ...newFaq, activa: true }]);
    setNewFaq({ keywords: "", respuesta: "" });
  };

  if (loading) return <div className="loading-screen">Cargando datos del sistema...</div>;

  return (
    <div className="app">

 {/* OVERLAY MÓVIL */}
      {isMobileMenuOpen && (
        <div className="mobile-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      {/* ── SIDEBAR (Con clase dinámica) ── */}
      <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="brand">Skill<span>Match</span></div>
          <div className="brand-sub">Panel de Administración</div>
        </div>

        <div className="nav-wrap">
          <div className="nav-group-label">General</div>
          <div className={`nav-item ${view === "dashboard" ? "active" : ""}`} onClick={() => handleNavClick("dashboard")}>
            <span className="nav-icon">▦</span> Dashboard
          </div>

          <div className="nav-group-label" style={{ marginTop: "12px" }}>Usuarios</div>
          <div className={`nav-item ${view === "empresas" ? "active" : ""}`} onClick={() => handleNavClick("empresas")}>
            <span className="nav-icon">🏢</span> Empresas
          </div>
          <div className={`nav-item ${view === "alumnos" ? "active" : ""}`} onClick={() => handleNavClick("alumnos")}>
            <span className="nav-icon">🎓</span> Alumnos
          </div>

          <div className="nav-group-label" style={{ marginTop: "12px" }}>Contenido</div>
          <div className={`nav-item ${view === "proyectos" ? "active" : ""}`} onClick={() => handleNavClick("proyectos")}>
            <span className="nav-icon">📁</span> Proyectos
          </div>
          <div className={`nav-item ${view === "vacantes" ? "active" : ""}`} onClick={() => handleNavClick("vacantes")}>
            <span className="nav-icon">💼</span> Vacantes
          </div>
          
 {/* NUEVA SECCIÓN DE HORARIOS */}
          <div className={`nav-item ${view === "horarios" ? "active" : ""}`} onClick={() => handleNavClick("horarios")}>
            <span className="nav-icon">📅</span> Horarios Profes
          </div>

          <div className="nav-group-label" style={{ marginTop: "24px" }}>Administración</div>
          <div className={`nav-item ${view === "chatbot" ? "active" : ""}`} onClick={() => handleNavClick("chatbot")}>
            <span className="nav-icon">🤖</span> Configurar Chatbot
          </div>

          <div className="nav-item" style={{marginTop:"12px", color: '#fca5a5'}} onClick={() => { localStorage.clear(); navigate("/"); }}>
            <span className="nav-icon">←</span> Cerrar sesión
          </div>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar">{initials(user.nombre + " " + (user.apellido || ""))}</div>
          <div>
            <div className="user-name">{user.nombre} {user.apellido}</div>
            <div className="user-role">Administrador</div>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="main">

        {/* ════ VIEW: DASHBOARD ════ */}
        {view === "dashboard" && (
          <>
            <div className="topbar">
              <div className="topbar-left-wrap">
 {/* BOTÓN HAMBURGUESA */}
                <button className="hamburger-btn" onClick={() => setIsMobileMenuOpen(true)}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                </button>
                <div className="topbar-left">
                  <div className="topbar-title">Dashboard General</div>
                  <div className="topbar-sub">Visión global de la plataforma</div>
                </div>
              </div>
            </div>
            <div className="content">
              <div className="metrics">
                <div className="metric-card" style={{"--mc":"#3b82f6"}} onClick={() => handleNavClick("empresas")}>
                  <span className="mc-icon">🏢</span>
                  <div className="mc-label">Total Empresas</div>
                  <div className="mc-val">{stats.totalEmpresas}</div>
                </div>
                <div className="metric-card" style={{"--mc":"#10b981"}} onClick={() => handleNavClick("alumnos")}>
                  <span className="mc-icon">🎓</span>
                  <div className="mc-label">Total Alumnos</div>
                  <div className="mc-val">{stats.totalEstudiantes}</div>
                </div>
                <div className="metric-card" style={{"--mc":"#8b5cf6"}} onClick={() => handleNavClick("proyectos")}>
                  <span className="mc-icon">📁</span>
                  <div className="mc-label">Proyectos Subidos</div>
                  <div className="mc-val">{stats.totalProyectos}</div>
                </div>
                <div className="metric-card" style={{"--mc":"#f59e0b"}} onClick={() => handleNavClick("vacantes")}>
                  <span className="mc-icon">💼</span>
                  <div className="mc-label">Vacantes Activas</div>
                  <div className="mc-val">{stats.vacantesActivas}</div>
                </div>
              </div>
            </div>
          </>
        )}

 {/* ════ VIEW: HORARIOS DE PROFESORES (NUEVO) ════ */}
        {view === "horarios" && (
          <>
            <div className="topbar">
              <div className="topbar-left-wrap">
                <button className="hamburger-btn" onClick={() => setIsMobileMenuOpen(true)}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                </button>
                <div className="topbar-left">
                  <div className="topbar-title">Horarios de Profesores</div>
                  <div className="topbar-sub">Sube y gestiona los horarios académicos</div>
                </div>
              </div>
            </div>
            
            <div className="content">
              {/* Formulario de Subida */}
              <div className="admin-form" style={{ background: 'white', padding: 'clamp(20px, 3vw, 30px)', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                <h3 style={{color:'#232E56', marginBottom:'20px'}}>Asignar Nuevo Horario</h3>
                <form onSubmit={handleSubirHorario}>
                  <div className="form-row" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginBottom: '15px'}}>
                    <div className="form-group" style={{margin: 0}}>
                      <label className="form-label">Profesor *</label>
                      <select className="form-input" required value={formHorario.id_profesor} onChange={e => setFormHorario({...formHorario, id_profesor: e.target.value})}>
                        <option value="">Selecciona un profesor...</option>
                        {profesoresSelect.map(p => (
                          <option key={p.id_profesor} value={p.id_profesor}>{p.nombre} {p.apellido}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group" style={{margin: 0}}>
                      <label className="form-label">Título del Horario *</label>
                      <input type="text" className="form-input" required placeholder="Ej. Cuatrimestre Ene-Abr 2026" value={formHorario.titulo} onChange={e => setFormHorario({...formHorario, titulo: e.target.value})} />
                    </div>
                  </div>
                  
                  <div className="form-group" style={{marginBottom: '15px'}}>
                    <label className="form-label">Descripción (Opcional)</label>
                    <textarea className="form-input" style={{minHeight: '60px', resize: 'vertical'}} placeholder="Notas adicionales o materias..." value={formHorario.descripcion} onChange={e => setFormHorario({...formHorario, descripcion: e.target.value})} />
                  </div>

                  <div className="form-group" style={{marginBottom: '20px'}}>
                    <label className="form-label">Archivo PDF *</label>
                    <input type="file" id="file-horario" accept=".pdf" className="form-input" required onChange={e => setFormHorario({...formHorario, archivo: e.target.files[0]})} />
                  </div>

                  <div style={{display:'flex', justifyContent:'flex-end'}}>
                    <button type="submit" className="btn-primary" disabled={savingHorario}>
                      {savingHorario ? 'Subiendo archivo...' : 'Subir Horario ✓'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Tabla de Horarios Subidos */}
              <div className="section-hdr">
                <div className="section-title">Horarios Registrados <span className="section-count">{horarios.length} totales</span></div>
              </div>

              <div className="rel-table-wrap">
                <div className="rel-table-hdr" style={{gridTemplateColumns: '1.5fr 1fr 1fr 1fr 100px', minWidth: '700px'}}>
                  <div>Profesor</div><div>Título</div><div>Fecha de Subida</div><div>Documento</div><div>Acción</div>
                </div>
                {horarios.length === 0 ? (
                  <div style={{padding: '30px', textAlign: 'center', color: 'var(--muted)'}}>Aún no se han registrado horarios.</div>
                ) : (
                  horarios.map(h => (
                    <div className="rel-table-row" style={{gridTemplateColumns: '1.5fr 1fr 1fr 1fr 100px', minWidth: '700px'}} key={h.id_horario}>
                      <div className="rel-nombre">{h.nombre} {h.apellido}</div>
                      <div className="rel-sub">{h.titulo}</div>
                      <div className="rel-sub">{formatFecha(h.fecha_subida)}</div>
                      <div>
                        <a href={getFileSource(h.ruta_pdf)} target="_blank" rel="noreferrer" style={{fontSize: '12px', color: 'var(--primary)', fontWeight: '700', textDecoration: 'none', background: '#e0e7ff', padding: '4px 10px', borderRadius: '12px'}}>Ver PDF</a>
                      </div>
                      <div>
                        <button className="btn-toggle-off" onClick={() => handleEliminarHorario(h.id_horario)}>Eliminar</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}

 {/* ════ VIEW: CONFIGURAR CHATBOT ════ */}
        {view === "chatbot" && (
          <>
            <div className="topbar">
              <div className="topbar-left-wrap">
                <button className="hamburger-btn" onClick={() => setIsMobileMenuOpen(true)}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                </button>
                <div className="topbar-left">
                  <div className="topbar-title">Panel de Control del Chatbot</div>
                  <div className="topbar-sub">Gestiona el conocimiento y respuestas de la IA</div>
                </div>
              </div>
            </div>

            <div className="content">
              {/* PESTAÑAS ESTILO SKILLMATCH */}
              <div className="tabs-flat" style={{display:'flex', gap:'5px', marginBottom:'25px', borderBottom:'1px solid #e2e8f0', paddingBottom:'5px', flexWrap: 'wrap'}}>
                {[
                  { id: "documento", label: "Documento institucional", icon: "📄" },
                  { id: "fechas", label: "Fechas rápidas", icon: "🗓️" },
                  { id: "estadisticas", label: "Estadísticas", icon: "📊" },
                  { id: "faqs", label: "FAQs predefinidas", icon: "💡" }
                ].map(tab => (
                  <button 
                    key={tab.id} 
                    onClick={() => setChatbotTab(tab.id)}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '8px',
                      border: 'none',
                      background: chatbotTab === tab.id ? '#232E56' : 'transparent',
                      color: chatbotTab === tab.id ? 'white' : '#64748b',
                      fontWeight: '600',
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s'
                    }}
                  >
                    <span>{tab.icon}</span> {tab.label}
                  </button>
                ))}
              </div>

              {/* CONTENIDO DE PESTAÑAS */}
              <div className="tab-content" style={{ background: 'white', padding: 'clamp(15px, 3vw, 30px)', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                
                {/* 1. DOCUMENTO INSTITUCIONAL */}
                {chatbotTab === "documento" && (
                  <div className="admin-form">
                    <h3 style={{color:'#232E56', marginBottom:'10px'}}>Base de Conocimiento Principal</h3>
                    <p style={{fontSize:'13px', color:'#64748b', marginBottom:'20px'}}>Este texto es lo que la IA lee para responder preguntas abiertas. Actualízalo cuando cambien procesos o información general de la UTEQ.</p>
                    <div className="form-group">
                      <label className="form-label">Contenido del Documento</label>
                      <textarea 
                        className="form-input" 
                        style={{minHeight: '350px', fontFamily: 'monospace', fontSize: '13px', lineHeight: '1.6', resize: 'vertical'}}
                        value={docContenido}
                        onChange={(e) => setDocContenido(e.target.value)}
                      />
                    </div>
                    <div style={{display:'flex', justifyContent:'flex-end', gap:'10px', marginTop:'20px', flexWrap: 'wrap'}}>
                      <button className="btn-ghost">Vista previa</button>
                      <button className="btn-primary">Guardar cambios ✓</button>
                    </div>
                  </div>
                )}

                {/* 2. FECHAS RÁPIDAS */}
                {chatbotTab === "fechas" && (
                  <div className="admin-form">
                    <h3 style={{color:'#232E56', marginBottom:'10px'}}>Fechas del Periodo Actual</h3>
                    <p style={{fontSize:'13px', color:'#64748b', marginBottom:'20px'}}>Estos campos actualizan automáticamente las respuestas de fechas en el chatbot sin editar el documento completo.</p>
                    
                    <div className="form-row" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', marginBottom:'15px'}}>
                      <div className="form-group">
                        <label className="form-label">Periodo</label>
                        <input type="text" className="form-input" value={fechasPeriodo.periodo} onChange={e => setFechasPeriodo({...fechasPeriodo, periodo: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Fecha Límite Elegir Empresa</label>
                        <input type="date" className="form-input" value={fechasPeriodo.limiteEmpresa} onChange={e => setFechasPeriodo({...fechasPeriodo, limiteEmpresa: e.target.value})} />
                      </div>
                    </div>

                    <div className="form-row" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', marginBottom:'15px'}}>
                      <div className="form-group">
                        <label className="form-label">Fecha Límite Entregar CV</label>
                        <input type="date" className="form-input" value={fechasPeriodo.limiteCV} onChange={e => setFechasPeriodo({...fechasPeriodo, limiteCV: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Fecha Inicio de Estadía</label>
                        <input type="date" className="form-input" value={fechasPeriodo.inicioEstadia} onChange={e => setFechasPeriodo({...fechasPeriodo, inicioEstadia: e.target.value})} />
                      </div>
                    </div>

                    <div className="form-group" style={{marginBottom:'15px'}}>
                      <label className="form-label">Horas Requeridas por Carrera</label>
                      <input type="text" className="form-input" value={fechasPeriodo.horas} onChange={e => setFechasPeriodo({...fechasPeriodo, horas: e.target.value})} />
                    </div>

                    <div style={{display:'flex', justifyContent:'flex-end', marginTop:'20px'}}>
                      <button className="btn-primary">Guardar fechas ✓</button>
                    </div>
                  </div>
                )}

                {/* 3. ESTADÍSTICAS */}
                {chatbotTab === "estadisticas" && (
                  <div>
                    <h3 style={{color:'#232E56', marginBottom:'25px'}}>Actividad Reciente del Chatbot</h3>
                    <div className="metrics-flat" style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'15px', marginBottom:'30px'}}>
                      {[
                        { label: "Mensajes hoy", value: "247", icon: "💬" },
                        { label: "Usuarios únicos", value: "38", icon: "👤" },
                        { label: "Clasificados correctamente", value: "91%", icon: "🎯" },
                        { label: "Llamadas a la API (Claude)", value: "12", icon: "🧠" }
                      ].map(m => (
                        <div key={m.label} style={{padding:'20px', background:'#f8fafc', borderRadius:'12px', border:'1px solid #e2e8f0', textAlign:'center'}}>
                          <div style={{fontSize:'24px', marginBottom:'5px'}}>{m.icon}</div>
                          <div style={{fontSize:'28px', fontWeight:'800', color:'#232E56'}}>{m.value}</div>
                          <div style={{fontSize:'12px', color:'#64748b', marginTop:'3px'}}>{m.label}</div>
                        </div>
                      ))}
                    </div>
                    <h4 style={{color:'#64748b', textTransform:'uppercase', fontSize:'12px', marginBottom:'15px'}}>Preguntas más frecuentes hoy</h4>
                    <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                      {["cuándo empieza la estadía", "qué pasa si no tengo empresa", "horario de servicios escolares"].map(q => (
                        <div key={q} style={{display:'flex', justifyContent:'space-between', padding:'12px', background:'#fff', borderRadius:'8px', border:'1px solid #eee', fontSize:'13px', flexWrap: 'wrap', gap: '5px'}}>
                          <span style={{fontWeight:'600', color:'#334155'}}>"{q}"</span>
                          <span style={{color:'#1a9e5c', fontWeight:'bold'}}>faq — 43 veces</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. FAQs PREDEFINIDAS */}
                {chatbotTab === "faqs" && (
                  <div className="admin-form">
                    <h3 style={{color:'#232E56', marginBottom:'10px'}}>Respuestas Rápidas Predefinidas</h3>
                    <p style={{fontSize:'13px', color:'#64748b', marginBottom:'25px'}}>Estas respuestas se envían directo sin pasar por la IA. Son más rápidas y ahorran costos de API.</p>
                    
                    <form onSubmit={handleAddFaq} style={{background:'#f8fafc', padding:'20px', borderRadius:'12px', border:'1px solid #e2e8f0', marginBottom:'30px'}}>
                      <div className="form-group" style={{marginBottom:'15px'}}>
                        <label className="form-label">Palabras clave / Pregunta (Separadas por coma)</label>
                        <input type="text" className="form-input" placeholder="ej: seguro, accidentes, costo seguro" value={newFaq.keywords} onChange={e => setNewFaq({...newFaq, keywords: e.target.value})} />
                      </div>
                      <div className="form-group" style={{marginBottom:'15px'}}>
                        <label className="form-label">Respuesta que se envía al usuario</label>
                        <textarea className="form-input" style={{minHeight:'80px'}} placeholder="Escribe la respuesta exacta..." value={newFaq.respuesta} onChange={e => setNewFaq({...newFaq, respuesta: e.target.value})} />
                      </div>
                      <button type="submit" className="btn-primary" style={{width:'100%'}}>+ Agregar respuesta rápida</button>
                    </form>

                    <h4 style={{color:'#64748b', textTransform:'uppercase', fontSize:'12px', marginBottom:'15px'}}>Respuestas existentes</h4>
                    <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                      {faqs.map(faq => (
                        <div key={faq.id} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 20px', background:'#fff', borderRadius:'10px', border:'1px solid #eee', fontSize:'13px', flexWrap: 'wrap', gap: '10px'}}>
                          <span style={{fontWeight:'600', color:'#232E56'}}>"{faq.keywords}"</span>
                          <div style={{display:'flex', gap:'8px'}}>
                            <span style={{color:'#1a9e5c', fontWeight:'bold'}}>Activa</span>
                            <span style={{color:'#ef4444', cursor:'pointer'}}>Eliminar</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </>
        )}

        {/* ════ OTRAS VISTAS (EMPRESAS, ALUMNOS, ETC.) ════ */}
        {view === "empresas" && (
          <>
            <div className="topbar">
              <div className="topbar-left-wrap">
                <button className="hamburger-btn" onClick={() => setIsMobileMenuOpen(true)}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                </button>
                <div className="topbar-left"><div className="topbar-title">Directorio de Empresas</div></div>
              </div>
              <button className="btn-primary" onClick={() => setShowModal(true)}>+ Registrar Empresa</button>
            </div>
            <div className="content">
              <div className="rel-table-wrap">
                <div className="rel-table-hdr" style={{gridTemplateColumns: '2fr 1.5fr 1.5fr 1fr 120px', minWidth: '800px'}}>
                  <div>Empresa</div><div>Giro</div><div>Contacto</div><div>Estado</div><div>Acción</div>
                </div>
                {empresas.map(e => (
                  <div className="rel-table-row" style={{gridTemplateColumns: '2fr 1.5fr 1.5fr 1fr 120px', minWidth: '800px'}} key={e.id}>
                    <div className="rel-nombre">{e.nombre}</div>
                    <div className="rel-sub">{e.giro || '—'}</div>
                    <div className="rel-sub">{e.contacto}</div>
                    <div><span className={`badge badge-${e.estado === 'habilitada' ? 'active' : 'inactive'}`}>{e.estado}</span></div>
                    <div><button className={e.estado === 'habilitada' ? 'btn-toggle-off' : 'btn-toggle-on'} onClick={() => handleToggleStatus(e.id, e.estado)}>{e.estado === 'habilitada' ? 'Inhabilitar' : 'Habilitar'}</button></div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {view === "alumnos" && (
          <>
            <div className="topbar">
              <div className="topbar-left-wrap">
                <button className="hamburger-btn" onClick={() => setIsMobileMenuOpen(true)}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                </button>
                <div className="topbar-left"><div className="topbar-title">Alumnos Registrados</div></div>
              </div>
            </div>
            <div className="content">
              <div className="rel-table-wrap">
                <div className="rel-table-hdr" style={{gridTemplateColumns: '2fr 1.5fr 1fr 1fr 100px', minWidth: '700px'}}>
                  <div>Alumno</div><div>Carrera</div><div>Matrícula</div><div>Semestre</div><div>Acción</div>
                </div>
                {alumnos.map(a => (
                  <div className="rel-table-row" style={{gridTemplateColumns: '2fr 1.5fr 1fr 1fr 100px', minWidth: '700px'}} key={a.id}>
                    <div className="rel-nombre">{a.nombre}</div>
                    <div className="rel-sub">{a.carrera}</div>
                    <div className="rel-sub">{a.matricula}</div>
                    <div className="rel-sub">{a.semestre}°</div>
                    <div style={{fontSize: "12px", color: "var(--primary)", fontWeight: "600", cursor: "pointer"}} onClick={() => navigate(`/ver-alumno/${a.id_usuario}`)}>Perfil</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {view === "proyectos" && (
          <>
            <div className="topbar">
              <div className="topbar-left-wrap">
                <button className="hamburger-btn" onClick={() => setIsMobileMenuOpen(true)}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                </button>
                <div className="topbar-left"><div className="topbar-title">Proyectos Académicos</div></div>
              </div>
            </div>
            <div className="content">
              <div className="rel-table-wrap">
                <div className="rel-table-hdr" style={{gridTemplateColumns: '2fr 1.5fr 1fr 1fr 100px', minWidth: '700px'}}>
                  <div>Título</div><div>Autor</div><div>Fecha</div><div>Estado</div><div>Acción</div>
                </div>
                {proyectos.map(p => (
                  <div className="rel-table-row" style={{gridTemplateColumns: '2fr 1.5fr 1fr 1fr 100px', minWidth: '700px'}} key={p.id}>
                    <div className="rel-nombre">{p.titulo}</div>
                    <div className="rel-sub">{p.autor}</div>
                    <div className="rel-sub">{formatFecha(p.fecha)}</div>
                    <div><span className={`badge ${p.estado === "completado" ? "badge-approved" : "badge-pending"}`}>{p.estado}</span></div>
                    <div style={{fontSize: "12px", color: "var(--red)", fontWeight: "600", cursor: "pointer"}}>Eliminar</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {view === "vacantes" && (
          <>
            <div className="topbar">
              <div className="topbar-left-wrap">
                <button className="hamburger-btn" onClick={() => setIsMobileMenuOpen(true)}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                </button>
                <div className="topbar-left"><div className="topbar-title">Bolsa de Trabajo</div></div>
              </div>
            </div>
            <div className="content">
              <div className="rel-table-wrap">
                <div className="rel-table-hdr" style={{gridTemplateColumns: '2fr 1.5fr 1fr 1fr 100px', minWidth: '700px'}}>
                  <div>Vacante</div><div>Empresa</div><div>Nivel</div><div>Estado</div><div>Acción</div>
                </div>
                {vacantes.map(v => (
                  <div className="rel-table-row" style={{gridTemplateColumns: '2fr 1.5fr 1fr 1fr 100px', minWidth: '700px'}} key={v.id}>
                    <div className="rel-nombre">{v.titulo}</div>
                    <div className="rel-sub">{v.empresa}</div>
                    <div className="rel-sub">{v.nivel}</div>
                    <div><span className={`badge badge-${v.estado === "abierta" ? "active" : "inactive"}`}>{v.estado}</span></div>
                    <div style={{fontSize: "12px", color: "var(--primary)", fontWeight: "600", cursor: "pointer"}}>Detalles</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

      </main>

      {/* ── MODAL CRUD EMPRESA ── */}
      {showModal && (
        <div className="overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{maxWidth: '550px', padding: '30px'}} onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title" style={{marginBottom: '10px'}}>Registrar Nueva Empresa</h2>
            <p style={{fontSize: '13px', color: '#666', marginBottom: '20px'}}>Completa los datos del responsable y de la institución.</p>
            <form onSubmit={handleCrearEmpresa} className="admin-form">
              <div className="form-row" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '15px'}}>
                <div className="form-group" style={{margin: 0}}>
                  <label>Nombre del Responsable</label>
                  <input type="text" required value={formEmpresa.nombre} onChange={e => setFormEmpresa({...formEmpresa, nombre: e.target.value})} placeholder="Ej. Juan" />
                </div>
                <div className="form-group" style={{margin: 0}}>
                  <label>Apellido</label>
                  <input type="text" required value={formEmpresa.apellido} onChange={e => setFormEmpresa({...formEmpresa, apellido: e.target.value})} placeholder="Ej. Pérez" />
                </div>
              </div>
              <div className="form-group" style={{marginBottom: '15px'}}>
                <label>Correo Electrónico (Acceso)</label>
                <input type="email" required value={formEmpresa.correo} onChange={e => setFormEmpresa({...formEmpresa, correo: e.target.value})} placeholder="rh@empresa.com" />
              </div>
              <div className="form-group" style={{marginBottom: '15px'}}>
                <label>Contraseña Temporal</label>
                <input type="password" required value={formEmpresa.password} onChange={e => setFormEmpresa({...formEmpresa, password: e.target.value})} placeholder="••••••••" />
              </div>
              <div style={{height: '1px', background: '#eee', margin: '20px 0'}}></div>
              <div className="form-group" style={{marginBottom: '15px'}}>
                <label>Razón Social de la Empresa</label>
                <input type="text" required value={formEmpresa.razon_social} onChange={e => setFormEmpresa({...formEmpresa, razon_social: e.target.value})} placeholder="Nombre Legal S.A. de C.V." />
              </div>
              <div className="form-row" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '15px'}}>
                <div className="form-group" style={{margin: 0}}>
                  <label>Giro / Industria</label>
                  <input type="text" value={formEmpresa.giro} onChange={e => setFormEmpresa({...formEmpresa, giro: e.target.value})} placeholder="Ej. TI, Salud" />
                </div>
                <div className="form-group" style={{margin: 0}}>
                  <label>Nombre Comercial / Contacto</label>
                  <input type="text" required value={formEmpresa.contacto} onChange={e => setFormEmpresa({...formEmpresa, contacto: e.target.value})} placeholder="Ej. TechSoluciones" />
                </div>
              </div>
              <div className="modal-actions" style={{marginTop: '30px', display: 'flex', gap: '12px', justifyContent: 'flex-end', flexWrap: 'wrap'}}>
                <button type="button" className="btn-ghost" onClick={() => setShowModal(false)} disabled={savingEmpresa}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={savingEmpresa}>{savingEmpresa ? "Guardando..." : "Registrar Empresa ✓"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}