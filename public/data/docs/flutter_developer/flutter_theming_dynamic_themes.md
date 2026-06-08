## Theming & Dynamic Themes in Flutter: A Study Guide

Implementing consistent theming, including light/dark modes and custom dynamic themes, is crucial for delivering a polished and user-friendly Flutter application. This guide will walk you through Flutter's powerful theming capabilities.

### 1. Introduction to Theming in Flutter

**Theming** in Flutter allows you to define a consistent look and feel across your application. Instead of styling each widget individually, you define a set of visual properties (colors, fonts, shapes, etc.) once and apply them globally or to specific parts of your widget tree. This promotes: 
*   **Consistency**: A uniform user experience.
*   **Maintainability**: Easier to change the entire app's look with minimal code modifications.
*   **Branding**: Enforcing brand identity.
*   **Accessibility**: Supporting user preferences like dark mode.

### 2. Core Concepts: `ThemeData` and `Theme` Widget

At the heart of Flutter's theming system are two key components:

*   **`ThemeData` Class**: This object encapsulates all the visual properties for your application's theme. It includes properties for:
    *   `brightness`: `Brightness.light` or `Brightness.dark`.
    *   `primaryColor`, `accentColor`, `colorScheme`: Core colors.
    *   `textTheme`: Defines various text styles (e.g., `headlineLarge`, `bodyMedium`).
    *   `appBarTheme`: Styles for `AppBar`.
    *   `elevatedButtonTheme`, `cardTheme`, `inputDecorationTheme`, etc.: Styles for specific Material Design components.

*   **`Theme` Widget**: While `MaterialApp` automatically injects a `ThemeData` for its children, you can use the `Theme` widget to override or extend the theme for a specific subtree of widgets. This is useful for applying a slightly different theme to a particular section of your app.

    To access the current theme data from any widget, use `Theme.of(context)`. This call efficiently looks up the `ThemeData` object provided by the nearest `Theme` or `MaterialApp` widget in the widget tree.

### 3. Implementing Light and Dark Modes

Flutter's `MaterialApp` widget simplifies light and dark mode implementation:

1.  **Define `ThemeData` for Light Mode**: Set the `theme` property of `MaterialApp` to your light mode `ThemeData` object.
2.  **Define `ThemeData` for Dark Mode**: Set the `darkTheme` property of `MaterialApp` to your dark mode `ThemeData` object.
3.  **Control Mode Switching**: Use the `themeMode` property to determine which theme is currently active:
    *   `ThemeMode.system`: Uses the device's system preference (default).
    *   `ThemeMode.light`: Always uses the light theme.
    *   `ThemeMode.dark`: Always uses the dark theme.

    You can detect the system brightness using `MediaQuery.of(context).platformBrightness == Brightness.dark`.

### 4. Customizing Themes

You can extensively customize `ThemeData` to match your application's design language:

*   **Colors**: Define a `ColorScheme` for semantic color roles (primary, onPrimary, secondary, surface, background, error, etc.) or set individual colors like `primarySwatch`, `scaffoldBackgroundColor`.
*   **Typography**: Customize `textTheme` by providing `TextTheme` objects. Each `TextStyle` within `TextTheme` can specify font family, size, weight, color, etc.
*   **Component Themes**: Flutter provides dedicated theme classes for many Material Design widgets (e.g., `AppBarTheme`, `FloatingActionButtonThemeData`, `CardTheme`). These allow you to set default styles for all instances of that widget type throughout your app.

    ```dart
    ThemeData lightTheme = ThemeData(
      brightness: Brightness.light,
      primarySwatch: Colors.blue,
      scaffoldBackgroundColor: Colors.grey[100],
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.blue,
        foregroundColor: Colors.white,
        elevation: 4,
      ),
      textTheme: const TextTheme(
        headlineLarge: TextStyle(fontSize: 32.0, fontWeight: FontWeight.bold, color: Colors.blueGrey),
        bodyMedium: TextStyle(fontSize: 16.0, color: Colors.black87),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.blueAccent,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        ),
      ),
    );

    ThemeData darkTheme = ThemeData(
      brightness: Brightness.dark,
      primarySwatch: Colors.indigo,
      scaffoldBackgroundColor: Colors.grey[900],
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.indigo,
        foregroundColor: Colors.white,
        elevation: 8,
      ),
      textTheme: const TextTheme(
        headlineLarge: TextStyle(fontSize: 32.0, fontWeight: FontWeight.bold, color: Colors.lightBlueAccent),
        bodyMedium: TextStyle(fontSize: 16.0, color: Colors.white70),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.indigoAccent,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        ),
      ),
    );
    ```

### 5. Dynamic Themes (Runtime Switching)

To allow users to switch themes at runtime (e.g., via a toggle in settings):

1.  **Manage Theme State**: You need a mechanism to store and update the `ThemeMode` (`system`, `light`, `dark`). This typically involves using state management solutions like `Provider`, `Riverpod`, or `Bloc`, or simply a `StatefulWidget` at the root of your app.
2.  **Persist Choice (Optional)**: For a persistent experience, save the user's chosen `ThemeMode` (e.g., as a string 'light', 'dark', 'system') using `SharedPreferences` or another persistent storage solution.
3.  **Notify `MaterialApp`**: When the `ThemeMode` changes, update the state that controls the `themeMode` property of your `MaterialApp`. This will cause `MaterialApp` to rebuild with the new theme.

### 6. Code Example: Basic Light/Dark Theme Switch

This example demonstrates a simple light/dark theme toggle using `StatefulWidget`.

```dart
import 'package:flutter/material.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatefulWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  ThemeMode _themeMode = ThemeMode.system; // Initial theme mode

  void _toggleThemeMode() {
    setState(() {
      _themeMode = _themeMode == ThemeMode.light ? ThemeMode.dark : ThemeMode.light;
      // In a real app, you'd save this preference to SharedPreferences
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Theming Demo',
      theme: ThemeData(
        brightness: Brightness.light,
        primarySwatch: Colors.blue,
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.blue,
          foregroundColor: Colors.white,
        ),
        // Add more light theme customizations here
      ),
      darkTheme: ThemeData(
        brightness: Brightness.dark,
        primarySwatch: Colors.indigo,
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.indigo,
          foregroundColor: Colors.white,
        ),
        // Add more dark theme customizations here
      ),
      themeMode: _themeMode, // Controlled by app state
      home: MyHomePage(
        title: 'Theming Demo',
        onToggleTheme: _toggleThemeMode,
      ),
    );
  }
}

class MyHomePage extends StatelessWidget {
  const MyHomePage({Key? key, required this.title, required this.onToggleTheme}) : super(key: key);
  final String title;
  final VoidCallback onToggleTheme;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(title),
        actions: [
          IconButton(
            icon: Icon(
              Theme.of(context).brightness == Brightness.light ? Icons.light_mode : Icons.dark_mode
            ), // Icon changes based on current theme
            onPressed: onToggleTheme,
          ),
        ],
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Text(
              'Hello Flutter Theming!',
              style: Theme.of(context).textTheme.headlineMedium, // Uses theme's text style
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () {},
              child: const Text('A Themed Button'),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {},
        child: const Icon(Icons.add),
      ),
    );
  }
}
```

### Checklist/Exercise:

1.  **Purpose of `ThemeData` and `Theme.of(context)`**: Explain the role of `ThemeData` in defining an application's visual properties and how `Theme.of(context)` allows widgets to access these properties.
2.  **Custom Font Family for Light Theme**: Describe how you would implement a custom font family for all headline text specifically in your Flutter application's light theme.
3.  **Dynamic Theme Switching Outline**: Outline the necessary steps (including state management and UI interaction) to allow users to switch between light and dark modes at runtime, ensuring their preference is saved and loaded upon app restart.
