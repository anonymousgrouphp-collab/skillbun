# Embedded Schemas & Custom Types in Ecto

Ecto, Elixir's powerful data mapping and query tool, provides robust mechanisms for interacting with databases. Beyond simple scalar types, Ecto allows developers to handle complex data structures efficiently using **Embedded Schemas** and **Custom Types**. These features are crucial for modeling intricate application domains while maintaining data integrity and readability.

## 1. Embedded Schemas

Embedded schemas allow you to define structured data within a single column of a parent record, without creating a separate database table for the embedded data. They are ideal for storing composite value objects or collections of related data that logically belong together and are often accessed as a unit.

### Core Concepts

*   **No Separate Table:** Unlike associations (`has_many`, `belongs_to`), embedded schemas do not map to their own database tables. The data is serialized into a single column (typically `jsonb` or `map`) of the parent table.
*   **Structured Data:** They provide schema validation and casting for the embedded data, similar to regular Ecto schemas.
*   **`embeds_one` and `embeds_many`:**
    *   `embeds_one`: For a single embedded struct (e.g., a user having one address).
    *   `embeds_many`: For a list of embedded structs (e.g., a product having multiple features).

### When to Use Embedded Schemas

*   **Value Objects:** When a complex piece of data (like an `Address`, `ContactInfo`, `Settings`) is a value object of a parent entity and doesn't require its own lifecycle or direct querying outside the parent.
*   **Denormalization:** When you want to store related data directly within a record for performance reasons or to simplify queries, especially with JSONB columns.
*   **Configuration/Metadata:** Storing structured configuration or metadata that is specific to a record.

### Example: User with Embedded Address

Let's say a `User` has an `Address` that consists of a street, city, state, and zip code.

```elixir
defmodule MyApp.Address do
  use Ecto.Schema

  @primary_key false # Embedded schemas don't need primary keys
  @timestamps false # Or timestamps

  embedded_schema do
    field :street, :string
    field :city, :string
    field :state, :string
    field :zip_code, :string
  end

  def changeset(address, attrs) do
    address
    |> Ecto.Changeset.cast(attrs, [:street, :city, :state, :zip_code])
    |> Ecto.Changeset.validate_required([:street, :city, :state, :zip_code])
  end
end

defmodule MyApp.User do
  use Ecto.Schema
  import Ecto.Changeset

  schema "users" do
    field :name, :string
    field :email, :string

    embeds_one :address, MyApp.Address, on_replace: :delete # Use MyApp.Address for the embedded schema

    timestamps()
  end

  def changeset(user, attrs) do
    user
    |> cast(attrs, [:name, :email])
    |> validate_required([:name, :email])
    |> cast_embed(:address) # Important: use cast_embed for embedded schemas
  end
end
```

**Database Migration:**
To support the `address` field in the `users` table, you'd typically use a `jsonb` column:

```elixir
defmodule MyApp.Repo.Migrations.AddAddressToUsers do
  use Ecto.Migration

  def change do
    alter table("users") do
      add :address, :map # or :jsonb for PostgreSQL
    end
  end
end
```

When inserting or updating a `User`, the `address` data will be serialized into the `address` column.

## 2. Custom Ecto Types

Custom Ecto types allow you to define how Elixir data structures are mapped to and from database types that Ecto doesn't inherently support, or to add specific serialization/deserialization logic. This is useful for enforcing data constraints, handling complex data formats, or integrating with external libraries.

### Core Concepts

*   **`Ecto.Type` Behaviour:** To create a custom type, you implement the `Ecto.Type` behaviour, which requires defining four functions:
    *   `type/0`: Returns the Ecto type atom (e.g., `:binary_id`, `:string`, `:map`) that Ecto should use for the database column.
    *   `cast/1`: Converts a user-provided value (e.g., from a form) into the Elixir type your custom type represents. This is where validation often happens.
    *   `load/1`: Converts the value read from the database into your custom Elixir type.
    *   `dump/1`: Converts your custom Elixir type into a value suitable for storage in the database.

### When to Use Custom Ecto Types

*   **Non-Standard Data Types:** Representing specific data formats like UUIDs, geographical points, custom enumerations, or encrypted strings.
*   **Serialization/Deserialization:** When you need specific logic to convert between an Elixir struct/atom and a database-compatible format (e.g., storing a `Money` struct as a decimal, storing a list of tags as a comma-separated string).
*   **Domain-Specific Constraints:** Encapsulating specific validation or transformation logic within the type itself.

### Example: Custom Money Type

Let's create a custom type for handling money values, storing them as integers (cents) in the database but representing them as a `Money` struct in Elixir.

```elixir
defmodule MyApp.Money do
  # A simple struct to represent money
  defstruct [:amount, :currency]
end

defmodule MyApp.Ecto.Type.Money do
  @behaviour Ecto.Type

  @impl Ecto.Type
  def type, do: :integer # Store as integer (cents) in the database

  @impl Ecto.Type
  def cast(%MyApp.Money{} = money), do: {:ok, money}
  def cast(%{"amount" => amount, "currency" => currency}), do: cast(%MyApp.Money{amount: amount, currency: currency})
  def cast(amount) when is_integer(amount), do: {:ok, %MyApp.Money{amount: amount, currency: "USD"}} # Assume USD for simplicity
  def cast(_), do: :error # Or implement more robust parsing

  @impl Ecto.Type
  def load(value) when is_integer(value), do: {:ok, %MyApp.Money{amount: value, currency: "USD"}}
  def load(_), do: :error # Handle nil or invalid values from DB

  @impl Ecto.Type
  def dump(%MyApp.Money{amount: amount, currency: _currency}) when is_integer(amount), do: {:ok, amount}
  def dump(_), do: :error
end
```

**Using the Custom Type in a Schema:**

```elixir
defmodule MyApp.Product do
  use Ecto.Schema
  import Ecto.Changeset

  schema "products" do
    field :name, :string
    field :price, MyApp.Ecto.Type.Money # Use your custom type here

    timestamps()
  end

  def changeset(product, attrs) do
    product
    |> cast(attrs, [:name, :price])
    |> validate_required([:name, :price])
  end
end
```

**Database Migration:**

```elixir
defmodule MyApp.Repo.Migrations.AddPriceToProducts do
  use Ecto.Migration

  def change do
    alter table("products") do
      add :price, :integer # Matches the type/0 of MyApp.Ecto.Type.Money
    end
  end
end
```

Now, when you interact with `Product.price` in Elixir, you'll be working with a `%MyApp.Money{}` struct, but it will be stored as an integer in the database.

## 3. Differences and Synergies

*   **Embedded Schemas:** Best for *structured aggregates* of data that are *logically part of a parent record* and often stored as JSON/MAP. They provide full schema validation and casting capabilities for the embedded structure.
*   **Custom Types:** Best for *transforming a single Elixir value* (which might be a struct or complex type) into a simpler database type and back. They handle the serialization/deserialization logic.
*   **Synergy:** You could have an embedded schema that contains fields of custom types! For example, an `Address` embedded schema might have a `Coordinates` custom type for latitude/longitude.

## Quick Check for Understanding

1.  **Scenario:** You need to store multiple shipping addresses for a user, each with its own street, city, and zip code. Which Ecto feature would be most appropriate: `embeds_one`, `embeds_many`, or a custom type?
2.  **Purpose:** What is the primary role of the `dump/1` function in a custom Ecto type?
3.  **Tooling:** Which function must you use in your parent schema's changeset to properly handle changes to an embedded schema?
