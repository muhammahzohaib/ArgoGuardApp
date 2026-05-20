import 'package:flutter/material.dart';
import '../models/weather_model.dart';
import '../services/api_service.dart';

class WeatherLocation {
  final String name;
  final double latitude;
  final double longitude;
  final String flag;

  const WeatherLocation({
    required this.name,
    required this.latitude,
    required this.longitude,
    required this.flag,
  });
}

class WeatherProvider extends ChangeNotifier {
  static const List<WeatherLocation> availableLocations = [
    WeatherLocation(name: 'Faisalabad, PK',  latitude: 31.4504, longitude: 73.1350, flag: '🇵🇰'),
    WeatherLocation(name: 'Multan, PK',      latitude: 30.1978, longitude: 71.4711, flag: '🇵🇰'),
    WeatherLocation(name: 'Lahore, PK',      latitude: 31.5497, longitude: 74.3436, flag: '🇵🇰'),
    WeatherLocation(name: 'Karachi, PK',     latitude: 24.8607, longitude: 67.0011, flag: '🇵🇰'),
    WeatherLocation(name: 'California, US',  latitude: 36.7783, longitude: -119.4179, flag: '🇺🇸'),
    WeatherLocation(name: 'Iowa, US',        latitude: 42.0046, longitude: -93.2140, flag: '🇺🇸'),
    WeatherLocation(name: 'London, UK',      latitude: 51.5072, longitude: -0.1276, flag: '🇬🇧'),
    WeatherLocation(name: 'Punjab, IN',      latitude: 31.1471, longitude: 75.3412, flag: '🇮🇳'),
  ];

  WeatherModel? _weather;
  bool _isLoading = false;
  String? _error;
  WeatherLocation _selectedLocation = availableLocations[0];

  WeatherModel? get weather => _weather;
  bool get isLoading => _isLoading;
  String? get error => _error;
  WeatherLocation get selectedLocation => _selectedLocation;

  final ApiService _api = ApiService();

  Future<void> loadWeather({WeatherLocation? location}) async {
    final loc = location ?? _selectedLocation;
    if (location != null) {
      _selectedLocation = loc;
    }

    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _weather = await _api.getWeather(loc.latitude, loc.longitude);
    } catch (e) {
      _error = e.toString();
      // Fallback to mock so the UI never breaks
      _weather = WeatherModel.mock();
    }

    _isLoading = false;
    notifyListeners();
  }
}
