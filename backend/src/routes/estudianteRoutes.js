const express = require('express');
const router = express.Router();
const estudianteController = require('../controllers/estudianteController');
const evidenciaController = require('../controllers/evidenciaController');
const verificarToken = require('../middlewares/authMiddleware');
const uploadEvidencias = require('../middlewares/uploadEvidencias');
const uploadProyectoImagen = require('../middlewares/uploadProyectoImagen');

router.get('/dashboard', verificarToken, estudianteController.obtenerDashboard);

router.get('/proyectos', verificarToken, estudianteController.listarMisProyectos);
router.get('/proyectos/:id', verificarToken, estudianteController.obtenerProyecto);
router.post('/proyectos', verificarToken, uploadProyectoImagen.single('img_principal'), estudianteController.crearProyecto);
router.put('/proyectos/:id', verificarToken, uploadProyectoImagen.single('img_principal'), estudianteController.actualizarProyecto);
router.delete('/proyectos/:id', verificarToken, estudianteController.eliminarProyecto);

router.get('/evidencias', verificarToken, evidenciaController.listarMisEvidencias);
router.post('/evidencias', verificarToken, uploadEvidencias.single('archivo'), evidenciaController.subirEvidencia);
router.delete('/evidencias/:id', verificarToken, evidenciaController.eliminarEvidencia);

router.get('/vacantes', verificarToken, estudianteController.obtenerVacantes);
router.post('/postulaciones', verificarToken, estudianteController.postularVacante);

module.exports = router;