# Kotlin Language Fundamentals: A Comprehensive Study Guide

Kotlin is a modern, statically typed programming language developed by JetBrains. It's fully interoperable with Java and has become the preferred language for Android app development. This guide will help you master its core features, providing a solid foundation for building robust applications.

## 1. Basic Syntax, Variables, and Data Types

Kotlin's syntax is concise and expressive. Understanding variables and data types is fundamental.

*   **Variables**: 
    *   `val`: Declares an immutable (read-only) variable. Its value cannot be reassigned after initialization. Preferred for immutability.
    *   `var`: Declares a mutable variable. Its value can be changed after initialization.
*   **Data Types**: Kotlin provides types like `Int`, `Double`, `Boolean`, `Char`, and `String`. Unlike Java, primitive types are objects in Kotlin, offering consistency. 
*   **Type Inference**: Kotlin can often infer the data type of a variable from its initial value, reducing the need for explicit type declarations.

```kotlin
// Example: Variables and Data Types
val courseName: String = "Kotlin Fundamentals" // Explicitly typed, immutable
var studentCount = 150 // Type inferred as Int, mutable

studentCount = 155 // Valid: studentCount is a var
// courseName = "Advanced Kotlin" // Error: val cannot be reassigned

val averageScore = 85.5 // Inferred as Double
val isActive = true // Inferred as Boolean
```

## 2. Control Flow

Control flow statements dictate the order in which code is executed.

*   **If/Else Expressions**: `if` can be used as an expression, returning a value, making code more functional.
*   **When Expression**: A powerful replacement for Java's `switch` statement. It can be used as a statement or an expression and supports various conditions (constants, ranges, types).
*   **Loops**: 
    *   `for` loop: Used to iterate over ranges, arrays, and collections.
    *   `while` and `do-while` loops: Standard looping constructs.

```kotlin
// Example: Control Flow
val score = 92
val grade = if (score >= 90) "A" else if (score >= 80) "B" else "C" // if as an expression
println("Grade: $grade")

val dayOfWeek = 3
when (dayOfWeek) {
    1 -> println("Monday")
    in 2..6 -> println("Weekday")
    7 -> println("Sunday")
    else -> println("Invalid day")
}

for (i in 1..3) {
    println("Iteration $i")
}

var countdown = 3
while (countdown > 0) {
    println("Countdown: ${countdown--}")
}
```

## 3. Functions

Functions are blocks of code designed to perform a particular task.

*   **Defining Functions**: Use the `fun` keyword.
*   **Parameters & Return Types**: Functions can accept parameters and return values. Return types are declared after the parameter list.
*   **Single-Expression Functions**: For functions that return a single expression, you can omit the curly braces and `return` keyword.
*   **Higher-Order Functions**: Functions that take other functions as parameters or return a function. This is a powerful feature for functional programming.
*   **Lambdas**: Anonymous functions (functions without a name) that can be passed as arguments to higher-order functions.

```kotlin
// Example: Functions
fun greetUser(name: String): String { // Function with parameter and return type
    return "Hello, $name!"
}

fun multiply(a: Int, b: Int) = a * b // Single-expression function

// Higher-order function: Takes an Int, Int, and a function (Int, Int) -> Int, returns Int
fun calculate(num1: Int, num2: Int, operation: (Int, Int) -> Int): Int {
    return operation(num1, num2)
}

val addFunction = { x: Int, y: Int -> x + y } // Lambda expression for addition
val subtractFunction: (Int, Int) -> Int = { x, y -> x - y } // Lambda with explicit type

println(greetUser("Alice"))
println("Product: ${multiply(4, 5)}")
println("Sum using lambda: ${calculate(10, 5, addFunction)}")
println("Difference using lambda: ${calculate(10, 5, subtractFunction)}")
```

## 4. Object-Oriented Programming (OOP)

Kotlin fully supports OOP concepts, often with more concise syntax than Java.

*   **Classes & Objects**: Classes are blueprints, and objects are instances of those blueprints. Classes are `final` by default in Kotlin, meaning they cannot be inherited from unless explicitly marked `open`.
*   **Constructors**: 
    *   **Primary Constructor**: Declared in the class header, concise for simple initialization.
    *   **Secondary Constructors**: Declared using the `constructor` keyword inside the class body.
*   **Properties**: Member variables of a class, often declared in the primary constructor.
*   **Data Classes**: Special classes designed solely to hold data. They automatically provide useful functions like `equals()`, `hashCode()`, `toString()`, `copy()`, and `componentN()`.
*   **Inheritance**: To allow a class to be inherited from, mark it with the `open` keyword. Use the `:` operator to indicate inheritance.
*   **Interfaces**: Define contracts that classes can implement. Interfaces can contain abstract methods and concrete implementations of methods.

```kotlin
// Example: OOP
open class Animal(val name: String) { // open class allows inheritance
    open fun makeSound() { // open function allows overriding
        println("$name makes a sound")
    }
}

class Dog(name: String, val breed: String) : Animal(name) { // Dog inherits from Animal
    override fun makeSound() { // Override method
        println("$name barks, it's a $breed")
    }
    fun fetch() {
        println("$name is fetching!")
    }
}

data class Product(val id: Int, val name: String, val price: Double) // Data class

interface Greeter { // Interface
    fun sayHello(target: String)
    fun sayGoodbye() { // Default implementation
        println("Goodbye!")
    }
}

class EnglishGreeter : Greeter {
    override fun sayHello(target: String) {
        println("Hello, $target!")
    }
}

val myDog = Dog("Buddy", "Golden Retriever")
myDog.makeSound()
myDog.fetch()

val laptop = Product(101, "Laptop", 1200.00)
val updatedLaptop = laptop.copy(price = 1150.00) // Data class copy method
println(updatedLaptop)

val greeter = EnglishGreeter()
greeter.sayHello("World")
greeter.sayGoodbye()
```

## 5. Collections

Kotlin offers rich collection APIs for working with groups of objects.

*   **Lists**: Ordered collections that can contain duplicate elements. `List` is immutable, `MutableList` is mutable.
*   **Sets**: Unordered collections that store unique elements. `Set` is immutable, `MutableSet` is mutable.
*   **Maps**: Collections that store key-value pairs, where keys are unique. `Map` is immutable, `MutableMap` is mutable.

```kotlin
// Example: Collections
val fruits = listOf("Apple", "Banana", "Cherry") // Immutable List
val colors = mutableListOf("Red", "Green") // Mutable List
colors.add("Blue")
println("First fruit: ${fruits[0]}")

val uniqueNumbers = setOf(1, 2, 2, 3) // Immutable Set (contains 1, 2, 3)
val mutableSet = mutableSetOf("A", "B")
mutableSet.add("C")
println("Unique numbers: $uniqueNumbers")

val countryCapitals = mapOf("USA" to "Washington D.C.", "France" to "Paris") // Immutable Map
val ages = mutableMapOf("Alice" to 30, "Bob" to 25)
ages["Charlie"] = 35
println("Capital of USA: ${countryCapitals["USA"]}")
println("Bob's age: ${ages["Bob"]}")
```

## 6. Null Safety

Kotlin's null safety is a core feature designed to eliminate `NullPointerExceptions` (NPEs) at compile time.

*   **Nullable Types**: By default, types are non-nullable. To allow `null` values, append a `?` to the type (e.g., `String?`).
*   **Safe Call Operator (`?.`)**: Used to safely access properties or call methods on nullable objects. If the object is `null`, the entire expression evaluates to `null` without throwing an NPE.
*   **Elvis Operator (`?:`)**: Provides a default value if a nullable expression evaluates to `null`.
*   **Non-null Asserted Call (`!!`)**: Converts any value to a non-nullable type, throwing an NPE if the value is `null`. Use this sparingly, only when you are absolutely certain a value will not be `null`.

```kotlin
// Example: Null Safety
var city: String? = "London"
city = null // Valid for a nullable type

// Safe call operator
println("City length (safe call): ${city?.length}") // Prints null

// Elvis operator
val name: String? = null
val displayName = name ?: "Guest" // If name is null, displayName is "Guest"
println("Display Name: $displayName")

// Non-null asserted call (use with caution!)
// val sureName: String? = null
// val length = sureName!!.length // This would throw a NullPointerException if sureName is null

val nonNullName: String = "Sarah"
val inferredNonNullName = nonNullName // Automatically treated as non-nullable
```

## 7. Exception Handling

Kotlin uses the standard `try`/`catch`/`finally` construct for handling exceptions, similar to Java. `try` can also be used as an expression.

```kotlin
// Example: Exception Handling
fun divideNumbers(numerator: Int, denominator: Int): Int {
    return try {
        numerator / denominator
    } catch (e: ArithmeticException) {
        println("Error: Division by zero occurred! Message: ${e.message}")
        0 // Return a default value in case of error
    } finally {
        println("Division attempt completed.")
    }
}

println("Result of 10 / 2: ${divideNumbers(10, 2)}")
println("Result of 10 / 0: ${divideNumbers(10, 0)}")
```

## 8. Idiomatic Kotlin Practices

Idiomatic Kotlin refers to the recommended and most natural ways to write Kotlin code, often leveraging its unique features for conciseness and clarity.

*   **Extension Functions**: Allow you to add new functions to an existing class without modifying its source code. This is useful for extending libraries or third-party classes.
*   **Scope Functions (`let`, `run`, `with`, `apply`, `also`)**: These functions provide a way to execute a block of code within the context of an object. Each has slightly different use cases based on how they refer to the receiver object (using `this` or `it`) and what they return.
    *   `let`: Executes a block on a non-null object (references `it`), returns the lambda result.
    *   `run`: Similar to `let` but references the object as `this`, returns the lambda result.
    *   `with`: Takes an object as an argument (references `this`), returns the lambda result.
    *   `apply`: Configures an object (references `this`), returns the object itself.
    *   `also`: Performs additional actions on an object (references `it`), returns the object itself.

```kotlin
// Example: Idiomatic Kotlin
// Extension Function
fun String.isEmptyOrBlank(): Boolean {
    return this.isEmpty() || this.isBlank()
}

val text = "  ".isEmptyOrBlank() // text is true
println("Is '  ' empty or blank? $text")

// Scope Functions
val myPerson = Person("Emily", 28)
    .apply { // 'this' refers to myPerson
        age = 29 // Update a property
        println("Configuring ${this.name}") // Perform side effects
    }
    .also { // 'it' refers to myPerson
        println("Person after config: $it")
    }

val resultLength = myPerson.name.let { // 'it' refers to myPerson.name
    println("Processing name: $it")
    it.length // Returns the length
}
println("Name length: $resultLength")
```

---

### Quick Understanding Checklist/Exercises:

1.  Explain the key difference between `val` and `var` in Kotlin, and provide a short example where `val` would be preferred for a real-world scenario.
2.  How does Kotlin's null safety mechanism work to prevent `NullPointerExceptions`? Illustrate the purpose and usage of both the `?.` (safe call) and `?:` (Elvis) operators with a code snippet.
3.  Write a simple Kotlin `data class` called `Book` with properties `title` (String), `author` (String), and `pages` (Int). Then, create an instance of `Book` and demonstrate its `copy()` method to create a slightly modified version.
