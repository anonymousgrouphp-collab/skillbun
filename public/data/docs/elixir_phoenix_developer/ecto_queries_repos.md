# Ecto Queries & Repositories

Ecto is the official database wrapper and Language Integrated Query for Elixir. It provides a robust, functional, and extensible way to interact with databases. At its core, Ecto leverages two main components for data interaction: `Ecto.Query` for building powerful queries and `Ecto.Repo` for executing those queries and managing database connections.

## Ecto.Repo: Your Database Gateway

`Ecto.Repo` acts as the interface between your Elixir application and the database. It's responsible for managing connections, executing queries, and handling transactions. You'll define a repository module in your application (e.g., `MyApp.Repo`) that uses `Ecto.Repo`.

### Core Operations

*   **`Repo.all(query)`**: Executes a query and returns all matching results.
*   **`Repo.one(query)`**: Executes a query and expects a single result. Raises an error if more than one result is found.
*   **`Repo.get(schema, id)`**: Retrieves a single record by its primary key.
*   **`Repo.get_by(schema, fields)`**: Retrieves a single record by specific fields.
*   **`Repo.insert(changeset)`**: Inserts a new record into the database.
*   **`Repo.update(changeset)`**: Updates an existing record.
*   **`Repo.delete(changeset)`**: Deletes a record.

### Example: Basic Repo Usage

```elixir
defmodule MyApp.Repo do
  use Ecto.Repo,
    otp_app: :my_app,
    adapter: Ecto.Adapters.Postgres
end

# Assuming you have a MyApp.User schema
alias MyApp.{Repo, User}

# Get a user by ID
user = Repo.get(User, 1)

# Find all users
all_users = Repo.all(User)
```

## Ecto.Query: Building Flexible & Composable Queries

`Ecto.Query` provides a powerful DSL (Domain Specific Language) for constructing database queries in a safe and composable manner. Queries are built as structs and then passed to `Ecto.Repo` for execution.

### Basic Query Building Blocks

*   **`from`**: Defines the source (schema) for your query.
    ```elixir
    import Ecto.Query
    from u in User
    ```
*   **`select`**: Specifies which fields or aggregates to retrieve.
    ```elixir
    from u in User, select: u.name
    from u in User, select: {u.name, u.email}
    ```
*   **`where`**: Filters records based on conditions.
    ```elixir
    from u in User, where: u.age > 18
    from u in User, where: u.name == "Alice" and u.is_active == true
    ```
*   **`order_by`**: Sorts the results.
    ```elixir
    from u in User, order_by: [desc: u.inserted_at]
    ```
*   **`limit` / `offset`**: Paginates results.
    ```elixir
    from u in User, limit: 10, offset: 20
    ```
*   **`join` / `preload`**: Handles relationships between schemas. `join` is for filtering or selecting from related tables; `preload` fetches associated data in separate queries (or a single query with `join` if configured).
    ```elixir
    # Join with posts to find users with a specific post title
    from u in User,
      join: p in assoc(u, :posts),
      where: p.title == "My First Post"

    # Preload user's posts
    Repo.all(from u in User, preload: [:posts])
    ```

### Composing Queries with the Pipe Operator

One of Ecto's strengths is its composability, often leveraged with the pipe operator (`|>`).

```elixir
import Ecto.Query
alias MyApp.User
alias MyApp.Repo

# Build a query step-by-step
active_users_query =
  from u in User,
    where: u.is_active == true

recent_active_users_query =
  active_users_query
  |> order_by([u], desc: u.inserted_at)
  |> limit(5)

Repo.all(recent_active_users_query)
```

## Putting It Together: A Comprehensive Example

Let's assume you have `MyApp.User` and `MyApp.Post` schemas, where a user `has_many` posts.

```elixir
defmodule MyApp.User do
  use Ecto.Schema
  import Ecto.Changeset

  schema "users" do
    field :name, :string
    field :email, :string
    field :age, :integer
    field :is_active, :boolean, default: true
    has_many :posts, MyApp.Post
    timestamps()
  end

  def changeset(user, attrs) do
    user
    |> cast(attrs, [:name, :email, :age, :is_active])
    |> validate_required([:name, :email])
    |> unique_constraint(:email)
  end
end

defmodule MyApp.Post do
  use Ecto.Schema
  import Ecto.Changeset

  schema "posts" do
    field :title, :string
    field :body, :string
    belongs_to :user, MyApp.User
    timestamps()
  end

  def changeset(post, attrs) do
    post
    |> cast(attrs, [:title, :body, :user_id])
    |> validate_required([:title, :body, :user_id])
  end
end

alias MyApp.{Repo, User, Post}
import Ecto.Query

# 1. Insert a new user
{:ok, new_user} =
  %User{}
  |> User.changeset(%{name: "Charlie", email: "charlie@example.com", age: 30})
  |> Repo.insert()

IO.puts "Inserted User: #{inspect new_user.name}"

# 2. Insert a post for the new user
{:ok, new_post} =
  %Post{}
  |> Post.changeset(%{title: "Charlie's First Post", body: "Hello from Charlie!", user_id: new_user.id})
  |> Repo.insert()

IO.puts "Inserted Post: #{inspect new_post.title}"

# 3. Build and execute a complex query:
#    Find all active users older than 25, who have at least one post,
#    order them by name, and preload their posts.
complex_query =
  from u in User,
    where: u.is_active == true and u.age > 25,
    join: p in assoc(u, :posts),
    group_by: u.id,
    having: count(p.id) > 0, # Ensure they have at least one post
    order_by: [asc: u.name],
    preload: [:posts] # Preload their posts

found_users = Repo.all(complex_query)

IO.puts "\nFound Users matching complex query:"
for user <- found_users do
  IO.puts "- User: #{user.name} (Age: #{user.age})"
  for post <- user.posts do
    IO.puts "  - Post: #{post.title}"
  end
end

# 4. Update a user
{:ok, updated_user} =
  new_user
  |> User.changeset(%{age: 31})
  |> Repo.update()

IO.puts "\nUpdated User age: #{inspect updated_user.age}"

# 5. Delete a post
{:ok, _} = Repo.delete(new_post)
IO.puts "\nDeleted post: #{inspect new_post.title}"
```

## Checklist/Exercises

1.  **Repo.get_by vs. Repo.one**: Explain the difference between `Repo.get_by(User, email: "test@example.com")` and `Repo.one(from u in User, where: u.email == "test@example.com")`. When would you prefer one over the other?
2.  **Building a Dynamic Query**: Write an Elixir function that takes an `Ecto.Query` struct and an optional `name_filter` (string) and `min_age` (integer) to dynamically add `where` clauses to the query.
3.  **Preload vs. Join**: Describe a scenario where `preload` is more appropriate than `join` for fetching associated data, and vice-versa.