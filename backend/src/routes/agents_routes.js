const express = require('express');
const { getAgentsList } = require('../controllers/agents_controller');
const { protect } = require('../middleware/auth_middleware');

const router = express.Router();

router.get('/', protect, getAgentsList);

module.exports = router;
