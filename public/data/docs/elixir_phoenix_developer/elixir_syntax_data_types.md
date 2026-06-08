# Elixir: Syntax, Data Types & Pattern Matching

Elixir, a dynamic, functional language running on the Erlang VM, offers a unique approach to building scalable and maintainable applications. Understanding its fundamental syntax, core data types, and the powerful concept of pattern matching is crucial for any aspiring Elixir developer.

## 1. Elixir Basic Syntax

Elixir's syntax is clean and concise, often leveraging the pipe operator `|>` for readability.

### Modules and Functions
Code in Elixir is organized into modules, which group related functions. Functions are defined using `def`.

```elixir
defmodule MyModule do
  # A single-line comment
  def greet(name) do
    "Hello, " <> name <> "!"
  end

  # A function without arguments
  def say_hello do
    "Hello Elixir!"
  end
end

# Calling a function
MyModule.greet("Alice")
#=> "Hello, Alice!"
```

### `do/end` Blocks
Many Elixir constructs (modules, functions, conditionals) use `do` and `end` to delineate blocks of code. For single-line functions or simple expressions, a shorthand `do: expression` is often used.

### Comments
Comments start with a hash `#` and extend to the end of the line.

## 2. Core Data Types

Elixir provides a rich set of data types, each with specific uses and characteristics.

### Atoms
Atoms are constants where their name is their value. They are often used to represent distinct, self-identifying values, similar to symbols in Ruby or enums in other languages. They start with a colon `:`. They are commonly used for map keys or return values indicating success/failure.

```elixir
:ok
#=> :ok

:error
#=> :error

%{:status => :success, :data => 123}
#=> %{data: 123, status: :success}
```

### Tuples
Tuples are ordered, fixed-size collections of elements. They are often used to return multiple values from a function, especially for `{:ok, value}` or `{:error, reason}` patterns.

```elixir
# A tuple containing an atom, an integer, and a string
{:user, 1, "John Doe"}
#=> {:user, 1, "John Doe"}

# Used in function returns
{:ok, "Data loaded"}
#=> {:ok, "Data loaded"}
```

### Lists
Lists are ordered collections of elements, allowing for dynamic sizing. They are implemented as linked lists, making head and tail operations efficient. They are denoted by square brackets `[]`.

```elixir
[1, 2, 3]
#=> [1, 2, 3]

["apple", "banana", "cherry"]
#=> ["apple", "banana", "cherry"]

# Head and tail pattern matching
[head | tail] = [1, 2, 3]
head #=> 1
tail #=> [2, 3]
```

### Maps
Maps are key-value stores. Keys can be any Elixir term, but atoms are commonly used. Maps are defined using `%{}`, and when keys are atoms, a shorthand `key: value` syntax can be used.

```elixir
# Map with string keys
%{"name" => "Alice", "age" => 30}
#=> %{"age" => 30, "name" => "Alice"}

# Map with atom keys (common shorthand)
%{name: "Bob", age: 25, city: "New York"}
#=> %{age: 25, city: "New York", name: "Bob"}

# Accessing values
user = %{name: "Charlie", age: 40}
user[:name]
#=> "Charlie"
```

### Other Basic Types
- **Integers and Floats:** Standard numerical types (`1`, `3.14`).
- **Booleans:** `true` and `false`.
- **Strings:** UTF-8 encoded binaries, denoted by double quotes (`"hello Elixir"`).

## 3. The Power of Pattern Matching

Pattern matching is one of Elixir's most distinctive and powerful features. It's not just an assignment operator; it's a comparison mechanism that allows you to match against the structure and values of data.

### Assignment Operator (`=`)
The `=` operator in Elixir is a match operator. It attempts to match the pattern on the left with the value on the right.

```elixir
# Simple assignment
x = 1
#=> 1

# Matching a list structure
[a, b, c] = [10, 20, 30]
a #=> 10
b #=> 20
c #=> 30

# Matching a tuple structure
{:ok, result} = {:ok, "Success!"}
result #=> "Success!"

# Matching failure (raises an error)
# [x, y] = [1]
# ** (MatchError) no match of right hand side value: [1]
```

### Function Head Pattern Matching
Elixir functions can have multiple clauses, and the correct clause is chosen based on the pattern of the arguments. This allows for elegant handling of different input types or states.

```elixir
defmodule Greeter do
  def greet("Alice") do
    "Hello, Alice! Special greeting!"
  end

  def greet(name) when is_binary(name) do
    "Hello, #{name}!"
  end

  def greet(_) do
    "Hello, unknown person!"
  end
end

Greeter.greet("Alice")
#=> "Hello, Alice! Special greeting!"
Greeter.greet("Bob")
#=> "Hello, Bob!"
Greeter.greet(123)
#=> "Hello, unknown person!"
```

### `case` Expressions
The `case` expression allows you to match a value against several patterns and execute the code block corresponding to the first match.

```elixir
def categorize_input(input) do
  case input do
    {:ok, data} when is_integer(data) -> "Successful integer data: #{data}"
    {:ok, _} -> "Successful non-integer data"
    {:error, reason} -> "Failed with reason: #{reason}"
    _ -> "Unhandled input type"
  end
end

categorize_input({:ok, 10})
#=> "Successful integer data: 10"
categorize_input({:ok, "text"})
#=> "Successful non-integer data"
categorize_input({:error, :invalid_input})
#=> "Failed with reason: invalid_input"
```

### Pin Operator (`^`)
The pin operator `^` prevents a variable from being rebound during pattern matching. Instead, it uses the variable's *current* value for the match.

```elixir
x = 10
#=> 10

# This matches, as the current value of x (10) matches 10
^x = 10
#=> 10

# This fails, as the current value of x (10) does not match 20
# ^x = 20
# ** (MatchError) no match of right hand side value: 20

# Useful in maps for updating a specific key's value based on its old value
old_map = %{a: 1, b: 2}
new_map = %{old_map | a: ^old_map.a + 1}
new_map
#=> %{a: 2, b: 2}
```

--- 

### Quick Check / Exercise

1.  What is the fundamental difference between an Elixir `list` and a `tuple` in terms of their structure and typical use cases?
2.  Write a short Elixir function `get_status_message(status_tuple)` that uses pattern matching to return `"Success!"` if the input is `{:ok, _}` and `"Failed: [reason]"` if the input is `{:error, reason}`.
3.  Explain how the `^` (pin) operator changes the behavior of the assignment operator (`=`) during pattern matching, providing a simple code example.
