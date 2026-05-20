class AnalysisResult {
  final String id;
  final String diseaseName;
  final double confidence;
  final String severity;
  final String cropType;
  final String description;
  final List<String> treatments;
  final String beforeImagePath;
  final String afterImagePath;

  AnalysisResult({
    required this.id,
    required this.diseaseName,
    required this.confidence,
    required this.severity,
    required this.cropType,
    required this.description,
    required this.treatments,
    required this.beforeImagePath,
    required this.afterImagePath,
  });

  factory AnalysisResult.fromJson(Map<String, dynamic> json) {
    return AnalysisResult(
      id: json['id'] ?? '',
      diseaseName: json['diseaseName'] ?? '',
      confidence: (json['confidence'] ?? 0).toDouble(),
      severity: json['severity'] ?? '',
      cropType: json['cropType'] ?? '',
      description: json['description'] ?? '',
      treatments: List<String>.from(json['treatments'] ?? []),
      beforeImagePath: json['beforeImagePath'] ?? '',
      afterImagePath: json['afterImagePath'] ?? '',
    );
  }

  static AnalysisResult mock() => AnalysisResult(
        id: 'res_001',
        diseaseName: 'Tomato Late Blight',
        confidence: 0.94,
        severity: 'High',
        cropType: 'Tomato',
        description:
            'Late blight is a destructive disease caused by Phytophthora infestans. It spreads rapidly under cool, wet conditions and can cause significant crop loss within days.',
        treatments: [
          'Apply copper-based fungicide every 7-10 days',
          'Remove and destroy all infected plant parts immediately',
          'Ensure proper plant spacing to improve air circulation',
          'Avoid overhead irrigation; use drip irrigation',
          'Monitor neighboring plants for spread',
        ],
        beforeImagePath: '',
        afterImagePath: '',
      );
}
