// Ejecutar dentro de Backend/ con: node generar_hash_seed.js
// (usa el mismo bcryptjs y 10 rounds que registro-voluntario.service.ts)
const bcrypt = require('bcryptjs');

const PASSWORD_DE_PRUEBA = 'Test1234';

bcrypt.hash(PASSWORD_DE_PRUEBA, 10).then((hash) => {
    console.log('Password en texto plano:', PASSWORD_DE_PRUEBA);
    console.log('Hash a pegar en seed_m5.sql (reemplaza TODOS los $HASH_BCRYPT$):');
    console.log(hash);
});
