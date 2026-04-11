const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'skillmatchofficial@gmail.com', 
    pass: 'Skill@2626'      
  }
});

module.exports = transporter;