## Routing & Controllers in Phoenix

In the Phoenix Framework, routing and controllers are fundamental components that handle incoming HTTP requests, direct them to appropriate logic, and prepare responses. They form the backbone of how your web application interacts with users.

### 1. The Phoenix Router

The Phoenix Router (`lib/your_app_web/router.ex`) is responsible for defining how HTTP requests are mapped to controller actions. It's the entry point for all web requests to your application.

#### Key Concepts:

*   **Scopes:** Group routes with common paths and pipeline configurations. For example, `/api` or `/admin` routes can be scoped.
*   **Pipelines:** A series of plugs (middleware) that process the `conn` (connection) before it reaches a controller action. Examples include `browser` (for HTML applications) and `api` (for JSON APIs).
*   **HTTP Verbs:** Define routes for specific HTTP methods like `get`, `post`, `put`, `delete`, `patch`.
*   **Resources:** A convenient macro to define a set of RESTful routes (index, show, new, create, edit, update, delete) for a given resource, pointing to a controller.

#### Example Route Definition (`lib/your_app_web/router.ex`):

```elixir
defmodule YourAppWeb.Router do
  use YourAppWeb, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_live_flash
    plug :put_root_layout, {YourAppWeb.LayoutView, :root}
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/", YourAppWeb do
    pipe_through :browser # Use the default browser pipeline

    get "/", PageController, :home
    get "/users/:id", UserController, :show # Route with a path parameter
  end

  # Example of API scope
  scope "/api", YourAppWeb do
    pipe_through :api

    resources "posts", PostController, except: [:new, :edit]
  end
end
```

### 2. Phoenix Controllers

Controllers are Elixir modules that contain functions (called actions) which implement the logic for handling specific requests. When a request matches a route, the router dispatches it to the corresponding controller action.

#### Key Concepts:

*   **`conn` (Connection):** The primary argument passed to every controller action. It's a struct representing the entire request and response lifecycle, allowing you to read request data and build the response.
*   **`params` (Parameters):** The second argument, a map containing all request parameters (path parameters, query parameters, and body parameters).
*   **Actions:** Public functions within a controller (e.g., `home`, `show`, `create`) that correspond to different routes.
*   **Rendering:** Controllers typically end by rendering a view (`render(conn, "index.html")`) or redirecting (`redirect(conn, to: "/")`).

#### Example Controller Definition (`lib/your_app_web/controllers/page_controller.ex`):

```elixir
defmodule YourAppWeb.PageController do
  use YourAppWeb, :controller

  # Handles GET / request
  def home(conn, _params) do
    # _params indicates we don't need params for this action
    render(conn, "home.html")
  end
end
```

#### Example Controller Action with Parameters (`lib/your_app_web/controllers/user_controller.ex`):

```elixir
defmodule YourAppWeb.UserController do
  use YourAppWeb, :controller

  # Handles GET /users/:id request
  def show(conn, %{"id" => user_id}) do
    # In a real app, you would fetch the user from a database
    # For now, let's just respond with the ID
    conn
    |> put_resp_content_type("text/plain")
    |> send_resp(200, "Displaying user with ID: #{user_id}")
  end

  # Handles POST /users request (e.g., from a form submission or API call)
  def create(conn, %{"user" => user_params}) do
    # user_params might contain %{"name" => "Alice", "email" => "alice@example.com"}
    # In a real app, you'd save this to the database
    IO.inspect(user_params, label: "New User Data")
    conn
    |> put_resp_content_type("application/json")
    |> send_resp(201, "{\"message\": \"User created successfully\", \"name\": \"#{user_params["name"]}\"}")
  end
end
```

### 3. Handling HTTP Requests

When an HTTP request arrives at your Phoenix application:

1.  The Plug dispatcher (part of Phoenix's core) receives the request.
2.  The request passes through the `router.ex` file, which attempts to match the request's path and HTTP method against defined routes.
3.  If a match is found, the request is piped through the associated plug pipeline(s).
4.  Finally, the request reaches the specified controller action.
5.  The controller action processes the request using the `conn` and `params`, performs any necessary logic, and constructs a response (e.g., rendering HTML, sending JSON, redirecting).

### 4. Managing Request Parameters

Parameters are crucial for dynamic web applications. Phoenix makes it easy to access them:

*   **Path Parameters:** Defined in the route with a colon (e.g., `/users/:id`). Accessed via the `params` map: `%{"id" => "123"}`.
*   **Query Parameters:** Appended to the URL after a `?` (e.g., `/search?q=elixir`). Accessed via `params`: `%{"q" => "elixir"}`.
*   **Body Parameters:** Sent in the request body, typically for `POST`, `PUT`, or `PATCH` requests (e.g., form submissions, JSON payloads). Phoenix automatically parses these into the `params` map.

You can use pattern matching in your controller action's function signature to directly extract specific parameters, making your code cleaner and more robust.

### Checklist/Exercises:

1.  **Create a New Route and Controller:** Define a `GET "/about"` route in your `router.ex` that points to an `AboutController` and a `:index` action. Create the `AboutController` and its `index` action to render a simple "About Us" message (e.g., plain text response).
2.  **Handle a Path Parameter:** Extend your `UserController` with a new `GET "/users/profile/:username"` route. In the corresponding controller action, extract `:username` from the `params` and return a response like "Viewing profile for: [username]".
3.  **Process a Query Parameter:** Modify the `/about` route from Exercise 1 to accept an optional query parameter, `?year=2023`. If `year` is provided, include it in your "About Us" response (e.g., "About Us - Est. 2023"); otherwise, provide the default message.
