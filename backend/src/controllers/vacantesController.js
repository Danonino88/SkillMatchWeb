const Vacante = require('../models/Vacante');

exports.getDashboardCompleto = async (req, res) => {
  try {
    const id_usuario = req.usuario.id_usuario; 
    
    // 🟢 Ejecutamos las 3 consultas al mismo tiempo
    const [metricas, vacantes, estudiantesDB] = await Promise.all([
      Vacante.getMetricasDashboard(id_usuario),
      Vacante.getVacantesEmpresa(id_usuario),
      Vacante.getEstudiantesDestacados() // <-- Consulta para alumnos destacados
    ]);

    // 🟢 Formateamos los estudiantes para que el frontend los entienda fácil
    const estudiantes = estudiantesDB.map(est => {
      // Convertimos las competencias "React, Node, SQL" en un array ["React", "Node", "SQL"]
      const habilidadesArray = est.competencias 
        ? est.competencias.split(',').map(s => s.trim()).filter(Boolean) 
        : ['Sin definir'];

      return {
        id: est.id,
        nombre: est.nombre,
        carrera: est.carrera || 'Sin especificar',
        promedio: '9.0', // <--- Simulado, ya que no existe en tu tabla actual
        habilidades: habilidadesArray,
        validado: true,
        disponible: est.semestre >= 8 ? 'Inmediata' : 'Próximamente'
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
        estudiantes: estudiantes // <-- Los enviamos al frontend
      }
    });
  } catch (error) {
    console.error('Error en getDashboardCompleto:', error);
    return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
  }
};

exports.crearVacante = async (req, res) => {
  try {
    const id_usuario = req.usuario.id_usuario;
    const id_empresa = await Vacante.getIdEmpresaByUsuario(id_usuario);

    if (!id_empresa) {
      return res.status(403).json({ ok: false, mensaje: 'Perfil de empresa no encontrado' });
    }

    const { titulo, categoria, nivel, descripcion, requisitos } = req.body;

    // Validación básica
    if (!titulo || !descripcion) {
      return res.status(400).json({ ok: false, mensaje: 'El título y la descripción son obligatorios' });
    }

    const id_vacante = await Vacante.create({ id_empresa, titulo, categoria, nivel, descripcion, requisitos });

    return res.status(201).json({ 
      ok: true, 
      mensaje: 'Vacante publicada exitosamente', 
      id_vacante 
    });

  } catch (error) {
    console.error('Error al crear vacante:', error);
    return res.status(500).json({ ok: false, mensaje: 'Error al publicar la vacante' });
  }
};

exports.obtenerVacante = async (req, res) => {
  try {
    const { id } = req.params;
    const id_usuario = req.usuario.id_usuario;
    const id_empresa = await Vacante.getIdEmpresaByUsuario(id_usuario);

    const vacante = await Vacante.findById(id, id_empresa);

    if (!vacante) {
      return res.status(404).json({ ok: false, mensaje: 'Vacante no encontrada' });
    }

    // 🟢 NUEVO: Buscamos a los alumnos que se han postulado a esta vacante
    const postulantes = await Vacante.getPostulantesByVacante(id);

    return res.status(200).json({ 
      ok: true, 
      vacante,
      postulantes // 🟢 Enviamos los postulantes al frontend
    });
  } catch (error) {
    console.error('Error al obtener vacante:', error);
    return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
  }
};

exports.actualizarVacante = async (req, res) => {
  try {
    const { id } = req.params;
    const id_usuario = req.usuario.id_usuario;
    const data = req.body; // { titulo, categoria, nivel, descripcion, requisitos, estado }

    const id_empresa = await Vacante.getIdEmpresaByUsuario(id_usuario);
    
    // Validar que la vacante exista y le pertenezca a esta empresa
    const vacanteExistente = await Vacante.findById(id, id_empresa);
    if (!vacanteExistente) {
      return res.status(404).json({ ok: false, mensaje: 'Vacante no encontrada o no tienes permisos' });
    }

    // Combinamos los datos nuevos con los existentes para no borrar nada si mandan campos vacíos
    const datosActualizados = {
      titulo: data.titulo || vacanteExistente.titulo,
      categoria: data.categoria || vacanteExistente.categoria,
      nivel: data.nivel || vacanteExistente.nivel,
      descripcion: data.descripcion || vacanteExistente.descripcion,
      requisitos: data.requisitos || vacanteExistente.requisitos,
      estado: data.estado || vacanteExistente.estado,
    };

    await Vacante.update(id, id_empresa, datosActualizados);

    return res.status(200).json({ ok: true, mensaje: 'Vacante actualizada correctamente' });
  } catch (error) {
    console.error('Error al actualizar vacante:', error);
    return res.status(500).json({ ok: false, mensaje: 'Error interno al actualizar' });
  }
};

exports.eliminarVacante = async (req, res) => {
  try {
    const { id } = req.params;
    const id_usuario = req.usuario.id_usuario;

    const id_empresa = await Vacante.getIdEmpresaByUsuario(id_usuario);
    
    const affectedRows = await Vacante.delete(id, id_empresa);

    if (affectedRows === 0) {
      return res.status(404).json({ ok: false, mensaje: 'Vacante no encontrada o no tienes permisos' });
    }

    return res.status(200).json({ ok: true, mensaje: 'Vacante eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar vacante:', error);
    return res.status(500).json({ ok: false, mensaje: 'Error al eliminar la vacante' });
  }
};