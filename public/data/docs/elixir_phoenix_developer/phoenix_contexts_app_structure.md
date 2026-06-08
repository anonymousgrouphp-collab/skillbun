# Contexts & Application Structure in Phoenix

Phoenix Contexts provide a powerful and idiomatic way to organize your application's business logic, fostering a clear, maintainable, and domain-driven architecture. Rather than co-mingling data access, validation, and business rules within controllers or models, contexts establish clear boundaries for distinct domains within your application.

## What are Phoenix Contexts?

In Phoenix, a Context is a module (or a set of modules) that encapsulates a specific set of related business functionalities and data. Think of them as "bounded contexts" from Domain-Driven Design (DDD). Each context is responsible for a particular domain or sub-domain of your application, acting as the public API for interacting with that domain's data and logic.

For example, in an e-commerce application, you might have contexts for:
*   `Accounts` (managing users, authentication)
*   `Products` (managing product listings, inventory)
*   `Orders` (processing orders, managing shipments)
*   `Payments` (handling transactions)

## Why Use Contexts?

1.  **Clear Separation of Concerns:** Contexts explicitly separate business logic from the web interface (controllers/views) and raw data access (schemas). Controllers become thin interfaces that delegate to contexts.
2.  **Improved Maintainability:** With well-defined boundaries, changes in one context are less likely to ripple through unrelated parts of the application. This makes reasoning about the codebase much easier.
3.  **Enhanced Testability:** Each context can be tested in isolation, verifying its business rules and data interactions without needing to spin up the entire application or rely on web-specific components.
4.  **Domain-Driven Design (DDD):** Contexts encourage thinking in terms of business domains, leading to an application structure that mirrors the real-world problem it solves.
5.  **Reduced Duplication:** Common logic related to a domain (e.g., fetching a user, validating product data) resides in one place within its context, preventing duplication across controllers.
6.  **Scalability & Team Collaboration:** Larger applications can be broken down into smaller, manageable contexts, allowing different teams or developers to work on separate domains concurrently with fewer conflicts.

## Structure of a Context

A typical Phoenix context module contains functions that serve as the public API for its domain. These functions often:
*   Retrieve data (e.g., `list_users/0`, `get_post!/1`).
*   Create, update, or delete records (e.g., `create_user/1`, `update_post/2`, `delete_product/1`).
*   Apply business rules and validations.
*   Interact with Ecto schemas and changesets.

**Crucially, controllers, views, and other parts of your application should interact with the database *only* through these context functions.**

## Generating a Context

Phoenix provides a convenient mix task to generate a context along with its schema and basic functions:

```bash
mix phx.gen.context Accounts User users email:string password_hash:string
```

This command will:
*   Create `lib/my_app/accounts.ex` (the context module).
*   Create `lib/my_app/accounts/user.ex` (the Ecto schema).
*   Add basic CRUD functions to `Accounts` (e.g., `list_users/0`, `get_user!/1`, `create_user/1`, `update_user/2`, `delete_user/1`).

## Simple Code Example

Let's imagine a `Blog` application with `Posts`.

### `lib/blog_web/controllers/post_controller.ex`

```elixir
defmodule BlogWeb.PostController do
  use BlogWeb, :controller

  alias Blog.Blog

  def index(conn, _params) do
    posts = Blog.list_posts() # Delegate to the Blog context
    render(conn, "index.html", posts: posts)
  end

  def show(conn, %{"id" => id}) do
    post = Blog.get_post!(id) # Delegate to the Blog context
    render(conn, "show.html", post: post)
  end

  def create(conn, %{"post" => post_params}) do
    case Blog.create_post(post_params) do # Delegate creation to context
      {:ok, post} ->
        conn
        |> put_flash(:info, "Post created successfully.")
        |> redirect(to: Routes.post_path(conn, :show, post))
      {:error, %Ecto.Changeset{} = changeset} ->
        render(conn, "new.html", changeset: changeset)
    end
  end

  # ... other actions like edit, update, delete
end
```

### `lib/blog/blog.ex` (The Context Module)

```elixir
defmodule Blog.Blog do
  @moduledoc """
  The Blog context manages all operations related to blog posts.
  """

  import Ecto.Query, warn: false
  alias Blog.Repo
  alias Blog.Blog.Post

  @doc """
  Returns the list of posts.
  """
  def list_posts do
    Repo.all(Post)
  end

  @doc """
  Gets a single post by ID.
  Raises Ecto.NoResultsError if the post does not exist.
  """
  def get_post!(id) do
    Repo.get!(Post, id)
  end

  @doc """
  Creates a post with the given `attrs`.
  """
  def create_post(attrs \\ %{}) do
    %Post{}
    |> Post.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a post with the given `attrs`.
  """
  def update_post(%Post{} = post, attrs) do
    post
    |> Post.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking post changes.
  """
  def change_post(%Post{} = post, attrs \\ %{}) do
    Post.changeset(post, attrs)
  end
end
```

### `lib/blog/blog/post.ex` (The Ecto Schema)

```elixir
defmodule Blog.Blog.Post do
  use Ecto.Schema
  import Ecto.Changeset

  schema "posts" do
    field :title, :string
    field :content, :string

    timestamps()
  end

  @doc false
  def changeset(post, attrs) do
    post
    |> cast(attrs, [:title, :content])
    |> validate_required([:title, :content])
    |> validate_length(:title, min: 5, max: 100)
    |> validate_length(:content, min: 10)
  end
end
```

In this example, the `PostController` interacts exclusively with the `Blog` context module. All business logic, data validation (via changesets), and persistence operations for posts are handled within the `Blog` context, keeping the controller lean and focused on HTTP request/response handling.

## Checklist/Exercise

1.  **Identify Domain Boundaries:** For a simple task management application, suggest two distinct contexts you would create and briefly describe their responsibilities.
2.  **Role of Controllers:** Explain why Phoenix controllers should delegate business logic to contexts rather than implementing it directly.
3.  **Context Function Signature:** If you needed a function in an `Accounts` context to register a new user with an email and password, what would its typical function signature look like, and what would it return in a success case?