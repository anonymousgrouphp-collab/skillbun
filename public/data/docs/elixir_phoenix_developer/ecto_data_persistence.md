# Data Persistence with Ecto

Ecto is Elixir's official data mapping and query tool, providing a robust and functional approach to interacting with databases. While often compared to ORMs (Object-Relational Mappers), Ecto is more accurately described as a "data mapper" and "query builder," offering explicit control over your data and queries, which aligns well with Elixir's functional paradigm. It's an indispensable part of most Phoenix applications for managing data persistence.

## Core Concepts

Ecto is built around several key components that work together to provide a powerful and flexible data access layer:

### 1. Repo

The `Repo` (Repository) is the primary interface for your application to interact with the database. It's responsible for managing connections, running queries, and performing transactions. In a Phoenix application, you typically define a `Repo` module (e.g., `MyApp.Repo`) and configure it with your database adapter (e.g., `Ecto.Adapters.Postgres`).

```elixir
# lib/my_app/repo.ex
defmodule MyApp.Repo do
  use Ecto.Repo,
    otp_app: :my_app,
    adapter: Ecto.Adapters.Postgres
end
```

### 2. Schema

An Ecto Schema defines the structure of your data and how it maps to a database table. It specifies the fields, their types, and any relationships between schemas. Schemas are Elixir structs that represent your database records.

```elixir
# lib/my_app/user.ex
defmodule MyApp.User do
  use Ecto.Schema
  import Ecto.Changeset

  schema "users" do
    field :name, :string
    field :email, :string
    field :age, :integer, default: 0
    timestamps()
  end

  def changeset(user, attrs) do
    user
    |> cast(attrs, [:name, :email, :age])
    |> validate_required([:name, :email])
    |> validate_number(:age, greater_than_or_equal_to: 0)
    |> unique_constraint(:email) # Ensures email is unique
  end
end
```

### 3. Changeset

A `Changeset` is a crucial component for handling data validation, casting, and preparation before persisting it to the database. Instead of directly modifying schema structs, you build a changeset, apply changes, validate them, and then pass the changeset to the `Repo` for insertion or update. This immutable approach makes data manipulation safe and explicit.

The `changeset/2` function in the `MyApp.User` example demonstrates:
*   `cast/3`: Filters and converts input attributes (`attrs`) to the correct types based on the schema fields.
*   `validate_required/2`: Ensures specified fields are present.
*   `validate_number/3`: Adds custom validation logic.
*   `unique_constraint/2`: Adds a constraint to ensure uniqueness in the database.

### 4. Querying

Ecto provides a powerful and composable DSL (Domain-Specific Language) for building database queries. Queries are written in Elixir, allowing for compile-time checks and an expressive way to fetch and manipulate data.

```elixir
import Ecto.Query

# Fetch all users
users = MyApp.Repo.all(MyApp.User)

# Fetch a user by ID
user = MyApp.Repo.get(MyApp.User, 1)

# Query with conditions
active_users = from u in MyApp.User, where: u.age >= 18, select: u
MyApp.Repo.all(active_users)

# Query with joins and preloads (assuming a `Post` schema with `belongs_to :user`)
# posts_with_users = from p in MyApp.Post,
#                      join: u in assoc(p, :user),
#                      where: u.name == "Alice",
#                      preload: [:user]
# MyApp.Repo.all(posts_with_users)
```

## Simple Example: Creating and Querying a User

Let's put these concepts together to create a user and then query for it.

```elixir
# 1. Prepare some user attributes
user_attrs = %{name: "Alice", email: "alice@example.com", age: 30}

# 2. Create a new User struct and build a changeset
new_user = %MyApp.User{}
changeset = MyApp.User.changeset(new_user, user_attrs)

# 3. Insert the user into the database using Repo
case MyApp.Repo.insert(changeset) do
  {:ok, user} ->
    IO.puts "User created successfully: #{inspect user}"
    # Example: Query the user we just created
    fetched_user = MyApp.Repo.get_by(MyApp.User, email: "alice@example.com")
    IO.puts "Fetched user: #{inspect fetched_user}"
  {:error, changeset} ->
    IO.puts "Failed to create user: #{inspect changeset.errors}"
end
```
*(Note: For this example to run, you'd need a running Elixir application with Ecto configured, a database, and migrations applied to create the `users` table.)*

## Quick Understanding Checklist/Exercise

1.  **Explain the purpose of an Ecto Changeset.** Why is it used instead of directly modifying a Schema struct?
2.  **Write an Ecto query** to find all users named "Bob" who are older than 25.
3.  **Describe the role of `MyApp.Repo`** and how it connects your Elixir application to the database.