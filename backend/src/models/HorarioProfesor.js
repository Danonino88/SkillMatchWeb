const db = require('../config/db');

class HorarioProfesor {
  // Obtener todos los horarios con el nombre del profesor
  static async findAll() {
    const [rows] = await db.query(`
      SELECT h.*, u.nombre, u.apellido
      FROM horarios_profesores h
      JOIN profesores p ON h.id_profesor = p.id_profesor
      JOIN usuarios u ON p.id_profesor = u.id_usuario
      ORDER BY h.fecha_subida DESC
    `);
    return rows;
  }

  static async create({ id_profesor, titulo, descripcion, ruta_pdf }) {
    const [result] = await db.query(
      `INSERT INTO horarios_profesores (id_profesor, titulo, descripcion, ruta_pdf)
       VALUES (?, ?, ?, ?)`,
      [id_profesor, titulo, descripcion, ruta_pdf]
    );
    return result.insertId;
  }

  static async delete(id_horario) {
    const [result] = await db.query(
      `DELETE FROM horarios_profesores WHERE id_horario = ?`,
      [id_horario]
    );
    return result.affectedRows;
  }
}

module.exports = HorarioProfesor;