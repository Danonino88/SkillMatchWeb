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
    return this.attachMedia(rows);
  }

  static async findByProfesor(id_profesor) {
    const [rows] = await db.query(
      `SELECT p.*
       FROM proyectos p
       WHERE p.id_profesor = ?
       ORDER BY p.fecha_registro DESC, p.id_proyecto DESC`,
      [id_profesor]
    );
    return this.attachMedia(rows);
  }

  static async findById(id_proyecto) {
    const [rows] = await db.query(
      `SELECT *
       FROM proyectos
       WHERE id_proyecto = ?
       LIMIT 1`,
      [id_proyecto]
    );
    if (!rows[0]) return null;
    const media = await this.getMedia(id_proyecto);
    return { ...rows[0], media };
  }

  static async findByIdAndEstudiante(id_proyecto, id_estudiante) {
    const [rows] = await db.query(
      `SELECT p.*
       FROM proyectos p
       WHERE p.id_proyecto = ? AND p.id_estudiante = ?
       LIMIT 1`,
      [id_proyecto, id_estudiante]
    );
    if (!rows[0]) return null;
    const media = await this.getMedia(id_proyecto);
    return { ...rows[0], media };
  }

  static normalizeBoolean(value) {
    return value === true || value === 1 || value === '1' || value === 'true' || value === 'on';
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
    const [result] = await db.query(
      `INSERT INTO proyectos (
        id_estudiante,
        id_profesor,
        titulo,
        descripcion,
        fecha_registro,
        estado,
        area_trabajo,
        ambito_desarrollo,
        es_innovacion,
        ya_trabaja,
        competencia_impacto,
        objetivo,
        actividades,
        img_principal,
        tecnologias
      )
      VALUES (?, ?, ?, ?, CURRENT_DATE, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id_estudiante,
        id_profesor,
        titulo,
        descripcion,
        estado,
        area_trabajo,
        ambito_desarrollo,
        this.normalizeBoolean(es_innovacion) ? 1 : 0,
        this.normalizeBoolean(ya_trabaja) ? 1 : 0,
        competencia_impacto,
        objetivo,
        actividades,
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
           fecha_registro = COALESCE(fecha_registro, CURRENT_DATE),
           estado = ?,
           area_trabajo = ?,
           ambito_desarrollo = ?,
           es_innovacion = ?,
           ya_trabaja = ?,
           competencia_impacto = ?,
           objetivo = ?,
           actividades = ?,
           img_principal = ?,
           tecnologias = ?
       WHERE id_proyecto = ?`,
      [
        titulo,
        descripcion,
        estado,
        area_trabajo,
        ambito_desarrollo,
        this.normalizeBoolean(es_innovacion) ? 1 : 0,
        this.normalizeBoolean(ya_trabaja) ? 1 : 0,
        competencia_impacto,
        objetivo,
        actividades,
        img_principal,
        tecnologias,
        id_proyecto
      ]
    );

    return result.affectedRows;
  }

  static async delete(id_proyecto) {
    await db.query(`DELETE FROM proyecto_colaboradores WHERE id_proyecto = ?`, [id_proyecto]);
    await db.query(`DELETE FROM proyecto_media WHERE id_proyecto = ?`, [id_proyecto]).catch(() => {});
    await db.query(`DELETE FROM calificaciones WHERE id_proyecto = ?`, [id_proyecto]);
    await db.query(`DELETE FROM evidencias WHERE id_proyecto = ?`, [id_proyecto]);

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

  static async getMedia(id_proyecto) {
    try {
      const [rows] = await db.query(
        `SELECT id_media, id_proyecto, ruta_archivo, tipo, mime_type, nombre_original, orden, fecha_subida
         FROM proyecto_media
         WHERE id_proyecto = ?
         ORDER BY orden ASC, id_media ASC`,
        [id_proyecto]
      );
      return rows;
    } catch (error) {
      if (error.code === '42P01' || error.mysqlCode === 'ER_NO_SUCH_TABLE') return [];
      throw error;
    }
  }

  static async attachMedia(proyectos = []) {
    if (!proyectos.length) return proyectos;
    try {
      const ids = proyectos.map((p) => Number(p.id_proyecto)).filter(Boolean);
      const placeholders = ids.map(() => '?').join(',');
      const [mediaRows] = await db.query(
        `SELECT id_media, id_proyecto, ruta_archivo, tipo, mime_type, nombre_original, orden, fecha_subida
         FROM proyecto_media
         WHERE id_proyecto IN (${placeholders})
         ORDER BY orden ASC, id_media ASC`,
        ids
      );
      const byProject = new Map();
      mediaRows.forEach((m) => {
        const key = Number(m.id_proyecto);
        byProject.set(key, [...(byProject.get(key) || []), m]);
      });
      return proyectos.map((p) => ({ ...p, media: byProject.get(Number(p.id_proyecto)) || [] }));
    } catch (error) {
      if (error.code === '42P01' || error.mysqlCode === 'ER_NO_SUCH_TABLE') {
        return proyectos.map((p) => ({ ...p, media: [] }));
      }
      throw error;
    }
  }

  static async addMedia(id_proyecto, files = []) {
    if (!files.length) return;
    let order = 1;
    for (const file of files) {
      const tipo = String(file.mime_type || file.mimetype || '').startsWith('video/') ? 'video' : 'imagen';
      await db.query(
        `INSERT INTO proyecto_media (id_proyecto, ruta_archivo, tipo, mime_type, nombre_original, orden)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id_proyecto, file.ruta_archivo || file.path, tipo, file.mime_type || file.mimetype || null, file.nombre_original || file.originalname || null, order]
      );
      order += 1;
    }
  }

  static async findPublicProjects() {
    const [rows] = await db.query(
      `SELECT
        p.id_proyecto,
        p.titulo,
        p.descripcion,
        p.estado,
        p.fecha_registro,
        p.area_trabajo,
        p.ambito_desarrollo,
        p.objetivo,
        p.actividades,
        p.img_principal,
        p.tecnologias,
        COALESCE(e.carrera, pr.departamento, 'UTEQ') AS carrera,
        COALESCE(ue.nombre, up.nombre) AS nombre,
        COALESCE(ue.apellido, up.apellido) AS apellido,
        COALESCE(ue.foto_perfil, up.foto_perfil) AS foto_creador,
        CASE WHEN p.id_profesor IS NOT NULL THEN 'Profesor' ELSE 'Estudiante' END AS tipo_creador,
        COALESCE(AVG(c.puntaje), 0) AS promedio_estrellas,
        COUNT(c.id_calificacion) AS total_calificaciones
      FROM proyectos p
      LEFT JOIN estudiantes e ON p.id_estudiante = e.id_estudiante
      LEFT JOIN usuarios ue ON e.id_estudiante = ue.id_usuario
      LEFT JOIN profesores pr ON p.id_profesor = pr.id_profesor
      LEFT JOIN usuarios up ON pr.id_profesor = up.id_usuario
      LEFT JOIN calificaciones c ON p.id_proyecto = c.id_proyecto
      GROUP BY p.id_proyecto, e.carrera, pr.departamento, ue.nombre, ue.apellido, ue.foto_perfil, up.nombre, up.apellido, up.foto_perfil
      ORDER BY p.fecha_registro DESC, p.id_proyecto DESC`
    );

    return this.attachMedia(rows);
  }

  static async agregarColaborador(id_proyecto, id_estudiante) {
    try {
      const [result] = await db.query(
        `INSERT INTO proyecto_colaboradores (id_proyecto, id_estudiante)
         VALUES (?, ?)`,
        [id_proyecto, id_estudiante]
      );
      return result.affectedRows;
    } catch (error) {
      if (error.code === '23505' || error.mysqlCode === 'ER_DUP_ENTRY') return 0;
      if (error.code === '42P01' || error.mysqlCode === 'ER_NO_SUCH_TABLE') return 0;
      throw error;
    }
  }

  static async obtenerColaboradores(id_proyecto) {
    try {
      const [rows] = await db.query(
        `SELECT pc.id_estudiante, u.nombre, u.apellido, u.correo, e.matricula, e.carrera
         FROM proyecto_colaboradores pc
         INNER JOIN estudiantes e ON pc.id_estudiante = e.id_estudiante
         INNER JOIN usuarios u ON e.id_estudiante = u.id_usuario
         WHERE pc.id_proyecto = ?
         ORDER BY u.nombre ASC`,
        [id_proyecto]
      );
      return rows;
    } catch (error) {
      if (error.code === '42P01' || error.mysqlCode === 'ER_NO_SUCH_TABLE') return [];
      throw error;
    }
  }
}

module.exports = Proyecto;
