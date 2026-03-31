const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        ok: false,
        mensaje: 'Token no proporcionado'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Guardamos todo el contenido decodificado
    req.usuario = decoded;
    
    // 🔍 Log de depuración para Render
    console.log("🔐 Middleware - Usuario decodificado:", decoded);
    
    next();
  } catch (error) {
    console.error("❌ Middleware Error:", error.message);
    return res.status(401).json({
      ok: false,
      mensaje: 'Token inválido o expirado'
    });
  }
};

module.exports = verificarToken;