# Core Java & JVM Study Guide

This study guide provides a comprehensive overview of core Java concepts and the Java Virtual Machine (JVM) architecture, essential for any backend developer.

## 1. Introduction to Core Java
Java is a high-level, class-based, object-oriented programming language designed to have as few implementation dependencies as possible. It's known for its "Write Once, Run Anywhere" (WORA) principle, enabled by the JVM.

*   **JDK (Java Development Kit):** Provides tools for developing Java applications (compiler, debugger, JRE, etc.).
*   **JRE (Java Runtime Environment):** Provides the libraries and JVM needed to run Java applications.
*   **JVM (Java Virtual Machine):** The abstract machine that executes Java bytecode.

## 2. Object-Oriented Programming (OOP) in Java
Java is fundamentally an object-oriented language, built around four core principles:

*   **Encapsulation:** Bundling data (attributes) and methods (behaviors) that operate on the data into a single unit (class). Data is often hidden from direct access and exposed via public methods (getters/setters).
*   **Inheritance:** A mechanism where one class (subclass/child) acquires properties and behaviors of another class (superclass/parent). Achieved using the `extends` keyword.
*   **Polymorphism:** The ability of an object to take on many forms. In Java, this is primarily achieved through method overriding (runtime polymorphism) and method overloading (compile-time polymorphism).
*   **Abstraction:** Hiding complex implementation details and showing only essential features of the object. Achieved using abstract classes and interfaces.

### Key Concepts:
*   **Classes and Objects:** A class is a blueprint, an object is an instance of a class.
*   **Constructors:** Special methods used to initialize objects.
*   **Keywords:** `this` (refers to current object), `super` (refers to parent class object), `static` (class-level member), `final` (constant, immutable).
*   **Access Modifiers:** `public`, `private`, `protected`, and default (package-private) control visibility.

```java
// Encapsulation example: Car class with private fields and public getters/setters
class Car {
    private String make;
    private String model;
    private int year;

    public Car(String make, String model, int year) {
        this.make = make;
        this.model = model;
        this.year = year;
    }

    // Getters
    public String getMake() { return make; }
    public String getModel() { return model; }
    public int getYear() { return year; }

    // Example method
    public void displayInfo() {
        System.out.println("Car: " + make + " " + model + " (" + year + ")");
    }
}

// Inheritance and Polymorphism example: ElectricCar extends Car
class ElectricCar extends Car {
    private int batteryCapacityKWh;

    public ElectricCar(String make, String model, int year, int batteryCapacityKWh) {
        super(make, model, year); // Call parent class constructor
        this.batteryCapacityKWh = batteryCapacityKWh;
    }

    public int getBatteryCapacityKWh() { return batteryCapacityKWh; }

    @Override // Method Overriding (Polymorphism)
    public void displayInfo() {
        super.displayInfo(); // Call parent method
        System.out.println("Battery Capacity: " + batteryCapacityKWh + " kWh");
    }

    public static void main(String[] args) {
        Car myCar = new Car("Honda", "Civic", 2020);
        myCar.displayInfo();

        ElectricCar myElectricCar = new ElectricCar("Tesla", "Model 3", 2023, 75);
        myElectricCar.displayInfo(); // Polymorphism in action
    }
}
```

## 3. Collections API
The Java Collections Framework provides a unified architecture for representing and manipulating collections, allowing them to be manipulated independently of their implementation details. It consists of interfaces and classes.

*   **Core Interfaces:**
    *   `List`: Ordered collection (sequence). Allows duplicate elements. (`ArrayList`, `LinkedList`)
    *   `Set`: Collection that contains no duplicate elements. (`HashSet`, `TreeSet`)
    *   `Map`: Object that maps keys to values. Keys must be unique. (`HashMap`, `TreeMap`)
    *   `Queue`: Collection designed for holding elements prior to processing. (`ArrayDeque`, `PriorityQueue`)

```java
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.HashSet;

public class CollectionExample {
    public static void main(String[] args) {
        // List example (ArrayList)
        List<String> fruits = new ArrayList<>();
        fruits.add("Apple");
        fruits.add("Banana");
        fruits.add("Apple"); // Allows duplicates
        System.out.println("Fruits List: " + fruits);
        System.out.println("First fruit: " + fruits.get(0));

        // Set example (HashSet)
        Set<String> uniqueFruits = new HashSet<>();
        uniqueFruits.add("Apple");
        uniqueFruits.add("Banana");
        uniqueFruits.add("Apple"); // Duplicate ignored
        System.out.println("Unique Fruits Set: " + uniqueFruits);

        // Map example (HashMap)
        Map<String, Integer> fruitCounts = new HashMap<>();
        fruitCounts.put("Apple", 3);
        fruitCounts.put("Banana", 2);
        fruitCounts.put("Orange", 1);
        System.out.println("Apple count: " + fruitCounts.get("Apple"));
        System.out.println("All fruit counts: " + fruitCounts);
    }
}
```

## 4. Concurrency (Threads & Executors)
Concurrency in Java allows multiple parts of a program to execute independently, improving performance and responsiveness for certain tasks.

*   **Threads:** The fundamental unit of execution. You can create threads by extending the `Thread` class or implementing the `Runnable` interface. Implementing `Runnable` is generally preferred.
    *   `start()`: Invokes the `run()` method in a new thread.
*   **Synchronization:** Mechanisms to control access to shared resources by multiple threads, preventing data corruption. Keywords include `synchronized` (methods, blocks) and methods like `wait()`, `notify()`, `notifyAll()` for inter-thread communication.
*   **Executors Framework:** Part of `java.util.concurrent`, it provides a higher-level API for managing threads and executing tasks. `ExecutorService` allows you to manage a pool of threads.
    *   `Executors.newFixedThreadPool(int n)`: Creates a thread pool with a fixed number of threads.
    *   `submit(Runnable task)` / `submit(Callable<T> task)`: Submits tasks for execution.
*   **`Future` and `Callable`:** `Callable` is like `Runnable` but can return a result and throw checked exceptions. `Future` represents the result of an asynchronous computation.

```java
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

public class ConcurrencyExample {
    public static void main(String[] args) {
        // Task using Runnable interface
        Runnable task1 = () -> {
            System.out.println("Task 1 started by thread: " + Thread.currentThread().getName());
            try { Thread.sleep(200); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
            System.out.println("Task 1 finished.");
        };

        // Create and start a new Thread directly
        new Thread(task1, "MyThread-1").start();

        // Using ExecutorService for managing threads
        ExecutorService executor = Executors.newFixedThreadPool(2);

        Runnable task2 = () -> {
            System.out.println("Task 2 started by thread: " + Thread.currentThread().getName());
            try { Thread.sleep(300); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
            System.out.println("Task 2 finished.");
        };

        Runnable task3 = () -> {
            System.out.println("Task 3 started by thread: " + Thread.currentThread().getName());
            try { Thread.sleep(100); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
            System.out.println("Task 3 finished.");
        };

        executor.submit(task2);
        executor.submit(task3);

        // Shut down the executor service gracefully
        executor.shutdown();
        try {
            if (!executor.awaitTermination(60, TimeUnit.SECONDS)) {
                executor.shutdownNow(); // Force shutdown if tasks don't complete
            }
        } catch (InterruptedException e) {
            executor.shutdownNow();
        }
    }
}
```

## 5. Generics
Generics enable you to write type-safe code that works with different types of objects, eliminating the need for explicit casting and preventing `ClassCastException` at runtime. They are processed at compile time (type erasure).

*   **Purpose:** Type safety, code reusability, compile-time error checking.
*   **Syntax:** Use angle brackets (`< >`) to specify type parameters, e.g., `<T>` for Type, `<E>` for Element, `<K, V>` for Key-Value.
*   **Wildcards:**
    *   `? extends T`: Upper bounded wildcard. Means "any type that is T or a subclass of T". (e.g., `List<? extends Number>`)
    *   `? super T`: Lower bounded wildcard. Means "any type that is T or a superclass of T". (e.g., `List<? super Integer>`)

```java
class Box<T> { // T is the type parameter
    private T content;

    public void setContent(T content) {
        this.content = content;
    }

    public T getContent() {
        return content;
    }

    public static void main(String[] args) {
        Box<Integer> integerBox = new Box<>();
        integerBox.setContent(123);
        System.out.println("Integer in box: " + integerBox.getContent());

        Box<String> stringBox = new Box<>();
        stringBox.setContent("Hello Generics");
        System.out.println("String in box: " + stringBox.getContent());

        // Box<Double> doubleBox = new Box<>();
        // doubleBox.setContent("Not a double"); // Compile-time error, caught by generics!
    }
}
```

## 6. I/O (Input/Output)
Java's I/O API is extensive, providing classes for reading and writing data to various sources and destinations (files, network streams, console).

*   **Streams:** Represent a sequence of data.
    *   **Byte Streams:** Handle raw binary data (`InputStream`, `OutputStream`). Examples: `FileInputStream`, `FileOutputStream`.
    *   **Character Streams:** Handle text data, automatically dealing with character encodings (`Reader`, `Writer`). Examples: `FileReader`, `FileWriter`, `BufferedReader`, `BufferedWriter`.
*   **`File` Class:** Represents file and directory pathnames, used for file manipulation (create, delete, rename).
*   **`Scanner`:** A utility class for parsing primitive types and strings using regular expressions.

```java
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;

public class FileIOExample {
    public static void main(String[] args) {
        String fileName = "my_sample_file.txt";
        String content = "This is a line of text.\nAnother line here.\n";

        // Writing to a file using BufferedWriter (character stream)
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(fileName))) {
            writer.write(content);
            System.out.println("Successfully wrote to " + fileName);
        } catch (IOException e) {
            System.err.println("Error writing to file: " + e.getMessage());
        }

        // Reading from a file using BufferedReader (character stream)
        try (BufferedReader reader = new BufferedReader(new FileReader(fileName))) {
            String line;
            System.out.println("Reading from " + fileName + ":");
            while ((line = reader.readLine()) != null) {
                System.out.println(line);
            }
        } catch (IOException e) {
            System.err.println("Error reading from file: " + e.getMessage());
        }
    }
}
```

## 7. Exception Handling
Exception handling in Java is a robust mechanism to manage runtime errors and unexpected events, allowing programs to continue executing normally. An `Exception` is an event that disrupts the normal flow of a program.

*   **Keywords:**
    *   `try`: Block of code that might throw an exception.
    *   `catch`: Block that handles a specific type of exception.
    *   `finally`: Block that always executes, regardless of whether an exception occurred or was caught.
    *   `throw`: Used to explicitly throw an exception.
    *   `throws`: Used in a method signature to declare the exceptions that a method might throw.
*   **Types of Exceptions:**
    *   **Checked Exceptions:** Must be declared in a method's `throws` clause or handled with a `try-catch` block. (e.g., `IOException`, `SQLException`). Occur at compile time.
    *   **Unchecked Exceptions (Runtime Exceptions):** Do not need to be declared or caught. They indicate programming errors. (e.g., `NullPointerException`, `ArithmeticException`, `ArrayIndexOutOfBoundsException`). Occur at runtime.

```java
public class ExceptionHandlingExample {

    public static void main(String[] args) {
        try {
            int result = divide(10, 2); // This will succeed
            System.out.println("Result of 10/2: " + result);

            result = divide(10, 0); // This will throw ArithmeticException
            System.out.println("Result of 10/0: " + result); // This line won't be reached
        } catch (ArithmeticException e) {
            System.err.println("Caught an error: " + e.getMessage());
        } finally {
            System.out.println("Finally block always executes.");
        }

        try {
            validateAge(20); // Valid age
            validateAge(16); // Invalid age, throws IllegalArgumentException
        } catch (IllegalArgumentException e) {
            System.err.println("Age validation failed: " + e.getMessage());
        }
    }

    // Method that might throw a checked exception (or unchecked, as shown)
    public static int divide(int numerator, int denominator) {
        if (denominator == 0) {
            throw new ArithmeticException("Cannot divide by zero!"); // Unchecked exception
        }
        return numerator / denominator;
    }

    // Method that declares an unchecked exception
    public static void validateAge(int age) throws IllegalArgumentException {
        if (age < 18) {
            throw new IllegalArgumentException("Age must be 18 or older.");
        }
        System.out.println("Age " + age + " is valid.");
    }
}
```

## 8. Java Virtual Machine (JVM)
The JVM is the runtime engine that executes Java bytecode. It is the component that makes Java platform-independent.

### JVM Architecture:
1.  **Classloader Subsystem:** Responsible for loading, linking, and initializing class files.
    *   **Loading:** Reads the `.class` file and generates binary data. Stores class data in the Method Area.
    *   **Linking:**
        *   *Verification:* Checks the correctness of the bytecode.
        *   *Preparation:* Allocates memory for static variables and initializes them to default values.
        *   *Resolution:* Replaces symbolic references with direct references.
    *   **Initialization:** Executes the static initializers and static blocks of the class.

2.  **Runtime Data Areas:** Memory areas created by the JVM to store data during program execution.
    *   **Method Area:** Stores class-level data (metadata, static variables, constant pool, method code). Shared among all threads.
    *   **Heap Area:** Stores all objects and their corresponding instance variables and arrays. Created during JVM startup. Shared among all threads. This is where Garbage Collection operates.
    *   **Stack Area:** Stores method call frames. Each thread has its own private JVM stack. A frame stores local variables, operand stack, and frame data.
    *   **PC (Program Counter) Registers:** Stores the address of the next instruction to be executed for each thread. Each thread has its own PC register.
    *   **Native Method Stacks:** Holds information about native methods (methods written in languages other than Java).

3.  **Execution Engine:** Executes the bytecode loaded by the Classloader.
    *   **Interpreter:** Reads and executes bytecode instruction by instruction.
    *   **JIT (Just-In-Time) Compiler:** Compiles frequently used bytecode into native machine code for faster execution. Caches compiled code.
    *   **Garbage Collector (GC):** Automatically reclaims memory occupied by objects that are no longer referenced by the program.

### Memory Management (Garbage Collection):
*   **Heap Structure:** The Heap is typically divided into generations to optimize GC: 
    *   **Young Generation:** Where new objects are initially allocated. Divided into Eden Space and two Survivor Spaces (S0 and S1).
    *   **Old Generation:** Objects that survive multiple garbage collection cycles in the Young Generation are moved here.
    *   **Metaspace:** Stores class metadata (since Java 8, replaced PermGen). This memory is outside the Heap.
*   **Garbage Collection Process:** GC identifies and removes unreachable objects (objects with no active references) from the heap. It uses various algorithms (Mark-and-Sweep, Generational, G1, CMS, etc.) to optimize this process, aiming to minimize 