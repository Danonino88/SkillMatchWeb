const db = require('../config/db'); // 👈 ESTO ES LO QUE FALTABA
const Vacante = require('../models/Vacante');

// 🟢 OBTENER INFORMACIÓN DEL PERFIL DE LA EMPRESA
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

    // Formateamos un poco la respuesta para asegurar que el front la lea bien
    const empresaInfo = {
      ...rows[0],
      rfc: rows[0].rfc || 'No registrado', // Por si acaso agregas la columna luego
      direccion: rows[0].direccion || 'No registrada',
      folioAprobacion: 'UTEQ-EMP-' + rows[0].id_empresa,
      anioFundacion: '2026', // Simulados por ahora
      industria: 'Software', 
      sitioWeb: 'www.uteq.edu.mx'
    };

    res.json({ ok: true, empresa: empresaInfo });
  } catch (error) {
    console.error("Error en obtenerPerfilEmpresa:", error);
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
      Vacante.getEstudiantesDestacados() 
    ]);

    const estudiantes = estudiantesDB.map(est => {
      const habilidadesArray = est.competencias 
        ? est.competencias.split(',').map(s => s.trim()).filter(Boolean) 
        : ['Sin definir'];

      return {
        id_usuario: est.id_usuario, 
        id_estudiante: est.id,
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



const mailer = require('../utils/mailer');

exports.aceptarPostulante = async (req, res) => {
  const { id_postulacion } = req.params;
  console.log("🚀 Iniciando proceso de aceptación para postulación ID:", id_postulacion);

  try {
    const [datos] = await db.query(`
      SELECT 
        u.nombre AS alumno_nombre, u.correo AS alumno_correo,
        v.titulo AS vacante_titulo,
        emp.razon_social AS empresa_nombre
      FROM postulaciones p
      JOIN estudiantes est ON p.id_student = est.id_estudiante -- ⚠️ OJO: Verifica si tu columna es id_student o id_estudiante
      JOIN usuarios u ON est.id_usuario = u.id_usuario
      JOIN vacantes v ON p.id_vacante = v.id_vacante
      JOIN empresas emp ON v.id_empresa = emp.id_empresa
      WHERE p.id_postulacion = ?
    `, [id_postulacion]);

    if (datos.length === 0) {
      console.log("❌ No se encontraron datos para la postulación:", id_postulacion);
      return res.status(404).json({ ok: false, mensaje: 'Postulación no encontrada' });
    }

    const info = datos[0];
    console.log("📧 Intentando enviar correo a:", info.alumno_correo);

    await db.query('UPDATE postulaciones SET estado = "aceptado" WHERE id_postulacion = ?', [id_postulacion]);
    console.log("✅ Base de datos actualizada a 'aceptado'");

    const mailOptions = {
      from: '"SkillMatch UTEQ" <tu_correo@gmail.com>',
      to: info.alumno_correo,
      subject: '¡Buenas noticias! Tu postulación ha sido aceptada',
      html: `<h1>Hola ${info.alumno_nombre}...</h1>` // Simplificado para la prueba
    };

    // USAMOS EL AWAIT PARA CAPTURAR EL ERROR DEL MAIL
    const infoMail = await mailer.sendMail(mailOptions);
    console.log("✉️ Correo enviado con éxito! ID:", infoMail.messageId);

    res.json({ ok: true, mensaje: 'Aceptado y correo enviado' });

  } catch (error) {
    console.error("🔥 ERROR CRÍTICO:", error);
    res.status(500).json({ ok: false, mensaje: 'Error: ' + error.message });
  }
};


