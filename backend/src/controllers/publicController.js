const Proyecto = require('../models/Proyecto');

exports.listarProyectosPublicos = async (req, res) => {
  try {
    const proyectos = await Proyecto.findPublicProjects();

  const proyectosFormateados = proyectos.map((p, index) => ({
    id_proyecto: p.id_proyecto,
    title: p.titulo,
    desc: p.descripcion || 'Proyecto académico publicado en SkillMatch.',
    author: `${p.nombre} ${p.apellido}`,
    carrera: p.carrera || 'UTEQ',
    estado: p.estado,
    fecha_registro: p.fecha_registro,
    img_principal: p.img_principal || null,
    tecnologias: p.tecnologias || '',
    tags: p.tecnologias
    ? p.tecnologias.split(',').map(t => t.trim()).filter(Boolean)
    : (p.carrera ? [p.carrera] : ['Proyecto UTEQ']),
    rating: [4.6, 4.8, 4.7, 4.9, 4.5][index % 5],
    thumb: (index % 3) + 1,
    icon: ['🖥️', '📱', '🗄️'][index % 3],
}));

    return res.status(200).json({
      ok: true,
      proyectos: proyectosFormateados,
    });
  } catch (error) {
    console.error('Error en listarProyectosPublicos:', error);
    return res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor',
    });
  }
};