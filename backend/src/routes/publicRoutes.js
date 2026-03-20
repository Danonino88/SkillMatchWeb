const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

router.get('/proyectos', publicController.listarProyectosPublicos);

module.exports = router;