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
}

module.exports = Estudiante;