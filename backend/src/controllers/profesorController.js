const db = require('../config/db'); 
const Proyecto = require('../models/Proyecto');

// ==========================================
// FUNCIÓN AUXILIAR: Obtener Profesor
// ==========================================
const obtenerIdProfesorDesdeToken = async (req) => {
  const id_usuario = req.usuario.id_usuario;
  const [rows] = await db.query('SELECT id_profesor FROM profesores WHERE id_profesor = ?', [id_usuario]);
  return rows.length > 0 ? rows[0] : null;
};

// ==========================================
// FUNCIONES DE PROYECTOS (Adaptadas de Estudiante)
// ==========================================

exports.listarProyectos = async (req, res) => {
  try {
    const profesor = await obtenerIdProfesorDesdeToken(req);
    if (!profesor) return res.status(404).json({ ok: false, mensaje: 'Perfil de profesor no encontrado' });
    return res.status(501).json({ ok: false, mensaje: 'La base local no incluye proyectos de profesor.' });
  } catch (error) {
    console.error('Error en listarProyectos (Profesor):', error);
    return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
  }
};

exports.crearProyecto = async (req, res) => {
  try {
    const { 
      titulo, descripcion, estado, tecnologias, area_trabajo,
      ambito_desarrollo, es_innovacion, ya_trabaja, competencia_impacto,
      objetivo, actividades
    } = req.body;

    const profesor = await obtenerIdProfesorDesdeToken(req);
    if (!profesor) return res.status(404).json({ ok: false, mensaje: 'Perfil de profesor no encontrado' });

    return res.status(501).json({ ok: false, mensaje: 'La base local no incluye proyectos de profesor.' });
  } catch (error) {
    console.error('Error en crearProyecto (Profesor):', error);
    return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
  }
};

exports.actualizarProyecto = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      titulo, descripcion, estado, tecnologias, area_trabajo,
      ambito_desarrollo, es_innovacion, ya_trabaja, competencia_impacto,
      objetivo, actividades
    } = req.body;

    const profesor = await obtenerIdProfesorDesdeToken(req);
    if (!profesor) return res.status(404).json({ ok: false, mensaje: 'Perfil de profesor no encontrado' });

    return res.status(501).json({ ok: false, mensaje: 'La base local no incluye proyectos de profesor.' });
  } catch (error) {
    console.error('Error en actualizarProyecto (Profesor):', error);
    return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
  }
};

exports.eliminarProyecto = async (req, res) => {
  try {
    const { id } = req.params;
    const profesor = await obtenerIdProfesorDesdeToken(req);

    if (!profesor) return res.status(404).json({ ok: false, mensaje: 'Profesor no encontrado' });

    return res.status(501).json({ ok: false, mensaje: 'La base local no incluye proyectos de profesor.' });
  } catch (error) {
    console.error('Error en eliminarProyecto (Profesor):', error);
    return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
  }
};

// ==========================================
// RESTO DEL DASHBOARD Y EVIDENCIAS
// ==========================================

exports.obtenerDashboard = async (req, res) => {
  try {
    // Por ahora retornamos un dashboard vacío para que no truene la vista
    // Aquí luego podrías agregar conteos reales si lo deseas
    res.status(200).json({ ok: true, dashboard: {} });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al cargar dashboard' });
  }
};

exports.obtenerAlumnos = async (req, res) => {
  try {
    // Buscamos a todos los estudiantes registrados en la plataforma
    const [alumnos] = await db.query(`
      SELECT u.id_usuario, u.nombre, u.apellido, u.correo, e.carrera, e.matricula
      FROM usuarios u
      JOIN estudiantes e ON u.id_usuario = e.id_estudiante
      WHERE u.id_rol = 2
    `);
    res.status(200).json({ ok: true, alumnos });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al cargar alumnos' });
  }
};

exports.listarEvidencias = async (req, res) => {
  try {
    const profesor = await obtenerIdProfesorDesdeToken(req);
    if (!profesor) return res.status(404).json({ ok: false });

    // Buscar evidencias solo de los proyectos de este profesor
    const [evidencias] = await db.query(`
      SELECT e.*, p.titulo as proyecto_titulo 
      FROM evidencias e 
      JOIN proyectos p ON e.id_proyecto = p.id_proyecto 
      WHERE p.id_estudiante = ?
      ORDER BY e.fecha_subida DESC
    `, [profesor.id_profesor]);

    res.status(200).json({ ok: true, evidencias });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al listar evidencias' });
  }
};

exports.subirEvidencia = async (req, res) => {
  try {
    const { id_proyecto, tipo } = req.body;
    const archivo = req.file ? req.file.path : null;
    const nombre_original = req.file ? req.file.originalname : 'archivo';
    const mime_type = req.file ? req.file.mimetype : 'application/octet-stream';

    if (!archivo) return res.status(400).json({ ok: false, mensaje: 'Archivo requerido' });

    await db.query(
      'INSERT INTO evidencias (id_proyecto, ruta_archivo, tipo) VALUES (?, ?, ?)',
      [id_proyecto, archivo, tipo || 'archivo']
    );

    res.status(200).json({ ok: true, mensaje: 'Evidencia subida correctamente' });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al subir evidencia' });
  }
};