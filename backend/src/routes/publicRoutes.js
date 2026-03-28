const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

router.get('/proyectos', publicController.listarProyectosPublicos);
router.get('/proyectos/:id', publicController.obtenerDetalleProyecto);

module.exports = router;