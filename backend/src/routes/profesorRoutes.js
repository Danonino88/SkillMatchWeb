const express = require('express');
const router = express.Router();
const profesorController = require('../controllers/profesorController');
const verificarToken = require('../middlewares/authMiddleware');
const uploadEvidencias = require('../middlewares/uploadEvidencias');
const uploadProyectoImagen = require('../middlewares/uploadProyectoImagen');


router.get('/dashboard', verificarToken, profesorController.obtenerDashboard);
router.get('/alumnos', verificarToken, profesorController.obtenerAlumnos);


router.get('/proyectos', verificarToken, profesorController.listarProyectos);

router.post('/proyectos', verificarToken, uploadProyectoImagen.single('img_principal'), profesorController.crearProyecto);
router.put('/proyectos/:id', verificarToken, uploadProyectoImagen.single('img_principal'), profesorController.actualizarProyecto);
router.delete('/proyectos/:id', verificarToken, profesorController.eliminarProyecto);

router.get('/evidencias', verificarToken, profesorController.listarEvidencias);

router.post('/evidencias', verificarToken, uploadEvidencias.single('archivo'), profesorController.subirEvidencia);

module.exports = router;