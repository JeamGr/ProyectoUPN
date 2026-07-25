// src/routes/index.js
const { Router } = require('express');
const apiV1 = require('./api');

const router = Router();

router.use('/api/v1', apiV1);

module.exports = router;
