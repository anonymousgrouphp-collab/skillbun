# LiveComponents & Layouts: Building Dynamic & Consistent UIs in Phoenix LiveView

## Introduction
Phoenix LiveView offers a powerful, reactive programming model for building rich, interactive user interfaces with server-rendered HTML. Within this ecosystem, **LiveComponents** and **Layouts** are crucial for managing UI complexity, promoting reusability, and ensuring a consistent user experience. This guide will delve into these concepts, providing a clear path to integrating them into your Elixir/Phoenix applications.

## Understanding LiveComponents
LiveComponents are self-contained, reusable units of UI and logic within a LiveView application. They allow you to encapsulate a specific piece of functionality, making your LiveViews cleaner, more modular, and easier to maintain. Think of them as smaller, specialized LiveViews that operate within the context of a parent LiveView.

### Core Concepts
*   **`render/1` Callback**: Every LiveComponent must implement a `render/1` function that returns HEEx (or LEEx) templates. This function receives the component's `assigns` (data) and renders its UI.
*   **`mount/1` and `update/2`**: Unlike LiveViews, LiveComponents do not have a `mount/3` for `socket` setup or `handle_params/3`. Instead, `mount/1` is called once when the component is initialized, and `update/2` is called whenever its `assigns` change. These are used to transform or prepare data before rendering.
*   **State Management**: LiveComponents can manage their own state (isolated state) or receive state from their parent LiveView (controlled state). Isolated state is achieved by managing `assigns` within `mount/1` and `update/2` without relying on the parent to update them.
*   **`live_component/3` Helper**: Used within a LiveView template to render a LiveComponent. It takes the `socket` (or `assigns`), the component module, and a keyword list of `assigns` to pass to the component. The `id` assign is crucial for LiveView to track component instances.

### Example: A Simple Counter LiveComponent

```elixir
# lib/my_app_web/live/counter_component.ex
defmodule MyAppWeb.CounterComponent do
  use Phoenix.LiveComponent

  def render(assigns) do
    ~H"""
    <div id={"counter-<%= @id %>"}>
      <h2>Counter: <%= @value %></h2>
      <button phx-click="decrement" phx-target={@myself}>-</button>
      <button phx-click="increment" phx-target={@myself}>+</button>
    </div>
    """
  end

  # Initial mount (only once per component instance)
  def mount(assigns) do
    {:ok, assign(assigns, value: assigns.value || 0)}
  end

  # Update when parent assigns change or a specific update is sent
  def update(assigns, socket) do
    {:ok, assign(socket, assigns)}
  end

  def handle_event("increment", _params, socket) do
    {:noreply, update(socket, :value, &(&1 + 1))}
  end

  def handle_event("decrement", _params, socket) do
    {:noreply, update(socket, :value, &(&1 - 1))}
  end
end
```

To use this in a LiveView:

```elixir
# lib/my_app_web/live/page_live.ex
defmodule MyAppWeb.PageLive do
  use MyAppWeb, :live_view

  alias MyAppWeb.CounterComponent

  def mount(_params, _session, socket) do
    {:ok, assign(socket, initial_count: 10)}
  end

  def render(assigns) do
    ~H"""
    <h1>My Page</h1>
    <%= live_component(@socket, CounterComponent, id: :my_first_counter, value: @initial_count) %>
    <%= live_component(@socket, CounterComponent, id: :my_second_counter, value: 5) %>
    """
  end
end
```

Notice `phx-target={@myself}` which directs events back to the component itself, allowing for isolated state management.

## Managing Contexts with LiveComponents
Context management refers to how data flows and is maintained across different parts of your application. With LiveComponents, this primarily involves:

*   **Parent-to-Child Communication**: Data is passed from the parent LiveView to the LiveComponent via `assigns` in the `live_component/3` helper. The component's `update/2` function will be called when these assigns change.
*   **Child-to-Parent Communication**: LiveComponents can communicate back to their parent LiveView using `send_update/3` (to update *another* component instance or itself), `send_parent/2`, or by emitting a Phoenix event (e.g., `phx-trigger` or `phx-change` combined with `phx-target={@parent}`).
*   **`id` Attribute**: The `id` passed to `live_component/3` is crucial. LiveView uses it to uniquely identify component instances, manage their state, and ensure efficient diffing and patching. Without a unique `id`, LiveComponents can behave unpredictably.

## Utilizing Layouts for Consistent UI
Layouts in Phoenix provide a way to define common structure and styling that wraps around your LiveViews and controllers' views, ensuring a consistent look and feel across your application.

### Phoenix Layout Structure
Phoenix applications typically come with two main layouts:

*   `root.html.heex`: This is the outermost layout. It includes the `<html>`, `<head>`, and `<body>` tags, along with assets like CSS and JavaScript. It contains `<%= @inner_content %>` where `app.html.heex` (or another chosen layout) will be rendered.
*   `app.html.heex`: This is the application-specific layout, often containing headers, footers, navigation, and other elements common to most pages. It also uses `<%= @inner_content %>` to embed the actual LiveView or controller view content.

### Custom Layouts
You can define custom layouts for specific sections of your application (e.g., an admin dashboard, a public marketing site). This is achieved by creating new `.html.heex` files in `lib/my_app_web/live/layouts` (for LiveView layouts) or `lib/my_app_web/templates/layout` (for controller view layouts).

To apply a custom layout to a LiveView, you use `render_layout/2` in your LiveView module:

```elixir
# lib/my_app_web/live/admin_live.ex
defmodule MyAppWeb.AdminLive do
  use MyAppWeb, :live_view

  @impl true
  def render(assigns) do
    ~H"""
    <p>Welcome to the Admin Dashboard!</p>
    """
  end

  @impl true
  def render_layout(assigns, _renderer) do
    ~H"""
    <div class="admin-layout">
      <header>Admin Navigation</header>
      <main>
        <%= @inner_content %>
      </main>
      <footer>Admin Footer</footer>
    </div>
    """
  end
end
```

This `render_layout` function will override the `app.html.heex` layout for `AdminLive` and any LiveComponents rendered within it, but will still be rendered *inside* `root.html.heex`.

For more advanced scenarios, you might configure specific layouts in your `router.ex` for entire LiveView scopes using `live_session`.

## Checklist/Exercises

1.  **Create a `ProductCard` LiveComponent**: Develop a LiveComponent that displays product information (name, price, image). Pass product data to it from a parent LiveView.
2.  **Add Interactivity to `ProductCard`**: Implement a "Add to Cart" button within the `ProductCard` component. This button should update an internal quantity state or send a message back to the parent LiveView to simulate adding an item to a cart.
3.  **Design a Custom Dashboard Layout**: Create a new layout file (e.g., `dashboard.html.heex`) that includes a sidebar navigation and applies it to a dedicated `DashboardLive` LiveView. Ensure `root.html.heex` still wraps your new dashboard layout.
