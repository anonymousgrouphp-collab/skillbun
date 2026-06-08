# Debugging & Memory Error Detection for C/C++ Systems Developers

Developing robust and reliable C/C++ applications requires not only strong coding skills but also proficiency in identifying and resolving issues. This guide will equip you with the essential tools and techniques for debugging program execution and detecting common memory errors.

## 1. Introduction to Debugging

Debugging is the process of finding and fixing errors or bugs in computer programs. For C/C++ systems development, understanding program execution flow, inspecting variables, and analyzing call stacks are crucial. The primary tools for this are command-line debuggers like GDB (GNU Debugger) and LLDB (LLVM Debugger).

## 2. GDB/LLDB: The C/C++ Debuggers

GDB and LLDB allow you to control program execution, inspect program state, and analyze issues at runtime. While commands differ slightly, their core functionality is similar.

### 2.1 Basic Debugging Flow

1.  **Compile with debugging symbols**: Use the `-g` flag with your compiler (e.g., `gcc -g myprogram.c -o myprogram`). This embeds debug information, allowing the debugger to map machine code back to source code lines and variable names.
2.  **Start the debugger**: `gdb ./myprogram` or `lldb ./myprogram`.
3.  **Set breakpoints**: Pause execution at specific lines or functions.
4.  **Run the program**: Execute the program until a breakpoint or crash.
5.  **Inspect state**: Examine variable values, memory contents, and the call stack.
6.  **Step through code**: Execute one line or instruction at a time.
7.  **Continue/Finish**: Resume execution or execute until the current function returns.

### 2.2 Key GDB/LLDB Commands

| GDB Command       | LLDB Command      | Description                                          |
| :---------------- | :---------------- | :--------------------------------------------------- |
| `run` (or `r`)    | `run` (or `r`)    | Start/continue program execution                     |
| `break <line/func>` | `b <line/func>`   | Set a breakpoint at a line number or function name   |
| `next` (or `n`)   | `next` (or `n`)   | Step over the current line (don't enter functions)   |
| `step` (or `s`)   | `step` (or `s`)   | Step into the current line (enters functions)        |
| `print <var>`     | `p <var>`         | Print the value of a variable                        |
| `backtrace` (or `bt`) | `bt`              | Display the call stack (sequence of function calls)  |
| `info locals`     | `frame var`       | Show local variables in the current scope            |
| `continue` (or `c`)| `c`               | Continue execution until the next breakpoint or end  |
| `quit` (or `q`)   | `q`               | Exit the debugger                                    |

### 2.3 Working with Core Dumps

A core dump is a file containing the memory image of a process at the time of its termination, usually due to a crash (e.g., segmentation fault). Analyzing core dumps allows you to debug post-mortem.

To enable core dumps (Linux): `ulimit -c unlimited` (sets core file size limit to unlimited).

To debug a core dump:
`gdb ./myprogram core`
or
`lldb ./myprogram -c core`

Once loaded, you can use `bt` to see the crash location and `frame` to navigate stack frames and inspect variables, just like live debugging.

### 2.4 Example: Debugging a Simple Segfault with GDB

Consider this buggy C code (`segfault.c`):

```c
#include <stdio.h>
#include <stdlib.h>

void crash_me() {
    int *ptr = NULL;
    *ptr = 10; // Dereferencing NULL pointer - segfault here
}

int main() {
    printf("Starting program.\n");
    crash_me();
    printf("Program finished.\n"); // This line will not be reached
    return 0;
}
```

1.  **Compile with debug symbols**:
    ```bash
    gcc -g segfault.c -o segfault
    ```
2.  **Run with GDB**:
    ```bash
    gdb ./segfault
    (gdb) run
    ```
    You'll see output indicating a segmentation fault. GDB will stop at the crash point.
3.  **Inspect the stack trace and variables**:
    ```bash
    (gdb) bt
    #0  crash_me () at segfault.c:7
    #1  0x000055555555470d in main () at segfault.c:13
    (gdb) frame 0
    #0  crash_me () at segfault.c:7
    7	    *ptr = 10;
    (gdb) p ptr
    $1 = (int *) 0x0
    ```
    This clearly shows `ptr` is `NULL` at the line where the crash occurred.

## 3. Memory Error Detection Tools

Memory errors (leaks, corruption, out-of-bounds access) are common in C/C++ and can lead to subtle bugs or security vulnerabilities. Tools like Valgrind and compiler sanitizers are indispensable for detecting them.

### 3.1 Valgrind: Dynamic Analysis

Valgrind is an instrumentation framework for building dynamic analysis tools. Its most famous tool, Memcheck, detects memory management errors and threading bugs. It works by running your program on a synthetic CPU, allowing it to intercept memory access and system calls.

**Common Valgrind Tools:**
*   **Memcheck**: Detects memory errors like invalid reads/writes, use-after-free, double-free, uninitialized reads, and memory leaks.
*   **Helgrind/DRD**: Detects data races in multi-threaded programs.
*   **Cachegrind**: Profile cache usage.

To use Valgrind, compile your program with debug symbols (`-g`):
`valgrind --leak-check=full --show-leak-kinds=all --track-origins=yes ./myprogram [args]`

*   `--leak-check=full`: Reports all memory leaks, even small ones.
*   `--show-leak-kinds=all`: Shows all types of leaks (definite, indirect, possibly, still reachable).
*   `--track-origins=yes`: Shows where uninitialized values originated.

### 3.1.2 Example: Detecting a Memory Leak with Valgrind

Consider this C code (`leak.c`):

```c
#include <stdlib.h>

void create_leak() {
    int *data = (int *) malloc(10 * sizeof(int));
    // Forgot to free 'data'
}

int main() {
    create_leak();
    return 0;
}
```

1.  **Compile with debug symbols**:
    ```bash
    gcc -g leak.c -o leak
    ```
2.  **Run with Valgrind**:
    ```bash
    valgrind --leak-check=full --show-leak-kinds=all ./leak
    ```
    Valgrind will report a `definitely lost` block of 40 bytes (10 * `sizeof(int)`), originating from `malloc` in `create_leak()` at `leak.c:5`.

### 3.2 Compiler Sanitizers: Static/Dynamic Analysis

Compiler sanitizers (part of Clang/GCC) are dynamic analysis tools that inject instrumentation code during compilation. They detect errors at runtime with much less overhead than Valgrind, making them suitable for continuous integration and even production environments.

To enable a sanitizer, compile your code with the `-fsanitize=<sanitizer_name>` flag.

#### 3.2.1 AddressSanitizer (ASan)

Detects memory errors like:
*   Use-after-free
*   Use-after-return
*   Use-after-scope
*   Double-free
*   Invalid frees
*   Heap, stack, and global buffer overflows/underflows
*   Use of uninitialized memory in some cases

**Usage**: `gcc -fsanitize=address -g myprogram.c -o myprogram`

#### 3.2.2 UndefinedBehaviorSanitizer (UBSan)

Detects various types of undefined behavior, including:
*   Integer overflow/underflow
*   Division by zero
*   Invalid shifts
*   Dereferencing misaligned or null pointers
*   Signed integer overflow
*   Invalid enum values

**Usage**: `gcc -fsanitize=undefined -g myprogram.c -o myprogram`
(Often combined with ASan: `gcc -fsanitize=address,undefined -g ...`)

#### 3.2.3 ThreadSanitizer (TSan)

Detects data races and other threading issues in multi-threaded applications. A data race occurs when two or more threads access the same memory location concurrently, and at least one of the accesses is a write, without proper synchronization.

**Usage**: `gcc -fsanitize=thread -g myprogram.c -o myprogram`

### 3.2.4 Example: Using ASan

Consider this C++ code (`asan_bug.cpp`):

```cpp
#include <iostream>
#include <vector>

int main() {
    std::vector<int> v(5);
    v[5] = 10; // Out-of-bounds access
    std::cout << "Value: " << v[5] << std::endl;
    return 0;
}
```

1.  **Compile with ASan**:
    ```bash
    g++ -fsanitize=address -g asan_bug.cpp -o asan_bug
    ```
2.  **Run the program**:
    ```bash
    ./asan_bug
    ```
    ASan will immediately detect the heap-buffer-overflow (or stack-buffer-overflow if `v` were a plain array) at `v[5] = 10;` and print a detailed report, including a stack trace pointing to the exact line of the error.

## 4. Checklist/Exercises

1.  Write a C program that intentionally accesses an array out-of-bounds. Compile it with debugging symbols and use GDB/LLDB to find the exact line of the error and the incorrect index used. Can you use `print` to see the array's size?
2.  Modify the previous program to dynamically allocate memory using `malloc` but forget to `free` it. Compile with debugging symbols and use Valgrind's `memcheck` tool to detect the memory leak. Analyze Valgrind's output to locate the leak.
3.  Take the program from exercise 1 again (the out-of-bounds access). Compile and run it with `AddressSanitizer` (`-fsanitize=address`). Compare the error report from ASan with the output you got from GDB/LLDB. Which provides a clearer initial diagnosis for this specific error?
