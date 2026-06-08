# Core Language Constructs in Go

This guide will walk you through the foundational elements of the Go programming language, covering its basic syntax, essential data types, control flow mechanisms, functions, methods, and Go's unique struct-based approach to object modeling.

## 1. Basic Syntax and Program Structure

Go programs are organized into `packages`. The `main` package is special; it defines a standalone executable program. The `main` function inside the `main` package is the entry point of the program.

*   **Package Declaration**: Every Go file must start with a `package` declaration.
    ```go
    package main
    ```
*   **Imports**: To use functions from other packages, you need to `import` them.
    ```go
    import "fmt" // For formatted I/O
    import (
        "fmt"
        "math"
    )
    ```
*   **`main` Function**: The entry point of an executable program.
    ```go
    func main() {
        // Your code here
    }
    ```
*   **Variables**: Declared using `var` or the short declaration operator `:=`.
    *   `var name type [= value]`: Explicit declaration.
    *   `name := value`: Type inference, only inside functions.
    ```go
    var age int = 30
    var name string
    name = "Alice"
    city := "New York" // Short declaration
    ```
*   **Constants**: Declared using `const`.
    ```go
    const PI = 3.14159
    const GREETING string = "Hello"
    ```
*   **Comments**: Single-line (`//`) and multi-line (`/* ... */`).

## 2. Primitive Data Types

Go offers a range of built-in data types:

*   **Numeric Types**:
    *   **Integers**: `int`, `int8`, `int16`, `int32` (rune), `int64`, `uint`, `uint8` (byte), `uint16`, `uint32`, `uint64`, `uintptr`. `int` and `uint` are platform-dependent (32 or 64-bit).
    *   **Floating-Point**: `float32`, `float64`.
    *   **Complex Numbers**: `complex64`, `complex128`.
*   **Boolean Type**: `bool` (`true` or `false`).
*   **String Type**: `string` (immutable sequence of bytes, typically UTF-8 encoded text).

```go
var i int = 42
var f float64 = 3.14
var b bool = true
var s string = "Go Lang"

fmt.Printf("i: %T %v\n", i, i) // Output: i: int 42
```

## 3. Composite Data Types

These types group together multiple values.

### Arrays
Fixed-size sequence of elements of the same type. Once declared, an array's size cannot be changed.

```go
var a [3]int            // Declares an array of 3 integers, initialized to zeros
a[0] = 1                // Assign value to index 0
fmt.Println(a[0], a[2]) // Output: 1 0

b := [4]string{"red", "green", "blue", "yellow"} // Array literal
fmt.Println(b)
```

### Slices
Dynamic, flexible views into elements of an array. Slices are more commonly used than arrays in Go due to their flexibility.

*   **Declaration**: `[]type`
*   **Creation**: Using `make()` or slicing an existing array/slice.
*   **`len()` and `cap()`**: `len` is the number of elements, `cap` is the maximum number of elements it can hold without reallocating.
*   **`append()`**: Used to add elements, potentially reallocating the underlying array.

```go
s := []int{10, 20, 30}    // Slice literal
fmt.Println(s, len(s), cap(s))

s = append(s, 40, 50)     // Append elements
fmt.Println(s, len(s), cap(s))

subSlice := s[1:3]        // Create a sub-slice (elements at index 1 and 2)
fmt.Println(subSlice)     // Output: [20 30]
```

### Maps
Unordered collections of key-value pairs. Keys must be comparable types (e.g., numbers, strings, pointers, structs, arrays), values can be any type.

*   **Declaration**: `map[keyType]valueType`
*   **Creation**: Using `make()` or map literal.

```go
m := make(map[string]int) // Create an empty map
m["apple"] = 10
m["banana"] = 20

fmt.Println("Apple count:", m["apple"]) // Output: Apple count: 10

delete(m, "apple")                    // Delete an element

val, ok := m["banana"]                 // Check if key exists
if ok {
    fmt.Println("Banana count:", val)
}

// Map literal
colors := map[string]string{
    "red":   "#FF0000",
    "blue":  "#0000FF",
}
fmt.Println(colors["red"])
```

### Structs
User-defined composite types that group together fields of different types into a single unit. Go uses structs as its primary mechanism for creating complex data structures, forming the basis of its 