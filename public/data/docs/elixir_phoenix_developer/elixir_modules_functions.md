# Modules, Functions & Organizers in Elixir

Elixir's approach to organizing code revolves around modules and functions, emphasizing immutability and functional paradigms. Understanding how to define, use, and organize these constructs is fundamental to writing clean, maintainable Elixir applications.

## 1. Defining Modules

A module in Elixir is a container for functions and attributes, acting as a namespace. It's the primary way to structure your code, grouping related functionality together. Modules are defined using the `defmodule` macro.

```elixir
defmodule MyApp.Calculator do
  # Module attributes (optional)
  @author "SkillBun Team"

  # Functions go here
end

# Example of calling a function within a module (once defined)
# MyApp.Calculator.add(1, 2)
```

## 2. Defining Functions: Public (`def`) and Private (`defp`)

Functions are the building blocks of Elixir code, performing specific tasks. Elixir distinguishes between public and private functions.

### Public Functions (`def`)

Public functions are accessible from anywhere, both inside and outside the module. They define the external API of your module.

```elixir
defmodule MyApp.Calculator do
  @doc "Adds two numbers"
  def add(a, b) do
    a + b
  end

  @doc "Subtracts two numbers"
  def subtract(a, b) do
    a - b
  end
end

IO.puts MyApp.Calculator.add(5, 3) # Output: 8
```

### Private Functions (`defp`)

Private functions are internal helpers, only callable from within the same module where they are defined. They help encapsulate logic and avoid polluting the module's public interface.

```elixir
defmodule MyApp.Greeter do
  @doc "Greets a person by name"
  def greet(name) do
    # Calls a private helper function
    greeting = personalize_greeting(name)
    "#{greeting}, #{name}!"
  end

  # This function can only be called from inside MyApp.Greeter
  defp personalize_greeting(name) do
    case String.starts_with?(name, "Dr.") do
      true -> "Hello, esteemed"
      false -> "Hi there"
    end
  end
end

IO.puts MyApp.Greeter.greet("Alice")      # Output: Hi there, Alice!
IO.puts MyApp.Greeter.greet("Dr. Smith")  # Output: Hello, esteemed, Dr. Smith!
# MyApp.Greeter.personalize_greeting("Bob") # This would raise an error
```

## 3. Organizing Code: `import`, `alias`, `require`

As your codebase grows, you'll need mechanisms to manage module names and function calls efficiently. Elixir provides `alias`, `import`, and `require` for this.

### `alias`

`alias` provides a shorter name for a module. This is particularly useful for deeply nested modules, preventing long, repetitive module prefixes.

```elixir
defmodule MyModule do
  # Alias MyApp.Utils.StringHelpers to just StringHelpers
  alias MyApp.Utils.StringHelpers

  # You can also specify an 'as' keyword for a custom alias
  alias MyApp.Database.Repo, as: DatabaseRepo

  def process_data(data) do
    # Use StringHelpers instead of MyApp.Utils.StringHelpers
    StringHelpers.trim_and_downcase(data)
    DatabaseRepo.insert(data) # Use the aliased name
  end
end
```

### `import`

`import` makes functions from another module available directly, without needing to prefix them with the module name. This can make code more concise, but use it judiciously to avoid name clashes.

```elixir
defmodule MyListProcessor do
  # Import all functions from Enum
  import Enum

  # Alternatively, import specific functions or exclude some:
  # import List, only: [first: 1, last: 1]
  # import String, except: [strip: 1]

  def process(list) do
    # Now you can call Enum functions directly
    list
    |> map(&(&1 * 2))
    |> filter(&(&1 > 5))
    |> take(3)
  end
end

IO.inspect MyListProcessor.process([1, 2, 3, 4, 5]) # Output: [6, 8, 10]
```

### `require`

`require` ensures that a module is compiled and loaded *before* its macros are used. Macros are special functions that are expanded at compile time. Many Elixir constructs like `def`, `defmodule`, `use` are macros.

You typically use `require` when you want to call a macro from another module directly. Most commonly, `require` is used implicitly when you use the `use` macro (e.g., `use Plug.Router`), which handles the `require` for you.

```elixir
defmodule MyMacroUser do
  # Ensures MyApp.MyMacros is compiled and its macros are available
  require MyApp.MyMacros

  def apply_macro do
    MyApp.MyMacros.my_custom_macro()
  end
end
```

## Checklist/Exercises:

1.  **Define a Module with Functions**: Create an Elixir module named `MathUtils` that has two public functions: `square/1` (returns the square of a number) and `cube/1` (returns the cube). Also, add a private function `multiply_by_self/2` that `square/1` could potentially use.
2.  **Practice `alias`**: In a new module, `ReportGenerator`, `alias` `String.Chars` (which defines `to_string/1`) to simply `Chars`. Then, demonstrate calling `Chars.to_string(123)`.
3.  **Experiment with `import`**: Create a module `DataProcessor`. `import Enum` into this module. Then, write a function `filter_and_double/1` that takes a list, filters out even numbers, and then doubles the remaining odd numbers, all without explicitly using `Enum.` before `filter` or `map`.
