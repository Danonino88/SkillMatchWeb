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
      // 🟢 USAMOS EL PROMEDIO REAL DE LA BASE DE DATOS
      rating: parseFloat(p.promedio_estrellas),
      total_reviews: p.total_calificaciones,
      thumb: (index % 3) + 1,
      icon: ['🖥️', '📱', '🗄️'][index % 3],
    }));

    return res.status(200).json({ ok: true, proyectos: proyectosFormateados });
  } catch (error) {
    console.error('Error en listarProyectosPublicos:', error);
    return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
  }
};

exports.obtenerDetalleProyecto = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Proyecto con datos del creador + Promedio real
    const [proyectos] = await db.query(
      `SELECT p.*, u.nombre, u.apellido, e.carrera,
              IFNULL(AVG(c.estrellas), 0) as promedio_estrellas,
              COUNT(c.id_calificacion) as total_calificaciones
       FROM proyectos p
       INNER JOIN estudiantes e ON p.id_estudiante = e.id_estudiante
       INNER JOIN usuarios u ON e.id_usuario = u.id_usuario
       LEFT JOIN proyecto_calificaciones c ON p.id_proyecto = c.id_proyecto
       WHERE p.id_proyecto = ?
       GROUP BY p.id_proyecto`,
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
      rating: parseFloat(p.promedio_estrellas),
      total_reviews: p.total_calificaciones,
      tags: p.tecnologias ? p.tecnologias.split(',').map(t => t.trim()).filter(Boolean) : []
    };

    // 2. Buscamos las evidencias
    const [evidencias] = await db.query(
      `SELECT * FROM evidencias WHERE id_proyecto = ? ORDER BY fecha_subida DESC`,
      [id]
    );

    // 3. Buscamos los colaboradores
    const [colaboradores] = await db.query(
      `SELECT u.nombre, u.apellido, u.correo 
       FROM proyecto_colaboradores pc
       INNER JOIN estudiantes e ON pc.id_estudiante = e.id_estudiante
       INNER JOIN usuarios u ON e.id_usuario = u.id_usuario
       WHERE pc.id_proyecto = ?`,
      [id]
    );

    // 🟢 4. Buscamos las calificaciones y comentarios (NUEVO)
    const [comentarios] = await db.query(
      `SELECT c.estrellas, c.comentario, c.fecha_registro, u.nombre, u.apellido
       FROM proyecto_calificaciones c
       INNER JOIN usuarios u ON c.id_usuario = u.id_usuario
       WHERE c.id_proyecto = ?
       ORDER BY c.fecha_registro DESC`,
      [id]
    );

    return res.status(200).json({
      ok: true,
      proyecto: proyectoFormateado,
      evidencias: evidencias,
      colaboradores: colaboradores,
      comentarios: comentarios // Se lo mandamos a React
    });
  } catch (error) {
    console.error('Error al obtener detalle del proyecto:', error);
    return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
  }
};

// 🟢 NUEVA FUNCIÓN: Guardar o actualizar la calificación
exports.calificarProyecto = async (req, res) => {
  try {
    const { id_proyecto } = req.params;
    const { estrellas, comentario } = req.body;
    const id_usuario = req.usuario.id_usuario; // Obtenido del token

    if (!estrellas || estrellas < 1 || estrellas > 5) {
      return res.status(400).json({ ok: false, mensaje: 'La calificación debe ser entre 1 y 5 estrellas.' });
    }

    // Se inserta. Si ya existe la dupla (id_proyecto, id_usuario), se actualizan las estrellas y el comentario
    await db.query(`
      INSERT INTO proyecto_calificaciones (id_proyecto, id_usuario, estrellas, comentario)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        estrellas = VALUES(estrellas), 
        comentario = VALUES(comentario),
        fecha_registro = CURRENT_TIMESTAMP
    `, [id_proyecto, id_usuario, estrellas, comentario || null]);

    return res.status(200).json({ ok: true, mensaje: '¡Gracias por tu calificación!' });

  } catch (error) {
    console.error('Error al calificar proyecto:', error);
    return res.status(500).json({ ok: false, mensaje: 'Error interno al guardar la calificación.' });
  }
};