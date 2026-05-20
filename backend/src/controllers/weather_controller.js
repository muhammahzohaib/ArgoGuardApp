const weatherService = require('../services/weather_service');
const logger = require('../utils/logger');

const getWeather = async (req, res, next) => {
  try {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Query parameters "latitude" and "longitude" are required.',
      });
    }

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates. Latitude must be -90 to 90, longitude -180 to 180.',
      });
    }

    const weatherData = await weatherService.fetchWeather(lat, lon);

    res.status(200).json({
      success: true,
      data: weatherData,
    });
  } catch (error) {
    logger.error('[WeatherController] Failed to fetch weather data', { error: error.message });
    next(error);
  }
};

module.exports = { getWeather };
