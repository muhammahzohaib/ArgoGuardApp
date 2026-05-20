const express = require('express');
const { getDashboardStats } = require('../controllers/dashboard_controller');
const { protect } = require('../middleware/auth_middleware');

const router = express.Router();

router.get('/', protect, getDashboardStats);

module.exports = router;
