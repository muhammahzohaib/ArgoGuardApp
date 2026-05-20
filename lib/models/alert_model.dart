class AlertModel {
  final String id;
  final String title;
  final String description;
  final String severity; // 'low', 'medium', 'high'
  final DateTime timestamp;
  final String cropType;

  AlertModel({
    required this.id,
    required this.title,
    required this.description,
    required this.severity,
    required this.timestamp,
    required this.cropType,
  });

  factory AlertModel.fromJson(Map<String, dynamic> json) {
    return AlertModel(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      severity: json['severity'] ?? 'low',
      timestamp: DateTime.tryParse(json['timestamp'] ?? '') ?? DateTime.now(),
      cropType: json['cropType'] ?? '',
    );
  }

  // Mock data for demo
  static List<AlertModel> mockAlerts() => [
        AlertModel(
          id: '1',
          title: 'Leaf Blight Detected',
          description: 'Early signs of blight on tomato crop. Immediate action recommended.',
          severity: 'high',
          timestamp: DateTime.now().subtract(const Duration(hours: 2)),
          cropType: 'Tomato',
        ),
        AlertModel(
          id: '2',
          title: 'Low Soil Moisture',
          description: 'Wheat field moisture below optimal threshold.',
          severity: 'medium',
          timestamp: DateTime.now().subtract(const Duration(hours: 5)),
          cropType: 'Wheat',
        ),
        AlertModel(
          id: '3',
          title: 'Pest Activity',
          description: 'Low-level aphid presence detected on corn leaves.',
          severity: 'low',
          timestamp: DateTime.now().subtract(const Duration(days: 1)),
          cropType: 'Corn',
        ),
      ];
}
