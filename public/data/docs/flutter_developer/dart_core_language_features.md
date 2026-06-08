# Dart Core Language Features: Study Guide

Dart is an object-oriented, class-based, garbage-collected language with C-style syntax. It's renowned for being the language behind Flutter, enabling high-performance, beautiful cross-platform applications. Understanding its core features is fundamental for any Flutter developer.

## 1. Dart's Type System

Dart is a **statically typed** language, meaning variable types are known at compile time. This helps catch errors early and improves code readability and maintainability. However, it also supports **type inference**, where Dart can automatically deduce the type of a variable based on its initial value.

*   **Explicit Types:**
    ```dart
    String name = "Alice";
    int age = 30;
    double price = 99.99;
    bool isActive = true;
    ```
*   **`var` Keyword:** Allows Dart to infer the type. Once inferred, the type is fixed.
    ```dart
    var city = "New York"; // city is inferred as String
    // city = 123; // Error: A value of type 'int' can't be assigned to a variable of type 'String'.
    ```
*   **`dynamic` Keyword:** Opts out of static type checking. A `dynamic` variable can hold values of any type and its type can change at runtime. Use sparingly.
    ```dart
    dynamic value = "Hello";
    print(value.length); // OK
    value = 123;
    print(value + 1);    // OK
    ```
*   **`Object` Type:** The root of all Dart objects. A variable of type `Object` can hold any non-nullable value, but you lose type-specific methods unless you cast.
    ```dart
    Object myObject = "Dart";
    // print(myObject.length); // Error: The getter 'length' isn't defined for the type 'Object'.
    print((myObject as String).length); // OK with casting
    ```

## 2. Null Safety

Dart's **null safety** feature (introduced in Dart 2.12) helps prevent null reference errors, a common source of bugs in many programming languages. By default, variables are **non-nullable**, meaning they cannot hold `null`.

*   **Non-nullable by Default:**
    ```dart
    String name = "John";
    // String anotherName; // Error: A non-nullable variable 'anotherName' must be initialized.
    ```
*   **Nullable Types (using `?`):** To allow a variable to hold `null`, you append `?` to its type.
    ```dart
    String? greeting = "Hello";
    greeting = null; // OK
    ```
*   **Null Assertion Operator (`!`):** Tells Dart that you are sure a nullable expression is not null at runtime. If it *is* null, a runtime error occurs. Use with caution.
    ```dart
    String? maybeName = "Alice";
    String definitelyName = maybeName!; // OK here because maybeName is not null

    String? anotherName;
    // String badAttempt = anotherName!; // This would throw a runtime error (Null check operator used on a null value)
    ```
*   **`late` Keyword:** Used for non-nullable variables that are initialized after their declaration but before they are first used. Useful for circular dependencies or when initialization depends on other class members.
    ```dart
    late String description;
    void setup() {
      description = "A comprehensive guide.";
    }
    // ... later in code ...
    // setup(); // Must be called before accessing description
    // print(description);
    ```
*   **`required` Keyword:** Used in constructors to mark parameters that must be provided when an object is created.
    ```dart
    class User {
      String name;
      User({required this.name});
    }
    // User user = User(); // Error: The named parameter 'name' is required.
    User user = User(name: "Alice"); // OK
    ```

## 3. Object-Oriented Programming (OOP) Concepts

Dart is a true object-oriented language, supporting all fundamental OOP principles.

*   **Classes and Objects:**
    - A **class** is a blueprint for creating objects.
    - An **object** is an instance of a class.
    ```dart
    class Dog {
      String name;
      String breed;

      // Constructor
      Dog(this.name, this.breed);

      // Method
      void bark() {
        print("$name barks!");
      }
    }

    // Creating an object (instance of Dog)
    Dog myDog = Dog("Buddy", "Golden Retriever");
    myDog.bark(); // Output: Buddy barks!
    print(myDog.breed); // Output: Golden Retriever
    ```
*   **Inheritance (`extends`):** A class can inherit properties and methods from another class.
    ```dart
    class Poodle extends Dog {
      Poodle(String name) : super(name, "Poodle"); // Call superclass constructor

      @override
      void bark() {
        print("$name yelps excitedly!");
      }
    }
    Poodle myPoodle = Poodle("Max");
    myPoodle.bark(); // Output: Max yelps excitedly!
    ```
*   **Mixins (`with`):** A way to reuse code in multiple class hierarchies. A mixin provides an implementation of methods and variables.
    ```dart
    mixin Flyable {
      void fly() {
        print("I can fly!");
      }
    }

    class Bird with Flyable {
      // Bird gets the fly() method
    }
    Bird robin = Bird();
    robin.fly(); // Output: I can fly!
    ```
*   **Interfaces (Implicit `implements`):** In Dart, every class implicitly defines an interface. You can `implement` any class as an interface, meaning you must provide concrete implementations for all its methods and properties.
    ```dart
    class Greeter {
      String greet(String name) => "Hello, $name!";
    }

    class FormalGreeter implements Greeter {
      @override
      String greet(String name) => "Good day, Mr./Ms. $name.";
    }
    FormalGreeter fg = FormalGreeter();
    print(fg.greet("Smith")); // Output: Good day, Mr./Ms. Smith.
    ```
*   **Abstract Classes:** Classes that cannot be instantiated directly and may contain abstract (unimplemented) methods. Subclasses must implement abstract methods.
    ```dart
    abstract class Shape {
      void draw(); // Abstract method
      void getArea(); // Another abstract method
    }

    class Circle extends Shape {
      @override
      void draw() {
        print("Drawing a circle.");
      }
      @override
      void getArea() { /* ... calculate area ... */ }
    }
    // Shape s = Shape(); // Error: Abstract classes can't be instantiated.
    Circle c = Circle();
    c.draw(); // Output: Drawing a circle.
    ```

## 4. Functional Programming Aspects

Dart embraces functional programming concepts, treating functions as first-class citizens.

*   **Functions as First-Class Objects:** Functions can be assigned to variables, passed as arguments, and returned from other functions.
    ```dart
    void sayHello(String name) {
      print("Hello, $name!");
    }

    void executeFunction(Function func, String param) {
      func(param);
    }

    executeFunction(sayHello, "Dart"); // Output: Hello, Dart!
    ```
*   **Anonymous Functions (Lambdas):** Functions without a name, often used for short, inline operations.
    ```dart
    var numbers = [1, 2, 3];
    numbers.forEach((number) {
      print(number * 2);
    });
    // Output:
    // 2
    // 4
    // 6
    ```
*   **Higher-Order Functions:** Functions that take other functions as arguments or return functions. Common examples include `map`, `where`, `forEach`, `reduce`.
    ```dart
    var numbers = [1, 2, 3];
    var doubledNumbers = numbers.map((number) => number * 2).toList();
    print(doubledNumbers); // Output: [2, 4, 6]

    var evenNumbers = numbers.where((number) => number % 2 == 0).toList();
    print(evenNumbers); // Output: [2]
    ```
*   **Closures:** A function object that has access to variables in its lexical scope, even when the function is used outside of its original scope.
    ```dart
    Function makeAdder(int addBy) {
      return (int i) => addBy + i;
    }

    var add2 = makeAdder(2);
    print(add2(3)); // Output: 5 (3 + 2)
    ```

## 5. Package Management (Pub)

Dart's package manager is **Pub**. It handles adding, managing, and resolving dependencies for your Dart projects.

*   **`pubspec.yaml`:** The manifest file for your project. It specifies metadata, dependencies, and assets.
    ```yaml
    name: my_project
    description: A sample Dart project.
    version: 1.0.0

    environment:
      sdk: '>=3.0.0 <4.0.0'

    dependencies:
      http: ^1.1.0 # External package
      path: ^1.8.0 # Another external package

    dev_dependencies:
      lints: ^2.0.0 # For development only
      test: ^1.24.0 # For testing
    ```
*   **`pub get`:** Downloads all the dependencies listed in `pubspec.yaml` into your project's `.dart_tool/package_config.json` and creates a `pubspec.lock` file.
*   **`pub upgrade`:** Updates all dependencies to the latest possible versions allowed by the version constraints in `pubspec.yaml`.
*   **Importing Packages:**
    ```dart
    import 'package:http/http.dart' as http; // Importing an external package
    import 'dart:math'; // Importing a core Dart library

    void fetchData() async {
      var url = Uri.https('example.com', 'whatsit/create');
      var response = await http.post(url, body: {'name': 'doodle', 'color': 'blue'});
      print('Response status: ${response.statusCode}');
    }
    ```

## 6. Essential Collection Types

Dart provides powerful built-in collection types to store and manage data.

*   **Lists:** Ordered, index-based collections. Can contain duplicate elements.
    ```dart
    List<int> numbers = [1, 2, 3, 4, 5];
    print(numbers[0]); // Output: 1
    numbers.add(6);
    numbers.remove(3); // Removes the first occurrence of 3
    print(numbers.length); // Output: 5 (now: [1, 2, 4, 5, 6])
    ```
*   **Sets:** Unordered collections of unique elements. Useful for checking membership efficiently.
    ```dart
    Set<String> colors = {'red', 'green', 'blue'};
    colors.add('green'); // No effect, 'green' is already present
    colors.remove('red');
    print(colors.contains('blue')); // Output: true
    print(colors); // Output: {green, blue} (order might vary)
    ```
*   **Maps:** Key-value pairs, similar to dictionaries or hash tables. Keys must be unique.
    ```dart
    Map<String, String> capitals = {
      'USA': 'Washington D.C.',
      'France': 'Paris',
      'Japan': 'Tokyo'
    };
    print(capitals['France']); // Output: Paris
    capitals['Germany'] = 'Berlin';
    capitals.remove('USA');
    print(capitals.containsKey('Japan')); // Output: true
    print(capitals.values); // Output: (Paris, Tokyo, Berlin)
    ```

---

## Quick Understanding Checklist/Exercise:

1.  **Null Safety & Types:** Explain why `String? name;` is allowed, but `String name;` might cause a compile-time error in Dart. Provide a code snippet that uses the `!` operator and explain its risk.
2.  **OOP - Mixins vs. Inheritance:** Briefly describe a scenario where using a `mixin` would be more appropriate than `extends` inheritance in Dart.
3.  **Collections & Functional:** Write Dart code to create a `List` of numbers (e.g., `[10, 15, 20, 25, 30]`), then use a higher-order function to filter out all odd numbers and store the even ones in a new `List` called `evenNumbers`.