import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme.dart';
import '../../core/routes.dart';
import '../../providers/analysis_provider.dart';
import '../widgets/timeline_widget.dart';
import '../widgets/custom_button.dart';

class AgentLogsScreen extends StatelessWidget {
  const AgentLogsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<AnalysisProvider>();
    final logs = provider.agentLogs;
    final progress = provider.progress;
    final isDone = !provider.isAnalyzing && provider.currentResult != null;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Agent Reasoning Logs'),
        automaticallyImplyLeading: false,
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // ── Progress Header ─────────────────────────────────────────
              Card(
                margin: EdgeInsets.zero,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(20.0),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            isDone ? 'Analysis Complete' : 'AI Agent Processing...',
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: AppTheme.textPrimary,
                            ),
                          ),
                          Text(
                            '${(progress * 100).toInt()}%',
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: AppTheme.primaryGreen,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: LinearProgressIndicator(
                          value: progress,
                          minHeight: 8,
                          backgroundColor: Colors.grey.shade200,
                          valueColor: const AlwaysStoppedAnimation<Color>(AppTheme.primaryGreen),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // ── Timeline Section ────────────────────────────────────────
              Expanded(
                child: logs.isEmpty
                    ? const Center(
                        child: CircularProgressIndicator(),
                      )
                    : SingleChildScrollView(
                        physics: const BouncingScrollPhysics(),
                        child: TimelineWidget(logs: logs),
                      ),
              ),
              const SizedBox(height: 16),

              // ── Actions ─────────────────────────────────────────────────
              CustomButton(
                text: isDone ? 'View Results' : 'Analyzing Image...',
                icon: Icons.chevron_right,
                onPressed: isDone
                    ? () {
                        Navigator.pushReplacementNamed(context, AppRoutes.analysis);
                      }
                    : () {},
                isLoading: !isDone,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
