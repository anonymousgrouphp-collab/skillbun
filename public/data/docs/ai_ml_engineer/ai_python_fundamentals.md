# Python Programming Fundamentals: Study Guide

This study guide provides a comprehensive overview of the fundamental concepts in Python programming, essential for any AI/ML Engineer. Mastering these principles will build a solid foundation for more advanced topics in data science and machine learning.

## 1. Core Python Syntax & Basic Data Types

Python's syntax is designed for readability. We'll cover variables, basic data types, and operators.

### Key Concepts:
*   **Variables**: Dynamically typed, case-sensitive identifiers for storing data.
*   **Data Types**:
    *   `int`: Whole numbers (e.g., `10`, `-5`).
    *   `float`: Decimal numbers (e.g., `3.14`, `-0.5`).
    *   `str`: Sequences of characters (e.g., `"hello"`, `'Python'`).
    *   `bool`: Boolean values (`True`, `False`).
*   **Operators**:
    *   Arithmetic: `+`, `-`, `*`, `/`, `//` (floor division), `%` (modulo), `**` (exponentiation).
    *   Comparison: `==`, `!=`, `<`, `>`, `<=`, `>=`.
    *   Logical: `and`, `or`, `not`.
    *   Assignment: `=`, `+=`, `-=`, `*=`, `/=`.

### Example:
```python
# Variable assignment
name = "Alice"
age = 30
height = 1.75
is_student = False

# Arithmetic operation
sum_ages = age + 5

# String concatenation
greeting = "Hello, " + name + "!"

# Comparison
is_adult = age >= 18

print(greeting) # Output: Hello, Alice!
print(f"Is Alice an adult? {is_adult}") # Output: Is Alice an adult? True
```

### Checklist/Exercise:
1.  Declare a variable `price` as a float and `quantity` as an integer. Calculate their product and store it in `total_cost`.
2.  Create two boolean variables, `has_discount` and `is_member`. Write an expression to check if a customer is eligible for a special offer (either has discount OR is a member).
3.  Explain the difference between `/` and `//` operators.

## 2. Fundamental Data Structures

Python offers powerful built-in data structures to organize and store collections of data.

### Key Concepts:
*   **Lists (`list`)**: Ordered, mutable collections allowing duplicate elements. Defined with square brackets `[]`.
    *   Operations: indexing, slicing, `append()`, `extend()`, `insert()`, `remove()`, `pop()`, `sort()`.
*   **Tuples (`tuple`)**: Ordered, immutable collections allowing duplicate elements. Defined with parentheses `()`.
    *   Operations: indexing, slicing. Useful for fixed collections of items.
*   **Sets (`set`)**: Unordered, mutable collections of unique elements. Defined with curly braces `{}` or `set()`.
    *   Operations: `add()`, `remove()`, `union()`, `intersection()`, `difference()`.
*   **Dictionaries (`dict`)**: Unordered, mutable collections of key-value pairs. Keys must be unique and immutable. Defined with curly braces `{key: value}`.
    *   Operations: access by key, `keys()`, `values()`, `items()`, `update()`, `pop()`.

### Example:
```python
# List
my_list = [1, "hello", 3.14]
my_list.append(4) # [1, "hello", 3.14, 4]

# Tuple
my_tuple = (10, 20, "python")
# my_tuple.append(30) # This would raise an AttributeError

# Set
my_set = {1, 2, 3, 2} # {1, 2, 3} (duplicates removed)
my_set.add(4) # {1, 2, 3, 4}

# Dictionary
my_dict = {"name": "Bob", "age": 25}
print(my_dict["name"]) # Output: Bob
my_dict["age"] = 26
my_dict["city"] = "New York"
```

### Checklist/Exercise:
1.  Create a list of five favorite fruits. Add a new fruit to the list and then remove one.
2.  Given a tuple `coordinates = (10.0, 20.5)`, explain why you cannot change its elements.
3.  Create a dictionary `student_scores = {"Math": 90, "Science": 85}`. Add a new subject "History" with a score of 78. Then, print all the subjects.

## 3. Control Flow

Control flow statements dictate the order in which instructions are executed based on conditions or iterations.

### Key Concepts:
*   **Conditional Statements**:
    *   `if`: Executes a block of code if a condition is `True`.
    *   `elif`: (Else if) Checks another condition if the preceding `if`/`elif` conditions were `False`.
    *   `else`: Executes a block of code if all preceding `if`/`elif` conditions were `False`.
*   **Looping Statements**:
    *   `for` loop: Iterates over a sequence (list, tuple, string, range, etc.).
    *   `while` loop: Continues to execute a block of code as long as a condition is `True`.
*   **Control Keywords**:
    *   `break`: Terminates the current loop.
    *   `continue`: Skips the rest of the current iteration and moves to the next.
    *   `pass`: A null operation; nothing happens when it executes. Useful as a placeholder.

### Example:
```python
# Conditional statement
temperature = 28
if temperature > 30:
    print("It's hot!")
elif temperature > 20:
    print("It's warm.")
else:
    print("It's cold.")
# Output: It's warm.

# For loop
for i in range(3): # i will be 0, 1, 2
    print(f"Iteration {i}")

# While loop
count = 0
while count < 3:
    print(f"Count: {count}")
    count += 1
```

### Checklist/Exercise:
1.  Write a `for` loop that iterates through a list of numbers `[10, 20, 30, 40, 50]` and prints only numbers greater than 25.
2.  Write a `while` loop that asks the user for input until they type "quit".
3.  Explain a scenario where `continue` would be more appropriate than `break` inside a loop.

## 4. Functions

Functions are reusable blocks of code that perform a specific task. They promote modularity and reduce code duplication.

### Key Concepts:
*   **Defining Functions**: Use the `def` keyword.
    *   `def function_name(parameters):`
        *   `"""Docstring explaining the function"""`
        *   `# Function body`
        *   `return value` (optional)
*   **Parameters & Arguments**:
    *   Positional arguments: Passed in the order defined.
    *   Keyword arguments: Passed by name, order doesn't matter.
    *   Default arguments: Parameters with a default value if not provided.
    *   Arbitrary arguments (`*args` for non-keyword, `**kwargs` for keyword).
*   **Return Values**: Functions can return one or more values using the `return` statement.
*   **Scope**: Determines where a variable is accessible (Local, Enclosing, Global, Built-in - LEGB rule).

### Example:
```python
def greet(name="Guest"):
    """Greets the user by name, or as Guest if no name is provided."""
    return f"Hello, {name}!"

def add_numbers(a, b):
    """Adds two numbers and returns the sum."""
    return a + b

print(greet("Charlie")) # Output: Hello, Charlie!
print(greet()) # Output: Hello, Guest!

result = add_numbers(10, 5)
print(f"Sum: {result}") # Output: Sum: 15
```

### Checklist/Exercise:
1.  Write a function `calculate_area(length, width)` that returns the area of a rectangle.
2.  Modify the `greet` function to accept an optional `greeting_word` parameter (defaulting to "Hello").
3.  Explain the difference between `print()` inside a function and `return`ing a value from a function.

## 5. Object-Oriented Programming (OOP) Principles

OOP is a programming paradigm that uses "objects" to design applications and computer programs.

### Key Concepts:
*   **Classes**: Blueprints for creating objects. Define attributes (data) and methods (functions) that objects of that class will have.
*   **Objects**: Instances of a class.
*   **Attributes**: Variables associated with a class or object.
*   **Methods**: Functions defined inside a class that operate on the object's attributes.
*   `__init__` method: A special method (constructor) called when a new object is created, used to initialize object attributes.
*   `self`: A reference to the instance of the class (the object itself). It's the first parameter of any instance method.
*   **Encapsulation**: Bundling data (attributes) and methods that operate on the data within a single unit (class), and restricting direct access to some of an object's components.
*   **Inheritance**: A mechanism where a new class (subclass/child) derives properties and behavior from an existing class (superclass/parent).
*   **Polymorphism**: The ability of an object to take on many forms. Often seen with method overriding (subclass provides its own implementation of a method already defined in its parent class).

### Example:
```python
class Dog:
    def __init__(self, name, breed):
        self.name = name
        self.breed = breed

    def bark(self):
        return f"{self.name} says Woof!"

# Create an object (instance) of the Dog class
my_dog = Dog("Buddy", "Golden Retriever")
print(my_dog.name) # Output: Buddy
print(my_dog.bark()) # Output: Buddy says Woof!

class Labrador(Dog): # Labrador inherits from Dog
    def __init__(self, name, age):
        super().__init__(name, "Labrador") # Call parent constructor
        self.age = age

    def bark(self): # Method overriding
        return f"{self.name} the {self.breed} barks softly."

lab = Labrador("Max", 3)
print(lab.bark()) # Output: Max the Labrador barks softly.
```

### Checklist/Exercise:
1.  Define a class `Car` with attributes `make`, `model`, and `year`. Include a method `display_info()` that prints these details.
2.  Create two instances of the `Car` class and call their `display_info()` methods.
3.  Explain what `self` refers to in a class method.

## 6. Error Handling

Error handling allows your program to gracefully manage unexpected situations and prevent crashes.

### Key Concepts:
*   **Exceptions**: Errors detected during execution. Python raises exceptions when it encounters issues.
*   `try` block: Code that might raise an exception.
*   `except` block: Catches specific exceptions raised in the `try` block.
*   `else` block: Executes if no exception was raised in the `try` block.
*   `finally` block: Always executes, regardless of whether an exception occurred or not. Useful for cleanup operations.
*   `raise` statement: Used to manually trigger an exception.

### Example:
```python
def divide(a, b):
    try:
        result = a / b
    except ZeroDivisionError:
        print("Error: Cannot divide by zero!")
        return None
    except TypeError:
        print("Error: Both arguments must be numbers.")
        return None
    else:
        print("Division successful.")
        return result
    finally:
        print("Division attempt complete.")

print(divide(10, 2))
print(divide(10, 0))
print(divide(10, "a"))
```
*Output:*
```
Division successful.
Division attempt complete.
5.0
Error: Cannot divide by zero!
Division attempt complete.
None
Error: Both arguments must be numbers.
Division attempt complete.
None
```

### Checklist/Exercise:
1.  Write a `try-except` block to handle a `ValueError` that occurs when trying to convert a non-numeric string to an integer.
2.  Explain the purpose of the `finally` block.
3.  Describe a scenario where you might use the `raise` statement.

## 7. Modular Programming

Modular programming involves breaking down a program into independent, interchangeable modules.

### Key Concepts:
*   **Modules**: Python files (`.py`) containing code (functions, classes, variables).
*   **Packages**: Directories containing multiple modules and a special `__init__.py` file, allowing hierarchical organization.
*   `import` statement: Used to bring modules or specific components from modules into the current scope.
    *   `import module_name`
    *   `import module_name as alias`
    *   `from module_name import function_name, ClassName`
    *   `from package_name.module_name import item`
*   `__name__ == "__main__"`: A common idiom to check if a script is being run directly or imported as a module. Code inside this block only runs when the script is executed directly.

### Example:
`my_module.py`:
```python
def greet(name):
    return f"Hello from my_module, {name}!"

PI = 3.14159

class Calculator:
    def add(self, a, b):
        return a + b

if __name__ == "__main__":
    print("This runs when my_module.py is executed directly.")
    print(greet("Direct User"))
```

`main_app.py`:
```python
import my_module
from my_module import Calculator, PI

print(my_module.greet("App User"))
print(PI)

calc = Calculator()
print(f"10 + 20 = {calc.add(10, 20)}")
```

### Checklist/Exercise:
1.  Create a module `math_operations.py` with functions `add(a, b)` and `subtract(a, b)`.
2.  In a separate script, import `math_operations` and call both functions.
3.  Explain the advantage of using `from module import function` over `import module` when you only need a few specific items.

## 8. File I/O

File Input/Output allows your program to interact with files on the computer's filesystem.

### Key Concepts:
*   **Opening Files**: Use the `open()` function.
    *   `file_object = open("filename", "mode")`
    *   `mode`: `'r'` (read, default), `'w'` (write, truncates), `'a'` (append), `'x'` (exclusive creation), `'b'` (binary), `'+'` (read and write).
*   **Reading Files**:
    *   `file_object.read()`: Reads entire file content as a string.
    *   `file_object.readline()`: Reads one line at a time.
    *   `file_object.readlines()`: Reads all lines into a list of strings.
    *   Iterating directly over the file object: `for line in file_object:`.
*   **Writing Files**:
    *   `file_object.write(string)`: Writes a string to the file.
    *   `file_object.writelines(list_of_strings)`: Writes a list of strings to the file.
*   **Closing Files**: `file_object.close()`. Essential to free up resources.
*   **`with` statement**: Recommended for file operations. It ensures the file is automatically closed, even if errors occur.
    *   `with open("filename", "mode") as file_object:`

### Example:
```python
# Writing to a file
with open("my_file.txt", "w") as f:
    f.write("Hello, Python!\n")
    f.write("This is a new line.\n")

# Reading from a file
with open("my_file.txt", "r") as f:
    content = f.read()
    print("File Content:")
    print(content)

# Appending to a file
with open("my_file.txt", "a") as f:
    f.write("Appended line.\n")

# Reading line by line
with open("my_file.txt", "r") as f:
    print("\nReading line by line:")
    for line in f:
        print(line.strip()) # .strip() removes leading/trailing whitespace, including newline
```

### Checklist/Exercise:
1.  Create a file named `data.txt` and write three lines of text into it.
2.  Read the content of `data.txt` line by line and print each line in uppercase.
3.  Explain why using `with open(...)` is considered best practice for file handling.

## 9. Virtual Environments

Virtual environments create isolated Python environments for projects, managing dependencies independently.

### Key Concepts:
*   **Purpose**: Prevents dependency conflicts between different projects. Ensures reproducible development.
*   **`venv` module**: Python's built-in module for creating virtual environments.
*   **Creation**: `python -m venv env_name` (e.g., `python -m venv .venv`). This creates a directory `env_name` (or `.venv`) containing a copy of the Python interpreter and `pip`.
*   **Activation**:
    *   Windows: `.\env_name\Scripts\activate`
    *   macOS/Linux: `source env_name/bin/activate`
*   **Deactivation**: `deactivate`
*   **Managing Packages with `pip`**:
    *   `pip install package_name`: Installs packages into the active virtual environment.
    *   `pip freeze > requirements.txt`: Generates a list of installed packages and their versions for reproducibility.
    *   `pip install -r requirements.txt`: Installs packages from a `requirements.txt` file.

### Example:
```bash
# 1. Create a project directory
mkdir my_project
cd my_project

# 2. Create a virtual environment
python -m venv .venv

# 3. Activate the virtual environment
# On Windows:
# .\.venv\Scripts\activate
# On macOS/Linux:
# source ./.venv/bin/activate

# (venv) is usually displayed in your prompt indicating activation

# 4. Install a package
pip install numpy

# 5. Generate requirements file
pip freeze > requirements.txt

# 6. Deactivate the environment
deactivate
```

### Checklist/Exercise:
1.  Create a new directory for a project and initialize a virtual environment named `my_env` inside it.
2.  Activate `my_env` and install the `pandas` library.
3.  Explain why you would use a virtual environment instead of installing all packages globally.

## 10. Basic Command-Line Usage

Interacting with Python from the command line is fundamental for running scripts and managing environments.

### Key Concepts:
*   **Executing Python Scripts**: `python your_script.py`
    *   Ensures the script is run with the Python interpreter found in your system's PATH, or the one active in your virtual environment.
*   **`pip` (Python Package Installer)**: The standard package-management system used to install and manage software packages written in Python.
    *   `pip list`: Shows installed packages.
    *   `pip show package_name`: Shows details about a specific package.
    *   `pip uninstall package_name`: Uninstalls a package.
*   **Interactive Interpreter**: Type `python` in your terminal to open an interactive Python session (REPL - Read-Eval-Print Loop). Useful for testing small snippets of code.

### Example:
`hello.py`:
```python
print("Hello from the command line!")
```

```bash
# Run the script
python hello.py
# Output: Hello from the command line!

# Enter interactive mode
python
>>> 2 + 2
4
>>> exit() # To exit the interactive interpreter

# List installed packages (in your active venv or global environment)
pip list
```

### Checklist/Exercise:
1.  Create a simple Python script that prints "My first CLI script!". Run it from your terminal.
2.  Open the Python interactive interpreter, perform a simple calculation, and then exit.
3.  Using `pip`, check if `requests` library is installed in your current environment. If not, install it.
