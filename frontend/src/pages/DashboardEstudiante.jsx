import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import '../CSS/DashboardEstudiantes.css'; 

const API_BASE = 'https://skillmatch-backend-duiu.onrender.com/api';

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
  'React', 'Node.js', 'Express', 'MySQL', 'PostgreSQL', 'MongoDB',
  'JavaScript', 'TypeScript', 'PHP', 'Laravel', 'Python', 'Django',
  'Java', 'Spring Boot', 'Flutter', 'Firebase', 'HTML', 'CSS',
  'Tailwind', 'Bootstrap', 'Git', 'GitHub', 'Docker', 'API REST'
];

export default function DashboardEstudiante() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [view, setView] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [proyectos, setProyectos] = useState([]);
  const [evidencias, setEvidencias] = useState([]);
  const [vacantes, setVacantes] = useState([]); 

  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [loadingProyectos, setLoadingProyectos] = useState(false);
  const [loadingEvidencias, setLoadingEvidencias] = useState(false);
  const [globalError, setGlobalError] = useState('');

  const [tecnologiasSeleccionadas, setTecnologiasSeleccionadas] = useState([]);
  const [imgPrincipal, setImgPrincipal] = useState(null);
  const imgProyectoRef = useRef(null);

  // --- NUEVOS CAMPOS ---
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

  const nombreCompleto = user.nombre ? `${user.nombre} ${user.apellido}` : 'Estudiante';

  const toggleTecnologia = (tech) => {
    setTecnologiasSeleccionadas((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    );
  };

  const generarPDFPerfil = () => {
    const doc = new jsPDF();
    const estudianteInfo = dashboardData?.estudiante || {};
    const resumen = dashboardData?.resumen || {};

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

    const rows = proyectos.length > 0
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
      styles: { fontSize: 10, cellPadding: 3, overflow: 'linebreak', valign: 'middle' },
      headStyles: { fillColor: [36, 78, 124], textColor: [255, 255, 255], fontStyle: 'bold' },
      columnStyles: { 0: { cellWidth: 10 }, 1: { cellWidth: 42 }, 2: { cellWidth: 78 }, 3: { cellWidth: 24 }, 4: { cellWidth: 26 } },
    });

    const nombreArchivo = `perfil_${nombreCompleto.replace(/\s+/g, '_')}.pdf`;
    doc.save(nombreArchivo);
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
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.mensaje || 'No se pudo cargar el dashboard');
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
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.mensaje || 'No se pudieron cargar los proyectos');
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
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.mensaje || 'No se pudieron cargar las evidencias');
      setEvidencias(data.evidencias || []);
    } catch (error) {
      setGlobalError(error.message);
    } finally {
      setLoadingEvidencias(false);
    }
  };

  const cargarVacantes = async () => {
    try {
      const res = await fetch(`${API_BASE}/estudiante/vacantes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.ok) {
        setVacantes(data.vacantes);
      }
    } catch (error) {
      console.error("Error al cargar vacantes", error);
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
    cargarVacantes(); 
  }, []);

  const limpiarFormularioProyecto = () => {
    setTituloProyecto('');
    setDescProyecto('');
    setEstadoProyecto('en progreso');
    setAreaTrabajo('');
    setAmbitoDesarrollo('');
    setEsInnovacion(false);
    setYaTrabaja(false);
    setCompetenciaImpacto('');
    setObjetivo('');
    setActividades('');
    setTecnologiasSeleccionadas([]);
    setImgPrincipal(null);
    setEditingProyectoId(null);
    setUploadError('');
    setUploadResult('');
    if (imgProyectoRef.current) imgProyectoRef.current.value = '';
  };

  const limpiarFormularioEvidencia = () => {
    setArchivoEvidencia(null);
    setTipoEvidencia('');
    setProyectoSeleccionado('');
    setUploadError('');
    setUploadResult('');
    if (evidenciaRef.current) evidenciaRef.current.value = '';
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
      formData.append('area_trabajo', areaTrabajo);
      formData.append('ambito_desarrollo', ambitoDesarrollo);
      formData.append('es_innovacion', esInnovacion ? '1' : '0');
      formData.append('ya_trabaja', yaTrabaja ? '1' : '0');
      formData.append('competencia_impacto', competenciaImpacto);
      formData.append('objetivo', objetivo);
      formData.append('actividades', actividades);
      formData.append('tecnologias', tecnologiasSeleccionadas.join(','));
      if (imgPrincipal) formData.append('img_principal', imgPrincipal);

      let res;
      if (editingProyectoId) {
        res = await fetch(`${API_BASE}/estudiante/proyectos/${editingProyectoId}`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
      } else {
        res = await fetch(`${API_BASE}/estudiante/proyectos`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.mensaje || 'No se pudo guardar el proyecto');

      setUploadResult(editingProyectoId ? 'Proyecto actualizado correctamente.' : 'Proyecto registrado correctamente.');
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
    setAreaTrabajo(proyecto.area_trabajo || '');
    setAmbitoDesarrollo(proyecto.ambito_desarrollo || '');
    setEsInnovacion(proyecto.es_innovacion === 1);
    setYaTrabaja(proyecto.ya_trabaja === 1);
    setCompetenciaImpacto(proyecto.competencia_impacto || '');
    setObjetivo(proyecto.objetivo || '');
    setActividades(proyecto.actividades || '');
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
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.mensaje || 'No se pudo eliminar el proyecto');

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
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.mensaje || 'No se pudo subir la evidencia');

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
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.mensaje || 'No se pudo eliminar la evidencia');

      await cargarEvidencias();
      await cargarDashboard();
    } catch (error) {
      setGlobalError(error.message);
    }
  };

  const handlePostular = async (id_vacante) => {
    try {
      const res = await fetch(`${API_BASE}/estudiante/postulaciones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id_vacante })
      });
      
      const data = await res.json();
      
      if (data.ok) {
        setVacantes(vacantes.map(v => 
          v.id_vacante === id_vacante ? { ...v, estado_postulacion: 'pendiente' } : v
        ));
        alert("¡Te has postulado correctamente a esta vacante! La empresa revisará tu perfil.");
      } else {
        alert(data.mensaje || "Error al postularse");
      }
    } catch (error) {
      console.error("Error al postular:", error);
      alert("Ocurrió un error al enviar tu postulación.");
    }
  };

  const estudianteInfo = dashboardData?.estudiante || {};
  const resumen = dashboardData?.resumen || {};

  return (
    <>
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
            
            <div className={`nav-item ${view === 'vacantes' ? 'active' : ''}`} onClick={() => setView('vacantes')}>
              <span className="nav-icon">💼</span> Bolsa de Trabajo
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
                        { icon: '💼', title: 'Vacantes', sub: 'Encuentra ofertas y estadías', action: () => setView('vacantes') },
                        { icon: '□', title: 'Mis proyectos', sub: 'Gestiona tus proyectos', action: () => setView('proyectos') },
                        { icon: '●', title: 'Mi perfil', sub: 'Datos y CV', action: () => setView('perfil') },
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
                                <div className="proyecto-meta">Fecha: {formatFecha(p.fecha_registro)}</div>
                                <div className="proyecto-desc">{p.descripcion || 'Sin descripción'}</div>
                              </div>
                              <div>
                                <span className={badgeClassByEstado(p.estado)}>{p.estado}</span>
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

          {view === 'vacantes' && (
            <>
              <div className="topbar">
                <div className="topbar-left">
                  <div className="topbar-title">Bolsa de Trabajo</div>
                  <div className="topbar-sub">Oportunidades laborales y estadías de empresas vinculadas</div>
                </div>
              </div>

              <div className="content">
                <div className="section-hdr">
                  <div className="section-title">Vacantes disponibles <span className="section-count">{vacantes.length} opciones</span></div>
                </div>

                {vacantes.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)', background: 'white', borderRadius: '12px', border: '1px dashed var(--border)' }}>
                    Aún no hay vacantes disponibles o cargando datos...
                  </div>
                ) : (
                  <div className="vacantes-grid">
                    {vacantes.map((v) => (
                      <div className="vacante-card" key={v.id_vacante}>
                        <div className="vacante-header">
                          <div className="vacante-empresa">{v.empresa || 'Empresa Confidencial'}</div>
                          <div className="vacante-title">{v.titulo}</div>
                        </div>
                        
                        <div className="vacante-tags">
                          <span className="vacante-tag">🏷️ {v.categoria}</span>
                          <span className="vacante-tag">⭐ Nivel: {v.nivel}</span>
                          <span className="vacante-tag">📅 {formatFecha(v.fecha_registro)}</span>
                        </div>

                        <div className="vacante-desc">
                          {v.descripcion}
                        </div>

                        <div className="vacante-footer">
                          {v.estado_postulacion ? (
                            <div style={{ width: "100%", textAlign: "center", padding: "10px", background: "var(--amber-bg)", color: "var(--amber)", border: "1px solid var(--amber-border)", borderRadius: "8px", fontSize: "13px", fontWeight: "700" }}>
                              ⏳ {v.estado_postulacion === 'pendiente' ? 'Postulación enviada' : 'Postulación en proceso'}
                            </div>
                          ) : (
                            <button 
                              className="btn btn-primary" 
                              style={{ width: "100%" }}
                              onClick={() => handlePostular(v.id_vacante)}
                            >
                              Enviar mi perfil →
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
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
                  <div className="topbar-sub">Registra tu proyecto académico en la plataforma</div>
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

                    {/* --- NUEVOS CAMPOS AGREGADOS --- */}
                    <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="form-field">
                        <label className="form-label">Área de trabajo</label>
                        <input
                          className="form-input"
                          type="text"
                          placeholder="Ej: Backend, Diseño"
                          value={areaTrabajo}
                          onChange={(e) => setAreaTrabajo(e.target.value)}
                        />
                      </div>
                      <div className="form-field">
                        <label className="form-label">Ámbito de desarrollo</label>
                        <select className="form-select" value={ambitoDesarrollo} onChange={(e) => setAmbitoDesarrollo(e.target.value)}>
                          <option value="">Selecciona un ámbito</option>
                          <option value="Web">Web</option>
                          <option value="Móvil">Móvil</option>
                          <option value="Escritorio">Escritorio</option>
                          <option value="IoT">IoT</option>
                          <option value="Otro">Otro</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row" style={{ display: 'flex', gap: '20px', margin: '15px 0' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                        <input type="checkbox" checked={esInnovacion} onChange={(e) => setEsInnovacion(e.target.checked)} />
                        ¿Es un proyecto de innovación?
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                        <input type="checkbox" checked={yaTrabaja} onChange={(e) => setYaTrabaja(e.target.checked)} />
                        ¿Ya se está trabajando actualmente?
                      </label>
                    </div>

                    <div className="form-row">
                      <div className="form-field">
                        <label className="form-label">Competencia / Impacto</label>
                        <select className="form-select" value={competenciaImpacto} onChange={(e) => setCompetenciaImpacto(e.target.value)}>
                          <option value="">Selecciona impacto</option>
                          <option value="L">Local</option>
                          <option value="R">Regional</option>
                          <option value="N">Nacional</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-field" style={{ gridColumn: '1 / -1' }}>
                        <label className="form-label">Objetivo del proyecto</label>
                        <textarea
                          className="form-textarea"
                          style={{ height: '80px' }}
                          placeholder="¿Qué se busca lograr con este proyecto?"
                          value={objetivo}
                          onChange={(e) => setObjetivo(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-field" style={{ gridColumn: '1 / -1' }}>
                        <label className="form-label">Actividades realizadas</label>
                        <textarea
                          className="form-textarea"
                          style={{ height: '80px' }}
                          placeholder="Menciona las principales actividades que realizaste"
                          value={actividades}
                          onChange={(e) => setActividades(e.target.value)}
                        />
                      </div>
                    </div>
                    {/* --- FIN NUEVOS CAMPOS --- */}

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
                        {savingProyecto ? 'Guardando...' : editingProyectoId ? 'Guardar cambios' : '+ Registrar proyecto'}
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
                          <div className="proyecto-meta">Actualizado: {formatFecha(p.fecha_registro)}</div>
                          <div className="proyecto-desc">{p.descripcion || 'Sin descripción'}</div>

                          {p.img_principal && (
                            <div style={{ marginBottom: '10px' }}>
                              <img
                                src={`https://skillmatch-backend-duiu.onrender.com/uploads/${p.img_principal}`}
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
                          <button className="btn btn-ghost" style={{ fontSize: '12px', padding: '7px 14px' }} onClick={() => handleEditarProyecto(p)}>
                            Editar
                          </button>
                          <button className="btn btn-danger" style={{ fontSize: '12px', padding: '7px 14px' }} onClick={() => handleEliminarProyecto(p.id_proyecto)}>
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
                  Descargar mi portafolio de proyectos
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
                href={`https://skillmatch-backend-duiu.onrender.com/uploads/${ev.ruta_archivo}`}
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