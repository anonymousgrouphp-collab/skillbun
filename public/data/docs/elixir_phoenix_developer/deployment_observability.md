# Deployment, Operations & Observability in Elixir/Phoenix

Mastering deployment, operations, and observability is crucial for transforming a functional Elixir/Phoenix application into a robust, reliable, and scalable production system. This guide covers the essential concepts and practices to ensure your applications perform optimally, remain secure, and are easy to monitor and maintain.

## 1. Deployment Strategies

Deploying an Elixir/Phoenix application involves packaging it for production and running it on a server. Key strategies include:

### 1.1 Elixir Releases (Mix Release)

Elixir releases bundle your application and all its dependencies, including the Erlang VM, into a single, self-contained directory. This makes your application portable and easy to deploy without needing Erlang/Elixir installed on the target server.

*   **Benefits**: Self-contained, easier dependency management, smaller footprint, faster startup.
*   **Usage**: Since Elixir 1.9, `mix release` is built-in.
    *   Configure `mix.exs`:
        ```elixir
        # mix.exs
        def project do
          [
            app: :my_app,
            version: "0.1.0",
            elixir: "~> 1.14",
            start_permanent: Mix.env() == :prod,
            deps: deps()
            # ... other configs
          ]
        end

        def application do
          [
            mod: {MyApp.Application, []},
            extra_applications: [:logger, :runtime_tools]
          ]
        end
        ```
    *   Generate a release: `mix release`
    *   Start the release: `_build/prod/rel/my_app/bin/my_app start`

### 1.2 Containerization (Docker)

Docker allows you to package your application and its environment into isolated containers. This ensures consistency across different environments (development, staging, production) and simplifies scaling.

*   **Workflow**: Build a Docker image containing your Elixir release, then run the image as a container.
*   **Example `Dockerfile` for a Phoenix application with a release:**
    ```dockerfile
    # Stage 1: Build the release
    FROM hexpm/elixir:1.14.0-erlang-25.0.4-alpine-3.16.2 AS builder

    WORKDIR /app

    # Install build dependencies
    RUN apk add --no-cache git build-base npm

    # Install Hex and Rebar
    RUN mix local.hex --force && \
        mix local.rebar --force

    # Copy and fetch dependencies
    COPY mix.exs mix.lock ./n    RUN mix deps.get --only prod

    # Copy the rest of the application
    COPY priv priv
    COPY lib lib
    COPY assets assets

    # Compile assets (if using esbuild/webpack for Phoenix)
    RUN npm install --prefix ./assets && \
        npm run deploy --prefix ./assets

    # Compile and generate release
    COPY config config
    RUN mix compile
    RUN mix release --overwrite

    # Stage 2: Create the production image
    FROM alpine:3.16.2 AS runner

    # Install Erlang runtime dependencies
    RUN apk add --no-cache libstdc++ ncurses-libs openssl-libs

    WORKDIR /app

    # Copy the release from the builder stage
    COPY --from=builder /app/_build/prod/rel/my_app ./n
    # Expose the port Phoenix runs on
    EXPOSE 4000

    # Command to run the application
    CMD ["bin/my_app", "start"]
    ```

### 1.3 Cloud Platforms

*   **Platform-as-a-Service (PaaS)**: Gigalixir (Elixir-specific), Heroku, Render. Simplify deployment and scaling by abstracting infrastructure.
*   **Infrastructure-as-a-Service (IaaS)**: AWS EC2, Google Cloud Compute Engine. Offer more control but require manual server management.
*   **Container Orchestration**: AWS ECS, Google Cloud Run, Kubernetes. For highly scalable and resilient containerized deployments.

## 2. Operations

Efficient operations ensure your application runs smoothly in production.

### 2.1 Environment Configuration

Production environments require specific configurations (database URLs, API keys). Elixir's `config/runtime.exs` is ideal for loading environment-specific settings at application startup, rather than compile-time.

```elixir
# config/runtime.exs
import Config

if config_env() == :prod do
  config :my_app, MyApp.Repo,
    url: System.get_env("DATABASE_URL")

  config :my_app, MyApi.Client,
    api_key: System.get_env("MY_API_KEY")
end
```
Always use environment variables for sensitive data.

### 2.2 Secret Management

Never hardcode sensitive information. Use environment variables, or for more robust solutions, consider dedicated secret management services like HashiCorp Vault, AWS Secrets Manager, or Google Secret Manager.

### 2.3 Database Migrations

For Phoenix applications, run database migrations before or during deployment.
*   **Release Command**: Many PaaS providers allow "release commands" to run migrations before the application starts.
*   **Manual**: `mix ecto.migrate` (ensure `MIX_ENV=prod` and correct database credentials).
*   **Embedded**: While possible to run migrations from within the application code, it's generally recommended to run them as a separate step during deployment to avoid race conditions or issues during rollbacks.

## 3. Observability

Observability is about understanding the internal state of your system from its external outputs.

### 3.1 Logging

Elixir's `Logger` module provides robust logging capabilities. Configure it to output to standard output (stdout/stderr) for containerized environments, which can then be collected by external log aggregators.

*   **Configuration**:
    ```elixir
    # config/prod.exs
    config :logger, level: :info,
      format: "$time $metadata[$level] $message\n"
    ```
*   **External Services**: Collect logs with services like Logstash, Splunk, Datadog, or cloud-native solutions (AWS CloudWatch, Google Cloud Logging).

### 3.2 Monitoring & Metrics

Monitor key application metrics (CPU usage, memory, response times, error rates) to detect issues and performance bottlenecks.

*   **Libraries**: `telemetry` is Elixir's standard for instrumenting code and emitting metrics.
*   **Tools**:
    *   **Prometheus & Grafana**: Popular open-source stack for collecting and visualizing metrics.
    *   **APM Tools**: AppSignal, New Relic, Datadog provide comprehensive application performance monitoring, often with Elixir-specific integrations.

### 3.3 Error Reporting

Centralized error reporting is essential for quickly identifying and addressing production issues.

*   **Sentry**: A widely used error tracking service with excellent Elixir integration (e.g., `sentry-elixir` library). It captures exceptions, provides stack traces, and aggregates error occurrences.

### 3.4 Tracing (Distributed Tracing)

For complex microservice architectures, distributed tracing helps visualize requests as they flow through different services, aiding in performance debugging and understanding service interactions.

*   **OpenTelemetry**: An industry-standard for instrumenting, generating, and exporting telemetry data (metrics, logs, and traces).

---

## Quick Checklist/Exercise:

1.  **Deployment Configuration**: You have an Elixir Phoenix application. Describe the minimal steps to create a production release using `mix release` and how you would run it.
2.  **Secret Handling**: Your application needs a database URL and an API key. Explain why and how `config/runtime.exs` combined with environment variables is the recommended approach for production, instead of `config/prod.exs`.
3.  **Observability Setup**: Imagine your deployed application is experiencing intermittent timeouts. What three types of observability data would you immediately check, and what tools/libraries would you consider using for each to diagnose the problem?
