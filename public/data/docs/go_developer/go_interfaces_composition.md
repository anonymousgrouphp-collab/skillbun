# Go Interfaces and Composition

This guide explores the fundamental concepts of Interfaces and Composition in Go, demonstrating how they enable flexible, maintainable, and scalable code design.

## 1. Understanding Go Interfaces

Go interfaces provide a way to specify the *behavior* of an object without being concerned with *how* that behavior is implemented. Unlike many other languages, Go interfaces are implicitly satisfied; a type implements an interface if it provides all the methods declared in the interface, without needing explicit declaration.

### 1.1 Defining an Interface

An interface is defined as a set of method signatures.

```go
type Shape interface {
    Area() float64
    Perimeter() float64
}
```
Here, `Shape` is an interface that requires any implementing type to have an `Area()` method returning a `float64` and a `Perimeter()` method also returning a `float64`.

### 1.2 Implicit Implementation and Polymorphism

A concrete type implements an interface by simply defining all the methods specified by the interface. There's no special syntax like `implements` or `extends`.

```go
type Circle struct {
    Radius float64
}

func (c Circle) Area() float64 {
    return 3.14159 * c.Radius * c.Radius
}

func (c Circle) Perimeter() float64 {
    return 2 * 3.14159 * c.Radius
}

type Rectangle struct {
    Width, Height float64
}

func (r Rectangle) Area() float64 {
    return r.Width * r.Height
}

func (r Rectangle) Perimeter() float64 {
    return 2 * (r.Width + r.Height)
}
```
Both `Circle` and `Rectangle` implicitly implement the `Shape` interface because they both have `Area()` and `Perimeter()` methods. This allows for polymorphism: you can write functions that operate on any `Shape`, regardless of its underlying concrete type.

```go
func PrintShapeInfo(s Shape) {
    println("Area:", s.Area())
    println("Perimeter:", s.Perimeter())
}

// In main or another function:
// c := Circle{Radius: 5}
// r := Rectangle{Width: 4, Height: 6}
// PrintShapeInfo(c) // Works for Circle
// PrintShapeInfo(r) // Works for Rectangle
```

### 1.3 The Empty Interface (`interface{}` or `any`)

The empty interface `interface{}` (or `any` in Go 1.18+) can hold values of *any* type. This is often used when you need to handle heterogeneous data, but it comes with the drawback of losing type safety, requiring type assertions or type switches to access the underlying concrete type's methods or fields.

```go
func describe(i any) { // or interface{}
    println("Value:", i)
    // Example of type assertion:
    if s, ok := i.(string); ok {
        println("It's a string:", s)
    }
}
```

## 2. Composition Over Inheritance

Go does not support traditional class-based inheritance. Instead, it promotes "composition over inheritance" through struct embedding, allowing types to reuse existing functionality by including other types as fields.

### 2.1 Struct Embedding

Struct embedding means including an anonymous field of another struct type within a new struct. This allows the outer struct to "inherit" the fields and methods of the embedded type, making them directly accessible as if they were declared on the outer struct itself (this is known as *promotion*).

```go
type Logger struct {
    Prefix string
}

func (l Logger) Log(message string) {
    println(l.Prefix + ": " + message)
}

type Server struct {
    Host string
    Port int
    Logger // Embedded type
}

func (s Server) Start() {
    s.Log("Server starting on " + s.Host + ":" + strconv.Itoa(s.Port))
    // ... server logic ...
    s.Log("Server started")
}
```
In this example, `Server` *has a* `Logger`. Because `Logger` is embedded, `Server` instances can directly call `s.Log()` as if `Log` was a method of `Server` itself. This promotes code reuse without the complexities of inheritance hierarchies.

### 2.2 Relationship with Interfaces

Composition works hand-in-hand with interfaces. You can define interfaces that describe the behavior of a component, and then compose these components into larger systems. This allows for highly modular and testable designs.

For instance, if `Logger` implemented an `io.Writer` interface, the `Server` could then potentially expose that `io.Writer` behavior, or internally use any type that satisfies `io.Writer` for its logging.

## Code Example: Combined Interfaces and Composition

Let's combine interfaces and embedding to create a flexible system.

```go
package main

import (
	"fmt"
	"strconv"
)

// Greeter interface defines a contract for greeting behavior
type Greeter interface {
	Greet() string
}

// Person struct implements the Greeter interface
type Person struct {
	Name string
	Age  int
}

func (p Person) Greet() string {
	return fmt.Sprintf("Hello, my name is %s and I am %d years old.", p.Name, p.Age)
}

// Department struct uses composition to embed a Greeter
// and adds its own specific behavior.
type Department struct {
	Name string
	Greeter // Embedded interface (acts as a field)
}

// Introduce method for Department demonstrates using the embedded Greeter
func (d Department) Introduce() string {
	if d.Greeter != nil {
		return fmt.Sprintf("This is the %s department. %s", d.Name, d.Greeter.Greet())
	}
	return fmt.Sprintf("This is the %s department.", d.Name)
}

// Example of a different type also implementing Greeter
type Robot struct {
	ID string
}

func (r Robot) Greet() string {
	return fmt.Sprintf("BEEP BOOP, I am Robot %s.", r.ID)
}

func main() {
	// Polymorphism with the Greeter interface
	var p Greeter = Person{Name: "Alice", Age: 30}
	fmt.Println(p.Greet()) // Output: Hello, my name is Alice and I am 30 years old.

	var r Greeter = Robot{ID: "R2D2"}
	fmt.Println(r.Greet()) // Output: BEEP BOOP, I am Robot R2D2.

	// Composition: Department embedding a Person (which is a Greeter)
	engDept := Department{
		Name:    "Engineering",
		Greeter: Person{Name: "Bob", Age: 45}, // Embedding a Person as a Greeter
	}
	fmt.Println(engDept.Introduce())
	// Output: This is the Engineering department. Hello, my name is Bob and I am 45 years old.

	// Composition: Department embedding a Robot (also a Greeter)
	qaDept := Department{
		Name:    "QA",
		Greeter: Robot{ID: "C3PO"},
	}
	fmt.Println(qaDept.Introduce())
	// Output: This is the QA department. BEEP BOOP, I am Robot C3PO.

	// Department with no embedded greeter
	hrDept := Department{
		Name: "HR",
		// Greeter field is nil
	}
	fmt.Println(hrDept.Introduce())
	// Output: This is the HR department.
}
```
In this example:
*   `Greeter` is an interface defining a `Greet()` method.
*   `Person` and `Robot` both implement `Greeter`.
*   `Department` embeds the `Greeter` interface. This means a `Department` can hold *any* type that implements `Greeter`. The `Introduce` method then calls the `Greet` method on the embedded `Greeter`, demonstrating how composition allows for flexible behavior based on the specific type embedded.

## Quick Checklist/Exercise

1.  **Interface Definition**: Define an interface `Logger` with a single method `Log(message string)`. Then, create a struct `ConsoleLogger` that implicitly implements this interface.
2.  **Polymorphism**: Write a function `Process(l Logger, data string)` that takes the `Logger` interface and logs the `data`. Demonstrate calling `Process` with your `ConsoleLogger` instance.
3.  **Composition**: Create a `Worker` struct that embeds your `ConsoleLogger`. Make the `Worker` have a `PerformTask(taskName string)` method that uses the embedded `Logger` to log the start and completion of the task.