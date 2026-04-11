const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true para puerto 465
  auth: {
    user: "skillmatchofficial@gmail.com",
    pass: "saff kwbb bkfl daku" 
  }
});

// Verificación de conexión (opcional, ayuda a debuguear)
transporter.verify().then(() => {
  console.log('✅ Servidor de correos listo');
}).catch((err) => {
  console.error('❌ Error en mailer:', err);
});

module.exports = transporter; // Exportamos el objeto directamente