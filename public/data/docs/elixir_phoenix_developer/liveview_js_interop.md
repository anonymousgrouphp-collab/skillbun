## JavaScript Interoperability in Phoenix LiveView

Phoenix LiveView offers an incredible amount of interactivity without writing a single line of client-side JavaScript. However, there are scenarios where integrating custom JavaScript is essential. This guide covers how to manage client-side features that LiveView doesn't directly cover using `phx-hook` and `JS.exec`.

### 1. The Need for JavaScript Interoperability

While LiveView excels at managing the DOM and state on the server, certain client-side functionalities are best handled by JavaScript:
*   **Complex UI components:** Third-party libraries like date pickers, rich text editors, or charting libraries.
*   **Direct DOM manipulation:** When LiveView's patching mechanism isn't granular enough, or you need to interact with elements outside the LiveView component's scope.
*   **Client-side-only operations:** Browser storage, device APIs, or specific animations.
*   **Performance-critical updates:** Frequent, high-performance DOM updates that are better handled directly in the browser.

### 2. `phx-hook`: Client-side Hooks for LiveView Elements

`phx-hook` allows you to attach custom JavaScript behavior to specific DOM elements managed by LiveView. When an element with a `phx-hook` attribute is added to the DOM, updated, or removed, corresponding JavaScript functions are called. This provides a lifecycle for your client-side code, keeping it synchronized with LiveView's rendering.

#### Core Concepts:
*   **Hooks Object:** A JavaScript object containing functions that define the hook's behavior.
*   **Lifecycle Callbacks:** Specific functions (`mounted`, `updated`, `destroyed`, etc.) within your hook object that LiveView calls at different stages of the element's lifecycle.
*   **`this.el`:** Inside a hook function, `this.el` refers to the DOM element to which the hook is attached.
*   **`this.pushEvent(event, payload, callback)`:** Allows the client to send events to the LiveView process.
*   **`this.handleEvent(event, callback)`:** Allows the hook to listen for events pushed from the LiveView process.

#### Key Lifecycle Callbacks:
*   `mounted()`: Called once when the element is first added to the DOM.
*   `updated()`: Called every time the element's attributes or children are updated by LiveView.
*   `destroyed()`: Called when the element is removed from the DOM.
*   `beforeUpdate()`: Called before LiveView updates the element.
*   `beforePatch(dom, cb)`: Called before LiveView patches the DOM. Useful for delaying patching for animations.
*   `afterPatch(dom)`: Called after LiveView patches the DOM.
*   `reconnected()`: Called when the LiveView websocket reconnects.
*   `disconnected()`: Called when the LiveView websocket disconnects.

#### Example: A Simple Counter with `phx-hook`

**1. `app.js` (or your client-side JS file):**

```javascript
let Hooks = {};

Hooks.Counter = {
  mounted() {
    console.log("Counter hook mounted for element:", this.el);
    this.count = parseInt(this.el.dataset.initialCount || 0, 10);
    this.el.querySelector(".increment-btn").addEventListener("click", e => {
      this.count++;
      this.el.querySelector(".count-display").textContent = this.count;
      this.pushEvent("client_increment", { new_count: this.count });
    });
  },
  updated() {
    // Can update based on server-side changes if needed
    console.log("Counter hook updated for element:", this.el);
  },
  destroyed() {
    console.log("Counter hook destroyed for element:", this.el);
  }
};

// Initialize LiveSocket with hooks
import { Socket } from "phoenix";
import { LiveSocket } from "phoenix_live_view";

let csrfToken = document.querySelector("meta[name='csrf-token']").getAttribute("content");
let liveSocket = new LiveSocket("/live", Socket, { 
  params: { _csrf_token: csrfToken }, 
  hooks: Hooks // Pass your Hooks object here
});
liveSocket.connect();
```

**2. `live_view.html.heex` (or your LiveView template):**

```html
<div id="my-counter" phx-hook="Counter" data-initial-count="<%= @initial_count %>">
  <h2>Client-side Counter</h2>
  <p>Count: <span class="count-display"><%= @initial_count %></span></p>
  <button class="increment-btn">Increment Client-side</button>
</div>
```

**3. `my_live.ex` (Your LiveView module):**

```elixir
def mount(_params, _session, socket) do
  {:ok, assign(socket, :initial_count, 0)}
end

def handle_event("client_increment", %{"new_count" => new_count}, socket) do
  IO.inspect("Client incremented to: #{new_count}", label: "LiveView received event")
  {:noreply, socket}
end
```

### 3. `JS.exec`: Executing Client-Side Commands from LiveView

`JS.exec` (or `Phoenix.LiveView.JS` commands) allows you to declaratively define client-side JavaScript actions directly from your LiveView. These commands are then executed by the LiveView client when triggered by specific events (e.g., `phx-click`, `phx-submit`) or pushed programmatically from the server.

#### Core Concepts:
*   **Declarative API:** Define a sequence of JavaScript actions in Elixir code.
*   **Event-driven:** Most commonly used with `phx-click`, `phx-submit`, `phx-change` attributes in your HTML, or pushed from `handle_event`/`handle_info` callbacks.
*   **Built-in Commands:** `JS.toggle`, `JS.show`, `JS.hide`, `JS.add_class`, `JS.remove_class`, `JS.set_attribute`, `JS.focus`, `JS.navigate`, `JS.push`, `JS.dispatch`, `JS.exec` (for raw JS).
*   **Chaining:** Commands can be chained together (`JS.hide("#el") |> JS.show("#other-el")`).

#### Example: Toggling a Modal and Dispatching a Custom Event

**1. `my_live.ex` (Your LiveView module):**

```elixir
def render(assigns) do
  ~H"""
  <button 
    phx-click={JS.toggle(to: "#my-modal", display: "flex") 
               |> JS.dispatch("modal_opened", detail: %{id: "my-modal"})}
    class="button is-primary"
  >
    Open Modal
  </button>

  <div id="my-modal" style="display: none;" class="modal">
    <div class="modal-background"></div>
    <div class="modal-content">
      <p>This is a modal!</p>
      <button 
        phx-click={JS.hide(to: "#my-modal") 
                   |> JS.dispatch("modal_closed", detail: %{id: "my-modal"})}
        class="button is-danger">
        Close
      </button>
    </div>
    <button 
      phx-click={JS.hide(to: "#my-modal")}
      class="modal-close is-large" 
      aria-label="close">
    </button>
  </div>

  <p id="modal-status">Modal is currently closed.</p>
  """
end

# Example of pushing JS from server
def handle_event("open_modal_from_server", _value, socket) do
  socket = push_event(socket, "js", %{to: "#my-modal", do: JS.show(to: "#my-modal", display: "flex")})
  {:noreply, socket}
end
```

**2. `app.js` (Listening for custom events):**

```javascript
// Inside your LiveSocket setup
liveSocket.main.addEventListener("modal_opened", (e) => {
  document.getElementById("modal-status").textContent = `Modal ${e.detail.id} opened!`;
  console.log("Modal opened event received:", e.detail);
});

liveSocket.main.addEventListener("modal_closed", (e) => {
  document.getElementById("modal-status").textContent = `Modal ${e.detail.id} closed.`;
  console.log("Modal closed event received:", e.detail);
});
```

### Checklist / Exercises:

1.  **Explain the difference:** Describe when you would prefer using a `phx-hook` over `JS.exec` for a client-side interaction and vice-versa.
2.  **Implement a custom event:** Create a `phx-hook` that dispatches a custom client-side event (`this.el.dispatchEvent`) upon its `mounted` lifecycle callback. Then, create a `JS.exec` command that listens for this custom event and performs a `JS.toggle` on another element.
3.  **Third-party integration:** Outline the steps (without writing full code) you would take to integrate a simple client-side JavaScript library (e.g., a simple chart library like Chart.js) into a LiveView component using `phx-hook`.