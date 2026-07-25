// src/middlewares/role.middleware.js
// Uso: router.get('/x', verificarToken, permitirRoles(ROLES.ADMINISTRADOR), controller.metodo)
const AppError = require('../utils/AppError');

function permitirRoles(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
      return next(new AppError('No tienes permisos para esta acción', 403));
    }
    return next();
  };
}

module.exports = permitirRoles;
