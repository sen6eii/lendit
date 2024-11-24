const express = require('express');
const userRoutes = require('./userRoutes');
const groupRoutes = require('./groupRoutes');
const resourceRoutes = require('./resourceRoutes');
const loanRoutes = require('./loanRoutes');

const router = express.Router();

// Configurar las rutas con sus respectivos prefijos
router.use('/users', userRoutes);
router.use('/groups', groupRoutes);
router.use('/resources', resourceRoutes);
router.use('/loans', loanRoutes);

module.exports = router;
