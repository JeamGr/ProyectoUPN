// src/utils/AppError.js
// Error "esperado" de negocio (correo duplicado, credenciales inválidas, etc.)
// Se distingue de un error técnico no controlado en error.middleware.js.
class AppError extends Error {
  constructor(mensaje, statusCode = 400, errores = null) {
    super(mensaje);
    this.statusCode = statusCode;
    this.errores = errores;
    this.esOperacional = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
