const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// 1. Configuramos Cloudinary con las variables de entorno
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Le decimos a multer que guarde directamente en Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'skillmatch/evidencias', // Se creará esta carpeta en tu Cloudinary
    resource_type: 'auto', // Permite subir videos, PDFs, zips, imágenes, etc.
  }
});

// 3. Creamos el middleware con límite de 15MB
const uploadEvidencias = multer({
  storage: storage,
  limits: {
    fileSize: 15 * 1024 * 1024 // 15 MB
  }
});

module.exports = uploadEvidencias;