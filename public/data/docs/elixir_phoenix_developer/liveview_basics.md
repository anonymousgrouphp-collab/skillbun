# Understanding LiveView Lifecycle & Interactions

Phoenix LiveView brings the power of real-time, interactive user interfaces to web applications without writing custom JavaScript. It achieves this by managing a persistent connection between the client and server, where the server renders and sends HTML patches. Understanding its lifecycle is crucial for building robust and reactive applications.

## Core LiveView Lifecycle Callbacks

LiveView instances on the server follow a well-defined lifecycle, primarily managed by a few key callback functions:

### `mount/3`

This function is the entry point for a LiveView process. It's called twice:

1.  **Initial HTTP Request (disconnected state):** When a user first navigates to the LiveView page, `mount/3` is called with `_params, _session, socket` where `socket.assigns.live_action` is typically `:mount` and `connected?` is `false`. Here, you should load initial data that's required for the first render, but avoid heavy operations or side effects like subscribing to PubSub, as the socket might not be fully established yet.
2.  **WebSocket Connection (connected state):** After the initial HTTP request, the client establishes a WebSocket connection. `mount/3` is called again, this time with `connected?` being `true`. This is the ideal place to perform operations that require a persistent connection, such as fetching dynamic data, subscribing to PubSub topics, or setting up periodic tasks.

`mount/3` must return `{:ok, socket}` with the initial state assigned to `socket.assigns`.

### `render/1`

This function is responsible for generating the HTML markup for the LiveView. It receives the `socket.assigns` as its argument and returns the HEEx template. `render/1` is automatically called whenever the `socket.assigns` change (e.g., after `handle_event` updates the socket) or explicitly by `Phoenix.LiveView.push_redirect/2` or `Phoenix.LiveView.push_patch/2`.

It should be a pure function, meaning it should only depend on its input (`assigns`) and not have any side effects. This ensures efficient re-rendering.

### `handle_event/3`

This function is the primary mechanism for handling user interactions and events originating from the client-side. When a UI element with a `phx-` binding (like `phx-click`, `phx-submit`, `phx-change`) triggers an event, `handle_event/3` is invoked on the server.

-   `event`: The name of the event (string). This corresponds to the value of the `phx-` attribute.
-   `params`: A map of parameters sent from the client (e.g., form input values, event details).
-   `socket`: The current LiveView socket.

Inside `handle_event`, you typically update the `socket.assigns` based on the event and parameters, and then return `{:noreply, socket}`. Updating `socket.assigns` will automatically trigger a re-render of the LiveView via `render/1` if the state changes.

### `handle_info/2` (For Server-Side Messages)

While not directly part of user interaction, `handle_info/2` is crucial for server-initiated updates. It handles messages sent to the LiveView's process from other processes (e.g., PubSub, background tasks, `Phoenix.PubSub.broadcast/3`). This allows LiveViews to react to changes originating from outside the immediate user interaction, updating their state and re-rendering accordingly.

## State Management in LiveView

LiveView manages its state within the `socket.assigns` map. Any data placed in `assigns` during `mount`, `handle_event`, or `handle_info` becomes available to the `render` function and persists across interactions within the same LiveView process.

Changes to `socket.assigns` are diffed by LiveView, and only the necessary HTML patches are sent to the client, ensuring efficiency.

## Basic User Interactions

LiveView uses `phx-` attributes to bind client-side events to server-side `handle_event` callbacks:

-   `phx-click=