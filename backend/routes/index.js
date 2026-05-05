const express = require('express');
const userRoutes = require('./userRoutes');
const groupRoutes = require('./groupRoutes');
const resourceRoutes = require('./resourceRoutes');
const loanRoutes = require('./loanRoutes');
const notificationRoutes = require('./notificationRoutes');

const router = express.Router();

router.use('/users', userRoutes);
router.use('/groups', groupRoutes);
router.use('/resources', resourceRoutes);
router.use('/loans', loanRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;
