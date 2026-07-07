const db = require('../config/db');

class Proyecto {
  static async findAllByEstudiante(id_estudiante) {
    const [rows] = await db.query(
      `SELECT p.*
       FROM proyectos p
       WHERE p.id_estudiante = ?
       ORDER BY p.fecha_registro DESC, p.id_proyecto DESC`,
      [id_estudiante]
    );
    return rows;
  }

  static async findByProfesor(id_profesor) {
    return [];
  }

  static async findById(id_proyecto) {
    const [rows] = await db.query(
      `SELECT *
       FROM proyectos
       WHERE id_proyecto = ?
       LIMIT 1`,
      [id_proyecto]
    );
    return rows[0];
  }

  static async findByIdAndEstudiante(id_proyecto, id_estudiante) {
    const [rows] = await db.query(
      `SELECT p.*
       FROM proyectos p
       WHERE p.id_proyecto = ? AND p.id_estudiante = ?
       LIMIT 1`,
      [id_proyecto, id_estudiante]
    );
    return rows[0];
  }

  static async create({
    id_estudiante = null,
    id_profesor = null,
    titulo,
    descripcion = null,
    area_trabajo = null,
    ambito_desarrollo = null,
    es_innovacion = 0,
    ya_trabaja = 0,
    competencia_impacto = null,
    objetivo = null,
    actividades = null,
    estado = 'en progreso',
    img_principal = null,
    tecnologias = null
  }) {
    if (!id_estudiante) {
      throw new Error('La base local solo soporta proyectos de estudiante');
    }

    const [result] = await db.query(
      `INSERT INTO proyectos (
        id_estudiante,
        titulo,
        descripcion,
        fecha_registro,
        estado
      )
      VALUES (?, ?, ?, CURDATE(), ?)`,
      [id_estudiante, titulo, descripcion, estado]
    );

    return result.insertId;
  }

  static async update(id_proyecto, {
    titulo,
    descripcion,
    area_trabajo,
    ambito_desarrollo,
    es_innovacion,
    ya_trabaja,
    competencia_impacto,
    objetivo,
    actividades,
    estado,
    img_principal,
    tecnologias
  }) {
    const [result] = await db.query(
      `UPDATE proyectos
       SET titulo = ?, 
           descripcion = ?, 
           fecha_registro = COALESCE(fecha_registro, CURDATE()),
           estado = ?
       WHERE id_proyecto = ?`,
      [titulo, descripcion, estado, id_proyecto]
    );

    return result.affectedRows;
  }

  static async delete(id_proyecto) {
    // Borra dependencias con FK antes de eliminar el proyecto.
    await db.query(
      `DELETE FROM calificaciones WHERE id_proyecto = ?`,
      [id_proyecto]
    );

    await db.query(
      `DELETE FROM evidencias WHERE id_proyecto = ?`,
      [id_proyecto]
    );

    const [result] = await db.query(
      `DELETE FROM proyectos
       WHERE id_proyecto = ?`,
      [id_proyecto]
    );

    return result.affectedRows;
  }

  static async countByEstudiante(id_estudiante) {
    const [rows] = await db.query(
      `SELECT COUNT(p.id_proyecto) AS total
       FROM proyectos p
       WHERE p.id_estudiante = ?`,
      [id_estudiante]
    );
    return rows[0]?.total || 0;
  }

  static async findPublicProjects() {
    const [rows] = await db.query(
      `SELECT
        p.id_proyecto,
        p.titulo,
        p.descripcion,
        p.estado,
        p.fecha_registro,
        e.carrera,
        u.nombre AS nombre,
        u.apellido AS apellido,
        IFNULL(AVG(c.puntaje), 0) AS promedio_estrellas,
        COUNT(c.id_calificacion) AS total_calificaciones
      FROM proyectos p
      LEFT JOIN estudiantes e ON p.id_estudiante = e.id_estudiante
      LEFT JOIN usuarios u ON e.id_estudiante = u.id_usuario
      LEFT JOIN calificaciones c ON p.id_proyecto = c.id_proyecto
      GROUP BY p.id_proyecto
      ORDER BY p.fecha_registro DESC, p.id_proyecto DESC`
    );

    return rows;
  }

  static async agregarColaborador(id_proyecto, id_estudiante) {
    return 0;
  }

  static async obtenerColaboradores(id_proyecto) {
    return [];
  }
}

module.exports = Proyecto;