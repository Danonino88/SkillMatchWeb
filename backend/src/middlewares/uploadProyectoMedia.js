const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');
const fs = require('fs');

const hasCloudinaryConfig =
  Boolean(process.env.CLOUDINARY_CLOUD_NAME) &&
  Boolean(process.env.CLOUDINARY_API_KEY) &&
  Boolean(process.env.CLOUDINARY_API_SECRET);

if (hasCloudinaryConfig) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const allowedMimeTypes = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'video/mp4',
  'video/webm',
  'video/quicktime',
];

function isVideo(file) {
  return String(file.mimetype || '').startsWith('video/');
}

let storage;
if (hasCloudinaryConfig) {
  storage = new CloudinaryStorage({
    cloudinary,
    params: (req, file) => ({
      folder: 'skillmatch/proyectos',
      resource_type: isVideo(file) ? 'video' : 'image',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'mp4', 'webm', 'mov'],
    }),
  });
} else {
  const localUploadDir = path.join(__dirname, '../../uploads/proyectos');
  if (!fs.existsSync(localUploadDir)) fs.mkdirSync(localUploadDir, { recursive: true });

  storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, localUploadDir),
    filename: (_req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = path.extname(file.originalname || '').toLowerCase() || (isVideo(file) ? '.mp4' : '.jpg');
      cb(null, `${unique}${ext}`);
    },
  });
}

const uploadProyectoMedia = multer({
  storage,
  limits: { fileSize: 35 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file || allowedMimeTypes.includes(file.mimetype)) return cb(null, true);
    return cb(new Error('Formato no permitido. Usa JPG, PNG, WEBP, MP4, WEBM o MOV.'));
  },
});

const camposProyectoMedia = uploadProyectoMedia.fields([
  { name: 'img_principal', maxCount: 1 },
  { name: 'media', maxCount: 10 },
]);

module.exports = { uploadProyectoMedia, camposProyectoMedia };
