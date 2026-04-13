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
    // 🟢 Agregamos el campo 'telefono' en la consulta para que lo devuelva completo
    const [rows] = await db.query(
      'SELECT id_usuario, nombre, apellido, correo, telefono, id_rol, estado FROM usuarios WHERE id_usuario = ? LIMIT 1',
      [id_usuario]
    );
    return rows[0];
  }

  // 🟢 Agregamos 'telefono' y 'conn' (para soportar las transacciones del controlador de forma segura)
  static async create({ nombre, apellido, correo, password_hash, telefono, id_rol, conn }) {
    // Si viene la conexión de la transacción la usamos, si no, usamos la de por defecto
    const connection = conn || db;

    const [result] = await connection.query(
      `INSERT INTO usuarios (nombre, apellido, correo, password_hash, telefono, id_rol, estado)
       VALUES (?, ?, ?, ?, ?, ?, 'activo')`,
      [nombre, apellido, correo, password_hash, telefono || null, id_rol]
    );

    return result.insertId;
  }
}

module.exports = Usuario;