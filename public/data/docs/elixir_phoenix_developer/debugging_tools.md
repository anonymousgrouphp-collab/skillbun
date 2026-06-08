# Debugging & Observability Tools in Elixir

Debugging and observability are crucial skills for any developer, and Elixir provides a powerful suite of tools to help you understand, diagnose, and monitor your applications. This guide will cover the essential tools: `IEx` for interactive debugging, `IO.inspect` for quick peeking, `Logger` for structured application logging, and the Erlang `Observer` for deep runtime inspection of the Erlang Virtual Machine (BEAM).

## 1. Interactive Elixir (IEx)

`IEx` (Interactive Elixir) is Elixir's interactive shell, built on top of the Erlang shell. It's an indispensable tool for exploring code, testing snippets, and debugging running applications.

### Core Concepts

*   **Interactive Session:** Directly execute Elixir code.
*   **Application Context:** Can be started with your application loaded, allowing you to interact with its modules, functions, and processes.
*   **Debugging Features:** Provides tools like `binding/1` to inspect current variable bindings and `break!/2` to set breakpoints.

### Basic Usage

To start `IEx` with your Mix project:

```bash
iex -S mix
```

Once inside `IEx`, you can:

*   Evaluate expressions: `1 + 2`
*   Call functions from your modules: `MyApp.MyModule.my_function()`
*   Get help: `h()` or `h MyApp.MyModule.my_function`
*   Get information about a module/function: `i MyModule` or `i MyModule.my_function/2`
*   Recompile a module: `r MyModule`
*   Recompile all modules and restart: `recompile()`

### Debugging with `binding/1` and `break!/2`

For more advanced debugging, `IEx` provides specific functions:

*   `binding/1`: Returns a map of the current variable bindings.
*   `break!/2`: Sets a breakpoint in a module and function. When the execution reaches this breakpoint, `IEx` will open a new debug prompt.

**Example:**

Let's create a simple module `lib/my_app/calculator.ex`:

```elixir
# lib/my_app/calculator.ex
defmodule MyApp.Calculator do
  def add(a, b) do
    # You can place binding/1 here to inspect variables
    IO.puts "Adding #{a} and #{b}"
    result = a + b
    # binding() # Uncomment and run in iex to see variables
    result
  end
end
```

To use `break!/2` to debug `MyApp.Calculator.add/2`:

1.  Start `IEx` with your project: `iex -S mix`
2.  Set a breakpoint: `break! MyApp.Calculator, :add, 2`
3.  Call the function: `MyApp.Calculator.add(5, 3)`
4.  You will enter a new `iex(MyApp.Calculator) >` prompt. From here, you can:
    *   Inspect variables: `binding()`
    *   Step over: `next()`
    *   Continue execution: `continue()`
    *   Exit debugger: `respawn()`

## 2. `IO.inspect/2`

`IO.inspect/2` is a simple yet powerful function for "peeking" into values during runtime. It prints any value to the standard output and then returns that value, making it non-intrusive and ideal for quick inspections without altering program flow.

### Core Concepts

*   **Identity Function:** Returns the exact value it was given.
*   **Side Effect:** Its primary purpose is to print to `stdout` or `stderr`.
*   **Placement:** Can be placed almost anywhere in your code where you want to see an intermediate value.

### Basic Usage

```elixir
defmodule MyApp.Processor do
  def process_data(data) do
    data
    |> Map.put(:status, :processing)
    |> IO.inspect(label: "After adding status") # Prints and returns the map
    |> Map.put(:timestamp, System.monotonic_time())
    |> IO.inspect(label: "Final data")
  end
end

MyApp.Processor.process_data(%{id: 1, value: 100})
```

Output:

```
After adding status: %{id: 1, status: :processing, value: 100}
Final data: %{id: 1, status: :processing, timestamp: 1234567890123456, value: 100}
```

### Options

*   `:label` (string): Prepends a label to the output.
*   `:limit` (integer): Limits the number of items printed for collections (lists, maps, tuples).
*   `:pretty` (boolean): Formats the output for better readability (default `false` for `IO.inspect`, but often true in `IEx`).

## 3. `Logger`

Elixir's `Logger` application provides a robust and configurable logging framework for your applications. It's the standard way to emit structured log messages, helping you understand what your application is doing in production and debug issues from collected logs.

### Core Concepts

*   **Log Levels:** Defines the severity of a log message (e.g., `:debug`, `:info`, `:warn`, `:error`, `:critical`).
*   **Backends:** `Logger` can send log messages to various destinations (e.g., console, file, external services).
*   **Structured Logging:** Encourages logging data as key-value pairs for easier parsing and analysis.

### Default Log Levels

*   `:debug`
*   `:info` (default minimum level)
*   `:warn`
*   `:error`
*   `:critical`

### Basic Usage

```elixir
defmodule MyApp.Authenticator do
  def authenticate(user, pass) do
    if user == "admin" && pass == "secret" do
      Logger.info("User 'admin' authenticated successfully.")
      {:ok, "admin"}
    else
      Logger.warn("Failed authentication attempt for user '#{user}'.")
      {:error, :invalid_credentials}
    end
  end

  def process_payment(amount) when amount < 0 do
    Logger.error("Attempted to process a negative payment: #{amount}")
    {:error, :negative_amount}
  end
end

MyApp.Authenticator.authenticate("admin", "secret")
MyApp.Authenticator.authenticate("guest", "wrongpass")
MyApp.Authenticator.process_payment(-100)
```

### Configuration

You can configure `Logger` in your `config/config.exs` file. For example, to change the minimum log level:

```elixir
# config/config.exs
config :logger, level: :debug # Show debug messages
# config :logger,
#   backends: [:console, {LoggerFileBackend, path: "log/app.log"}]
```

## 4. Erlang Observer

The Erlang `Observer` is a graphical tool that provides a high-level overview and detailed inspection of a running Erlang Virtual Machine (BEAM). Since Elixir runs on the BEAM, `Observer` is an incredibly powerful tool for diagnosing performance issues, memory leaks, and process-related problems in Elixir applications.

### Core Concepts

*   **Graphical Interface:** A GUI for monitoring the BEAM.
*   **Runtime Metrics:** Displays real-time data about processes, memory usage, CPU load, and more.
*   **Inter-Node Inspection:** Can be used to observe applications running on remote BEAM nodes.

### How to Start

You can start `Observer` from an `IEx` session:

```elixir
iex -S mix
:observer.start()
```

This will open a new window showing the `Observer` interface.

### Key Features

*   **Load Charts:** Visualize CPU usage, memory, and I/O.
*   **Process Tab:** Lists all running processes (Elixir and Erlang), their states, memory consumption, and message queues. You can drill down into individual processes.
*   **Applications Tab:** Shows all running OTP applications.
*   **Memory Tab:** Detailed breakdown of memory usage.
*   **Table Viewer:** Inspect various internal tables and ETS tables.

### Use Cases

*   **Identify Bottlenecks:** Pinpoint processes consuming excessive CPU or memory.
*   **Detect Memory Leaks:** Monitor heap usage of processes over time.
*   **Understand Process Behavior:** See message queue lengths, reductions, and current function calls.
*   **Diagnose Deadlocks:** Observe blocked processes or processes with large message queues.

---

## Checklist/Exercises

1.  Start an `IEx` session with your project and use `IO.inspect` within a function to display an intermediate value, then try using `binding()` after setting a breakpoint with `break!/2`.
2.  Configure your application's `Logger` to output messages at the `:debug` level and verify that debug messages appear in your console.
3.  Launch the Erlang `Observer` from an `IEx` session, navigate to the "Processes" tab, and identify your running application's main supervision tree processes.