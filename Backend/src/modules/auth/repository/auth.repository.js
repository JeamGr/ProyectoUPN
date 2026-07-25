// src/modules/auth/repository/auth.repository.js
const Usuario = require('../../users/entity/users.entity');
const Rol = require('../../roles/entity/roles.entity');
const PerfilVoluntario = require('../../volunteers/entity/volunteers.entity');
const Organizacion = require('../../organizations/entity/organizations.entity');
const ConfiguracionSistema = require('../../configuration/entity/configuration.entity');
const { CodigoVerificacion, TokenRecuperacionPassword, IdentidadOAuth } = require('../entity/auth.entity');
const sequelize = require('../../../config/database/database.config');

async function obtenerParametroSistema(clave, valorPorDefecto) {
  const fila = await ConfiguracionSistema.findByPk(clave);
  return fila ? fila.valor : valorPorDefecto;
}

async function buscarRolPorNombre(nombre) {
  return Rol.findOne({ where: { nombre } });
}

async function buscarUsuarioPorCorreo(correo) {
  return Usuario.findOne({ where: { correo } });
}

async function buscarUsuarioPorId(id) {
  return Usuario.findByPk(id);
}

async function crearUsuarioConPerfilVoluntario({ correo, passwordHash, rolId, perfil }) {
  return sequelize.transaction(async (t) => {
    const usuario = await Usuario.create({ correo, password_hash: passwordHash, rol_id: rolId }, { transaction: t });
    await PerfilVoluntario.create({ usuario_id: usuario.id, ...perfil }, { transaction: t });
    return usuario;
  });
}

async function crearUsuarioConOrganizacion({ correo, passwordHash, rolId, perfil }) {
  return sequelize.transaction(async (t) => {
    const usuario = await Usuario.create({ correo, password_hash: passwordHash, rol_id: rolId }, { transaction: t });
    await Organizacion.create({ usuario_id: usuario.id, ...perfil }, { transaction: t });
    return usuario;
  });
}

// ---- Verificación de cuenta (RF-003) ----

async function guardarCodigoVerificacion({ usuarioId, codigoHash, expiraEn }) {
  return CodigoVerificacion.create({ usuario_id: usuarioId, codigo_hash: codigoHash, expira_en: expiraEn });
}

async function buscarUltimoCodigoVigente(usuarioId) {
  return CodigoVerificacion.findOne({
    where: { usuario_id: usuarioId, usado: false },
    order: [['created_at', 'DESC']],
  });
}

async function buscarUltimoCodigoDeCualquierEstado(usuarioId) {
  return CodigoVerificacion.findOne({
    where: { usuario_id: usuarioId },
    order: [['created_at', 'DESC']],
  });
}

async function marcarUsuarioVerificado(usuario) {
  return usuario.update({ estado: 'activo', fecha_verificacion: new Date() });
}

// ---- Login / bloqueo por intentos (RF-004 / RF-008) ----

async function registrarIntentoFallido(usuario, maxIntentos) {
  const intentos = usuario.intentos_fallidos + 1;
  const datos = { intentos_fallidos: intentos };

  if (intentos >= maxIntentos) {
    datos.estado = 'bloqueado';
    datos.fecha_bloqueo = new Date();
  }

  return usuario.update(datos);
}

async function reiniciarIntentosFallidos(usuario) {
  return usuario.update({ intentos_fallidos: 0 });
}

// ---- Recuperación de contraseña (RF-006) ----

async function guardarTokenRecuperacion({ usuarioId, tokenHash, expiraEn }) {
  return TokenRecuperacionPassword.create({ usuario_id: usuarioId, token_hash: tokenHash, expira_en: expiraEn });
}

async function buscarTokenRecuperacionVigente(usuarioId) {
  return TokenRecuperacionPassword.findOne({
    where: { usuario_id: usuarioId, usado: false },
    order: [['created_at', 'DESC']],
  });
}

async function actualizarPassword(usuario, passwordHash) {
  return usuario.update({ password_hash: passwordHash });
}

// ---- OAuth (Google / Microsoft) ----

async function buscarIdentidadOAuth(proveedor, proveedorUid) {
  return IdentidadOAuth.findOne({ where: { proveedor, proveedor_uid: proveedorUid } });
}

async function crearUsuarioOAuth({ correo, rolId }) {
  return Usuario.create({
    correo,
    password_hash: null,
    rol_id: rolId,
    estado: 'activo',
    fecha_verificacion: new Date(),
  });
}

async function vincularIdentidadOAuth({ usuarioId, proveedor, proveedorUid, correoProveedor }) {
  return IdentidadOAuth.create({
    usuario_id: usuarioId,
    proveedor,
    proveedor_uid: proveedorUid,
    correo_proveedor: correoProveedor,
  });
}

async function tienePerfilVoluntario(usuarioId) {
  return !!(await PerfilVoluntario.findOne({ where: { usuario_id: usuarioId } }));
}

module.exports = {
  obtenerParametroSistema,
  buscarRolPorNombre,
  buscarUsuarioPorCorreo,
  buscarUsuarioPorId,
  crearUsuarioConPerfilVoluntario,
  crearUsuarioConOrganizacion,
  guardarCodigoVerificacion,
  buscarUltimoCodigoVigente,
  buscarUltimoCodigoDeCualquierEstado,
  marcarUsuarioVerificado,
  registrarIntentoFallido,
  reiniciarIntentosFallidos,
  guardarTokenRecuperacion,
  buscarTokenRecuperacionVigente,
  actualizarPassword,
  buscarIdentidadOAuth,
  crearUsuarioOAuth,
  vincularIdentidadOAuth,
  tienePerfilVoluntario,
};