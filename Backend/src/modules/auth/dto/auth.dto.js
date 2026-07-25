// src/modules/auth/dto/auth.dto.js
function respuestaAuth({ token, usuario, mensaje, perfilCompleto }) {
  return {
    mensaje,
    token,
    usuario: usuario
      ? { id: usuario.id, correo: usuario.correo, rol: usuario.rol }
      : undefined,
    ...(perfilCompleto !== undefined ? { perfilCompleto } : {}),
  };
}

module.exports = { respuestaAuth };