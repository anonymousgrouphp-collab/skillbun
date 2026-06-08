# Robust Error Handling & Logging in Flutter

Effective error handling and comprehensive logging are paramount for building stable, maintainable, and debuggable Flutter applications. They allow developers to gracefully manage unexpected situations, prevent crashes, and gain insights into application behavior and issues in production environments.

## 1. Error Handling Strategies

Flutter provides several mechanisms to catch and handle errors across different layers of your application.

### a. Synchronous Error Handling: `try-catch`

For operations that execute synchronously, the standard `try-catch` block is used to capture exceptions.

```dart
void performSynchronousTask() {
  try {
    // Code that might throw a synchronous error
    int result = 10 ~/ 0; // Throws IntegerDivisionByZeroException
    print('Result: $result');
  } on IntegerDivisionByZeroException catch (e) {
    print('Caught a specific error: $e');
  } catch (e) {
    print('Caught a general error: $e');
  } finally {
    print('Synchronous task finished.');
  }
}
```

### b. Asynchronous Error Handling: `Future.catchError` & `try-catch` with `await`

For `Future`s (asynchronous operations), you can use `catchError` or wrap `await` calls in a `try-catch` block.

```dart
Future<String> fetchData() async {
  // Simulate an async operation that might fail
  await Future.delayed(Duration(seconds: 1));
  if (true) { // Simulate an error condition
    throw Exception('Failed to fetch data');
  }
  return 'Data fetched successfully';
}

void handleAsyncOperation() async {
  // Using try-catch with await
  try {
    String data = await fetchData();
    print(data);
  } catch (e) {
    print('Caught async error with await: $e');
  }

  // Using .catchError()
  fetchData().then((data) {
    print(data);
  }).catchError((e) {
    print('Caught async error with .catchError: $e');
  });
}
```

### c. UI Error Handling: `ErrorWidget`

When a widget fails to build in debug mode, Flutter shows a red error screen. In release mode, it defaults to a grey screen. You can customize this error UI globally.

```dart
import 'package:flutter/material.dart';

class MyBrokenWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    throw Exception('This widget failed to build!');
    return Text('This text will never be shown');
  }
}

void main() {
  ErrorWidget.builder = (FlutterErrorDetails details) {
    return Container(
      alignment: Alignment.center,
      color: Colors.redAccent,
      child: Text(
        'Oops! Something went wrong.\n${details.exception}',
        textAlign: TextAlign.center,
        style: TextStyle(color: Colors.white, fontSize: 16),
      ),
    );
  };
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        appBar: AppBar(title: Text('Error Handling Demo')),
        body: Center(
          child: MyBrokenWidget(), // This widget will cause a build error
        ),
      ),
    );
  }
}
```

### d. Global Error Handling: `runZonedGuarded` and `FlutterError.onError`

`runZonedGuarded` is a powerful mechanism from the `dart:async` package that allows you to catch all errors and exceptions that escape Flutter's framework, including those from asynchronous operations and microtasks. `FlutterError.onError` specifically handles errors caught by the Flutter framework.

```dart
import 'dart:async';
import 'package:flutter/widgets.dart';

void main() {
  runZonedGuarded<Future<void>>(() async {
    // This is where your Flutter app starts
    WidgetsFlutterBinding.ensureInitialized();
    FlutterError.onError = (FlutterErrorDetails details) {
      // In debug mode, dump to console
      FlutterError.dumpErrorToConsole(details);
      // In production, send to a crash reporting service like Sentry
      // Sentry.captureFlutterError(details);
    };

    runApp(MyApp());
  }, (Object error, StackTrace stack) {
    // Catch all unhandled errors here (including those not caught by FlutterError.onError)
    // Send to a crash reporting service
    print('Caught by runZonedGuarded: $error\n$stack');
    // Sentry.captureException(error, stackTrace: stack);
  });
}
// MyApp class as defined before
```

## 2. Logging Frameworks

Logging provides insights into your application's flow, helping debug and monitor its health.

### a. `logger`

The `logger` package is a simple, flexible, and extensible logger for Dart and Flutter. It provides beautiful console output with different log levels.

**Installation:**
Add to `pubspec.yaml`:
`dependencies: logger: ^2.0.2+1`

**Usage:**

```dart
import 'package:logger/logger.dart';

final logger = Logger(
  printer: PrettyPrinter(
    methodCount: 2, // Number of method calls to be displayed
    errorMethodCount: 8, // Number of method calls if stacktrace is provided
    lineLength: 120, // Width of the output
    colors: true, // Colorful log messages
    printEmojis: true, // Print an emoji for each log message
    printTime: false, // Should each log message contain a timestamp
  ),
);

void demonstrateLogging() {
  logger.v('Verbose log');
  logger.d('Debug log');
  logger.i('Info log');
  logger.w('Warning log');
  logger.e('Error log', error: Exception('Something went wrong'), stackTrace: StackTrace.current);
  logger.wtf('What a terrible failure log!');
}
```

### b. `Sentry` for Crash Reporting & Performance Monitoring

Sentry is a popular error tracking and performance monitoring platform. It integrates with Flutter to capture unhandled exceptions, UI errors, and provide detailed crash reports with stack traces, device info, and user context.

**Installation:**
Add to `pubspec.yaml`:
`dependencies: sentry_flutter: ^7.17.0` (Check for the latest version)

**Basic Integration:**

```dart
import 'dart:async';
import 'package:flutter/widgets.dart';
import 'package:sentry_flutter/sentry_flutter.dart';

Future<void> main() async {
  await SentryFlutter.init(
    (options) {
      options.dsn = 'YOUR_SENTRY_DSN_HERE'; // Replace with your DSN
      options.tracesSampleRate = 1.0; // Adjust for performance monitoring
    },
    appRunner: () => runZonedGuarded<Future<void>>(() async {
      WidgetsFlutterBinding.ensureInitialized();
      FlutterError.onError = (FlutterErrorDetails details) {
        FlutterError.dumpErrorToConsole(details);
        Sentry.captureFlutterError(details); // Send Flutter errors to Sentry
      };
      runApp(MyApp());
    }, (Object error, StackTrace stack) async {
      // Send all other unhandled errors to Sentry
      await Sentry.captureException(error, stackTrace: stack);
      print('Caught by runZonedGuarded (and sent to Sentry): $error\n$stack');
    }),
  );
}
// MyApp class as defined before
```
This comprehensive setup ensures that nearly all errors, whether from the Flutter framework or general Dart asynchronous operations, are caught and reported to Sentry.

## 3. Best Practices for Error Handling & Logging

*   **Be Specific with `on` clauses**: Catch specific exception types before generic `catch` blocks.
*   **Provide Context**: When logging or reporting errors, include relevant context (user ID, current screen, action performed) to aid debugging.
*   **User-Friendly Error Messages**: Display clear, non-technical error messages to users. Log the technical details for developers.
*   **Logging Levels**: Use appropriate logging levels (debug, info, warning, error) to filter output based on environment.
*   **Avoid Sensitive Data**: Do not log sensitive user information directly.
*   **Testing**: Actively test your error handling and logging mechanisms to ensure they work as expected.

## Quick Checklist/Exercise

1.  Describe the primary difference in error handling between `try-catch` and `runZonedGuarded` in a Flutter application.
2.  Explain why integrating a service like Sentry is beneficial compared to just using `print()` statements for logging errors in a production Flutter app.
3.  Write a simple Dart function that simulates an API call returning a `Future<String>` and demonstrate how to handle both success and failure using `.then()` and `.catchError()`.