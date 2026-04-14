const Admin = require('../models/Admin');
const db = require('../config/db');
const HorarioProfesor = require('../models/HorarioProfesor');
exports.obtenerProfesoresParaSelect = async (req, res) => {
  try {
    const [profesores] = await db.query(`
      SELECT p.id_profesor, u.nombre, u.apellido
      FROM profesores p
      JOIN usuarios u ON p.id_usuario = u.id_usuario
      WHERE u.id_rol = 4
      ORDER BY u.nombre ASC
    `);
    res.status(200).json({ ok: true, profesores });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, mensaje: 'Error al cargar profesores' });
  }
};

// 2. Listar todos los horarios
exports.listarHorarios = async (req, res) => {
  try {
    const horarios = await HorarioProfesor.findAll();
    res.status(200).json({ ok: true, horarios });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, mensaje: 'Error al listar horarios' });
  }
};

// 3. Subir un nuevo horario
exports.subirHorario = async (req, res) => {
  try {
    const { id_profesor, titulo, descripcion } = req.body;
    const ruta_pdf = req.file ? req.file.path : null;

    if (!id_profesor || !titulo || !ruta_pdf) {
      return res.status(400).json({ ok: false, mensaje: 'Profesor, título y archivo PDF son obligatorios' });
    }

    const id = await HorarioProfesor.create({ id_profesor, titulo, descripcion, ruta_pdf });
    res.status(201).json({ ok: true, mensaje: 'Horario subido exitosamente', id_horario: id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, mensaje: 'Error al subir horario' });
  }
};

// 4. Eliminar horario
exports.eliminarHorario = async (req, res) => {
  try {
    const { id } = req.params;
    await HorarioProfesor.delete(id);
    res.status(200).json({ ok: true, mensaje: 'Horario eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, mensaje: 'Error al eliminar horario' });
  }
};

exports.getAdminDashboard = async (req, res) => {
  try {
    // Ejecutamos todas las consultas en paralelo para mejorar el rendimiento
    const [stats, empresas, alumnos, proyectos, vacantes] = await Promise.all([
      Admin.getGlobalStats(),
      Admin.getAllEmpresas(),
      Admin.getAllAlumnos(),
      Admin.getAllProyectos(),
      Admin.getAllVacantes()
    ]);

    res.status(200).json({
      ok: true,
      data: {
        stats,
        empresas,
        alumnos,
        proyectos,
        vacantes
      }
    });
  } catch (error) {
    console.error('Error en Admin Dashboard:', error);
    res.status(500).json({ 
      ok: false, 
      mensaje: 'Error al cargar los datos administrativos desde el servidor' 
    });
  }
};


exports.toggleEstadoEmpresa = async (req, res) => {
  const { id } = req.params;
  const { nuevoEstado } = req.body; // Se espera 'habilitada' o 'deshabilitada'

  // Validar que el estado sea uno de los permitidos
  if (!['habilitada', 'deshabilitada'].includes(nuevoEstado)) {
    return res.status(400).json({ 
      ok: false, 
      mensaje: 'Estado no válido' 
    });
  }

  try {
    // Actualizamos la columna 'estado' en la tabla empresas
    const [result] = await db.query(
      'UPDATE empresas SET estado = ? WHERE id_empresa = ?', 
      [nuevoEstado, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        ok: false, 
        mensaje: 'Empresa no encontrada' 
      });
    }

    res.status(200).json({ 
      ok: true, 
      mensaje: `La empresa ha sido ${nuevoEstado} correctamente` 
    });
  } catch (error) {
    console.error('Error al cambiar estado de empresa:', error);
    res.status(500).json({ 
      ok: false, 
      mensaje: 'Error interno al actualizar el estado' 
    });
  }
};

