import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Very light, clean modern agricultural palette
  static const Color primaryGreen = Color(0xFF10B981); // Modern Emerald Green
  static const Color lightGreen = Color(0xFFD1FAE5); // Very soft mint green for backgrounds/chips
  static const Color darkGreen = Color(0xFF047857); // Rich dark emerald for text/headers
  static const Color background = Color(0xFFF8FAFC); // Extremely clean off-white / light slate
  static const Color surface = Colors.white; // Pure white
  static const Color textPrimary = Color(0xFF0F172A); // Deep slate/almost black
  static const Color textSecondary = Color(0xFF64748B); // Cool grey for descriptions
  static const Color border = Color(0xFFE2E8F0); // Subtle borders
  static const Color error = Color(0xFFEF4444); // Soft modern red

  static ThemeData get lightTheme {
    return ThemeData(
      primaryColor: primaryGreen,
      scaffoldBackgroundColor: background,
      colorScheme: ColorScheme.light(
        primary: primaryGreen,
        secondary: lightGreen,
        surface: surface,
        error: error,
        onPrimary: Colors.white,
        onSecondary: darkGreen,
        onSurface: textPrimary,
      ),
      textTheme: GoogleFonts.outfitTextTheme().copyWith(
        displayLarge: GoogleFonts.outfit(fontSize: 32, fontWeight: FontWeight.w800, color: textPrimary),
        titleLarge: GoogleFonts.outfit(fontSize: 20, fontWeight: FontWeight.bold, color: textPrimary),
        bodyLarge: GoogleFonts.outfit(fontSize: 16, color: textPrimary, fontWeight: FontWeight.w500),
        bodyMedium: GoogleFonts.outfit(fontSize: 14, color: textSecondary),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryGreen,
          foregroundColor: Colors.white,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
        ),
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: surface,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.bold, color: textPrimary),
        iconTheme: const IconThemeData(color: textPrimary),
        shape: const Border(
          bottom: BorderSide(color: border, width: 1),
        ),
      ),
      cardTheme: CardThemeData(
        color: surface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: border, width: 1),
        ),
      ),
    );
  }
}
