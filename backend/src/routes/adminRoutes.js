const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const verificarToken = require('../middlewares/authMiddleware');
const uploadPerfilImagen = require('../middlewares/uploadPerfilImagen');
const { uploadEvidencias, procesarYSubirACloudinary } = require('../middlewares/uploadEvidencias');

router.get('/dashboard', verificarToken, adminController.getAdminDashboard);

router.get('/perfil', verificarToken, adminController.obtenerMiPerfil);
router.put('/perfil', verificarToken, uploadPerfilImagen.single('foto_perfil'), adminController.actualizarMiPerfil);

router.post('/empresas', verificarToken, adminController.crearEmpresaVinculacion);
router.get('/empresas/:id', verificarToken, adminController.getEmpresaDetalle);
router.put('/empresas/:id', verificarToken, adminController.updateEmpresa);
router.put('/empresas/status/:id', verificarToken, adminController.toggleEstadoEmpresa);

router.get('/alumnos/:id', verificarToken, adminController.getAlumnoDetalle);
router.get('/profesores/:id', verificarToken, adminController.getProfesorDetalle);

router.get('/proyectos/:id', verificarToken, adminController.getProyectoDetalle);
router.put('/usuarios/:id/estado', verificarToken, adminController.cambiarEstadoUsuario);

router.get('/vacantes/:id', verificarToken, adminController.getVacanteDetalle);
router.put('/vacantes/:id', verificarToken, adminController.updateVacanteAdmin);

router.get('/chatbot', verificarToken, adminController.listarChatbot);
router.post('/chatbot', verificarToken, adminController.crearChatbot);
router.put('/chatbot/:id', verificarToken, adminController.actualizarChatbot);
router.delete('/chatbot/:id', verificarToken, adminController.eliminarChatbot);

// Compatibilidad con vistas antiguas: admin/vinculación ya no sube horarios.
router.get('/profesores-list', verificarToken, adminController.obtenerProfesoresParaSelect);
router.get('/horarios', verificarToken, adminController.listarHorarios);
router.post('/horarios', verificarToken, uploadEvidencias.single('ruta_pdf'), procesarYSubirACloudinary, adminController.subirHorario);
router.delete('/horarios/:id', verificarToken, adminController.eliminarHorario);

module.exports = router;
