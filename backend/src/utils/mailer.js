const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true para puerto 465
  auth: {
    user: "skillmatchofficial@gmail.com",
    pass: "saffkwbbbkfldaku" // 👈 Asegúrate que NO tenga espacios
  },
  connectionTimeout: 10000, // 10 segundos de espera
  greetingTimeout: 5000,
  socketTimeout: 15000
});

transporter.verify((error, success) => {
  if (error) {
    console.log("❌ Error de mailer (Timeout):", error.message);
  } else {
    console.log("✅ Servidor de correos listo y conectado");
  }
});

module.exports = transporter;