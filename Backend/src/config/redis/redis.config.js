// src/config/redis/redis.config.js
const Redis = require('ioredis');
const logger = require('../../utils/logger');
require('dotenv').config();

const redis = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL)
  : new Redis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: 2,
    });

redis.on('error', (err) => {
  logger.error('Error de conexión a Redis:', err.message);
});

redis.on('connect', () => {
  logger.info('Conectado a Redis.');
});

module.exports = redis;
