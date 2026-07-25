// src/modules/auth/validators/auth.validator.js
// REEMPLAZA por completo tu archivo anterior (le agregué los schemas de
// recuperación de contraseña; reenviarCodigoSchema ya existía).
const Joi = require('joi');

const passwordSchema = Joi.string()
  .min(8)
  .pattern(/^(?=.*[A-Za-z])(?=.*\d).+$/)
  .required()
  .messages({
    'string.pattern.base': 'La contraseña debe tener al menos una letra y un número.',
    'string.min': 'La contraseña debe tener al menos 8 caracteres.',
  });

const correoSchema = Joi.string().email().max(150).required();

const registroVoluntarioSchema = Joi.object({
  correo: correoSchema,
  password: passwordSchema,
  confirmarPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Las contraseñas no coinciden.',
  }),
  nombres: Joi.string().max(100).required(),
  apellidos: Joi.string().max(100).required(),
  codigoEstudiante: Joi.string().max(20).required(),
  carrera: Joi.string().max(100).required(),
  ciclo: Joi.number().integer().min(1).max(12).required(),
  telefono: Joi.string().max(20).optional().allow(null, ''),
  aceptaTerminos: Joi.boolean().valid(true).required().messages({
    'any.only': 'Debes aceptar los términos de uso y la política de privacidad.',
  }),
});

const registroOrganizacionSchema = Joi.object({
  correo: correoSchema,
  password: passwordSchema,
  confirmarPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Las contraseñas no coinciden.',
  }),
  nombreOng: Joi.string().max(200).required(),
  descripcionActividad: Joi.string().optional().allow(null, ''),
  lineaIntervencionId: Joi.number().integer().optional().allow(null),
  pais: Joi.string().max(100).optional().default('Perú'),
  direccion: Joi.string().max(255).required(),
  personaContacto: Joi.string().max(200).required(),
  tipoDocumentoContacto: Joi.string().valid('DNI', 'CE', 'PASAPORTE').required(),
  numeroDocumentoContacto: Joi.string().max(20).required(),
  celularContacto: Joi.string().max(20).required(),
  linkWeb: Joi.string().uri().optional().allow(null, ''),
  linkRedesSociales: Joi.string().max(255).required(),
  constituidaLegalmente: Joi.string().valid('SI', 'NO', 'EN_PROCESO').required(),
  ruc: Joi.string().pattern(/^\d{11}$/).required().messages({
    'string.pattern.base': 'El RUC debe tener 11 dígitos.',
  }),
  razonSocial: Joi.string().max(200).required(),
  numeroBeneficiariosAnual: Joi.string().max(50).optional().allow(null, ''),
  tieneCertificadoDonacion: Joi.string().valid('SI', 'NO', 'EN_PROCESO').required(),
  tieneProgramaVoluntariadoCorporativo: Joi.string().valid('SI', 'NO', 'EN_PROCESO').optional().allow(null),
  aceptaTerminos: Joi.boolean().valid(true).required().messages({
    'any.only': 'Debes aceptar los términos de uso y la política de privacidad.',
  }),
});

const verificarCuentaSchema = Joi.object({
  correo: correoSchema,
  codigo: Joi.string().length(6).required(),
});

const reenviarCodigoSchema = Joi.object({
  correo: correoSchema,
});

const loginSchema = Joi.object({
  correo: correoSchema,
  password: Joi.string().required(),
});

// ---- RF-006: recuperación de contraseña ----
const solicitarRecuperacionSchema = Joi.object({
  correo: correoSchema,
});

const confirmarRecuperacionSchema = Joi.object({
  correo: correoSchema,
  token: Joi.string().required(),
  nuevaPassword: passwordSchema,
  confirmarNuevaPassword: Joi.string().valid(Joi.ref('nuevaPassword')).required().messages({
    'any.only': 'Las contraseñas no coinciden.',
  }),
});

const googleLoginSchema = Joi.object({
  idToken: Joi.string().required(),
});

module.exports = {
  registroVoluntarioSchema,
  registroOrganizacionSchema,
  verificarCuentaSchema,
  reenviarCodigoSchema,
  loginSchema,
  solicitarRecuperacionSchema,
  confirmarRecuperacionSchema,
  googleLoginSchema,
};
