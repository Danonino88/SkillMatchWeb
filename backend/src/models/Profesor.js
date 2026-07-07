const db = require('../config/db');

const Profesor = {
  create: async ({ id_usuario, departamento, asignaturas, conn }) => {
    const query = `
      INSERT INTO profesores (id_profesor, departamento, asignaturas) 
      VALUES (?, ?, ?)
    `;
    const [result] = await conn.query(query, [
      id_usuario,
      departamento || null,
      asignaturas || null
    ]);
    return result.insertId;
  }
};

module.exports = Profesor;