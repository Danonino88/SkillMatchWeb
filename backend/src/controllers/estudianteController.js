const Estudiante = require('../models/Estudiante');
const Proyecto = require('../models/Proyecto');
const Evidencia = require('../models/Evidencia');

const obtenerIdEstudianteDesdeToken = async (req) => {
  const id_usuario = req.usuario.id_usuario;
  const estudiante = await Estudiante.findByUsuarioId(id_usuario);
  return estudiante;
};

exports.obtenerDashboard = async (req, res) => {
  try {
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
    const { titulo, descripcion, estado, tecnologias } = req.body;
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
    const { titulo, descripcion, estado, tecnologias } = req.body;
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