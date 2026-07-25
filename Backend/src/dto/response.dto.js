// src/dto/response.dto.js
// Envelope único para TODAS las respuestas de la API, éxito o error.
// Así el frontend siempre parsea la misma forma: { exito, mensaje, data | errores }

function respuestaExitosa(res, { statusCode = 200, mensaje = 'OK', data = null } = {}) {
  return res.status(statusCode).json({ exito: true, mensaje, data });
}

function respuestaError(res, { statusCode = 500, mensaje = 'Error interno', errores = null } = {}) {
  return res.status(statusCode).json({ exito: false, mensaje, errores });
}

module.exports = { respuestaExitosa, respuestaError };
