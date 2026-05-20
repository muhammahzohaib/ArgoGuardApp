import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/routes.dart';
import '../../../core/theme.dart';
import '../../../providers/auth_provider.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/custom_text_field.dart';
import '../../widgets/logo_widget.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  bool _isOtpMode = false;
  String? _errorMessage;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _handleAuthentication() async {
    final email = _emailController.text.trim();
    final password = _passwordController.text;

    if (email.isEmpty) {
      setState(() => _errorMessage = 'Please enter your email address.');
      return;
    }

    setState(() => _errorMessage = null);
    final authProvider = Provider.of<AuthProvider>(context, listen: false);

    if (_isOtpMode) {
      // OTP verification flow
      final success = await authProvider.sendOtp(email);
      if (success) {
        if (!mounted) return;
        Navigator.pushNamed(
          context, 
          AppRoutes.otp, 
          arguments: email,
        );
      } else {
        setState(() => _errorMessage = authProvider.error ?? 'Failed to send OTP. Please try again.');
      }
    } else {
      // Password flow
      if (password.isEmpty) {
        setState(() => _errorMessage = 'Please enter your password.');
        return;
      }
      final success = await authProvider.login(email, password);
      if (success) {
        if (!mounted) return;
        Navigator.pushReplacementNamed(context, AppRoutes.dashboard);
      } else {
        setState(() => _errorMessage = authProvider.error ?? 'Invalid email or password.');
      }
    }
  }

  void _handleSocialLogin(String provider) async {
    setState(() => _errorMessage = null);
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    
    // Simulate token retrieval from Google/FB/Twitter SDKs
    final String simulatedToken = 'social_token_for_$provider';
    final success = await authProvider.socialLogin(provider, simulatedToken);

    if (!mounted) return;
    if (success) {
      Navigator.pushReplacementNamed(context, AppRoutes.dashboard);
    } else {
      setState(() => _errorMessage = authProvider.error ?? '$provider authentication failed.');
    }
  }

  Widget _buildSocialButton({
    required IconData icon,
    required String label,
    required Color color,
    required Color textColor,
    required VoidCallback onPressed,
  }) {
    return Expanded(
      child: GestureDetector(
        onTap: onPressed,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 14),
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppTheme.border, width: 1),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.02),
                blurRadius: 6,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 20, color: textColor),
              const SizedBox(width: 8),
              Text(
                label,
                style: TextStyle(
                  color: textColor,
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);

    return Scaffold(
      backgroundColor: AppTheme.background,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 30.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 10),
              const Center(
                child: LogoWidget(
                  size: 76,
                  showText: false,
                ),
              ),
              const SizedBox(height: 28),
              Center(
                child: Column(
                  children: [
                    Text(
                      'Welcome to AgroGuard',
                      style: Theme.of(context).textTheme.displayLarge?.copyWith(
                            fontSize: 28,
                          ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Multi-Agent Crop Diagnostics & Management',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: AppTheme.textSecondary,
                            fontWeight: FontWeight.w500,
                          ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 36),
              
              // Dynamic Mode Switcher (Pill tab layout)
              Container(
                padding: const EdgeInsets.all(4.0),
                decoration: BoxDecoration(
                  color: AppTheme.border.withOpacity(0.4),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: GestureDetector(
                        onTap: () => setState(() => _isOtpMode = false),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          decoration: BoxDecoration(
                            color: !_isOtpMode ? Colors.white : Colors.transparent,
                            borderRadius: BorderRadius.circular(12),
                            boxShadow: !_isOtpMode ? [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.05),
                                blurRadius: 6,
                                offset: const Offset(0, 2),
                              )
                            ] : null,
                          ),
                          child: Center(
                            child: Text(
                              'Password',
                              style: TextStyle(
                                color: !_isOtpMode ? AppTheme.textPrimary : AppTheme.textSecondary,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                    Expanded(
                      child: GestureDetector(
                        onTap: () => setState(() => _isOtpMode = true),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          decoration: BoxDecoration(
                            color: _isOtpMode ? Colors.white : Colors.transparent,
                            borderRadius: BorderRadius.circular(12),
                            boxShadow: _isOtpMode ? [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.05),
                                blurRadius: 6,
                                offset: const Offset(0, 2),
                              )
                            ] : null,
                          ),
                          child: Center(
                            child: Text(
                              'Instant OTP',
                              style: TextStyle(
                                color: _isOtpMode ? AppTheme.textPrimary : AppTheme.textSecondary,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),

              CustomTextField(
                controller: _emailController,
                hintText: 'Email Address',
                prefixIcon: Icons.email_outlined,
              ),
              if (!_isOtpMode) ...[
                const SizedBox(height: 16),
                CustomTextField(
                  controller: _passwordController,
                  hintText: 'Password',
                  prefixIcon: Icons.lock_outline,
                  obscureText: true,
                ),
              ],
              
              if (_errorMessage != null) ...[
                const SizedBox(height: 16),
                Text(
                  _errorMessage!,
                  style: const TextStyle(
                    color: AppTheme.error,
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
              
              const SizedBox(height: 32),
              CustomButton(
                text: _isOtpMode ? 'Send Verification OTP' : 'Sign In',
                isLoading: authProvider.isLoading,
                onPressed: _handleAuthentication,
              ),
              const SizedBox(height: 32),
              
              // Divider
              Row(
                children: [
                  const Expanded(child: Divider(color: AppTheme.border, thickness: 1)),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Text(
                      'Or connect via social',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: AppTheme.textSecondary,
                            fontWeight: FontWeight.w600,
                            fontSize: 12,
                          ),
                    ),
                  ),
                  const Expanded(child: Divider(color: AppTheme.border, thickness: 1)),
                ],
              ),
              const SizedBox(height: 24),

              // Social Authentication Grid
              Row(
                children: [
                  _buildSocialButton(
                    icon: LucideIcons.chrome,
                    label: 'Google',
                    color: Colors.white,
                    textColor: AppTheme.textPrimary,
                    onPressed: () => _handleSocialLogin('Google'),
                  ),
                  const SizedBox(width: 12),
                  _buildSocialButton(
                    icon: LucideIcons.facebook,
                    label: 'Facebook',
                    color: const Color(0xFF1877F2),
                    textColor: Colors.white,
                    onPressed: () => _handleSocialLogin('Facebook'),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  _buildSocialButton(
                    icon: LucideIcons.twitter,
                    label: 'Twitter / X',
                    color: Colors.black,
                    textColor: Colors.white,
                    onPressed: () => _handleSocialLogin('Twitter'),
                  ),
                ],
              ),
              const SizedBox(height: 32),

              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'Don\'t have an account?', 
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                  TextButton(
                    onPressed: () => Navigator.pushNamed(context, AppRoutes.register),
                    child: const Text(
                      'Register Now',
                      style: TextStyle(
                        color: AppTheme.primaryGreen,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
