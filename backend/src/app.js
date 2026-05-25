const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const estudianteRoutes = require('./routes/estudianteRoutes');
const publicRoutes = require('./routes/publicRoutes');
const vacantesRoutes = require('./routes/vacantesRoutes');
const profesorRoutes = require('./routes/profesorRoutes'); 

const app = express();
const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';

app.use(cors({ origin: frontendOrigin }));
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

module.exports = app;