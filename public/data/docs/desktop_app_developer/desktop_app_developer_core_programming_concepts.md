# Core Programming Principles and Design Patterns: A Study Guide

Building robust, scalable, and maintainable desktop applications requires a solid foundation in core programming principles and an understanding of common software design patterns. This guide will reinforce these fundamental concepts, providing you with the tools to write efficient and elegant code.

## 1. Fundamental Programming Concepts

### 1.1 Data Structures

Data structures are specialized formats for organizing and storing data, enabling efficient access and modification. Choosing the right data structure can significantly impact your application's performance.

*   **Arrays/Lists:** Collections of elements stored in contiguous memory locations (Arrays) or linked nodes (Lists). Arrays offer O(1) random access, while Linked Lists excel in O(1) insertion/deletion at specific points (if you have a pointer to that node).
*   **Stacks:** A LIFO (Last-In, First-Out) collection. Operations include `push` (add to top) and `pop` (remove from top). Useful for undo/redo functionality or managing function calls.
*   **Queues:** A FIFO (First-In, First-Out) collection. Operations include `enqueue` (add to rear) and `dequeue` (remove from front). Ideal for task scheduling or processing user input in order.
*   **Hash Maps (Dictionaries):** Store key-value pairs, providing average O(1) time complexity for lookup, insertion, and deletion. Crucial for fast data retrieval based on a unique identifier.

### 1.2 Algorithms

Algorithms are step-by-step procedures or formulas for solving a problem. Understanding common algorithms and their efficiency (often expressed in Big O notation) is vital for performance optimization.

*   **Sorting Algorithms:** Arrange elements in a specific order (e.g., Bubble Sort, Merge Sort, Quick Sort). Merge Sort and Quick Sort offer better average-case performance (O(n log n)) for large datasets than simpler sorts like Bubble Sort (O(n^2)).
*   **Searching Algorithms:** Find a specific element within a data structure (e.g., Linear Search, Binary Search).
    *   **Linear Search:** Checks each element sequentially. O(n).
    *   **Binary Search:** Requires a sorted collection. Repeatedly divides the search interval in half. O(log n).

```csharp
// Example: Binary Search (conceptual C# like pseudocode)
int BinarySearch(int[] sortedArray, int target) {
    int low = 0;
    int high = sortedArray.Length - 1;

    while (low <= high) {
        int mid = low + (high - low) / 2; // Prevent overflow

        if (sortedArray[mid] == target) {
            return mid; // Target found
        } else if (sortedArray[mid] < target) {
            low = mid + 1; // Search in the right half
        } else {
            high = mid - 1; // Search in the left half
        }
    }
    return -1; // Target not found
}
```

### Exercise 1: Data Structures & Algorithms
1.  When would you prefer a `Queue` over a `Stack` for processing user input events in a desktop application?
2.  Explain the main advantage of a `Hash Map` over a `List` when frequently looking up objects by a unique ID.
3.  What does `O(log n)` complexity mean in the context of Binary Search?

## 2. Programming Paradigms

### 2.1 Object-Oriented Programming (OOP)

OOP is a programming paradigm based on the concept of "objects", which can contain data (attributes) and code (methods). It emphasizes modularity, reusability, and maintainability. The four pillars are:

*   **Encapsulation:** Bundling the data and the methods that operate on the data within a single unit (a class). It restricts direct access to some of an object's components, meaning you can control how data is accessed and modified. This is often achieved using access modifiers (e.g., `private`, `public`).

    ```csharp
    // Example: Encapsulation
    public class UserProfile {
        private string _username; // Private field

        public string Username { // Public property (controlled access)
            get { return _username; }
            set {
                if (!string.IsNullOrEmpty(value) && value.Length >= 3) {
                    _username = value;
                }
                // else: Handle invalid username
            }
        }
    }
    ```

*   **Inheritance:** Allows a new class (subclass/derived class) to inherit properties and behaviors from an existing class (superclass/base class). This promotes code reuse and establishes an "is-a" relationship.

*   **Polymorphism:** The ability of objects of different classes to respond to the same method call in their own specific ways. It literally means "many forms" and is often achieved through method overriding (runtime polymorphism) or method overloading (compile-time polymorphism), and interfaces/abstract classes.

    ```csharp
    // Example: Inheritance and Polymorphism
    public abstract class Shape { // Abstract base class
        public abstract double CalculateArea(); // Abstract method
    }

    public class Circle : Shape { // Derived class
        public double Radius { get; set; }
        public Circle(double r) { Radius = r; }
        public override double CalculateArea() { return Math.PI * Radius * Radius; }
    }

    public class Rectangle : Shape { // Derived class
        public double Width { get; set; }
        public double Height { get; set; }
        public Rectangle(double w, double h) { Width = w; Height = h; }
        public override double CalculateArea() { return Width * Height; }
    }

    // Usage:
    List<Shape> shapes = new List<Shape>();
    shapes.Add(new Circle(5));
    shapes.Add(new Rectangle(4, 6));

    foreach (Shape s in shapes) {
        Console.WriteLine($"Area: {s.CalculateArea()}"); // Polymorphic call
    }
    ```

*   **Abstraction:** Hiding the complex implementation details and showing only the essential features of an object. This can be achieved using abstract classes and interfaces, allowing you to define a contract without providing concrete implementation.

### 2.2 Functional Programming (FP) - Brief Mention

While OOP is dominant, functional programming principles (like immutability, pure functions, and higher-order functions) can be beneficially applied within parts of a desktop application, especially for data transformation or UI state management, leading to more predictable and testable code.

### Exercise 2: Programming Paradigms
1.  Create a class hierarchy for `Vehicle` with derived classes `Car` and `Motorcycle`. Demonstrate how inheritance is used.
2.  Illustrate polymorphism by having a method `StartEngine()` that behaves differently for `Car` and `Motorcycle`.
3.  How does encapsulation help in preventing invalid data states in an object?

## 3. Common Software Design Patterns

Design patterns are proven, reusable solutions to common problems in software design. They provide a common vocabulary and best practices for building flexible, maintainable, and efficient systems.

### 3.1 Creational Pattern: Factory Method

*   **Purpose:** Provides an interface for creating objects in a superclass, but allows subclasses to alter the type of objects that will be created. It decouples the client code from concrete classes.
*   **When to Use:** When a class can't anticipate the class of objects it needs to create, or when a class wants its subclasses to specify the objects it creates.

    ```csharp
    // Example: Factory Method (creating different UI elements based on OS)
    // Abstract Product
    public interface IButton { void Render(); }

    // Concrete Products
    public class WindowsButton : IButton { public void Render() { Console.WriteLine("Rendering a Windows Button."); } }
    public class MacButton : IButton { public void Render() { Console.WriteLine("Rendering a Mac Button."); } }

    // Abstract Creator
    public abstract class Dialog {
        public abstract IButton CreateButton(); // Factory Method
        public void Render() { IButton button = CreateButton(); button.Render(); }
    }

    // Concrete Creators
    public class WindowsDialog : Dialog { public override IButton CreateButton() { return new WindowsButton(); } }
    public class MacDialog : Dialog { public override IButton CreateButton() { return new MacButton(); } }

    // Usage:
    Dialog dialog = new WindowsDialog(); // Or new MacDialog();
    dialog.Render();
    ```

### 3.2 Structural Pattern: Adapter

*   **Purpose:** Allows objects with incompatible interfaces to collaborate. It acts as a wrapper between two objects, catching calls for one object and translating them to a format understandable by the other.
*   **When to Use:** When you want to use an existing class, but its interface doesn't match the one you need, or when you want to reuse several existing subclasses that lack some common functionality that can't be added to the superclass.

    ```csharp
    // Example: Adapting a legacy logger to a new logging interface
    // New Logger Interface
    public interface ILogger { void Log(string message); }

    // Legacy Logger (incompatible interface)
    public class OldSystemLogger {
        public void WriteLogMessage(string text) { Console.WriteLine($"[OLD SYSTEM LOG]: {text}"); }
    }

    // Adapter
    public class OldSystemLoggerAdapter : ILogger {
        private readonly OldSystemLogger _legacyLogger;
        public OldSystemLoggerAdapter(OldSystemLogger logger) { _legacyLogger = logger; }
        public void Log(string message) { _legacyLogger.WriteLogMessage(message); }
    }

    // Usage:
    ILogger newLogger = new OldSystemLoggerAdapter(new OldSystemLogger());
    newLogger.Log("This message is logged via the adapter.");
    ```

### 3.3 Behavioral Pattern: Observer

*   **Purpose:** Defines a one-to-many dependency between objects so that when one object (the subject) changes state, all its dependents (the observers) are notified and updated automatically. Essential for event-driven UI programming.
*   **When to Use:** When a change in one object requires changing others, and you don't know how many objects need to be changed, or when the objects that need to be changed should be loosely coupled.

    ```csharp
    // Example: Button click notification
    // Subject interface
    public interface ISubject {
        void Attach(IObserver observer);
        void Detach(IObserver observer);
        void Notify();
    }

    // Observer interface
    public interface IObserver { void Update(string message); }

    // Concrete Subject (e.g., a Button)
    public class MyButton : ISubject {
        private List<IObserver> _observers = new List<IObserver>();
        private string _state; // Internal state that observers care about

        public void Attach(IObserver observer) { _observers.Add(observer); }
        public void Detach(IObserver observer) { _observers.Remove(observer); }
        public void Notify() {
            foreach (var observer in _observers) {
                observer.Update($"Button state changed to: {_state}");
            }
        }

        public void Click() {
            _state = "Clicked";
            Console.WriteLine("Button was clicked!");
            Notify(); // Notify all attached observers
        }
    }

    // Concrete Observer (e.g., a TextLabel or StatusDisplay)
    public class StatusDisplay : IObserver {
        private string _name;
        public StatusDisplay(string name) { _name = name; }
        public void Update(string message) { Console.WriteLine($"[{_name}] Received update: {message}"); }
    }

    // Usage:
    MyButton button = new MyButton();
    StatusDisplay display1 = new StatusDisplay("PrimaryDisplay");
    StatusDisplay display2 = new StatusDisplay("SecondaryDisplay");

    button.Attach(display1);
    button.Attach(display2);
    button.Click(); // Both displays will be updated
    ```

### Exercise 3: Design Patterns
1.  Explain a scenario in a desktop application where using the **Factory Method** pattern would be beneficial.
2.  Describe how the **Adapter** pattern could be used to integrate a third-party analytics library into an existing application without changing the analytics library's code.
3.  Why is the **Observer** pattern particularly useful in graphical user interface (GUI) development?

By mastering these core programming principles and design patterns, you'll be well-equipped to develop scalable, maintainable, and high-performing desktop applications.