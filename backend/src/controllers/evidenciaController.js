const fs = require('fs');
const path = require('path');
const Estudiante = require('../models/Estudiante');
const Proyecto = require('../models/Proyecto');
const Evidencia = require('../models/Evidencia');

const obtenerEstudianteDesdeToken = async (req) => {
  const id_usuario = req.usuario.id_usuario;
  return await Estudiante.findByUsuarioId(id_usuario);
};

exports.listarMisEvidencias = async (req, res) => {
  try {
    const estudiante = await obtenerEstudianteDesdeToken(req);

    if (!estudiante) {
      return res.status(404).json({
        ok: false,
        mensaje: 'No se encontró el perfil del estudiante'
      });
    }

    const evidencias = await Evidencia.findAllByEstudiante(estudiante.id_estudiante);

    return res.status(200).json({
      ok: true,
      evidencias
    });
  } catch (error) {
    console.error('Error en listarMisEvidencias:', error);
    return res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor'
    });
  }
};

exports.subirEvidencia = async (req, res) => {
  try {
    const { id_proyecto, tipo } = req.body;
    const archivo = req.file;

    if (!archivo) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Debes seleccionar un archivo'
      });
    }

    if (!id_proyecto) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Debes indicar el proyecto'
      });
    }

    const estudiante = await obtenerEstudianteDesdeToken(req);

    if (!estudiante) {
      return res.status(404).json({
        ok: false,
        mensaje: 'No se encontró el perfil del estudiante'
      });
    }

    const proyecto = await Proyecto.findByIdAndEstudiante(id_proyecto, estudiante.id_estudiante);

    if (!proyecto) {
      return res.status(403).json({
        ok: false,
        mensaje: 'Ese proyecto no te pertenece o no existe'
      });
    }

    const extension = path.extname(archivo.originalname).replace('.', '').toLowerCase();

    const id_evidencia = await Evidencia.create({
      id_proyecto,
      ruta_archivo: `evidencias/${archivo.filename}`,
      tipo: tipo || extension || 'archivo',
      nombre_original: archivo.originalname,
      mime_type: archivo.mimetype,
      tamano_bytes: archivo.size
    });

    const evidencia = await Evidencia.findById(id_evidencia);

    return res.status(201).json({
      ok: true,
      mensaje: 'Evidencia subida correctamente',
      evidencia
    });
  } catch (error) {
    console.error('Error en subirEvidencia:', error);
    return res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor'
    });
  }
};

exports.eliminarEvidencia = async (req, res) => {
  try {
    const { id } = req.params;

    const estudiante = await obtenerEstudianteDesdeToken(req);

    if (!estudiante) {
      return res.status(404).json({
        ok: false,
        mensaje: 'No se encontró el perfil del estudiante'
      });
    }

    const evidencia = await Evidencia.findByIdAndEstudiante(id, estudiante.id_estudiante);

    if (!evidencia) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Evidencia no encontrada'
      });
    }

    const rutaFisica = path.join(__dirname, '../../uploads', evidencia.ruta_archivo);

    if (fs.existsSync(rutaFisica)) {
      fs.unlinkSync(rutaFisica);
    }

    await Evidencia.delete(id);

    return res.status(200).json({
      ok: true,
      mensaje: 'Evidencia eliminada correctamente'
    });
  } catch (error) {
    console.error('Error en eliminarEvidencia:', error);
    return res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor'
    });
  }
};