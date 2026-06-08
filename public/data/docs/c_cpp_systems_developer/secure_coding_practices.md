# Secure C/C++ Coding Practices Study Guide

## Introduction
C and C++ are powerful languages widely used in system programming, embedded systems, high-performance computing, and game development. Their low-level memory management capabilities offer unparalleled control and efficiency but also introduce significant security risks if not handled with extreme care. This guide outlines common vulnerabilities and essential defensive programming techniques to build robust and secure C/C++ systems.

## 1. Common C/C++ Vulnerabilities
Understanding common attack vectors is the first step towards writing secure code.

### 1.1. Buffer Overflows
A buffer overflow occurs when a program attempts to write data beyond the boundaries of a fixed-size buffer. This can overwrite adjacent memory, leading to data corruption, program crashes, or arbitrary code execution.
*   **Example**: Using `strcpy`, `strcat`, `sprintf`, `gets` without bounds checking.

```cpp
// Vulnerable: classic buffer overflow with strcpy
void vulnerable_copy(const char* input) {
    char buffer[16];
    strcpy(buffer, input); // No bounds check; if input > 15 chars, overflow occurs
    // ... rest of the function
}

// Safer alternative using strncpy (still requires careful handling of null termination)
void safer_copy(const char* input) {
    char buffer[16];
    // Copy up to sizeof(buffer) - 1 bytes to leave space for null terminator
    strncpy(buffer, input, sizeof(buffer) - 1);
    buffer[sizeof(buffer) - 1] = '\0'; // Explicitly null-terminate
    // ... rest of the function
}

// Even safer with C++ std::string and dynamic allocation or checked copy
#include <string>
void secure_copy(const std::string& input) {
    // If a fixed buffer is truly needed:
    char buffer[16];
    if (input.length() < sizeof(buffer)) {
        std::strncpy(buffer, input.c_str(), sizeof(buffer) - 1);
        buffer[sizeof(buffer) - 1] = '\0';
    } else {
        // Handle error: input too large
        throw std::runtime_error("Input too long");
    }
    // Or simply use std::string which handles memory safely:
    // std::string secure_buffer = input.substr(0, 15);
}
```

### 1.2. Integer Overflows and Underflows
Integer overflows occur when an arithmetic operation attempts to create a numeric value that is larger than the maximum (or smaller than the minimum) value that can be represented by the given integer type. This can lead to unexpected behavior, logic errors, or even buffer overflows if the resulting incorrect size is used for memory allocation or array indexing.
*   **Example**: `unsigned int x = UINT_MAX; x++;` results in `x` becoming `0` (wraparound).

### 1.3. Use-After-Free
A use-after-free vulnerability occurs when a program continues to use a pointer to memory that has already been deallocated. This can lead to unpredictable behavior, data corruption, or allow an attacker to inject malicious code if the freed memory is subsequently reallocated for a different purpose.
*   **Example**: `char* ptr = new char[10]; delete[] ptr; *ptr = 'A';`

### 1.4. Format String Bugs
Format string bugs arise when user-supplied input is directly used as the format string argument to functions like `printf`, `sprintf`, `fprintf`, etc. Attackers can manipulate the format string to read or write arbitrary memory locations, leading to information disclosure or arbitrary code execution.
*   **Example**: `printf(user_input_string);` instead of `printf("%s", user_input_string);`

### 1.5. Race Conditions
Race conditions occur in multi-threaded or multi-process environments when the outcome of an operation depends on the unpredictable sequence or timing of other events. If critical sections of code that access shared resources are not properly synchronized, data can become corrupted or logic errors can occur.
*   **Example**: Two threads simultaneously incrementing a shared counter without a mutex, leading to an incorrect final count.

## 2. Defensive Programming Techniques
Implementing proactive measures to prevent vulnerabilities.

### 2.1. Input Validation
Always validate all input (from users, files, network, environment variables) at the earliest possible stage. This includes checking for:
*   **Type**: Is it an integer, string, boolean?
*   **Range**: Is it within expected numerical bounds?
*   **Format**: Does it match a specific pattern (e.g., email address, date)?
*   **Length**: Is it too long or too short?
*   **Content**: Does it contain malicious characters or unexpected values (e.g., path traversal sequences like `../`)?
*   **Techniques**: Whitelisting (allowing only known good inputs) is generally safer than blacklisting (trying to filter out known bad inputs).

### 2.2. Output Encoding
When data from your C/C++ application is used in another context (e.g., rendered in a web page, inserted into a database query), it must be properly encoded for that context. This prevents interpretation of data as code, mitigating injection attacks (XSS, SQL Injection).
*   **Example**: HTML-encoding user-supplied strings before displaying them in a web interface to prevent cross-site scripting (XSS).

### 2.3. Privilege Separation (Principle of Least Privilege)
Run processes, threads, and even individual functions with the minimum set of privileges required to perform their specific task. If a component is compromised, its impact is limited to its restricted privileges.
*   **Implementation**: Drop root privileges as soon as possible (e.g., `setuid`/`setgid`), use Linux capabilities, create separate user accounts for different services.

### 2.4. Secure Error Handling
Errors should be handled gracefully without revealing sensitive information (e.g., file paths, database queries, internal state, version numbers) to potential attackers. Log detailed errors securely to a restricted file, but present generic, user-friendly messages publicly.
*   **Practice**: Avoid `assert()` in production code, as it can reveal internal state or crash the application.

### 2.5. Basic Sandboxing Techniques
Sandboxing involves isolating an application or process from the rest of the system, limiting its access to resources (file system, network, system calls). This containment strategy reduces the potential damage if the application is exploited.
*   **Techniques**: `chroot()` to restrict file system access, `seccomp-bpf` (Linux) to filter system calls, containerization technologies (though less direct for C/C++ app security).

## 3. Code Example: Secure Integer Input and Array Access

This example demonstrates secure input handling for an integer and safe array access, preventing potential integer overflows and out-of-bounds access.

```cpp
#include <iostream>
#include <vector>
#include <limits> // Required for std::numeric_limits

// Function to get a validated integer input
int getValidatedInteger(const std::string& prompt, int min_val, int max_val) {
    int value;
    while (true) {
        std::cout << prompt;
        std::cin >> value;

        if (std::cin.fail()) {
            // Input type mismatch or stream error
            std::cerr << "Invalid input. Please enter a number.\n";
            std::cin.clear(); // Clear error flags
            // Discard remaining invalid input in the buffer up to newline
            std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
        } else if (value < min_val || value > max_val) {
            // Input out of allowed range
            std::cerr << "Value out of range. Please enter a number between " 
                      << min_val << " and " << max_val << ".\n";
            // Discard remaining input in the buffer
            std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
        } else {
            // Valid input
            std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n'); // Clear any trailing chars
            return value;
        }
    }
}

int main() {
    std::vector<int> data(10);

    // Get a validated index for array access
    int index = getValidatedInteger("Enter an index (0-9): ", 0, data.size() - 1);
    
    // Get a validated value to store
    int value = getValidatedInteger("Enter a value (0-100): ", 0, 100);

    // Securely access the vector element
    data.at(index) = value; // .at() performs bounds checking and throws std::out_of_range on error
    // data[index] = value; // operator[] does NOT perform bounds checking

    std::cout << "Data at index " << index << " set to: " << data.at(index) << "\n";

    // Example of potential integer overflow in loop (mitigated by using size_t)
    size_t count = data.size(); // Use size_t for sizes/indices to prevent overflow with large values
    for (size_t i = 0; i < count + 1000000000000000000ULL; ++i) { // Bad example for large number, will likely overflow
        // This loop would wrap around if 'i' was an 'int' and became negative, causing issues.
        // With size_t, it might wrap around to 0 but only after an extremely large value.
        // Always validate loop bounds and arithmetic.
    }

    return 0;
}
```

## 4. Checklist/Exercise

1.  **Vulnerability Identification**: Name at least two specific C/C++ standard library functions (excluding `strcpy`) that are known to be unsafe when handling user-supplied string input without additional checks, and briefly explain why each is unsafe.
2.  **Defensive Implementation**: Write a C++ function `bool isValidUsername(const std::string& username)` that returns `true` if the `username` meets the following criteria: contains only alphanumeric characters (a-z, A-Z, 0-9), and its length is between 3 and 15 characters (inclusive).
3.  **Privilege Consideration**: You are developing a network service in C++ that needs to bind to a privileged port (e.g., port 80 or 443) initially, but then perform all subsequent operations with minimal privileges. Describe the sequence of steps your application would take to adhere to the Principle of Least Privilege in this scenario.
