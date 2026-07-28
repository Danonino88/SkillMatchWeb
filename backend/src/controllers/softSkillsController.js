const Estudiante = require('../models/Estudiante');
const SoftSkills = require('../models/SoftSkills');

async function obtenerEstudiante(req) {
  return Estudiante.findByUsuarioId(req.usuario.id_usuario);
}

exports.obtenerPreguntas = async (req, res) => {
  try {
    const estudiante = await obtenerEstudiante(req);
    if (!estudiante) return res.status(404).json({ ok: false, mensaje: 'No se encontró el perfil del estudiante.' });

    const preguntas = await SoftSkills.getPreguntasActivas();
    const resultado = await SoftSkills.getResultadoByEstudiante(estudiante.id_estudiante);

    return res.json({ ok: true, preguntas, resultado });
  } catch (error) {
    console.error('Error en obtenerPreguntas soft skills:', error);
    return res.status(500).json({ ok: false, mensaje: 'Error al cargar el test de habilidades blandas.' });
  }
};

exports.obtenerResultado = async (req, res) => {
  try {
    const estudiante = await obtenerEstudiante(req);
    if (!estudiante) return res.status(404).json({ ok: false, mensaje: 'No se encontró el perfil del estudiante.' });

    const resultado = await SoftSkills.getResultadoByEstudiante(estudiante.id_estudiante);
    return res.json({ ok: true, resultado });
  } catch (error) {
    console.error('Error en obtenerResultado soft skills:', error);
    return res.status(500).json({ ok: false, mensaje: 'Error al cargar el resultado.' });
  }
};

exports.responderTest = async (req, res) => {
  try {
    const estudiante = await obtenerEstudiante(req);
    if (!estudiante) return res.status(404).json({ ok: false, mensaje: 'No se encontró el perfil del estudiante.' });

    const respuestas = Array.isArray(req.body.respuestas) ? req.body.respuestas : [];
    const preguntas = await SoftSkills.getPreguntasActivas();

    if (!preguntas.length) {
      return res.status(400).json({ ok: false, mensaje: 'No hay preguntas activas para el test.' });
    }

    const resultadoCalculado = SoftSkills.calcularResultados(preguntas, respuestas);
    if (resultadoCalculado.total_respondidas < preguntas.length) {
      return res.status(400).json({
        ok: false,
        mensaje: `Debes responder todas las preguntas. Respondidas: ${resultadoCalculado.total_respondidas}/${preguntas.length}.`,
      });
    }

    const resultado = await SoftSkills.guardarResultado(estudiante.id_estudiante, resultadoCalculado);
    return res.status(201).json({ ok: true, mensaje: 'Test guardado correctamente.', resultado });
  } catch (error) {
    console.error('Error en responderTest soft skills:', error);
    return res.status(500).json({ ok: false, mensaje: 'Error al guardar el test de habilidades blandas.' });
  }
};
