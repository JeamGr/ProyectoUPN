// src/routes/api.js
// Aquí se van a ir montando el resto de módulos a medida que tengan código:
// router.use('/opportunities', require('../modules/opportunities/routes/opportunities.routes'));
const { Router } = require('express');
const authRoutes = require('../modules/auth/routes/auth.routes');

const router = Router();

router.use('/auth', authRoutes);

module.exports = router;
