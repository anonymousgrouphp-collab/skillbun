# Navigation & User Interaction in Flutter

This guide covers fundamental concepts for managing screen flow, handling user input, and building interactive forms in Flutter applications.

## 1. Screen Navigation with Navigator 1.0

Flutter's `Navigator` widget manages a stack of `Route` objects, enabling users to move between different screens (pages) of an app. Navigator 1.0 is the traditional imperative approach to navigation.

### Core Concepts:

*   **Routes:** Represent distinct screens or pages in your app. `MaterialPageRoute` is commonly used for platform-specific transitions.
*   **Pushing:** Adds a new route to the top of the navigation stack, making it the current screen.
*   **Popping:** Removes the topmost route from the stack, revealing the previous screen.
*   **`Navigator.push()`:** Navigates to a new screen. It can also return a result from the new screen when it's popped.
*   **`Navigator.pop()`:** Returns to the previous screen. It can pass data back to the calling screen.

### Simple Navigation Example:

```dart
import 'package:flutter/material.dart';

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Navigation Demo',
      home: const HomeScreen(),
      routes: {
        '/second': (context) => const SecondScreen(),
      },
    );
  }
}

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Home Screen')),
      body: Center(
        child: ElevatedButton(
          onPressed: () {
            // Navigate to the SecondScreen using MaterialPageRoute
            Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => const SecondScreen()),
            );
            // Alternatively, using named routes:
            // Navigator.pushNamed(context, '/second');
          },
          child: const Text('Go to Second Screen'),
        ),
      ),
    );
  }
}

class SecondScreen extends StatelessWidget {
  const SecondScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Second Screen')),
      body: Center(
        child: ElevatedButton(
          onPressed: () {
            // Pop the current screen off the stack to go back to HomeScreen
            Navigator.pop(context);
          },
          child: const Text('Go Back'),
        ),
      ),
    );
  }
}
```

## 2. Handling Basic User Interactions with GestureDetector

While many Flutter widgets like `ElevatedButton` have built-in interaction handlers, `GestureDetector` offers a more flexible way to detect a wide range of user gestures on any widget.

### Core Concepts:

*   **Wraps any widget:** You can make any widget interactive by wrapping it with `GestureDetector`.
*   **Comprehensive gesture support:** Detects taps (`onTap`, `onDoubleTap`, `onLongPress`), drags (`onHorizontalDragUpdate`, `onVerticalDragUpdate`), scaling (`onScaleUpdate`), and more.
*   **Custom behavior:** Allows you to define custom actions for specific gestures.

### Simple GestureDetector Example:

```dart
import 'package:flutter/material.dart';

class InteractiveSquare extends StatefulWidget {
  const InteractiveSquare({super.key});

  @override
  State<InteractiveSquare> createState() => _InteractiveSquareState();
}

class _InteractiveSquareState extends State<InteractiveSquare> {
  Color _color = Colors.blue;

  void _changeColor() {
    setState(() {
      _color = _color == Colors.blue ? Colors.red : Colors.blue;
    });
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Square Tapped!')), 
        );
        _changeColor();
      },
      onDoubleTap: () {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Double Tap!')), 
        );
      },
      onLongPress: () {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Long Press!')), 
        );
      },
      child: Container(
        width: 150,
        height: 150,
        color: _color,
        child: const Center(
          child: Text(
            'Tap Me',
            style: TextStyle(color: Colors.white, fontSize: 20),
          ),
        ),
      ),
    );
  }
}

// To use this widget, place it in a Scaffold body:
// Scaffold(body: Center(child: InteractiveSquare()))
```

## 3. Form Handling

Forms are crucial for collecting user input. Flutter provides powerful widgets for building and validating forms.

### Core Concepts:

*   **`Form` Widget:** A container that groups multiple form fields. It's used to validate and save all fields simultaneously.
*   **`TextFormField`:** A specialized `TextField` designed for use within a `Form`. It includes `validator` and `onSaved` properties.
*   **`GlobalKey<FormState>`:** Used to uniquely identify a `Form` widget and interact with its state (e.g., validate, save).
*   **Validation:** The `validator` callback function in `TextFormField` checks if the input is valid. It returns an error string if invalid, or `null` if valid.
*   **Saving:** The `onSaved` callback function in `TextFormField` is called when the form's `save()` method is invoked.

### Simple Form Example:

```dart
import 'package:flutter/material.dart';

class MyFormPage extends StatefulWidget {
  const MyFormPage({super.key});

  @override
  State<MyFormPage> createState() => _MyFormPageState();
}

class _MyFormPageState extends State<MyFormPage> {
  final _formKey = GlobalKey<FormState>();
  String? _name;
  String? _email;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Form Handling Demo')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            children: <Widget>[
              TextFormField(
                decoration: const InputDecoration(labelText: 'Name'),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter your name';
                  }
                  return null;
                },
                onSaved: (value) {
                  _name = value;
                },
              ),
              TextFormField(
                decoration: const InputDecoration(labelText: 'Email'),
                keyboardType: TextInputType.emailAddress,
                validator: (value) {
                  if (value == null || value.isEmpty || !value.contains('@')) {
                    return 'Please enter a valid email';
                  }
                  return null;
                },
                onSaved: (value) {
                  _email = value;
                },
              ),
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 16.0),
                child: ElevatedButton(
                  onPressed: () {
                    // Validate returns true if the form is valid, or false otherwise.
                    if (_formKey.currentState!.validate()) {
                      _formKey.currentState!.save(); // Save all fields
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text('Processing Data: Name: $_name, Email: $_email'),
                        ),
                      );
                      // Here you would typically send data to a server or process it.
                    }
                  },
                  child: const Text('Submit'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// To use this widget, place it in a MaterialApp home:
// home: MyFormPage(),
```

--- 

### Quick Understanding Checklist/Exercise:

1.  **Navigation:** Describe how you would navigate from `ScreenA` to `ScreenB` using `Navigator.push()` and then pass a result (e.g., a selected item ID) back from `ScreenB` to `ScreenA` when `ScreenB` is popped.
2.  **Gesture Detection:** Give an example of a UI element where `GestureDetector` would be a better choice for interaction than a standard `ElevatedButton`, and explain why.
3.  **Form Validation:** What is the primary purpose of `GlobalKey<FormState>` in Flutter forms, and when would you typically use its `validate()` and `save()` methods?
