const Vacante = require('../models/Vacante');

exports.obtenerPerfilEmpresa = async (req, res) => {
  const id_usuario = req.usuario.id_usuario;

  try {
    const [rows] = await db.query(`
      SELECT 
        u.correo, u.telefono,
        e.id_empresa, e.razon_social, e.giro, e.contacto as responsableRH, e.estado
      FROM usuarios u
      INNER JOIN empresas e ON u.id_usuario = e.id_usuario
      WHERE u.id_usuario = ?
    `, [id_usuario]);

    if (rows.length === 0) {
      return res.status(404).json({ ok: false, mensaje: 'Empresa no encontrada' });
    }

    res.json({ ok: true, empresa: rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, mensaje: 'Error al obtener perfil' });
  }
};


exports.getDashboardCompleto = async (req, res) => {
  try {
    const id_usuario_empresa = req.usuario.id_usuario; 
    
    // 🟢 Ejecutamos las 3 consultas al mismo tiempo
    const [metricas, vacantes, estudiantesDB] = await Promise.all([
      Vacante.getMetricasDashboard(id_usuario_empresa),
      Vacante.getVacantesEmpresa(id_usuario_empresa),
      Vacante.getEstudiantesDestacados() // <-- Consulta para alumnos destacados
    ]);

    // 🟢 Formateamos los estudiantes asegurando que el ID sea el de USUARIO
    const estudiantes = estudiantesDB.map(est => {
      // Convertimos las competencias "React, Node, SQL" en un array
      const habilidadesArray = est.competencias 
        ? est.competencias.split(',').map(s => s.trim()).filter(Boolean) 
        : ['Sin definir'];

      return {
        // 🚨 IMPORTANTE: Usamos id_usuario para que el link en el front no se confunda
        id_usuario: est.id_usuario, 
        id_estudiante: est.id, // Guardamos este por si acaso, pero no para navegar
        nombre: est.nombre,
        carrera: est.carrera || 'Sin especificar',
        habilidades: habilidadesArray,
        validado: true,
        // Si el semestre es >= 8 está disponible inmediatamente
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
        estudiantes: estudiantes // <-- Enviados con el ID de usuario correcto
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

    // Buscamos a los alumnos que se han postulado
    // 💡 Asegúrate que el modelo devuelva id_usuario en cada postulante
    const postulantes = await Vacante.getPostulantesByVacante(id);

    return res.status(200).json({ 
      ok: true, 
      vacante,
      postulantes 
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
    const data = req.body;

    const id_empresa = await Vacante.getIdEmpresaByUsuario(id_usuario);
    
    const vacanteExistente = await Vacante.findById(id, id_empresa);
    if (!vacanteExistente) {
      return res.status(404).json({ ok: false, mensaje: 'Vacante no encontrada o no tienes permisos' });
    }

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