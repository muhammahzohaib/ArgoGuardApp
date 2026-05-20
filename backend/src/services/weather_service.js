const https = require('https');
const logger = require('../utils/logger');

/**
 * WMO Weather interpretation codes → human-readable description
 * https://open-meteo.com/en/docs#weathervariables
 */
const WMO_CODE_MAP = {
  0:  { label: 'Clear Sky',               icon: '☀️' },
  1:  { label: 'Mainly Clear',            icon: '🌤️' },
  2:  { label: 'Partly Cloudy',           icon: '⛅' },
  3:  { label: 'Overcast',               icon: '☁️' },
  45: { label: 'Foggy',                  icon: '🌫️' },
  48: { label: 'Icy Fog',                icon: '🌫️' },
  51: { label: 'Light Drizzle',          icon: '🌦️' },
  53: { label: 'Moderate Drizzle',       icon: '🌦️' },
  55: { label: 'Dense Drizzle',          icon: '🌧️' },
  61: { label: 'Slight Rain',            icon: '🌧️' },
  63: { label: 'Moderate Rain',          icon: '🌧️' },
  65: { label: 'Heavy Rain',             icon: '🌧️' },
  71: { label: 'Slight Snow',            icon: '❄️' },
  73: { label: 'Moderate Snow',          icon: '❄️' },
  75: { label: 'Heavy Snow',             icon: '❄️' },
  80: { label: 'Slight Rain Showers',    icon: '🌦️' },
  81: { label: 'Moderate Rain Showers',  icon: '🌧️' },
  82: { label: 'Violent Rain Showers',   icon: '⛈️' },
  95: { label: 'Thunderstorm',           icon: '⛈️' },
  99: { label: 'Thunderstorm w/ Hail',   icon: '⛈️' },
};

/**
 * Rule-based agricultural recommendations based on live weather data.
 */
const buildFarmingRecommendations = ({ temperature, windspeed, precipitationProbability, weatherCode }) => {
  const recommendations = [];

  // Wind-based rules
  if (windspeed > 30) {
    recommendations.push('🚫 Strong winds! Cancel all drone spraying operations immediately.');
  } else if (windspeed > 20) {
    recommendations.push('⚠️ High wind speed detected. Suspend pesticide spraying to prevent drift.');
  }

  // Precipitation rules
  if (precipitationProbability >= 70) {
    recommendations.push('🌧️ Heavy rain likely. Suspend irrigation and delay fertilizer application.');
  } else if (precipitationProbability >= 40) {
    recommendations.push('🌦️ Rain expected. Consider skipping irrigation cycles today.');
  }

  // Temperature rules
  if (temperature >= 40) {
    recommendations.push('🔥 Extreme heat! Monitor crop moisture closely and increase irrigation frequency.');
  } else if (temperature >= 35) {
    recommendations.push('🌡️ High temperature. Check soil moisture levels and water sensitive crops.');
  } else if (temperature <= 5) {
    recommendations.push('❄️ Near-frost conditions. Protect frost-sensitive crops immediately.');
  }

  // Weather code rules
  if ([95, 99, 82].includes(weatherCode)) {
    recommendations.push('⛈️ Severe storm alert! All field operations should be halted for safety.');
  } else if ([0, 1].includes(weatherCode) && precipitationProbability < 20 && temperature > 15 && temperature < 35) {
    recommendations.push('✅ Ideal weather conditions for crop inspection, harvesting, and field operations.');
  }

  if (recommendations.length === 0) {
    recommendations.push('🌿 Weather is suitable for routine farm activities. No special precautions needed.');
  }

  return recommendations;
};

/**
 * Fetches real-time weather from Open-Meteo for given coordinates.
 */
const fetchWeather = (latitude, longitude) => {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
      current_weather: 'true',
      hourly: 'precipitation_probability',
      forecast_days: '1',
      timezone: 'auto',
    });

    const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
    logger.info(`[WeatherService] Fetching weather for lat=${latitude}, lon=${longitude}`);

    https.get(url, (res) => {
      let rawData = '';
      res.on('data', chunk => { rawData += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(rawData);

          if (parsed.error) {
            return reject(new Error(`Open-Meteo error: ${parsed.reason}`));
          }

          const current = parsed.current_weather;
          const precipProbabilities = parsed.hourly?.precipitation_probability ?? [];
          // Average the next 6 hours of precipitation probability
          const nextSixHours = precipProbabilities.slice(0, 6);
          const precipitationProbability = nextSixHours.length > 0
            ? Math.round(nextSixHours.reduce((a, b) => a + b, 0) / nextSixHours.length)
            : 0;

          const weatherCode = current.weathercode;
          const weatherInfo = WMO_CODE_MAP[weatherCode] ?? { label: 'Unknown', icon: '🌡️' };

          const weatherData = {
            temperature: Math.round(current.temperature),
            windspeed: Math.round(current.windspeed),
            weatherCode,
            weatherDescription: weatherInfo.label,
            weatherIcon: weatherInfo.icon,
            precipitationProbability,
            isDay: current.is_day === 1,
            timezone: parsed.timezone ?? 'UTC',
          };

          const recommendations = buildFarmingRecommendations(weatherData);
          logger.info(`[WeatherService] Weather fetched: ${weatherData.weatherDescription}, ${weatherData.temperature}°C`);

          resolve({ ...weatherData, recommendations });
        } catch (err) {
          reject(new Error(`Failed to parse weather response: ${err.message}`));
        }
      });
    }).on('error', (err) => {
      reject(new Error(`HTTP request to Open-Meteo failed: ${err.message}`));
    });
  });
};

module.exports = { fetchWeather };
