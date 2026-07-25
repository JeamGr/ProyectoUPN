// src/modules/auth/routes/auth.routes.js
// REEMPLAZA por completo tu archivo anterior.
const { Router } = require('express');
const controller = require('../handler/auth.handler');
const validar = require('../../../middlewares/validation.middleware');
const verificarToken = require('../../../middlewares/auth.middleware');
const { googleLoginSchema } = require('../validators/auth.validator');
const {
  registroVoluntarioSchema,
  registroOrganizacionSchema,
  verificarCuentaSchema,
  reenviarCodigoSchema,
  loginSchema,
  solicitarRecuperacionSchema,
  confirmarRecuperacionSchema,
} = require('../validators/auth.validator');

const router = Router();

// RF-001 / RF-002
router.post('/register/voluntario', validar(registroVoluntarioSchema), controller.registrarVoluntario);
router.post('/register/organizacion', validar(registroOrganizacionSchema), controller.registrarOrganizacion);

// RF-003
router.post('/verify', validar(verificarCuentaSchema), controller.verificarCuenta);
router.post('/resend-code', validar(reenviarCodigoSchema), controller.reenviarCodigo);

// RF-004
router.post('/login', validar(loginSchema), controller.login);

// RF-007 — requiere estar autenticado: no se puede "cerrar" una sesión
// que no se abrió con un token válido.
router.post('/logout', verificarToken, controller.logout);

// RF-006
router.post('/forgot-password', validar(solicitarRecuperacionSchema), controller.solicitarRecuperacion);
router.post('/reset-password', validar(confirmarRecuperacionSchema), controller.confirmarRecuperacion);

router.post('/google', validar(googleLoginSchema), controller.loginGoogle);

module.exports = router;


