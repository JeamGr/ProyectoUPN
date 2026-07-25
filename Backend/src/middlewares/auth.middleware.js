// src/middlewares/auth.middleware.js
// REEMPLAZA por completo tu archivo anterior.
// Verifica el token Bearer, revisa que no esté en la blacklist (RF-007) y
// adjunta el payload a req.usuario. Úsalo en cualquier ruta protegida de
// CUALQUIER módulo (no solo auth).
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt/jwt.config');
const AppError = require('../utils/AppError');
const { tokenInvalidado } = require('../services/tokenBlacklist.service');
const logger = require('../utils/logger');

async function verificarToken(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return next(new AppError('No se proporcionó un token de acceso', 401));
  }

  const token = header.split(' ')[1];
  let payload;

  try {
    payload = jwt.verify(token, jwtConfig.secret);
  } catch (err) {
    return next(new AppError('Token inválido o expirado', 401));
  }

  // Chequeo de blacklist separado del try/catch de arriba a propósito: si
  // Redis está caído, preferimos dejar pasar la solicitud (con el JWT ya
  // validado igual) antes que tumbar TODA la autenticación de la app por
  // una dependencia caída. El logout inmediato es una mejora de seguridad,
  // no algo de lo que dependa la disponibilidad del sistema.
  try {
    const invalidado = await tokenInvalidado(token);
    if (invalidado) {
      return next(new AppError('Tu sesión fue cerrada. Vuelve a iniciar sesión.', 401));
    }
  } catch (err) {
    logger.error('No se pudo consultar la blacklist de Redis, se permite la solicitud:', err.message);
  }

  req.usuario = payload; // { id, correo, rol }
  req.token = token;
  return next();
}

module.exports = verificarToken;
