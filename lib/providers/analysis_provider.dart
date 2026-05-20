import 'dart:io';
import 'package:flutter/material.dart';
import '../models/analysis_result_model.dart';
import '../models/log_model.dart';
import '../models/alert_model.dart';
import '../services/api_service.dart';

class AnalysisProvider extends ChangeNotifier {
  final ApiService _apiService = ApiService();

  AnalysisResult? _currentResult;
  List<AnalysisResult> _history = [];
  List<LogModel> _agentLogs = [];
  List<AlertModel> _alerts = [];
  bool _isAnalyzing = false;
  File? _selectedImage;
  double _progress = 0.0;

  AnalysisResult? get currentResult => _currentResult;
  List<AnalysisResult> get history => _history;
  List<LogModel> get agentLogs => _agentLogs;
  List<AlertModel> get alerts => _alerts;
  bool get isAnalyzing => _isAnalyzing;
  File? get selectedImage => _selectedImage;
  double get progress => _progress;

  void setSelectedImage(File image) {
    _selectedImage = image;
    notifyListeners();
  }

  Future<void> analyzeImage() async {
    if (_selectedImage == null) return;

    _isAnalyzing = true;
    _progress = 0.0;
    _agentLogs = [];
    _currentResult = null;
    notifyListeners();

    try {
      // Fetch analysis result and agent reasoning logs from ApiService (real or mock fallback)
      final response = await _apiService.analyzeImageWithLogs(_selectedImage!);
      final List<LogModel> finalLogs = response['logs'] as List<LogModel>;
      final AnalysisResult finalResult = response['result'] as AnalysisResult;

      // Progressively animate the multi-agent system execution steps
      for (int i = 0; i < finalLogs.length; i++) {
        // Set previous logs to 'done' and current one to 'running'
        for (int prev = 0; prev < i; prev++) {
          _agentLogs[prev] = finalLogs[prev].copyWithStatus('done');
        }
        
        final runningLog = finalLogs[i].copyWithStatus('running');
        _agentLogs.add(runningLog);
        _progress = (i + 0.5) / finalLogs.length;
        notifyListeners();

        // Add minor reading delay to show premium orchestration flow
        await Future.delayed(const Duration(milliseconds: 1000));
      }

      // Mark all logs as completed
      _agentLogs = finalLogs.map((l) => l.copyWithStatus('done')).toList();
      _currentResult = finalResult;
      
      // Prevent duplicate history entries
      if (!_history.any((h) => h.id == _currentResult!.id)) {
        _history.insert(0, _currentResult!);
      }

      _isAnalyzing = false;
      _progress = 1.0;
      notifyListeners();
    } catch (e) {
      print('[ANALYSIS PROVIDER] Error during multi-agent analysis: $e');
      _isAnalyzing = false;
      notifyListeners();
    }
  }

  void loadMockAlerts() {
    _alerts = AlertModel.mockAlerts();
    notifyListeners();
  }

  void clearCurrentAnalysis() {
    _currentResult = null;
    _selectedImage = null;
    _agentLogs = [];
    _progress = 0.0;
    notifyListeners();
  }
}
