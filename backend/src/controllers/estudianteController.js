const db = require('../config/db'); 
const Estudiante = require('../models/Estudiante');
const Proyecto = require('../models/Proyecto');
const Evidencia = require('../models/Evidencia');

// ==========================================
// OBTENER PERFIL PÚBLICO (CORREGIDO)
// ==========================================
exports.getPerfilPublico = async (req, res) => {
  const { id } = req.params; 

  try {
    const [alumnoRows] = await db.query(`
      SELECT 
        u.id_usuario, u.nombre, u.apellido, u.correo, u.telefono,
        e.id_estudiante, e.matricula, e.carrera, e.semestre
      FROM usuarios u
      INNER JOIN estudiantes e ON u.id_usuario = e.id_usuario
      WHERE u.id_usuario = ? AND u.id_rol = 2
    `, [id]);

    if (alumnoRows.length === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Estudiante no encontrado o el usuario no tiene rol de estudiante.'
      });
    }

    const alumno = alumnoRows[0];

    const [proyectosRows] = await db.query(`
      SELECT 
        id_proyecto, titulo, descripcion, tecnologias, fecha_registro, estado, img_principal
      FROM proyectos
      WHERE id_estudiante = ?
      ORDER BY fecha_registro DESC
    `, [alumno.id_estudiante]);

    res.json({
      ok: true,
      alumno: alumno,
      proyectos: proyectosRows
    });

  } catch (error) {
    console.error("❌ Error real en el servidor:", error.message);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor al procesar los datos.'
    });
  }
};

// ==========================================
// 🟢 NUEVA FUNCIÓN: ACTUALIZAR PERFIL DEL ESTUDIANTE 🟢
// ==========================================
exports.actualizarPerfil = async (req, res) => {
  const conn = await db.getConnection();
  try {
    const id_usuario = req.usuario.id_usuario;
    const { nombre, apellido, telefono, matricula, carrera, semestre } = req.body;

    if (!nombre || !apellido) {
      return res.status(400).json({ ok: false, mensaje: 'Nombre y apellido son obligatorios.' });
    }

    await conn.beginTransaction();

    // 1. Actualizar tabla usuarios
    await conn.query(
      `UPDATE usuarios SET nombre = ?, apellido = ?, telefono = ? WHERE id_usuario = ?`,
      [nombre, apellido, telefono || null, id_usuario]
    );

    // 2. Actualizar tabla estudiantes
    await conn.query(
      `UPDATE estudiantes SET matricula = ?, carrera = ?, semestre = ? WHERE id_usuario = ?`,
      [matricula || null, carrera || null, semestre || null, id_usuario]
    );

    await conn.commit();
    
    return res.status(200).json({ ok: true, mensaje: 'Perfil actualizado con éxito.' });
  } catch (error) {
    if (conn) await conn.rollback();
    console.error('Error en actualizarPerfil:', error);
    return res.status(500).json({ ok: false, mensaje: 'Error al actualizar el perfil.' });
  } finally {
    if (conn) conn.release();
  }
};


// ==========================================
// FUNCIONES AUXILIARES Y GESTIÓN
// ==========================================

const obtenerIdEstudianteDesdeToken = async (req) => {
  const id_usuario = req.usuario.id_usuario;
  const estudiante = await Estudiante.findByUsuarioId(id_usuario);
  return estudiante;
};

exports.obtenerVacantes = async (req, res) => {
  try {
    const id_usuario = req.usuario.id_usuario;
    const vacantes = await Estudiante.getVacantesDisponibles(id_usuario);
    
    return res.status(200).json({ ok: true, vacantes });
  } catch (error) {
    console.error('Error al obtener vacantes:', error);
    return res.status(500).json({ ok: false, mensaje: 'Error al cargar las vacantes' });
  }
};

exports.postularVacante = async (req, res) => {
  try {
    const id_usuario = req.usuario.id_usuario;
    const { id_vacante } = req.body;

    if (!id_vacante) {
      return res.status(400).json({ ok: false, mensaje: 'ID de vacante requerido' });
    }

    await Estudiante.postular(id_usuario, id_vacante);
    
    return res.status(201).json({ ok: true, mensaje: 'Postulación enviada correctamente' });
  } catch (error) {
    console.error('Error al postularse:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ ok: false, mensaje: 'Ya te has postulado a esta vacante' });
    }
    return res.status(500).json({ ok: false, mensaje: 'Error al procesar la postulación' });
  }
};

exports.obtenerDashboard = async (req, res) => {
  try {
    // 🟢 Modificación para que el Dashboard regrese el teléfono del usuario
    const [userRows] = await db.query('SELECT telefono FROM usuarios WHERE id_usuario = ?', [req.usuario.id_usuario]);
    const telefonoUser = userRows.length > 0 ? userRows[0].telefono : null;

    const estudiante = await obtenerIdEstudianteDesdeToken(req);

    if (!estudiante) {
      return res.status(404).json({
        ok: false,
        mensaje: 'No se encontró el perfil del estudiante'
      });
    }

    const totalProyectos = await Proyecto.countByEstudiante(estudiante.id_estudiante);
    const totalDocumentos = await Evidencia.countByEstudiante(estudiante.id_estudiante);

    return res.status(200).json({
      ok: true,
      dashboard: {
        usuario: {
          telefono: telefonoUser
        },
        estudiante: {
          id_estudiante: estudiante.id_estudiante,
          matricula: estudiante.matricula,
          carrera: estudiante.carrera,
          semestre: estudiante.semestre
        },
        resumen: {
          proyectos_propios: totalProyectos,
          documentos: totalDocumentos
        }
      }
    });
  } catch (error) {
    console.error('Error en obtenerDashboard:', error);
    return res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor'
    });
  }
};

exports.listarMisProyectos = async (req, res) => {
  try {
    const estudiante = await obtenerIdEstudianteDesdeToken(req);

    if (!estudiante) {
      return res.status(404).json({
        ok: false,
        mensaje: 'No se encontró el perfil del estudiante'
      });
    }

    const proyectos = await Proyecto.findAllByEstudiante(estudiante.id_estudiante);

    return res.status(200).json({
      ok: true,
      proyectos
    });
  } catch (error) {
    console.error('Error en listarMisProyectos:', error);
    return res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor'
    });
  }
};

exports.obtenerProyecto = async (req, res) => {
  try {
    const { id } = req.params;
    const estudiante = await obtenerIdEstudianteDesdeToken(req);

    if (!estudiante) {
      return res.status(404).json({
        ok: false,
        mensaje: 'No se encontró el perfil del estudiante'
      });
    }

    const proyecto = await Proyecto.findByIdAndEstudiante(id, estudiante.id_estudiante);

    if (!proyecto) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Proyecto no encontrado'
      });
    }

    return res.status(200).json({
      ok: true,
      proyecto
    });
  } catch (error) {
    console.error('Error en obtenerProyecto:', error);
    return res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor'
    });
  }
};

exports.crearProyecto = async (req, res) => {
  try {
    const { 
      titulo, 
      descripcion, 
      estado, 
      tecnologias,
      area_trabajo,
      ambito_desarrollo,
      es_innovacion,
      ya_trabaja,
      competencia_impacto,
      objetivo,
      actividades
    } = req.body;

    const estudiante = await obtenerIdEstudianteDesdeToken(req);

    if (!estudiante) {
      return res.status(404).json({
        ok: false,
        mensaje: 'No se encontró el perfil del estudiante'
      });
    }

    if (!titulo) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El título es obligatorio'
      });
    }

    const estadosValidos = ['en progreso', 'completado', 'pausado'];
    const estadoFinal = estado || 'en progreso';

    if (!estadosValidos.includes(estadoFinal)) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Estado inválido'
      });
    }

    const img_principal = req.file ? `proyectos/${req.file.filename}` : null;

    const id_proyecto = await Proyecto.create({
      id_estudiante: estudiante.id_estudiante,
      titulo,
      descripcion,
      area_trabajo: area_trabajo || null,
      ambito_desarrollo: ambito_desarrollo || null,
      es_innovacion: es_innovacion ? 1 : 0,
      ya_trabaja: ya_trabaja ? 1 : 0,
      competencia_impacto: competencia_impacto || null,
      objetivo: objetivo || null,
      actividades: actividades || null,
      estado: estadoFinal,
      img_principal,
      tecnologias: tecnologias || null
    });

    const proyecto = await Proyecto.findById(id_proyecto);

    return res.status(201).json({
      ok: true,
      mensaje: 'Proyecto creado correctamente',
      proyecto
    });
  } catch (error) {
    console.error('Error en crearProyecto:', error);
    return res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor'
    });
  }
};

exports.actualizarProyecto = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      titulo, 
      descripcion, 
      estado, 
      tecnologias,
      area_trabajo,
      ambito_desarrollo,
      es_innovacion,
      ya_trabaja,
      competencia_impacto,
      objetivo,
      actividades
    } = req.body;

    const estudiante = await obtenerIdEstudianteDesdeToken(req);

    if (!estudiante) {
      return res.status(404).json({
        ok: false,
        mensaje: 'No se encontró el perfil del estudiante'
      });
    }

    const proyectoExistente = await Proyecto.findByIdAndEstudiante(id, estudiante.id_estudiante);

    if (!proyectoExistente) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Proyecto no encontrado'
      });
    }

    if (!titulo) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El título es obligatorio'
      });
    }

    const estadosValidos = ['en progreso', 'completado', 'pausado'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Estado inválido'
      });
    }

    const img_principal = req.file
      ? `proyectos/${req.file.filename}`
      : proyectoExistente.img_principal;

    await Proyecto.update(id, {
      titulo,
      descripcion,
      area_trabajo: area_trabajo || null,
      ambito_desarrollo: ambito_desarrollo || null,
      es_innovacion: es_innovacion ? 1 : 0,
      ya_trabaja: ya_trabaja ? 1 : 0,
      competencia_impacto: competencia_impacto || null,
      objetivo: objetivo || null,
      actividades: actividades || null,
      estado,
      img_principal,
      tecnologias: tecnologias || null
    });

    const proyectoActualizado = await Proyecto.findById(id);

    return res.status(200).json({
      ok: true,
      mensaje: 'Proyecto actualizado correctamente',
      proyecto: proyectoActualizado
    });
  } catch (error) {
    console.error('Error en actualizarProyecto:', error);
    return res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor'
    });
  }
};

exports.eliminarProyecto = async (req, res) => {
  try {
    const { id } = req.params;
    const estudiante = await obtenerIdEstudianteDesdeToken(req);

    if (!estudiante) {
      return res.status(404).json({
        ok: false,
        mensaje: 'No se encontró el perfil del estudiante'
      });
    }

    const proyectoExistente = await Proyecto.findByIdAndEstudiante(id, estudiante.id_estudiante);

    if (!proyectoExistente) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Proyecto no encontrado'
      });
    }

    await Proyecto.delete(id);

    return res.status(200).json({
      ok: true,
      mensaje: 'Proyecto eliminado correctamente'
    });
  } catch (error) {
    console.error('Error en eliminarProyecto:', error);
    return res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor'
    });
  }
};