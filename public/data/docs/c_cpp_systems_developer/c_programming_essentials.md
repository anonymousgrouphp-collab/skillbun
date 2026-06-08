# Study Guide: Core C Programming & Memory Model

This study guide covers the fundamental and advanced concepts of C programming, along with an in-depth exploration of the C memory model.

## 1. Fundamentals of C Programming

### 1.1 Basic Syntax & Structure
C programs are organized into functions, with `main()` being the entry point. Key elements include:
*   **Headers**: `#include` directives to import libraries (e.g., `<stdio.h>` for standard I/O).
*   **`main` Function**: `int main() { ... return 0; }` where execution begins.
*   **Comments**: Single-line (`//`) and multi-line (`/* ... */`).
*   **Basic I/O**: `printf()` for output, `scanf()` for input.

### 1.2 Data Types
C offers various data types to store different kinds of values:
*   **Primitive Types**: `int` (integers), `char` (characters), `float` (single-precision floating-point), `double` (double-precision floating-point), `void` (absence of type).
*   **Qualifiers**: `short`, `long` (for `int`), `signed`, `unsigned` (for `int`, `char`).
*   **Size**: Sizes are system-dependent but typically `char` is 1 byte, `int` is 2 or 4 bytes, `float` 4 bytes, `double` 8 bytes.

### 1.3 Control Structures
These allow for conditional execution and looping:
*   **Conditional Statements**: `if`, `else if`, `else` for branching logic. `switch` for multi-way branching based on an integer expression.
*   **Looping Constructs**: `for` (fixed iterations), `while` (condition-controlled loop), `do-while` (executes at least once).
*   **Jump Statements**: `break` (exit loop/switch), `continue` (skip current iteration), `goto` (unconditional jump - generally discouraged).

### 1.4 Operators
C provides a rich set of operators:
*   **Arithmetic**: `+`, `-`, `*`, `/`, `%`
*   **Relational**: `==`, `!=`, `<`, `>`, `<=`, `>=`
*   **Logical**: `&&`, `||`, `!`
*   **Bitwise**: `&`, `|`, `^`, `~`, `<<`, `>>`
*   **Assignment**: `=`, `+=`, `-=`, etc.
*   **Ternary**: `? :` (conditional expression)
*   **`sizeof`**: Returns the size of a type or variable in bytes.

## 2. Advanced C Constructs

### 2.1 Preprocessor Directives
Processed before compilation, they modify the source code:
*   **`#include`**: Inserts content of another file.
*   **`#define`**: Creates macros (text substitution).
*   **Conditional Compilation**: `#ifdef`, `#ifndef`, `#if`, `#else`, `#elif`, `#endif` to include/exclude code blocks based on conditions.

### 2.2 `typedef`
`typedef` creates an alias (new name) for an existing data type, improving readability and portability.
```c
typedef unsigned long ULONG;
ULONG id = 123456789UL;
```

### 2.3 `struct` and `union`
*   **`struct` (Structures)**: User-defined data types that group related variables of different data types under a single name. Members are stored in contiguous memory locations.
    ```c
    struct Person {
        char name[50];
        int age;
        float height;
    };
    struct Person p1 = {"Alice", 30, 1.65};
    ```
*   **`union` (Unions)**: Similar to `struct` but all members share the same memory location. Only one member can hold a value at any given time, saving memory.
    ```c
    union Data {
        int i;
        float f;
        char str[20];
    };
    union Data data;
    data.i = 10; // 'i' is active
    // printf("%f", data.f); // Accessing 'f' now might give garbage
    ```

### 2.4 Function Pointers
Pointers that point to the memory address of a function. They can be used to call functions dynamically or implement callback mechanisms.
```c
int add(int a, int b) { return a + b; }
int subtract(int a, int b) { return a - b; }

int (*op_ptr)(int, int); // Declares a function pointer

op_ptr = &add; // Assigns the address of 'add' function
int result = op_ptr(5, 3); // Calls 'add' via pointer (result = 8)
```

### 2.5 File I/O
C provides functions to interact with files:
*   `fopen()`: Opens a file (`"r"` read, `"w"` write, `"a"` append, `"rb"` binary read, etc.). Returns `FILE*`.
*   `fclose()`: Closes an open file.
*   **Character I/O**: `fgetc()`, `fputc()`.
*   **String I/O**: `fgets()`, `fputs()`.
*   **Formatted I/O**: `fprintf()`, `fscanf()`.
*   **Binary I/O**: `fread()`, `fwrite()` for blocks of data.

### 2.6 Storage Classes
Determine the scope, lifetime, and linkage of variables:
*   **`auto`**: Default for local variables. Stored on the stack, lifetime within function, no linkage.
*   **`register`**: Suggests compiler store variable in a CPU register for faster access (compiler might ignore). Lifetime within function, no linkage.
*   **`static`**: Local static variables retain their value between function calls. Global static variables have internal linkage (visible only in current file). Lifetime for program duration.
*   **`extern`**: Declares a variable defined elsewhere, usually in another file (external linkage).

### 2.7 Bit Manipulation
Using bitwise operators to directly manipulate individual bits within integers, common in low-level programming and embedded systems.
*   **Setting a bit**: `num | (1 << n)`
*   **Clearing a bit**: `num & ~(1 << n)`
*   **Toggling a bit**: `num ^ (1 << n)`
*   **Checking a bit**: `(num >> n) & 1`

## 3. The C Memory Model
Understanding how memory is organized is crucial for efficient and safe C programming.

### 3.1 Memory Layout of a C Program
When a C program executes, its memory is typically divided into several segments:
*   **Text Segment**: Contains the executable instructions (machine code) of the program. Read-only.
*   **Data Segment**: Stores global and static variables. Divided into:
    *   **Initialized Data Segment**: Global and static variables explicitly initialized by the programmer (e.g., `int global_var = 10;`).
    *   **BSS (Block Started by Symbol) Segment**: Uninitialized global and static variables (e.g., `static int uninit_var;`). Initialized to zero by the system.
*   **Heap**: Used for dynamic memory allocation. Memory is allocated and deallocated at runtime by the programmer using functions like `malloc()`, `calloc()`, `realloc()`, `free()`.
*   **Stack**: Used for local variables, function parameters, and return addresses. Memory is automatically allocated and deallocated as functions are called and return (LIFO principle).

### 3.2 Pointers and Arrays
*   **Pointers**: Variables that store memory addresses. Essential for direct memory access, dynamic memory management, and efficient data structures. Declaration: `type *ptr_name;`. Dereferencing: `*ptr_name` to access the value at the address.
*   **Arrays**: Contiguous blocks of memory to store multiple values of the same type. Array names often decay to a pointer to their first element. `arr[i]` is equivalent to `*(arr + i)`.
*   **Pointer Arithmetic**: Operations like `ptr + n`, `ptr - n`, `ptr++`, `ptr--` move the pointer by `n` times the size of the pointed-to type.

### 3.3 Dynamic Memory Allocation
Functions from `<stdlib.h>` allow runtime memory management on the heap:
*   **`malloc(size_t size)`**: Allocates `size` bytes of uninitialized memory. Returns `void*`.
*   **`calloc(size_t num, size_t size)`**: Allocates memory for `num` elements, each of `size` bytes, and initializes all bytes to zero.
*   **`realloc(void *ptr, size_t new_size)`**: Changes the size of the memory block pointed to by `ptr` to `new_size` bytes.
*   **`free(void *ptr)`**: Deallocates the memory block pointed to by `ptr`, returning it to the system. Failure to `free` leads to **memory leaks**.

### 3.4 `volatile` Keyword
Indicates that a variable's value can be changed by external factors (e.g., hardware, other threads) outside the normal flow of the program. This keyword prevents the compiler from performing optimizations that might cache the variable's value in a register, ensuring that the program always reads the most up-to-date value from memory.
```c
volatile int sensor_status_register; // Compiler won't optimize reads
```

### 3.5 `restrict` Keyword
A C99 keyword used with pointers. It's a hint to the compiler that the pointer is the *sole initial means* of accessing the memory block it points to for the lifetime of that pointer. This allows the compiler to make more aggressive optimizations by assuming that the memory accessed through a `restrict` pointer will not be accessed via any other pointer.
```c
void copy_array(int *restrict dest, const int *restrict src, int n) {
    for (int i = 0; i < n; i++) {
        dest[i] = src[i];
    }
} // Compiler knows dest and src don't overlap
```

## Code Example: Pointers, Dynamic Memory, and Structs

```c
#include <stdio.h>
#include <stdlib.h> // For malloc, free
#include <string.h> // For strncpy

// Define a structure
typedef struct {
    char name[50];
    int age;
    float gpa;
} Student;

void displayStudent(const Student* s) {
    printf("Name: %s, Age: %d, GPA: %.2f\n", s->name, s->age, s->gpa);
}

int main() {
    // Pointers and Arrays
    int arr[] = {10, 20, 30, 40, 50};
    int *ptr = arr; // ptr points to the first element of arr

    printf("Array elements via pointer:\n");
    for (int i = 0; i < 5; i++) {
        printf("arr[%d] = %d (accessed as *(ptr + %d) = %d)\n", i, arr[i], i, *(ptr + i));
    }

    // Dynamic Memory Allocation for a Student
    Student *newStudent = (Student*) malloc(sizeof(Student));
    if (newStudent == NULL) {
        fprintf(stderr, "Memory allocation failed!\n");
        return 1;
    }

    // Initialize the dynamically allocated student
    strncpy(newStudent->name, "Alice Smith", sizeof(newStudent->name) - 1);
    newStudent->name[sizeof(newStudent->name) - 1] = '\0'; // Ensure null termination
    newStudent->age = 20;
    newStudent->gpa = 3.85;

    printf("\nDynamically allocated student:\n");
    displayStudent(newStudent);

    // Free the allocated memory
    free(newStudent);
    newStudent = NULL; // Prevent dangling pointer

    // Example of volatile (conceptual, needs external interaction to show full effect)
    // volatile int sensor_reading;
    // // Imagine 'sensor_reading' is updated by a hardware interrupt
    // while(1) {
    //   if (sensor_reading > 100) {
    //     printf("Sensor threshold exceeded!\n");
    //     // Process event
    //   }
    //   // If 'volatile' wasn't used, compiler might optimize out repeated reads
    //   // from memory if it assumes 'sensor_reading' isn't changed within loop.
    // }

    return 0;
}
```

## Quick Checklist/Exercise:
1.  **Memory Model**: Briefly explain the primary differences in how variables declared on the `stack` versus the `heap` are managed in C, including their allocation, deallocation, and typical use cases.
2.  **Pointers**: Write a C code snippet that declares an integer array `numbers` with values `[5, 10, 15]`, a pointer `p` to its first element, and then uses pointer arithmetic to print the value `15`.
3.  **Keywords**: Describe a practical scenario (e.g., in embedded systems or multi-threaded programming) where the `volatile` keyword would be essential for correctness, and explain why a compiler optimization could cause issues without it.