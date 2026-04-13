const Proyecto = require('../models/Proyecto');
const db = require('../config/db'); 

exports.listarProyectosPublicos = async (req, res) => {
  try {
    const proyectos = await Proyecto.findPublicProjects();

    const proyectosFormateados = proyectos.map((p, index) => ({
      id_proyecto: p.id_proyecto,
      title: p.titulo,
      desc: p.descripcion || 'Proyecto académico publicado en SkillMatch.',
      author: `${p.nombre} ${p.apellido}`,
      carrera: p.carrera || 'UTEQ',
      estado: p.estado,
      fecha_registro: p.fecha_registro,
      img_principal: p.img_principal || null,
      tecnologias: p.tecnologias || '',
      tags: p.tecnologias
        ? p.tecnologias.split(',').map(t => t.trim()).filter(Boolean)
        : (p.carrera ? [p.carrera] : ['Proyecto UTEQ']),
      rating: [4.6, 4.8, 4.7, 4.9, 4.5][index % 5],
      thumb: (index % 3) + 1,
      icon: ['🖥️', '📱', '🗄️'][index % 3],
    }));

    return res.status(200).json({
      ok: true,
      proyectos: proyectosFormateados,
    });
  } catch (error) {
    console.error('Error en listarProyectosPublicos:', error);
    return res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor',
    });
  }
};

// --- NUEVA FUNCIÓN PARA VER DETALLE DEL PROYECTO ---
exports.obtenerDetalleProyecto = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Buscamos el proyecto con los datos del creador
    const [proyectos] = await db.query(
      `SELECT p.*, u.nombre, u.apellido, e.carrera 
       FROM proyectos p
       INNER JOIN estudiantes e ON p.id_estudiante = e.id_estudiante
       INNER JOIN usuarios u ON e.id_usuario = u.id_usuario
       WHERE p.id_proyecto = ?`,
      [id]
    );

    if (proyectos.length === 0) {
      return res.status(404).json({ ok: false, mensaje: 'Proyecto no encontrado' });
    }

    const p = proyectos[0];

    const proyectoFormateado = {
      ...p,
      title: p.titulo,
      desc: p.descripcion,
      author: `${p.nombre} ${p.apellido}`,
      tags: p.tecnologias ? p.tecnologias.split(',').map(t => t.trim()).filter(Boolean) : []
    };

    // 2. Buscamos las evidencias
    const [evidencias] = await db.query(
      `SELECT * FROM evidencias WHERE id_proyecto = ? ORDER BY fecha_subida DESC`,
      [id]
    );

    // 🟢 3. Buscamos los colaboradores (NUEVO) 🟢
    const [colaboradores] = await db.query(
      `SELECT u.nombre, u.apellido, u.correo 
       FROM proyecto_colaboradores pc
       INNER JOIN estudiantes e ON pc.id_estudiante = e.id_estudiante
       INNER JOIN usuarios u ON e.id_usuario = u.id_usuario
       WHERE pc.id_proyecto = ?`,
      [id]
    );

    return res.status(200).json({
      ok: true,
      proyecto: proyectoFormateado,
      evidencias: evidencias,
      colaboradores: colaboradores // Enviamos el equipo a React
    });
  } catch (error) {
    console.error('Error al obtener detalle del proyecto:', error);
    return res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor',
    });
  }
};