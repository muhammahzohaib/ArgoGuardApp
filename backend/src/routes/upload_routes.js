const express = require('express');
const { handleUpload } = require('../controllers/upload_controller');
const { protect } = require('../middleware/auth_middleware');

const router = express.Router();

router.post('/', protect, handleUpload);

module.exports = router;
