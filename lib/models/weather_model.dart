class WeatherModel {
  final int temperature;
  final int windspeed;
  final int weatherCode;
  final String weatherDescription;
  final String weatherIcon;
  final int precipitationProbability;
  final bool isDay;
  final String timezone;
  final List<String> recommendations;

  WeatherModel({
    required this.temperature,
    required this.windspeed,
    required this.weatherCode,
    required this.weatherDescription,
    required this.weatherIcon,
    required this.precipitationProbability,
    required this.isDay,
    required this.timezone,
    required this.recommendations,
  });

  factory WeatherModel.fromJson(Map<String, dynamic> json) {
    return WeatherModel(
      temperature: (json['temperature'] as num).toInt(),
      windspeed: (json['windspeed'] as num).toInt(),
      weatherCode: (json['weatherCode'] as num).toInt(),
      weatherDescription: json['weatherDescription'] ?? 'Unknown',
      weatherIcon: json['weatherIcon'] ?? '🌡️',
      precipitationProbability: (json['precipitationProbability'] as num).toInt(),
      isDay: json['isDay'] ?? true,
      timezone: json['timezone'] ?? 'UTC',
      recommendations: List<String>.from(json['recommendations'] ?? []),
    );
  }

  /// Mock data for fallback / offline mode
  factory WeatherModel.mock() {
    return WeatherModel(
      temperature: 28,
      windspeed: 12,
      weatherCode: 1,
      weatherDescription: 'Mainly Clear',
      weatherIcon: '🌤️',
      precipitationProbability: 10,
      isDay: true,
      timezone: 'Asia/Karachi',
      recommendations: [
        '✅ Ideal weather conditions for crop inspection, harvesting, and field operations.',
        '🌿 Weather is suitable for routine farm activities. No special precautions needed.',
      ],
    );
  }
}
