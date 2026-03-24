import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../CSS/DashboardVinculacion.css'; // 🟢 Importamos el CSS

// ─── DATA ───────────────────────────────────────────────────────────────────

const encargado = {
  nombre: "Mtro. Jorge Reyes Vargas",
  cargo: "Jefe de Vinculación y Estadías",
  departamento: "Servicios Escolares — UTEQ",
  correo: "j.reyes@uteq.edu.mx",
  extension: "Ext. 2041",
};

const empresasEspera = [
  {
    id: 1,
    nombre: "Grupo Innovatek S.A.",
    sector: "Tecnología",
    contacto: "Ing. Luis Barrera",
    correo: "l.barrera@innovatek.mx",
    telefono: "+52 442 890 1234",
    rfc: "GIN180320XY1",
    direccion: "Blvd. Bernardo Quintana 555, Querétaro",
    sitio: "innovatek.mx",
    empleados: "50–150",
    fundacion: "2018",
    convenio: "Estadías profesionales",
    carreras: "Ing. Sistemas, Mecatrónica",
    solicitud: "28 Feb 2026",
    descripcion: "Empresa de desarrollo de software especializada en soluciones ERP para PYMES. Solicita convenio para recibir estudiantes en estadía.",
    estado: "pendiente",
  },
  {
    id: 2,
    nombre: "Constructora Norteña del Bajío",
    sector: "Construcción",
    contacto: "Arq. Patricia Soto",
    correo: "psoto@constructoranortena.mx",
    telefono: "+52 442 334 5678",
    rfc: "CNB150712AB3",
    direccion: "Carretera a San Luis 2200, Querétaro",
    sitio: "constructoranortena.mx",
    empleados: "300–500",
    fundacion: "2015",
    convenio: "Empleo y estadías",
    carreras: "Ing. Civil, Administración",
    solicitud: "25 Feb 2026",
    descripcion: "Constructora con proyectos de infraestructura en el Bajío. Interesada en contratar egresados y recibir practicantes.",
    estado: "pendiente",
  },
  {
    id: 3,
    nombre: "FinTech Soluciones MX",
    sector: "Finanzas / Tecnología",
    contacto: "Lic. Andrea Ramírez",
    correo: "a.ramirez@fintechsoluciones.mx",
    telefono: "+52 55 6712 3456",
    rfc: "FSM200101CD5",
    direccion: "Paseo de la República 890, Querétaro",
    sitio: "fintechsoluciones.mx",
    empleados: "20–50",
    fundacion: "2020",
    convenio: "Estadías profesionales",
    carreras: "Contaduría, Ing. en Sistemas",
    solicitud: "20 Feb 2026",
    descripcion: "Startup fintech en etapa de crecimiento. Busca talento universitario para áreas de desarrollo y finanzas.",
    estado: "pendiente",
  },
  {
    id: 4,
    nombre: "Logística Bajío Express",
    sector: "Logística y Transporte",
    contacto: "Lic. Roberto Cruz",
    correo: "rcruz@bajioexpress.mx",
    telefono: "+52 442 567 8901",
    rfc: "LBE190505EF6",
    direccion: "Carretera a Celaya km 12, Querétaro",
    sitio: "bajioexpress.mx",
    empleados: "150–300",
    fundacion: "2019",
    convenio: "Empleo",
    carreras: "Administración, Ing. Industrial",
    solicitud: "15 Feb 2026",
    descripcion: "Empresa de logística y distribución regional. Requiere personal en áreas de operaciones y administración.",
    estado: "pendiente",
  },
];

const empresasRelacionadas = [
  { id: 10, nombre: "TechGroup S.A. de C.V.", sector: "Tecnología", convenio: "Estadías y empleo", aprobacion: "10 Ene 2026", folio: "UTEQ-EMP-2026-0048", vacantes: 3, contratados: 16, estado: "activa" },
  { id: 11, nombre: "Soluciones Digitales QRO", sector: "Software", convenio: "Estadías profesionales", aprobacion: "05 Nov 2025", folio: "UTEQ-EMP-2025-0091", vacantes: 2, contratados: 8, estado: "activa" },
  { id: 12, nombre: "Manufactura Integral S.A.", sector: "Manufactura", convenio: "Empleo", aprobacion: "22 Ago 2025", folio: "UTEQ-EMP-2025-0067", vacantes: 0, contratados: 11, estado: "inactiva" },
  { id: 13, nombre: "Agro Innovación del Bajío", sector: "Agroindustria", convenio: "Estadías profesionales", aprobacion: "14 Mar 2025", folio: "UTEQ-EMP-2025-0034", vacantes: 1, contratados: 5, estado: "activa" },
  { id: 14, nombre: "Centro Médico Querétaro", sector: "Salud", convenio: "Estadías y empleo", aprobacion: "01 Feb 2025", folio: "UTEQ-EMP-2025-0019", vacantes: 2, contratados: 9, estado: "activa" },
  { id: 15, nombre: "Grupo Editorial Noreste", sector: "Comunicación", convenio: "Empleo", aprobacion: "30 Nov 2024", folio: "UTEQ-EMP-2024-0108", vacantes: 0, contratados: 4, estado: "inactiva" },
  { id: 16, nombre: "AutoParts Bajío S.A.", sector: "Automotriz", convenio: "Estadías profesionales", aprobacion: "15 Sep 2024", folio: "UTEQ-EMP-2024-0083", vacantes: 4, contratados: 22, estado: "activa" },
  { id: 17, nombre: "Diseño y Espacios QRO", sector: "Diseño / Arquitectura", convenio: "Estadías profesionales", aprobacion: "10 Jul 2024", folio: "UTEQ-EMP-2024-0061", vacantes: 1, contratados: 7, estado: "activa" },
];

// ─── HELPERS ────────────────────────────────────────────────────────────────

const initials = (name) => name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

// ─── COMPONENT ──────────────────────────────────────────────────────────────

export default function DashboardVinculacion() {
  const navigate = useNavigate();
  const [view, setView] = useState("dashboard");
  const [expanded, setExpanded] = useState(null);
  const [estados, setEstados] = useState({});       // {id: "approved"|"rejected"}
  const [razones, setRazones] = useState({});        // {id: string}
  const [showRazon, setShowRazon] = useState(null);  // id empresa mostrando input rechazo
  const [modalEmpresa, setModalEmpresa] = useState(null);
  const [tabRel, setTabRel] = useState("todas");

  const pendientes = empresasEspera.filter(e => !estados[e.id]);
  const procesadas = empresasEspera.filter(e => estados[e.id]);

  const relFiltradas = tabRel === "todas"
    ? empresasRelacionadas
    : empresasRelacionadas.filter(e => e.estado === tabRel);

  const aprobar = (id) => {
    setEstados(prev => ({ ...prev, [id]: "approved" }));
    setShowRazon(null);
  };

  const rechazar = (id) => {
    setEstados(prev => ({ ...prev, [id]: "rejected" }));
    setShowRazon(null);
  };

  const estadoCard = (e) => {
    const s = estados[e.id];
    if (s === "approved") return "approved";
    if (s === "rejected") return "rejected";
    return "pending";
  };

  return (
    <>
      <div className="app">

        {/* ── SIDEBAR ── */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="brand">Skill<span>Match</span></div>
            <div className="brand-sub">Vinculación UTEQ</div>
          </div>

          <div className="nav-wrap">
            <div className="nav-group-label">Principal</div>
            <div className={`nav-item ${view === "dashboard" ? "active" : ""}`} onClick={() => setView("dashboard")}>
              <span className="nav-icon">▦</span> Dashboard
            </div>
            <div className={`nav-item ${view === "espera" ? "active" : ""}`} onClick={() => setView("espera")}>
              <span className="nav-icon">≈</span> Empresas en espera
              {pendientes.length > 0 && <span className="notif">{pendientes.length}</span>}
            </div>
            <div className={`nav-item ${view === "relacionadas" ? "active" : ""}`} onClick={() => setView("relacionadas")}>
              <span className="nav-icon">◆</span> Empresas relacionadas
            </div>
            <div className="nav-group-label" style={{marginTop:"8px"}}>Cuenta</div>
            <div className="nav-item">
              <span className="nav-icon">⊙</span> Configuración
            </div>
            <div className="nav-item" onClick={() => { sessionStorage.clear(); navigate("/"); }}>
              <span className="nav-icon">←</span> Cerrar sesión
            </div>
          </div>

          <div className="sidebar-user">
            <div className="user-avatar">JR</div>
            <div>
              <div className="user-name">Mtro. Jorge Reyes</div>
              <div className="user-role">Jefe de Vinculación</div>
            </div>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main className="main">

          {/* ════ DASHBOARD ════ */}
          {view === "dashboard" && (
            <>
              <div className="topbar">
                <div className="topbar-left">
                  <div className="topbar-title">Dashboard — Vinculación</div>
                  <div className="topbar-sub">Departamento de Servicios Escolares · UTEQ</div>
                </div>
              </div>

              <div className="content">

                {/* ENCARGADO */}
                <div className="encargado-card">
                  <div className="enc-avatar">JR</div>
                  <div>
                    <div className="enc-name">{encargado.nombre}</div>
                    <div className="enc-cargo">{encargado.cargo}</div>
                    <div className="enc-tags">
                      <span className="enc-tag">→ {encargado.correo}</span>
                      <span className="enc-tag">▬ {encargado.extension}</span>
                      <span className="enc-tag">□ {encargado.departamento}</span>
                    </div>
                  </div>
                </div>

                {/* METRICS */}
                <div className="metrics">
                  <div className="metric-card" style={{"--mc":"#244E7C"}}>
                    <span className="mc-icon">◆</span>
                    <div className="mc-label">Empresas relacionadas</div>
                    <div className="mc-val">{empresasRelacionadas.length}</div>
                    <div className="mc-sub">UTEQ + SkillMatch</div>
                  </div>
                  <div className="metric-card" style={{"--mc":"#f59e0b"}}>
                    <span className="mc-icon">≈</span>
                    <div className="mc-label">En espera de revisión</div>
                    <div className="mc-val">{pendientes.length}</div>
                    <div className="mc-sub">solicitudes pendientes</div>
                  </div>
                  <div className="metric-card" style={{"--mc":"#22c55e"}}>
                    <span className="mc-icon">✓</span>
                    <div className="mc-label">Aprobadas hoy</div>
                    <div className="mc-val">{Object.values(estados).filter(v=>v==="approved").length}</div>
                    <div className="mc-sub">esta sesión</div>
                  </div>
                  <div className="metric-card" style={{"--mc":"#232E56"}}>
                    <span className="mc-icon">●</span>
                    <div className="mc-label">Estudiantes colocados</div>
                    <div className="mc-val">85</div>
                    <div className="mc-sub">ciclo 2025–2026</div>
                  </div>
                </div>

                {/* RESUMEN ESPERA */}
                <div className="section-hdr">
                  <div className="section-title">
                    Solicitudes recientes
                    <span className="section-count">{empresasEspera.length} empresas</span>
                  </div>
                  <button className="btn btn-ghost" style={{fontSize:"12px",padding:"7px 14px"}} onClick={()=>setView("espera")}>
                    Ver todas →
                  </button>
                </div>

                <div className="espera-list">
                  {empresasEspera.slice(0,3).map(e => (
                    <div className={`espera-card ${estadoCard(e)}`} key={e.id}>
                      <div className="espera-header" onClick={() => setExpanded(expanded === e.id ? null : e.id)}>
                        <div className="espera-header-left">
                          <div className="espera-logo">{initials(e.nombre)}</div>
                          <div>
                            <div className="espera-nombre">{e.nombre}</div>
                            <div className="espera-meta">{e.sector} · Solicitado: {e.solicitud}</div>
                          </div>
                        </div>
                        <div className="espera-header-right">
                          <span className={`badge badge-${estadoCard(e) === "approved" ? "approved" : estadoCard(e) === "rejected" ? "rejected" : "pending"}`}>
                            {estadoCard(e) === "approved" ? "Aprobada" : estadoCard(e) === "rejected" ? "Rechazada" : "Pendiente"}
                          </span>
                          <span className={`expand-arrow ${expanded === e.id ? "open" : ""}`}>▼</span>
                        </div>
                      </div>
                      {expanded === e.id && <EsperaBody e={e} estados={estados} razones={razones} setRazones={setRazones} showRazon={showRazon} setShowRazon={setShowRazon} aprobar={aprobar} rechazar={rechazar} />}
                    </div>
                  ))}
                </div>

                {/* RESUMEN RELACIONADAS */}
                <div className="section-hdr">
                  <div className="section-title">
                    Empresas relacionadas — UTEQ & SkillMatch
                    <span className="section-count">{empresasRelacionadas.length} activas</span>
                  </div>
                  <button className="btn btn-ghost" style={{fontSize:"12px",padding:"7px 14px"}} onClick={()=>setView("relacionadas")}>
                    Ver todas →
                  </button>
                </div>

                <RelTable empresas={empresasRelacionadas.slice(0,4)} onView={setModalEmpresa} />
              </div>
            </>
          )}

          {/* ════ EMPRESAS EN ESPERA ════ */}
          {view === "espera" && (
            <>
              <div className="topbar">
                <div className="topbar-left">
                  <div className="topbar-title">Empresas en espera de revisión</div>
                  <div className="topbar-sub">{pendientes.length} pendientes · {procesadas.length} procesadas</div>
                </div>
              </div>

              <div className="content">
                {pendientes.length > 0 && (
                  <>
                    <div className="section-hdr" style={{marginBottom:"14px"}}>
                      <div className="section-title">Pendientes de revisión <span className="section-count">{pendientes.length}</span></div>
                    </div>
                    <div className="espera-list">
                      {pendientes.map(e => (
                        <div className="espera-card pending" key={e.id}>
                          <div className="espera-header" onClick={() => setExpanded(expanded === e.id ? null : e.id)}>
                            <div className="espera-header-left">
                              <div className="espera-logo">{initials(e.nombre)}</div>
                              <div>
                                <div className="espera-nombre">{e.nombre}</div>
                                <div className="espera-meta">{e.sector} · {e.contacto} · Solicitado: {e.solicitud}</div>
                              </div>
                            </div>
                            <div className="espera-header-right">
                              <span className="badge badge-pending">Pendiente</span>
                              <span className={`expand-arrow ${expanded === e.id ? "open" : ""}`}>▼</span>
                            </div>
                          </div>
                          {expanded === e.id && <EsperaBody e={e} estados={estados} razones={razones} setRazones={setRazones} showRazon={showRazon} setShowRazon={setShowRazon} aprobar={aprobar} rechazar={rechazar} />}
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {procesadas.length > 0 && (
                  <>
                    <div className="section-hdr" style={{marginTop:"8px", marginBottom:"14px"}}>
                      <div className="section-title">Ya procesadas <span className="section-count">{procesadas.length}</span></div>
                    </div>
                    <div className="espera-list">
                      {procesadas.map(e => (
                        <div className={`espera-card ${estadoCard(e)}`} key={e.id}>
                          <div className="espera-header" onClick={() => setExpanded(expanded === e.id ? null : e.id)}>
                            <div className="espera-header-left">
                              <div className="espera-logo">{initials(e.nombre)}</div>
                              <div>
                                <div className="espera-nombre">{e.nombre}</div>
                                <div className="espera-meta">{e.sector} · {e.contacto} · Solicitado: {e.solicitud}</div>
                              </div>
                            </div>
                            <div className="espera-header-right">
                              <span className={`badge badge-${estados[e.id] === "approved" ? "approved" : "rejected"}`}>
                                {estados[e.id] === "approved" ? "Aprobada" : "Rechazada"}
                              </span>
                              {estados[e.id] === "rejected" && razones[e.id] && (
                                <span style={{fontSize:"11px", color:"#dc2626", maxWidth:"180px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>
                                  Motivo: {razones[e.id]}
                                </span>
                              )}
                              <span className={`expand-arrow ${expanded === e.id ? "open" : ""}`}>▼</span>
                            </div>
                          </div>
                          {expanded === e.id && <EsperaBody e={e} estados={estados} razones={razones} setRazones={setRazones} showRazon={showRazon} setShowRazon={setShowRazon} aprobar={aprobar} rechazar={rechazar} />}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          {/* ════ EMPRESAS RELACIONADAS ════ */}
          {view === "relacionadas" && (
            <>
              <div className="topbar">
                <div className="topbar-left">
                  <div className="topbar-title">Empresas relacionadas con UTEQ & SkillMatch</div>
                  <div className="topbar-sub">{empresasRelacionadas.length} empresas con convenio activo o histórico</div>
                </div>
              </div>

              <div className="content">
                <div className="tabs">
                  {[["todas","Todas"], ["activa","Activas"], ["inactiva","Inactivas"]].map(([k,l])=>(
                    <button key={k} className={`tab ${tabRel===k?"active":""}`} onClick={()=>setTabRel(k)}>{l}</button>
                  ))}
                </div>
                <RelTable empresas={relFiltradas} onView={setModalEmpresa} />
              </div>
            </>
          )}

        </main>
      </div>

      {/* ── MODAL EMPRESA ── */}
      {modalEmpresa && (
        <div className="overlay" onClick={() => setModalEmpresa(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px"}}>
              <div style={{display:"flex", alignItems:"center", gap:"12px"}}>
                <div style={{width:"44px",height:"44px",borderRadius:"10px",background:"var(--primary)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"800",fontSize:"15px",color:"white"}}>
                  {initials(modalEmpresa.nombre)}
                </div>
                <div>
                  <div className="modal-title" style={{marginBottom:"0"}}>{modalEmpresa.nombre}</div>
                  <div style={{fontSize:"12px",color:"var(--muted)"}}>{modalEmpresa.sector}</div>
                </div>
              </div>
              <span className={`badge badge-${modalEmpresa.estado === "activa" ? "active" : "inactive"}`}>
                {modalEmpresa.estado === "activa" ? "Activa" : "Inactiva"}
              </span>
            </div>

            <div style={{
              background:"var(--green-bg)", border:"1.5px solid var(--green-border)",
              borderRadius:"10px", padding:"12px 16px", marginBottom:"18px",
              display:"flex", alignItems:"center", gap:"12px"
            }}>
              <span style={{fontSize:"18px",color:"#22c55e",fontWeight:"800"}}>✓</span>
              <div>
                <div style={{fontSize:"13px",fontWeight:"700",color:"var(--green)"}}>Aprobada por Servicios Escolares UTEQ</div>
                <div style={{fontSize:"12px",color:"var(--green)",marginTop:"1px"}}>Aprobación: {modalEmpresa.aprobacion} · Folio: <span style={{fontFamily:"monospace",fontWeight:"700"}}>{modalEmpresa.folio}</span></div>
              </div>
            </div>

            <div className="modal-section-title">Datos del convenio</div>
            <div className="modal-grid" style={{marginBottom:"16px"}}>
              {[
                ["Tipo de convenio", modalEmpresa.convenio],
                ["Vacantes activas", modalEmpresa.vacantes],
                ["Estudiantes contratados", modalEmpresa.contratados],
                ["Estatus", modalEmpresa.estado === "activa" ? "Vigente y activo" : "Sin actividad reciente"],
              ].map(([l,v])=>(
                <div key={l}>
                  <div className="mfield-label">{l}</div>
                  <div className="mfield-val">{v}</div>
                </div>
              ))}
            </div>

            <div style={{textAlign:"right", marginTop:"8px"}}>
              <button className="btn btn-ghost" onClick={() => setModalEmpresa(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── SUB-COMPONENT: Cuerpo expandible de empresa en espera ──────────────────

function EsperaBody({ e, estados, razones, setRazones, showRazon, setShowRazon, aprobar, rechazar }) {
  const estado = estados[e.id];
  return (
    <div className="espera-body">
      {/* COLUMNA IZQUIERDA */}
      <div className="espera-info-col">
        <div className="info-block">
          <div className="info-label">Descripción de la solicitud</div>
          <div className="espera-desc">{e.descripcion}</div>
        </div>
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px"}}>
          <div className="info-block">
            <div className="info-label">Razón social / RFC</div>
            <div className="info-val">{e.nombre}</div>
            <div className="info-val" style={{fontSize:"12px", color:"var(--muted)", marginTop:"2px", fontFamily:"monospace"}}>{e.rfc}</div>
          </div>
          <div className="info-block">
            <div className="info-label">Sector</div>
            <div className="info-val">{e.sector}</div>
          </div>
          <div className="info-block">
            <div className="info-label">Dirección</div>
            <div className="info-val">{e.direccion}</div>
          </div>
          <div className="info-block">
            <div className="info-label">Sitio web</div>
            <div className="info-val blue">{e.sitio}</div>
          </div>
          <div className="info-block">
            <div className="info-label">Empleados</div>
            <div className="info-val">{e.empleados}</div>
          </div>
          <div className="info-block">
            <div className="info-label">Año de fundación</div>
            <div className="info-val">{e.fundacion}</div>
          </div>
        </div>
      </div>

      {/* COLUMNA DERECHA */}
      <div className="espera-info-col">
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px", marginBottom:"16px"}}>
          <div className="info-block">
            <div className="info-label">Contacto</div>
            <div className="info-val">{e.contacto}</div>
          </div>
          <div className="info-block">
            <div className="info-label">Teléfono</div>
            <div className="info-val blue">{e.telefono}</div>
          </div>
          <div className="info-block" style={{gridColumn:"1/-1"}}>
            <div className="info-label">Correo electrónico</div>
            <div className="info-val blue">{e.correo}</div>
          </div>
          <div className="info-block">
            <div className="info-label">Tipo de convenio solicitado</div>
            <div className="info-val">{e.convenio}</div>
          </div>
          <div className="info-block">
            <div className="info-label">Carreras de interés</div>
            <div className="info-val">{e.carreras}</div>
          </div>
        </div>

        {/* ESTADO / ACCIONES */}
        {!estado && (
          <>
            {showRazon === e.id ? (
              <div>
                <div className="rechazo-label">Motivo de rechazo</div>
                <textarea
                  className="rechazo-input"
                  placeholder="Escribe el motivo del rechazo para notificar a la empresa..."
                  value={razones[e.id] || ""}
                  onChange={ev => setRazones(r => ({...r, [e.id]: ev.target.value}))}
                />
                <div className="espera-actions" style={{marginTop:"10px"}}>
                  <button className="btn btn-reject" onClick={() => rechazar(e.id)} disabled={!razones[e.id]?.trim()}>
                    Confirmar rechazo
                  </button>
                  <button className="btn btn-ghost" style={{fontSize:"12px",padding:"7px 14px"}} onClick={()=>setShowRazon(null)}>
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="espera-actions">
                <button className="btn btn-approve" onClick={() => aprobar(e.id)}>✓ Aprobar empresa</button>
                <button className="btn btn-reject" onClick={() => setShowRazon(e.id)}>✕ Rechazar</button>
              </div>
            )}
          </>
        )}

        {estado === "approved" && (
          <div style={{background:"var(--green-bg)", border:"1.5px solid var(--green-border)", borderRadius:"10px", padding:"14px 16px"}}>
            <div style={{fontSize:"13px", fontWeight:"700", color:"var(--green)"}}>✓ Empresa aprobada por Servicios Escolares UTEQ</div>
            <div style={{fontSize:"12px", color:"var(--green)", marginTop:"4px"}}>Se generará el folio de aprobación y se notificará a la empresa.</div>
          </div>
        )}

        {estado === "rejected" && (
          <div style={{background:"var(--red-bg)", border:"1.5px solid var(--red-border)", borderRadius:"10px", padding:"14px 16px"}}>
            <div style={{fontSize:"13px", fontWeight:"700", color:"var(--red)"}}>✕ Empresa rechazada</div>
            {razones[e.id] && (
              <div style={{fontSize:"12px", color:"var(--red)", marginTop:"4px"}}>
                <strong>Motivo:</strong> {razones[e.id]}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SUB-COMPONENT: Tabla empresas relacionadas ──────────────────────────────

function RelTable({ empresas, onView }) {
  return (
    <div className="rel-table-wrap">
      <div className="rel-table-hdr">
        <div>Empresa</div>
        <div>Sector</div>
        <div>Folio</div>
        <div>Aprobación</div>
        <div>Vacantes</div>
        <div>Contratados</div>
        <div>Estado</div>
      </div>
      {empresas.map(e => (
        <div className="rel-table-row" key={e.id} onClick={() => onView(e)}>
          <div>
            <div className="rel-nombre">{e.nombre}</div>
            <div className="rel-sector">{e.convenio}</div>
          </div>
          <div style={{fontSize:"13px", color:"var(--muted2)"}}>{e.sector}</div>
          <div className="rel-folio">{e.folio}</div>
          <div style={{fontSize:"13px", color:"var(--muted2)"}}>{e.aprobacion}</div>
          <div><span className="rel-num">{e.vacantes}</span></div>
          <div><span className="rel-num">{e.contratados}</span></div>
          <div>
            <span className={`badge badge-${e.estado === "activa" ? "active" : "inactive"}`}>
              {e.estado === "activa" ? "Activa" : "Inactiva"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}