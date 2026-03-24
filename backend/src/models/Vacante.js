const db = require('../config/db');

class Vacante {
  // --------------------------------------------------------
  // MÉTODOS DEL DASHBOARD (Los que vimos en el paso anterior)
  // --------------------------------------------------------
  static async getMetricasDashboard(id_usuario) {
    const query = `
      SELECT
        COUNT(DISTINCT CASE WHEN v.estado = 'abierta' THEN v.id_vacante END) AS vacantes_activas,
        COUNT(p.id_postulacion) AS postulaciones_totales,
        COUNT(CASE WHEN p.estado != 'pendiente' THEN p.id_postulacion END) AS candidatos_revisados,
        COUNT(CASE WHEN p.estado = 'aceptado' THEN p.id_postulacion END) AS contrataciones
      FROM empresas e
      LEFT JOIN vacantes v ON e.id_empresa = v.id_empresa
      LEFT JOIN postulaciones p ON v.id_vacante = p.id_vacante
      WHERE e.id_usuario = ?;
    `;
    const [rows] = await db.query(query, [id_usuario]);
    return rows[0];
  }

  static async getVacantesEmpresa(id_usuario) {
    const query = `
      SELECT 
        v.id_vacante, v.titulo, v.categoria, v.nivel, v.estado, v.fecha_registro,
        COUNT(p.id_postulacion) AS total_postulaciones
      FROM empresas e
      JOIN vacantes v ON e.id_empresa = v.id_empresa
      LEFT JOIN postulaciones p ON v.id_vacante = p.id_vacante
      WHERE e.id_usuario = ?
      GROUP BY v.id_vacante
      ORDER BY v.fecha_registro DESC;
    `;
    const [rows] = await db.query(query, [id_usuario]);
    return rows;
  }

  // --------------------------------------------------------
  // MÉTODOS DEL CRUD
  // --------------------------------------------------------

  // Helper para obtener el id_empresa a partir del token (id_usuario)
  static async getIdEmpresaByUsuario(id_usuario) {
    const [rows] = await db.query('SELECT id_empresa FROM empresas WHERE id_usuario = ? LIMIT 1', [id_usuario]);
    return rows[0] ? rows[0].id_empresa : null;
  }



  // Obtener estudiantes destacados (los últimos 4 registrados)
  static async getEstudiantesDestacados() {
    const query = `
      SELECT 
        e.id_estudiante AS id, 
        CONCAT(u.nombre, ' ', u.apellido) AS nombre, 
        e.carrera, 
        e.semestre,
        e.competencias
      FROM estudiantes e
      JOIN usuarios u ON e.id_usuario = u.id_usuario
      WHERE u.estado = 'activo'
      ORDER BY e.id_estudiante DESC;
    `;
    const [rows] = await db.query(query);
    return rows;
  }

  // CREATE
  static async create({ id_empresa, titulo, categoria, nivel, descripcion, requisitos }) {
    const [result] = await db.query(
      `INSERT INTO vacantes (id_empresa, titulo, categoria, nivel, descripcion, requisitos, estado)
       VALUES (?, ?, ?, ?, ?, ?, 'abierta')`,
      [id_empresa, titulo, categoria, nivel, descripcion, requisitos]
    );
    return result.insertId;
  }

  // READ (Obtener UNA vacante para el formulario de edición)
  static async findById(id_vacante, id_empresa) {
    const [rows] = await db.query(
      'SELECT * FROM vacantes WHERE id_vacante = ? AND id_empresa = ? LIMIT 1',
      [id_vacante, id_empresa]
    );
    return rows[0];
  }

  // UPDATE
  static async update(id_vacante, id_empresa, { titulo, categoria, nivel, descripcion, requisitos, estado }) {
    const [result] = await db.query(
      `UPDATE vacantes 
       SET titulo = ?, categoria = ?, nivel = ?, descripcion = ?, requisitos = ?, estado = ?
       WHERE id_vacante = ? AND id_empresa = ?`,
      [titulo, categoria, nivel, descripcion, requisitos, estado, id_vacante, id_empresa]
    );
    return result.affectedRows;
  }

  // DELETE
  static async delete(id_vacante, id_empresa) {
    const [result] = await db.query(
      'DELETE FROM vacantes WHERE id_vacante = ? AND id_empresa = ?',
      [id_vacante, id_empresa]
    );
    return result.affectedRows;
  }
}

module.exports = Vacante;