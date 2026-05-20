import 'package:flutter/material.dart';
import '../../core/theme.dart';

class LogoWidget extends StatelessWidget {
  final double size;
  final bool showText;
  final Color? textColor;

  const LogoWidget({
    super.key,
    this.size = 80,
    this.showText = true,
    this.textColor,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: size,
          height: size,
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [AppTheme.primaryGreen, AppTheme.darkGreen],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: AppTheme.primaryGreen.withOpacity(0.3),
                blurRadius: 20,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: Icon(
            Icons.eco,
            size: size * 0.55,
            color: Colors.white,
          ),
        ),
        if (showText) ...[
          const SizedBox(height: 16),
          Text(
            'AgroGuard AI',
            style: TextStyle(
              fontSize: size * 0.32,
              fontWeight: FontWeight.w900,
              color: textColor ?? AppTheme.textPrimary,
              letterSpacing: 0.5,
            ),
          ),
        ],
      ],
    );
  }
}
