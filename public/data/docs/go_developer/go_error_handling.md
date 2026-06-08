### Idiomatic Error Handling in Go

**Introduction**
Go's approach to error handling is distinctive, emphasizing explicit checks and clear propagation. Unlike languages that rely on exceptions, Go treats errors as ordinary values, returned by functions, enabling developers to build robust and predictable applications. This study guide covers the core principles and common idioms for effective error management in Go.

**1. Multiple Return Values: The `(result, error)` Pattern**
The foundation of Go error handling is returning an `error` as the last return value alongside a normal result. By convention, `nil` signifies no error.

*   **Principle:** Functions that might fail should return two values: the desired result and an `error`.
*   **Checking Errors:** Always check if the returned error is `nil` immediately after a function call.

```go
package main

import (
	"errors"
	"fmt"
	"strconv"
)

// parseInt converts a string to an integer, returning an error if it fails.
func parseInt(s string) (int, error) {
	i, err := strconv.Atoi(s)
	if err != nil {
		// Return 0 (zero value) and the error
		return 0, fmt.Errorf("failed to parse %q: %w", s, err)
	}
	return i, nil
}

func main() {
	num, err := parseInt("123")
	if err != nil {
		fmt.Println("Error:", err)
		return
	}
	fmt.Println("Parsed number:", num)

	num, err = parseInt("abc")
	if err != nil {
		fmt.Println("Error:", err)
		return
	}
	fmt.Println("Parsed number:", num)
}
```

**2. The `errors` Package: Working with Errors**
Go's built-in `errors` package provides essential functions for creating, comparing, and unwrapping errors.

*   **`errors.New(text string)`:** Creates a simple error with the given message. Often used for generic, non-specific errors.
    ```go
    package main

    import (
    	"errors"
    	"fmt"
    )

    var ErrNotFound = errors.New("item not found")

    func findItem(id string) error {
        if id == "nonexistent" {
            return ErrNotFound
        }
        return nil
    }

    func main() {
        if err := findItem("nonexistent"); err != nil {
            fmt.Println(err)
        }
    }
    ```

*   **`errors.Is(err, target error)`:** Checks if an error (or any error in its chain) matches a specific `target` error. This is crucial for comparing errors, especially sentinel errors. It correctly handles wrapped errors.
    ```go
    package main

    import (
    	"errors"
    	"fmt"
    )

    var ErrNotFound = errors.New("item not found")

    func findItem(id string) error {
        if id == "nonexistent" {
            return ErrNotFound
        }
        return nil
    }

    func main() {
        if err := findItem("nonexistent"); err != nil {
            if errors.Is(err, ErrNotFound) {
                fmt.Println("Specific error: Item was not found.")
            } else {
                fmt.Println("Another error:", err)
            }
        }
    }
    ```

*   **`errors.As(err error, target interface{}) bool`:** Unwraps an error chain and assigns the first error in the chain that matches the type of `target` to `target`. Useful for inspecting custom error types and accessing their specific fields.
    ```go
    package main

    import (
    	"errors"
    	"fmt"
    )

    type MyCustomError struct {
        Code int
        Msg  string
    }

    func (e *MyCustomError) Error() string {
        return fmt.Sprintf("code %d: %s", e.Code, e.Msg)
    }

    func doSomething() error {
        return &MyCustomError{Code: 500, Msg: "internal server error"}
    }

    func main() {
        err := doSomething()
        var customErr *MyCustomError
        if errors.As(err, &customErr) {
            fmt.Printf("Handled custom error: Code=%d, Message=%s\n", customErr.Code, customErr.Msg)
        } else {
            fmt.Println("Unhandled error:", err)
        }
    }
    ```

**3. Custom Error Types**
For more complex error scenarios, you can define custom error types by implementing the `Error() string` method on a `struct`. This allows you to attach additional context or data to an error.

```go
package main

import "fmt"

// ValidationError represents an error with a specific field and message.
type ValidationError struct {
	Field   string
	Message string
}

func (e *ValidationError) Error() string {
	return fmt.Sprintf("validation error on %s: %s", e.Field, e.Message)
}

// validateInput checks if the input is valid.
func validateInput(input string) error {
	if len(input) < 5 {
		return &ValidationError{Field: "input", Message: "must be at least 5 characters long"}
	}
	return nil
}

func main() {
	if err := validateInput("short"); err != nil {
        // Prefer errors.As for custom error types, especially with wrapped errors
        var ve *ValidationError
        if errors.As(err, &ve) {
			fmt.Printf("Validation failed for field '%s': %s\n", ve.Field, ve.Message)
		} else {
			fmt.Println("Unexpected error:", err)
		}
	}
}
```
**Note:** While type assertions (`err.(*MyCustomError)`) work, `errors.As` is generally preferred for custom error types as it correctly handles wrapped errors.

**4. Wrapping Errors with `%w`**
Go 1.13 introduced error wrapping, allowing you to add context to an error while preserving the original error in a chain. This is done using `fmt.Errorf` with the `%w` verb.

*   **Purpose:** To provide more context as an error propagates up the call stack without losing the original cause.
*   **Usage:**
    ```go
    package main

    import (
    	"errors"
    	"fmt"
    	"os"
    )

    // simulateFileRead simulates reading a file that might not exist.
    func simulateFileRead(filename string) ([]byte, error) {
    	if filename == "nonexistent.txt" {
    		return nil, os.ErrNotExist
    	}
    	return []byte("file content"), nil
    }

    // readFileAndProcess reads a file and then processes it.
    func readFileAndProcess(filename string) error {
    	_, err := simulateFileRead(filename)
    	if err != nil {
    		// Wrap the original error with additional context
    		return fmt.Errorf("failed to read file %q: %w", filename, err)
    	}
    	fmt.Println("File read successfully.")
    	return nil
    }

    func main() {
    	if err := readFileAndProcess("nonexistent.txt"); err != nil {
    		fmt.Println("Error:", err)
    		// Check if the underlying error is os.ErrNotExist
    		if errors.Is(err, os.ErrNotExist) {
    			fmt.Println("The file specifically does not exist.")
    		}
    	}
    }
    ```
    In this example, `errors.Is` successfully finds `os.ErrNotExist` even though it's wrapped.

**5. Sentinel Errors**
Sentinel errors are global, exported error variables that act as specific markers. They are compared directly using `errors.Is`.

*   **Principle:** Declare a variable of type `error` using `errors.New` or a custom error type, typically at the package level.
*   **Comparison:** Always compare sentinel errors using `errors.Is` (not `==`), as the error might be wrapped.
*   **When to Use:** When the specific *type* of error is crucial for the caller to make a decision (e.g., `io.EOF`, `os.ErrNotExist`). Overuse can lead to tight coupling.

```go
package main

import (
	"errors"
	"fmt"
)

// ErrInvalidInput is a sentinel error for invalid function arguments.
var ErrInvalidInput = errors.New("invalid input provided")

func processData(data int) error {
	if data < 0 {
		return ErrInvalidInput // Return the sentinel error directly
	}
	if data == 100 {
		// Example of wrapping a sentinel error
		return fmt.Errorf("data value %d is problematic: %w", data, ErrInvalidInput)
	}
	return nil
}

func main() {
	err := processData(-5)
	if errors.Is(err, ErrInvalidInput) {
		fmt.Println("Input error detected:", err)
	}

	err = processData(100)
	if errors.Is(err, ErrInvalidInput) {
		fmt.Println("Input error (wrapped) detected:", err)
	}
}
```

**Idiomatic Best Practices:**
*   **Don't Ignore Errors:** Always check `err != nil` and handle the error appropriately.
*   **Add Context:** When propagating an error, add context using `fmt.Errorf("%w", err)` to help with debugging.
*   **Return Early:** If an error occurs, return immediately (`if err != nil { return ..., err }`). This keeps the main logic less nested and easier to read.
*   **Avoid Panics for Recoverable Errors:** `panic` is for unrecoverable situations (e.g., programming bugs, uninitialized state). Use `error` for expected failures.
*   **Error Interface vs. Concrete Types:** Return `error` (interface) rather than concrete custom error types from public functions. Let the caller use `errors.As` or `errors.Is` for introspection.

---

**Quick Check/Exercise:**

1.  Explain the primary difference between `errors.Is` and `errors.As` when handling an error chain.
2.  Write a simple Go function that takes an integer, returns it and an error. If the integer is negative, return a custom error type `NegativeValueError` containing the negative value.
3.  Modify the function from #2 to wrap `NegativeValueError` with an additional context message "processing failed" before returning it. Demonstrate how to check for `NegativeValueError` using `errors.Is` after it has been wrapped.