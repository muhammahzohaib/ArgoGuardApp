import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme.dart';
import '../../core/routes.dart';
import '../../providers/analysis_provider.dart';
import '../../providers/notification_provider.dart';
import '../../providers/weather_provider.dart';
import '../widgets/alert_card.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<AnalysisProvider>().loadMockAlerts();
      context.read<WeatherProvider>().loadWeather();
    });
  }

  @override
  Widget build(BuildContext context) {
    final analysisProvider = context.watch<AnalysisProvider>();
    final notifProvider = context.watch<NotificationProvider>();

    return Scaffold(
      backgroundColor: AppTheme.background,
      body: CustomScrollView(
        slivers: [
          // ── Hero App Bar ────────────────────────────────────────────
          SliverAppBar(
            expandedHeight: 180,
            pinned: true,
            backgroundColor: AppTheme.primaryGreen,
            actions: [
              Stack(
                children: [
                  IconButton(
                    icon: const Icon(Icons.notifications_outlined, color: Colors.white),
                    onPressed: () => Navigator.pushNamed(context, AppRoutes.notifications),
                  ),
                  if (notifProvider.unreadCount > 0)
                    Positioned(
                      right: 8,
                      top: 8,
                      child: Container(
                        width: 16,
                        height: 16,
                        decoration: const BoxDecoration(
                          color: Colors.red,
                          shape: BoxShape.circle,
                        ),
                        child: Center(
                          child: Text(
                            '${notifProvider.unreadCount}',
                            style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ],
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [AppTheme.darkGreen, AppTheme.primaryGreen],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
                child: SafeArea(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        Text(
                          'Good morning, Farmer 👋',
                          style: TextStyle(color: Colors.white.withOpacity(0.85), fontSize: 14),
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          'AgroGuard AI',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 26,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            _StatChip(label: 'Scans Today', value: '12', icon: Icons.document_scanner_outlined),
                            const SizedBox(width: 10),
                            _StatChip(label: 'Active Alerts', value: '${analysisProvider.alerts.length}', icon: Icons.warning_amber_rounded),
                            const SizedBox(width: 10),
                            _StatChip(label: 'Health Score', value: '87%', icon: Icons.favorite_outline),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),

          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // ── Real-Time Weather Card ─────────────────────────────
                  const _WeatherCard(),

                  const SizedBox(height: 28),

                  // ── Quick Actions ─────────────────────────────────────
                  const Text('Quick Actions', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.textPrimary)),
                  const SizedBox(height: 14),
                  Row(
                    children: [
                      Expanded(
                        child: _QuickActionCard(
                          icon: Icons.camera_alt_rounded,
                          label: 'Scan Crop',
                          color: AppTheme.primaryGreen,
                          onTap: () => Navigator.pushNamed(context, AppRoutes.upload),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _QuickActionCard(
                          icon: Icons.history_rounded,
                          label: 'View History',
                          color: const Color(0xFF1565C0),
                          onTap: () {},
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _QuickActionCard(
                          icon: Icons.bar_chart_rounded,
                          label: 'Reports',
                          color: const Color(0xFF6A1B9A),
                          onTap: () {},
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 28),

                  // ── Health Overview Card ──────────────────────────────
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF43A047), Color(0xFF1B5E20)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Row(
                          children: [
                            Icon(Icons.eco, color: Colors.white, size: 22),
                            SizedBox(width: 8),
                            Text(
                              'Crop Health Overview',
                              style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        Row(
                          children: [
                            Expanded(child: _HealthBar(label: 'Tomato', percent: 0.87)),
                          ],
                        ),
                        const SizedBox(height: 10),
                        Row(
                          children: [
                            Expanded(child: _HealthBar(label: 'Wheat', percent: 0.72)),
                          ],
                        ),
                        const SizedBox(height: 10),
                        Row(
                          children: [
                            Expanded(child: _HealthBar(label: 'Corn', percent: 0.65)),
                          ],
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 28),

                  // ── Active Alerts ─────────────────────────────────────
                  Row(
                    children: [
                      const Text('Active Alerts', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.textPrimary)),
                      const Spacer(),
                      TextButton(
                        onPressed: () => Navigator.pushNamed(context, AppRoutes.notifications),
                        child: Text('See all', style: TextStyle(color: AppTheme.primaryGreen)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  if (analysisProvider.alerts.isEmpty)
                    const Center(child: Text('No active alerts', style: TextStyle(color: AppTheme.textSecondary)))
                  else
                    ...analysisProvider.alerts.map((alert) => AlertCard(alert: alert)),

                  const SizedBox(height: 28),

                  // ── Recent Analysis ───────────────────────────────────
                  const Text('Recent Analysis', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.textPrimary)),
                  const SizedBox(height: 14),
                  if (analysisProvider.history.isEmpty)
                    _EmptyState(
                      icon: Icons.image_search_rounded,
                      message: 'No scans yet.\nTap "Scan Crop" to get started.',
                      onAction: () => Navigator.pushNamed(context, AppRoutes.upload),
                      actionLabel: 'Scan Now',
                    )
                  else
                    ...analysisProvider.history.map((r) => _HistoryCard(result: r)),
                ],
              ),
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => Navigator.pushNamed(context, AppRoutes.upload),
        backgroundColor: AppTheme.primaryGreen,
        icon: const Icon(Icons.camera_alt_rounded, color: Colors.white),
        label: const Text('Scan Crop', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      ),
    );
  }
}

// ── Weather Card ────────────────────────────────────────────────────────────────

class _WeatherCard extends StatelessWidget {
  const _WeatherCard();

  @override
  Widget build(BuildContext context) {
    final weatherProvider = context.watch<WeatherProvider>();
    final weather = weatherProvider.weather;
    final isLoading = weatherProvider.isLoading;
    final selectedLocation = weatherProvider.selectedLocation;

    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF1565C0), Color(0xFF0D47A1)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF1565C0).withOpacity(0.35),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header row
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 16, 0),
            child: Row(
              children: [
                const Icon(Icons.wb_sunny_rounded, color: Colors.white70, size: 16),
                const SizedBox(width: 6),
                const Text(
                  'Real-Time Weather',
                  style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w500),
                ),
                const Spacer(),
                // Location Selector
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<WeatherLocation>(
                      value: selectedLocation,
                      isDense: true,
                      dropdownColor: const Color(0xFF1565C0),
                      icon: const Icon(Icons.arrow_drop_down, color: Colors.white70, size: 18),
                      style: const TextStyle(color: Colors.white, fontSize: 11),
                      items: WeatherProvider.availableLocations.map((loc) {
                        return DropdownMenuItem(
                          value: loc,
                          child: Text('${loc.flag} ${loc.name}', style: const TextStyle(color: Colors.white, fontSize: 11)),
                        );
                      }).toList(),
                      onChanged: isLoading
                          ? null
                          : (loc) {
                              if (loc != null) {
                                context.read<WeatherProvider>().loadWeather(location: loc);
                              }
                            },
                    ),
                  ),
                ),
                const SizedBox(width: 4),
                // Refresh button
                GestureDetector(
                  onTap: isLoading ? null : () => context.read<WeatherProvider>().loadWeather(),
                  child: Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.12),
                      shape: BoxShape.circle,
                    ),
                    child: isLoading
                        ? const SizedBox(
                            width: 14,
                            height: 14,
                            child: CircularProgressIndicator(strokeWidth: 1.5, color: Colors.white),
                          )
                        : const Icon(Icons.refresh_rounded, color: Colors.white70, size: 14),
                  ),
                ),
              ],
            ),
          ),

          if (isLoading && weather == null)
            const Padding(
              padding: EdgeInsets.all(28),
              child: Center(child: CircularProgressIndicator(color: Colors.white)),
            )
          else if (weather == null)
            const Padding(
              padding: EdgeInsets.all(20),
              child: Text('Failed to load weather data.', style: TextStyle(color: Colors.white70)),
            )
          else ...[
            // Main weather display
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 8),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Big weather icon + temp
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(weather.weatherIcon, style: const TextStyle(fontSize: 52)),
                      const SizedBox(height: 4),
                      Text(
                        '${weather.temperature}°C',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 36,
                          fontWeight: FontWeight.bold,
                          letterSpacing: -1,
                        ),
                      ),
                      Text(
                        weather.weatherDescription,
                        style: const TextStyle(color: Colors.white70, fontSize: 13),
                      ),
                    ],
                  ),
                  const Spacer(),
                  // Stats column
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      _WeatherStat(
                        icon: Icons.air_rounded,
                        label: 'Wind',
                        value: '${weather.windspeed} km/h',
                      ),
                      const SizedBox(height: 10),
                      _WeatherStat(
                        icon: Icons.water_drop_outlined,
                        label: 'Rain Chance',
                        value: '${weather.precipitationProbability}%',
                      ),
                      const SizedBox(height: 10),
                      _WeatherStat(
                        icon: Icons.schedule_rounded,
                        label: 'Timezone',
                        value: weather.timezone.split('/').last.replaceAll('_', ' '),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // Divider
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Divider(color: Colors.white.withOpacity(0.15), height: 1),
            ),

            // Farming Recommendations
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.agriculture_rounded, color: Colors.white70, size: 14),
                      const SizedBox(width: 6),
                      const Text(
                        'Farming Recommendations',
                        style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w600),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  ...weather.recommendations.map((rec) => Padding(
                    padding: const EdgeInsets.only(bottom: 6),
                    child: Container(
                      width: double.infinity,
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: Colors.white.withOpacity(0.08)),
                      ),
                      child: Text(
                        rec,
                        style: const TextStyle(color: Colors.white, fontSize: 12, height: 1.4),
                      ),
                    ),
                  )),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _WeatherStat extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _WeatherStat({required this.icon, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, color: Colors.white60, size: 14),
        const SizedBox(width: 4),
        Column(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(value, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
            Text(label, style: const TextStyle(color: Colors.white60, fontSize: 10)),
          ],
        ),
      ],
    );
  }
}

// ── Helper Widgets ─────────────────────────────────────────────────────────────

class _StatChip extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;

  const _StatChip({required this.label, required this.value, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.15),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: Colors.white70, size: 16),
            const SizedBox(height: 4),
            Text(value, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
            Text(label, style: TextStyle(color: Colors.white.withOpacity(0.75), fontSize: 10)),
          ],
        ),
      ),
    );
  }
}

class _QuickActionCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _QuickActionCard({required this.icon, required this.label, required this.color, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 18),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: color.withOpacity(0.2)),
        ),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(color: color.withOpacity(0.15), shape: BoxShape.circle),
              child: Icon(icon, color: color, size: 24),
            ),
            const SizedBox(height: 10),
            Text(label, style: TextStyle(color: color, fontWeight: FontWeight.w600, fontSize: 12)),
          ],
        ),
      ),
    );
  }
}

class _HealthBar extends StatelessWidget {
  final String label;
  final double percent;

  const _HealthBar({required this.label, required this.percent});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text(label, style: const TextStyle(color: Colors.white70, fontSize: 12)),
            const Spacer(),
            Text('${(percent * 100).toInt()}%', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
          ],
        ),
        const SizedBox(height: 4),
        ClipRRect(
          borderRadius: BorderRadius.circular(4),
          child: LinearProgressIndicator(
            value: percent,
            backgroundColor: Colors.white24,
            valueColor: AlwaysStoppedAnimation<Color>(
              percent > 0.7 ? const Color(0xFFA5D6A7) : const Color(0xFFFFCC80),
            ),
            minHeight: 6,
          ),
        ),
      ],
    );
  }
}

class _HistoryCard extends StatelessWidget {
  final dynamic result;

  const _HistoryCard({required this.result});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 4))],
      ),
      child: Row(
        children: [
          Container(
            width: 52,
            height: 52,
            decoration: BoxDecoration(
              color: AppTheme.primaryGreen.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.pest_control_rounded, color: AppTheme.primaryGreen, size: 26),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(result.diseaseName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppTheme.textPrimary)),
                const SizedBox(height: 2),
                Text(result.cropType, style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFFD32F2F).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  result.severity,
                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFFD32F2F)),
                ),
              ),
              const SizedBox(height: 4),
              Text(
                '${(result.confidence * 100).toInt()}% conf.',
                style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  final IconData icon;
  final String message;
  final VoidCallback onAction;
  final String actionLabel;

  const _EmptyState({required this.icon, required this.message, required this.onAction, required this.actionLabel});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.lightGreen.withOpacity(0.3)),
      ),
      child: Column(
        children: [
          Icon(icon, size: 56, color: AppTheme.lightGreen),
          const SizedBox(height: 12),
          Text(message, textAlign: TextAlign.center, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 14)),
          const SizedBox(height: 20),
          ElevatedButton(onPressed: onAction, child: Text(actionLabel)),
        ],
      ),
    );
  }
}
