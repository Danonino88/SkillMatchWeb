import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { startRegistration } from '@simplewebauthn/browser'; 
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

const getFileSource = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `https://skillmatch-backend-duiu.onrender.com/uploads/${path}`;
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

  // 🟢 ESTADO PARA EL MENÚ MÓVIL
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [loadingProyectos, setLoadingProyectos] = useState(false);
  const [loadingEvidencias, setLoadingEvidencias] = useState(false);
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
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState('');

  const evidenciaRef = useRef(null);

  const [errorBio, setErrorBio] = useState('');
  const [successBio, setSuccessBio] = useState('');
  const [loadingBio, setLoadingBio] = useState(false);
  
  // 🟢 NUEVO ESTADO: Para verificar si la biometría ya fue activada
  const [biometriaActiva, setBiometriaActiva] = useState(
    localStorage.getItem('biometriaActiva') === 'true'
  );

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
  const [perfilForm, setPerfilForm] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    matricula: '',
    carrera: '',
    semestre: ''
  });

  const [colaboradoresData, setColaboradoresData] = useState({}); 
  const [nuevoColaboradorCorreo, setNuevoColaboradorCorreo] = useState('');
  const [proyectoActivoColab, setProyectoActivoColab] = useState(null); 

  const nombreCompleto = user.nombre ? `${user.nombre} ${user.apellido}` : 'Estudiante';

  // 🟢 FUNCIÓN PARA CAMBIAR DE VISTA Y CERRAR EL MENÚ EN MÓVIL
  const handleNavClick = (vista) => {
    setView(vista);
    setIsMobileMenuOpen(false); // Cierra el menú al hacer clic
  };

  const toggleTecnologia = (tech) => {
    setTecnologiasSeleccionadas((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    );
  };

  // 🟢 FUNCIÓN DE PDF CORREGIDA Y LIMPIA 🟢
  const generarPDFPerfil = () => {
    const doc = new jsPDF();
    const est = dashboardData?.estudiante || {};
    const u = dashboardData?.usuario || {};

    const azulOscuro = [35, 46, 86];
    const azulClaro = [36, 78, 124];
    const grisTexto = [100, 116, 139];

    // BANNER SUPERIOR
    doc.setFillColor(...azulOscuro);
    doc.rect(0, 0, 210, 50, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text(nombreCompleto.toUpperCase(), 15, 20);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(`${est.carrera || 'Estudiante'} | Universidad Tecnológica de Querétaro`, 15, 28);
    
    doc.setFontSize(10);
    // Quitamos los emojis o íconos especiales que causaban los caracteres basura
    doc.text(`Correo: ${user.correo || '—'}   |   Tel: ${u.telefono || '—'}   |   Matricula: ${est.matricula || '—'}`, 15, 38);

    // SECCIÓN FORMACIÓN
    let y = 65;
    doc.setTextColor(...azulClaro);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMEN ACADEMICO', 15, y);
    
    doc.setDrawColor(...azulClaro);
    doc.setLineWidth(0.5);
    doc.line(15, y + 2, 70, y + 2);

    y += 12;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Universidad Tecnologica de Queretaro (UTEQ)', 15, y);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...grisTexto);
    doc.text(`${est.semestre ? est.semestre + ' Cuatrimestre' : '—'} en ${est.carrera || 'Carrera no especificada'}`, 15, y + 6);

    // SECCIÓN PROYECTOS (TABLA)
    y += 25;
    doc.setTextColor(...azulClaro);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('PORTAFOLIO DE PROYECTOS DESTACADOS', 15, y);
    doc.line(15, y + 2, 105, y + 2);

    if (proyectos.length === 0) {
      y += 15;
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text('El estudiante aun no cuenta con proyectos registrados en la plataforma SkillMatch.', 15, y);
    } else {
      const rows = proyectos.map((p) => [
        { 
          content: `${p.titulo}\n\nEstado: ${p.estado.toUpperCase()}`, 
          styles: { fontStyle: 'bold', textColor: azulOscuro, valign: 'middle' } 
        },
        {
          content: `${p.descripcion || 'Sin descripcion detallada.'}\n\nHERRAMIENTAS: ${p.tecnologias || 'No especificadas'}`,
          styles: { halign: 'justify' }
        },
        {
          content: formatFecha(p.fecha_registro),
          styles: { halign: 'center', valign: 'middle' }
        }
      ]);

      autoTable(doc, {
        startY: y + 8,
        head: [['Proyecto / Estado', 'Descripcion y Tecnologias Aplicadas', 'Fecha']],
        body: rows,
        theme: 'grid',
        headStyles: { fillColor: azulClaro, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 10 },
        styles: { fontSize: 9, cellPadding: 6, overflow: 'linebreak' },
        columnStyles: {
          0: { cellWidth: 45 },
          1: { cellWidth: 105 }, // Ajuste para darle más espacio a la descripción
          2: { cellWidth: 30 },  // Ajuste para evitar que la fecha se encime
        },
        margin: { left: 15, right: 15 }
      });
    }

    // PIE DE PÁGINA
    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.setDrawColor(230, 230, 230);
        doc.line(15, 280, 195, 280);
        doc.text('SkillMatch UTEQ - Documento de vinculacion profesional generado el ' + new Date().toLocaleDateString(), 15, 286);
        doc.text(`Pagina ${i} de ${pageCount}`, 185, 286, { align: 'right' });
    }

    const nombreArchivo = `CV_SkillMatch_${nombreCompleto.replace(/\s+/g, '_')}.pdf`;
    doc.save(nombreArchivo);
  };

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('biometriaActiva'); // 🟢 Limpiamos el estado biométrico al salir
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

  const cargarColaboradores = async (id_proyecto) => {
    try {
      const res = await fetch(`${API_BASE}/estudiante/proyectos/${id_proyecto}/colaboradores`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.ok) {
        setColaboradoresData(prev => ({ ...prev, [id_proyecto]: data.colaboradores }));
      }
    } catch (error) {
      console.error("Error al cargar colaboradores:", error);
    }
  };

  const handleAgregarColaborador = async (id_proyecto) => {
    if (!nuevoColaboradorCorreo.trim()) return alert("Por favor ingresa un correo.");
    
    try {
      const res = await fetch(`${API_BASE}/estudiante/proyectos/${id_proyecto}/colaboradores`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ correo_colaborador: nuevoColaboradorCorreo })
      });
      
      const data = await res.json();
      if (data.ok) {
        setNuevoColaboradorCorreo('');
        cargarColaboradores(id_proyecto); 
        alert("Colaborador agregado con éxito.");
      } else {
        alert(data.mensaje || "Error al agregar colaborador.");
      }
    } catch (error) {
      alert("Error de red al intentar agregar al colaborador.");
    }
  };

  const handleEliminarColaborador = async (id_proyecto, id_colaborador) => {
    const confirmar = window.confirm("¿Seguro que deseas eliminar a este compañero del proyecto?");
    if (!confirmar) return;

    try {
      const res = await fetch(`${API_BASE}/estudiante/proyectos/${id_proyecto}/colaboradores/${id_colaborador}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = await res.json();
      if (data.ok) {
        cargarColaboradores(id_proyecto); 
      } else {
        alert(data.mensaje || "Error al eliminar colaborador.");
      }
    } catch (error) {
      alert("Error de red al intentar eliminar.");
    }
  };

  const togglePanelColaboradores = (id_proyecto) => {
    if (proyectoActivoColab === id_proyecto) {
      setProyectoActivoColab(null); 
    } else {
      setProyectoActivoColab(id_proyecto);
      cargarColaboradores(id_proyecto); 
    }
  };

  const handleRegistrarFaceID = async () => {
    setErrorBio('');
    setSuccessBio('');
    setLoadingBio(true);
    try {
      const resOptions = await fetch(`${API_BASE}/auth/biometric-reg-options`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!resOptions.ok) {
        const errData = await resOptions.json();
        throw new Error(errData.mensaje || 'Error al conectar con el servidor');
      }

      const options = await resOptions.json();
      const regResp = await startRegistration(options);

      const resVerify = await fetch(`${API_BASE}/auth/biometric-reg-verify`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ ...regResp, challenge: options.challenge })
      });

      const result = await resVerify.json();
      if (result.ok) {
        setSuccessBio('✓ Datos biométricos activados con éxito.');
        setBiometriaActiva(true); 
        localStorage.setItem('biometriaActiva', 'true'); 
      } else {
        throw new Error(result.mensaje || 'Error en la validación');
      }
    } catch (err) {
      console.error(err);
      setErrorBio(err.message.includes('undefined') 
        ? 'Error interno del servidor (ID no encontrado). Intenta cerrar y volver a iniciar sesión.' 
        : err.message);
    } finally {
      setLoadingBio(false);
    }
  };

  const iniciarEdicionPerfil = () => {
    setPerfilForm({
      nombre: user.nombre || '',
      apellido: user.apellido || '',
      telefono: dashboardData?.usuario?.telefono || '',
      matricula: dashboardData?.estudiante?.matricula || '',
      carrera: dashboardData?.estudiante?.carrera || '',
      semestre: dashboardData?.estudiante?.semestre || ''
    });
    setIsEditingProfile(true);
    setProfileMessage({ type: '', text: '' });
  };

  const handleGuardarPerfil = async () => {
    setSavingProfile(true);
    setProfileMessage({ type: '', text: '' });
    try {
      const res = await fetch(`${API_BASE}/estudiante/perfil`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(perfilForm)
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.mensaje || 'Error al actualizar el perfil');

      setProfileMessage({ type: 'success', text: '¡Datos actualizados correctamente!' });
      setIsEditingProfile(false);
      
      const updatedUser = { ...user, nombre: perfilForm.nombre, apellido: perfilForm.apellido };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      await cargarDashboard(); 
    } catch (error) {
      setProfileMessage({ type: 'error', text: error.message });
    } finally {
      setSavingProfile(false);
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
    handleNavClick('subir');
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
      formData.append('tipo', 'archivo'); 
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
  const usuarioInfo = dashboardData?.usuario || {};

  return (
    <>
      <div className="app">
        {/* 🟢 OVERLAY MÓVIL (Oscurece el fondo al abrir el menú) */}
        {isMobileMenuOpen && (
          <div className="mobile-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>
        )}

        {/* 🟢 SIDEBAR (Ahora con clase dinámica) */}
        <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
          <div className="sidebar-logo">
            <div className="brand">Skill<span>Match</span></div>
            <div className="brand-sub">Portal Estudiante</div>
          </div>

          <div className="nav-wrap">
            <div className="nav-group-label">Principal</div>
            <div className={`nav-item ${view === 'dashboard' ? 'active' : ''}`} onClick={() => handleNavClick('dashboard')}>
              <span className="nav-icon">▦</span> Dashboard
            </div>
            
            <div className={`nav-item ${view === 'vacantes' ? 'active' : ''}`} onClick={() => handleNavClick('vacantes')}>
              <span className="nav-icon">💼</span> Bolsa de Trabajo
            </div>

            <div className={`nav-item ${view === 'proyectos' ? 'active' : ''}`} onClick={() => handleNavClick('proyectos')}>
              <span className="nav-icon">📁</span> Mis proyectos
            </div>
            <div className={`nav-item ${view === 'documentos' ? 'active' : ''}`} onClick={() => handleNavClick('documentos')}>
              <span className="nav-icon">📄</span> Documentos
            </div>

            <div className="nav-group-label" style={{ marginTop: '8px' }}>Cuenta</div>
            <div className={`nav-item ${view === 'perfil' ? 'active' : ''}`} onClick={() => { setIsEditingProfile(false); handleNavClick('perfil'); }}>
              <span className="nav-icon">👤</span> Mi perfil
            </div>
            
            <button className="sidebar-logout-btn" onClick={cerrarSesion}>
              ← Cerrar sesión
            </button>
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
                <div className="topbar-left-wrap">
                  {/* 🟢 BOTÓN HAMBURGUESA 🟢 */}
                  <button className="hamburger-btn" onClick={() => setIsMobileMenuOpen(true)}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                  </button>
                  <div className="topbar-left">
                    <div className="topbar-title">Dashboard — Estudiante</div>
                    <div className="topbar-sub">Bienvenido, {user.nombre || 'Estudiante'} · {user.correo}</div>
                  </div>
                </div>
                <button className="btn btn-primary" onClick={() => { limpiarFormularioProyecto(); handleNavClick('subir'); }}>
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

                    <div className="quick-access-grid">
                      {[
                        { icon: '💼', title: 'Vacantes', sub: 'Encuentra ofertas y estadías', action: () => handleNavClick('vacantes') },
                        { icon: '📁', title: 'Mis proyectos', sub: 'Gestiona tus proyectos', action: () => handleNavClick('proyectos') },
                        { icon: '👤', title: 'Mi perfil', sub: 'Datos y CV', action: () => { setIsEditingProfile(false); handleNavClick('perfil') } },
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
                          <button className="btn btn-ghost" style={{ fontSize: '12px', padding: '7px 14px' }} onClick={() => handleNavClick('proyectos')}>
                            Ver todos →
                          </button>
                        </div>
                        <div>
                          {proyectos.slice(0, 3).map((p) => (
                            <div key={p.id_proyecto} className="proyecto-card">
                              <div className="proyecto-icon">📁</div>
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
                <div className="topbar-left-wrap">
                  <button className="hamburger-btn" onClick={() => setIsMobileMenuOpen(true)}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                  </button>
                  <div className="topbar-left">
                    <div className="topbar-title">Bolsa de Trabajo</div>
                    <div className="topbar-sub">Oportunidades laborales y estadías de empresas vinculadas</div>
                  </div>
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
                <div className="topbar-left-wrap">
                  <button className="hamburger-btn" onClick={() => setIsMobileMenuOpen(true)}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                  </button>
                  <div className="topbar-left">
                    <div className="topbar-title">
                      {editingProyectoId ? 'Editar proyecto' : 'Subir proyecto'}
                    </div>
                    <div className="topbar-sub">Registra tu proyecto académico en la plataforma</div>
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

                    <div className="form-row" style={{ display: 'flex', gap: '20px', margin: '15px 0', flexWrap: 'wrap' }}>
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

                    <div style={{ display: 'flex', gap: '10px', marginTop: '24px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
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
                <div className="topbar-left-wrap">
                  <button className="hamburger-btn" onClick={() => setIsMobileMenuOpen(true)}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                  </button>
                  <div className="topbar-left">
                    <div className="topbar-title">Documentos / Evidencias</div>
                    <div className="topbar-sub">{evidencias.length} archivos asociados a tus proyectos</div>
                  </div>
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
                    <div className="form-field" style={{ gridColumn: '1 / -1' }}>
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
                <div className="topbar-left-wrap">
                  <button className="hamburger-btn" onClick={() => setIsMobileMenuOpen(true)}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                  </button>
                  <div className="topbar-left">
                    <div className="topbar-title">Mis proyectos</div>
                    <div className="topbar-sub">{proyectos.length} proyectos en tu cartera académica</div>
                  </div>
                </div>
                <button className="btn btn-primary" onClick={() => { limpiarFormularioProyecto(); handleNavClick('subir'); }}>
                  + Agregar proyecto
                </button>
              </div>

              <div className="content">
                {loadingProyectos ? (
                  <div className="loading-box">Cargando proyectos...</div>
                ) : proyectos.length === 0 ? (
                  <div className="docs-table-wrap">
                    <div className="empty-state">
                      <div className="empty-icon">📁</div>
                      <div className="empty-title">No tienes proyectos aún</div>
                      <div className="empty-sub">Comienza registrando tu primer proyecto</div>
                      <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => { limpiarFormularioProyecto(); handleNavClick('subir'); }}>
                        + Agregar primer proyecto
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {proyectos.map((p) => {
                      const isCreador = p.id_estudiante === dashboardData?.estudiante?.id_estudiante;

                      return (
                      <div key={p.id_proyecto} className="proyecto-card" style={{ display: 'block' }}>
                        <div className="proyecto-card-inner">
                          <div className="proyecto-icon">📁</div>

                          <div className="proyecto-info" style={{ flex: 1 }}>
                            <div className="proyecto-name">
                              {p.titulo} 
                              {!isCreador && <span style={{ marginLeft: '10px', fontSize: '11px', background: '#e0e7ff', color: '#4338ca', padding: '2px 8px', borderRadius: '12px' }}>Colaborador</span>}
                            </div>
                            <div className="proyecto-meta">Actualizado: {formatFecha(p.fecha_registro)}</div>
                            <div className="proyecto-desc">{p.descripcion || 'Sin descripción'}</div>

                            {p.img_principal && (
                              <div style={{ marginBottom: '10px' }}>
                                <img
                                  src={getFileSource(p.img_principal)}
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

                          <div className="proyecto-acciones">
                            <span className={badgeClassByEstado(p.estado)}>
                              {p.estado}
                            </span>
                            
                            {isCreador && (
                              <div style={{display: 'flex', flexDirection: 'column', gap: '8px', width: '100%'}}>
                                <button className="btn btn-ghost" style={{ fontSize: '12px', padding: '7px 14px', width: '100%' }} onClick={() => handleEditarProyecto(p)}>
                                  Editar
                                </button>
                                <button className="btn btn-ghost" style={{ fontSize: '12px', padding: '7px 14px', width: '100%', background: '#f0f9ff', color: '#4f46e5', borderColor: '#c7d2fe' }} onClick={() => togglePanelColaboradores(p.id_proyecto)}>
                                  👥 Equipo
                                </button>
                                <button className="btn btn-danger" style={{ fontSize: '12px', padding: '7px 14px', width: '100%' }} onClick={() => handleEliminarProyecto(p.id_proyecto)}>
                                  Eliminar
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {proyectoActivoColab === p.id_proyecto && isCreador && (
                          <div style={{ marginTop: '20px', padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                            <h4 style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#1e293b' }}>Gestionar Equipo de Proyecto</h4>
                            
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                              <input 
                                type="email" 
                                placeholder="Correo institucional del compañero" 
                                className="form-input" 
                                value={nuevoColaboradorCorreo}
                                onChange={(e) => setNuevoColaboradorCorreo(e.target.value)}
                                style={{ flex: 1, minWidth: '200px' }}
                              />
                              <button className="btn btn-primary" onClick={() => handleAgregarColaborador(p.id_proyecto)}>
                                Agregar
                              </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                              {colaboradoresData[p.id_proyecto]?.length > 0 ? (
                                colaboradoresData[p.id_proyecto].map(colab => (
                                  <div key={colab.matricula} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '10px 15px', borderRadius: '8px', border: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '10px' }}>
                                    <div>
                                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#334155' }}>{colab.nombre} {colab.apellido}</div>
                                      <div style={{ fontSize: '11px', color: '#64748b' }}>{colab.correo} • {colab.matricula}</div>
                                    </div>
                                    <button 
                                      onClick={() => handleEliminarColaborador(p.id_proyecto, colab.matricula)} 
                                      style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}
                                    >
                                      ✕ Quitar
                                    </button>
                                  </div>
                                ))
                              ) : (
                                <div style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic' }}>No hay compañeros agregados a este proyecto.</div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )})}
                  </div>
                )}
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
                  <div className="topbar-left">
                    <div className="topbar-title">Mi perfil</div>
                    <div className="topbar-sub">Información personal y académica</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {!isEditingProfile && (
                    <button className="btn btn-ghost" onClick={iniciarEdicionPerfil}>
                      ✎ Editar
                    </button>
                  )}
                  <button className="btn btn-primary" onClick={generarPDFPerfil}>
                    Descargar CV
                  </button>
                </div>
              </div>

              <div className="content">
                {profileMessage.text && (
                  <div className={`alert alert-${profileMessage.type}`} style={{ marginBottom: '20px' }}>
                    {profileMessage.type === 'success' ? '✓' : '✕'} {profileMessage.text}
                  </div>
                )}

                <div className="perfil-view">
                  <div className="perfil-head">
                    <div className="perfil-avatar-large">{initials(nombreCompleto)}</div>
                    <div className="perfil-header-info">
                      <div className="perfil-full-name">{nombreCompleto}</div>
                      <div className="perfil-email">{user.correo}</div>
                      <div className="perfil-role">Estudiante activo</div>
                    </div>
                  </div>

                  {!isEditingProfile && (
                    <div style={{ 
                      marginBottom: '32px', 
                      padding: '24px', 
                      background: '#f8fafc', 
                      borderRadius: '16px', 
                      border: '1px solid #cbd5e1',
                      boxShadow: '0 4px 12px rgba(36, 78, 124, 0.03)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <div style={{ fontSize: '24px' }}>🛡️</div>
                        <div>
                          <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#232E56', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Doble Seguridad Biométrica
                          </h3>
                          <p style={{ fontSize: '13px', color: '#64748b' }}>
                            Protege tu cuenta activando el inicio de sesión con el sensor de tu dispositivo (Face ID o Huella).
                          </p>
                        </div>
                      </div>

                      {errorBio && <div className="alert alert-error" style={{ fontSize: '12px', padding: '10px' }}>{errorBio}</div>}
                      {successBio && <div className="alert alert-success" style={{ fontSize: '12px', padding: '10px' }}>{successBio}</div>}

                      {/* 🟢 NUEVA LÓGICA: Si ya tiene la biometría, muestra un mensaje. Si no, muestra el botón. */}
                      {biometriaActiva ? (
                        <div style={{ 
                          marginTop: '15px', 
                          padding: '12px 16px', 
                          background: '#dcfce7', 
                          color: '#166534', 
                          borderRadius: '8px', 
                          border: '1px solid #86efac', 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '8px', 
                          fontSize: '13px', 
                          fontWeight: 'bold' 
                        }}>
                          <span>✅</span> Datos biométricos ya registrados y listos para usar
                        </div>
                      ) : (
                        <button 
                          className="btn btn-primary" 
                          onClick={handleRegistrarFaceID}
                          disabled={loadingBio}
                          style={{ 
                            marginTop: '10px',
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '10px',
                            padding: '12px 24px',
                            flexWrap: 'wrap'
                          }}
                        >
                          {loadingBio ? 'Activando sensor...' : (
                            <>
                              {/* 🟢 ICONO FACE ID */}
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M8 3H5a2 2 0 0 0-2 2v3" />
                                <path d="M16 3h3a2 2 0 0 1 2 2v3" />
                                <path d="M3 16v3a2 2 0 0 0 2 2h3" />
                                <path d="M21 16v3a2 2 0 0 1-2 2h-3" />
                                <path d="M8 8h.01" />
                                <path d="M16 8h.01" />
                                <path d="M12 12v3" />
                                <path d="M8 16a4 4 0 0 0 8 0" />
                              </svg>
                              {/* 🟢 ICONO HUELLA DACTILAR */}
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 0 1 8 4" />
                                <path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" />
                                <path d="M8.5 22c-.3-1.5-.5-3-.5-5v-5a4 4 0 0 1 8 0v1.5" />
                                <path d="M16 22v-1.5a6 6 0 0 0-2.1-4.9" />
                                <path d="M12 22v-3" />
                              </svg>
                              Activar datos biométricos
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  )}

                  {isEditingProfile ? (
                    <div style={{ marginBottom: '24px', background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Editar mis datos
                      </div>
                      
                      <div className="form-row">
                        <div className="form-field">
                          <label className="form-label">Nombre</label>
                          <input className="form-input" type="text" value={perfilForm.nombre} onChange={(e) => setPerfilForm({...perfilForm, nombre: e.target.value})} />
                        </div>
                        <div className="form-field">
                          <label className="form-label">Apellidos</label>
                          <input className="form-input" type="text" value={perfilForm.apellido} onChange={(e) => setPerfilForm({...perfilForm, apellido: e.target.value})} />
                        </div>
                      </div>

                      <div className="form-row" style={{ marginTop: '16px' }}>
                        <div className="form-field">
                          <label className="form-label">Número de Teléfono</label>
                          <input className="form-input" type="tel" value={perfilForm.telefono} onChange={(e) => setPerfilForm({...perfilForm, telefono: e.target.value})} />
                        </div>
                        <div className="form-field">
                          <label className="form-label">Matrícula</label>
                          <input className="form-input" type="text" value={perfilForm.matricula} onChange={(e) => setPerfilForm({...perfilForm, matricula: e.target.value})} />
                        </div>
                      </div>

                      <div className="form-row" style={{ marginTop: '16px' }}>
                        <div className="form-field">
                          <label className="form-label">Carrera</label>
                          <input className="form-input" type="text" value={perfilForm.carrera} onChange={(e) => setPerfilForm({...perfilForm, carrera: e.target.value})} />
                        </div>
                        <div className="form-field">
                          <label className="form-label">Semestre</label>
                          <input className="form-input" type="number" value={perfilForm.semestre} onChange={(e) => setPerfilForm({...perfilForm, semestre: e.target.value})} />
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '10px', marginTop: '24px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        <button className="btn btn-ghost" onClick={() => setIsEditingProfile(false)} disabled={savingProfile}>
                          Cancelar
                        </button>
                        <button className="btn btn-primary" onClick={handleGuardarPerfil} disabled={savingProfile}>
                          {savingProfile ? 'Guardando...' : 'Guardar Cambios ✓'}
                        </button>
                      </div>
                    </div>
                  ) : (
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
                          <div className="perfil-field-label">Número de Teléfono</div>
                          <div className="perfil-field-value">{usuarioInfo.telefono || '—'}</div>
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
                          <div className="perfil-field-value">{estudianteInfo.semestre ? `${estudianteInfo.semestre}°` : '—'}</div>
                        </div>
                      </div>
                    </div>
                  )}
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
      <div className="docs-table-hdr" style={{ gridTemplateColumns: '1.5fr 1fr 1fr 100px' }}>
        <div>Archivo</div>
        <div>Proyecto</div>
        <div>Fecha</div>
        <div>Acciones</div>
      </div>

      {evidencias.map((ev) => (
        <div className="docs-table-row" key={ev.id_evidencia} style={{ gridTemplateColumns: '1.5fr 1fr 1fr 100px' }}>
          <div>
            <div className="doc-nombre">
              {ev.nombre_original || ev.ruta_archivo?.split('/').pop()}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
              <a
                href={getFileSource(ev.ruta_archivo)}
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