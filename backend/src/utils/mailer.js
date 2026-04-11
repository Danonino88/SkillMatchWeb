const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587, // Cambiamos a 587 (es más compatible con Render)
  secure: false, // false para puerto 587
  auth: {
    user: "skillmatchofficial@gmail.com",
    pass: "saff kwbb bkfl daku" 
  },
  tls: {
    rejectUnauthorized: false // Ayuda a evitar bloqueos en entornos de nube
  }
});

// Verificación de conexión
transporter.verify((error, success) => {
  if (error) {
    console.log("❌ Error de configuración en mailer:", error.message);
  } else {
    console.log("✅ Servidor de correos listo para enviar (IPv4)");
  }
});

module.exports = transporter;