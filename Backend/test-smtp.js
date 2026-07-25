require('dotenv').config();
const { crearTransportador } = require('./src/config/mail/mail.config');

async function probar() {
  const transportador = crearTransportador();
  try {
    await transportador.verify();
    console.log('✅ Conexión SMTP verificada correctamente.');

    const info = await transportador.sendMail({
      from: process.env.SMTP_FROM,
      to: 'jeampiergarcia06@gmail.com', // cambia esto por el correo donde quieres recibirlo
      subject: 'Prueba SMTP - Yanantin',
      text: 'Si ves esto, el SMTP quedó funcionando.',
    });
    console.log('✅ Correo enviado. ID:', info.messageId);
  } catch (err) {
    console.error('❌ Falló:', err.message);
    console.error(err);
  }
}

probar();