import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../models/log_model.dart';

class TimelineWidget extends StatefulWidget {
  final List<LogModel> logs;

  const TimelineWidget({super.key, required this.logs});

  @override
  State<TimelineWidget> createState() => _TimelineWidgetState();
}

class _TimelineWidgetState extends State<TimelineWidget> {
  // Store which cards are expanded by default or user preference
  final Map<String, bool> _expandedState = {};

  Color _statusColor(String status) {
    switch (status) {
      case 'done':
        return AppTheme.primaryGreen;
      case 'running':
        return const Color(0xFFF57C00); // Premium amber/orange
      case 'error':
        return AppTheme.error;
      default:
        return Colors.grey.shade300;
    }
  }

  Widget _statusIcon(String status) {
    switch (status) {
      case 'done':
        return const Icon(Icons.check, color: Colors.white, size: 14);
      case 'running':
        return const SizedBox(
          width: 14,
          height: 14,
          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
        );
      case 'error':
        return const Icon(Icons.close, color: Colors.white, size: 14);
      default:
        return const SizedBox();
    }
  }

  Widget _buildFieldRow({
    required IconData icon,
    required String label,
    required String content,
    required Color accentColor,
  }) {
    if (content.isEmpty) return const SizedBox.shrink();
    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 16, color: accentColor),
              const SizedBox(width: 6),
              Text(
                label.toUpperCase(),
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  color: accentColor,
                  letterSpacing: 0.8,
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Padding(
            padding: const EdgeInsets.only(left: 22.0),
            child: Text(
              content,
              style: const TextStyle(
                fontSize: 13,
                color: AppTheme.textSecondary,
                height: 1.4,
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: List.generate(widget.logs.length, (i) {
        final log = widget.logs[i];
        final isLast = i == widget.logs.length - 1;
        
        // Auto-expand if the step is running or recently done, and hasn't been manually closed
        final isExpanded = _expandedState[log.id] ?? (log.status != 'pending');

        return IntrinsicHeight(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ── Vertical Progress Line ──
              SizedBox(
                width: 44,
                child: Column(
                  children: [
                    Container(
                      width: 32,
                      height: 32,
                      decoration: BoxDecoration(
                        color: _statusColor(log.status),
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: _statusColor(log.status).withOpacity(0.3),
                            blurRadius: 8,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Center(child: _statusIcon(log.status)),
                    ),
                    if (!isLast)
                      Expanded(
                        child: Container(
                          width: 2,
                          color: _statusColor(log.status).withOpacity(0.3),
                        ),
                      ),
                  ],
                ),
              ),
              const SizedBox(width: 10),
              
              // ── Agent Execution Details Card ──
              Expanded(
                child: Padding(
                  padding: EdgeInsets.only(bottom: isLast ? 0 : 20),
                  child: Card(
                    margin: EdgeInsets.zero,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                      side: BorderSide(
                        color: log.status == 'running'
                            ? const Color(0xFFFFF3E0)
                            : AppTheme.border,
                        width: log.status == 'running' ? 2 : 1,
                      ),
                    ),
                    color: log.status == 'running'
                        ? const Color(0xFFFFFDE7) // Warm premium amber hue for running step
                        : Colors.white,
                    child: InkWell(
                      borderRadius: BorderRadius.circular(16),
                      onTap: log.status == 'pending'
                          ? null
                          : () {
                              setState(() {
                                _expandedState[log.id] = !isExpanded;
                              });
                            },
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // ── Header Row (Title + Status Badge) ──
                            Row(
                              children: [
                                Expanded(
                                  child: Text(
                                    log.agent,
                                    style: TextStyle(
                                      fontWeight: FontWeight.w800,
                                      fontSize: 14,
                                      color: log.status == 'pending'
                                          ? Colors.grey
                                          : AppTheme.textPrimary,
                                    ),
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: _statusColor(log.status).withOpacity(0.12),
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                  child: Text(
                                    log.status.toUpperCase(),
                                    style: TextStyle(
                                      fontSize: 9,
                                      fontWeight: FontWeight.bold,
                                      color: _statusColor(log.status),
                                    ),
                                  ),
                                ),
                                if (log.status != 'pending') ...[
                                  const SizedBox(width: 4),
                                  Icon(
                                    isExpanded ? Icons.expand_less : Icons.expand_more,
                                    size: 18,
                                    color: AppTheme.textSecondary,
                                  ),
                                ],
                              ],
                            ),
                            
                            // ── Collapsible Content (Observation, Reasoning, Action, Outcome, Recovery) ──
                            if (isExpanded && log.status != 'pending') ...[
                              const SizedBox(height: 16),
                              const Divider(height: 1, color: AppTheme.border),
                              const SizedBox(height: 16),
                              
                              // 1. Observation
                              _buildFieldRow(
                                icon: Icons.visibility_outlined,
                                label: 'Observation',
                                content: log.observation,
                                accentColor: AppTheme.darkGreen,
                              ),
                              
                              // 2. Reasoning
                              _buildFieldRow(
                                icon: Icons.psychology_outlined,
                                label: 'Reasoning',
                                content: log.reasoning,
                                accentColor: const Color(0xFFF57C00),
                              ),
                              
                              // 3. Action
                              _buildFieldRow(
                                icon: Icons.bolt_outlined,
                                label: 'Action Taken',
                                content: log.action,
                                accentColor: Colors.blue.shade700,
                              ),
                              
                              // 4. Outcome
                              _buildFieldRow(
                                icon: Icons.task_alt_outlined,
                                label: 'Outcome',
                                content: log.outcome,
                                accentColor: AppTheme.primaryGreen,
                              ),
                              
                              // 5. Recovery (if any)
                              if (log.recovery != null && log.recovery!.isNotEmpty) ...[
                                const SizedBox(height: 4),
                                Container(
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: AppTheme.error.withOpacity(0.08),
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(
                                      color: AppTheme.error.withOpacity(0.3),
                                    ),
                                  ),
                                  child: Row(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      const Icon(
                                        Icons.settings_backup_restore_outlined,
                                        color: AppTheme.error,
                                        size: 18,
                                      ),
                                      const SizedBox(width: 8),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            const Text(
                                              'RECOVERY ROUTINE TRIGGERED',
                                              style: TextStyle(
                                                fontSize: 10,
                                                fontWeight: FontWeight.bold,
                                                color: AppTheme.error,
                                                letterSpacing: 0.5,
                                              ),
                                            ),
                                            const SizedBox(height: 4),
                                            Text(
                                              log.recovery!,
                                              style: TextStyle(
                                                fontSize: 12,
                                                color: AppTheme.error.withOpacity(0.9),
                                                height: 1.4,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ],
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      }),
    );
  }
}
