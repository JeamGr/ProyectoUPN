// src/config/jwt/jwt.config.js
require('dotenv').config();

module.exports = {
  secret: process.env.JWT_SECRET,
  // RNF-01: expiración de token <= 24h. Puede ser sobreescrito desde
  // configuracion_sistema (clave 'expiracion_sesion_horas') vía auth.repository.
  expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  issuer: 'yanantin-upn',
};
