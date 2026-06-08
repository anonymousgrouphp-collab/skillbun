# Flutter Layout Basics & Material Design Study Guide

Welcome to the Flutter Layout Basics & Material Design study guide! This guide will equip you with the fundamental knowledge to construct beautiful and responsive user interfaces using Flutter's powerful widget system and adhering to Material Design principles.

## 1. Understanding Flutter's Widget Tree

In Flutter, everything is a widget. UI is built by composing widgets into a tree structure. Layout widgets are special widgets designed to control the size and position of their children.

## 2. Core Layout Widgets

### 2.1. Container

The `Container` widget is a powerful, all-purpose widget for styling, positioning, and sizing its child widget. It combines common painting, positioning, and sizing widgets into a single widget.

**Key properties:**
*   `child`: The widget inside the container.
*   `padding`, `margin`: Insets for internal and external spacing.
*   `color`, `decoration`: For background color, borders, shadows, etc.
*   `width`, `height`: To specify exact dimensions.

**Example:**
```dart
Container(
  width: 100,
  height: 100,
  padding: EdgeInsets.all(10),
  margin: EdgeInsets.symmetric(vertical: 20),
  color: Colors.blue,
  child: Text('Hello', style: TextStyle(color: Colors.white)),
)
```

### 2.2. Row and Column

`Row` and `Column` are fundamental widgets for arranging children horizontally and vertically, respectively. They are flexbox-like layouts.

*   **Row**: Lays out its children in a horizontal array.
*   **Column**: Lays out its children in a vertical array.

**Key properties:**
*   `children`: A list of widgets to lay out.
*   `mainAxisAlignment`: How children are positioned along the main axis (e.g., `start`, `center`, `end`, `spaceBetween`, `spaceAround`, `spaceEvenly`).
*   `crossAxisAlignment`: How children are positioned along the cross axis (e.g., `start`, `center`, `end`, `stretch`).

**Example (Row):**
```dart
Row(
  mainAxisAlignment: MainAxisAlignment.spaceAround,
  children: <Widget>[
    Icon(Icons.star),
    Text('Rating'),
    Icon(Icons.star_border),
  ],
)
```

### 2.3. Flexible and Expanded

These widgets control how children of `Row` and `Column` fill the available space.

*   **Flexible**: A child of a `Row` or `Column` that will expand or shrink to fill available space. It respects its child's preferred size but can give it more or less space based on the `flex` property.
*   **Expanded**: A shorthand for `Flexible(fit: FlexFit.tight, child: ...)`. It forces its child to fill all available space along the main axis.

**Example:**
```dart
Row(
  children: <Widget>[
    Container(color: Colors.red, width: 50, height: 50),
    Expanded(
      child: Container(color: Colors.green, height: 50),
    ),
    Flexible(
      flex: 2, // Takes twice the space of a flex:1 widget
      child: Container(color: Colors.blue, height: 50),
    ),
  ],
)
```

### 2.4. Stack

`Stack` widgets allow you to layer widgets one on top of another. The first child in the list is the bottom-most widget, and subsequent children are layered on top.

**Key properties:**
*   `children`: A list of widgets to stack.
*   `alignment`: How non-positioned children are aligned within the stack (e.g., `AlignmentDirectional.center`).
*   `Positioned` widget: Often used with `Stack` children to precisely control their position (e.g., `top`, `bottom`, `left`, `right`, `width`, `height`).

**Example:**
```dart
Stack(
  alignment: Alignment.center,
  children: <Widget>[
    Container(width: 200, height: 200, color: Colors.grey),
    Positioned(
      top: 20,
      left: 20,
      child: Container(width: 100, height: 100, color: Colors.red),
    ),
    Text('Overlay', style: TextStyle(color: Colors.white, fontSize: 24)),
  ],
)
```

## 3. Material Design Principles and Widgets

Material Design is a comprehensive design system developed by Google, providing guidelines for visual, motion, and interaction design across platforms and devices. Flutter's Material widgets implement these guidelines.

### 3.1. Scaffold

The `Scaffold` widget provides a basic Material Design visual structure for the current route. It provides APIs for showing drawers, snack bars, and bottom sheets.

**Key properties:**
*   `appBar`: A Material Design app bar.
*   `body`: The primary content of the screen.
*   `floatingActionButton`: A button displayed floating above the content.
*   `bottomNavigationBar`: A navigation bar at the bottom of the screen.

**Example:**
```dart
Scaffold(
  appBar: AppBar(title: Text('My App')),
  body: Center(child: Text('Hello World')),
  floatingActionButton: FloatingActionButton(
    onPressed: () {},
    child: Icon(Icons.add),
  ),
)
```

### 3.2. AppBar

An `AppBar` is a Material Design app bar. It's typically used with a `Scaffold` widget.

**Key properties:**
*   `title`: The primary content of the app bar, typically a `Text` widget.
*   `leading`: A widget to display before the title (e.g., a back button).
*   `actions`: A list of widgets to display after the title (e.g., icons, menu buttons).

**Example (within Scaffold):**
```dart
AppBar(
  title: Text('Product Details'),
  leading: Icon(Icons.arrow_back),
  actions: <Widget>[
    IconButton(icon: Icon(Icons.share), onPressed: () {}),
    IconButton(icon: Icon(Icons.favorite), onPressed: () {}),
  ],
)
```

### 3.3. Buttons (ElevatedButton, TextButton, OutlinedButton)

Flutter provides various Material Design buttons, each with specific use cases.

*   **ElevatedButton**: A Material Design button that is elevated from the surface. Used for primary actions.
*   **TextButton**: A Material Design button that displays text. Used for less prominent actions.
*   **OutlinedButton**: A Material Design button with a thin border. Used for secondary actions.

**Example:**
```dart
Column(
  children: <Widget>[
    ElevatedButton(
      onPressed: () {},
      child: Text('Submit'),
    ),
    TextButton(
      onPressed: () {},
      child: Text('Cancel'),
    ),
  ],
)
```

### 3.4. TextField

A `TextField` is a Material Design text input field that allows the user to enter text.

**Key properties:**
*   `controller`: A `TextEditingController` to manage and listen for changes to the text.
*   `decoration`: An `InputDecoration` to provide hints, labels, icons, and error messages.
*   `keyboardType`: To specify the type of keyboard to display.

**Example:**
```dart
TextField(
  decoration: InputDecoration(
    labelText: 'Enter your name',
    hintText: 'John Doe',
    prefixIcon: Icon(Icons.person),
    border: OutlineInputBorder(),
  ),
  keyboardType: TextInputType.text,
)
```

---

## 4. Combined Code Example

Here's a simple Flutter app demonstrating basic layout and Material widgets:

```dart
import 'package:flutter/material.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Layout Demo',
      theme: ThemeData(
        primarySwatch: Colors.deepPurple,
        useMaterial3: false, // For Material 2 visuals as in examples
      ),
      home: const MyHomePage(),
    );
  }
}

class MyHomePage extends StatelessWidget {
  const MyHomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Layout & Material Widgets'),
        actions: <Widget>[
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () {
              // Handle settings action
            },
          ),
        ],
      ),
      body: SingleChildScrollView( // Allows content to scroll if it exceeds screen height
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            const Text(
              'Welcome to Flutter!',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 20), // Spacer

            // Row Example
            const Text('Row Example:', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
            const SizedBox(height: 10),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: <Widget>[
                Container(
                  width: 80,
                  height: 80,
                  color: Colors.redAccent,
                  alignment: Alignment.center,
                  child: const Text('Box 1', style: TextStyle(color: Colors.white)),
                ),
                Container(
                  width: 80,
                  height: 80,
                  color: Colors.greenAccent,
                  alignment: Alignment.center,
                  child: const Text('Box 2', style: TextStyle(color: Colors.white)),
                ),
                Expanded(
                  child: Container(
                    height: 80,
                    color: Colors.blueAccent,
                    alignment: Alignment.center,
                    margin: const EdgeInsets.only(left: 8),
                    child: const Text('Expanded Box 3', style: TextStyle(color: Colors.white)),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 30),

            // Column and TextField Example
            const Text('User Input & Button:', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
            const SizedBox(height: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: <Widget>[
                const TextField(
                  decoration: InputDecoration(
                    labelText: 'Username',
                    hintText: 'Enter your username',
                    border: OutlineInputBorder(),
                    prefixIcon: Icon(Icons.person),
                  ),
                ),
                const SizedBox(height: 15),
                const TextField(
                  obscureText: true,
                  decoration: InputDecoration(
                    labelText: 'Password',
                    hintText: 'Enter your password',
                    border: OutlineInputBorder(),
                    prefixIcon: Icon(Icons.lock),
                  ),
                ),
                const SizedBox(height: 20),
                ElevatedButton(
                  onPressed: () {
                    // Handle login logic
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Login button pressed!')), 
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 15),
                    textStyle: const TextStyle(fontSize: 18),
                  ),
                  child: const Text('Login'),
                ),
                TextButton(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Forgot Password pressed!')), 
                    );
                  },
                  child: const Text('Forgot Password?'),
                ),
              ],
            ),

            const SizedBox(height: 30),

            // Stack Example
            const Text('Stack Example:', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
            const SizedBox(height: 10),
            Center(
              child: Stack(
                alignment: Alignment.center,
                children: <Widget>[
                  Container(
                    width: 250,
                    height: 150,
                    color: Colors.purple.shade200,
                  ),
                  Positioned(
                    top: 10,
                    right: 10,
                    child: Container(
                      width: 50,
                      height: 50,
                      color: Colors.orange,
                      alignment: Alignment.center,
                      child: const Icon(Icons.info, color: Colors.white),
                    ),
                  ),
                  const Text(
                    'Layered Content',
                    style: TextStyle(fontSize: 20, color: Colors.white, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
```

---

## 5. Checklist / Exercise

1.  **Layout Challenge**: Create a new Flutter project. In the `body` of a `Scaffold`, use a `Column` to arrange two `Row` widgets. Each `Row` should contain three `Container` widgets of different colors. Make the middle `Container` in the *second* `Row` expand to fill available horizontal space using `Expanded`.
2.  **Material Design Integration**: Modify the `AppBar` of your `Scaffold` to include a `leading` icon, a `title` text, and two `IconButton` widgets in the `actions`. Add a `FloatingActionButton` that displays an `Icon(Icons.add)`.
3.  **Interactive Elements**: Add a `TextField` with an `InputDecoration` that includes a `labelText`, `hintText`, and a `prefixIcon`. Below it, add an `ElevatedButton` and a `TextButton`. Ensure they have distinct appearances.