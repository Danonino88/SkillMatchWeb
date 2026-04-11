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