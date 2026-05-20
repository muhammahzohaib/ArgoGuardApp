const express = require('express');
const { triggerAction, getActionsList, getActionDetail } = require('../controllers/actions_controller');
const { protect } = require('../middleware/auth_middleware');

const router = express.Router();

router.post('/', protect, triggerAction);
router.get('/', protect, getActionsList);
router.get('/:id', protect, getActionDetail);

module.exports = router;
