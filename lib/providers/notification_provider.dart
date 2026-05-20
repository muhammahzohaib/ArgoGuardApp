import 'package:flutter/material.dart';

class NotificationItem {
  final String id;
  final String title;
  final String body;
  final DateTime timestamp;
  bool isRead;

  NotificationItem({
    required this.id,
    required this.title,
    required this.body,
    required this.timestamp,
    this.isRead = false,
  });
}

class NotificationProvider extends ChangeNotifier {
  final List<NotificationItem> _notifications = [
    NotificationItem(
      id: '1',
      title: 'Analysis Complete',
      body: 'Your tomato leaf scan has been analyzed. Late Blight detected with 94% confidence.',
      timestamp: DateTime.now().subtract(const Duration(minutes: 15)),
    ),
    NotificationItem(
      id: '2',
      title: 'Weather Alert',
      body: 'High humidity expected in your region. Increased risk for fungal diseases.',
      timestamp: DateTime.now().subtract(const Duration(hours: 2)),
    ),
    NotificationItem(
      id: '3',
      title: 'Treatment Reminder',
      body: 'Scheduled copper fungicide application due for Field A3.',
      timestamp: DateTime.now().subtract(const Duration(hours: 6)),
    ),
    NotificationItem(
      id: '4',
      title: 'New Feature Available',
      body: 'Real-time drone imagery analysis is now available in AgroGuard AI Pro.',
      timestamp: DateTime.now().subtract(const Duration(days: 1)),
    ),
    NotificationItem(
      id: '5',
      title: 'Weekly Report Ready',
      body: 'Your weekly crop health summary for May 12-18 is ready to view.',
      timestamp: DateTime.now().subtract(const Duration(days: 2)),
    ),
  ];

  List<NotificationItem> get notifications => _notifications;
  int get unreadCount => _notifications.where((n) => !n.isRead).length;

  void markAsRead(String id) {
    final index = _notifications.indexWhere((n) => n.id == id);
    if (index != -1) {
      _notifications[index].isRead = true;
      notifyListeners();
    }
  }

  void markAllAsRead() {
    for (var n in _notifications) {
      n.isRead = true;
    }
    notifyListeners();
  }
}
