# ExUnit: Unit & Integration Testing

ExUnit is Elixir's built-in testing framework, designed to be fast, extensible, and easy to use. It's the cornerstone for ensuring the reliability and correctness of your Elixir applications, from individual module functions to complex application logic, including Phoenix web applications.

## 1. Why Test?

Testing is crucial for:
*   **Preventing regressions:** Ensuring new changes don't break existing functionality.
*   **Verifying correctness:** Confirming that code behaves as expected.
*   **Improving design:** Test-Driven Development (TDD) often leads to cleaner, more modular code.
*   **Facilitating refactoring:** Providing confidence to safely change code.
*   **Documentation:** Tests serve as executable examples of how code should be used.

## 2. Unit Testing with ExUnit

Unit tests focus on testing the smallest testable parts of an application, typically individual functions or modules, in isolation.

### Core Concepts

*   **Test Cases:** Tests are organized into modules, often mirroring the structure of your application code. A test module uses `ExUnit.Case`.
*   **Tests:** Individual test cases are defined using the `test` macro, followed by a descriptive string and a block of code.
*   **Assertions:** ExUnit provides a rich set of assertion macros to verify expectations.

### Basic Structure

```elixir
defmodule MyApp.MyModuleTest do
  use ExUnit.Case, async: true # `async: true` runs tests in parallel when possible

  # Setup hook that runs before each test
  setup do
    # You can return a map of values that will be available in the test context
    {:ok, %{some_data: "initial"}}
  end

  test "greets the given name", %{some_data: data} do
    # Assertions are the core of tests
    assert MyApp.MyModule.greet("Alice") == "Hello, Alice!"
    refute MyApp.MyModule.greet("Bob") == "Goodbye, Bob!"
    assert data == "initial" # Using data from setup
  end

  test "raises an error for empty name" do
    assert_raise ArgumentError, "Name cannot be empty", fn ->
      MyApp.MyModule.greet("")
    end
  end
end
```

### Example: Testing a Simple Module

Let's say you have a module `MyApp.Calculator` in `lib/my_app/calculator.ex`:

```elixir
# lib/my_app/calculator.ex
defmodule MyApp.Calculator do
  def add(a, b) do
    a + b
  end

  def subtract(a, b) do
    a - b
  end
end
```

Its corresponding test file would be `test/my_app/calculator_test.exs`:

```elixir
# test/my_app/calculator_test.exs
defmodule MyApp.CalculatorTest do
  use ExUnit.Case, async: true

  test "adds two numbers correctly" do
    assert MyApp.Calculator.add(2, 3) == 5
    assert MyApp.Calculator.add(-1, 1) == 0
  end

  test "subtracts two numbers correctly" do
    assert MyApp.Calculator.subtract(5, 2) == 3
    assert MyApp.Calculator.subtract(10, 20) == -10
  end
end
```

### Key Assertions

*   `assert actual == expected`: Checks for equality.
*   `refute actual == expected`: Checks for inequality.
*   `assert_in_delta a, b, delta`: Checks if `a` and `b` are within `delta` of each other.
*   `assert_raise ExceptionModule, message, func`: Checks if `func` raises `ExceptionModule` with `message`.
*   `assert_receive message`: Checks if a message was sent to the current process.
*   `assert_no_receive message`: Checks if a message was *not* sent.

## 3. Integration Testing with ExUnit (and Phoenix)

Integration tests verify that different parts of your application work together as expected. In a Phoenix application, this often involves testing controller actions, database interactions, and user flows.

Phoenix provides `Phoenix.ConnTest` to facilitate integration testing of web requests without needing a running server.

### Core Concepts for Phoenix Integration Tests

*   `use Phoenix.ConnTest`: Brings in helper functions for making HTTP requests and asserting on the connection.
*   `setup %{conn: conn} do ... end`: Provides a `conn` fixture, representing a connection, which can be manipulated.
*   **Request Helpers:** `get(conn, path, params)`, `post(conn, path, params)`, `put`, `delete`, etc.
*   **Assertions:** Assertions on the response status, body, headers, and redirects.

### Example: Testing a Phoenix Controller

Assume you have a `PageController` with an `index` action:

```elixir
# lib/my_app_web/controllers/page_controller.ex
defmodule MyAppWeb.PageController do
  use MyAppWeb, :controller

  def index(conn, _params) do
    render(conn, "index.html", message: "Welcome!")
  end
end
```

Its integration test in `test/my_app_web/controllers/page_controller_test.exs`:

```elixir
# test/my_app_web/controllers/page_controller_test.exs
defmodule MyAppWeb.PageControllerTest do
  use MyAppWeb.ConnCase # This macro includes ExUnit.Case and Phoenix.ConnTest

  test "GET / returns welcome message", %{conn: conn} do
    conn = get(conn, "/") # Make a GET request to the root path
    assert html_response(conn, 200) =~ "Welcome!" # Assert status and content
  end

  test "GET / with specific parameter renders correctly", %{conn: conn} do
    conn = get(conn, "/greet?name=Elixir")
    assert html_response(conn, 200) =~ "Hello, Elixir!" # Assuming a route like /greet
  end
end
```
*Note: `MyAppWeb.ConnCase` is a convention in Phoenix apps that sets up `ExUnit.Case` and `Phoenix.ConnTest` for you, along with other helpers.*

## 4. Running Tests

*   **All tests:** From your project root, run `mix test`.
*   **Specific file:** `mix test test/my_app/calculator_test.exs`
*   **Specific line:** `mix test test/my_app/calculator_test.exs:10`
*   **Mix test `--stale`:** Runs only tests affected by recent changes.

## Checklist/Exercise

1.  Create a new Elixir project (`mix new my_project`). Implement a simple module `MyProject.StringProcessor` with a function `reverse(string)`. Write unit tests for this function, ensuring it correctly reverses a string and handles empty strings.
2.  Add a `setup` block to your `StringProcessor` test module that initializes a common string variable, and use that variable in at least one of your tests.
3.  Imagine you have a Phoenix application. Briefly describe how you would use `Phoenix.ConnTest` to verify that a `POST /users` endpoint correctly creates a user and redirects to the user's profile page. (No code needed, just explain the steps and assertions).