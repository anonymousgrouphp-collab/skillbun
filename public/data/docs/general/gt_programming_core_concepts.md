# Programming Core Concepts (Python)

Welcome to the world of programming! This guide introduces you to the fundamental building blocks of programming using Python, a versatile and beginner-friendly language. Understanding these core concepts is crucial for anyone looking to build software, automate tasks, or analyze data.

## 1. Variables

### Explanation
Variables are named storage locations that hold data. Think of them as containers where you can store different types of information. In Python, you don't need to declare a variable's type explicitly; it's dynamically typed, meaning the type is inferred when you assign a value.

### Code Example
```python
# Assigning a string value to a variable 'name'
name = "Alice"

# Assigning an integer value to a variable 'age'
age = 30

# Reassigning a new value to 'age'
age = 31

print(f"Name: {name}, Age: {age}")
```

### Quick Checklist/Exercise
1.  Declare a variable `city` and assign your current city name to it.
2.  Change the value of `city` to a different city.
3.  Explain in your own words why variables are useful.

## 2. Data Types

### Explanation
Data types classify the kind of values a variable can hold. Python has several built-in data types, which can be broadly categorized as:
*   **Numeric:** `int` (integers like 10, -5), `float` (floating-point numbers like 3.14, 2.0).
*   **Text:** `str` (strings, sequences of characters like "hello", "Python").
*   **Boolean:** `bool` (True or False values, used for logical operations).
*   **Sequence Types:** `list` (ordered, mutable collection, `[1, 2, 3]`), `tuple` (ordered, immutable collection, `(1, 2, 3)`).
*   **Mapping Type:** `dict` (unordered collection of key-value pairs, `{"name": "Alice", "age": 30}`).
*   **Set Types:** `set` (unordered collection of unique items, `{1, 2, 3}`).

### Code Example
```python
# Integer
my_int = 10

# Float
my_float = 3.14

# String
my_string = "Hello, Python!"

# Boolean
my_boolean = True

# List
my_list = ["apple", "banana", "cherry"]

# Tuple
my_tuple = (10, 20, 30)

# Dictionary
my_dict = {"name": "Bob", "occupation": "Engineer"}

print(f"Type of my_int: {type(my_int)}")
print(f"Type of my_list: {type(my_list)}")
print(f"Name from dict: {my_dict['name']}")
```

### Quick Checklist/Exercise
1.  Declare a variable `is_active` and assign a boolean value.
2.  Create a list called `colors` with at least three different color names.
3.  How does a `list` differ from a `tuple` in Python?

## 3. Operators

### Explanation
Operators are special symbols that perform operations on values and variables.
*   **Arithmetic Operators:** `+`, `-`, `*`, `/`, `%` (modulo), `**` (exponentiation), `//` (floor division).
*   **Comparison Operators:** `==` (equal to), `!=` (not equal to), `>` (greater than), `<` (less than), `>=` (greater than or equal to), `<=` (less than or equal to).
*   **Logical Operators:** `and`, `or`, `not` (used to combine conditional statements).
*   **Assignment Operators:** `=`, `+=`, `-=`, `*=`, `/=`, etc.

### Code Example
```python
x = 10
y = 3

# Arithmetic
sum_result = x + y  # 13
remainder = x % y   # 1

# Comparison
is_greater = x > y  # True

# Logical
is_valid = (x > 5) and (y < 10) # True

# Assignment
x += 5 # x becomes 15

print(f"Sum: {sum_result}, Remainder: {remainder}")
print(f"Is greater: {is_greater}, Is valid: {is_valid}")
print(f"New x: {x}")
```

### Quick Checklist/Exercise
1.  Calculate `(15 * 2) - (8 / 4)` and store the result in a variable.
2.  Write a comparison to check if `7` is not equal to `7.0`. What's the result?
3.  Use a logical operator (`and` or `or`) to combine two conditions: `temperature > 25` and `humidity < 60`.

## 4. Conditional Statements (if/else/elif)

### Explanation
Conditional statements allow your program to make decisions and execute different blocks of code based on whether a specified condition is true or false.
*   `if`: Executes a block of code if the condition is true.
*   `elif`: (else if) Checks another condition if the previous `if` or `elif` conditions were false.
*   `else`: Executes a block of code if all preceding `if` and `elif` conditions were false.

### Code Example
```python
score = 85

if score >= 90:
    print("Grade: A")
elif score >= 80:
    print("Grade: B")
elif score >= 70:
    print("Grade: C")
else:
    print("Grade: F")
```

### Quick Checklist/Exercise
1.  Write an `if-else` statement to check if a number `num` is even or odd.
2.  Create a program that checks a user's `age`: if `age < 13`, print "Child"; if `age < 18`, print "Teenager"; otherwise, print "Adult".
3.  What happens if you have multiple `elif` conditions and the first one is true?

## 5. Loops (for/while)

### Explanation
Loops are used to execute a block of code repeatedly.
*   **`for` loop:** Iterates over a sequence (like a list, tuple, string, or range) or other iterable objects.
*   **`while` loop:** Repeats a block of code as long as a specified condition is true. It's crucial to ensure the condition eventually becomes false to avoid infinite loops.

### Code Example
```python
# For loop iterating through a list
fruits = ["apple", "banana", "cherry"]
for fruit in fruits:
    print(fruit)

# While loop with a counter
count = 0
while count < 3:
    print(f"Count: {count}")
    count += 1 # Increment count to eventually stop the loop
```

### Quick Checklist/Exercise
1.  Use a `for` loop to print numbers from 1 to 5 (inclusive).
2.  Write a `while` loop that prints "Hello" five times.
3.  Explain the main difference between when you would choose a `for` loop versus a `while` loop.

## 6. Functions

### Explanation
Functions are blocks of organized, reusable code that perform a specific task. They help break down complex problems into smaller, manageable pieces, making your code more modular, readable, and easier to debug.
*   Defined using the `def` keyword.
*   Can accept input parameters (arguments).
*   Can return values using the `return` statement.

### Code Example
```python
# Function without parameters that prints a greeting
def say_hello():
    print("Hello there!")

# Function with a parameter and a return value
def add_numbers(a, b):
    sum_result = a + b
    return sum_result

say_hello() # Calling the first function
result = add_numbers(5, 7) # Calling the second function and storing its return
print(f"Sum of 5 and 7: {result}")
```

### Quick Checklist/Exercise
1.  Define a function called `multiply(x, y)` that takes two numbers and returns their product.
2.  Call your `multiply` function with `4` and `6` and print the result.
3.  What is the benefit of using functions in programming?

## 7. Modules

### Explanation
Modules are Python files containing Python definitions and statements. They allow you to logically organize your Python code. By importing modules, you can reuse functions, classes, and variables defined in other files, promoting code reusability and maintainability.

### Code Example
```python
# Example of importing the 'math' module
import math

# Using a function from the math module
square_root = math.sqrt(25)
print(f"Square root of 25: {square_root}")

# Example of importing a specific item from a module
from datetime import datetime

# Using the datetime object directly
current_time = datetime.now()
print(f"Current date and time: {current_time}")
```

### Quick Checklist/Exercise
1.  Import the `random` module.
2.  Use `random.randint(1, 10)` to generate a random integer between 1 and 10 and print it.
3.  Briefly explain why modules are important for larger projects.

## 8. Error Handling (try/except)

### Explanation
Error handling is the process of anticipating, detecting, and resolving application errors. Python uses `try` and `except` blocks to handle exceptions (runtime errors) gracefully, preventing your program from crashing.
*   **`try` block:** Contains the code that might raise an exception.
*   **`except` block:** Contains the code that gets executed if an exception occurs in the `try` block. You can specify different `except` blocks for different types of errors.

### Code Example
```python
try:
    # This code might raise a ZeroDivisionError
    result = 10 / 0
    print(result)
except ZeroDivisionError:
    print("Error: Cannot divide by zero!")
except TypeError:
    print("Error: Type mismatch!")
except Exception as e: # Catch any other unexpected errors
    print(f"An unexpected error occurred: {e}")

print("Program continues after error handling.")
```

### Quick Checklist/Exercise
1.  Write a `try-except` block to handle a `ValueError` that might occur when converting a non-numeric string to an integer (e.g., `int("abc")`).
2.  What happens if an error occurs in the `try` block and there is no matching `except` block?
3.  Why is error handling crucial for robust applications?

## 9. Debugging Techniques

### Explanation
Debugging is the process of identifying, analyzing, and removing errors (bugs) from a computer program. Effective debugging is a crucial skill for any programmer.
*   **`print()` statements:** The simplest technique, used to display variable values and trace program flow at different points.
*   **IDE Debuggers:** Integrated Development Environments (IDEs) like VS Code, PyCharm, offer powerful debugging tools (breakpoints, step-by-step execution, variable inspection).
*   **Error Messages:** Learning to read and understand traceback messages is vital for pinpointing where an error occurred and what type it is.

### Code Example
```python
def calculate_average(numbers):
    total = 0
    # print(f"Initial total: {total}") # Debugging print
    for number in numbers:
        total += number
        # print(f"Adding {number}, Current total: {total}") # Debugging print
    
    # Bug: if numbers list is empty, this will cause ZeroDivisionError
    # Fix: Add a check for an empty list
    if not numbers:
        return 0 # Or raise an error as appropriate
    
    average = total / len(numbers)
    return average

my_scores = [80, 90, 75]
avg = calculate_average(my_scores)
print(f"Average score: {avg}")

empty_scores = []
avg_empty = calculate_average(empty_scores) # This would crash without the fix
print(f"Average of empty scores: {avg_empty}")
```

### Quick Checklist/Exercise
1.  If your program gives a `SyntaxError`, what kind of mistake have you likely made?
2.  Describe how you would use `print()` statements to find out why a variable isn't holding the value you expect.
3.  What is a "breakpoint" in the context of an IDE debugger?
