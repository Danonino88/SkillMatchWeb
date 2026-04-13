const express = require('express');
const router = express.Router();
const vacantesController = require('../controllers/vacantesController');
const verificarToken = require('../middlewares/authMiddleware');

router.get('/dashboard', verificarToken, vacantesController.getDashboardCompleto);
router.get('/perfil-info', verificarToken, vacantesController.obtenerPerfilEmpresa);

router.get('/match-estudiantes', verificarToken, vacantesController.realizarMatchEstudiantes);

// Rutas dinámicas (Las que tienen :id SIEMPRE VAN ABAJO)
router.post('/', verificarToken, vacantesController.crearVacante);           
router.get('/:id', verificarToken, vacantesController.obtenerVacante);       
router.put('/:id', verificarToken, vacantesController.actualizarVacante);    
router.delete('/:id', verificarToken, vacantesController.eliminarVacante);  
router.put('/postulaciones/:id_postulacion/aceptar', verificarToken, vacantesController.aceptarPostulante); 

module.exports = router;