const db = require('../config/db');

class Estudiante {
  static async create({ id_usuario, matricula, carrera, semestre, competencias = null, conn }) {
    const conexion = conn || db;

    const [result] = await conexion.query(
      `INSERT INTO estudiantes (id_usuario, matricula, carrera, semestre, competencias)
       VALUES (?, ?, ?, ?, ?)`,
      [id_usuario, matricula, carrera, semestre, competencias]
    );

    return result.insertId;
  }

  static async findByUsuarioId(id_usuario) {
    const [rows] = await db.query(
      `SELECT * FROM estudiantes WHERE id_usuario = ? LIMIT 1`,
      [id_usuario]
    );
    return rows[0];
  }

  // 🟢 Traer vacantes abiertas e indicar si el estudiante ya se postuló
  static async getVacantesDisponibles(id_usuario) {
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
      LEFT JOIN estudiantes est ON est.id_usuario = ?
      LEFT JOIN postulaciones p ON p.id_vacante = v.id_vacante AND p.id_estudiante = est.id_estudiante
      WHERE v.estado = 'abierta'
      ORDER BY v.fecha_registro DESC;
    `;
    const [rows] = await db.query(query, [id_usuario]);
    return rows;
  }

  // 🟢 Crear una nueva postulación
  static async postular(id_usuario, id_vacante) {
    // 1. Obtener el id_estudiante usando el id_usuario del token
    const [estudiante] = await db.query('SELECT id_estudiante FROM estudiantes WHERE id_usuario = ? LIMIT 1', [id_usuario]);
    
    if (!estudiante.length) throw new Error("Estudiante no encontrado");
    const id_estudiante = estudiante[0].id_estudiante;

    // 2. Insertar la postulación
    const [result] = await db.query(
      `INSERT INTO postulaciones (id_vacante, id_estudiante, estado) VALUES (?, ?, 'pendiente')`,
      [id_vacante, id_estudiante]
    );
    return result.insertId;
  }

}

module.exports = Estudiante;