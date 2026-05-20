import 'dart:io';
import 'package:flutter/material.dart';
import '../../core/theme.dart';

class BeforeAfterSlider extends StatefulWidget {
  final File? beforeImage;
  final String beforeLabel;
  final String afterLabel;

  const BeforeAfterSlider({
    super.key,
    this.beforeImage,
    this.beforeLabel = 'Infected',
    this.afterLabel = 'Healthy',
  });

  @override
  State<BeforeAfterSlider> createState() => _BeforeAfterSliderState();
}

class _BeforeAfterSliderState extends State<BeforeAfterSlider> {
  double _dividerPosition = 0.5;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            _buildLegend(widget.beforeLabel, const Color(0xFFD32F2F)),
            const Spacer(),
            _buildLegend(widget.afterLabel, AppTheme.primaryGreen),
          ],
        ),
        const SizedBox(height: 10),
        ClipRRect(
          borderRadius: BorderRadius.circular(16),
          child: GestureDetector(
            onPanUpdate: (details) {
              final box = context.findRenderObject() as RenderBox?;
              if (box == null) return;
              final localPos = box.globalToLocal(details.globalPosition);
              setState(() {
                _dividerPosition = (localPos.dx / box.size.width).clamp(0.05, 0.95);
              });
            },
            child: SizedBox(
              height: 220,
              child: LayoutBuilder(
                builder: (ctx, constraints) {
                  final w = constraints.maxWidth;
                  final h = constraints.maxHeight;
                  return Stack(
                    children: [
                      // After (healthy - green gradient)
                      Container(
                        width: w,
                        height: h,
                        decoration: const BoxDecoration(
                          gradient: LinearGradient(
                            colors: [Color(0xFF81C784), Color(0xFF2E7D32)],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                        ),
                        child: Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.eco, color: Colors.white.withOpacity(0.6), size: 48),
                              const SizedBox(height: 8),
                              Text(
                                'Healthy Crop',
                                style: TextStyle(color: Colors.white.withOpacity(0.7), fontSize: 14),
                              ),
                            ],
                          ),
                        ),
                      ),
                      // Before (infected) – clipped to left portion
                      ClipRect(
                        child: Align(
                          alignment: Alignment.centerLeft,
                          widthFactor: _dividerPosition,
                          child: widget.beforeImage != null
                              ? Image.file(
                                  widget.beforeImage!,
                                  width: w,
                                  height: h,
                                  fit: BoxFit.cover,
                                )
                              : Container(
                                  width: w,
                                  height: h,
                                  decoration: const BoxDecoration(
                                    gradient: LinearGradient(
                                      colors: [Color(0xFFBF360C), Color(0xFFD32F2F)],
                                      begin: Alignment.topLeft,
                                      end: Alignment.bottomRight,
                                    ),
                                  ),
                                  child: Center(
                                    child: Column(
                                      mainAxisAlignment: MainAxisAlignment.center,
                                      children: [
                                        Icon(Icons.coronavirus_outlined,
                                            color: Colors.white.withOpacity(0.6), size: 48),
                                        const SizedBox(height: 8),
                                        Text(
                                          'Diseased Crop',
                                          style: TextStyle(
                                              color: Colors.white.withOpacity(0.7), fontSize: 14),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                        ),
                      ),
                      // Divider line
                      Positioned(
                        left: _dividerPosition * w - 1,
                        top: 0,
                        bottom: 0,
                        child: Container(
                          width: 2,
                          color: Colors.white,
                        ),
                      ),
                      // Drag handle
                      Positioned(
                        left: _dividerPosition * w - 18,
                        top: h / 2 - 18,
                        child: Container(
                          width: 36,
                          height: 36,
                          decoration: BoxDecoration(
                            color: Colors.white,
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.2),
                                blurRadius: 8,
                              ),
                            ],
                          ),
                          child: const Icon(Icons.swap_horiz,
                              color: AppTheme.primaryGreen, size: 20),
                        ),
                      ),
                    ],
                  );
                },
              ),
            ),
          ),
        ),
        const SizedBox(height: 8),
        Center(
          child: Text(
            'Drag to compare before & after treatment',
            style: TextStyle(fontSize: 12, color: AppTheme.textSecondary),
          ),
        ),
      ],
    );
  }

  Widget _buildLegend(String label, Color color) {
    return Row(
      children: [
        Container(
          width: 10,
          height: 10,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        const SizedBox(width: 6),
        Text(label, style: TextStyle(fontSize: 12, color: color, fontWeight: FontWeight.w600)),
      ],
    );
  }
}
