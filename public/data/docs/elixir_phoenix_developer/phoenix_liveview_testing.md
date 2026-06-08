# Testing Phoenix & LiveView: A Study Guide

Testing is an indispensable part of building robust and maintainable Phoenix and LiveView applications. Elixir's built-in testing framework, ExUnit, combined with Phoenix's test helpers, provides a powerful and idiomatic way to ensure your application behaves as expected, from controllers and channels to the highly interactive LiveView components.

## Core Concepts

1.  **ExUnit**: Elixir's default testing framework. It's fast, concurrent, and integrates seamlessly with Mix.
2.  **Test Helpers**: Phoenix provides specific helpers in the `test/support` directory to set up the testing environment for different parts of your application:
    *   `ConnCase`: For testing controllers, plugs, and router. It provides a mocked `Plug.Conn`.
    *   `DataCase`: For testing Ecto models, contexts, and database interactions. It typically wraps tests in transactions to ensure a clean state.
    *   `ChannelCase`: For testing Phoenix Channels, allowing you to simulate client-server interactions.
    *   `LiveViewTest`: The primary module for testing LiveView components, simulating user interactions and asserting rendered HTML.
3.  **Fixtures**: Often used to set up prerequisite data for tests. Phoenix projects generate `test/support/fixtures.ex` for Ecto contexts, making it easy to create and manage test data.

## Testing Phoenix Components

### 1. Controllers

Testing controllers involves simulating HTTP requests and asserting on the response. `ConnCase` provides functions like `get/3`, `post/3`, `put/3`, `delete/3` to make requests and `html_response/2`, `json_response/2`, `redirect/2` to check responses.

**Example:**

```elixir
# test/my_app_web/controllers/page_controller_test.exs
defmodule MyAppWeb.PageControllerTest do
  use MyAppWeb.ConnCase

  test "GET /", %{conn: conn} do
    conn = get(conn, "/")
    assert html_response(conn, 200) =~ "Welcome to Phoenix!"
  end

  test "GET /redirect", %{conn: conn} do
    conn = get(conn, "/redirect") # Assuming you have a route that redirects
    assert redirected_to(conn) == "/"
  end
end
```

### 2. Views/Templates

While controllers often implicitly test rendering, you might want to test view functions directly or ensure specific templates render correctly.

```elixir
# test/my_app_web/views/page_view_test.exs
defmodule MyAppWeb.PageViewTest do
  use MyAppWeb.ConnCase, async: true

  import Phoenix.View

  test "renders index.html.heex with a title" do
    assert render_to_string(MyAppWeb.PageView, "index.html", title: "My Page") =~ "My Page"
  end
end
```

### 3. Channels

Testing channels involves simulating client subscriptions, sending messages, and asserting on broadcasted messages or channel state. `ChannelCase` provides helpers like `subscribe_and_join/3` and `broadcast_from/3`.

```elixir
# test/my_app_web/channels/room_channel_test.exs
defmodule MyAppWeb.RoomChannelTest do
  use MyAppWeb.ChannelCase

  test "joins the room and broadcasts a message" do
    {:ok, _pusher_pid, socket} = subscribe_and_join(RoomChannel, "room:lobby", %{some: "payload"})

    # Simulate an incoming message from the client
    push(socket, "new_msg", %{body: "Hello!"})

    # Assert that a message was broadcasted to the room
    assert_broadcast "new_msg", %{body: "Hello!"}
  end
end
```

## Testing Phoenix LiveView

`Phoenix.LiveViewTest` is the cornerstone for testing LiveView components. It allows you to mount a LiveView, simulate user interactions (clicks, form submissions), and assert on the resulting HTML or internal state.

### Key Functions in `Phoenix.LiveViewTest`:

*   `render_live/1`: Mounts a LiveView and renders its initial HTML.
*   `element/3`: Finds an element by CSS selector within the LiveView's HTML.
*   `render/1`: Rerenders the LiveView after an interaction, returning the new HTML.
*   `assert_patch/2`: Asserts that the LiveView patched to a new URL.
*   `assert_redirect/2`: Asserts that the LiveView redirected to a new URL.
*   `assert_component/3`: Asserts a LiveComponent is rendered within the LiveView.
*   `assert_receive/2`: Asserts a message was sent to the LiveView process.
*   `assert_rendered_component/2`: Asserts a LiveComponent renders specific content.

### Simulating Interactions:

*   `refute_patch/2`: Checks that no patch happened.
*   `assert_no_patch/2`: Checks that no patch happened.
*   `assert_no_redirect/2`: Checks that no redirect happened.
*   `live_click/2`: Simulates a click on an element with a `phx-click` attribute.
*   `live_change/3`: Simulates a form input change (e.g., typing in a text field).
*   `live_submit/2`: Simulates a form submission.

### Example: Testing a Counter LiveView

Let's assume you have a simple counter LiveView:

```elixir
# lib/my_app_web/live/counter_live.ex
defmodule MyAppWeb.CounterLive do
  use MyAppWeb, :live_view

  def mount(_params, _session, socket) do
    {:ok, assign(socket, count: 0)}
  end

  def render(assigns) do
    ~H"""
    <div id="counter">
      <h1 phx-click="reset">Count: <%= @count %></h1>
      <button phx-click="increment">+</button>
      <button phx-click="decrement">-</button>
    </div>
    """
  end

  def handle_event("increment", _value, socket) do
    {:noreply, update(socket, :count, &(&1 + 1))}
  end

  def handle_event("decrement", _value, socket) do
    {:noreply, update(socket, :count, &(&1 - 1))}
  end

  def handle_event("reset", _value, socket) do
    {:noreply, assign(socket, count: 0)}
  end
end
```

Now, let's write tests for it:

```elixir
# test/my_app_web/live/counter_live_test.exs
defmodule MyAppWeb.CounterLiveTest do
  use MyAppWeb.ConnCase

  import Phoenix.LiveViewTest

  test "displays the initial count", %{conn: conn} do
    {:ok, lv, _html} = live(conn, "/counter")

    assert lv |> element("#counter h1") |> render() =~ "Count: 0"
  end

  test "increments the count on click", %{conn: conn} do
    {:ok, lv, _html} = live(conn, "/counter")

    # Simulate click on the increment button
    assert lv
    |> element("#counter button", "+")
    |> render_click()
    |> element("#counter h1")
    |> render() =~ "Count: 1"

    # Click again
    assert lv
    |> element("#counter button", "+")
    |> render_click()
    |> element("#counter h1")
    |> render() =~ "Count: 2"
  end

  test "decrements the count on click", %{conn: conn} do
    {:ok, lv, _html} = live(conn, "/counter")

    # First increment to 1
    lv |> element("#counter button", "+") |> render_click()

    # Then decrement to 0
    assert lv
    |> element("#counter button", "-")
    |> render_click()
    |> element("#counter h1")
    |> render() =~ "Count: 0"
  end

  test "resets the count on h1 click", %{conn: conn} do
    {:ok, lv, _html} = live(conn, "/counter")

    # Increment to 5
    for _ <- 1..5, do: lv |> element("#counter button", "+") |> render_click()
    assert lv |> element("#counter h1") |> render() =~ "Count: 5"

    # Click h1 to reset
    assert lv
    |> element("#counter h1")
    |> render_click()
    |> element("#counter h1")
    |> render() =~ "Count: 0"
  end
end
```

This example demonstrates how `LiveViewTest` allows you to interact with your LiveView as a user would and assert on the visible changes. This approach is powerful for ensuring your interactive components are robust.

## Quick Checklist / Exercise

1.  **Test a Form Submission**: Create a simple LiveView with a form that takes a username and displays a welcome message. Write a test that simulates typing into the username field and submitting the form, then assert that the welcome message appears.
2.  **Test a Toggle Button**: Implement a LiveView with a button that toggles a boolean state (e.g., `show_details`). Write a test that clicks the button and asserts the visibility of a corresponding `div` element.
3.  **Refactor a Controller Test**: Take an existing controller test from your project (or scaffold a new one) and modify it to use `async: true` for improved test performance, ensuring it still passes. (Note: `async: true` is suitable for tests that don't modify shared state, such as read-only controller actions or pure view tests.)