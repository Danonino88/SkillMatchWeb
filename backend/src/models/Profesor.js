const db = require('../config/db');

const Profesor = {
  create: async ({ id_usuario, departamento, asignaturas, conn }) => {
    const query = `
      INSERT INTO profesores (id_usuario, departamento, asignaturas) 
      VALUES (?, ?, ?)
    `;
    // Usamos 'conn' para que sea parte de la transacción del registro
    const [result] = await conn.query(query, [
      id_usuario,
      departamento || null,
      asignaturas || null
    ]);
    return result.insertId;
  }
};

module.exports = Profesor;