// src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const routes = require('./routes/index');
const errorMiddleware = require('./middlewares/error.middleware');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use(routes);

app.get('/health', (req, res) => res.json({ estado: 'ok' }));

// SIEMPRE al final: cualquier next(err) de cualquier ruta cae aquí.
app.use(errorMiddleware);

module.exports = app;
