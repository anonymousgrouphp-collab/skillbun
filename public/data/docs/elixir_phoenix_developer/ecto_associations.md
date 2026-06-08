# Ecto Associations: Handling Relationships in Phoenix

Ecto is the data mapper for Elixir, providing a powerful and flexible way to interact with databases. A core aspect of building robust applications is managing relationships between different data models, often referred to as schemas. Ecto associations allow you to define these relationships (one-to-one, one-to-many, many-to-many) in your schemas, enabling seamless data manipulation and querying.

## Core Concepts

Ecto provides four primary macros for defining associations within your `Ecto.Schema` modules: `belongs_to`, `has_one`, `has_many`, and `many_to_many`.

### 1. `belongs_to`

A `belongs_to` association signifies a one-to-one or one-to-many relationship where the current schema holds the foreign key. This is the "many" side of a one-to-many relationship, or the foreign key holder in a one-to-one.

*   **Syntax:** `belongs_to :association_name, RelatedSchema`
*   **Database Implication:** Adds a `related_schema_id` column to the current schema's table, often with an index.
*   **Example:** A `Post` belongs to a `User`.

```elixir
# lib/my_app/accounts/user.ex
defmodule MyApp.Accounts.User do
  use Ecto.Schema
  import Ecto.Changeset

  schema "users" do
    field :name, :string
    has_many :posts, MyApp.Blog.Post # Defined later
    timestamps()
  end
end

# lib/my_app/blog/post.ex
defmodule MyApp.Blog.Post do
  use Ecto.Schema
  import Ecto.Changeset

  schema "posts" do
    field :title, :string
    field :content, :string
    belongs_to :user, MyApp.Accounts.User # Post has user_id
    timestamps()
  end
end
```

### 2. `has_one`

A `has_one` association defines a one-to-one relationship where the foreign key resides on the *related* schema. This means the current schema "owns" an association, but the foreign key is on the "other" side.

*   **Syntax:** `has_one :association_name, RelatedSchema`
*   **Database Implication:** No column is added to the current schema. The `current_schema_id` column exists on the related schema's table.
*   **Example:** A `User` has one `Profile`.

```elixir
# lib/my_app/accounts/user.ex
defmodule MyApp.Accounts.User do
  use Ecto.Schema
  import Ecto.Changeset

  schema "users" do
    field :name, :string
    has_one :profile, MyApp.Accounts.Profile # User has a profile (profile has user_id)
    timestamps()
  end
end

# lib/my_app/accounts/profile.ex
defmodule MyApp.Accounts.Profile do
  use Ecto.Schema
  import Ecto.Changeset

  schema "profiles" do
    field :bio, :string
    field :website, :string
    belongs_to :user, MyApp.Accounts.User # Profile has user_id
    timestamps()
  end
end
```

### 3. `has_many`

A `has_many` association defines a one-to-many relationship where the foreign key resides on the *related* schema. This is the "one" side of a one-to-many relationship.

*   **Syntax:** `has_many :association_name, RelatedSchema`
*   **Database Implication:** No column is added to the current schema. The `current_schema_id` column exists on the related schema's table.
*   **Example:** A `User` has many `Posts`.

```elixir
# lib/my_app/accounts/user.ex
defmodule MyApp.Accounts.User do
  use Ecto.Schema
  import Ecto.Changeset

  schema "users" do
    field :name, :string
    has_many :posts, MyApp.Blog.Post # User has many posts (posts have user_id)
    timestamps()
  end
end

# (Post schema is the same as in `belongs_to` example above)
```

### 4. `many_to_many`

A `many_to_many` association defines a relationship where multiple records in one schema can be related to multiple records in another schema. This typically requires a separate "join" or "pivot" table to store these relationships.

*   **Syntax:** `many_to_many :association_name, RelatedSchema, join_through: JoinSchema`
*   **Database Implication:** Requires an intermediate join table that contains foreign keys to both schemas.
*   **Example:** A `Post` can have many `Tags`, and a `Tag` can belong to many `Posts`.

```elixir
# lib/my_app/blog/post.ex
defmodule MyApp.Blog.Post do
  use Ecto.Schema
  import Ecto.Changeset

  schema "posts" do
    field :title, :string
    many_to_many :tags, MyApp.Blog.Tag, join_through: "posts_tags" # join_through specifies the join table name
    timestamps()
  end
end

# lib/my_app/blog/tag.ex
defmodule MyApp.Blog.Tag do
  use Ecto.Schema
  import Ecto.Changeset

  schema "tags" do
    field :name, :string
    many_to_many :posts, MyApp.Blog.Post, join_through: "posts_tags"
    timestamps()
  end
end

# Migration for the join table
# priv/repo/migrations/YYYYMMDDHHMMSS_create_posts_tags.exs
defmodule MyApp.Repo.Migrations.CreatePostsTags do
  use Ecto.Migration

  def change do
    create table("posts_tags") do
      add :post_id, references(:posts, on_delete: :delete_all), null: false
      add :tag_id, references(:tags, on_delete: :delete_all), null: false
    end

    create unique_index("posts_tags", [:post_id, :tag_id])
    create index("posts_tags", [:tag_id]) # for efficient lookups from tag to posts
  end
end
```

## Working with Associations (Preloading)

By default, Ecto does not load associated data when you query a schema. This is known as "lazy loading." To explicitly load associated data, you use `Ecto.Repo.preload/2`.

```elixir
# Fetch a user and their posts
user = MyApp.Accounts.User
       |> Ecto.Repo.get(1)
       |> Ecto.Repo.preload(:posts)

IO.inspect user.posts # This will now contain a list of Post structs

# Fetch a post and its user
post = MyApp.Blog.Post
       |> Ecto.Repo.get(1)
       |> Ecto.Repo.preload(:user)

IO.inspect post.user # This will now contain a User struct

# Preloading multiple associations
user = MyApp.Accounts.User
       |> Ecto.Repo.get(1)
       |> Ecto.Repo.preload([:posts, :profile]) # Preload a list of associations
```

You can also preload nested associations:

```elixir
user = MyApp.Accounts.User
       |> Ecto.Repo.get(1)
       |> Ecto.Repo.preload(posts: [:tags]) # Preload user's posts, and each post's tags

IO.inspect user.posts.first.tags
```

## Checklist/Exercise

1.  Explain the key difference in where the foreign key resides for `belongs_to` vs. `has_one`/`has_many` associations.
2.  If you have `Author` and `Book` schemas, and an `Author` can write many `Books`, how would you define the associations in both schemas, and which schema would hold the foreign key?
3.  Describe a scenario where you would use a `many_to_many` association and what database artifact it requires.
