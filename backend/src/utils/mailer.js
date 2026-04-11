const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true para puerto 465
  // 🚨 ESTA LÍNEA ES LA CLAVE PARA RENDER 🚨
  family: 4, 
  auth: {
    user: "skillmatchofficial@gmail.com",
    // Asegúrate de que este sea tu código de 16 letras SIN ESPACIOS
    pass: "saffkwbbbkfldaku" 
  },
  tls: {
    // Esto evita que falle por temas de nombres de servidor en la red de Render
    servername: "smtp.gmail.com"
  }
});

// Verificación en consola
transporter.verify((error, success) => {
  if (error) {
    console.log("❌ Error de mailer (IPv4):", error.message);
  } else {
    console.log("✅ Servidor de correos conectado por IPv4");
  }
});

module.exports = transporter;