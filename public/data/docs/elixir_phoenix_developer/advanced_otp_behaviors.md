# Advanced OTP Behaviors: GenStage and GenRegistry

This guide explores `GenStage` for building robust data processing pipelines and the concept of `GenRegistry` for distributed named processes in Elixir.

## 1. GenStage: Building Data Processing Pipelines

`GenStage` is an OTP behavior for defining producer-consumer data pipelines with built-in backpressure. It's designed for scenarios where data flows through a series of stages, and you need reliable, concurrent processing without overwhelming any single stage.

### Core Concepts

*   **Producers**: Generate events (data) and send them to consumers.
*   **Consumers**: Receive events from producers and process them.
*   **Producer-Consumers**: Act as both a consumer (receiving events from an upstream producer) and a producer (transforming and emitting new events to downstream consumers).
*   **Demand-Driven Backpressure**: Consumers explicitly ask for events from producers. This prevents producers from flooding consumers, ensuring efficient resource utilization and preventing bottlenecks. Consumers specify how many events they are ready to handle, allowing the pipeline to self-regulate.

### Use Cases

*   Event sourcing and processing
*   Real-time data transformation
*   Building streaming APIs
*   ETL (Extract, Transform, Load) pipelines

### GenStage Example: A Simple Producer and Consumer

Let's create a producer that generates numbers and a consumer that squares them.

```elixir
# lib/my_app/number_producer.ex
defmodule MyApp.NumberProducer do
  use GenStage

  def start_link(initial_number \ 0, opts \ []) do
    GenStage.start_link(__MODULE__, initial_number, opts)
  end

  @impl true
  def init(initial_number) do
    {:producer, initial_number}
  end

  @impl true
  def handle_demand(demand, current_number) do
    # Generate events based on demand
    events = for n <- current_number..(current_number + demand - 1), do: n
    new_number = current_number + demand
    {:noreply, events, new_number}
  end
end

# lib/my_app/number_consumer.ex
defmodule MyApp.NumberConsumer do
  use GenStage

  def start_link(opts \ []) do
    GenStage.start_link(__MODULE__, :ok, opts)
  end

  @impl true
  def init(:ok) do
    # Consumer starts by asking for 10 events
    {:consumer, :ok, subscribe_to: [{MyApp.NumberProducer, max_demand: 10}]}
  end

  @impl true
  def handle_events(events, _from, state) do
    # Process received events
    squared_numbers = Enum.map(events, &(&1 * &1))
    IO.puts "Consumer received and squared: #{inspect(events)} -> #{inspect(squared_numbers)}"
    # After processing, demand more events
    {:noreply, [], state}
  end
end

# To run in an IEx session:
# {:ok, producer_pid} = MyApp.NumberProducer.start_link()
# {:ok, consumer_pid} = MyApp.NumberConsumer.start_link()
# This will start the pipeline, and the consumer will begin requesting numbers.
```

## 2. GenRegistry: Distributed Named Processes

The term `GenRegistry` in the context of advanced OTP behaviors often refers to the *concept* of a distributed process registry, rather than a specific `GenRegistry` OTP behavior module as commonly used with `GenServer` or `GenStage`. Elixir's `Registry` module is a *local* process registry, invaluable for naming and looking up processes within a single node. For *distributed named processes*, where you need to register and look up processes across multiple nodes in an Erlang cluster, you typically combine `Registry` with other mechanisms or use specialized libraries.

### The Need for Distributed Registries

In a distributed system, processes running on different nodes need a way to find each other by a meaningful name, rather than just their process ID (PID), which is node-specific. A distributed registry provides a global mapping of names to PIDs, allowing services to discover and communicate with each other regardless of their physical location within the cluster.

### Common Approaches for Distributed Named Processes

1.  **`Registry` + `pg` (Process Groups)**: While `Registry` is local, you can use it in conjunction with `pg` (from `kernel` OTP application) or `Phoenix.PubSub` to manage groups of processes across a cluster. `pg` allows you to broadcast messages to all members of a named group, which can implicitly achieve a form of distributed naming if each process registers itself under a specific name locally and then joins a `pg` group for coordination.

2.  **`gproc` Library**: A popular third-party library that provides a global process registry, allowing you to register processes by arbitrary terms (atoms, tuples, PIDs) and look them up from any node in the cluster. It also offers advanced features like property lists, counters, and global locks.

3.  **Custom Solutions**: For highly specific needs, developers might implement custom distributed registries using `GenServer`s, relying on Erlang's built-in distribution capabilities (e.g., `Node.monitor/2`, `:net_kernel.monitor_nodes/1`) to maintain a consistent state across nodes.

### Example: Simulating a Distributed Registry with `gproc`

`gproc` simplifies distributed naming significantly. First, add `{:gproc, "~> 0.8"}` to your `mix.exs` dependencies.

```elixir
# In your application start function (e.g., application.ex)
def start(_type, _args) do
  # Ensure gproc is started before other processes rely on it
  Gproc.start_link()
  # ... other supervision tree setup ...
end

# lib/my_app/worker.ex
defmodule MyApp.Worker do
  use GenServer

  def start_link(name, opts \ []) do
    GenServer.start_link(__MODULE__, name, name: via_gproc(name))
  end

  def via_gproc(name), do: {:global, {MyApp.Worker, name}}

  @impl true
  def init(name) do
    IO.puts "Worker #{name} started on node #{Node.self()}"
    {:ok, name}
  end

  def do_work(name, data) do
    GenServer.call(via_gproc(name), {:do_work, data})
  end

  @impl true
  def handle_call({:do_work, data}, _from, state) do
    IO.puts "Worker #{state} on node #{Node.self()} processing: #{data}"
    {:reply, :ok, state}
  end
end

# To run in an IEx session (start two nodes, e.g., using `iex --sname node1@localhost` and `iex --sname node2@localhost`):
# On node1:
# Node.connect(: