// models/Empresa.js
class Empresa {
  static async create({ id_usuario, razon_social, giro, contacto, conn }) {
    const [result] = await conn.query(
      `INSERT INTO empresas (id_empresa, razon_social, giro, contacto)
       VALUES (?, ?, ?, ?)`,
      [id_usuario, razon_social, giro, contacto]
    );

    return result.insertId;
  }
}

module.exports = Empresa;