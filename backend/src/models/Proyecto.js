const db = require('../config/db');

class Proyecto {
  static async findAllByEstudiante(id_estudiante) {
    const [rows] = await db.query(
      `SELECT *
       FROM proyectos
       WHERE id_estudiante = ?
       ORDER BY fecha_registro DESC, id_proyecto DESC`,
      [id_estudiante]
    );
    return rows;
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
      `SELECT *
       FROM proyectos
       WHERE id_proyecto = ? AND id_estudiante = ?
       LIMIT 1`,
      [id_proyecto, id_estudiante]
    );
    return rows[0];
  }

  static async create({
    id_estudiante,
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
    const [result] = await db.query(
      `INSERT INTO proyectos (
        id_estudiante,
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
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id_estudiante, 
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
      ]
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
           area_trabajo = ?, 
           ambito_desarrollo = ?, 
           es_innovacion = ?, 
           ya_trabaja = ?, 
           competencia_impacto = ?, 
           objetivo = ?, 
           actividades = ?, 
           estado = ?, 
           img_principal = ?, 
           tecnologias = ?
       WHERE id_proyecto = ?`,
      [
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
        tecnologias, 
        id_proyecto
      ]
    );

    return result.affectedRows;
  }

  static async delete(id_proyecto) {
    const [result] = await db.query(
      `DELETE FROM proyectos
       WHERE id_proyecto = ?`,
      [id_proyecto]
    );

    return result.affectedRows;
  }

  static async countByEstudiante(id_estudiante) {
    const [rows] = await db.query(
      `SELECT COUNT(*) AS total
       FROM proyectos
       WHERE id_estudiante = ?`,
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
        p.area_trabajo,
        p.ambito_desarrollo,
        p.es_innovacion,
        p.ya_trabaja,
        p.competencia_impacto,
        p.objetivo,
        p.actividades,
        p.estado,
        p.fecha_registro,
        p.img_principal,
        p.tecnologias,
        e.carrera,
        u.nombre,
        u.apellido
      FROM proyectos p
      INNER JOIN estudiantes e ON p.id_estudiante = e.id_estudiante
      INNER JOIN usuarios u ON e.id_usuario = u.id_usuario
      ORDER BY p.fecha_registro DESC, p.id_proyecto DESC`
    );

    return rows;
  }
}

module.exports = Proyecto;