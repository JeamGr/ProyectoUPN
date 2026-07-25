// src/constants/messages.js
// REEMPLAZA por completo tu archivo anterior (le agregué las claves de
// reenvío de código y recuperación de contraseña).
module.exports = Object.freeze({
  AUTH: {
    CORREO_YA_REGISTRADO: 'Este correo ya está registrado. Si es tuyo, intenta recuperar tu contraseña.',
    REGISTRO_VOLUNTARIO_OK: 'Cuenta creada. Revisa tu correo para verificarla.',
    REGISTRO_ORGANIZACION_OK: 'Cuenta creada. Revisa tu correo para verificarla.',
    CODIGO_INVALIDO: 'El código ingresado no es válido.',
    CODIGO_EXPIRADO: 'El código expiró. Solicita uno nuevo.',
    CODIGO_REENVIADO: 'Te enviamos un nuevo código a tu correo.',
    ESPERA_ANTES_DE_REENVIAR: 'Espera un momento antes de solicitar otro código.',
    CUENTA_VERIFICADA: 'Cuenta verificada correctamente. Ya puedes iniciar sesión.',
    CREDENCIALES_INVALIDAS: 'Correo o contraseña incorrectos.',
    CUENTA_NO_VERIFICADA: 'Debes verificar tu correo antes de iniciar sesión. Te reenviamos el código.',
    CUENTA_BLOQUEADA: 'Tu cuenta está bloqueada temporalmente por múltiples intentos fallidos. Contacta a soporte.',
    LOGIN_OK: 'Inicio de sesión exitoso.',
    CORREO_NO_ENCONTRADO_GENERICO:
      'Si el correo está registrado, te enviamos instrucciones para restablecer tu contraseña.',
    TOKEN_RECUPERACION_INVALIDO: 'El enlace de recuperación no es válido o ya fue usado.',
    TOKEN_RECUPERACION_EXPIRADO: 'El enlace de recuperación expiró. Solicita uno nuevo.',
    PASSWORD_ACTUALIZADA: 'Tu contraseña se actualizó correctamente. Ya puedes iniciar sesión.',
  },
});
