import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { startRegistration } from '@simplewebauthn/browser';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import '../CSS/DashboardEstudiantes.css'; // Usamos el mismo CSS para mantener consistencia

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
  const [dashboardData, setDashboardData] = useState(null);
  const [proyectos, setProyectos] = useState([]);
  const [evidencias, setEvidencias] = useState([]);
  const [alumnos, setAlumnos] = useState([]); // 👥 Nueva lista de alumnos

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
      const res = await fetch(`${API_BASE}/profesor/dashboard`, { // Nota: ajusta endpoint si es necesario
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

  const cargarAlumnos = async () => { // 👥 Cargar lista de alumnos
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
    setEditingProyectoId(p.id_proyecto); setView('subir');
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
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="brand">Skill<span>Match</span></div>
          <div className="brand-sub">Portal Profesores</div>
        </div>

        <div className="nav-wrap">
          <div className="nav-group-label">Principal</div>
          <div className={`nav-item ${view === 'dashboard' ? 'active' : ''}`} onClick={() => setView('dashboard')}>
            <span className="nav-icon">▦</span> Dashboard
          </div>
          
          <div className={`nav-item ${view === 'alumnos' ? 'active' : ''}`} onClick={() => setView('alumnos')}>
            <span className="nav-icon">👥</span> Ver Alumnos
          </div>

          <div className={`nav-item ${view === 'proyectos' ? 'active' : ''}`} onClick={() => setView('proyectos')}>
            <span className="nav-icon">📁</span> Mis proyectos
          </div>
          <div className={`nav-item ${view === 'documentos' ? 'active' : ''}`} onClick={() => setView('documentos')}>
            <span className="nav-icon">📄</span> Documentos
          </div>

          <div className="nav-group-label" style={{ marginTop: '8px' }}>Cuenta</div>
          <div className={`nav-item ${view === 'perfil' ? 'active' : ''}`} onClick={() => setView('perfil')}>
            <span className="nav-icon">👤</span> Mi perfil
          </div>
          
          <button className="sidebar-logout-btn" onClick={cerrarSesion}>← Cerrar sesión</button>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar">{initials(nombreCompleto)}</div>
          <div>
            <div className="user-name">{nombreCompleto}</div>
            <div className="user-role">Profesor</div>
          </div>
        </div>
      </aside>

      <main className="main">
        {view === 'dashboard' && (
          <>
            <div className="topbar">
              <div className="topbar-left">
                <div className="topbar-title">Dashboard — Profesor</div>
                <div className="topbar-sub">Gestión académica y seguimiento de proyectos</div>
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
                <div className="metrics">
                    <div className="metric-card" style={{ '--mc': '#244E7C' }}>
                      <div className="mc-label">Tus Proyectos</div>
                      <div className="mc-val">{proyectos.length}</div>
                    </div>
                    <div className="metric-card" style={{ '--mc': '#22c55e' }}>
                      <div className="mc-label">Alumnos</div>
                      <div className="mc-val">{alumnos.length}</div>
                    </div>
                </div>
            </div>
          </>
        )}

        {view === 'alumnos' && (
          <>
            <div className="topbar">
               <div className="topbar-left"><div className="topbar-title">Directorio de Alumnos</div></div>
            </div>
            <div className="content">
              {loadingAlumnos ? <p>Cargando alumnos...</p> : (
                <div className="docs-table-wrap">
                  <div className="docs-table-hdr">
                    <div>Nombre</div>
                    <div>Carrera</div>
                    <div>Correo</div>
                  </div>
                  {alumnos.map(a => (
                    <div className="docs-table-row" key={a.id_usuario}>
                      <div className="doc-nombre">{a.nombre} {a.apellido}</div>
                      <div style={{fontSize: '12px'}}>{a.carrera}</div>
                      <div style={{fontSize: '12px'}}>{a.correo}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* VISTAS DE PROYECTOS Y DOCUMENTOS (IGUAL QUE ESTUDIANTE) */}
        {view === 'proyectos' && (
            <div className="content">
               <div className="section-hdr">
                 <div className="section-title">Mis proyectos registrados</div>
                 <button className="btn btn-primary" onClick={() => setView('subir')}>+ Nuevo Proyecto</button>
               </div>
               {proyectos.map(p => (
                 <div key={p.id_proyecto} className="proyecto-card">
                    <div className="proyecto-info">
                        <div className="proyecto-name">{p.titulo}</div>
                        <div className="proyecto-desc">{p.descripcion}</div>
                    </div>
                    <button className="btn btn-ghost" onClick={() => handleEditarProyecto(p)}>Editar</button>
                 </div>
               ))}
            </div>
        )}

        {view === 'subir' && (
            <div className="content">
                <h3>{editingProyectoId ? 'Editar Proyecto' : 'Nuevo Proyecto'}</h3>
                <input className="form-input" placeholder="Título" value={tituloProyecto} onChange={e => setTituloProyecto(e.target.value)} />
                <textarea className="form-textarea" placeholder="Descripción" value={descProyecto} onChange={e => setDescProyecto(e.target.value)} />
                <button className="btn btn-primary" onClick={handleGuardarProyecto}>Guardar</button>
            </div>
        )}

        {view === 'perfil' && (
          <div className="content">
             <div className="perfil-card">
                <h3>Seguridad Biométrica</h3>
                <p>Usa Face ID para tu cuenta de profesor.</p>
                <button className="btn btn-primary" onClick={handleRegistrarFaceID}>Activar Face ID</button>
                {successBio && <p className="alert alert-success">{successBio}</p>}
             </div>
          </div>
        )}
      </main>
    </div>
  );
}