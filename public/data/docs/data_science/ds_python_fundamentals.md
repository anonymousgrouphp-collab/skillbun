# Python Programming Fundamentals for Data Science

Python is the cornerstone of modern data science, offering a rich ecosystem of libraries and tools for data manipulation, analysis, machine learning, and visualization. Mastering its fundamentals is crucial for any aspiring data scientist. This study guide covers the essential Python concepts you'll need.

## 1. Core Python Syntax & Data Types

Understanding the basic building blocks of Python is your first step.

### Variables and Basic Data Types
Variables store data values. Python is dynamically typed, meaning you don't need to declare the variable's type.

*   **Integers (`int`):** Whole numbers (e.g., `10`, `-5`).
*   **Floats (`float`):** Decimal numbers (e.g., `3.14`, `-0.5`).
*   **Strings (`str`):** Sequences of characters enclosed in single or double quotes (e.g., `"hello"`, `'Python'`).
*   **Booleans (`bool`):** Represent truth values, either `True` or `False`.

```python
# Example
age = 30           # int
pi_value = 3.14    # float
name = "Alice"     # str
is_student = True  # bool
```

### Operators
Operators perform operations on variables and values.

*   **Arithmetic:** `+`, `-`, `*`, `/`, `%` (modulo), `**` (exponent), `//` (floor division)
*   **Comparison:** `==` (equal), `!=` (not equal), `<`, `>`, `<=`, `>=`
*   **Logical:** `and`, `or`, `not`
*   **Assignment:** `=`, `+=`, `-=`, `*=` (e.g., `x += 5` is `x = x + 5`)

```python
# Example
x = 10
y = 3
print(f"x + y = {x + y}") # Output: x + y = 13
print(f"x > y is {x > y}") # Output: x > y is True
print(f"not (x == y) is {not (x == y)}") # Output: not (x == y) is True
```

## 2. Fundamental Data Structures

Python offers several built-in data structures to organize and store collections of data.

### Lists
Ordered, mutable (changeable) sequences. Defined with square brackets `[]`.

*   **Creation:** `my_list = [1, "hello", 3.14]`
*   **Accessing elements:** `my_list[0]` (index-based), `my_list[-1]` (last element)
*   **Slicing:** `my_list[1:3]` (elements from index 1 up to, but not including, 3)
*   **Methods:** `append()`, `insert()`, `remove()`, `pop()`, `sort()`, `len()`

```python
data = [10, 20, 30, 40]
data.append(50)  # data is now [10, 20, 30, 40, 50]
print(data[1:4]) # Output: [20, 30, 40]
```

### Tuples
Ordered, immutable (unchangeable) sequences. Defined with parentheses `()` . Often used for fixed collections of items.

*   **Creation:** `my_tuple = (1, "hello", 3.14)`
*   **Accessing:** Similar to lists, using indices.
*   **Immutability:** Once created, elements cannot be added, removed, or changed.

```python
coordinates = (10, 20)
# coordinates.append(30) # This would raise an AttributeError
print(coordinates[0]) # Output: 10
```

### Dictionaries
Unordered, mutable collections of key-value pairs. Keys must be unique and immutable (strings, numbers, tuples). Defined with curly braces `{}`.

*   **Creation:** `person = {"name": "Alice", "age": 30}`
*   **Accessing values:** `person["name"]`
*   **Adding/modifying:** `person["city"] = "New York"`, `person["age"] = 31`
*   **Methods:** `keys()`, `values()`, `items()`, `get()`

```python
stock_prices = {"AAPL": 170, "MSFT": 300}
stock_prices["GOOG"] = 150 # Add a new key-value pair
print(stock_prices.get("AAPL")) # Output: 170
```

### Sets
Unordered collections of unique elements. Defined with curly braces `{}` or `set()`. Useful for membership testing and eliminating duplicates.

*   **Creation:** `my_set = {1, 2, 3, 2}` (will be `{1, 2, 3}`)
*   **Operations:** `add()`, `remove()`, `union()`, `intersection()`, `difference()`

```python
unique_numbers = {1, 2, 3, 3, 4} # {1, 2, 3, 4}
another_set = {3, 4, 5, 6}
print(unique_numbers.union(another_set)) # Output: {1, 2, 3, 4, 5, 6}
```

## 3. Control Flow

Control flow statements dictate the order in which code instructions are executed.

### Conditional Statements (`if`, `elif`, `else`)
Execute blocks of code based on conditions.

```python
score = 85
if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
else:
    grade = "C"
print(f"Grade: {grade}") # Output: Grade: B
```

### Loops (`for`, `while`)
Repeat blocks of code.

*   **`for` loop:** Iterates over a sequence (list, tuple, string, range, etc.).

    ```python
    for i in range(3): # range(3) generates 0, 1, 2
        print(i)
    # Output: 0, 1, 2
    ```
*   **`while` loop:** Repeats as long as a condition is true.

    ```python
    count = 0
    while count < 3:
        print(count)
        count += 1
    # Output: 0, 1, 2
    ```
*   **`break`, `continue`, `pass`:**
    *   `break`: Exits the loop immediately.
    *   `continue`: Skips the rest of the current iteration and moves to the next.
    *   `pass`: A null operation; nothing happens when it executes. Used as a placeholder.

## 4. Functions

Functions are blocks of organized, reusable code that perform a single, related action. They promote modularity and code reuse.

### Defining Functions
Use the `def` keyword. Functions can take arguments (parameters) and return values.

```python
def greet(name):
    """This function greets the person passed in as a parameter."""
    return f"Hello, {name}!"

message = greet("Data Scientist")
print(message) # Output: Hello, Data Scientist!
```

### Lambda Functions
Small, anonymous functions defined with the `lambda` keyword. They can take any number of arguments but can only have one expression. Often used for short, single-expression operations.

```python
add_two = lambda x: x + 2
print(add_two(5)) # Output: 7

# Used often with higher-order functions like map(), filter(), sorted()
numbers = [1, 2, 3, 4]
squared_numbers = list(map(lambda x: x*x, numbers))
print(squared_numbers) # Output: [1, 4, 9, 16]
```

## 5. Error Handling

Python uses `try`, `except` blocks to handle errors gracefully, preventing your program from crashing.

```python
try:
    result = 10 / 0
except ZeroDivisionError:
    print("Error: Cannot divide by zero!")
except TypeError:
    print("Error: Type mismatch.")
else:
    print(f"Result is {result}")
finally:
    print("Execution attempt finished.")
```
In this example, the `ZeroDivisionError` is caught, and a message is printed instead of crashing the program. `finally` block always executes.

## 6. Object-Oriented Programming (OOP) Basics

OOP helps organize code into reusable blueprints (classes) and instances (objects).

### Classes and Objects
*   **Class:** A blueprint for creating objects (e.g., `Car` class).
*   **Object:** An instance of a class (e.g., `my_car = Car("Red")`).

### Attributes and Methods
*   **Attributes:** Variables associated with a class or object (data).
*   **Methods:** Functions defined inside a class that operate on the object's attributes.

### `__init__` Method
A special method (constructor) that is automatically called when a new object is created. It's used to initialize the object's attributes.

```python
class Dog:
    def __init__(self, name, breed):
        self.name = name    # Attribute
        self.breed = breed  # Attribute

    def bark(self): # Method
        return f"{self.name} says Woof!"

# Create an object (instance) of the Dog class
my_dog = Dog("Buddy", "Golden Retriever")

print(f"My dog's name is {my_dog.name} and he is a {my_dog.breed}.")
print(my_dog.bark())
# Output:
# My dog's name is Buddy and he is a Golden Retriever.
# Buddy says Woof!
```

---

### Quick Check/Exercises:

1.  **List Manipulation:** Create a list of five numbers. Add a new number to the end, then remove the second element. Print the final list.
2.  **Dictionary Lookup:** Given a dictionary `student = {"name": "John Doe", "id": "S123", "grades": {"math": 90, "science": 85}}`, write a Python expression to get John's math grade. If the key "grades" might not exist, how would you safely retrieve it?
3.  **Function for Even/Odd:** Write a Python function called `check_even_odd` that takes an integer as an argument and returns the string "Even" if the number is even, and "Odd" if it's odd. Test it with `check_even_odd(7)` and `check_even_odd(10)`.
