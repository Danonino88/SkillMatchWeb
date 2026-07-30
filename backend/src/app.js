const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const estudianteRoutes = require('./routes/estudianteRoutes');
const publicRoutes = require('./routes/publicRoutes');
const vacantesRoutes = require('./routes/vacantesRoutes');
const profesorRoutes = require('./routes/profesorRoutes'); 

const app = express();
const isDevelopment = app.get('env') === 'development';

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        'upgrade-insecure-requests': isDevelopment ? null : [],
      },
    },

    strictTransportSecurity: isDevelopment
      ? false
      : {
          maxAge: 31536000,
          includeSubDomains: true,
        },

    crossOriginResourcePolicy: {
      policy: 'same-site',
    },
  })
);
const envOrigins = (process.env.FRONTEND_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const allowedOrigins = new Set([
  process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
  'http://localhost:3000',
  'http://localhost:3001',
  ...envOrigins,
]);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`Origin no permitido por CORS: ${origin}`));
  },
}));
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/', (req, res) => {
  res.send('API SkillMatch funcionando');
});

app.use('/api/auth', authRoutes);
app.use('/api/estudiante', estudianteRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/vacantes', vacantesRoutes);
app.use('/api/admin', require('./routes/adminRoutes'));

app.use('/api/profesor', profesorRoutes); 

app.use((err, _req, res, _next) => {
  console.error('Unhandled API error:', err);
  return res.status(500).json({
    ok: false,
    mensaje: err?.message || 'Error interno del servidor',
  });
});

module.exports = app;