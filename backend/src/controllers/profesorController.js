const Proyecto = require('../models/Proyecto');
const db = require('../config/db');

// 🟢 LISTAR PROYECTOS DEL PROFESOR
exports.listarProyectos = async (req, res) => {
  try {
    const id_usuario = req.usuario.id_usuario;
    
    // Buscar el id_profesor
    const [profesores] = await db.query('SELECT id_profesor FROM profesores WHERE id_usuario = ?', [id_usuario]);
    if (profesores.length === 0) return res.status(404).json({ ok: false, mensaje: 'Profesor no encontrado' });
    
    const proyectos = await Proyecto.findByProfesor(profesores[0].id_profesor);
    
    return res.status(200).json({ ok: true, proyectos });
  } catch (error) {
    console.error('Error al listar proyectos del profesor:', error);
    return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
  }
};

// 🟢 CREAR PROYECTO DEL PROFESOR
exports.crearProyecto = async (req, res) => {
  try {
    const id_usuario = req.usuario.id_usuario;
    const { titulo, descripcion, estado, area_trabajo, ambito_desarrollo, es_innovacion, ya_trabaja, competencia_impacto, objetivo, actividades, tecnologias } = req.body;

    const [profesores] = await db.query('SELECT id_profesor FROM profesores WHERE id_usuario = ?', [id_usuario]);
    if (profesores.length === 0) return res.status(404).json({ ok: false, mensaje: 'Profesor no encontrado' });
    const id_profesor = profesores[0].id_profesor;

    // Obtener imagen si se subió a Cloudinary
    let img_principal = null;
    if (req.file && req.file.path) {
      img_principal = req.file.path; 
    }

    const nuevoId = await Proyecto.create({
      titulo, descripcion, estado, 
      id_profesor, // 🟢 Pasamos el ID del Profesor, no el del estudiante
      id_estudiante: null, 
      area_trabajo, ambito_desarrollo, es_innovacion: es_innovacion === '1' || es_innovacion === 'true', 
      ya_trabaja: ya_trabaja === '1' || ya_trabaja === 'true', 
      competencia_impacto, objetivo, actividades, tecnologias, img_principal
    });

    return res.status(201).json({ ok: true, mensaje: 'Proyecto creado con éxito', id_proyecto: nuevoId });
  } catch (error) {
    console.error('Error al crear proyecto (profesor):', error);
    return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
  }
};

// 🟢 EDITAR PROYECTO DEL PROFESOR
exports.actualizarProyecto = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, estado, area_trabajo, ambito_desarrollo, es_innovacion, ya_trabaja, competencia_impacto, objetivo, actividades, tecnologias } = req.body;
    
    // Aquí puedes hacer la misma lógica de update que ya tienes en el estudiante
    let queryParams = [titulo, descripcion, estado, area_trabajo, ambito_desarrollo, es_innovacion === '1', ya_trabaja === '1', competencia_impacto, objetivo, actividades, tecnologias];
    let query = `UPDATE proyectos SET titulo=?, descripcion=?, estado=?, area_trabajo=?, ambito_desarrollo=?, es_innovacion=?, ya_trabaja=?, competencia_impacto=?, objetivo=?, actividades=?, tecnologias=?`;

    if (req.file && req.file.path) {
      query += `, img_principal=?`;
      queryParams.push(req.file.path);
    }

    query += ` WHERE id_proyecto=?`;
    queryParams.push(id);

    await db.query(query, queryParams);

    return res.status(200).json({ ok: true, mensaje: 'Proyecto actualizado' });
  } catch (error) {
    console.error('Error al actualizar proyecto:', error);
    return res.status(500).json({ ok: false, mensaje: 'Error interno' });
  }
};

// 🟢 ELIMINAR PROYECTO DEL PROFESOR
exports.eliminarProyecto = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM proyectos WHERE id_proyecto = ?', [id]);
    return res.status(200).json({ ok: true, mensaje: 'Proyecto eliminado' });
  } catch (error) {
    console.error('Error al eliminar:', error);
    return res.status(500).json({ ok: false, mensaje: 'Error interno' });
  }
};