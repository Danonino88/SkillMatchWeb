const express = require('express');
const router = express.Router();
const profesorController = require('../controllers/profesorController');
const verificarToken = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware'); // 🟢 Asegúrate de importar Multer/Cloudinary

// (Tus otras rutas de dashboard y alumnos...)

// 🟢 RUTAS PARA PROYECTOS DE PROFESORES 🟢
router.get('/proyectos', verificarToken, profesorController.listarProyectos);

router.post('/proyectos', verificarToken, upload.single('img_principal'), profesorController.crearProyecto);

router.put('/proyectos/:id', verificarToken, upload.single('img_principal'), profesorController.actualizarProyecto);

router.delete('/proyectos/:id', verificarToken, profesorController.eliminarProyecto);

module.exports = router;