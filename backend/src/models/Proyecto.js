const db = require('../config/db');

class Proyecto {
  // 🟢 Busca si eres el creador O si estás en la tabla de colaboradores (Estudiante)
  static async findAllByEstudiante(id_estudiante) {
    const [rows] = await db.query(
      `SELECT DISTINCT p.*
       FROM proyectos p
       LEFT JOIN proyecto_colaboradores pc ON p.id_proyecto = pc.id_proyecto
       WHERE p.id_estudiante = ? OR pc.id_estudiante = ?
       ORDER BY p.fecha_registro DESC, p.id_proyecto DESC`,
      [id_estudiante, id_estudiante]
    );
    return rows;
  }

  // 🟢 NUEVO: Busca los proyectos creados por un Profesor
  static async findByProfesor(id_profesor) {
    const [rows] = await db.query(
      `SELECT *
       FROM proyectos 
       WHERE id_profesor = ? 
       ORDER BY fecha_registro DESC`,
      [id_profesor]
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

  // 🟢 Permite acceder al proyecto si eres dueño o colaborador
  static async findByIdAndEstudiante(id_proyecto, id_estudiante) {
    const [rows] = await db.query(
      `SELECT DISTINCT p.*
       FROM proyectos p
       LEFT JOIN proyecto_colaboradores pc ON p.id_proyecto = pc.id_proyecto
       WHERE p.id_proyecto = ? AND (p.id_estudiante = ? OR pc.id_estudiante = ?)
       LIMIT 1`,
      [id_proyecto, id_estudiante, id_estudiante]
    );
    return rows[0];
  }

  // 🟢 ACTUALIZADO: Ahora recibe id_profesor también
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
    const [result] = await db.query(
      `INSERT INTO proyectos (
        id_estudiante,
        id_profesor,
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
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id_estudiante, 
        id_profesor,
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

  // 🟢 NOTA: El Update no necesita recibir ID Estudiante ni Profesor porque no cambia de dueño
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

  // 🟢 Cuenta los proyectos propios y colaborativos del Estudiante
  static async countByEstudiante(id_estudiante) {
    const [rows] = await db.query(
      `SELECT COUNT(DISTINCT p.id_proyecto) AS total
       FROM proyectos p
       LEFT JOIN proyecto_colaboradores pc ON p.id_proyecto = pc.id_proyecto
       WHERE p.id_estudiante = ? OR pc.id_estudiante = ?`,
      [id_estudiante, id_estudiante]
    );
    return rows[0]?.total || 0;
  }

  // 🟢 ACTUALIZADO: Para que muestre proyectos de estudiantes Y profesores en la página principal
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
        
        -- Si hay id_estudiante, trae sus datos. Si no, trae los del profesor.
        COALESCE(u_est.nombre, u_prof.nombre) as nombre,
        COALESCE(u_est.apellido, u_prof.apellido) as apellido,
        
        IFNULL(AVG(c.estrellas), 0) AS promedio_estrellas,
        COUNT(c.id_calificacion) AS total_calificaciones
        
      FROM proyectos p
      
      -- Join para ver si es de estudiante
      LEFT JOIN estudiantes e ON p.id_estudiante = e.id_estudiante
      LEFT JOIN usuarios u_est ON e.id_usuario = u_est.id_usuario
      
      -- Join para ver si es de profesor
      LEFT JOIN profesores pr ON p.id_profesor = pr.id_profesor
      LEFT JOIN usuarios u_prof ON pr.id_usuario = u_prof.id_usuario
      
      LEFT JOIN proyecto_calificaciones c ON p.id_proyecto = c.id_proyecto
      
      GROUP BY p.id_proyecto
      ORDER BY p.fecha_registro DESC, p.id_proyecto DESC`
    );

    return rows;
  }

  // ==========================================
  // 🟢 FUNCIONES PARA COLABORADORES 🟢
  // ==========================================
  static async agregarColaborador(id_proyecto, id_estudiante) {
    const [result] = await db.query(
      `INSERT IGNORE INTO proyecto_colaboradores (id_proyecto, id_estudiante)
       VALUES (?, ?)`,
      [id_proyecto, id_estudiante]
    );
    return result.affectedRows;
  }

  static async obtenerColaboradores(id_proyecto) {
    const [rows] = await db.query(
      `SELECT u.nombre, u.apellido, u.correo, e.matricula
       FROM proyecto_colaboradores pc
       JOIN estudiantes e ON pc.id_estudiante = e.id_estudiante
       JOIN usuarios u ON e.id_usuario = u.id_usuario
       WHERE pc.id_proyecto = ?`,
      [id_proyecto]
    );
    return rows;
  }
}

module.exports = Proyecto;