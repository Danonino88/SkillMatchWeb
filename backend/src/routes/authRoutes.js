const express = require('express'); // 🟢 ¡Aquí estaba el error!
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

// 🟢 NUEVA RUTA: Obtener la llave pública RSA para el cifrado híbrido del Login (Escenario 1)
router.get('/public-key', authController.obtenerLlavePublica);

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/logout', authController.logout);

router.get('/biometric-reg-options', authMiddleware, authController.opcionesRegistroBiometrico);
router.post('/biometric-reg-verify', authMiddleware, authController.verificarRegistroBiometrico);

// --- RUTAS PARA LOGIN (DESDE AFUERA) ---
router.post('/biometric-login-options', authController.opcionesLoginBiometrico);
router.post('/biometric-login-verify', authController.verificarLoginBiometrico);

module.exports = router;