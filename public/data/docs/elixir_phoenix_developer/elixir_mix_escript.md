# Mix Build Tool & Escript: Study Guide

## 1. Introduction to Mix
Mix is Elixir's essential build tool, project manager, and task runner, serving a similar role to tools like Ruby's Rake or JavaScript's npm scripts. It is indispensable for developing Elixir applications, providing a structured way to manage project dependencies, compile code, run tests, generate documentation, and create executable packages.

**Key functionalities of Mix include:**
*   **Project Initialization:** Quickly setting up new Elixir projects with a standard directory structure.
*   **Dependency Management:** Declaring, fetching, and compiling external libraries your project relies on.
*   **Task Runner:** Executing various tasks, from compiling code and running tests to custom commands.
*   **Code Compilation:** Managing the compilation process of your Elixir and Erlang source files.
*   **Testing:** Providing a framework to write and run unit and integration tests.
*   **Escript Generation:** Packaging your application into a self-contained, executable file.

## 2. Getting Started with Mix Projects

### Creating a New Project
You can create a new Elixir project using the `mix new` command. This sets up a basic project structure.

```bash
mix new my_elixir_app
cd my_elixir_app
```

### Project Structure
A newly created Mix project typically contains:
*   `lib/`: Contains your application's source code.
*   `test/`: Holds your project's test files.
*   `mix.exs`: The project configuration file, the heart of every Mix project.
*   `README.md`, `.formatter.exs`, etc.: Other standard project files.

### The `mix.exs` File
This file defines the project's properties and behavior. It typically contains three main functions:
*   `project/0`: Defines metadata like the application name (`app`), version (`version`), Elixir version compatibility (`elixir`), and lists dependencies (`deps`).
*   `application/0`: Specifies how your application starts, including its main module and any extra applications it needs (e.g., `:logger`).
*   `deps/0`: A private function that lists all your project's dependencies.

## 3. Dependency Management

Mix makes managing external libraries straightforward.

### Defining Dependencies
Dependencies are declared in the `deps/0` function within `mix.exs` as a list of tuples. You specify the package name and its version requirements.

```elixir
# In mix.exs
defp deps do
  [
    {:jason, "~> 1.0"}, # Example: a JSON parsing library
    {:plug, "~> 1.0", only: :dev, runtime: false} # Example: a dev-only dependency
  ]
end
```

### Fetching and Compiling Dependencies
Once dependencies are defined, you can fetch them from Hex (Elixir's package manager) and compile them:

```bash
mix deps.get    # Fetches all declared dependencies
mix deps.compile # Compiles the fetched dependencies
```

## 4. Understanding Mix Tasks

Mix tasks are command-line utilities that perform specific actions within your Mix project. Mix comes with many built-in tasks, and you can also create your own.

### Running Built-in Tasks
To run a Mix task, use `mix <task_name>`.

**Common built-in tasks include:**
*   `mix compile`: Compiles your project's source code.
*   `mix test`: Runs your project's tests.
*   `mix run`: Runs an Elixir script or application.
*   `mix deps.get`: Fetches project dependencies.
*   `mix format`: Formats your Elixir code according to standard guidelines.
*   `mix help`: Lists all available Mix tasks.

### Creating Custom Mix Tasks
You can extend Mix's functionality by defining your own tasks. Custom tasks are modules that implement the `Mix.Task` behaviour.

**Structure of a custom task:**
1.  Create a file (e.g., `lib/mix/tasks/greet.ex`) within your project.
2.  Define a module named `Mix.Tasks.<YourTaskName>`.
3.  Use `use Mix.Task` to include necessary macros.
4.  Implement the `run/1` function, which is the entry point for your task. It receives a list of arguments.

**Example:**
```elixir
# lib/mix/tasks/greet.ex
defmodule Mix.Tasks.Greet do
  use Mix.Task

  @shortdoc "Greets a given name or 'World'"
  def run(args) do
    name = case args do
             [] -> "World"
             [n | _] -> n
           end
    IO.puts "Hello, #{name} from your custom Mix task!"
  end
end
```

To run this task: `mix greet John`

## 5. Building Executable Escripts

Escripts are self-contained, executable files that bundle your Elixir application and its dependencies into a single file. They are ideal for distributing command-line tools or standalone applications without requiring users to have Elixir installed globally or manage project dependencies manually.

### What are Escripts?
An Escript is a shell script that, when executed, unpacks and runs your Elixir application (compiled BEAM files) using an embedded Erlang runtime.

### Why use Escripts?
*   **Portability:** Distribute your Elixir application as a single file that can run on any system with a compatible Erlang/Elixir runtime (often bundled).
*   **Simplicity:** Users don't need to understand Mix or Elixir project structure; they just run the executable.
*   **Command-line Tools:** Perfect for creating CLI utilities.

### Configuring an Escript in `mix.exs`
To enable Escript generation, add an `escript` option to your `project` function in `mix.exs`. The most important key is `main_module`, which specifies the module (and its `main/1` function) that will be invoked when the Escript runs.

```elixir
# In mix.exs
def project do
  [
    # ... other project config ...
    escript: [main_module: MyProject.CLI] # Configure Escript entry point
  ]
end
```

### Building an Escript
Once configured, build your Escript with the `mix escript.build` command:

```bash
mix escript.build
```

This will generate an executable file (named after your application, e.g., `my_project`) in your project's root directory.

### Running an Escript
Execute the generated Escript like any other command-line program:

```bash
./my_project argument1 argument2
```
The arguments passed to the Escript will be forwarded to your `main/1` function in the `main_module`.

### Example Escript Main Module
```elixir
# lib/my_project/cli.ex
defmodule MyProject.CLI do
  def main(args) do
    IO.puts "Hello from MyProject Escript!"
    IO.puts "Received arguments: #{inspect(args)}"
    # You can implement your CLI logic here
  end
end
```

## 6. Code Examples

### 6.1 `mix.exs` Configuration Example with Escript and Dependency
```elixir
defmodule MyProject.MixProject do
  use Mix.Project

  def project do
    [
      app: :my_project,
      version: "0.1.0",
      elixir: "~> 1.14",
      start_permanent: Mix.env() == :prod,
      deps: deps(),
      escript: [main_module: MyProject.CLI] # Escript configuration
    ]
  end

  def application do
    [
      extra_applications: [:logger]
      # start_phase: {MyProject.Application, :start_phase, []} # Example if you have a custom start
    ]
  end

  defp deps do
    [
      {:jason, "~> 1.0"} # Example dependency
    ]
  end
end
```

### 6.2 Custom Mix Task Example (`mix hello`)
```elixir
# lib/mix/tasks/hello.ex
defmodule Mix.Tasks.Hello do
  use Mix.Task

  @shortdoc "Prints a friendly greeting"
  def run(args) do
    name = case args do
             [] -> "World"
             [n | _] -> n
           end
    IO.puts "Hello, #{name} from a custom Mix task!"
  end
end
```
To run this: `mix hello John`

### 6.3 Escript Main Module Example (`MyProject.CLI`)
```elixir
# lib/my_project/cli.ex
defmodule MyProject.CLI do
  def main(_args) do
    IO.puts "This is my Escript application running!"
    IO.puts "Using Jason version: #{Application.spec(:jason, :vsn)}"
  end
end
```
Ensure `mix.exs` has `escript: [main_module: MyProject.CLI]`.

## 7. Quick Check Exercises
1.  Create a new Elixir project named `my_greeter_tool` using `mix new`.
2.  Modify its `mix.exs` to include `{:ecto, "~> 3.0"}` as a dependency. Fetch and compile this dependency using Mix commands.
3.  Configure `my_greeter_tool` to build an Escript with `MyGreeterTool.CLI` as its main module. Implement `MyGreeterTool.CLI.main/1` to print "Greetings from my Escript!" along with any arguments passed. Build and then run the Escript with a test argument.