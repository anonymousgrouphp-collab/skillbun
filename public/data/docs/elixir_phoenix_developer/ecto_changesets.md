# Ecto Changesets: Mastering Data Validation and Manipulation

Ecto Changesets are a fundamental concept in Elixir's Ecto library, providing a powerful and declarative way to track, validate, and manipulate data before persisting it to the database. They are the cornerstone for ensuring data integrity and managing user input in Phoenix applications.

## What is an Ecto Changeset?

At its core, a `Changeset` is an Ecto struct (`%Ecto.Changeset{}`) that represents a set of proposed changes to an Ecto schema. It doesn't modify the database directly but rather serves as a buffer that holds:

*   The original Ecto schema struct (if updating an existing record).
*   The proposed `changes` (a map of field names to new values).
*   Any `errors` encountered during validation.
*   The `valid?` status, indicating if the proposed changes are valid.
*   Information about the `repo`, `action`, and `data` type.

Changesets allow you to define a pipeline of transformations and validations that incoming data must pass through. This makes your data layer robust, explicit, and easy to reason about.

## Core Concepts and Key Functions

The typical flow involves:
1.  Starting with an Ecto schema struct (new or existing).
2.  Casting incoming parameters (e.g., from a web form) into the changeset.
3.  Applying various validations.
4.  If valid, applying the changes to the original struct and then persisting to the database via `Repo.insert/1` or `Repo.update/1`.

Here are some essential functions from `Ecto.Changeset`:

*   `Ecto.Changeset.cast/4`: Initiates a changeset from a struct and a map of parameters, selecting which fields are allowed to be changed.
    ```elixir
    # user_params = %{"name" => "Alice", "email" => "alice@example.com", "admin" => "true"}
    # User is an Ecto schema
    User.changeset(%User{}, user_params, [:name, :email])
    ```
*   `Ecto.Changeset.change/2`: Allows programmatically adding or modifying changes to a changeset.
*   `Ecto.Changeset.validate_required/3`: Ensures specified fields are present and not `nil` or empty.
    ```elixir
    changeset |> validate_required([:name, :email])
    ```
*   `Ecto.Changeset.validate_length/3`: Validates the length of string or list fields.
    ```elixir
    changeset |> validate_length(:password, min: 8)
    ```
*   `Ecto.Changeset.validate_format/4`: Validates a string field against a regular expression.
    ```elixir
    changeset |> validate_format(:email, ~r/@/, message: "must have an @ sign")
    ```
*   `Ecto.Changeset.validate_number/3`: Validates numerical fields.
    ```elixir
    changeset |> validate_number(:age, greater_than_or_equal_to: 0)
    ```
*   `Ecto.Changeset.unique_constraint/3`: Ensures a field's value is unique in the database (requires a unique index). This is typically used *after* a database attempt would fail, but it's part of the changeset validation process.
*   `Ecto.Changeset.foreign_key_constraint/3`: Checks if a foreign key exists in the referenced table.
*   `Ecto.Changeset.apply_action/2`: Applies the changes if the changeset is valid, returning the updated struct or `{:error, changeset}`. This is often implicitly called by `Repo.insert/1` or `Repo.update/1`.

## Simple Code Example

Let's consider a `User` schema:

```elixir
# lib/my_app/accounts/user.ex
defmodule MyApp.Accounts.User do
  use Ecto.Schema
  import Ecto.Changeset

  schema "users" do
    field :name, :string
    field :email, :string
    field :password_hash, :string
    field :age, :integer, default: 0

    timestamps()
  end

  @doc """
  Builds a changeset for creating or updating a user.
  """
  def changeset(user, attrs) do
    user
    |> cast(attrs, [:name, :email, :age])
    |> validate_required([:name, :email])
    |> validate_length(:name, min: 2)
    |> validate_format(:email, ~r/@/, message: "must contain an '@' sign")
    |> validate_number(:age, greater_than_or_equal_to: 0, message: "must be a positive number")
  end

  @doc """
  Builds a changeset for registering a user, including password.
  """
  def register_changeset(user, attrs) do
    user
    |> cast(attrs, [:name, :email, :age, :password])
    |> validate_required([:name, :email, :password])
    |> validate_length(:password, min: 8)
    |> put_change(:password_hash, Bcrypt.hash_pwd_salt(attrs["password"])) # Assuming Bcrypt library is used
    |> drop_change(:password) # Remove plaintext password after hashing
    |> changeset(attrs) # Reuse general validations
  end
end
```

**Using the Changeset:**

```elixir
iex> alias MyApp.Accounts.User
iex> import Ecto.Changeset

# Example 1: Valid user creation
iex> valid_attrs = %{"name" => "Jane Doe", "email" => "jane@example.com", "age" => 30}
iex> changeset = User.changeset(%User{}, valid_attrs)
iex> changeset.valid?
true
iex> changeset.changes
%{:age => 30, :email => "jane@example.com", :name => "Jane Doe"}

# Example 2: Invalid user creation (missing name)
iex> invalid_attrs = %{"email" => "john@example.com"}
iex> changeset = User.changeset(%User{}, invalid_attrs)
iex> changeset.valid?
false
iex> changeset.errors
[name: {"can't be blank", [validation: :required]}]
# Note: Other validations like length might also add errors if the field is present but invalid.

# Example 3: Updating an existing user
iex> existing_user = %User{id: 1, name: "Old Name", email: "old@example.com"}
iex> update_attrs = %{"name" => "New Name", "age" => 25}
iex> update_changeset = User.changeset(existing_user, update_attrs)
iex> update_changeset.valid?
true
iex> update_changeset.changes
%{:age => 25, :name => "New Name"}
```

## Advanced Concepts

*   **Associations:** `Ecto.Changeset.cast_assoc/3` and `Ecto.Changeset.put_assoc/3` are used to handle associated data (e.g., creating `Post` records when creating a `User`).
*   **Custom Validations:** For complex validation logic not covered by built-in functions, you can define your own functions and pipe them into the changeset.
*   **Concurrency:** `Ecto.Changeset.optimistic_lock/3` helps prevent lost updates in concurrent environments by checking a version column.

## Checklist / Exercise

1.  **Schema and Initial Changeset:** Define a new Ecto schema for `Product` with fields `name` (string), `price` (decimal), and `quantity` (integer). Create a function `Product.changeset/2` that casts `name`, `price`, and `quantity`.
2.  **Add Validations:** Modify `Product.changeset/2` to:
    *   Require `name` and `price`.
    *   Ensure `name` has a minimum length of 3 characters.
    *   Ensure `price` is a positive decimal number (use `validate_number`).
    *   Ensure `quantity` is greater than or equal to 0.
3.  **Test the Changeset:** In `iex`, create valid and invalid attribute maps for a `Product` and use your `Product.changeset/2` function. Observe the `valid?` field and `errors` for each scenario.