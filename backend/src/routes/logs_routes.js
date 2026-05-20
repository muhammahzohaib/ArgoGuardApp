const express = require('express');
const { getAgentLogs } = require('../controllers/logs_controller');
const { protect } = require('../middleware/auth_middleware');

const router = express.Router();

router.get('/', protect, getAgentLogs);

module.exports = router;
