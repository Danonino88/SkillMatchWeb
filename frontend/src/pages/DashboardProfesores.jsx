import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { startRegistration } from '@simplewebauthn/browser';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import '../CSS/DashboardProfesores.css'; // 🟢 Asegúrate de que apunte al CSS correcto

const API_BASE = 'https://skillmatch-backend-duiu.onrender.com/api';

const initials = (name) =>
  name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'PR';

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
  'React', 'Node.js', 'Express', 'MySQL', 'PostgreSQL', 'MongoDB',
  'JavaScript', 'TypeScript', 'PHP', 'Laravel', 'Python', 'Django',
  'Java', 'Spring Boot', 'Flutter', 'Firebase', 'HTML', 'CSS',
  'Tailwind', 'Bootstrap', 'Git', 'GitHub', 'Docker', 'API REST'
];

export default function DashboardProfesores() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [view, setView] = useState('dashboard');
  
  // 🟢 ESTADO PARA EL MENÚ MÓVIL 🟢
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [dashboardData, setDashboardData] = useState(null);
  const [proyectos, setProyectos] = useState([]);
  const [evidencias, setEvidencias] = useState([]);
  const [alumnos, setAlumnos] = useState([]); 

  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [loadingProyectos, setLoadingProyectos] = useState(false);
  const [loadingEvidencias, setLoadingEvidencias] = useState(false);
  const [loadingAlumnos, setLoadingAlumnos] = useState(false);
  const [globalError, setGlobalError] = useState('');

  const [tecnologiasSeleccionadas, setTecnologiasSeleccionadas] = useState([]);
  const [imgPrincipal, setImgPrincipal] = useState(null);
  const imgProyectoRef = useRef(null);

  const [tituloProyecto, setTituloProyecto] = useState('');
  const [descProyecto, setDescProyecto] = useState('');
  const [estadoProyecto, setEstadoProyecto] = useState('en progreso');
  const [areaTrabajo, setAreaTrabajo] = useState('');
  const [ambitoDesarrollo, setAmbitoDesarrollo] = useState('');
  const [esInnovacion, setEsInnovacion] = useState(false);
  const [yaTrabaja, setYaTrabaja] = useState(false);
  const [competenciaImpacto, setCompetenciaImpacto] = useState('');
  const [objetivo, setObjetivo] = useState('');
  const [actividades, setActividades] = useState('');

  const [savingProyecto, setSavingProyecto] = useState(false);
  const [uploadResult, setUploadResult] = useState('');
  const [uploadError, setUploadError] = useState('');

  const [editingProyectoId, setEditingProyectoId] = useState(null);

  const [archivoEvidencia, setArchivoEvidencia] = useState(null);
  const [tipoEvidencia, setTipoEvidencia] = useState('');
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState('');

  const evidenciaRef = useRef(null);

  // ESTADOS PARA FACE ID
  const [errorBio, setErrorBio] = useState('');
  const [successBio, setSuccessBio] = useState('');
  const [loadingBio, setLoadingBio] = useState(false);

  const nombreCompleto = user.nombre ? `${user.nombre} ${user.apellido}` : 'Profesor';

  // 🟢 FUNCIÓN PARA CAMBIAR DE VISTA Y CERRAR EL MENÚ EN MÓVIL
  const handleNavClick = (vista) => {
    setView(vista);
    setIsMobileMenuOpen(false);
  };

  const toggleTecnologia = (tech) => {
    setTecnologiasSeleccionadas((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    );
  };

  const generarPDFPerfil = () => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('SkillMatch - Perfil del Profesor', 14, 18);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-MX')}`, 14, 26);
    doc.line(14, 30, 196, 30);
    doc.text(`Nombre: ${nombreCompleto}`, 14, 40);
    doc.text(`Correo: ${user.correo || '—'}`, 14, 47);
    doc.text(`Proyectos registrados: ${proyectos.length}`, 14, 54);

    const rows = proyectos.map((p, i) => [i + 1, p.titulo, p.estado, formatFecha(p.fecha_registro)]);
    autoTable(doc, {
      startY: 65,
      head: [['#', 'Proyecto', 'Estado', 'Fecha']],
      body: rows,
      headStyles: { fillColor: [36, 78, 124] }
    });
    doc.save(`perfil_profesor_${user.nombre}.pdf`);
  };

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const cargarDashboard = async () => {
    try {
      setLoadingDashboard(true);
      const res = await fetch(`${API_BASE}/profesor/dashboard`, { 
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setDashboardData(data.dashboard);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingDashboard(false);
    }
  };

  const cargarProyectos = async () => {
    try {
      setLoadingProyectos(true);
      const res = await fetch(`${API_BASE}/profesor/proyectos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
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
      const res = await fetch(`${API_BASE}/profesor/evidencias`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setEvidencias(data.evidencias || []);
    } catch (error) {
      setGlobalError(error.message);
    } finally {
      setLoadingEvidencias(false);
    }
  };

  const cargarAlumnos = async () => { 
    try {
      setLoadingAlumnos(true);
      const res = await fetch(`${API_BASE}/profesor/alumnos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.ok) setAlumnos(data.alumnos);
    } catch (error) {
      console.error("Error al cargar alumnos", error);
    } finally {
      setLoadingAlumnos(false);
    }
  };

  const handleRegistrarFaceID = async () => {
    setErrorBio(''); setSuccessBio(''); setLoadingBio(true);
    try {
      const resOptions = await fetch(`${API_BASE}/auth/biometric-reg-options`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const options = await resOptions.json();
      const regResp = await startRegistration(options);
      const resVerify = await fetch(`${API_BASE}/auth/biometric-reg-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...regResp, challenge: options.challenge })
      });
      const result = await resVerify.json();
      if (result.ok) setSuccessBio('✓ Face ID activado con éxito.');
      else throw new Error(result.mensaje);
    } catch (err) {
      setErrorBio('No se pudo activar la biometría: ' + err.message);
    } finally {
      setLoadingBio(false);
    }
  };

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    cargarDashboard();
    cargarProyectos();
    cargarEvidencias();
    cargarAlumnos();
  }, []);

  const handleGuardarProyecto = async () => {
    setUploadError(''); setUploadResult('');
    if (!tituloProyecto.trim()) { setUploadError('El título es obligatorio.'); return; }
    setSavingProyecto(true);
    try {
      const formData = new FormData();
      formData.append('titulo', tituloProyecto);
      formData.append('descripcion', descProyecto);
      formData.append('estado', estadoProyecto);
      formData.append('area_trabajo', areaTrabajo);
      formData.append('ambito_desarrollo', ambitoDesarrollo);
      formData.append('es_innovacion', esInnovacion ? '1' : '0');
      formData.append('ya_trabaja', yaTrabaja ? '1' : '0');
      formData.append('competencia_impacto', competenciaImpacto);
      formData.append('objetivo', objetivo);
      formData.append('actividades', actividades);
      formData.append('tecnologias', tecnologiasSeleccionadas.join(','));
      if (imgPrincipal) formData.append('img_principal', imgPrincipal);

      const url = editingProyectoId ? `${API_BASE}/profesor/proyectos/${editingProyectoId}` : `${API_BASE}/profesor/proyectos`;
      const res = await fetch(url, {
        method: editingProyectoId ? 'PUT' : 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error('Error al guardar');
      setUploadResult('Proyecto guardado con éxito.');
      setView('proyectos');
      cargarProyectos();
    } catch (error) {
      setUploadError(error.message);
    } finally {
      setSavingProyecto(false);
    }
  };

  const handleEditarProyecto = (p) => {
    setTituloProyecto(p.titulo); setDescProyecto(p.descripcion); setEstadoProyecto(p.estado);
    setEditingProyectoId(p.id_proyecto); handleNavClick('subir');
  };

  const handleSubirEvidencia = async () => {
    setSavingProyecto(true);
    try {
      const formData = new FormData();
      formData.append('id_proyecto', proyectoSeleccionado);
      formData.append('archivo', archivoEvidencia);
      const res = await fetch(`${API_BASE}/profesor/evidencias`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) { setUploadResult('Evidencia subida.'); cargarEvidencias(); }
    } catch (err) { setUploadError(err.message); }
    finally { setSavingProyecto(false); }
  };

  return (
    <div className="app">
      {/* 🟢 OVERLAY MÓVIL */}
      {isMobileMenuOpen && (
        <div className="mobile-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      {/* 🟢 SIDEBAR (Con clase dinámica) */}
      <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="brand">Skill<span>Match</span></div>
          <div className="subtitle">Portal Profesores</div>
        </div>

        <div className="nav-wrap">
          <div className="nav-group-label">Principal</div>
          <div className={`nav-item ${view === 'dashboard' ? 'active' : ''}`} onClick={() => handleNavClick('dashboard')}>
            <span className="icon">▦</span> Dashboard
          </div>
          
          <div className={`nav-item ${view === 'alumnos' ? 'active' : ''}`} onClick={() => handleNavClick('alumnos')}>
            <span className="icon">👥</span> Ver Alumnos
          </div>

          <div className={`nav-item ${view === 'proyectos' ? 'active' : ''}`} onClick={() => handleNavClick('proyectos')}>
            <span className="icon">📁</span> Mis proyectos
          </div>
          <div className={`nav-item ${view === 'documentos' ? 'active' : ''}`} onClick={() => handleNavClick('documentos')}>
            <span className="icon">📄</span> Documentos
          </div>

          <div className="nav-group-label" style={{ marginTop: '8px' }}>Cuenta</div>
          <div className={`nav-item ${view === 'perfil' ? 'active' : ''}`} onClick={() => handleNavClick('perfil')}>
            <span className="icon">👤</span> Mi perfil
          </div>
        </div>
          
        <div className="sidebar-bottom">
          <button className="logout-btn" onClick={cerrarSesion}>← Cerrar sesión</button>
        </div>
      </aside>

      <main className="main">
        {view === 'dashboard' && (
          <>
            <div className="topbar">
              <div className="topbar-left-wrap">
                {/* 🟢 BOTÓN HAMBURGUESA 🟢 */}
                <button className="hamburger-btn" onClick={() => setIsMobileMenuOpen(true)}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                </button>
                <div className="topbar-left">
                  <div className="topbar-title">Dashboard — Profesor</div>
                  <div className="topbar-sub">Gestión académica y seguimiento de proyectos</div>
                </div>
              </div>
            </div>
            <div className="content">
                <div className="perfil-card">
                  <div className="perf-avatar">{initials(nombreCompleto)}</div>
                  <div>
                    <div className="perf-name">{nombreCompleto}</div>
                    <div className="perf-cargo">Catedrático — SkillMatch UTEQ</div>
                  </div>
                </div>
                {/* Métricas rápidas */}
                <div className="metrics-grid">
                    <div className="metric-card" style={{ '--card-accent': '#244E7C' }}>
                      <div className="metric-label">Tus Proyectos</div>
                      <div className="metric-value">{proyectos.length}</div>
                    </div>
                    <div className="metric-card" style={{ '--card-accent': '#22c55e' }}>
                      <div className="metric-label">Alumnos</div>
                      <div className="metric-value">{alumnos.length}</div>
                    </div>
                </div>
            </div>
          </>
        )}

        {view === 'alumnos' && (
          <>
            <div className="topbar">
              <div className="topbar-left-wrap">
                <button className="hamburger-btn" onClick={() => setIsMobileMenuOpen(true)}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                </button>
                <div className="topbar-left"><div className="topbar-title">Directorio de Alumnos</div></div>
              </div>
            </div>
            <div className="content">
              {loadingAlumnos ? <div className="loading-box">Cargando alumnos...</div> : (
                <div className="table-wrap">
                  <div className="table-header" style={{ gridTemplateColumns: '2fr 1fr 1fr' }}>
                    <div>Nombre</div>
                    <div>Carrera</div>
                    <div>Correo</div>
                  </div>
                  {alumnos.map(a => (
                    <div className="table-row" style={{ gridTemplateColumns: '2fr 1fr 1fr' }} key={a.id_usuario}>
                      <div className="file-name">{a.nombre} {a.apellido}</div>
                      <div style={{fontSize: '12px', color: 'var(--muted)'}}>{a.carrera}</div>
                      <div style={{fontSize: '12px', color: 'var(--muted)'}}>{a.correo}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {view === 'proyectos' && (
            <>
              <div className="topbar">
                <div className="topbar-left-wrap">
                  <button className="hamburger-btn" onClick={() => setIsMobileMenuOpen(true)}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                  </button>
                  <div className="topbar-left"><div className="topbar-title">Mis proyectos registrados</div></div>
                </div>
                <div className="topbar-actions">
                  <button className="btn btn-primary" onClick={() => handleNavClick('subir')}>+ Nuevo Proyecto</button>
                </div>
              </div>
              <div className="content">
                <div className="proyectos-grid">
                  {proyectos.map(p => (
                    <div key={p.id_proyecto} className="proyecto-card">
                        <div className="proyecto-header">
                          <div className="proyecto-titulo">{p.titulo}</div>
                          <div className="proyecto-carrera">{p.descripcion}</div>
                        </div>
                        <div className="proyecto-actions">
                          <button className="btn btn-ghost" onClick={() => handleEditarProyecto(p)}>Editar</button>
                        </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
        )}

        {view === 'subir' && (
            <>
              <div className="topbar">
                <div className="topbar-left-wrap">
                  <button className="hamburger-btn" onClick={() => setIsMobileMenuOpen(true)}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                  </button>
                  <div className="topbar-title">{editingProyectoId ? 'Editar Proyecto' : 'Nuevo Proyecto'}</div>
                </div>
              </div>
              <div className="content">
                <div className="metric-card" style={{ maxWidth: '600px' }}>
                  <div className="form-group">
                    <label className="form-label">Título</label>
                    <input className="form-input" placeholder="Título" value={tituloProyecto} onChange={e => setTituloProyecto(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Descripción</label>
                    <textarea className="form-textarea" placeholder="Descripción" value={descProyecto} onChange={e => setDescProyecto(e.target.value)} />
                  </div>
                  <div className="modal-actions">
                    <button className="btn btn-primary" onClick={handleGuardarProyecto}>Guardar</button>
                  </div>
                </div>
              </div>
            </>
        )}

        {view === 'documentos' && (
           <>
             <div className="topbar">
               <div className="topbar-left-wrap">
                 <button className="hamburger-btn" onClick={() => setIsMobileMenuOpen(true)}>
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                 </button>
                 <div className="topbar-title">Documentos Registrados</div>
               </div>
             </div>
             <div className="content">
                <div className="table-wrap">
                  <div className="table-header" style={{ gridTemplateColumns: '2fr 1fr' }}>
                    <div>Archivo</div>
                    <div>Fecha</div>
                  </div>
                  {evidencias.map(ev => (
                    <div className="table-row" style={{ gridTemplateColumns: '2fr 1fr' }} key={ev.id_evidencia}>
                      <div className="file-name">{ev.nombre_original || 'Archivo'}</div>
                      <div style={{fontSize: '12px', color: 'var(--muted)'}}>{formatFecha(ev.fecha_subida)}</div>
                    </div>
                  ))}
                </div>
             </div>
           </>
        )}

        {view === 'perfil' && (
          <>
            <div className="topbar">
              <div className="topbar-left-wrap">
                <button className="hamburger-btn" onClick={() => setIsMobileMenuOpen(true)}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                </button>
                <div className="topbar-title">Mi Perfil</div>
              </div>
              <div className="topbar-actions">
                <button className="btn btn-ghost" onClick={generarPDFPerfil}>Descargar CV PDF</button>
              </div>
            </div>
            <div className="content">
                <div className="metric-card">
                  <h3 style={{ marginBottom: '10px' }}>Seguridad Biométrica</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '20px' }}>Usa Face ID o Huella Digital para tu cuenta de profesor.</p>
                  <button className="btn btn-primary" onClick={handleRegistrarFaceID}>Activar Face ID</button>
                  {errorBio && <p className="error-msg" style={{ marginTop: '10px' }}>{errorBio}</p>}
                  {successBio && <p style={{ color: 'var(--green)', fontSize: '13px', fontWeight: 'bold', marginTop: '10px' }}>{successBio}</p>}
                </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}