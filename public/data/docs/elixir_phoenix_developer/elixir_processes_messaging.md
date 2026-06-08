# Elixir Processes & Message Passing

Elixir's superpower lies in its approach to concurrency, built upon the Erlang VM's robust process model. Unlike operating system threads, Elixir processes are incredibly lightweight, isolated, and communicate through message passing, making concurrent and distributed programming significantly easier and more fault-tolerant.

## 1. Understanding Elixir Processes

At its heart, an Elixir process is an independent execution unit. Think of it as a tiny, isolated computer program running within your Elixir application.

*   **Lightweight:** You can easily run hundreds of thousands, or even millions, of Elixir processes on a single machine. They consume minimal memory and CPU.
*   **Isolated:** Each process has its own state and memory. Processes do not share memory; they communicate by sending copies of data. This isolation prevents common concurrency bugs like race conditions and deadlocks.
*   **Concurrent:** Processes run concurrently, meaning they can appear to execute at the same time, leveraging multiple CPU cores efficiently.
*   **Fault-Tolerant:** If one process crashes, it doesn't bring down the entire system. Other processes continue to run, and supervision trees can restart failed processes automatically.

## 2. Message Passing: The Communication Backbone

Processes in Elixir communicate *asynchronously* by sending messages to each other's "mailboxes." Each process has a mailbox where incoming messages are queued.

When a process sends a message:
1.  The sender specifies the destination process's unique identifier (PID).
2.  The message (a copy of the data) is placed in the receiver's mailbox.
3.  The sender doesn't wait for a reply and can continue its execution immediately.

## 3. Core Primitives for Process Management

Elixir provides a few fundamental functions to work with processes and message passing:

### `spawn/1` and `spawn/3`: Creating New Processes

The `spawn` function creates a new Elixir process and returns its Process ID (PID).

*   `spawn(function)`: Spawns a new process that will execute the given nullary anonymous function.
*   `spawn(module, function, args)`: Spawns a new process that will execute `module.function(args)`.

**Example:**
```elixir
# Spawning with an anonymous function
pid = spawn(fn -> IO.puts("Hello from a new process!") end)
IO.puts("Spawned process with PID: #{inspect(pid)}")

# Spawning with a named function (assuming a module MyWorker exists)
# defmodule MyWorker do
#   def greet(name) do
#     IO.puts("Hello, #{name} from MyWorker!")
#   end
# end
# pid = spawn(MyWorker, :greet, ["Alice"])
```

### `send/2`: Sending Messages

The `send` function transmits a message to a specific process.

*   `send(pid, message)`: Sends `message` to the process identified by `pid`. The `message` can be any Elixir term.

**Example:**
```elixir
# Assuming `receiver_pid` is the PID of another process
send(receiver_pid, {:my_message, "data payload"})
```

### `receive/1`: Receiving Messages

The `receive` block is used by a process to wait for and process messages from its mailbox. It uses pattern matching, similar to `case` statements, to handle different types of messages.

```elixir
receive do
  {:message_type, content} ->
    # Handle this type of message
    IO.puts("Received a message: #{content}")
  :ping ->
    # Handle a "ping" message
    IO.puts("Got a ping!")
  _ ->
    # Catch-all for other messages
    IO.puts("Received an unhandled message.")
after
  5000 -> # Optional: Timeout clause in milliseconds
    IO.puts("No message received in 5 seconds.")
end
```
Messages are consumed from the mailbox only when a pattern matches. If no pattern matches, the message remains in the mailbox for future `receive` calls.

## 4. Code Example: An Echo Server Process

Let's illustrate these concepts with a simple echo server process.

```elixir
defmodule EchoServer do
  def start_link do
    spawn(fn -> loop() end)
  end

  defp loop do
    receive do
      {:echo, sender_pid, message} ->
        IO.puts("EchoServer received: #{message}")
        send(sender_pid, {:response, "Echo: #{message}"})
        loop() # Continue looping to receive more messages
      _ ->
        IO.puts("EchoServer received an unknown message.")
        loop()
    end
  end
end

# --- Usage Example ---
# Start the echo server
echo_server_pid = EchoServer.start_link()
IO.puts("Echo server started with PID: #{inspect(echo_server_pid)}")

# Send a message to the echo server from the current process (self())
send(echo_server_pid, {:echo, self(), "Hello, Elixir!"})

# The current process then waits for a response
receive do
  {:response, reply} ->
    IO.puts("Client received: #{reply}")
  _ ->
    IO.puts("Client received an unexpected message.")
end

# Example with a timeout
send(echo_server_pid, {:echo, self(), "Another message!"})

receive do
  {:response, reply} ->
    IO.puts("Client received: #{reply}")
after
  2000 -> # Wait up to 2 seconds
    IO.puts("Client timed out waiting for a response.")
end
```
In this example:
*   `EchoServer.start_link/0` spawns a new process that runs the `loop/0` function.
*   `loop/0` continuously waits for messages using `receive`.
*   When it receives a message of the form `{:echo, sender_pid, message}`, it prints the message and `send`s a response back to the `sender_pid`.
*   The `loop()` call at the end makes the server process recursive, enabling it to handle subsequent messages.
*   The `self()` function returns the PID of the current process, allowing the echo server to know where to send its reply.

## 5. Quick Check / Exercise

1.  **True or False:** Elixir processes share memory, which can lead to race conditions.
2.  Write a simple Elixir process that, when spawned, prints its own PID, then waits for a message `{:greet, name}` and prints "Hello, `name` from PID `[self()]`!".
3.  Explain the purpose of the `after` clause in a `receive` block.