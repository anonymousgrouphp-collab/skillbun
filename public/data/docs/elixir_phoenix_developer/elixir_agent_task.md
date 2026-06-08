# Agent & Task Behaviors in Elixir

Elixir's concurrency model, built on top of the Erlang VM, provides powerful tools for building fault-tolerant, distributed applications. `Agent` and `Task` are two fundamental abstractions that simplify common concurrency patterns: managing state and performing asynchronous computations.

## 1. Agent: Simple State Management

An `Agent` is a simple wrapper around a stateful process. It provides a convenient way to manage shared mutable state in a concurrent environment, ensuring that state updates are sequential and race conditions are avoided. Agents are perfect for scenarios where you need a single, shared piece of data that multiple processes might read from or write to.

### Core Concepts:

*   **State:** An `Agent` holds an internal state, which can be any Elixir term.
*   **Synchronous Access:** All interactions with an `Agent` are synchronous from the caller's perspective (though the Agent process itself might be busy).
*   **Single Writer Principle:** Only the `Agent` process itself modifies its state, ensuring atomicity and preventing race conditions.

### Key Functions:

*   `Agent.start_link(fun, initial_state, options \ [])`: Starts a new `Agent` process. `fun` is a 0-arity function that returns the initial state.
*   `Agent.update(pid, fun, timeout \ 5000)`: Updates the `Agent`'s state. `fun` is a 1-arity function that takes the current state and returns the new state.
*   `Agent.get(pid, fun, timeout \ 5000)`: Retrieves information from the `Agent`'s state. `fun` is a 1-arity function that takes the current state and returns the value to be returned to the caller.
*   `Agent.stop(pid, reason \ :normal, timeout \ 5000)`: Stops the `Agent` process.

### Code Example: A Simple Counter

Let's create an Agent that acts as a global counter.

```elixir
defmodule MyCounter do
  def start_link do
    Agent.start_link(fn -> 0 end, name: __MODULE__)
  end

  def increment do
    Agent.update(__MODULE__, fn count -> count + 1 end)
  end

  def get do
    Agent.get(__MODULE__, fn count -> count end)
  end

  def reset do
    Agent.update(__MODULE__, fn _ -> 0 end)
  end
end

# Usage:
# Start the counter
{:ok, _pid} = MyCounter.start_link()

IO.puts("Initial count: #{MyCounter.get()}")

# Increment a few times
MyCounter.increment()
MyCounter.increment()
IO.puts("Count after increments: #{MyCounter.get()}")

# Reset the counter
MyCounter.reset()
IO.puts("Count after reset: #{MyCounter.get()}")

# In a real application, stopping is often handled by a supervision tree
# Agent.stop(MyCounter)
```

## 2. Task: One-Off Asynchronous Computations

A `Task` is a simple abstraction for running a one-off, asynchronous computation in a separate process. It's ideal for offloading work that doesn't need to block the current process, such as long-running calculations, API calls, or file operations. Tasks are lightweight and don't manage state in the same way Agents do; their primary purpose is to run a function and potentially return its result.

### Core Concepts:

*   **Asynchronous:** The caller doesn't wait for the `Task` to complete immediately.
*   **One-off:** Tasks are typically started, perform their work, and then terminate.
*   **Result Retrieval:** You can "await" the result of a `Task` when you need it.

### Key Functions:

*   `Task.start(fun)`: Starts a `Task` in a new process, executing `fun`. Returns `{:ok, pid}`.
*   `Task.start_link(fun)`: Same as `start/1` but links the `Task` process to the caller. Returns `{:ok, pid}`. This is generally preferred for supervision.
*   `Task.async(fun)`: Starts a `Task` and immediately returns a `Task` struct. The caller can then `await` the result.
*   `Task.await(task, timeout \ 5000)`: Waits for the `Task` to complete and returns its result.
*   `Task.yield(task, timeout \ 5000)`: Similar to `await`, but allows you to retrieve results from multiple `Task.async` calls more efficiently.

### Code Example: Asynchronous Computation

Let's simulate a long-running computation using `Task`.

```elixir
defmodule MyProcessor do
  def expensive_calculation(a, b) do
    # Simulate a delay
    Process.sleep(2000)
    a * b
  end

  def fetch_data(url) do
    Process.sleep(1000) # Simulate network latency
    "Data from #{url} processed."
  end
end

# Using Task.start_link and manually awaiting
IO.puts("Starting calculation...")
{:ok, pid} = Task.start_link(fn -> MyProcessor.expensive_calculation(10, 20) end)
IO.puts("Calculation started, doing other work...")
# ... do other things ...
result = Task.await(pid, :infinity)
IO.puts("Calculation finished: #{result}")

# Using Task.async and Task.await (more idiomatic for local use)
IO.puts("Starting multiple tasks with Task.async...")
task1 = Task.async(fn -> MyProcessor.fetch_data("api.example.com/users") end)
task2 = Task.async(fn -> MyProcessor.expensive_calculation(5, 7) end)

IO.puts("Tasks started, waiting for results...")

# Await results
result1 = Task.await(task1)
result2 = Task.await(task2)

IO.puts("Result 1: #{result1}")
IO.puts("Result 2: #{result2}")
```

## 3. Differences and When to Use Which

| Feature          | Agent                                  | Task                                       |
| :--------------- | :------------------------------------- | :----------------------------------------- |
| **Purpose**      | Managing state, shared mutable data    | One-off asynchronous computation           |
| **Lifetime**     | Long-lived, manages state across calls | Short-lived, terminates after computation  |
| **Return Value** | The result of `get` or `update` callback | The final value of the executed function   |
| **Complexity**   | More structured for state management   | Simpler, fire-and-forget or async-await    |
| **Fault-Tolerance** | Can be part of a supervision tree    | Can be linked and supervised, but transient |

*   **Use `Agent` when:**
    *   You need to maintain a state that needs to be accessed and modified by multiple processes.
    *   You need a simple key-value store or a counter.
    *   You require atomic updates to shared data.
*   **Use `Task` when:**
    *   You need to run a function asynchronously without blocking the current process.
    *   You have a long-running computation, an API call, or an I/O operation that you want to parallelize or offload.
    *   You just need the result of a function, not ongoing state management.

## Checklist/Exercise:

1.  Describe a scenario where `Agent` would be a more suitable choice than `Task` for managing concurrent operations.
2.  Explain the primary difference between `Task.start_link/1` and `Task.async/1`. When would you choose one over the other?
3.  Write a simple Elixir module that uses `Agent` to manage a list of logged-in user IDs, allowing adding and removing users.
