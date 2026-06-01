const express = require('express');
const router = express.Router();
const estudianteController = require('../controllers/estudianteController');
const evidenciaController = require('../controllers/evidenciaController');
const verificarToken = require('../middlewares/authMiddleware');
// CAMBIO 1: Importamos con llaves { } las dos funciones del middleware
const { uploadEvidencias, procesarYSubirACloudinary } = require('../middlewares/uploadEvidencias');
const uploadProyectoImagen = require('../middlewares/uploadProyectoImagen');

router.get('/dashboard', verificarToken, estudianteController.obtenerDashboard);
router.put('/perfil', verificarToken, estudianteController.actualizarPerfil);

// ==========================================
// RUTAS DE PROYECTOS
// ==========================================
router.get('/proyectos', verificarToken, estudianteController.listarMisProyectos);
router.get('/proyectos/:id', verificarToken, estudianteController.obtenerProyecto);
router.post('/proyectos', verificarToken, uploadProyectoImagen.single('img_principal'), estudianteController.crearProyecto);
router.put('/proyectos/:id', verificarToken, uploadProyectoImagen.single('img_principal'), estudianteController.actualizarProyecto);
router.delete('/proyectos/:id', verificarToken, estudianteController.eliminarProyecto);

// ==========================================
// RUTAS PARA COLABORADORES
// ==========================================
router.post('/proyectos/:id_proyecto/colaboradores', verificarToken, estudianteController.agregarColaborador);
router.get('/proyectos/:id_proyecto/colaboradores', verificarToken, estudianteController.obtenerColaboradores);
router.delete('/proyectos/:id_proyecto/colaboradores/:id_colaborador', verificarToken, estudianteController.eliminarColaborador);

// ==========================================
// RUTAS DE EVIDENCIAS
// ==========================================
router.get('/evidencias', verificarToken, evidenciaController.listarMisEvidencias);
// CAMBIO 2: Arreglamos la ruta, agregamos verificarToken y usamos evidenciaController
router.post('/evidencias', verificarToken, uploadEvidencias.single('archivo'), procesarYSubirACloudinary, evidenciaController.subirEvidencia);
router.delete('/evidencias/:id', verificarToken, evidenciaController.eliminarEvidencia);

// ==========================================
// RUTAS DE VACANTES
// ==========================================
router.get('/vacantes', verificarToken, estudianteController.obtenerVacantes);
router.post('/postulaciones', verificarToken, estudianteController.postularVacante);

router.get('/perfil-publico/:id', verificarToken, estudianteController.getPerfilPublico);

module.exports = router;