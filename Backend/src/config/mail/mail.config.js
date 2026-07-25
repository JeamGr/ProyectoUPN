// src/config/mail/mail.config.js
const nodemailer = require('nodemailer');
require('dotenv').config();

// Nota: la credencial real vive SIEMPRE en variables de entorno, nunca en la
// tabla `correo_remitente` (esa tabla solo guarda metadatos y el NOMBRE de
// la variable de entorno a usar, ver ajuste v1.1 del schema).
function crearTransportador() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_APP_PASSWORD,
    },
  });
}

module.exports = { crearTransportador };
