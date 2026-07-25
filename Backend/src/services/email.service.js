// src/services/email.service.js
// REEMPLAZA por completo tu archivo anterior (le agregué enviarTokenRecuperacion).
const { crearTransportador } = require('../config/mail/mail.config');
const logger = require('../utils/logger');

async function enviarCorreo({ para, asunto, html, texto }) {
  const transportador = crearTransportador();

  try {
    await transportador.sendMail({
      from: process.env.SMTP_FROM || '"Yanantin UPN" <no-responder@yanantin.pe>',
      to: para,
      subject: asunto,
      text: texto,
      html,
    });
  } catch (err) {
    logger.error('Fallo al enviar correo a', para, err.message);
    throw err;
  }
}

async function enviarCodigoVerificacion({ para, nombre, codigo }) {
  return enviarCorreo({
    para,
    asunto: 'Verifica tu cuenta en Yanantin UPN',
    html: `
      <p>Hola ${nombre},</p>
      <p>Tu código de verificación es:</p>
      <h2>${codigo}</h2>
      <p>Este código expira en pocos minutos. Si no fuiste tú, ignora este correo.</p>
    `,
    texto: `Hola ${nombre}, tu código de verificación es ${codigo}.`,
  });
}

// RF-006 — recuperación de contraseña. Se envía un enlace con un token de
// un solo uso, no un código numérico (mismo patrón que RF-003 pero con
// token largo, porque este va embebido en una URL, no se teclea a mano).
async function enviarTokenRecuperacion({ para, nombre, token }) {
  const urlBase = process.env.FRONTEND_URL || 'http://localhost:5173';
  const enlace = `${urlBase}/restablecer-password?token=${token}&correo=${encodeURIComponent(para)}`;

  return enviarCorreo({
    para,
    asunto: 'Recupera tu contraseña — Yanantin UPN',
    html: `
      <p>Hola ${nombre},</p>
      <p>Solicitaste restablecer tu contraseña. Este enlace es válido por tiempo limitado:</p>
      <p><a href="${enlace}">${enlace}</a></p>
      <p>Si no fuiste tú, ignora este correo — tu contraseña actual sigue siendo válida.</p>
    `,
    texto: `Hola ${nombre}, para restablecer tu contraseña visita: ${enlace}`,
  });
}

module.exports = { enviarCorreo, enviarCodigoVerificacion, enviarTokenRecuperacion };
