const db = require('../config/db');

class Estudiante {
  static async create({ id_usuario, matricula, carrera, semestre, competencias = null, fecha_inicio_carrera = null, conn }) {
    const conexion = conn || db;

    const [result] = await conexion.query(
      `INSERT INTO estudiantes (
        id_estudiante, matricula, carrera, semestre, competencias,
        cuatrimestre_inicial, fecha_inicio_carrera, estado_academico
      )
       VALUES (?, ?, ?, ?, ?, ?, COALESCE(?, CURRENT_DATE), 'activo')`,
      [id_usuario, matricula, carrera, semestre, competencias, semestre, fecha_inicio_carrera]
    );

    return result.insertId || id_usuario;
  }

  static async findByUsuarioId(id_usuario) {
    const [rows] = await db.query(
      `SELECT * FROM estudiantes WHERE id_estudiante = ? LIMIT 1`,
      [id_usuario]
    );
    return rows[0];
  }

  // Traer vacantes abiertas e indicar si el estudiante ya se postuló
  static async getVacantesDisponibles(id_usuario) {
    try {
      const query = `
        SELECT 
          v.id_vacante, 
          v.titulo, 
          v.categoria, 
          v.nivel, 
          v.descripcion, 
          v.fecha_registro,
          emp.razon_social AS empresa,
          p.estado AS estado_postulacion
        FROM vacantes v
        JOIN empresas emp ON v.id_empresa = emp.id_empresa
        LEFT JOIN estudiantes est ON est.id_estudiante = ?
        LEFT JOIN postulaciones p ON p.id_vacante = v.id_vacante AND p.id_estudiante = est.id_estudiante
        WHERE v.estado = 'abierta' AND emp.estado = 'habilitada'
        ORDER BY v.fecha_registro DESC;
      `;
      const [rows] = await db.query(query, [id_usuario]);
      return rows;
    } catch (error) {
      if (['ER_NO_SUCH_TABLE', 'ER_BAD_FIELD_ERROR', '42P01', '42703'].includes(error.code) || ['ER_NO_SUCH_TABLE', 'ER_BAD_FIELD_ERROR'].includes(error.mysqlCode)) {
        return [];
      }
      throw error;
    }
  }

  // Crear una nueva postulación
  static async postular(id_usuario, id_vacante) {
    const [estudiante] = await db.query('SELECT id_estudiante FROM estudiantes WHERE id_estudiante = ? LIMIT 1', [id_usuario]);
    
    if (!estudiante.length) throw new Error('Estudiante no encontrado');
    const id_estudiante = estudiante[0].id_estudiante;

    const [result] = await db.query(
      `INSERT INTO postulaciones (id_vacante, id_estudiante, estado) VALUES (?, ?, 'pendiente')`,
      [id_vacante, id_estudiante]
    );
    return result.insertId;
  }
}

module.exports = Estudiante;
