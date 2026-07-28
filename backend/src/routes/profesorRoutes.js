const express = require('express');
const router = express.Router();
const profesorController = require('../controllers/profesorController');
const verificarToken = require('../middlewares/authMiddleware');
const { uploadEvidencias, procesarYSubirACloudinary } = require('../middlewares/uploadEvidencias');
const { camposProyectoMedia } = require('../middlewares/uploadProyectoMedia');
const uploadPerfilImagen = require('../middlewares/uploadPerfilImagen');

router.get('/dashboard', verificarToken, profesorController.obtenerDashboard);

// Se conserva el endpoint, pero se bloquea el directorio completo de alumnos para profesor.
router.get('/alumnos', verificarToken, profesorController.obtenerAlumnos);

router.get('/perfil', verificarToken, profesorController.obtenerPerfil);
router.put('/perfil', verificarToken, uploadPerfilImagen.single('foto_perfil'), profesorController.actualizarPerfil);

router.get('/horarios', verificarToken, profesorController.listarMisHorarios);
router.post('/horarios', verificarToken, uploadEvidencias.single('ruta_pdf'), procesarYSubirACloudinary, profesorController.subirMiHorario);
router.delete('/horarios/:id', verificarToken, profesorController.eliminarMiHorario);

router.get('/proyectos', verificarToken, profesorController.listarProyectos);
router.post('/proyectos', verificarToken, camposProyectoMedia, profesorController.crearProyecto);
router.put('/proyectos/:id', verificarToken, camposProyectoMedia, profesorController.actualizarProyecto);
router.delete('/proyectos/:id', verificarToken, profesorController.eliminarProyecto);

router.get('/evidencias', verificarToken, profesorController.listarEvidencias);
router.post('/evidencias', verificarToken, uploadEvidencias.single('archivo'), procesarYSubirACloudinary, profesorController.subirEvidencia);

module.exports = router;
