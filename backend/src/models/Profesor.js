const db = require('../config/db');

const Profesor = {
  create: async ({ id_usuario, departamento, asignaturas, conn }) => {
    const connection = conn || db;
    const query = `
      INSERT INTO profesores (id_profesor, departamento, asignaturas)
      VALUES (?, ?, ?)
    `;
    const [result] = await connection.query(query, [
      id_usuario,
      departamento || null,
      asignaturas || null
    ]);

    return result.insertId || id_usuario;
  }
};

module.exports = Profesor;
