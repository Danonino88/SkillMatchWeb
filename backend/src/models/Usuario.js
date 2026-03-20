const db = require('../config/db');

class Usuario {
  static async findByCorreo(correo) {
    const [rows] = await db.query(
      'SELECT * FROM usuarios WHERE correo = ? LIMIT 1',
      [correo]
    );
    return rows[0];
  }

  static async findById(id_usuario) {
    const [rows] = await db.query(
      'SELECT id_usuario, nombre, apellido, correo, id_rol, estado FROM usuarios WHERE id_usuario = ? LIMIT 1',
      [id_usuario]
    );
    return rows[0];
  }

  static async create({ nombre, apellido, correo, password_hash, id_rol }) {
    const [result] = await db.query(
      `INSERT INTO usuarios (nombre, apellido, correo, password_hash, id_rol, estado)
       VALUES (?, ?, ?, ?, ?, 'activo')`,
      [nombre, apellido, correo, password_hash, id_rol]
    );

    return result.insertId;
  }
}

module.exports = Usuario;