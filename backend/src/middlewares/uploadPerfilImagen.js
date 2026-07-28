const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadDir = path.join(__dirname, '../../uploads/perfiles');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const idUsuario = req.usuario?.id_usuario || 'usuario';
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname || '').toLowerCase() || '.jpg';
    cb(null, `perfil-${idUsuario}-${unique}${ext}`);
  },
});

const uploadPerfilImagen = multer({
  storage,
  limits: {
    fileSize: 3 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (file && allowed.includes(file.mimetype)) return cb(null, true);
    return cb(new Error('Formato de foto no permitido. Usa JPG, PNG o WEBP.'));
  },
});

module.exports = uploadPerfilImagen;
