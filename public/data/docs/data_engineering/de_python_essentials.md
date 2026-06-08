# Python Programming Essentials: Study Guide

This guide covers the fundamental concepts of Python programming essential for data engineers. Mastering these will provide a solid foundation for more advanced data manipulation, scripting, and system integration tasks.

## 1. Python Fundamentals

Python is a high-level, interpreted programming language known for its readability and versatility.

### Core Concepts:

*   **Variables and Data Types:** Python is dynamically typed. Common types include integers (`int`), floating-point numbers (`float`), strings (`str`), booleans (`bool`), and `NoneType`.
    ```python
    # Example
    age = 30          # int
    salary = 50000.50 # float
    name = "Alice"    # str
    is_active = True  # bool
    data = None       # NoneType
    ```
*   **Operators:**
    *   Arithmetic (`+`, `-`, `*`, `/`, `%`, `**`, `//`)
    *   Comparison (`==`, `!=`, `<`, `>`, `<=`, `>=`)
    *   Logical (`and`, `or`, `not`)
    *   Assignment (`=`, `+=`, `-=`, etc.)
*   **Control Flow:**
    *   **Conditional Statements (`if`/`elif`/`else`):** Execute code blocks based on conditions.
        ```python
        score = 85
        if score >= 90:
            print("Grade A")
        elif score >= 80:
            print("Grade B")
        else:
            print("Grade C")
        ```
    *   **Loops (`for`, `while`):** Iterate over sequences or repeat actions.
        ```python
        # For loop
        fruits = ["apple", "banana", "cherry"]
        for fruit in fruits:
            print(fruit)

        # While loop
        count = 0
        while count < 3:
            print(f"Count: {count}")
            count += 1
        ```

## 2. Python Data Structures

Python offers powerful built-in data structures to organize and store data efficiently.

*   **Lists:** Ordered, mutable collections. Defined with square brackets `[]`.
    ```python
    my_list = [1, "hello", 3.14, True]
    my_list.append(4) # Add element
    print(my_list[0]) # Access element
    ```
*   **Tuples:** Ordered, immutable collections. Defined with parentheses `()`. Useful for fixed collections of items.
    ```python
    my_tuple = (1, "hello", 3.14)
    # my_tuple[0] = 2 # This would cause an error (immutable)
    print(my_tuple[1])
    ```
*   **Dictionaries:** Unordered, mutable collections of key-value pairs. Defined with curly braces `{}`. Keys must be unique and immutable.
    ```python
    my_dict = {"name": "Alice", "age": 30, "city": "New York"}
    print(my_dict["name"])
    my_dict["age"] = 31 # Update value
    my_dict["email"] = "alice@example.com" # Add new key-value
    ```
*   **Sets:** Unordered, mutable collections of unique elements. Defined with curly braces `{}` or `set()`. Useful for membership testing and removing duplicates.
    ```python
    my_set = {1, 2, 3, 2, 4} # {1, 2, 3, 4} - duplicates removed
    my_set.add(5)
    print(3 in my_set) # True
    ```

## 3. Basic Algorithms

Understanding basic algorithmic thinking is crucial for efficient problem-solving.

*   **Searching:**
    *   **Linear Search:** Checks each element in a sequence until a match is found. Simple but inefficient for large datasets.
    *   **Binary Search:** Requires a sorted sequence. Repeatedly divides the search interval in half. Much faster than linear search for large datasets.
*   **Sorting:**
    *   **Bubble Sort:** Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order. Simple but inefficient.
    *   **Selection Sort:** Divides the list into a sorted and an unsorted region. Repeatedly finds the minimum element from the unsorted region and puts it at the end of the sorted region.

## 4. Functional Programming Basics

Python supports functional programming paradigms, emphasizing functions as first-class citizens.

*   **Functions (`def`, `lambda`):** Reusable blocks of code.
    ```python
    def greet(name):
        return f"Hello, {name}!"

    print(greet("Bob"))

    # Lambda function (anonymous function)
    add = lambda x, y: x + y
    print(add(5, 3)) # 8
    ```
*   **Higher-Order Functions (`map`, `filter`, `reduce`):** Functions that take other functions as arguments or return them.
    *   `map()`: Applies a function to all items in an input list.
    *   `filter()`: Constructs an iterator from elements of an iterable for which a function returns true.
    *   `reduce()` (from `functools`): Applies a function of two arguments cumulatively to the items of an iterable, from left to right, so as to reduce the iterable to a single value.

## 5. Object-Oriented Programming (OOP) Basics

OOP is a programming paradigm based on the concept of "objects," which can contain data and code.

*   **Classes and Objects:**
    *   **Class:** A blueprint for creating objects (a "car factory").
    *   **Object:** An instance of a class (an actual "car").
    ```python
    class Dog:
        def __init__(self, name, breed):
            self.name = name
            self.breed = breed

        def bark(self):
            return f"{self.name} says Woof!"

    my_dog = Dog("Buddy", "Golden Retriever") # Create an object
    print(my_dog.bark())
    ```
*   **Attributes:** Variables associated with a class or object (e.g., `name`, `breed`).
*   **Methods:** Functions associated with a class or object (e.g., `bark()`).
*   **Inheritance:** Allows a class (child) to inherit properties and methods from another class (parent).

## 6. Error Handling

Gracefully handling errors is crucial for robust applications.

*   **`try` / `except` / `finally`:**
    *   `try`: Code that might raise an exception.
    *   `except`: Code to execute if a specific exception occurs.
    *   `finally`: Code that always runs, regardless of whether an exception occurred.
    ```python
    try:
        result = 10 / 0
    except ZeroDivisionError:
        print("Error: Cannot divide by zero!")
    finally:
        print("Execution complete.")
    ```

## 7. Writing Clean and Modular Code

Good code is readable, maintainable, and reusable.

*   **Functions:** Break down large tasks into smaller, manageable units.
*   **Modules and Packages:**
    *   **Module:** A `.py` file containing Python code (functions, classes, variables).
    *   **Package:** A collection of modules in directories, often with an `__init__.py` file.
    *   Use `import` to bring modules/packages into your code.
*   **Docstrings and Comments:** Explain what your code does.
*   **PEP 8:** Python's style guide for maximum readability. Follow conventions for naming, indentation, etc.

## 8. Essential Libraries for Data Engineering

These libraries are indispensable for data manipulation and interaction.

*   **NumPy (Numerical Python):** The fundamental package for numerical computation in Python. Provides powerful N-dimensional array objects.
    ```python
    import numpy as np

    # Create a NumPy array
    arr = np.array([1, 2, 3, 4, 5])
    print(arr * 2) # Element-wise multiplication
    ```
*   **Pandas:** Built on NumPy, provides high-performance, easy-to-use data structures and data analysis tools, primarily `DataFrame` and `Series`.
    ```python
    import pandas as pd

    # Create a DataFrame
    data = {'Name': ['Alice', 'Bob'], 'Age': [30, 24]}
    df = pd.DataFrame(data)
    print(df)
    print(df['Age'].mean()) # Calculate average age
    ```
*   **Requests:** An elegant and simple HTTP library for making web requests. Essential for interacting with APIs.
    ```python
    import requests

    try:
        response = requests.get("https://jsonplaceholder.typicode.com/posts/1")
        response.raise_for_status() # Raise an HTTPError for bad responses (4xx or 5xx)
        print(response.json())
    except requests.exceptions.RequestException as e:
        print(f"Error fetching data: {e}")
    ```

---

### **Quick Checklist/Exercise:**

1.  Write a Python function that takes a list of numbers, filters out even numbers, and returns a new list containing only the odd numbers.
2.  Create a Python class `Product` with attributes `name` and `price`. Add a method `display_info` that prints the product's name and price. Instantiate two `Product` objects and call their `display_info` method.
3.  Using Pandas, create a DataFrame from a dictionary with at least two columns and three rows. Then, select one column and print its values.
