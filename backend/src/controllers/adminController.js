const Admin = require('../models/Admin');
const db = require('../config/db');

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

