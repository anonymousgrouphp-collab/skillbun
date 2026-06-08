# Forms & Validation in LiveView

Handling forms and implementing robust validation is a fundamental aspect of web application development. Phoenix LiveView significantly streamlines this process by enabling real-time client-side and server-side validation with a consistent developer experience, primarily leveraging Ecto Changesets.

## 1. Forms in LiveView

LiveView forms are HTML forms rendered by LiveView, where interactions (like input changes or submissions) are handled via websockets without full page reloads.

### Key Concepts:

*   **`form_for/3`**: The primary helper to generate forms. It integrates with Ecto Changesets for initial values and error display.
*   **`phx-submit`**: The event handler for form submission. Instead of a traditional HTTP POST, it sends a `phx-submit` event over the websocket to the LiveView.
*   **`phx-change`**: Used on the `form` or individual inputs to send events on input changes, enabling real-time validation.
*   **`phx-debounce`**: An optional attribute to control the frequency of `phx-change` events, preventing excessive server roundtrips.

## 2. Real-time Client-Side Validation

LiveView allows you to simulate client-side validation directly from the server using `phx-change`. When an input changes, an event is sent to the server. The server re-validates the data (usually with an Ecto Changeset) and re-renders the form with any immediate errors. This provides a fast user experience without writing any JavaScript.

### Workflow:

1.  User types into an input.
2.  `phx-change` event triggers (possibly debounced).
3.  LiveView `handle_event("validate", ...)` is called.
4.  Server applies new input to the Ecto Changeset, runs validations.
5.  LiveView re-renders the form, displaying validation errors next to relevant fields.

## 3. Server-Side Validation with Ecto Changesets

Ecto Changesets are the backbone of validation in Elixir applications. They describe a set of changes to an Ecto schema and provide a robust mechanism for validating data before persistence.

### Integrating Changesets with LiveView:

*   **Initial Setup**: When rendering the form, pass an initial (often empty or pre-filled) Changeset to `form_for/3`.
*   **`handle_event("validate", ...)`**: On `phx-change` events, take the form parameters, `cast` them into a new Changeset, and then `validate` them. Update the LiveView's `socket.assigns.changeset` and re-render.
*   **`handle_event("save", ...)`**: On `phx-submit` events, typically after a `validate` pass, `apply_action` (e.g., `:insert` or `:update`) to the Changeset. If valid, persist the data and redirect or display success. If invalid, update the Changeset in `socket.assigns` with errors and re-render.

## Code Example: User Registration Form

Let's create a simple form for user registration with `name` and `email` fields, demonstrating both real-time (on change) and final (on submit) validation.

First, define your Ecto schema and a changeset function:

```elixir
# lib/my_app/accounts/user.ex
defmodule MyApp.Accounts.User do
  use Ecto.Schema
  import Ecto.Changeset

  schema "users" do
    field :name, :string
    field :email, :string
    timestamps()
  end

  def changeset(user, attrs) do
    user
    |> cast(attrs, [:name, :email])
    |> validate_required([:name, :email])
    |> validate_length(:name, min: 3)
    |> validate_format(:email, ~r/@.+\..+/, message: "must have an @ and a domain")
    |> unique_constraint(:email) # Assuming unique index on email
  end
end
```

Now, your LiveView:

```elixir
# lib/my_app_web/live/user_registration_live.ex
defmodule MyAppWeb.UserRegistrationLive do
  use MyAppWeb, :live_view
  alias MyApp.Accounts
  alias MyApp.Accounts.User
  import Phoenix.HTML.Form # For error_tag

  def mount(_params, _session, socket) do
    changeset = Accounts.create_user_changeset(%User{})
    {:ok, assign(socket, changeset: changeset, saved: false)}
  end

  def render(assigns) do
    ~H"""
    <h1>Register New User</h1>
    <%= if @saved do %>
      <div class="alert alert-success">User registered successfully!</div>
    <% end %>

    <%= form_for @changeset, "#",
        id: "user-form",
        phx_change: "validate",
        phx_submit: "save" %>

      <div class="form-group">
        <%= label :name, "Name" %>
        <%= text_input :name, class: "form-control" %>
        <%= error_tag @changeset, :name %>
      </div>

      <div class="form-group">
        <%= label :email, "Email" %>
        <%= email_input :email, class: "form-control" %>
        <%= error_tag @changeset, :email %>
      </div>

      <%= submit "Register", class: "btn btn-primary", phx_disable_with: "Registering..." %>
    </form>
    """
  end

  # Handle real-time validation
  def handle_event("validate", %{"user" => user_params}, socket) do
    changeset =
      %User{}
      |> User.changeset(user_params)
      |> Map.put(:action, :insert) # Indicate this is for insertion/creation

    {:noreply, assign(socket, changeset: changeset)}
  end

  # Handle form submission
  def handle_event("save", %{"user" => user_params}, socket) do
    case Accounts.create_user(user_params) do
      {:ok, _user} ->
        changeset = Accounts.create_user_changeset(%User{})
        {:noreply, assign(socket, changeset: changeset, saved: true)}
      {:error, %Ecto.Changeset{} = changeset} ->
        {:noreply, assign(socket, changeset: changeset)}
    end
  end
end
```
*Note: `MyApp.Accounts.create_user_changeset/1` and `MyApp.Accounts.create_user/1` would be defined in your `MyApp.Accounts` context, wrapping `User.changeset/2` and `Repo.insert/1` respectively.*

## Checklist/Exercise:

1.  **Implement a `phx-feedback-for`**: Modify the example form to use `phx-feedback-for` on input fields instead of relying solely on `error_tag`, which offers more granular control over error display based on input state (e.g., pending validation, valid, invalid).
2.  **Add a Custom Validator**: Extend the `User.changeset` to include a custom validation function (e.g., `validate_age(changeset, min_age)`) for a new `age` field, ensuring the user is over 18.
3.  **Debounce Validation**: Apply `phx-debounce="500ms"` to the `phx_change` attribute of the form and observe how it affects the real-time validation experience. Explain when this would be beneficial (e.g., for complex validations or to reduce server load).