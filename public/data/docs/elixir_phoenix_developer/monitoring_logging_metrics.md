# Monitoring, Logging & Metrics in Elixir/Phoenix

Effective monitoring, logging, and metrics collection are crucial for understanding the health, performance, and behavior of any production application. In Elixir and Phoenix, a robust set of tools and practices are available to achieve this. This guide will cover structured logging with `Logger`, application metrics with `Telemetry`, and introduce how to integrate with popular monitoring tools like Prometheus and Grafana.

## 1. Structured Logging with `Logger`

Elixir's built-in `Logger` module provides a powerful and flexible logging framework. Structured logging involves attaching metadata to your log messages, making them easier to filter, search, and analyze in log aggregation systems.

### Core Concepts:
*   **Log Levels:** `debug`, `info`, `warn`, `error`, `critical`. You can configure the minimum log level to output.
*   **Metadata:** A map of key-value pairs that provides context to your log messages (e.g., `user_id`, `request_id`, `module`). This is essential for structured logging.
*   **Backends:** `Logger` can send log messages to various destinations (e.g., console, files, external services like Sentry or Datadog).

### Configuration (`config/config.exs`):
```elixir
# Configure Logger
config :logger,
  level: :info,
  # Example of adding a custom formatter for structured output (e.g., JSON)
  # formatter: {LoggerJSON.Formatter, %{}}
  # Example of adding a custom backend
  # backends: [{LoggerFileBackend, path: "log/app.log"}]
```

### Using `Logger` with Metadata:
```elixir
defmodule MyApp.UserService do
  require Logger

  def create_user(params) do
    user_id = "user_#{:rand.uniform(1000)}"
    Logger.metadata([user_id: user_id, action: :create_user])

    case do_create_user(params) do
      {:ok, user} ->
        Logger.info("User created successfully.")
        {:ok, user}
      {:error, reason} ->
        Logger.error("Failed to create user: #{inspect(reason)}", reason: reason)
        {:error, reason}
    end
  after
    # Always clear metadata to avoid leaking it to subsequent logs
    Logger.metadata([])
  end

  defp do_create_user(_params) do
    # Simulate user creation logic
    if :rand.uniform(10) > 2 do
      {:ok, %{id: "user_#{:rand.uniform(1000)}", name: "Test User"}}
    else
      {:error, "database_error"}
    end
  end
end

# Example usage:
MyApp.UserService.create_user(%{name: "Alice"})
MyApp.UserService.create_user(%{name: "Bob"})
```

In the example, `Logger.metadata/1` sets context for subsequent log messages within the current process. It's crucial to clear the metadata afterwards (e.g., in an `after` block) to prevent it from affecting unrelated logs.

## 2. Application Metrics with `Telemetry`

`Telemetry` is Elixir's standard library for instrumenting functions and reporting application metrics. It provides a simple, extensible way to emit events about application behavior, which can then be consumed by various handlers to generate metrics, traces, or logs.

### Core Concepts:
*   **Events:** Named tuples that represent significant points in your application's lifecycle (e.g., `[:my_app, :user, :created]`). Events carry a measurement and metadata.
*   **Handlers:** Functions that subscribe to specific `Telemetry` events and process them. Handlers can aggregate measurements, send them to monitoring systems, or perform other actions.
*   **`telemetry_metrics`:** A library that simplifies defining common metrics (counters, sums, histograms) from Telemetry events and integrates with monitoring systems.

### Emitting Custom Telemetry Events:
```elixir
defmodule MyApp.AnalyticsService do
  @spec track_event(atom, map) :: :ok
  def track_event(event_name, metadata \\ %{}) do
    :telemetry.span(
      [:my_app, :analytics, event_name, :track],
      %{start_time: System.monotonic_time()},
      fn ->
        # Simulate some work being done
        Process.sleep(10 + :rand.uniform(100))
        {:ok, %{processed_at: NaiveDateTime.utc_now()}}
      end,
      metadata
    )
  end

  # Another example: simple counter event
  def process_item(item_id) do
    :telemetry.execute([:my_app, :item, :processed], %{count: 1}, %{item_id: item_id})
    # ... process item ...
    "Item #{item_id} processed."
  end
end

# Example usage:
MyApp.AnalyticsService.track_event(:page_view, %{user_id: 123, path: "/dashboard"})
MyApp.AnalyticsService.process_item("A1B2C3")
```

### Defining a Simple Telemetry Handler:
```elixir
defmodule MyApp.TelemetryHandler do
  require Logger

  def attach do
    :telemetry.attach(
      "my-app-page-view-handler",
      [:my_app, :analytics, :page_view, :track, :stop],
      &handle_page_view/4,
      nil # Handler state
    )

    :telemetry.attach(
      "my-app-item-processed-handler",
      [:my_app, :item, :processed],
      &handle_item_processed/4,
      nil
    )
  end

  def handle_page_view(_event_name, measurements, metadata, _config) do
    duration_ms = System.convert_time_unit(measurements.duration, :native, :millisecond)
    Logger.info("Page view event: user_id=#{metadata.user_id}, path=#{metadata.path}, duration=#{duration_ms}ms")
  end

  def handle_item_processed(_event_name, measurements, metadata, _config) do
    Logger.info("Item processed: item_id=#{metadata.item_id}, count=#{measurements.count}")
  end
end

# Attach handlers in your application's supervision tree or during startup
# For example, in your application.ex start/2 callback:
# MyApp.TelemetryHandler.attach()
```

## 3. Integration with Monitoring Tools (Prometheus, Grafana)

`Telemetry` provides the raw events; to turn them into visual dashboards, you typically integrate with specialized monitoring systems:

*   **Prometheus:** A powerful open-source monitoring system that collects and stores metrics as time-series data.
    *   Libraries like [`Prometheus.Telemetry`](https://hexdocs.pm/prometheus_telemetry/readme.html) and [`PromEx`](https://hexdocs.pm/prom_ex/PromEx.html) can consume `Telemetry` events and expose them in a format Prometheus can scrape.
    *   `PromEx` is a comprehensive library that includes pre-built dashboards for Phoenix, Ecto, LiveView, and more, making Prometheus integration much simpler.

*   **Grafana:** An open-source platform for analytics and interactive visualization. It connects to various data sources (like Prometheus) and allows you to create customizable dashboards.
    *   Once Prometheus is collecting metrics from your Elixir/Phoenix application, you can configure Grafana to query these metrics and display them visually (e.g., response times, error rates, request counts).

### Integration Flow:
1.  **Instrument your app:** Use `Logger` for structured logs and `Telemetry` for metrics.
2.  **Collect Metrics:** Use `PromEx` (or `Prometheus.Telemetry` + `telemetry_metrics`) to subscribe to `Telemetry` events, aggregate them into Prometheus-compatible metrics (counters, gauges, histograms), and expose an HTTP endpoint (`/metrics`) that Prometheus can scrape.
3.  **Scrape Metrics:** Configure Prometheus to periodically fetch metrics from your Elixir application's `/metrics` endpoint.
4.  **Visualize Data:** Connect Grafana to your Prometheus instance and build dashboards to visualize your application's performance and health using the collected metrics.

## Quick Checklist/Exercise:
1.  **Implement Structured Logging:** Modify an existing `info` log message in a Phoenix controller or Elixir module to include at least two relevant metadata fields (e.g., `user_id`, `resource_id`, `request_id`). Test by viewing the logs in your console.
2.  **Create a Custom Telemetry Event:** Instrument a new function in your application (e.g., a `create_order` or `send_email` function) to emit a `Telemetry` event (using `:telemetry.execute/3` or `:telemetry.span/4`) that includes a measurement (e.g., duration, count) and relevant metadata.
3.  **Attach a Simple Telemetry Handler:** Write a simple module that attaches a `Telemetry` handler to the custom event created in step 2. The handler should print a `Logger.info` message with the event's measurements and metadata when the event fires. Verify it works by triggering the event and observing the log output.
