const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const crypto = require('crypto');
const { Readable } = require('stream');

// 1. Configuramos Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Usamos memoria RAM en lugar de enviarlo directo (para poder leerlo y hacer el Hash)
const storage = multer.memoryStorage();

// 3. Creamos el middleware base con el límite de 15MB
const uploadEvidencias = multer({
  storage: storage,
  limits: {
    fileSize: 15 * 1024 * 1024 // 15 MB
  }
});

// 4. NUEVO: Middleware que genera el Hash SHA-256 y luego sube a la nube
const procesarYSubirACloudinary = (req, res, next) => {
  if (!req.file) return next();

  try {
    // A. Cumplimos el requisito: Calculamos el HASH SHA-256
    const hash = crypto.createHash('sha256').update(req.file.buffer).digest('hex');
    req.file.hash_archivo = hash; // Lo guardamos para que tu controlador lo pueda insertar en MySQL

    // B. Subimos a Cloudinary mediante un Stream (flujo de datos)
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'skillmatch/evidencias',
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) return next(error);
        req.file.path = result.secure_url; // Simulamos que es la misma variable que tenías antes
        next();
      }
    );

    // Ejecutamos el flujo
    const readableStream = new Readable();
    readableStream.push(req.file.buffer);
    readableStream.push(null);
    readableStream.pipe(uploadStream);

  } catch (error) {
    next(error);
  }
};

// Exportamos ambas funciones
module.exports = {
  uploadEvidencias,
  procesarYSubirACloudinary
};