const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authController = require('../controllers/authController');
const verificarToken = require('../middlewares/authMiddleware');
const uploadEvidencias = require('../middlewares/uploadEvidencias'); 

router.get('/dashboard', verificarToken, adminController.getAdminDashboard);
router.post('/empresas', verificarToken, authController.register); 
router.put('/empresas/status/:id', verificarToken, adminController.toggleEstadoEmpresa);


router.get('/profesores-list', verificarToken, adminController.obtenerProfesoresParaSelect);
router.get('/horarios', verificarToken, adminController.listarHorarios);
router.post('/horarios', verificarToken, uploadEvidencias.single('ruta_pdf'), adminController.subirHorario);
router.delete('/horarios/:id', verificarToken, adminController.eliminarHorario);

module.exports = router;