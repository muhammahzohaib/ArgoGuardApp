const express = require('express');
const { getWeather } = require('../controllers/weather_controller');
const { protect } = require('../middleware/auth_middleware');

const router = express.Router();

router.get('/', protect, getWeather);

module.exports = router;
