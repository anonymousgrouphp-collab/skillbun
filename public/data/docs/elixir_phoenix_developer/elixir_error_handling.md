## Error Handling & Control Flow in Elixir

Elixir, leveraging the Erlang VM, has a unique and robust approach to error handling and control flow, deeply intertwined with its functional programming paradigm and fault-tolerance principles. Understanding these concepts is crucial for building resilient Elixir applications.

### 1. Types of Errors and Signals

Elixir differentiates between various mechanisms for signaling unusual or problematic situations:

*   **Errors (Exceptions)**: These are runtime problems that typically indicate something went wrong beyond normal control flow. They are caught by `try/rescue`.
    *   Examples: `ArgumentError`, `FunctionClauseError`, `BadMapError`, `KeyError`.
*   **Exits**: A mechanism for processes to terminate or signal other processes to terminate. These are signals, not errors in the traditional sense, but can be caught by `try/catch`.
    *   Example: `exit(:reason)`.
*   **Throws**: A less common mechanism for non-local returns, primarily used when pattern matching with `case` or `with` is not suitable, or for breaking out of deeply nested structures. They are caught by `try/catch`.
    *   Example: `throw(:value)`.

### 2. Standard Control Flow for Expected Outcomes

Elixir's idiomatic way of handling expected variations in outcomes, including potential 'error' states, is through pattern matching and tuple returns (`{:ok, result}` / `{:error, reason}`).

#### 2.1. `case` Expressions

The `case` expression allows you to match a value against a series of patterns. It's fundamental for branching logic based on the outcome of an operation.

```elixir
def divide(a, b) do
  case b do
    0 -> {:error, "cannot divide by zero"}
    _ -> {:ok, a / b}
  end
end

case divide(10, 2) do
  {:ok, result} -> IO.puts("Result: #{result}") # Result: 5.0
  {:error, reason} -> IO.puts("Error: #{reason}")
end

case divide(10, 0) do
  {:ok, result} -> IO.puts("Result: #{result}")
  {:error, reason} -> IO.puts("Error: #{reason}") # Error: cannot divide by zero
end
```

#### 2.2. `with` Special Form

The `with` special form is designed to handle a sequence of operations where each step might return an `{:ok, value}` or an `{:error, reason}` tuple. It allows for a concise way to handle success paths while short-circuiting on the first `{:error, reason}`.

```elixir
def process_data(data) do
  with {:ok, parsed_data} <- parse(data),
       {:ok, validated_data} <- validate(parsed_data),
       {:ok, saved_result} <- save(validated_data)
  do
    {:ok, saved_result}
  else
    {:error, reason} -> {:error, "Failed at some step: " <> reason}
    _ -> {:error, "An unexpected error occurred"}
  end
end

def parse("valid_data"), do: {:ok, "parsed_valid_data"}
def parse(_), do: {:error, "parsing failed"}

def validate("parsed_valid_data"), do: {:ok, "validated_data"}
def validate(_), do: {:error, "validation failed"}

def save("validated_data"), do: {:ok, "saved_successfully"}
def save(_), do: {:error, "save failed"}

IO.inspect(process_data("valid_data")) # {:ok, "saved_successfully"}
IO.inspect(process_data("invalid_data")) # {:error, "Failed at some step: parsing failed"}
```

### 3. Handling Exceptions and Special Control Flow

While `case` and `with` handle expected outcomes, `raise`, `try/rescue`, `throw`, `exit`, and `try/catch` are used for less common or more drastic control flow.

#### 3.1. `raise`

`raise` is used to generate an exception (an `Error`). This should typically be reserved for truly exceptional and unrecoverable situations where the program cannot reasonably proceed.

```elixir
def do_something_critical(value) do
  if value == nil do
    raise ArgumentError, message: "Value cannot be nil"
  else
    # ... proceed with logic
    {:ok, "processed"}
  end
end

# This would crash the process if not handled by a supervisor or try/rescue
# do_something_critical(nil)
```

#### 3.2. `try/rescue`

`try/rescue` blocks are used to explicitly catch exceptions (`Error`) raised by `raise` or by the runtime (e.g., `FunctionClauseError`). It's generally advised to use `try/rescue` sparingly and mostly at process boundaries or for interoperability with external systems that might raise exceptions.

```elixir
def safe_critical_operation(value) do
  try do
    do_something_critical(value)
  rescue
    e in ArgumentError ->
      IO.puts("Caught an ArgumentError: #{e.message}")
      {:error, :invalid_argument}
    e in _ -> # Catch all other errors
      IO.puts("Caught an unexpected error: #{inspect(e)}")
      {:error, :unexpected_error}
  end
end

IO.inspect(safe_critical_operation(123)) # {:ok, "processed"}
IO.inspect(safe_critical_operation(nil)) # Caught an ArgumentError: Value cannot be nil, then {:error, :invalid_argument}
```

#### 3.3. `throw` and `try/catch`

`throw` is an Erlang-inherited mechanism for non-local returns. It allows you to jump out of a computation early with a specific value. `try/catch` is used to intercept these `throw` values, as well as `exit` signals.

`throw` is rarely used in modern Elixir, as `with` and `case` with `{:ok, :error}` tuples often provide a more readable and functional alternative.

```elixir
def find_first_even(list) do
  try do
    for x <- list do
      if rem(x, 2) == 0 do
        throw(x)
      end
    end
    :no_even_found
  catch
    val -> val # Catches the thrown value
  end
end

IO.puts(find_first_even([1, 3, 5, 2, 4])) # 2
IO.puts(find_first_even([1, 3, 5]))     # :no_even_found
```

#### 3.4. `exit` and `try/catch`

`exit` is primarily used to terminate a process or signal another process to terminate. While `exit` usually leads to a process crash (which supervisors handle), it can also be caught by `try/catch`. This is less common in application logic and more related to process supervision and linked processes.

```elixir
def handle_exit_signal do
  try do
    # Simulate a critical failure that would normally crash a process
    exit(:shutdown_reason)
    IO.puts("This line will not be reached")
  catch
    :exit, reason ->
      IO.puts("Caught exit signal with reason: #{inspect(reason)}")
      {:error, :process_exited}
    _ ->
      IO.puts("Caught something else")
      {:error, :unexpected_catch}
  end
end

IO.inspect(handle_exit_signal()) # Caught exit signal with reason: :shutdown_reason, then {:error, :process_exited}
```

### 4. Best Practices

*   **Prefer tuple returns (`{:ok, result}` / `{:error, reason}`)**: This is the idiomatic Elixir way to handle expected success and failure paths. It forces explicit handling of outcomes and is highly composable.
*   **Use `case` and `with`**: For structured control flow based on these tuple returns.
*   **Reserve `raise` for exceptional, unrecoverable errors**: Situations where the program cannot reasonably continue or recover locally. Let supervisors handle these process crashes.
*   **Use `try/rescue` sparingly**: Primarily at API boundaries or when interacting with libraries that raise exceptions, to convert exceptions into `{:error, reason}` tuples.
*   **Avoid `throw` and `try/catch` for general error handling**: They are powerful but less readable and can lead to less predictable control flow compared to pattern matching.

### Quick Checklist/Exercise:

1.  **Refactor with `with`**: Given a series of functions `step1/0`, `step2/1`, `step3/1` that all return `{:ok, value}` or `{:error, reason}`, write a function that composes them using `with` and returns the final `{:ok, result}` or `{:error, accumulated_reason}`.
2.  **Distinguish `raise` vs. `{:error, reason}`**: Explain when you would use `raise ArgumentError` versus returning `{:error, "invalid argument"}` from a function.
3.  **Identify `try/catch` use case**: Provide a scenario where `try/catch` would be legitimately more suitable than `case` or `with` for handling control flow (e.g., breaking out of deeply nested `for` comprehensions or handling `exit` signals from specific process interactions).
