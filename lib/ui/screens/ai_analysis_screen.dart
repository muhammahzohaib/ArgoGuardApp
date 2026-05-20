import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme.dart';
import '../../core/routes.dart';
import '../../providers/analysis_provider.dart';
import '../widgets/before_after_slider.dart';
import '../widgets/custom_button.dart';

class AiAnalysisScreen extends StatelessWidget {
  const AiAnalysisScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<AnalysisProvider>();
    final result = provider.currentResult;
    final image = provider.selectedImage;

    if (result == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('AI Analysis')),
        body: const Center(
          child: Text('No active analysis results. Please scan an image.'),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Diagnosis Result'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () {
            provider.clearCurrentAnalysis();
            Navigator.popUntil(context, ModalRoute.withName(AppRoutes.dashboard));
          },
        ),
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ── Header Summary ──────────────────────────────────────────
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.05),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.red.withOpacity(0.1),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.coronavirus_outlined, color: Colors.red, size: 28),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            result.diseaseName,
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: AppTheme.textPrimary,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Crop: ${result.cropType} • ${(result.confidence * 100).toInt()}% Confidence',
                            style: const TextStyle(
                              fontSize: 13,
                              color: AppTheme.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // ── Before vs After Slider ──────────────────────────────────
              const Text(
                'Treatment Simulation (Before vs After)',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.textPrimary,
                ),
              ),
              const SizedBox(height: 12),
              BeforeAfterSlider(
                beforeImage: image,
                beforeLabel: 'Diseased (Current)',
                afterLabel: 'Healthy (Treated)',
              ),
              const SizedBox(height: 24),

              // ── Description ─────────────────────────────────────────────
              const Text(
                'Description',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.textPrimary,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                result.description,
                style: const TextStyle(
                  fontSize: 14,
                  color: AppTheme.textSecondary,
                  height: 1.5,
                ),
              ),
              const SizedBox(height: 24),

              // ── Severity and Stats ──────────────────────────────────────
              Row(
                children: [
                  Expanded(
                    child: _InfoBox(
                      title: 'Severity Level',
                      value: result.severity,
                      color: Colors.red,
                      icon: Icons.speed,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: _InfoBox(
                      title: 'Spread Risk',
                      value: 'Moderate',
                      color: Colors.orange,
                      icon: Icons.trending_up,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // ── Treatment Actions ───────────────────────────────────────
              const Text(
                'Recommended Treatments',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.textPrimary,
                ),
              ),
              const SizedBox(height: 12),
              ...result.treatments.map((treatment) => Padding(
                    padding: const EdgeInsets.only(bottom: 8.0),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(Icons.check_circle_outline, color: AppTheme.primaryGreen, size: 20),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            treatment,
                            style: const TextStyle(
                              fontSize: 14,
                              color: AppTheme.textSecondary,
                              height: 1.4,
                            ),
                          ),
                        ),
                      ],
                    ),
                  )),
              const SizedBox(height: 32),

              // ── Bottom Action ───────────────────────────────────────────
              CustomButton(
                text: 'Done & Return to Dashboard',
                onPressed: () {
                  provider.clearCurrentAnalysis();
                  Navigator.popUntil(context, ModalRoute.withName(AppRoutes.dashboard));
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _InfoBox extends StatelessWidget {
  final String title;
  final String value;
  final Color color;
  final IconData icon;

  const _InfoBox({
    required this.title,
    required this.value,
    required this.color,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(height: 8),
          Text(
            title,
            style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: color),
          ),
        ],
      ),
    );
  }
}
