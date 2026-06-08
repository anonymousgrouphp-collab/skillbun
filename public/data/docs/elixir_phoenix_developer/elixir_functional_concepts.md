## Functional Programming Concepts

Functional Programming (FP) is a programming paradigm that treats computation as the evaluation of mathematical functions and avoids changing state and mutable data. It emphasizes immutability, pure functions, recursion, higher-order functions, and the pipe operator, leading to more predictable, maintainable, and concurrent code.

### 1. Immutability

**Concept:** In functional programming, data cannot be changed after it's created. Once a value is assigned, it remains constant. Instead of modifying existing data structures, new ones are created with the desired changes.

**Benefits:**
*   **Predictability:** Easier to reason about code as data state doesn't change unexpectedly.
*   **Concurrency:** Eliminates race conditions and simplifies parallel processing since multiple threads can safely read the same data without fear of modification.

**Elixir Context:** Elixir variables are immutable. Re-assigning a variable actually creates a new binding, rather than mutating the original value.

```elixir
# Original value
x = 10
IO.puts("Initial x: #{x}") # Output: Initial x: 10

# 'Re-assigning' x creates a new binding, the original 10 is untouched
x = x + 5
IO.puts("New x: #{x}")    # Output: New x: 15

# Illustrating immutability with lists (creating a new list)
list = [1, 2, 3]
IO.inspect(list) # Output: [1, 2, 3]

# Adding an element creates a *new* list
new_list = [0 | list]
IO.inspect(list)     # Original list is unchanged: [1, 2, 3]
IO.inspect(new_list) # New list: [0, 1, 2, 3]
```

### 2. Pure Functions

**Concept:** A pure function is a function that, given the same inputs, will always return the same output and produce no side effects.

**Characteristics:**
*   **Deterministic:** Always returns the same output for the same inputs.
*   **No Side Effects:** Does not modify any external state, perform I/O operations (like writing to files, printing to console), or interact with the outside world in any observable way other than returning a value.

**Benefits:**
*   **Testability:** Easy to test as outputs are predictable.
*   **Composability:** Can be combined confidently, knowing they won't interfere with each other.
*   **Parallelism:** Can be executed in parallel without needing locks or complex synchronization.

```elixir
# Pure function example
def add(a, b) do
  a + b
end

IO.puts(add(2, 3)) # Output: 5
IO.puts(add(2, 3)) # Output: 5 (always the same result for same input)

# Impure function example (has a side effect)
def print_and_add(a, b) do
  IO.puts("Adding #{a} and #{b}") # Side effect: printing to console
  a + b
end

print_and_add(2, 3) # Output: Adding 2 and 3
                    #          5
```

### 3. Recursion

**Concept:** Recursion is a technique where a function calls itself to solve a smaller version of the same problem until a base case is reached. It's often used in functional programming as an alternative to loops for iteration.

**Elixir Context:** Elixir embraces recursion, especially with pattern matching, to handle iterative processes.

```elixir
# Example: Calculating factorial using recursion
defmodule Math do
  def factorial(0), do: 1 # Base case
  def factorial(n) when n > 0, do: n * factorial(n - 1) # Recursive step
end

IO.puts(Math.factorial(5)) # Output: 120 (5 * 4 * 3 * 2 * 1)
```

### 4. Higher-Order Functions (HOFs)

**Concept:** Higher-Order Functions are functions that can either take one or more functions as arguments, or return a function as their result. They enable powerful abstractions and make code more concise and expressive.

**Elixir Context:** Elixir's `Enum` module is full of HOFs (`map`, `filter`, `reduce`, etc.) that operate on collections using anonymous functions.

```elixir
# Example: Using Enum.map (a HOF) to transform a list
numbers = [1, 2, 3, 4]

# Takes an anonymous function (fn n -> n * 2 end) as an argument
doubled_numbers = Enum.map(numbers, fn n -> n * 2 end)
IO.inspect(doubled_numbers) # Output: [2, 4, 6, 8]

# Example: Using Enum.filter (a HOF) to select elements
even_numbers = Enum.filter(numbers, fn n -> rem(n, 2) == 0 end)
IO.inspect(even_numbers) # Output: [2, 4]
```

### 5. Pipe Operator (`|>`) 

**Concept:** The pipe operator (`|>`) takes the result of the expression on its left-hand side and passes it as the first argument to the function call on its right-hand side. It's syntactic sugar that enhances readability by allowing you to chain function calls in a clear, sequential flow, mimicking how data flows through a series of transformations.

**Benefits:**
*   **Readability:** Makes complex data transformations easier to read and understand from left-to-right, top-to-bottom.
*   **Clarity:** Reduces the need for nested function calls, which can be hard to decipher.

```elixir
# Without the pipe operator (nested calls)
result_nested = String.trim(String.upcase(String.replace(" hello elixir ", "elixir", "world")))
IO.puts(result_nested) # Output: HELLO WORLD

# With the pipe operator (sequential flow)
result_piped = " hello elixir "
             |> String.replace("elixir", "world")
             |> String.upcase()
             |> String.trim()

IO.puts(result_piped) # Output: HELLO WORLD

# Combining with HOFs
[1, 2, 3, 4, 5]
|> Enum.map(fn n -> n * n end)      # Square each number
|> Enum.filter(fn n -> rem(n, 2) != 0 end) # Keep only odd numbers
|> Enum.sum()                         # Sum the remaining numbers
|> IO.inspect()                     # Output: 35 (1*1 + 3*3 + 5*5 = 1 + 9 + 25 = 35)
```

---

### Quick Check / Exercise:

1.  **Immutability:** Explain why `x = 10` followed by `x = x + 5` in Elixir does *not* mutate the original value `10`.
2.  **Pure Functions:** Write a small Elixir function that determines if a number is even, ensuring it is a pure function. Why is `IO.puts()` not allowed in a pure function?
3.  **Pipe Operator & HOFs:** Using the pipe operator, write an Elixir expression that takes a list of strings, converts each string to uppercase, filters out any strings shorter than 5 characters, and then joins the remaining strings with a space. Example input: `["apple", "banana", "cat", "doggy", "elephant"]`.
