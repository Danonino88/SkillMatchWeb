const express = require('express');
const router = express.Router();
const vacantesController = require('../controllers/vacantesController');
const verificarToken = require('../middlewares/authMiddleware');

router.get('/dashboard', verificarToken, vacantesController.getDashboardCompleto);

router.post('/', verificarToken, vacantesController.crearVacante);           
router.get('/:id', verificarToken, vacantesController.obtenerVacante);       
router.put('/:id', verificarToken, vacantesController.actualizarVacante);    
router.delete('/:id', verificarToken, vacantesController.eliminarVacante);   

module.exports = router;