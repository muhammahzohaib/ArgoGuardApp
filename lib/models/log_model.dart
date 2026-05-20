class LogModel {
  final String id;
  final String agent;
  final String observation;
  final String reasoning;
  final String action;
  final String outcome;
  final String? recovery;
  final String status; // 'pending', 'running', 'done', 'error'
  final DateTime timestamp;

  LogModel({
    required this.id,
    required this.agent,
    required this.observation,
    required this.reasoning,
    required this.action,
    required this.outcome,
    this.recovery,
    required this.status,
    required this.timestamp,
  });

  // Backward compatibility properties for standard UI code
  String get step => agent;
  String get message => outcome;

  factory LogModel.fromJson(Map<String, dynamic> json, {String? defaultId}) {
    return LogModel(
      id: json['id'] ?? defaultId ?? '',
      agent: json['agent'] ?? json['step'] ?? '',
      observation: json['observation'] ?? '',
      reasoning: json['reasoning'] ?? '',
      action: json['action'] ?? '',
      outcome: json['outcome'] ?? json['message'] ?? '',
      recovery: json['recovery'],
      status: json['status'] ?? 'done',
      timestamp: DateTime.tryParse(json['timestamp'] ?? '') ?? DateTime.now(),
    );
  }

  LogModel copyWithStatus(String newStatus) => LogModel(
        id: id,
        agent: agent,
        observation: observation,
        reasoning: reasoning,
        action: action,
        outcome: outcome,
        recovery: recovery,
        status: newStatus,
        timestamp: timestamp,
      );

  static List<LogModel> mockLogs() => [
        LogModel(
          id: '1',
          agent: 'Input Aggregation Agent',
          observation: 'Ingested leaf image (tomato-leaf.jpg) alongside environmental sensor telemetry.',
          reasoning: 'Aggregating physical climate parameters to establish a telemetry baseline before diagnostic classification.',
          action: 'Parsed sensor payload: humidity=75%, soilMoisture=40%, temperature=28°C.',
          outcome: 'Environment baseline verified. Data is ready for multimodal classification.',
          status: 'done',
          timestamp: DateTime.now().subtract(const Duration(seconds: 10)),
        ),
        LogModel(
          id: '2',
          agent: 'Disease Analysis Agent',
          observation: 'Visual symptoms: brown leaf spots, yellow halos (chlorosis), and powdery mold underside.',
          reasoning: 'Invoking Gemini 2.5 multimodal API to classify symptoms against active agricultural pathogen records.',
          action: 'Queried Gemini generative vision agent and processed disease signature.',
          outcome: 'Identified Late Blight (Phytophthora infestans) with 92% confidence.',
          status: 'done',
          timestamp: DateTime.now().subtract(const Duration(seconds: 8)),
        ),
        LogModel(
          id: '3',
          agent: 'Risk Assessment Agent',
          observation: 'Pathogen identified as Late Blight. Local sensor humidity is extremely high at 75%.',
          reasoning: 'Late Blight thrives and spreads rapidly in wet foliage conditions above 70% humidity.',
          action: 'Executed spread risk quantification matrix against environmental moisture variables.',
          outcome: 'Calculated Spread Risk: HIGH. Immediate containment actions are recommended.',
          status: 'done',
          timestamp: DateTime.now().subtract(const Duration(seconds: 6)),
        ),
        LogModel(
          id: '4',
          agent: 'Constraint Planning Agent',
          observation: 'Pathology needs dry leaves. Irrigation scheduler proposed overhead sprinkler watering.',
          reasoning: 'Detected system contradiction: Overhead sprinklers cause wet foliage, accelerating spore growth. Revise plan.',
          action: 'Invoked Contradiction Resolution Service. Exchanged overhead misting for drip line schedule.',
          outcome: 'Revised Plan: Override sprinkler controls with soil-level drip irrigation. Keep leaf surface dry.',
          recovery: 'Override overhead watering recommendations to keep leaf surface dry.',
          status: 'done',
          timestamp: DateTime.now().subtract(const Duration(seconds: 4)),
        ),
        LogModel(
          id: '5',
          agent: 'Action Execution Agent',
          observation: 'Treatment plan: Apply copper fungicide. Target actuators: Sprayers 1-3 and Flight Drone.',
          reasoning: 'Dispatching drone flight coordinates to execute precise spraying over the infected quadrant.',
          action: 'Initiated chemical valve release and loaded UAV flight plans. Retries: 0/3.',
          outcome: 'Valves opened. Sprayers 1-3 deployed chemical successfully. Drone completed route.',
          status: 'done',
          timestamp: DateTime.now().subtract(const Duration(seconds: 2)),
        ),
        LogModel(
          id: '6',
          agent: 'Recovery Agent',
          observation: 'Spraying actions successfully completed. Active actuators returned to safe idle states.',
          reasoning: 'Monitoring system health. Pressure normal, zero flow leakage, and drone safely landed. Rollback unnecessary.',
          action: 'Polled final hardware telemetry and confirmed fail-safe operation status.',
          outcome: 'All systems green. Orchestration completed. Returning to standby monitoring.',
          status: 'done',
          timestamp: DateTime.now(),
        ),
      ];
}
