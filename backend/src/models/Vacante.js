const db = require('../config/db');

class Vacante {

  static async getEstudiantesParaMatch() {
    try {
      const [rows] = await db.query(`
        SELECT 
          e.id_estudiante, 
          e.id_estudiante AS id_usuario, 
          u.nombre, 
          e.carrera, 
          e.semestre, 
          e.competencias,
          '' AS tecnologias_proyectos
        FROM estudiantes e
        JOIN usuarios u ON e.id_estudiante = u.id_usuario
        WHERE u.estado = 'activo'
        ORDER BY e.semestre DESC
      `);
      return rows;
    } catch (error) {
      return [];
    }
  }

  static async getPostulantesByVacante(id_vacante) {
    return [];
}

  static async getMetricasDashboard(id_usuario) {
    return { vacantes_activas: 0, postulaciones_totales: 0, candidatos_revisados: 0, contrataciones: 0 };
  }

  static async getVacantesEmpresa(id_usuario) {
    return [];
  }

  static async getIdEmpresaByUsuario(id_usuario) {
    const [rows] = await db.query('SELECT id_empresa FROM empresas WHERE id_empresa = ? LIMIT 1', [id_usuario]);
    return rows[0] ? rows[0].id_empresa : null;
  }

  static async getEstudiantesDestacados() {
    try {
      const query = `
        SELECT 
          u.id_usuario,
          e.id_estudiante AS id, 
          CONCAT(u.nombre, ' ', u.apellido) AS nombre, 
          e.carrera, 
          e.semestre,
          e.competencias
        FROM estudiantes e
        JOIN usuarios u ON e.id_estudiante = u.id_usuario
        WHERE u.estado = 'activo'
        ORDER BY e.id_estudiante DESC;
      `;
      const [rows] = await db.query(query);
      return rows;
    } catch (error) {
      return [];
    }
  }

  static async create({ id_empresa, titulo, categoria, nivel, descripcion, requisitos }) {
    return 0;
  }

  static async findById(id_vacante, id_empresa) {
    return null;
  }

  static async update(id_vacante, id_empresa, { titulo, categoria, nivel, descripcion, requisitos, estado }) {
    return 0;
  }

  static async delete(id_vacante, id_empresa) {
    return 0;
  }
}

module.exports = Vacante;