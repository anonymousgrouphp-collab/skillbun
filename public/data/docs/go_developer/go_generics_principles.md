# Generics and Type Parameters in Go (Go 1.18+)

Go's introduction of generics in version 1.18 was a significant feature, allowing developers to write more flexible, reusable, and type-safe code without sacrificing Go's performance or simplicity. Before generics, achieving similar flexibility often involved using `interface{}` (now `any`) with type assertions or reflection, leading to less type safety, more boilerplate, and potential runtime errors.

## What Problem Do Generics Solve?

Consider a scenario where you need to write a function that works with slices of different numeric types (e.g., `[]int`, `[]float64`). Without generics, you would either write separate functions for each type or use `any` and perform runtime type checks. Generics provide a way to write a single function that operates on *any* type that satisfies certain criteria, checked at compile time.

## Core Concepts

### 1. Type Parameters

Type parameters are to types what regular parameters are to values. They allow functions and types to operate on an arbitrary set of types.

*   **Syntax:** Type parameters are declared in square brackets `[]` after the function name or type name.
    *   Example: `func MyFunction[T any](arg T) { ... }`
    *   Example: `type MySlice[T any] []T`

### 2. Type Constraints

Type constraints are interfaces that specify the set of types that can be used for a type parameter. They ensure that operations performed on the type parameter are valid for all allowed types.

*   **Predeclared Constraints:**
    *   `any`: The empty interface, meaning any type can be used. It allows no operations on the type parameter beyond what `any` supports (e.g., assignment, type assertion).
    *   `comparable`: A predeclared interface that permits types whose values can be compared using `==` and `!=`. This includes boolean, numeric, string, pointer, channel, and interface types, as well as struct and array types whose components are comparable. Slices, maps, and functions are not comparable.

*   **Custom Constraints:** You can define your own interface types to act as constraints. These interfaces can embed other interfaces or list specific types using a union (`|`).

    ```go
    // Example: A constraint for numeric types
    type Number interface {
        int | int8 | int16 | int32 | int64 |
        uint | uint8 | uint16 | uint32 | uint64 | uintptr |
        float32 | float64 |
        ~int | ~float32 // The '~' allows for types with the same underlying type
    }

    // Example: A constraint for signed integers
    type SignedInteger interface {
        int | int8 | int16 | int32 | int64
    }
    ```

*   **The `~` (Tilde) Operator:** The `~` token in a type constraint allows not just the specified type itself but also any type *whose underlying type* is the specified type. For example, `~int` would allow `int` and any named type declared as `type MyInt int`.

## Generics in Functions

Let's create a generic `Sum` function that can work with different numeric types.

```go
package main

import "fmt"

// Number is a type constraint that allows any numeric type,
// including custom types with these underlying types.
type Number interface {
    int | int8 | int16 | int32 | int64 |
    uint | uint8 | uint16 | uint32 | uint64 | uintptr |
    float32 | float64 |
    ~int | ~float32 | ~float64 // Allows types like 'type MyInt int'
}

// Sum calculates the sum of elements in a slice of any Number type.
func Sum[T Number](slice []T) T {
    var total T
    for _, v := range slice {
        total += v
    }
    return total
}

func main() {
    intSlice := []int{1, 2, 3, 4, 5}
    fmt.Printf("Sum of intSlice: %v\n", Sum(intSlice)) // Output: 15

    floatSlice := []float64{1.1, 2.2, 3.3}
    fmt.Printf("Sum of floatSlice: %v\n", Sum(floatSlice)) // Output: 6.6

    type MyInt int
    myIntSlice := []MyInt{10, 20, 30}
    fmt.Printf("Sum of myIntSlice: %v\n", Sum(myIntSlice)) // Output: 60
}
```

## Generics in Data Structures (Types)

Generics can also be used to define generic types, such as a generic stack, list, or map.

```go
package main

import "fmt"

// Stack represents a generic stack data structure.
type Stack[T any] struct {
    elements []T
}

// Push adds an element to the top of the stack.
func (s *Stack[T]) Push(item T) {
    s.elements = append(s.elements, item)
}

// Pop removes and returns the top element from the stack.
// Returns the element and a boolean indicating success.
func (s *Stack[T]) Pop() (T, bool) {
    if s.IsEmpty() {
        var zero T // Return zero value for type T
        return zero, false
    }
    index := len(s.elements) - 1
    item := s.elements[index]
    s.elements = s.elements[:index] // Truncate the slice
    return item, true
}

// IsEmpty checks if the stack is empty.
func (s *Stack[T]) IsEmpty() bool {
    return len(s.elements) == 0
}

// Size returns the number of elements in the stack.
func (s *Stack[T]) Size() int {
    return len(s.elements)
}

func main() {
    // Create a stack of integers
    intStack := Stack[int]{}
    intStack.Push(10)
    intStack.Push(20)
    fmt.Println("Int Stack size:", intStack.Size()) // Output: 2
    if item, ok := intStack.Pop(); ok {
        fmt.Println("Popped from int stack:", item) // Output: 20
    }

    // Create a stack of strings
    stringStack := Stack[string]{}
    stringStack.Push("Hello")
    stringStack.Push("Generics")
    fmt.Println("String Stack size:", stringStack.Size()) // Output: 2
    if item, ok := stringStack.Pop(); ok {
        fmt.Println("Popped from string stack:", item) // Output: Generics
    }
}
```

## Benefits of Generics

*   **Code Reusability:** Write functions and types once and use them with multiple types.
*   **Type Safety:** Type checks happen at compile time, preventing many runtime errors that could occur with `any`.
*   **Improved Performance:** Generics avoid the overhead of reflection or type assertions often associated with `any`, as the compiler can generate specialized code for each type instantiation.
*   **Cleaner Code:** Reduces boilerplate and improves readability compared to repetitive code for different types.

---

## Quick Checklist / Exercise

1.  **Identify the Use Case:** Describe a scenario in your own words where using Go generics would be more beneficial than writing multiple functions for specific types.
2.  **Define a Custom Constraint:** Write a Go interface that acts as a type constraint for types that can perform both addition (`+`) and subtraction (`-`). Assume these are standard numeric types.
3.  **Implement a Generic Function:** Create a generic Go function `Min[T comparable](a, b T) T` that returns the smaller of two comparable values.