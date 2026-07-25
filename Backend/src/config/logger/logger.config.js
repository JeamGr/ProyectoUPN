// src/config/logger/logger.config.js
// Logger mínimo. Cuando quieran algo más robusto (rotación de archivos,
// niveles configurables, etc.) esto se reemplaza por winston sin tocar
// quién lo consume, porque todos importan desde src/utils/logger.js.
const logger = {
  info: (...args) => console.log('[INFO]', new Date().toISOString(), ...args),
  warn: (...args) => console.warn('[WARN]', new Date().toISOString(), ...args),
  error: (...args) => console.error('[ERROR]', new Date().toISOString(), ...args),
};

module.exports = logger;
