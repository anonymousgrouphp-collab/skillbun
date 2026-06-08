# Dart Asynchronous Programming & Streams

Asynchronous programming is fundamental for building responsive and efficient applications, especially in Flutter, where operations like fetching data from a network, reading files, or performing heavy computations should not block the main UI thread. Dart offers robust features like `Futures`, `async`/`await`, `Streams`, and `Isolates` to handle concurrency effectively.

## 1. Futures & `async`/`await`

### What is a Future?
A `Future` is an object representing a potential value or error that will be available at some time in the future. It's Dart's way of handling single, delayed computations. When you call an asynchronous function, it returns a `Future` immediately, and the function's body continues to execute later.

*   **States of a Future:**
    *   **Uncompleted:** The `Future` has not yet produced a value.
    *   **Completed with a value:** The `Future` successfully produced a value.
    *   **Completed with an error:** The `Future` failed to produce a value and threw an error.

### The `async` and `await` Keywords
The `async` and `await` keywords make asynchronous code look and behave more like synchronous code, improving readability.

*   **`async`:** Marks a function as asynchronous. An `async` function always returns a `Future`.
*   **`await`:** Can only be used inside an `async` function. It pauses the execution of the `async` function until the `Future` it's waiting on completes, then it resumes with the `Future`'s result.

```dart
Future<String> fetchUserData() async {
  print("Fetching user data...");
  // Simulate a network request delay
  await Future.delayed(Duration(seconds: 2));
  print("User data fetched!");
  return "John Doe";
}

void main() async {
  print("Program started.");
  String userData = await fetchUserData(); // Await the Future
  print("Received user data: $userData");
  print("Program finished.");
}
```
**Output:**
```
Program started.
Fetching user data...
User data fetched!
Received user data: John Doe
Program finished.
```

### Error Handling with Futures
You can handle errors in `async` functions using `try-catch` blocks, similar to synchronous code.

```dart
Future<String> fetchDataWithError() async {
  await Future.delayed(Duration(seconds: 1));
  throw Exception("Failed to fetch data!");
}

void main() async {
  try {
    String data = await fetchDataWithError();
    print("Data: $data");
  } catch (e) {
    print("Caught error: $e");
  }
}
```

## 2. Streams

### What is a Stream?
While `Future` handles a single asynchronous event, a `Stream` handles a sequence of asynchronous events. Think of a stream as a pipe where data flows over time. It's commonly used for events like user gestures, file I/O, network requests, or data subscriptions.

*   **Types of Streams:**
    *   **Single-subscription streams:** Can only be listened to once. If you try to listen again, you'll get an error. (e.g., HTTP responses, file reads).
    *   **Broadcast streams:** Can have multiple listeners. (e.g., UI events like button clicks).

### Creating and Consuming Streams
You can create streams using `async*` (async generator functions) and `yield` keyword.

```dart
Stream<int> countStream(int max) async* {
  for (int i = 1; i <= max; i++) {
    await Future.delayed(Duration(milliseconds: 500)); // Simulate async work
    yield i; // Emit a value to the stream
  }
}

void main() {
  print("Starting stream listener...");
  // Consuming a stream using .listen()
  countStream(3).listen(
    (data) {
      print("Received data: $data");
    },
    onError: (error) {
      print("Error: $error");
    },
    onDone: () {
      print("Stream finished.");
    },
  );

  print("Main continues immediately.");
}
```

Alternatively, you can consume a stream using `await for` within an `async` function:

```dart
void main() async {
  print("Starting await for stream...");
  await for (var data in countStream(3)) {
    print("Received data with await for: $data");
  }
  print("Await for stream finished.");
}
```

## 3. Isolates

### What are Isolates?
Dart runs in a single-threaded execution model. However, for CPU-intensive computations that would otherwise block the main UI thread and cause jank (like image processing or complex calculations), Dart provides `Isolates`.

An `Isolate` is like a small, isolated Dart program that runs independently, with its own memory heap, ensuring that no shared mutable state exists between isolates. This prevents common concurrency issues like race conditions.

### When to Use Isolates?
Use Isolates when you have a long-running, CPU-bound task that cannot be handled efficiently on the main event loop without causing UI unresponsiveness. Network requests, which are I/O bound, are typically handled by `Futures` without needing Isolates, as the waiting time doesn't block the CPU.

### Communication between Isolates
Isolates communicate by sending messages (usually primitive types or other `SendPort`s) through `SendPort` and `ReceivePort` objects.

```dart
import 'dart:isolate';

// Function to run in a new Isolate
void heavyComputation(SendPort sendPort) {
  int sum = 0;
  for (int i = 0; i < 1000000000; i++) {
    sum += i;
  }
  sendPort.send("Computation complete: $sum");
}

void main() async {
  print("Main isolate started.");

  // Create a ReceivePort to receive messages from the new isolate
  ReceivePort receivePort = ReceivePort();

  // Spawn a new isolate
  Isolate newIsolate = await Isolate.spawn(heavyComputation, receivePort.sendPort);

  // Listen for messages from the new isolate
  receivePort.listen((message) {
    print("Message from isolate: $message");
    newIsolate.kill(priority: Isolate.immediate); // Kill the isolate after receiving message
    receivePort.close();
  });

  print("Main isolate continues execution.");
  await Future.delayed(Duration(seconds: 1)); // Simulate other work
  print("Main isolate finished its other work.");
}
```
**Note:** While `Isolate.spawn` is fundamental, for simpler use cases, consider `compute` function from `package:flutter/foundation.dart` (if in Flutter context) which is a convenient wrapper for spawning isolates.

## Quick Checklist/Exercise:

1.  Explain the key difference between a `Future` and a `Stream` in Dart.
2.  Write a simple `async` function that simulates fetching a user's profile and then updating their last login timestamp, using `await` for both operations.
3.  Describe a scenario where using an `Isolate` would be beneficial over just using `Future`s in a Flutter application.
