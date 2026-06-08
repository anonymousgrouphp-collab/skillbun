# C/C++ for Embedded Systems: Study Guide

C/C++ are the backbone of firmware development due to their low-level control, performance, and extensive toolchains. Mastering these languages for embedded systems requires understanding their specific nuances when interacting with hardware.

## 1. Introduction to C/C++ in Embedded Systems

C and C++ are the go-to languages for embedded systems due to their efficiency, direct hardware access, and predictable performance. Unlike general-purpose programming, embedded development focuses on resource constraints (memory, CPU cycles), real-time requirements, and direct interaction with peripherals.

## 2. Memory Models in Embedded Systems

Understanding how memory is organized and utilized is crucial in resource-constrained embedded environments.

*   **Flash/ROM (Program Memory):** This is where your compiled code (instructions) and constant data (e.g., string literals, `const` variables) reside. It's non-volatile, meaning data persists after power-off.
*   **RAM (Data Memory):** Volatile memory used for dynamic data storage.
    *   **Stack:** Used for local variables, function parameters, and return addresses. It operates on a Last-In, First-Out (LIFO) principle and grows downwards. Stack overflow is a common issue.
    *   **Heap:** Used for dynamic memory allocation at runtime using `malloc`/`free` (C) or `new`/`delete` (C++). It allows flexible memory usage but can lead to fragmentation and unpredictability, making it less desirable for strict real-time systems.
    *   **Static/Global:** Global variables and static variables reside here. Initialized global/static variables go into the `.data` segment, while uninitialized ones go into the `.bss` (Block Started by Symbol) segment, which is zero-initialized at startup.
*   **Memory-Mapped Registers:** Special locations in RAM (or a separate memory space) that correspond directly to hardware peripherals (e.g., GPIO, UART, Timers). Accessing these memory addresses directly controls the hardware.

## 3. Pointers: The Embedded Power Tool

Pointers are fundamental for direct memory access, essential for embedded programming.

*   **Basics:** A pointer stores a memory address. `&` (address-of operator) gets the address of a variable, `*` (dereference operator) accesses the value at a pointer's address.
*   **Pointer Arithmetic:** Allows moving through memory locations (e.g., `ptr++` moves by `sizeof(*ptr)` bytes).
*   **Pointers to Functions:** Used for callbacks, interrupt service routines, and event handlers.
*   **Pointers to Hardware Registers:** The primary way to interact with peripherals.
    ```c
    // Example: Accessing a hypothetical GPIO Data Register at address 0x40020C00
    #define GPIOA_DR_ADDR 0x40020C00
    volatile uint32_t * const pGPIOA_DR = (volatile uint32_t *)GPIOA_DR_ADDR;

    // Set bit 5 of the register
    *pGPIOA_DR |= (1 << 5);
    ```

## 4. Bitwise Operations

Directly manipulating individual bits within registers is critical for configuring and controlling hardware.

*   **Operators:** `&` (AND), `|` (OR), `^` (XOR), `~` (NOT), `<<` (Left Shift), `>>` (Right Shift).
*   **Common Use Cases:**
    *   **Setting a bit:** `REG |= (1 << BIT_NUM);`
    *   **Clearing a bit:** `REG &= ~(1 << BIT_NUM);`
    *   **Toggling a bit:** `REG ^= (1 << BIT_NUM);`
    *   **Checking a bit:** `if (REG & (1 << BIT_NUM)) { /* bit is set */ }`
    *   **Masking:** Extracting specific fields from a register.

## 5. Preprocessor Directives

The preprocessor handles directives before compilation, enabling conditional compilation and macro definitions.

*   `#include`: Includes header files, providing declarations and definitions.
*   `#define`: Defines macros for constants or small function-like substitutions. Use with caution for function-like macros due to potential side effects and debugging challenges.
*   **Conditional Compilation:** `#if`, `#ifdef`, `#ifndef`, `#else`, `#elif`, `#endif`.
    ```c
    #define PLATFORM_STM32F4

    #ifdef PLATFORM_STM32F4
    #include 