# Go Language Foundations: Study Guide

This guide will help you master the fundamental syntax, data structures, control flow, error handling, core principles, project organization, modern module management, and essential tooling in the Go language.

## 1. Core Syntax and Data Types

Go is a statically typed, compiled language. Understanding its basic building blocks is crucial.

### Variables and Constants

*   **Variable Declaration:** Use `var` keyword. Explicit type declaration is optional if initialized.
    ```go
    var name string = "Alice"
    var age int = 30
    var isLoggedIn bool // default is false
    ```
*   **Short Variable Declaration:** Use `:=` operator, only inside functions.
    ```go
    city := "New York"
    count := 100
    ```
*   **Constants:** Declared with `const`. Values must be known at compile time.
    ```go
    const PI float64 = 3.14159
    const GREETING = "Hello, Go!"
    ```

### Basic Data Types

*   **Numeric:** `int`, `int8`, `int16`, `int32`, `int64`, `uint`, `uint8`, `uint16`, `uint32`, `uint64`, `uintptr` (for integers); `float32`, `float64` (for floating-point numbers); `complex64`, `complex128` (for complex numbers).
*   **Boolean:** `bool` (true/false).
*   **String:** `string` (immutable sequence of bytes, typically UTF-8 encoded).
*   **Derived Types:** Arrays, slices, maps, structs, pointers, functions, channels, interfaces.

### Zero Values

Variables declared without an explicit initial value are given their **zero value**:
*   `0` for numeric types
*   `false` for booleans
*   `""` (empty string) for strings
*   `nil` for pointers, slices, maps, channels, functions, and interfaces

## 2. Control Flow

Go provides standard constructs for controlling program execution.

### If/Else Statements

Go's `if` statements do not require parentheses around the condition. An optional short statement can precede the condition.

```go
if x := 10; x > 5 {
    fmt.Println("x is greater than 5")
} else if x == 5 {
    fmt.Println("x is 5")
} else {
    fmt.Println("x is less than 5")
}
```

### For Loops

Go has only one looping construct: `for`. It can be used in several ways:

*   **Traditional:**
    ```go
    for i := 0; i < 5; i++ {
        fmt.Println(i)
    }
    ```
*   **While-like:**
    ```go
    sum := 1
    for sum < 100 {
        sum += sum
    }
    fmt.Println(sum)
    ```
*   **Infinite Loop:**
    ```go
    // for {
    //    // loop forever
    // }
    ```
*   **Range Loop (for iterating over arrays, slices, strings, maps, channels):**
    ```go
    numbers := []int{1, 2, 3}
    for index, value := range numbers {
        fmt.Printf("Index: %d, Value: %d\n", index, value)
    }
    ```

### Switch Statements

`switch` statements allow multiple conditions. `break` statements are automatic in Go (unlike C/Java) unless `fallthrough` is used.

```go
rank := 3
switch rank {
case 1:
    fmt.Println("Gold")
case 2:
    fmt.Println("Silver")
case 3:
    fmt.Println("Bronze")
default:
    fmt.Println("Participant")
}

// Tagless switch (like if-else if-else chain)
score := 85
switch {
case score >= 90:
    fmt.Println("Grade A")
case score >= 80:
    fmt.Println("Grade B")
default:
    fmt.Println("Grade C")
}
```

## 3. Functions

Functions are blocks of code designed to perform a particular task.

### Declaration

```go
func add(a int, b int) int {
    return a + b
}

// Multiple return values
func swap(x, y string) (string, string) {
    return y, x
}

// Named return values
func divide(numerator, denominator int) (result int, err error) {
    if denominator == 0 {
        return 0, errors.New("cannot divide by zero")
    }
    result = numerator / denominator
    return result, nil // or just `return` with named returns
}
```

### Variadic Functions

Functions that can accept a variable number of arguments of a specific type.

```go
func sumAll(nums ...int) int {
    total := 0
    for _, num := range nums {
        total += num
    }
    return total
}
```

## 4. Pointers

Pointers hold the memory address of a value. Go uses pointers explicitly but without pointer arithmetic.

*   `&` operator: Gives the memory address of a variable.
*   `*` operator: Denotes a pointer type or dereferences a pointer (accesses the value at the address).

```go
x := 42
p := &x // p is a pointer to x

fmt.Println(*p) // read x through the pointer p
*p = 21   // set x through the pointer p
fmt.Println(x)
```

## 5. Data Structures

Go provides built-in support for several essential data structures.

### Arrays

Fixed-size sequence of elements of the same type.

```go
var a [3]int            // declares an array of 3 integers, initialized to [0 0 0]
b := [3]int{1, 2, 3}    // declares and initializes
c := [...]int{4, 5, 6}  // compiler infers size (3)
```

### Slices

Dynamic, flexible views into elements of an array. Slices are more commonly used than arrays.

```go
s := []int{10, 20, 30}          // slice literal
s = append(s, 40, 50)           // append elements
fmt.Println(s)

twoDSlice := make([][]int, 3) // create a slice of 3 slices of ints
for i := range twoDSlice {
    twoDSlice[i] = make([]int, 2) // initialize inner slices
}
fmt.Println(twoDSlice)

// Slice a slice
part := s[1:4] // from index 1 (inclusive) to 4 (exclusive)
fmt.Println(part)
```

### Maps

Unordered collections of key-value pairs. Keys must be comparable (e.g., strings, numbers, structs without slices/maps).

```go
m := make(map[string]int) // create a map with string keys and int values
m["apple"] = 10
m["banana"] = 20

fmt.Println(m["apple"]) // access value

delete(m, "banana")      // delete a key-value pair

value, ok := m["orange"] // check if key exists
if ok {
    fmt.Println("Orange exists:", value)
} else {
    fmt.Println("Orange does not exist")
}
```

### Structs

User-defined composite types that group together fields of different types.

```go
type Person struct {
    Name    string
    Age     int
    IsAdult bool
}

p1 := Person{"John Doe", 30, true}
p2 := Person{Name: "Jane Smith", Age: 25} // field-value syntax

fmt.Println(p1.Name, p2.Age)

// Anonymous struct
anon := struct {
    Field1 string
    Field2 int
}{"value", 123}
fmt.Println(anon.Field1)
```

## 6. Error Handling

Go handles errors through `error` interface and multiple return values, rather than exceptions.

```go
package main

import (
    "errors"
    "fmt"
)

func divide(numerator, denominator float64) (float64, error) {
    if denominator == 0 {
        return 0, errors.New("cannot divide by zero")
    }
    return numerator / denominator, nil
}

func main() {
    result, err := divide(10.0, 2.0)
    if err != nil {
        fmt.Println("Error:", err)
    } else {
        fmt.Println("Result:", result)
    }

    result, err = divide(10.0, 0.0)
    if err != nil {
        fmt.Println("Error:", err)
    } else {
        fmt.Println("Result:", result)
    }

    // Custom error type
    var ErrInsufficientFunds = errors.New("insufficient funds")
    fmt.Println(ErrInsufficientFunds)
}
```

`panic` and `recover` are used for exceptional, unrecoverable errors, not general error handling.

## 7. Go Modules and Project Organization

Go Modules are the dependency management system for Go, replacing GOPATH.

*   **Initialize a Module:** `go mod init <module-path>` (e.g., `go mod init example.com/mymodule`)
*   **Add/Update Dependencies:** `go get <package-path>` or `go mod tidy` (cleans up unused dependencies and adds missing ones).
*   **`go.mod`:** Defines the module path, Go version, and lists direct and indirect dependencies.
*   **`go.sum`:** Contains cryptographic hashes of module content for security and integrity verification.

### Project Structure (Common)

```
my-project/
├── cmd/
│   └── my-app/      // Main applications (e.g., cmd/server, cmd/cli)
│       └── main.go
├── pkg/             // Library code intended for external use
│   └── database/
│       └── db.go
├── internal/        // Private application code, not for external import
│   └── service/
│       └── service.go
├── api/             // API definitions (e.g., protobuf files, OpenAPI specs)
├── web/             // Web assets, templates
├── go.mod
├── go.sum
└── README.md
```

## 8. Essential Tooling

Go comes with a powerful set of command-line tools.

*   `go run <file.go>`: Compiles and runs a Go program in one step.
*   `go build [-o output_name] <package>`: Compiles packages and dependencies. Creates an executable binary.
*   `go install <package>`: Compiles and installs the package's executable into `$GOPATH/bin` or `$GOBIN`.
*   `go fmt <package or file>`: Formats Go source code according to official Go style.
*   `go vet <package>`: Examines Go source code and reports suspicious constructs, like `printf` format errors.
*   `go test <package>`: Runs tests for the specified package.

## Example Program

```go
package main

import (
	"fmt"
	"errors"
)

// Greet takes a name and returns a greeting string.
func Greet(name string) string {
	return fmt.Sprintf("Hello, %s! Welcome to Go.", name)
}

// CalculateProduct calculates the product of two integers.
// It returns an error if either input is negative.
func CalculateProduct(a, b int) (int, error) {
	if a < 0 || b < 0 {
		return 0, errors.New("inputs must be non-negative")
	}
	return a * b, nil
}

func main() {
	// 1. Variables and Data Types
	var username string = "Gopher"
	age := 5 // Short declaration
	isLearning := true

	fmt.Printf("User: %s, Age: %d, Learning Go: %t\n", username, age, isLearning)

	// 2. Control Flow - If statement
	if age >= 18 {
		fmt.Println(Greet(username) + " You are an adult.")
	} else {
		fmt.Println(Greet(username) + " You are a minor.")
	}

	// 3. Control Flow - For loop (range over slice)
	numbers := []int{1, 2, 3, 4, 5}
	fmt.Print("Numbers: ")
	for i, num := range numbers {
		fmt.Printf("%d", num)
		if i < len(numbers)-1 {
			fmt.Print(", ")
		}
	}
	fmt.Println("\n")

	// 4. Error Handling
	product, err := CalculateProduct(7, 6)
	if err != nil {
		fmt.Println("Error calculating product:", err)
	} else {
		fmt.Println("Product of 7 and 6 is:", product)
	}

	negativeProduct, err := CalculateProduct(-1, 5)
	if err != nil {
		fmt.Println("Error calculating product (negative input):", err)
	} else {
		fmt.Println("Product of -1 and 5 is:", negativeProduct)
	}

	// 5. Maps
	countryCodes := map[string]string{
		"USA": "+1",
		"IND": "+91",
	}
	fmt.Println("US Country Code:", countryCodes["USA"])

	// 6. Structs
	type Item struct {
		Name  string
		Price float64
	}

	item1 := Item{"Laptop", 1200.50}
	fmt.Printf("Item: %s, Price: $%.2f\n", item1.Name, item1.Price)
}
```

## Quick Checklist/Exercises

1.  Declare a slice of strings containing three of your favorite programming languages. Then, use a `for...range` loop to print each language.
2.  Write a function `isEven(num int) bool` that takes an integer and returns `true` if it's even, `false` otherwise. Demonstrate its usage with an `if` statement.
3.  Create a Go module, then add a simple main function that imports and uses the `fmt` package. Explain what `go.mod` and `go.sum` files are for in this context.
