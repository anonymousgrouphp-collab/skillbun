## Transactions & Ecto.Multi

Ensuring data consistency and reliability is paramount in any application interacting with a database. Elixir's Ecto provides powerful mechanisms for this through database transactions and the `Ecto.Multi` module.

### 1. Understanding Database Transactions

A **database transaction** is a single logical unit of work performed on a database. It's a sequence of operations that are treated as a single, indivisible whole. This means that either all operations within the transaction are successfully completed and committed to the database, or none of them are (in which case the transaction is rolled back).

Transactions adhere to the ACID properties:
- **Atomicity:** All operations in a transaction succeed, or all are rolled back. There are no partial updates.
- **Consistency:** A transaction brings the database from one valid state to another. Integrity constraints are maintained.
- **Isolation:** Concurrent transactions execute independently without interfering with each other. Changes made by one transaction are not visible to others until the transaction is committed.
- **Durability:** Once a transaction is committed, its changes are permanent and survive system failures.

In Elixir with Ecto, you typically wrap operations that need to be atomic within a transaction using `Repo.transaction/2`.

#### Basic Transaction Example

```elixir
alias MyApp.Repo
alias MyApp.User
alias MyApp.Profile

def create_user_and_profile(user_params, profile_params) do
  Repo.transaction(fn ->
    case Repo.insert(%User{user_params}) do
      {:ok, user} ->
        profile = %Profile{profile_params | user_id: user.id}
        case Repo.insert(profile) do
          {:ok, profile} ->
            {:ok, %{user: user, profile: profile}}
          {:error, changeset} ->
            Repo.rollback({:error, changeset})
        end
      {:error, changeset} ->
        Repo.rollback({:error, changeset})
    end
  end)
end
```

This nested `case` approach works but can become cumbersome for more complex scenarios involving many operations. This is where `Ecto.Multi` shines.

### 2. Composing Operations with `Ecto.Multi`

`Ecto.Multi` provides a way to compose multiple Ecto operations into a single, atomic unit that can be executed within a transaction. It allows you to define a pipeline of database operations, where each subsequent operation can depend on the results of the preceding ones. If any operation in the `Ecto.Multi` sequence fails, the entire transaction is rolled back.

#### Key Benefits of `Ecto.Multi`:
- **Atomicity:** Guarantees that all operations succeed or none do.
- **Readability:** Creates a clear, linear flow of operations.
- **Dependency Management:** Allows operations to use results from previous steps.
- **Error Handling:** Centralized handling of failures.

#### How `Ecto.Multi` Works

1.  **Initialize a new `Ecto.Multi`:** Start with `Ecto.Multi.new()`.
2.  **Add Operations:** Use functions like `Ecto.Multi.insert/3`, `Ecto.Multi.update/3`, `Ecto.Multi.delete/3`, `Ecto.Multi.run/3` (for custom logic), etc., to add steps to the `Multi`. Each operation is given a unique name (atom).
3.  **Execute the `Multi`:** Pass the `Ecto.Multi` struct to `Repo.transaction/2`.

#### `Ecto.Multi` Example: User Registration with Profile and Settings

Let's refactor the previous example and add a `UserSettings` creation.

```elixir
defmodule MyApp.Accounts do
  alias MyApp.Repo
  alias MyApp.User
  alias MyApp.Profile
  alias MyApp.UserSettings
  alias Ecto.Multi

  def register_user(user_params, profile_params) do
    multi =
      Multi.new()
      |> Multi.insert(:user, User.changeset(%User{}, user_params))
      |> Multi.insert(:profile, fn %{user: user} ->
        # Profile depends on the user created in the previous step
        Profile.changeset(%Profile{}, Map.put(profile_params, :user_id, user.id))
      end)
      |> Multi.insert(:settings, fn %{user: user} ->
        # Settings also depend on the user
        UserSettings.changeset(%UserSettings{}, %{user_id: user.id, notifications_enabled: true})
      end)

    case Repo.transaction(multi) do
      {:ok, %{user: user, profile: profile, settings: settings}} ->
        {:ok, %{user: user, profile: profile, settings: settings}}
      {:error, failed_op, value, changes_so_far} ->
        # failed_op: the name of the operation that failed (e.g., :user, :profile, :settings)
        # value: the changeset or result of the failed operation
        # changes_so_far: a map of results from successfully completed operations
        IO.inspect("Transaction failed at #{failed_op}: #{inspect(value)}")
        {:error, failed_op, value, changes_so_far}
    end
  end
end
```

In this example:
- `:user` is the first operation.
- `:profile` uses an anonymous function that receives the results of previous successful operations (in this case, `%{user: user}`). This allows us to get the `user.id` for the profile.
- `:settings` similarly uses the `user` result.
- `Repo.transaction(multi)` executes all steps. If `Multi.insert(:user, ...)` fails, `:profile` and `:settings` are not attempted, and the transaction is rolled back.
- The `case` statement handles both success (`:ok`) and failure (`:error`), providing details about which operation failed.

### 3. Checklist / Exercise

1.  **Define Transactions:** Explain in your own words what database transactions are and why they are crucial for data integrity.
2.  **Identify `Ecto.Multi` Use Case:** Describe a real-world scenario where `Ecto.Multi` would be a more suitable choice than individual `Repo.insert!`/`Repo.update!` calls.
3.  **Predict Outcome:** If an `Ecto.Multi` sequence has three operations (`:a`, `:b`, `:c`) and operation `:b` fails, what will be the state of the database and what will `Repo.transaction` return?