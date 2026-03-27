const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authController = require('../controllers/authController');
const verificarToken = require('../middlewares/authMiddleware');

router.get('/dashboard', verificarToken, adminController.getAdminDashboard);
router.post('/empresas', verificarToken, authController.register); 
router.put('/empresas/status/:id', verificarToken, adminController.toggleEstadoEmpresa);

module.exports = router;