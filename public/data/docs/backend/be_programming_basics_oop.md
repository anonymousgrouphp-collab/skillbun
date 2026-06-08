# Programming Basics & OOP: A Study Guide for Backend Developers

Mastering fundamental programming concepts and Object-Oriented Programming (OOP) principles is crucial for building robust, scalable, and maintainable backend systems. This guide will cover the essentials you need to know.

## 1. Core Programming Basics

These are the foundational building blocks of any programming language.

### 1.1. Variables & Data Types

Variables are named storage locations for data. Data types classify the kind of value a variable can hold, influencing how data is stored and manipulated.

*   **Variables:** `name = "Alice"`, `age = 30`, `is_active = True`
*   **Common Data Types:**
    *   **Integers (int):** Whole numbers (e.g., `10`, `-5`).
    *   **Floating-Point Numbers (float):** Numbers with decimal points (e.g., `3.14`, `-0.5`).
    *   **Strings (str):** Sequences of characters (e.g., `"Hello, World!"`).
    *   **Booleans (bool):** `True` or `False` values, used for logical operations.
    *   **Collections:** Lists/Arrays, Dictionaries/Maps, Sets, Tuples.

### 1.2. Control Flow

Control flow statements dictate the order in which instructions are executed.

*   **Conditional Statements (`if`/`else if`/`else`):** Execute different blocks of code based on conditions.

    ```python
    temperature = 25
    if temperature > 30:
        print("It's hot!")
    elif temperature > 20:
        print("It's warm.")
    else:
        print("It's cool.")
    ```

*   **Looping Constructs (`for`, `while`):** Repeat a block of code multiple times.

    ```python
    # For loop
    for i in range(3):
        print(f"Iteration {i}")

    # While loop
    count = 0
    while count < 2:
        print(f"Count: {count}")
        count += 1
    ```

### 1.3. Functions

Functions are reusable blocks of code that perform a specific task. They promote modularity and reduce code duplication.

```python
def greet(name):
    """This function greets the person passed in as a parameter."""
    return f"Hello, {name}!"

message = greet("Bob")
print(message) # Output: Hello, Bob!
```

## 2. Object-Oriented Programming (OOP)

OOP is a programming paradigm based on the concept of "objects", which can contain data (attributes) and code (methods). It aims to organize code in a way that is modular, reusable, and easy to maintain.

### 2.1. Classes & Objects

*   **Class:** A blueprint or template for creating objects. It defines the attributes (data) and methods (functions) that objects of that class will have.
*   **Object:** An instance of a class. When a class is defined, no memory is allocated until an object is created from it.

    ```python
    class Dog:
        # Class attribute
        species = "Canis familiaris"

        def __init__(self, name, age): # Constructor
            self.name = name  # Instance attribute
            self.age = age    # Instance attribute

        def bark(self):
            return f"{self.name} says Woof!"

    # Creating objects (instances) of the Dog class
    my_dog = Dog("Buddy", 3)
    your_dog = Dog("Lucy", 5)

    print(my_dog.bark())    # Output: Buddy says Woof!
    print(your_dog.species) # Output: Canis familiaris
    ```

### 2.2. Four Pillars of OOP

1.  **Encapsulation:** Bundling data (attributes) and methods (functions) that operate on the data within a single unit (class). It hides the internal state of an object from the outside and only exposes a public interface to interact with it, protecting data integrity.
    *   **Example:** In the `Dog` class, `name` and `age` are encapsulated. We interact with them via `my_dog.name` or methods like `bark()`.

2.  **Inheritance:** A mechanism where a new class (subclass/child class) derives properties and behavior (attributes and methods) from an existing class (superclass/parent class). It promotes code reusability.

    ```python
    class GoldenRetriever(Dog): # GoldenRetriever inherits from Dog
        def __init__(self, name, age, color):
            super().__init__(name, age) # Call parent constructor
            self.color = color

        def retrieve(self):
            return f"{self.name} is retrieving the ball."

    golden = GoldenRetriever("Max", 2, "golden")
    print(golden.bark())     # Inherited method
    print(golden.retrieve()) # Specific method
    ```

3.  **Polymorphism:** The ability of an object to take on many forms. In OOP, it often refers to the ability of different classes to be treated as instances of a common superclass, or for methods with the same name to behave differently based on the object calling them (method overriding).
    *   **Example:** If `Cat` also had a `make_sound()` method, you could iterate a list of `Dog` and `Cat` objects and call `make_sound()` on each without knowing its exact type, and each would make its specific sound.

4.  **Abstraction:** Hiding complex implementation details and showing only the essential features of an object. Achieved through abstract classes and interfaces, which define a contract for what an object can do, without specifying how it does it.
    *   **Example:** A `Vehicle` abstract class might have an abstract `start_engine()` method, which `Car` and `Motorcycle` concrete classes would implement differently.

## 3. Functional Programming Basics (Brief Introduction)

While OOP focuses on objects and state, Functional Programming (FP) emphasizes immutability, pure functions (functions that produce the same output for the same input and have no side effects), and higher-order functions. It can lead to more predictable and testable code, especially in concurrent environments. Key concepts include:

*   **Pure Functions:** No side effects, deterministic.
*   **Immutability:** Data cannot be changed after creation.
*   **First-Class Functions:** Functions can be treated like any other variable (passed as arguments, returned from other functions).

```python
# Example of a pure function (no side effects, always returns same output for same input)
def add(a, b):
    return a + b

# Example of a higher-order function (takes a function as an argument)
def apply_operation(x, y, operation):
    return operation(x, y)

result = apply_operation(5, 3, add)
print(result) # Output: 8
```

--- 

### Quick Understanding Checklist/Exercise:

1.  **Identify Pillars:** For a backend system managing user accounts, how would you apply **Encapsulation** and **Inheritance** to a `User` class and a `AdminUser` class?
2.  **Control Flow Logic:** Write a function that takes a list of numbers and returns a new list containing only the even numbers, using a `for` loop and an `if` statement.
3.  **OOP vs. FP:** Briefly explain a scenario where a functional approach (e.g., using pure functions for data transformation) might be more beneficial than an object-oriented approach in a specific part of a backend application (e.g., data processing pipeline).
