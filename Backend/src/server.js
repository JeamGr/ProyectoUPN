// src/server.js
require('dotenv').config();
const app = require('./app');
const sequelize = require('./config/database/database.config');
const logger = require('./utils/logger');

const PUERTO = process.env.PORT || 3000;

async function iniciar() {
  try {
    await sequelize.authenticate();
    logger.info('Conexión a la base de datos establecida.');

    // Nunca uses sync({ force: true }) ni alter en producción: el schema
    // ya está definido en schema_final.sql y es la fuente de verdad.
    app.listen(PUERTO, () => {
      logger.info(`Servidor escuchando en el puerto ${PUERTO}`);
    });
  } catch (err) {
    logger.error('No se pudo iniciar el servidor:', err);
    process.exit(1);
  }
}

iniciar();
