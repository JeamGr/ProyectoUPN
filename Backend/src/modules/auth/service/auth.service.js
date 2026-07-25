// src/modules/auth/service/auth.service.js
// REEMPLAZA por completo tu archivo anterior. Único cambio: si el envío de
// correo falla (proveedor caído, límite de envíos, etc.), ya NO se propaga
// como error 500 — el dato importante (código u token) ya quedó guardado
// en la base de datos antes de intentar el envío, así que la operación
// sigue siendo válida. Se registra el fallo en el log para diagnóstico, y
// el usuario tiene como red de respaldo el endpoint de reenvío (RF-003).
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const repo = require('../repository/auth.repository');
const { enviarCodigoVerificacion, enviarTokenRecuperacion } = require('../../../services/email.service');
const { invalidarToken } = require('../../../services/tokenBlacklist.service');
const AppError = require('../../../utils/AppError');
const ROLES = require('../../../constants/roles');
const MSG = require('../../../constants/messages').AUTH;
const jwtConfig = require('../../../config/jwt/jwt.config');
const Rol = require('../../roles/entity/roles.entity');
const logger = require('../../../utils/logger');

const RONDAS_SALT = 10;
const MINUTOS_EXPIRACION_CODIGO = 10;

const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function generarCodigoNumerico() {
  return crypto.randomInt(100000, 999999).toString();
}

function generarTokenAleatorio() {
  return crypto.randomBytes(32).toString('hex');
}

async function generarYEnviarCodigoVerificacion(usuario, nombreParaCorreo) {
  const codigo = generarCodigoNumerico();
  const codigoHash = await bcrypt.hash(codigo, RONDAS_SALT);
  const expiraEn = new Date(Date.now() + MINUTOS_EXPIRACION_CODIGO * 60 * 1000);

  // 1) Persistir primero: esto es lo que hace que /resend-code pueda
  //    recuperar la situación después, sin importar qué pase con el envío.
  await repo.guardarCodigoVerificacion({ usuarioId: usuario.id, codigoHash, expiraEn });

  // 2) Intentar el envío SIN dejar que un fallo tumbe el flujo que llamó
  //    a esta función (registro, login, o reenvío).
  try {
    await enviarCodigoVerificacion({ para: usuario.correo, nombre: nombreParaCorreo, codigo });
  } catch (err) {
    logger.error(`No se pudo enviar el código de verificación a ${usuario.correo}:`, err.message);
  }
}

async function validarCorreoDisponible(correo) {
  const existente = await repo.buscarUsuarioPorCorreo(correo);
  if (existente) {
    throw new AppError(MSG.CORREO_YA_REGISTRADO, 409);
  }
}

// ---------------------------------------------------------------------
// RF-001 — Registro de voluntario (siempre estudiante UPN)
// ---------------------------------------------------------------------
async function registrarVoluntario(datos) {
  await validarCorreoDisponible(datos.correo);

  const rol = await repo.buscarRolPorNombre(ROLES.VOLUNTARIO);
  const passwordHash = await bcrypt.hash(datos.password, RONDAS_SALT);

  const usuario = await repo.crearUsuarioConPerfilVoluntario({
    correo: datos.correo,
    passwordHash,
    rolId: rol.id,
    perfil: {
      codigo_estudiante: datos.codigoEstudiante,
      nombres: datos.nombres,
      apellidos: datos.apellidos,
      carrera: datos.carrera,
      ciclo: datos.ciclo,
      telefono: datos.telefono || null,
    },
  });

  await generarYEnviarCodigoVerificacion(usuario, datos.nombres);

  return { mensaje: MSG.REGISTRO_VOLUNTARIO_OK, correo: usuario.correo };
}

// ---------------------------------------------------------------------
// RF-002 — Registro de organización
// ---------------------------------------------------------------------
async function registrarOrganizacion(datos) {
  await validarCorreoDisponible(datos.correo);

  const rol = await repo.buscarRolPorNombre(ROLES.ORGANIZACION);
  const passwordHash = await bcrypt.hash(datos.password, RONDAS_SALT);

  const usuario = await repo.crearUsuarioConOrganizacion({
    correo: datos.correo,
    passwordHash,
    rolId: rol.id,
    perfil: {
      nombre_ong: datos.nombreOng,
      descripcion_actividad: datos.descripcionActividad || null,
      linea_intervencion_id: datos.lineaIntervencionId || null,
      pais: datos.pais || 'Perú',
      direccion: datos.direccion,
      persona_contacto: datos.personaContacto,
      tipo_documento_contacto: datos.tipoDocumentoContacto,
      numero_documento_contacto: datos.numeroDocumentoContacto,
      celular_contacto: datos.celularContacto,
      link_web: datos.linkWeb || null,
      link_redes_sociales: datos.linkRedesSociales,
      constituida_legalmente: datos.constituidaLegalmente,
      ruc: datos.ruc,
      razon_social: datos.razonSocial,
      numero_beneficiarios_anual: datos.numeroBeneficiariosAnual || null,
      tiene_certificado_donacion: datos.tieneCertificadoDonacion,
      tiene_programa_voluntariado_corporativo: datos.tieneProgramaVoluntariadoCorporativo || null,
    },
  });

  await generarYEnviarCodigoVerificacion(usuario, datos.personaContacto);

  return { mensaje: MSG.REGISTRO_ORGANIZACION_OK, correo: usuario.correo };
}

// ---------------------------------------------------------------------
// RF-003 — Verificación de cuenta por código
// ---------------------------------------------------------------------
async function verificarCuenta({ correo, codigo }) {
  const usuario = await repo.buscarUsuarioPorCorreo(correo);
  if (!usuario) throw new AppError(MSG.CODIGO_INVALIDO, 400);

  const registro = await repo.buscarUltimoCodigoVigente(usuario.id);
  if (!registro) throw new AppError(MSG.CODIGO_INVALIDO, 400);

  if (registro.expira_en < new Date()) {
    throw new AppError(MSG.CODIGO_EXPIRADO, 400);
  }

  const coincide = await bcrypt.compare(codigo, registro.codigo_hash);
  if (!coincide) {
    await registro.increment('intentos');
    throw new AppError(MSG.CODIGO_INVALIDO, 400);
  }

  await registro.update({ usado: true });
  await repo.marcarUsuarioVerificado(usuario);

  return { mensaje: MSG.CUENTA_VERIFICADA };
}

// ---------------------------------------------------------------------
// RF-003 (complemento) — Reenvío de código de verificación
// ---------------------------------------------------------------------
async function reenviarCodigo({ correo }) {
  const usuario = await repo.buscarUsuarioPorCorreo(correo);

  if (!usuario || usuario.estado !== 'pendiente_verificacion') {
    return { mensaje: MSG.CODIGO_REENVIADO };
  }

  const ultimoCodigo = await repo.buscarUltimoCodigoDeCualquierEstado(usuario.id);
  const segundosMinimoEntreReenvios = Number(
    await repo.obtenerParametroSistema('segundos_reenvio_codigo', 60)
  );

  if (ultimoCodigo) {
    const segundosDesdeUltimo = (Date.now() - new Date(ultimoCodigo.created_at).getTime()) / 1000;
    if (segundosDesdeUltimo < segundosMinimoEntreReenvios) {
      throw new AppError(MSG.ESPERA_ANTES_DE_REENVIAR, 429);
    }
  }

  await generarYEnviarCodigoVerificacion(usuario, usuario.correo);
  return { mensaje: MSG.CODIGO_REENVIADO };
}

// ---------------------------------------------------------------------
// RF-004 — Login (mismo endpoint para voluntario, organización y admin)
// ---------------------------------------------------------------------
async function login({ correo, password }) {
  const usuario = await repo.buscarUsuarioPorCorreo(correo);
  if (!usuario) throw new AppError(MSG.CREDENCIALES_INVALIDAS, 401);

  if (usuario.estado === 'bloqueado') {
    throw new AppError(MSG.CUENTA_BLOQUEADA, 403);
  }

  if (usuario.estado === 'pendiente_verificacion') {
    await generarYEnviarCodigoVerificacion(usuario, usuario.correo);
    throw new AppError(MSG.CUENTA_NO_VERIFICADA, 403);
  }

  const coincide = await bcrypt.compare(password, usuario.password_hash);
  if (!coincide) {
    const maxIntentos = Number(await repo.obtenerParametroSistema('max_intentos_login_fallidos', 5));
    await repo.registrarIntentoFallido(usuario, maxIntentos);
    throw new AppError(MSG.CREDENCIALES_INVALIDAS, 401);
  }

  await repo.reiniciarIntentosFallidos(usuario);

  const rolFila = await Rol.findByPk(usuario.rol_id);

  const token = jwt.sign(
    { id: usuario.id, correo: usuario.correo, rol: rolFila.nombre },
    jwtConfig.secret,
    { expiresIn: jwtConfig.expiresIn, issuer: jwtConfig.issuer }
  );

  return {
    mensaje: MSG.LOGIN_OK,
    token,
    usuario: { id: usuario.id, correo: usuario.correo, rol: rolFila.nombre },
  };
}

// ---------------------------------------------------------------------
// RF-007 — Logout con invalidación server-side (blacklist en Redis)
// ---------------------------------------------------------------------
async function cerrarSesion({ token }) {
  const payload = jwt.decode(token);
  const segundosHastaExpirar = payload.exp - Math.floor(Date.now() / 1000);

  await invalidarToken(token, segundosHastaExpirar);

  return { mensaje: 'Sesión cerrada correctamente.' };
}

// ---------------------------------------------------------------------
// RF-006 — Recuperación de contraseña (paso 1: solicitar)
// ---------------------------------------------------------------------
async function solicitarRecuperacionPassword({ correo }) {
  const usuario = await repo.buscarUsuarioPorCorreo(correo);

  if (!usuario || usuario.estado === 'eliminado') {
    return { mensaje: MSG.CORREO_NO_ENCONTRADO_GENERICO };
  }

  const token = generarTokenAleatorio();
  const tokenHash = await bcrypt.hash(token, RONDAS_SALT);
  const horasExpiracion = Number(await repo.obtenerParametroSistema('horas_expiracion_token_reset', 1));
  const expiraEn = new Date(Date.now() + horasExpiracion * 60 * 60 * 1000);

  await repo.guardarTokenRecuperacion({ usuarioId: usuario.id, tokenHash, expiraEn });

  try {
    await enviarTokenRecuperacion({ para: usuario.correo, nombre: usuario.correo, token });
  } catch (err) {
    logger.error(`No se pudo enviar el correo de recuperación a ${usuario.correo}:`, err.message);
  }

  return { mensaje: MSG.CORREO_NO_ENCONTRADO_GENERICO };
}

// ---------------------------------------------------------------------
// RF-006 — Recuperación de contraseña (paso 2: confirmar con el token)
// ---------------------------------------------------------------------
async function confirmarRecuperacionPassword({ correo, token, nuevaPassword }) {
  const usuario = await repo.buscarUsuarioPorCorreo(correo);
  if (!usuario) throw new AppError(MSG.TOKEN_RECUPERACION_INVALIDO, 400);

  const registro = await repo.buscarTokenRecuperacionVigente(usuario.id);
  if (!registro) throw new AppError(MSG.TOKEN_RECUPERACION_INVALIDO, 400);

  if (registro.expira_en < new Date()) {
    throw new AppError(MSG.TOKEN_RECUPERACION_EXPIRADO, 400);
  }

  const coincide = await bcrypt.compare(token, registro.token_hash);
  if (!coincide) {
    throw new AppError(MSG.TOKEN_RECUPERACION_INVALIDO, 400);
  }

  const nuevoHash = await bcrypt.hash(nuevaPassword, RONDAS_SALT);
  await repo.actualizarPassword(usuario, nuevoHash);
  await registro.update({ usado: true });

  if (usuario.estado === 'bloqueado') {
    await usuario.update({ estado: 'activo' });
  }
  await repo.reiniciarIntentosFallidos(usuario);

  return { mensaje: MSG.PASSWORD_ACTUALIZADA };
}

async function loginConGoogle({ idToken }) {
  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID, // valida "aud"; issuer/expiración los valida la librería
    });
    payload = ticket.getPayload();
  } catch (err) {
    throw new AppError('Token de Google inválido.', 401);
  }

  if (!payload.email_verified) {
    throw new AppError('Tu cuenta de Google no tiene el correo verificado.', 401);
  }

  const dominioRestringido = process.env.GOOGLE_HD_RESTRINGIDO;
  if (dominioRestringido && payload.hd !== dominioRestringido) {
    throw new AppError(`Debes iniciar sesión con tu correo institucional @${dominioRestringido}.`, 403);
  }

  // 1) ¿Ya existe la identidad vinculada?
  let identidad = await repo.buscarIdentidadOAuth('google', payload.sub);
  let usuario;

  if (identidad) {
    usuario = await repo.buscarUsuarioPorId(identidad.usuario_id); // agrega este helper si no existe
  } else {
    // 2) ¿Existe un usuario con ese correo (registrado antes con password)?
    usuario = await repo.buscarUsuarioPorCorreo(payload.email);

    if (!usuario) {
      // 3) Usuario totalmente nuevo -> se crea como VOLUNTARIO, sin perfil aún
      const rol = await repo.buscarRolPorNombre(ROLES.VOLUNTARIO);
      usuario = await repo.crearUsuarioOAuth({ correo: payload.email, rolId: rol.id });
    }

    await repo.vincularIdentidadOAuth({
      usuarioId: usuario.id,
      proveedor: 'google',
      proveedorUid: payload.sub,
      correoProveedor: payload.email,
    });
  }

  if (usuario.estado === 'bloqueado') {
    throw new AppError(MSG.CUENTA_BLOQUEADA, 403);
  }

  const rolFila = await Rol.findByPk(usuario.rol_id);
  const token = jwt.sign(
    { id: usuario.id, correo: usuario.correo, rol: rolFila.nombre },
    jwtConfig.secret,
    { expiresIn: jwtConfig.expiresIn, issuer: jwtConfig.issuer }
  );

  const perfilCompleto =
    rolFila.nombre !== ROLES.VOLUNTARIO || (await repo.tienePerfilVoluntario(usuario.id));

  return {
    mensaje: 'Inicio de sesión con Google exitoso.',
    token,
    usuario: { id: usuario.id, correo: usuario.correo, rol: rolFila.nombre },
    perfilCompleto,
  };
}

module.exports = {
  registrarVoluntario,
  registrarOrganizacion,
  verificarCuenta,
  reenviarCodigo,
  login,
  cerrarSesion,
  solicitarRecuperacionPassword,
  confirmarRecuperacionPassword,
  loginConGoogle,
};