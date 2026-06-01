const db = require('../config/db');

class Admin {
  static async getGlobalStats() {
    // Usamos los nombres exactos de tus tablas: empresas, estudiantes, proyectos, vacantes
    const [empresas] = await db.query('SELECT COUNT(*) as total FROM empresas');
    const [estudiantes] = await db.query('SELECT COUNT(*) as total FROM estudiantes');
    const [proyectos] = await db.query('SELECT COUNT(*) as total FROM proyectos');
    let vacantesTotal = 0;
    try {
      const [vacantes] = await db.query("SELECT COUNT(*) as total FROM vacantes WHERE estado = 'abierta'");
      vacantesTotal = vacantes[0].total;
    } catch (error) {
      vacantesTotal = 0;
    }

    return {
      totalEmpresas: empresas[0].total,
      totalEstudiantes: estudiantes[0].total,
      totalProyectos: proyectos[0].total,
      vacantesActivas: vacantesTotal
    };
  }

 static async getAllEmpresas() {
  const query = `
    SELECT id_empresa as id, razon_social as nombre, giro, contacto, estado 
    FROM empresas 
    ORDER BY razon_social ASC`;
  const [rows] = await db.query(query);
  return rows;
}

  static async getAllAlumnos() {
    const query = `
      SELECT e.id_estudiante as id, CONCAT(u.nombre, ' ', u.apellido) as nombre, e.carrera, e.matricula, e.semestre 
      FROM estudiantes e
      JOIN usuarios u ON e.id_estudiante = u.id_usuario
      ORDER BY u.nombre ASC`;
    const [rows] = await db.query(query);
    return rows;
  }

  static async getAllProyectos() {
    const query = `
      SELECT p.id_proyecto as id, p.titulo, CONCAT(u.nombre, ' ', u.apellido) as autor, p.fecha_registro as fecha, p.estado 
      FROM proyectos p
      JOIN estudiantes e ON p.id_estudiante = e.id_estudiante
      JOIN usuarios u ON e.id_estudiante = u.id_usuario
      ORDER BY p.fecha_registro DESC`;
    const [rows] = await db.query(query);
    return rows;
  }

  static async getAllVacantes() {
    try {
      const query = `
        SELECT v.id_vacante as id, v.titulo, emp.razon_social as empresa, v.nivel, v.estado 
        FROM vacantes v
        JOIN empresas emp ON v.id_empresa = emp.id_empresa
        ORDER BY v.fecha_registro DESC`;
      const [rows] = await db.query(query);
      return rows;
    } catch (error) {
      return [];
    }
  }
}

module.exports = Admin;