# Ecto Schemas & Migrations: Defining Data Structures and Managing Database Changes

## Introduction to Ecto

Ecto is a powerful Elixir library that serves as a data mapping and query tool for databases. While often referred to as an ORM (Object-Relational Mapper), it's more accurately described as a data mapper. Ecto allows Elixir applications to interact with various databases (like PostgreSQL, MySQL, SQLite) in a functional and type-safe manner, providing a robust foundation for data persistence, validation, and querying.

Its primary purpose is to:
*   Define the structure of your data in Elixir (schemas).
*   Manage changes to your database schema over time (migrations).
*   Perform database operations like creating, reading, updating, and deleting records.
*   Enforce data consistency and integrity.

## Ecto Schemas: Defining Your Data Structures

Ecto schemas are Elixir modules that define the structure of your data and how it maps to a specific table in your database. They act as a blueprint for your data records, specifying the fields, their types, and any associated metadata.

### Core Concepts:
*   **`use Ecto.Schema`**: Imports necessary Ecto functions and macros into your module.
*   **`schema "table_name" do ... end`**: Defines the mapping to a database table. The table name is typically pluralized (e.g., `"users"`).
*   **`field :name, :type, options`**: Declares a column in the database table and its corresponding Elixir type. Common types include `:string`, `:integer`, `:float`, `:boolean`, `:datetime`, `:date`, `:time`, `:binary_id`.
*   **`timestamps()`**: A macro that automatically adds `inserted_at` and `updated_at` fields to your schema, which Ecto manages automatically on record creation and update.

### Example: User Schema

Let's define a simple `User` schema that maps to a `users` table in the database.

```elixir
defmodule MyApp.Accounts.User do
  use Ecto.Schema
  import Ecto.Changeset # Used for data validation, often paired with schemas

  schema "users" do
    field :name, :string, null: false
    field :email, :string, null: false
    field :age, :integer
    field :is_active, :boolean, default: true

    timestamps()
  end

  @doc """
  A changeset function for validating user attributes.
  """
  def changeset(user, attrs) do
    user
    |> cast(attrs, [:name, :email, :age, :is_active])
    |> validate_required([:name, :email])
    |> validate_format(:email, ~r/@/)
    |> unique_constraint(:email) # Requires a unique index on 'email' in the DB
  end
end
```

## Ecto Migrations: Managing Database Changes

Ecto migrations are Elixir scripts that allow you to evolve your database schema in a controlled and versioned manner. Each migration represents a set of changes to your database, such as creating tables, adding columns, or modifying existing ones. This ensures that your database structure can be consistently updated across different environments (development, staging, production).

### Core Concepts:
*   **Generating Migrations**: Use `mix ecto.gen.migration <migration_name>` to create a new migration file. This generates a timestamped file in `priv/repo/migrations/`.
*   **`def change do ... end`**: This function is the preferred way to define migrations. Ecto can automatically infer how to reverse these changes (e.g., `create table` is reversed by `drop table`).
*   **`def up do ... end` / `def down do ... end`**: Used for more complex or irreversible changes, where you manually define how to apply (`up`) and revert (`down`) the migration.
*   **Common Operations**: Ecto provides a rich set of functions for schema manipulation:
    *   `create table(:table_name)`: Creates a new table.
    *   `add :table, :column_name, :type, options`: Adds a new column to a table.
    *   `remove :table, :column_name`: Removes a column.
    *   `rename table(:table_name), :old_column, to: :new_column`: Renames a column.
    *   `alter table(:table_name) do ... end`: Modifies an existing table (e.g., `modify :column_name, :new_type`).
    *   `create index(:table_name, [:column1, :column2])`: Creates an index.
    *   `create unique_index(:table_name, [:column])`: Creates a unique index.

### Example: Create Users Table Migration

This migration creates the `users` table corresponding to our `User` schema.

```elixir
defmodule MyApp.Repo.Migrations.CreateUsersTable do
  use Ecto.Migration

  def change do
    create table(:users) do
      add :name, :string, null: false
      add :email, :string, null: false
      add :age, :integer
      add :is_active, :boolean, default: true

      timestamps()
    end

    # It's good practice to add a unique index for fields like email
    create unique_index(:users, [:email])
  end
end
```

### Running Migrations:
*   **`mix ecto.migrate`**: Applies all pending migrations to the configured database.
*   **`mix ecto.rollback`**: Reverts the last batch of applied migrations.
*   **`mix ecto.reset`**: Drops the database, creates it, and runs all migrations from scratch (useful for development and testing).

## The Relationship Between Schemas and Migrations

Ecto schemas and migrations work hand-in-hand:
*   **Migrations** are the source of truth for your actual database structure. They define *what* the database looks like.
*   **Schemas** are the Elixir-level representation of that database structure. They define *how* your Elixir application interacts with the data in those tables.

It is crucial to keep your schemas synchronized with your migrations. When you add a new field in a schema, you almost always need a corresponding migration to add that column to the database table. Similarly, if you drop a column via a migration, you should remove it from the corresponding schema.

## Quick Understanding Check

1.  What is the primary role of an Ecto schema in an Elixir application, and how does it relate to a database table?
2.  You've just added a new `address` field to your `User` schema. What `mix` command would you use next to prepare your database for this change?
3.  Which `Ecto.Migration` function is preferred for defining changes that can be automatically reversed by Ecto?