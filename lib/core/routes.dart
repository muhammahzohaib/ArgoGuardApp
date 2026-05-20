import 'package:flutter/material.dart';
import '../ui/screens/splash_screen.dart';
import '../ui/screens/auth/login_screen.dart';
import '../ui/screens/auth/register_screen.dart';
import '../ui/screens/auth/otp_screen.dart';
import '../ui/screens/dashboard_screen.dart';
import '../ui/screens/upload_disease_screen.dart';
import '../ui/screens/ai_analysis_screen.dart';
import '../ui/screens/agent_logs_screen.dart';
import '../ui/screens/notifications_screen.dart';

class AppRoutes {
  static const String splash = '/';
  static const String login = '/login';
  static const String register = '/register';
  static const String otp = '/otp';
  static const String dashboard = '/dashboard';
  static const String upload = '/upload';
  static const String analysis = '/analysis';
  static const String logs = '/logs';
  static const String notifications = '/notifications';

  static Map<String, WidgetBuilder> getRoutes() {
    return {
      splash: (context) => const SplashScreen(),
      login: (context) => const LoginScreen(),
      register: (context) => const RegisterScreen(),
      otp: (context) => const OtpScreen(),
      dashboard: (context) => const DashboardScreen(),
      upload: (context) => const UploadDiseaseScreen(),
      analysis: (context) => const AiAnalysisScreen(),
      logs: (context) => const AgentLogsScreen(),
      notifications: (context) => const NotificationsScreen(),
    };
  }
}

