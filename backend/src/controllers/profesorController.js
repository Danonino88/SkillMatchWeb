const db = require('../config/db'); 
const Proyecto = require('../models/Proyecto');

// ==========================================
// 🟢 FUNCIÓN AUXILIAR: Obtener Profesor
// ==========================================
const obtenerIdProfesorDesdeToken = async (req) => {
  const id_usuario = req.usuario.id_usuario;
  const [rows] = await db.query('SELECT id_profesor FROM profesores WHERE id_usuario = ?', [id_usuario]);
  return rows.length > 0 ? rows[0] : null;
};

// ==========================================
// 🟢 FUNCIONES DE PROYECTOS (Adaptadas de Estudiante)
// ==========================================

exports.listarProyectos = async (req, res) => {
  try {
    const profesor = await obtenerIdProfesorDesdeToken(req);
    if (!profesor) return res.status(404).json({ ok: false, mensaje: 'Perfil de profesor no encontrado' });

    // Usamos la nueva función que creamos en el modelo Proyecto
    const proyectos = await Proyecto.findByProfesor(profesor.id_profesor);

    return res.status(200).json({ ok: true, proyectos });
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

    if (!titulo) return res.status(400).json({ ok: false, mensaje: 'El título es obligatorio' });

    const estadosValidos = ['en progreso', 'completado', 'pausado'];
    const estadoFinal = estado || 'en progreso';
    if (!estadosValidos.includes(estadoFinal)) return res.status(400).json({ ok: false, mensaje: 'Estado inválido' });

    const img_principal = req.file ? req.file.path : null;

    // Llamamos al create pasando id_profesor y dejando id_estudiante nulo
    const id_proyecto = await Proyecto.create({
      id_estudiante: null, 
      id_profesor: profesor.id_profesor,
      titulo,
      descripcion,
      area_trabajo: area_trabajo || null,
      ambito_desarrollo: ambito_desarrollo || null,
      es_innovacion: es_innovacion === '1' || es_innovacion === 'true' || es_innovacion === true,
      ya_trabaja: ya_trabaja === '1' || ya_trabaja === 'true' || ya_trabaja === true,
      competencia_impacto: competencia_impacto || null,
      objetivo: objetivo || null,
      actividades: actividades || null,
      estado: estadoFinal,
      img_principal, 
      tecnologias: tecnologias || null
    });

    return res.status(201).json({ ok: true, mensaje: 'Proyecto creado correctamente' });
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

    // Verificamos que el proyecto exista y sea realmente de este profesor
    const proyectoExistente = await Proyecto.findById(id);
    if (!proyectoExistente || proyectoExistente.id_profesor !== profesor.id_profesor) {
      return res.status(403).json({ ok: false, mensaje: 'No tienes permiso para editar este proyecto' });
    }

    const img_principal = req.file ? req.file.path : proyectoExistente.img_principal;

    await Proyecto.update(id, {
      titulo, descripcion, area_trabajo: area_trabajo || null,
      ambito_desarrollo: ambito_desarrollo || null,
      es_innovacion: es_innovacion === '1' || es_innovacion === 'true' || es_innovacion === true,
      ya_trabaja: ya_trabaja === '1' || ya_trabaja === 'true' || ya_trabaja === true,
      competencia_impacto: competencia_impacto || null,
      objetivo: objetivo || null,
      actividades: actividades || null,
      estado, img_principal, tecnologias: tecnologias || null
    });

    return res.status(200).json({ ok: true, mensaje: 'Proyecto actualizado correctamente' });
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

    const proyectoExistente = await Proyecto.findById(id);
    if (!proyectoExistente || proyectoExistente.id_profesor !== profesor.id_profesor) {
      return res.status(403).json({ ok: false, mensaje: 'No tienes permisos para eliminar este proyecto' });
    }

    await Proyecto.delete(id);

    return res.status(200).json({ ok: true, mensaje: 'Proyecto eliminado correctamente' });
  } catch (error) {
    console.error('Error en eliminarProyecto (Profesor):', error);
    return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
  }
};

// ==========================================
// 🟢 RESTO DEL DASHBOARD Y EVIDENCIAS
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
      JOIN estudiantes e ON u.id_usuario = e.id_usuario
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
      WHERE p.id_profesor = ?
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
      'INSERT INTO evidencias (id_proyecto, ruta_archivo, nombre_original, tipo, mime_type) VALUES (?, ?, ?, ?, ?)',
      [id_proyecto, archivo, nombre_original, tipo || 'archivo', mime_type]
    );

    res.status(200).json({ ok: true, mensaje: 'Evidencia subida correctamente' });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al subir evidencia' });
  }
};