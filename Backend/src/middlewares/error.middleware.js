// src/middlewares/error.middleware.js
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');
const { respuestaError } = require('../dto/response.dto');

// eslint-disable-next-line no-unused-vars
function errorMiddleware(err, req, res, next) {
  if (err instanceof AppError) {
    return respuestaError(res, {
      statusCode: err.statusCode,
      mensaje: err.message,
      errores: err.errores,
    });
  }

  logger.error(err);
  return respuestaError(res, {
    statusCode: 500,
    mensaje: 'Ha ocurrido un error inesperado. Intenta mas tarde.',
  });
}

module.exports = errorMiddleware;
