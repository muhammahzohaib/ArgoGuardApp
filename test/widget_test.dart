import 'package:flutter_test/flutter_test.dart';
import 'package:argoguard/main.dart';

void main() {
  testWidgets('Splash screen smoke test', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const AgroGuardApp());

    // Verify that the title text is shown.
    expect(find.text('AgroGuard AI'), findsOneWidget);

    // Let the splash screen timer run and settle
    await tester.pumpAndSettle(const Duration(seconds: 3));
  });
}
