const db = require('../config/db'); 
const Vacante = require('../models/Vacante');
const createTransporter = require('../utils/mailer'); // 👈 Importamos nuestro nuevo mailer con OAuth2

// ==========================================
// OBTENER INFORMACIÓN DEL PERFIL DE LA EMPRESA
// ==========================================
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

    const empresaInfo = {
      ...rows[0],
      rfc: rows[0].rfc || 'No registrado',
      direccion: rows[0].direccion || 'No registrada',
      folioAprobacion: 'UTEQ-EMP-' + rows[0].id_empresa,
      anioFundacion: '2026',
      industria: rows[0].giro || 'Software', 
      sitioWeb: 'www.uteq.edu.mx'
    };

    res.json({ ok: true, empresa: empresaInfo });
  } catch (error) {
    console.error("Error en obtenerPerfilEmpresa:", error);
    res.status(500).json({ ok: false, mensaje: 'Error al obtener perfil' });
  }
};

// ==========================================
// ACEPTAR POSTULANTE Y ENVIAR CORREO (CON GOOGLE OAUTH2)
// ==========================================
exports.aceptarPostulante = async (req, res) => {
  const { id_postulacion } = req.params;

  try {
    // 1. Obtener datos combinando postulaciones, estudiantes, usuarios, vacantes y empresas
    const [datos] = await db.query(`
      SELECT 
        u.nombre AS alumno_nombre, 
        u.correo AS alumno_correo,
        v.titulo AS vacante_titulo,
        emp.razon_social AS empresa_nombre
      FROM postulaciones p
      JOIN estudiantes est ON p.id_estudiante = est.id_estudiante
      JOIN usuarios u ON est.id_usuario = u.id_usuario
      JOIN vacantes v ON p.id_vacante = v.id_vacante
      JOIN empresas emp ON v.id_empresa = emp.id_empresa
      WHERE p.id_postulacion = ?
    `, [id_postulacion]);

    if (datos.length === 0) {
      return res.status(404).json({ ok: false, mensaje: 'Postulación no encontrada' });
    }

    const info = datos[0];

    // 2. Actualizar estado en la BD
    await db.query('UPDATE postulaciones SET estado = "aceptado" WHERE id_postulacion = ?', [id_postulacion]);

    // 3. Configuración del correo
    const mailOptions = {
      from: '"SkillMatch UTEQ" <skillmatchofficial@gmail.com>', 
      to: info.alumno_correo, 
      subject: '¡Felicidades! Tu postulación ha sido aceptada',
      html: `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; border: 1px solid #eee; padding: 20px; border-radius: 12px;">
          <h2 style="color: #244E7C;">¡Hola, ${info.alumno_nombre}!</h2>
          <p style="font-size: 16px;">La empresa <strong>${info.empresa_nombre}</strong> ha aceptado tu postulación para la vacante:</p>
          <div style="background: #f0f4f8; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; border: 1px solid #d1d5db;">
            <h3 style="margin: 0; color: #1e293b;">${info.vacante_titulo}</h3>
          </div>
          <p style="font-size: 15px;">La empresa pronto se pondrá en contacto contigo para darte los detalles del siguiente paso.</p>
          <p style="font-weight: bold; color: #166534;">¡Mucho éxito en esta nueva etapa!</p>
          <br><hr style="border: 0; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #94a3b8; text-align: center;">SkillMatch UTEQ - Portal de Talento</p>
        </div>
      `
    };

    // 4. Enviar correo usando OAuth2
    try {
      const transporter = await createTransporter();
      await transporter.sendMail(mailOptions);
      console.log("✅ Correo enviado exitosamente a:", info.alumno_correo);
    } catch (errorCorreo) {
      console.error("❌ Error al enviar correo con OAuth2:", errorCorreo);
    }

    res.json({ ok: true, mensaje: 'Alumno aceptado y correo enviado' });

  } catch (error) {
    console.error("Error en aceptarPostulante:", error);
    res.status(500).json({ ok: false, mensaje: 'Error al procesar: ' + error.message });
  }
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
  try {
    const id_usuario = req.usuario.id_usuario;
    const id_empresa = await Vacante.getIdEmpresaByUsuario(id_usuario);
    if (!id_empresa) return res.status(403).json({ ok: false, mensaje: 'Perfil no encontrado' });

    const { titulo, categoria, nivel, descripcion, requisitos } = req.body;
    if (!titulo || !descripcion) return res.status(400).json({ ok: false, mensaje: 'Título y descripción obligatorios' });

    const id_vacante = await Vacante.create({ id_empresa, titulo, categoria, nivel, descripcion, requisitos });
    res.status(201).json({ ok: true, mensaje: 'Vacante publicada', id_vacante });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al publicar' });
  }
};

exports.obtenerVacante = async (req, res) => {
  try {
    const { id } = req.params;
    const id_usuario = req.usuario.id_usuario;
    const id_empresa = await Vacante.getIdEmpresaByUsuario(id_usuario);
    const vacante = await Vacante.findById(id, id_empresa);

    if (!vacante) return res.status(404).json({ ok: false, mensaje: 'No encontrada' });
    const postulantes = await Vacante.getPostulantesByVacante(id);

    res.status(200).json({ ok: true, vacante, postulantes });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error interno' });
  }
};

exports.actualizarVacante = async (req, res) => {
  try {
    const { id } = req.params;
    const id_usuario = req.usuario.id_usuario;
    const id_empresa = await Vacante.getIdEmpresaByUsuario(id_usuario);
    const vacanteExistente = await Vacante.findById(id, id_empresa);

    if (!vacanteExistente) return res.status(404).json({ ok: false, mensaje: 'No permitida' });

    const data = req.body;
    const datosActualizados = {
      titulo: data.titulo || vacanteExistente.titulo,
      categoria: data.categoria || vacanteExistente.categoria,
      nivel: data.nivel || vacanteExistente.nivel,
      descripcion: data.descripcion || vacanteExistente.descripcion,
      requisitos: data.requisitos || vacanteExistente.requisitos,
      estado: data.estado || vacanteExistente.estado,
    };

    await Vacante.update(id, id_empresa, datosActualizados);
    res.status(200).json({ ok: true, mensaje: 'Actualizada' });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al actualizar' });
  }
};

exports.eliminarVacante = async (req, res) => {
  try {
    const { id } = req.params;
    const id_usuario = req.usuario.id_usuario;
    const id_empresa = await Vacante.getIdEmpresaByUsuario(id_usuario);
    const affectedRows = await Vacante.delete(id, id_empresa);

    if (affectedRows === 0) return res.status(404).json({ ok: false, mensaje: 'No encontrada' });
    res.status(200).json({ ok: true, mensaje: 'Eliminada' });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al eliminar' });
  }
};