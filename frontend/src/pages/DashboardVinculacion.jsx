import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../CSS/DashboardVinculacion.css'; 

const API_BASE = 'https://skillmatch-backend-duiu.onrender.com/api';

// ─── HELPERS ────────────────────────────────────────────────────────────────
const initials = (name) => name ? name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "AD";

const formatFecha = (fecha) => {
  if (!fecha) return '—';
  const d = new Date(fecha);
  return d.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
};

export default function DashboardVinculacion() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // ESTADOS PRINCIPALES
  const [view, setView] = useState("dashboard");
  const [stats, setStats] = useState({ totalEmpresas: 0, totalEstudiantes: 0, totalProyectos: 0, vacantesActivas: 0 });
  const [empresas, setEmpresas] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [vacantes, setVacantes] = useState([]);
  const [loading, setLoading] = useState(true);

  // ESTADOS PARA EL MODAL DE REGISTRO DE EMPRESA
  const [showModal, setShowModal] = useState(false);
  const [formEmpresa, setFormEmpresa] = useState({
    nombre: '', 
    apellido: 'Empresa', // Default para tabla usuarios
    correo: '', 
    password: '', 
    id_rol: 3, 
    razon_social: '', 
    giro: '', 
    contacto: ''
  });

  // CARGAR DATOS INICIALES
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    cargarDatosAdmin();
  }, [token]);

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

  // FUNCION PARA HABILITAR / DESHABILITAR EMPRESA
  const handleToggleStatus = async (id, estadoActual) => {
    const nuevoEstado = estadoActual === 'habilitada' ? 'deshabilitada' : 'habilitada';
    try {
      const res = await fetch(`${API_BASE}/admin/empresas/status/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ nuevoEstado })
      });
      const data = await res.json();
      if (data.ok) {
        cargarDatosAdmin(); // Refrescar lista
      }
    } catch (error) {
      console.error("Error al cambiar estado:", error);
    }
  };

  // FUNCION PARA REGISTRAR EMPRESA (CRUD)
  const handleCrearEmpresa = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/admin/empresas`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formEmpresa,
          nombre: formEmpresa.razon_social, // Mapeamos razon_social al nombre de usuario
        })
      });
      const data = await res.json();
      if (data.ok) {
        alert("Empresa registrada exitosamente");
        setShowModal(false);
        cargarDatosAdmin();
        setFormEmpresa({ nombre: '', apellido: 'Empresa', correo: '', password: '', id_rol: 3, razon_social: '', giro: '', contacto: '' });
      } else {
        alert(data.mensaje);
      }
    } catch (error) {
      console.error("Error al crear empresa:", error);
    }
  };

  if (loading) return <div className="loading-screen">Cargando datos del sistema...</div>;

  return (
    <div className="app">

      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="brand">Skill<span>Match</span></div>
          <div className="brand-sub">Panel de Administración</div>
        </div>

        <div className="nav-wrap">
          <div className="nav-group-label">General</div>
          <div className={`nav-item ${view === "dashboard" ? "active" : ""}`} onClick={() => setView("dashboard")}>
            <span className="nav-icon">▦</span> Dashboard
          </div>

          <div className="nav-group-label" style={{ marginTop: "12px" }}>Usuarios</div>
          <div className={`nav-item ${view === "empresas" ? "active" : ""}`} onClick={() => setView("empresas")}>
            <span className="nav-icon">🏢</span> Empresas
          </div>
          <div className={`nav-item ${view === "alumnos" ? "active" : ""}`} onClick={() => setView("alumnos")}>
            <span className="nav-icon">🎓</span> Alumnos
          </div>

          <div className="nav-group-label" style={{ marginTop: "12px" }}>Contenido</div>
          <div className={`nav-item ${view === "proyectos" ? "active" : ""}`} onClick={() => setView("proyectos")}>
            <span className="nav-icon">📁</span> Proyectos
          </div>
          <div className={`nav-item ${view === "vacantes" ? "active" : ""}`} onClick={() => setView("vacantes")}>
            <span className="nav-icon">💼</span> Vacantes
          </div>

          <div className="nav-group-label" style={{marginTop:"24px"}}>Sistema</div>
          <div className="nav-item" onClick={() => { localStorage.clear(); navigate("/"); }}>
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
              <div className="topbar-left">
                <div className="topbar-title">Dashboard General — Administrador</div>
                <div className="topbar-sub">Visión global de la plataforma en tiempo real</div>
              </div>
            </div>

            <div className="content">
              <div className="encargado-card">
                <div className="enc-avatar">{initials(user.nombre + " " + (user.apellido || ""))}</div>
                <div>
                  <div className="enc-name">{user.nombre} {user.apellido}</div>
                  <div className="enc-cargo">Administrador del Sistema</div>
                  <div className="enc-tags">
                    <span className="enc-tag">→ {user.correo}</span>
                    <span className="enc-tag">▬ Servicios Escolares</span>
                    <span className="enc-tag">□ UTEQ</span>
                  </div>
                </div>
              </div>

              <div className="metrics">
                <div className="metric-card" style={{"--mc":"#3b82f6"}} onClick={() => setView("empresas")}>
                  <span className="mc-icon">🏢</span>
                  <div className="mc-label">Total Empresas</div>
                  <div className="mc-val">{stats.totalEmpresas}</div>
                </div>
                <div className="metric-card" style={{"--mc":"#10b981"}} onClick={() => setView("alumnos")}>
                  <span className="mc-icon">🎓</span>
                  <div className="mc-label">Total Alumnos</div>
                  <div className="mc-val">{stats.totalEstudiantes}</div>
                </div>
                <div className="metric-card" style={{"--mc":"#8b5cf6"}} onClick={() => setView("proyectos")}>
                  <span className="mc-icon">📁</span>
                  <div className="mc-label">Proyectos Subidos</div>
                  <div className="mc-val">{stats.totalProyectos}</div>
                </div>
                <div className="metric-card" style={{"--mc":"#f59e0b"}} onClick={() => setView("vacantes")}>
                  <span className="mc-icon">💼</span>
                  <div className="mc-label">Vacantes Activas</div>
                  <div className="mc-val">{stats.vacantesActivas}</div>
                </div>
              </div>

              <div className="section-hdr">
                <div className="section-title">Resumen del Sistema</div>
              </div>
              <div style={{ padding: '24px', background: 'white', borderRadius: '12px', border: '1px solid var(--border)', color: 'var(--muted)', fontSize: '14px', lineHeight: '1.6' }}>
                Bienvenido al panel central. Actualmente hay <strong>{stats.totalEmpresas} empresas</strong> y <strong>{stats.totalEstudiantes} estudiantes</strong> registrados.
              </div>
            </div>
          </>
        )}

        {/* ════ VIEW: EMPRESAS ════ */}
        {view === "empresas" && (
          <>
            <div className="topbar">
              <div className="topbar-left">
                <div className="topbar-title">Directorio de Empresas</div>
              </div>
              <button className="btn-primary" onClick={() => setShowModal(true)}>+ Registrar Empresa</button>
            </div>
            <div className="content">
              <div className="rel-table-wrap">
                <div className="rel-table-hdr" style={{gridTemplateColumns: '2fr 1.5fr 1.5fr 1fr 120px'}}>
                  <div>Empresa</div>
                  <div>Giro</div>
                  <div>Contacto</div>
                  <div>Estado</div>
                  <div>Acción</div>
                </div>
                {empresas.map(e => (
                  <div className="rel-table-row" style={{gridTemplateColumns: '2fr 1.5fr 1.5fr 1fr 120px'}} key={e.id}>
                    <div className="rel-nombre">{e.nombre}</div>
                    <div className="rel-sub">{e.giro || '—'}</div>
                    <div className="rel-sub">{e.contacto}</div>
                    <div>
                      <span className={`badge badge-${e.estado === 'habilitada' ? 'active' : 'inactive'}`}>
                        {e.estado}
                      </span>
                    </div>
                    <div>
                      <button 
                        className={e.estado === 'habilitada' ? 'btn-toggle-off' : 'btn-toggle-on'}
                        onClick={() => handleToggleStatus(e.id, e.estado)}
                      >
                        {e.estado === 'habilitada' ? 'Inhabilitar' : 'Habilitar'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ════ VIEW: ALUMNOS ════ */}
        {view === "alumnos" && (
          <>
            <div className="topbar">
              <div className="topbar-left"><div className="topbar-title">Alumnos Registrados</div></div>
            </div>
            <div className="content">
              <div className="rel-table-wrap">
                <div className="rel-table-hdr" style={{gridTemplateColumns: '2fr 1.5fr 1fr 1fr 100px'}}>
                  <div>Alumno</div><div>Carrera</div><div>Matrícula</div><div>Semestre</div><div>Acción</div>
                </div>
                {alumnos.map(a => (
                  <div className="rel-table-row" style={{gridTemplateColumns: '2fr 1.5fr 1fr 1fr 100px'}} key={a.id}>
                    <div className="rel-nombre">{a.nombre}</div>
                    <div className="rel-sub">{a.carrera}</div>
                    <div className="rel-sub">{a.matricula}</div>
                    <div className="rel-sub">{a.semestre}°</div>
                    <div style={{fontSize: "12px", color: "var(--primary)", fontWeight: "600", cursor: "pointer"}}>Perfil</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ════ VIEW: PROYECTOS ════ */}
        {view === "proyectos" && (
          <>
            <div className="topbar">
              <div className="topbar-left"><div className="topbar-title">Proyectos Académicos</div></div>
            </div>
            <div className="content">
              <div className="rel-table-wrap">
                <div className="rel-table-hdr" style={{gridTemplateColumns: '2fr 1.5fr 1fr 1fr 100px'}}>
                  <div>Título</div><div>Autor</div><div>Fecha</div><div>Estado</div><div>Acción</div>
                </div>
                {proyectos.map(p => (
                  <div className="rel-table-row" style={{gridTemplateColumns: '2fr 1.5fr 1fr 1fr 100px'}} key={p.id}>
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

        {/* ════ VIEW: VACANTES ════ */}
        {view === "vacantes" && (
          <>
            <div className="topbar">
              <div className="topbar-left"><div className="topbar-title">Bolsa de Trabajo</div></div>
            </div>
            <div className="content">
              <div className="rel-table-wrap">
                <div className="rel-table-hdr" style={{gridTemplateColumns: '2fr 1.5fr 1fr 1fr 100px'}}>
                  <div>Vacante</div><div>Empresa</div><div>Nivel</div><div>Estado</div><div>Acción</div>
                </div>
                {vacantes.map(v => (
                  <div className="rel-table-row" style={{gridTemplateColumns: '2fr 1.5fr 1fr 1fr 100px'}} key={v.id}>
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
        <div className="overlay">
          <div className="modal" style={{maxWidth: '500px'}}>
            <h2 className="modal-title">Registrar Nueva Empresa</h2>
            <form onSubmit={handleCrearEmpresa} className="admin-form">
              <div className="form-group">
                <label>Razón Social</label>
                <input type="text" required value={formEmpresa.razon_social} onChange={e => setFormEmpresa({...formEmpresa, razon_social: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Giro / Industria</label>
                <input type="text" value={formEmpresa.giro} onChange={e => setFormEmpresa({...formEmpresa, giro: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Persona de Contacto</label>
                <input type="text" required value={formEmpresa.contacto} onChange={e => setFormEmpresa({...formEmpresa, contacto: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Correo Electrónico (Acceso)</label>
                <input type="email" required value={formEmpresa.correo} onChange={e => setFormEmpresa({...formEmpresa, correo: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Contraseña Temporal</label>
                <input type="password" required value={formEmpresa.password} onChange={e => setFormEmpresa({...formEmpresa, password: e.target.value})} />
              </div>
              <div className="modal-actions" style={{marginTop: '20px', display: 'flex', gap: '10px'}}>
                <button type="submit" className="btn-primary">Guardar Empresa</button>
                <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}