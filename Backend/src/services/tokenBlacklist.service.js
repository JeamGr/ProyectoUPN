// src/services/tokenBlacklist.service.js
// RF-007: invalidación server-side de JWT vía blacklist en Redis.
// No guardamos el JWT completo como clave (es largo y viaja por logs);
// guardamos su hash. El valor no importa, solo la existencia de la clave.
const crypto = require('crypto');
const redis = require('../config/redis/redis.config');
const logger = require('./../utils/logger');

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// segundosHastaExpirar: SIEMPRE el tiempo que le queda al JWT (su 'exp'),
// no un TTL fijo. Así la entrada en Redis se autolimpia justo cuando el
// token habría expirado de todas formas — nunca la dejamos más tiempo del
// necesario.
async function invalidarToken(token, segundosHastaExpirar) {
  if (segundosHastaExpirar <= 0) return; // el token ya expiró, no hace falta guardarlo
  const clave = `blacklist:${hashToken(token)}`;
  await redis.set(clave, '1', 'EX', segundosHastaExpirar);
}

async function tokenInvalidado(token) {
  const clave = `blacklist:${hashToken(token)}`;
  const existe = await redis.get(clave);
  return !!existe;
}

module.exports = { invalidarToken, tokenInvalidado };
