# Foundations of C/C++ & Systems Context

This guide will establish a strong understanding of the core C and C++ language features, effective memory management techniques, and fundamental operating system concepts essential for robust systems development. Mastery of these foundations is crucial for anyone aiming to build high-performance, reliable systems applications.

## 1. Core C/C++ Language Features

C and C++ are powerful, low-level languages extensively used in systems programming due to their performance and direct memory access capabilities.

### 1.1 C Fundamentals

*   **Data Types:** `int`, `char`, `float`, `double`, `void`. Understanding their sizes and ranges is critical.
*   **Variables:** Declaration, initialization, and understanding variable scope (local, global).
*   **Operators:** Arithmetic, relational, logical, bitwise, assignment, and increment/decrement operators.
*   **Control Flow:** `if-else`, `switch`, `for`, `while`, `do-while` loops for conditional execution and iteration.
*   **Functions:** Definition, declaration, parameters (pass by value, pass by reference via pointers), and return types.
*   **Arrays:** Contiguous memory blocks for storing elements of the same type. Indexing and multi-dimensional arrays.
*   **Pointers:** Variables that store memory addresses. Fundamental for direct memory manipulation, dynamic memory, and efficient data structures.
*   **Structures and Unions:** User-defined data types to group related variables of different types. Unions save memory by sharing the same memory location for different members.

### 1.2 C++ Enhancements

C++ builds upon C, introducing object-oriented programming (OOP) paradigms and other powerful features.

*   **Classes and Objects:** Blueprints for creating objects, encapsulating data (members) and methods (functions) that operate on that data.
*   **Constructors and Destructors:** Special methods for object initialization and cleanup, respectively. Essential for resource management.
*   **Inheritance and Polymorphism:** Core OOP principles for code reusability (inheritance) and flexible object interaction (polymorphism via virtual functions).
*   **Namespaces:** Organize code into logical groups to prevent naming conflicts, especially in large projects (`std::`).
*   **References:** An alias for an existing variable, providing another name for the same memory location. Often used in function parameters to avoid copying large objects.
*   **Templates:** Write generic code that works with different data types without rewriting the code for each type (e.g., `std::vector`, `std::map`).
*   **Exception Handling:** A structured way to deal with runtime errors using `try`, `catch`, and `throw` blocks.

## 2. Effective Memory Management

Understanding how memory works is paramount in C/C++ to prevent common pitfalls like memory leaks, crashes, and security vulnerabilities.

### 2.1 Memory Regions

*   **Stack:** Used for local variables, function parameters, and return addresses. Managed automatically by the CPU, following a Last-In, First-Out (LIFO) principle. Fast allocation/deallocation.
*   **Heap (Free Store):** Used for dynamic memory allocation. Programmers explicitly request memory (e.g., `malloc`/`new`) and must explicitly deallocate it (`free`/`delete`). Slower than stack allocation but provides flexible memory lifetime.
*   **Static/Global:** Stores global variables and static variables. These variables are allocated when the program starts and deallocated when it terminates. Their lifetime is the entire program duration.
*   **Code (Text):** Stores the executable instructions of the program.

### 2.2 Dynamic Memory Allocation

*   **C-style Allocation:**
    *   `malloc(size_t size)`: Allocates `size` bytes on the heap. Returns a `void*` pointer.
    *   `calloc(size_t num, size_t size)`: Allocates `num * size` bytes and initializes all bits to zero.
    *   `realloc(void* ptr, size_t new_size)`: Resizes a previously allocated block of memory. Can move the block to a new location.
    *   `free(void* ptr)`: Deallocates memory pointed to by `ptr`. Crucial to prevent memory leaks.
*   **C++-style Allocation:**
    *   `new`: Allocates memory for an object (or array) on the heap and calls its constructor. Returns a typed pointer.
    *   `delete`: Deallocates memory for an object (or array) and calls its destructor.

*   **Common Memory Errors:**
    *   **Memory Leaks:** Failing to `free` or `delete` dynamically allocated memory, leading to gradual consumption of available RAM.
    *   **Dangling Pointers:** Pointers that point to memory that has been deallocated, leading to unpredictable behavior if accessed.
    *   **Double Free:** Attempting to `free` or `delete` the same memory block twice, often leading to program crashes or corruption.
    *   **Buffer Overflows/Underflows:** Writing beyond the allocated bounds of an array or buffer, which can corrupt adjacent memory or lead to security vulnerabilities.

### 2.3 Smart Pointers (C++ Modern Approach)

Introduced in C++11, smart pointers automate memory management, significantly reducing the likelihood of memory leaks and dangling pointers by implementing RAII (Resource Acquisition Is Initialization).

*   `std::unique_ptr`: Provides exclusive ownership of a dynamically allocated object. The object is automatically deallocated when the `unique_ptr` goes out of scope. Cannot be copied, only moved.
*   `std::shared_ptr`: Provides shared ownership. The memory is deallocated when the last `shared_ptr` referring to it is destroyed. Uses a reference count.
*   `std::weak_ptr`: A non-owning, 