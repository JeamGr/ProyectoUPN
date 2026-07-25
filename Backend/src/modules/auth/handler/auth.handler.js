// src/modules/auth/handler/auth.controller.js
// REEMPLAZA por completo tu archivo anterior (le agregué logout).
const service = require('../service/auth.service');
const { respuestaExitosa } = require('../../../dto/response.dto');
const { respuestaAuth } = require('../dto/auth.dto');

async function registrarVoluntario(req, res, next) {
  try {
    const resultado = await service.registrarVoluntario(req.body);
    return respuestaExitosa(res, { statusCode: 201, mensaje: resultado.mensaje, data: { correo: resultado.correo } });
  } catch (err) {
    return next(err);
  }
}

async function registrarOrganizacion(req, res, next) {
  try {
    const resultado = await service.registrarOrganizacion(req.body);
    return respuestaExitosa(res, { statusCode: 201, mensaje: resultado.mensaje, data: { correo: resultado.correo } });
  } catch (err) {
    return next(err);
  }
}

async function verificarCuenta(req, res, next) {
  try {
    const resultado = await service.verificarCuenta(req.body);
    return respuestaExitosa(res, { statusCode: 200, mensaje: resultado.mensaje });
  } catch (err) {
    return next(err);
  }
}

async function reenviarCodigo(req, res, next) {
  try {
    const resultado = await service.reenviarCodigo(req.body);
    return respuestaExitosa(res, { statusCode: 200, mensaje: resultado.mensaje });
  } catch (err) {
    return next(err);
  }
}

async function login(req, res, next) {
  try {
    const resultado = await service.login(req.body);
    return respuestaExitosa(res, {
      statusCode: 200,
      mensaje: resultado.mensaje,
      data: respuestaAuth(resultado),
    });
  } catch (err) {
    return next(err);
  }
}

async function logout(req, res, next) {
  try {
    // req.token lo dejó puesto verificarToken (ver auth.middleware.js)
    const resultado = await service.cerrarSesion({ token: req.token });
    return respuestaExitosa(res, { statusCode: 200, mensaje: resultado.mensaje });
  } catch (err) {
    return next(err);
  }
}

async function solicitarRecuperacion(req, res, next) {
  try {
    const resultado = await service.solicitarRecuperacionPassword(req.body);
    return respuestaExitosa(res, { statusCode: 200, mensaje: resultado.mensaje });
  } catch (err) {
    return next(err);
  }
}

async function confirmarRecuperacion(req, res, next) {
  try {
    const resultado = await service.confirmarRecuperacionPassword(req.body);
    return respuestaExitosa(res, { statusCode: 200, mensaje: resultado.mensaje });
  } catch (err) {
    return next(err);
  }
}

async function loginGoogle(req, res, next) {
  try {
    const resultado = await service.loginConGoogle(req.body);
    return respuestaExitosa(res, { statusCode: 200, mensaje: resultado.mensaje, data: respuestaAuth(resultado) });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  registrarVoluntario,
  registrarOrganizacion,
  verificarCuenta,
  reenviarCodigo,
  login,
  logout,
  solicitarRecuperacion,
  confirmarRecuperacion,
  loginGoogle,
};
