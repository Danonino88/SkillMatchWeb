const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// 1. Configuramos Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Storage configurado para aceptar solo imágenes
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'skillmatch/proyectos',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'] // Filtro integrado en Cloudinary
  }
});

// 3. Creamos el middleware con límite de 5MB
const uploadProyectoImagen = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB
  }
});

module.exports = uploadProyectoImagen;