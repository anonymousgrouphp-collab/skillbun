## Environment Configuration & Secrets Management in Elixir/Phoenix

Effectively managing application configurations for different environments (development, test, production) and securely handling sensitive data (secrets) are crucial aspects of building robust and deployable Elixir/Phoenix applications. This guide will cover the core mechanisms provided by Elixir and Phoenix for these tasks.

### 1. Environment-Specific Configuration

Elixir/Phoenix applications use a `config/` directory to manage configurations for various environments. This system allows you to define different settings without modifying your application code directly.

*   **`config/config.exs`**: This is the primary configuration file, containing settings that are common across all environments or serve as defaults.
*   **`config/dev.exs`, `config/test.exs`, `config/prod.exs`**: These files provide environment-specific overrides. For example, `config/prod.exs` might disable debug logging or configure a different database than `config/dev.exs`.

    When your application starts, `config/config.exs` is loaded first, followed by the environment-specific file determined by `Mix.env()` (e.g., `config/dev.exs` if `MIX_ENV=dev`).
*   **Accessing Configuration**: You can retrieve configuration values within your application using `Application.get_env/2` or `Application.fetch_env!/2`.

    ```elixir
    # In your config/config.exs
    config :my_app, greeting: "Hello from config!"

    # In your lib/my_app.ex or any module
    defmodule MyApp do
      def greet do
        Application.get_env(:my_app, :greeting, "Default Greeting")
      end

      def database_url do
        # Example: Fetching a config that might be overridden in specific environments
        Application.get_env(:my_app, :database_url)
      end
    end
    ```

### 2. Runtime Configuration (`config/runtime.exs`)

Introduced in Elixir 1.11, `config/runtime.exs` provides a powerful way to configure your application **at runtime**, after it has been compiled and packaged into a release. This is particularly useful for production deployments where environment variables (containing secrets or dynamic settings) are only known at deployment time, not build time.

*   **Compile-time vs. Runtime**: Traditional `config/*.exs` files are executed at **compile time**. If you try to read an environment variable like `System.get_env("DATABASE_URL")` in `config/prod.exs`, that variable must exist *when you compile* your application. This is problematic for secrets.
*   **`config/runtime.exs`** is executed *before* your application starts, but *after* the release is built and deployed. This makes it the ideal place to read environment variables for sensitive or deployment-specific settings.

    ```elixir
    # In your config/runtime.exs
    import Config

    if config_env() == :prod do
      # Read database URL from an environment variable at runtime
      config :my_app, MyApp.Repo,
        url: System.get_env("DATABASE_URL")

      # Read a secret key for external service
      config :my_app, :api_secret,
        key: System.get_env("MY_API_SECRET")
    end
    ```

### 3. Secrets Management

Secrets are sensitive pieces of information (e.g., API keys, database credentials, encryption keys) that should never be committed directly into your version control system. Elixir applications typically rely on environment variables for secure secret management.

*   **Why Environment Variables?**:
    *   They are external to your codebase, so they won't be accidentally committed.
    *   They can be easily changed without redeploying the application.
    *   Most deployment platforms (Heroku, Docker, Kubernetes, AWS, GCP) have built-in support for injecting environment variables securely.
*   **Accessing Environment Variables**: Use `System.get_env/1` to read environment variables.

    ```elixir
    defmodule MySecretsService do
      def get_api_key do
        System.get_env("EXTERNAL_API_KEY")
      end

      def get_stripe_secret do
        # Often paired with runtime.exs for configuration of third-party libraries
        System.get_env("STRIPE_SECRET_KEY")
      end
    end
    ```
*   **Best Practices for Secrets**:
    *   **Never hardcode secrets** in your code or `config/*.exs` files (except `runtime.exs` if reading env vars).
    *   **Use `config/runtime.exs`** to apply secrets read from environment variables to your application's configuration at deployment time.
    *   **Local Development**: For local development, use tools like `direnv` or a `.env` file parser (e.g., `dot_env` package) to load environment variables from a local file, ensuring this file is `.gitignore`d.
    *   **Production**: Utilize your hosting provider's secret management features (e.g., Heroku Config Vars, Kubernetes Secrets, AWS Secrets Manager, Google Secret Manager).

### Simple Configuration Example

Let's put it all together with an example for a `Logger` application that needs a log level and an external webhook URL (a secret).

1.  **`config/config.exs`**
    ```elixir
    import Config

    config :my_app, MyApp.Logger,
      level: :info # Default log level
    ```

2.  **`config/dev.exs`**
    ```elixir
    import Config

    config :my_app, MyApp.Logger,
      level: :debug # More verbose logging in development
    ```

3.  **`config/prod.exs`**
    ```elixir
    import Config

    # No direct secret here, relies on runtime.exs
    config :my_app, MyApp.Logger,
      level: :warn # Less verbose in production
    ```

4.  **`config/runtime.exs`**
    ```elixir
    import Config

    if config_env() == :prod do
      config :my_app, MyApp.Logger,
        webhook_url: System.get_env("LOG_WEBHOOK_URL")
    end
    ```

5.  **`lib/my_app/logger.ex`**
    ```elixir
    defmodule MyApp.Logger do
      @moduledoc "Custom logger service."

      def log(message) do
        level = Application.get_env(:my_app, __MODULE__, [])[:level]
        webhook_url = Application.get_env(:my_app, __MODULE__, [])[:webhook_url]

        IO.puts "[#{Atom.to_string(level)}] #{message}"

        if level == :error and webhook_url do
          # In a real app, you'd make an HTTP request here
          IO.puts "Sending error to webhook: #{webhook_url}"
        end
      end
    end
    ```

To run this in production with a secret:

```bash
# Build a release (MIX_ENV=prod is implicit for releases)
MIX_ENV=prod mix release

# Run the release, providing the secret as an environment variable
LOG_WEBHOOK_URL="https://example.com/logs" _build/prod/rel/my_app/bin/my_app start
```

### Checklist/Exercise

1.  **Task**: Define a new configuration key, `max_retries`, for a hypothetical external API service. Set its default value to `3` in `config/config.exs` and override it to `5` specifically for the `dev` environment in `config/dev.exs`.
2.  **Task**: Explain why placing `System.get_env("DATABASE_PASSWORD")` directly in `config/prod.exs` is generally a bad practice for deployment releases, and what the recommended alternative is.
3.  **Question**: You need to configure a secret API key for a third-party service. Which Elixir configuration file (`config/config.exs`, `config/dev.exs`, `config/prod.exs`, or `config/runtime.exs`) is the most appropriate place to read this API key from an environment variable, and why?
