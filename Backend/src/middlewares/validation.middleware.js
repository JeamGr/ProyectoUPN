// src/middlewares/validation.middleware.js
// Factory reutilizable: validar(schema) valida req.body por defecto.
// validar(schema, 'query') o validar(schema, 'params') para otros orígenes.
const AppError = require('../utils/AppError');

function validar(schema, origen = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[origen], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errores = error.details.map((d) => ({
        campo: d.path.join('.'),
        mensaje: d.message,
      }));
      return next(new AppError('Datos de entrada inválidos', 422, errores));
    }

    req[origen] = value;
    return next();
  };
}

module.exports = validar;
