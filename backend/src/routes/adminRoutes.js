const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authController = require('../controllers/authController');
const verificarToken = require('../middlewares/authMiddleware');

// CORRECCIÓN: Importamos con llaves { } para obtener la función específica del objeto
const { uploadEvidencias, procesarYSubirACloudinary } = require('../middlewares/uploadEvidencias'); 

router.get('/dashboard', verificarToken, adminController.getAdminDashboard);
router.post('/empresas', verificarToken, authController.register); 
router.put('/empresas/status/:id', verificarToken, adminController.toggleEstadoEmpresa);


router.get('/profesores-list', verificarToken, adminController.obtenerProfesoresParaSelect);
router.get('/horarios', verificarToken, adminController.listarHorarios);

// CORRECCIÓN: Usamos las llaves y agregamos procesarYSubirACloudinary por seguridad
router.post('/horarios', verificarToken, uploadEvidencias.single('ruta_pdf'), procesarYSubirACloudinary, adminController.subirHorario);

router.delete('/horarios/:id', verificarToken, adminController.eliminarHorario);

module.exports = router;