# Phoenix Project Setup

Phoenix is a web development framework written in Elixir, known for its high performance, productivity, and fault tolerance. Built on top of Erlang's BEAM virtual machine, Phoenix leverages Elixir's features to build robust, scalable, and maintainable applications. This guide will walk you through setting up a new Phoenix project, understanding its core directory structure, and basic configuration.

## Prerequisites

Before you begin, ensure you have Elixir and Erlang/OTP installed on your system. You can verify your installation by running:

```bash
elixir -v
erl -v
```

If they are not installed, refer to the official Elixir installation guide.

## Installing Phoenix Installer

Phoenix projects are generated using a `mix` task. First, you need to install the `phx.new` archive:

```bash
mix archive.install hex phx_new
```

This command makes the `mix phx.new` generator available globally.

## Creating a New Phoenix Project

To create a new Phoenix project, use the `mix phx.new` command followed by your project's name.

```bash
mix phx.new my_phoenix_app
```

This command will:
1.  Create a new directory `my_phoenix_app`.
2.  Generate all necessary files for a basic Phoenix application, including a web server, live view, and database integration (Ecto).
3.  Ask if you want to fetch and install dependencies. Type `Y` and press Enter.

If you don't need certain features, you can use flags:
-   `--no-ecto`: To skip Ecto (database integration).
-   `--no-html`: To skip HTML templates (for API-only projects).
-   `--no-live`: To skip Phoenix LiveView.

For example, to create an API-only project without LiveView:

```bash
mix phx.new my_api --no-html --no-live --no-ecto
```

After the project is created and dependencies are installed, navigate into your new project directory:

```bash
cd my_phoenix_app
```

To start the Phoenix server:

```bash
mix phx.server
```

Open your browser and go to `http://localhost:4000`. You should see the Phoenix welcome page!

## Understanding the Directory Structure

A newly generated Phoenix project has a well-defined directory structure:

-   `assets/`: Contains front-end assets like JavaScript, CSS, images, and fonts. Phoenix uses `esbuild` and `tailwind` (by default in recent versions) for asset management.
    -   `assets/js/app.js`: Your main JavaScript entry point.
    -   `assets/css/app.css`: Your main CSS entry point.
-   `config/`: Holds all configuration files for your application.
    -   `config/config.exs`: General application configuration.
    -   `config/dev.exs`: Development environment specific configurations.
    -   `config/prod.exs`: Production environment specific configurations.
    -   `config/test.exs`: Test environment specific configurations.
-   `lib/`: The core of your application's Elixir code.
    -   `lib/my_phoenix_app/`: Contains your application's core logic.
        -   `application.ex`: Defines the supervision tree for your application.
        -   `mailer.ex`: Configures email sending (if `Swoosh` is used).
        -   `repo.ex`: Defines your Ecto repository for database interaction.
        -   `my_phoenix_app_web/`: Contains web-specific components.
            -   `endpoint.ex`: Entry point for all web requests. Handles routing, plugs, and other web pipeline components.
            -   `router.ex`: Defines routes and pipelines for your web application.
            -   `controllers/`: Contains controller modules that handle requests.
            -   `live/`: Contains Phoenix LiveView components.
            -   `views/`: Contains view modules that prepare data for templates.
            -   `templates/`: Contains EEx templates for rendering HTML.
            -   `channels/`: Contains Phoenix Channels for real-time communication.
-   `priv/`: Contains static assets or files that are not part of the build process but are needed by the application (e.g., database seeds, migrations).
-   `test/`: Contains all unit and integration tests for your application.
-   `mix.exs`: The Mix project file, defining dependencies, application modules, and other project settings.

## Basic Configuration

Configuration in Phoenix (and Elixir) is handled through `.exs` files in the `config/` directory.

-   **`config/config.exs`**: This file contains common configurations shared across all environments.
    ```elixir
    # config/config.exs
    import Config

    config :my_phoenix_app,
      ecto_repos: [MyPhoenixApp.Repo],
      generators: [timestamp_type: :utc_datetime]

    # Configures the endpoint
    config :my_phoenix_app, MyPhoenixAppWeb.Endpoint,
      url: [host: "localhost"],
      render_errors: [view: MyPhoenixAppWeb.ErrorView, accepts: ~w(html json), layout: false],
      pubsub_server: MyPhoenixApp.PubSub,
      live_view: [signing_salt: "YOUR_SIGNING_SALT"]

    # Configure esbuild (for assets)
    config :esbuild,
      version: "0.17.11",
      default: [
        args: ~w(js/app.js --bundle --target=es2017 --outdir=../priv/static/assets),
        cd: Path.expand("../assets", __DIR__),
        env: %{"NODE_PATH" => Path.expand("../deps", __DIR__)}
      ]

    # Configure Tailwind CSS
    config :tailwind, version: "3.2.1", default: [
      args: ~w(
        --config=tailwind.config.js
        --input=css/app.css
        --output=../priv/static/assets/app.css
      ),
      cd: Path.expand("../assets", __DIR__)
    ]
    ```

-   **Environment-Specific Configuration**: Files like `dev.exs`, `prod.exs`, and `test.exs` override or extend the settings from `config.exs` for their respective environments.

    For example, in `config/dev.exs`, you'll find database credentials, live reload settings, and debug options:

    ```elixir
    # config/dev.exs
    import Config

    # For development, we disable the cache and enable
    # debugging and code reloading.
    config :my_phoenix_app, MyPhoenixAppWeb.Endpoint,
      http: [port: 4000],
      debug_errors: true,
      code_reloader: true,
      check_origin: false,
      watchers: [
        node: ["esbuild", :default,
          cd: Path.expand("../assets", __DIR__)
        ],
        node: ["tailwind", :default,
          cd: Path.expand("../assets", __DIR__)
        ]
      ]

    # Configure your database
    config :my_phoenix_app, MyPhoenixApp.Repo,
      database: "my_phoenix_app_dev",
      pool_size: 10
    ```
    This shows how the `http` port, `debug_errors`, `code_reloader` and database connection details are set specifically for the development environment.

## Quick Checklist/Exercise

1.  **Project Creation**: Create a new Phoenix project named `blog_app` without Ecto, HTML, or LiveView. What command would you use?
2.  **Server Start**: After navigating into your newly created `blog_app` directory, how would you start the Phoenix server?
3.  **Configuration Check**: Where would you typically find the database connection settings for the development environment in a standard Phoenix project? What file and key should you look for?