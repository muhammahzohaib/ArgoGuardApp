import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/routes.dart';
import '../../../core/theme.dart';
import '../../../providers/auth_provider.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/custom_text_field.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  String? _errorMessage;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _handleRegister() async {
    final name = _nameController.text.trim();
    final email = _emailController.text.trim();
    final password = _passwordController.text;

    if (name.isEmpty || email.isEmpty || password.isEmpty) {
      setState(() => _errorMessage = 'Please fill out all required fields.');
      return;
    }

    if (password.length < 6) {
      setState(() => _errorMessage = 'Password must be at least 6 characters.');
      return;
    }

    setState(() => _errorMessage = null);
    final authProvider = Provider.of<AuthProvider>(context, listen: false);

    // Call registration
    final success = await authProvider.register(name, email, password);
    if (success) {
      // Send OTP for new account confirmation before routing to dashboard
      await authProvider.sendOtp(email);
      if (!mounted) return;
      // Route user to verification code entry screen
      Navigator.pushNamed(
        context,
        AppRoutes.otp,
        arguments: email,
      );
    } else {
      setState(() => _errorMessage = authProvider.error ?? 'Registration failed. Try again.');
    }
  }

  void _handleSocialRegister(String provider) async {
    setState(() => _errorMessage = null);
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    
    // Simulate token retrieval from Google/FB/Twitter SDKs
    final String simulatedToken = 'social_token_for_$provider';
    final success = await authProvider.socialLogin(provider, simulatedToken);

    if (!mounted) return;
    if (success) {
      Navigator.pushReplacementNamed(context, AppRoutes.dashboard);
    } else {
      setState(() => _errorMessage = authProvider.error ?? '$provider registration failed.');
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
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: const IconThemeData(color: AppTheme.textPrimary),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 10.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Create Account',
                style: Theme.of(context).textTheme.displayLarge?.copyWith(
                      fontSize: 32,
                    ),
              ),
              const SizedBox(height: 8),
              Text(
                'Join AgroGuard AI for smart crop diagnostics',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: AppTheme.textSecondary,
                    ),
              ),
              const SizedBox(height: 36),
              
              CustomTextField(
                controller: _nameController,
                hintText: 'Full Name',
                prefixIcon: Icons.person_outline,
              ),
              const SizedBox(height: 16),
              CustomTextField(
                controller: _emailController,
                hintText: 'Email Address',
                prefixIcon: Icons.email_outlined,
              ),
              const SizedBox(height: 16),
              CustomTextField(
                controller: _passwordController,
                hintText: 'Password',
                prefixIcon: Icons.lock_outline,
                obscureText: true,
              ),
              
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
                text: 'Sign Up & Verify',
                isLoading: authProvider.isLoading,
                onPressed: _handleRegister,
              ),
              const SizedBox(height: 32),
              
              // Divider
              Row(
                children: [
                  const Expanded(child: Divider(color: AppTheme.border, thickness: 1)),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Text(
                      'Or register with',
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
                    onPressed: () => _handleSocialRegister('Google'),
                  ),
                  const SizedBox(width: 12),
                  _buildSocialButton(
                    icon: LucideIcons.facebook,
                    label: 'Facebook',
                    color: const Color(0xFF1877F2),
                    textColor: Colors.white,
                    onPressed: () => _handleSocialRegister('Facebook'),
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
                    onPressed: () => _handleSocialRegister('Twitter'),
                  ),
                ],
              ),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }
}
