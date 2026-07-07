const db = require('../config/db'); 
const Vacante = require('../models/Vacante');
const createTransporter = require('../utils/mailer');

// MATCH
exports.realizarMatchEstudiantes = async (req, res) => {
  try {
    const estudiantesDB = await Vacante.getEstudiantesParaMatch();

    const estudiantesMatch = estudiantesDB.map(est => {
      // 1. Limpiamos las competencias (si existen) quitando corchetes y comillas
      let competenciasArray = [];
      if (est.competencias) {
        const cleanComp = est.competencias.replace(/[\[\]"']/g, ''); // Borra [, ], " y '
        competenciasArray = cleanComp.split(',').map(s => s.trim()).filter(Boolean);
      }

      // 2. Limpiamos las tecnologías de los proyectos a la fuerza
      let tecnologiasArray = [];
      if (est.tecnologias_proyectos) {
        // La base de datos puede devolver '["React","Node.js"],["Java"]'
        // Primero, borramos todos los símbolos de arreglo y comillas
        const cleanTech = est.tecnologias_proyectos.replace(/[\[\]"']/g, ''); 
        // Ahora sí separamos por comas de forma segura
        tecnologiasArray = cleanTech.split(',').map(s => s.trim()).filter(Boolean);
      }

      // 3. Fusionamos todo y eliminamos palabras repetidas
      const habilidadesSet = new Set([...competenciasArray, ...tecnologiasArray]);
      const habilidadesFinales = habilidadesSet.size > 0 ? Array.from(habilidadesSet) : ['Sin definir'];

      return {
        id_usuario: est.id_usuario, 
        id_estudiante: est.id_estudiante,
        nombre: est.nombre,
        carrera: est.carrera || 'Sin especificar',
        habilidades: habilidadesFinales, // Aquí va la lista limpia y perfecta
        validado: true,
        disponible: est.semestre >= 8 ? 'Disponible' : 'Próximamente'
      };
    });

    res.status(200).json({ ok: true, estudiantes: estudiantesMatch });
  } catch (error) {
    console.error('Error en realizarMatchEstudiantes:', error);
    res.status(500).json({ ok: false, mensaje: 'Error al generar el Match' });
  }
};

// ==========================================
// OBTENER INFORMACIÓN DEL PERFIL DE LA EMPRESA
// ==========================================
exports.obtenerPerfilEmpresa = async (req, res) => {
  return res.status(501).json({ ok: false, mensaje: 'Las vacantes de empresa no están incluidas en esta base local.' });
};

// ==========================================
// ACEPTAR POSTULANTE Y ENVIAR CORREO (CON GOOGLE OAUTH2)
// ==========================================
exports.aceptarPostulante = async (req, res) => {
  return res.status(501).json({ ok: false, mensaje: 'Las postulaciones no están incluidas en esta base local.' });
};

// ==========================================
// DASHBOARD Y GESTIÓN DE VACANTES
// ==========================================
exports.getDashboardCompleto = async (req, res) => {
  try {
    const id_usuario_empresa = req.usuario.id_usuario; 
    const [metricas, vacantes, estudiantesDB] = await Promise.all([
      Vacante.getMetricasDashboard(id_usuario_empresa),
      Vacante.getVacantesEmpresa(id_usuario_empresa),
      Vacante.getEstudiantesDestacados() 
    ]);

    const estudiantes = estudiantesDB.map(est => {
      const habilidadesArray = est.competencias 
        ? est.competencias.split(',').map(s => s.trim()).filter(Boolean) 
        : ['Sin definir'];

      return {
        id_usuario: est.id_usuario, 
        id_estudiante: est.id_estudiante,
        nombre: est.nombre,
        carrera: est.carrera || 'Sin especificar',
        habilidades: habilidadesArray,
        validado: true,
        disponible: est.semestre >= 8 ? 'Disponible' : 'Próximamente'
      };
    });

    return res.status(200).json({
      ok: true,
      data: {
        metricas: {
          activas: metricas.vacantes_activas || 0,
          postulaciones: metricas.postulaciones_totales || 0,
          revisados: metricas.candidatos_revisados || 0,
          contrataciones: metricas.contrataciones || 0
        },
        vacantes: vacantes,
        estudiantes: estudiantes 
      }
    });
  } catch (error) {
    console.error('Error en getDashboardCompleto:', error);
    return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
  }
};

exports.crearVacante = async (req, res) => {
  return res.status(501).json({ ok: false, mensaje: 'Las vacantes no están incluidas en esta base local.' });
};

exports.obtenerVacante = async (req, res) => {
  return res.status(501).json({ ok: false, mensaje: 'Las vacantes no están incluidas en esta base local.' });
};

exports.actualizarVacante = async (req, res) => {
  return res.status(501).json({ ok: false, mensaje: 'Las vacantes no están incluidas en esta base local.' });
};

exports.eliminarVacante = async (req, res) => {
  return res.status(501).json({ ok: false, mensaje: 'Las vacantes no están incluidas en esta base local.' });
};