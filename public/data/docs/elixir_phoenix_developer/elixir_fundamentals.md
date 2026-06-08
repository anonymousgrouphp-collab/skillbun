# Elixir Language Fundamentals

Elixir is a dynamic, functional language designed for building scalable and maintainable applications. It leverages the Erlang VM (BEAM), known for its ability to run low-latency, distributed, and fault-tolerant systems. Mastering Elixir's core syntax and functional paradigms is crucial for any "Elixir/Phoenix Developer".

## 1. Core Syntax and Data Types

Elixir embraces a clean, readable syntax. It features powerful constructs like pattern matching and a rich set of data types.

### 1.1 Variables and Immutability

In Elixir, variables are assigned using the `=` operator. Variables are immutable, meaning once a value is bound to a variable, it cannot be changed. Instead, a new binding is created, effectively "rebinding" the variable name to a new value.

```elixir
x = 10
# x is now 10

x = 20
# A new binding for x is created with value 20. The old value 10 is untouched.
```

### 1.2 Basic Data Types

*   **Integers:** `1`, `100`, `-5`
*   **Floats:** `3.14`, `2.0`
*   **Booleans:** `true`, `false`
*   **Atoms:** Unique, constant literals starting with a colon, often used for status codes or keys. `:ok`, `:error`, `:user`
*   **Strings:** UTF-8 encoded binaries enclosed in double quotes. `"Hello Elixir"`
*   **Lists:** Ordered collections of *any* data type, implemented as linked lists. `[1, 2, "hello"]`
*   **Tuples:** Ordered, fixed-size collections of *any* data type, often used for returning multiple values (e.g., `{:ok, result}`). `{1, "world"}`
*   **Maps:** Key-value stores. Keys can be any Elixir term. `%{name: "Alice", age: 30}`

### 1.3 Operators

Elixir has standard arithmetic (`+`, `-`, `*`, `/`, `div`, `rem`), comparison (`==`, `!=`, `<`, `>`, `<=`, `>=`), and boolean (`and`, `or`, `not`) operators.

The **pipe operator** (`|>`) is fundamental for functional composition, passing the result of one expression as the first argument to the next function.

```elixir
"  hello elixir  "
|> String.trim()
|> String.capitalize()
# => "Hello elixir"
```

### 1.4 Pattern Matching

Pattern matching is a core concept, used for assignment, function definition, and control flow. The `=` operator in Elixir is actually a match operator.

```elixir
# Simple assignment
a = 10

# Matching lists
[head | tail] = [1, 2, 3, 4] # head is 1, tail is [2, 3, 4]
[_, b, _] = [1, 2, 3]       # b is 2

# Matching tuples (often for function return values)
{:ok, user} = {:ok, "John Doe"} # user is "John Doe"
```

### 1.5 Control Flow

*   `if`/`unless`: For conditional execution.
    ```elixir
    if 5 > 2 do
      "True!"
    else
      "False!"
    end
    ```
*   `case`: Used for matching a value against multiple patterns.
    ```elixir
    case {:ok, "data"} do
      {:ok, data} -> "Success: #{data}"
      {:error, reason} -> "Failure: #{reason}"
      _ -> "Unknown response"
    end
    ```
*   `cond`: For multiple conditional expressions.
    ```elixir
    cond do
      1 == 2 -> "Never"
      2 == 2 -> "Always"
      true   -> "Default"
    end
    ```

## 2. Functions and Modules

Elixir is a functional language, and functions are central to its design.

### 2.1 Defining Functions

Functions are defined within modules using `def` (public) and `defp` (private).

```elixir
defmodule MyMath do
  def add(a, b) do
    a + b
  end

  def multiply(a, b), do: a * b # Shorthand for single-line functions
end

MyMath.add(1, 2)     # => 3
MyMath.multiply(3, 4) # => 12
```

### 2.2 Function Heads and Multiple Clauses

Elixir supports defining multiple function clauses with the same name and arity (number of arguments). The correct clause is chosen based on pattern matching the arguments.

```elixir
defmodule Greeter do
  def greet("Alice") do
    "Hello Alice!"
  end

  def greet(name) do
    "Hello #{name}!"
  end
end

Greeter.greet("Alice") # => "Hello Alice!" (first clause matches)
Greeter.greet("Bob")   # => "Hello Bob!"   (second clause matches)
```

### 2.3 Anonymous Functions

Functions that are not bound to a module or name, often passed as arguments or used inline. Defined with `fn -> end`.

```elixir
adder = fn a, b -> a + b end
adder.(1, 2) # => 3
```

## 3. Functional Programming Paradigms

Elixir strongly adheres to functional programming principles.

### 3.1 Immutability

As discussed, data is immutable. This simplifies reasoning about code, especially in concurrent systems, as there are no shared mutable states.

### 3.2 First-Class Functions

Functions can be treated like any other value: assigned to variables, passed as arguments, and returned from other functions.

### 3.3 Higher-Order Functions

Functions that take one or more functions as arguments or return a function as a result. `Enum.map/2`, `Enum.filter/2` are common examples.

```elixir
Enum.map([1, 2, 3], fn x -> x * 2 end) # => [2, 4, 6]
```

## 4. Concurrency Basics

Elixir builds on Erlang's battle-tested concurrency model using lightweight, isolated "processes." Elixir processes communicate via message passing (the "actor model"), not shared memory.

*   `spawn`: Creates a new Elixir process.
*   `send`: Sends a message to a process.
*   `receive`: Waits for messages.

```elixir
# Basic illustration of message passing
parent_pid = self() # Get current process PID

spawn(fn ->
  send(parent_pid, {:hello, "from child"})
end)

receive do
  {:hello, msg} -> IO.puts "Received: #{msg}"
after 1000 -> # Timeout after 1 second
  IO.puts "No message received within 1 second"
end
```

---

### **Quick Check / Exercise:**

1.  Explain the concept of immutability in Elixir and provide a short code example that demonstrates rebinding a variable name.
2.  Given a list `numbers = [1, 2, 3, 4, 5]`, use the `Enum.map/2` function and an anonymous function to return a new list where each number is squared.
3.  Write an Elixir `case` statement that checks if a variable `status` is `:ok`, `:error`, or any other atom, and prints an appropriate message for each (`"Operation successful!"`, `"An error occurred: [reason]"`, `"Unknown status"`).
