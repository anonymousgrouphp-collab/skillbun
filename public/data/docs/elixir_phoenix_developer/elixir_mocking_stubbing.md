### Study Guide: Mocking & Stubbing in Tests (Elixir/Phoenix)

#### Introduction to Mocking & Stubbing

In software testing, especially unit testing, we aim to test a single "unit" of code in isolation. However, units often interact with external dependencies like databases, APIs, or other complex modules. Mocking and stubbing are techniques used to replace these real dependencies with controllable test doubles, allowing us to:

*   **Isolate tests**: Focus on the logic of the unit under test without worrying about its dependencies' internal state or side effects.
*   **Control test scenarios**: Simulate specific responses or error conditions from dependencies that might be hard to reproduce with real dependencies.
*   **Speed up tests**: Avoid slow operations like network calls or database queries.

*   **Stubbing**: A stub is a test double that provides pre-programmed answers to calls made during the test. It essentially fakes a part of the dependency, returning canned responses.
*   **Mocking**: A mock is a test double that records calls made to it. It allows us to verify that a specific method was called with specific arguments, ensuring the unit under test interacts correctly with its dependencies. Mocks are often used to assert interactions, while stubs are primarily used to control behavior by providing specific return values.

#### Elixir's Approach to Testability

Elixir, being a functional language with a strong emphasis on immutability and the OTP design principles, often encourages patterns that naturally lead to highly testable code without heavy reliance on traditional mocking libraries. The preferred patterns for managing dependencies and creating test doubles include:

1.  **Explicit Dependency Passing (Dependency Injection)**: Instead of hardcoding dependencies, modules can accept their collaborators as arguments. This makes it trivial to swap out a real dependency for a test double (a stub or mock) during testing.

    *   **Example: Direct Argument Passing**

        ```elixir
        # lib/my_app/user_service.ex
        defmodule MyApp.UserService do
          # The repo is a dependency, with a default value for production
          def create_user(params, repo \ MyApp.Repo) do
            case repo.insert(%MyApp.User{}, params) do
              {:ok, user} -> {:ok, user}
              {:error, changeset} -> {:error, changeset}
            end
          end
        end

        # test/my_app/user_service_test.exs
        defmodule MyApp.UserServiceTest do
          use ExUnit.Case
          alias MyApp.UserService
          alias Ecto.Changeset

          # A simple test double (stub) for the Repo
          defmodule MockRepo do
            def insert(_struct, %{email: "existing@example.com"}) do
              {:error, %Changeset{errors: [email: {"has already been taken", []}]}}
            end
            def insert(struct, params) do
              {:ok, Map.merge(struct, params)}
            end
          end

          test "creates a user successfully" do
            {:ok, user} = UserService.create_user(%{email: "test@example.com"}, MockRepo)
            assert user.email == "test@example.com"
          end

          test "returns error for existing email" do
            {:error, changeset} = UserService.create_user(%{email: "existing@example.com"}, MockRepo)
            assert changeset.errors[:email]
          end
        end
        ```

2.  **Behaviours**: Elixir behaviours define a contract (a set of functions and their arities) that modules must implement. This is excellent for defining interfaces, allowing you to have different implementations for production and testing (e.g., a real payment gateway vs. a mock payment gateway).

    ```elixir
    # lib/my_app/notifier.ex (Behaviour definition)
    defmodule MyApp.Notifier do
      @callback notify(recipient :: String.t(), message :: String.t()) :: :ok | {:error, any()}
    end

    # lib/my_app/email_notifier.ex (Production implementation)
    defmodule MyApp.EmailNotifier do
      @behaviour MyApp.Notifier
      def notify(recipient, message) do
        # Imagine sending an actual email via a third-party service
        IO.puts "[PROD] Sending email to #{recipient}: #{message}"
        :ok
      end
    end

    # test/my_app/mock_notifier.ex (Test double implementation)
    defmodule MyApp.MockNotifier do
      @behaviour MyApp.Notifier

      # This GenServer will capture messages sent to the mock
      use GenServer
      def start_link(_opts), do: GenServer.start_link(__MODULE__, [])
      def notify(recipient, message), do: GenServer.call(__MODULE__, {:notify, recipient, message})
      def get_notifications, do: GenServer.call(__MODULE__, :get_notifications)

      @impl true
      def init(state), do: {:ok, state}

      @impl true
      def handle_call({:notify, recipient, message}, _from, state) do
        {:reply, :ok, [{recipient, message} | state]}
      end
      def handle_call(:get_notifications, _from, state) do
        {:reply, Enum.reverse(state), state}
      end
    end

    # lib/my_app/service_that_notifies.ex
    defmodule MyApp.ServiceThatNotifies do
      # Accepts a notifier module, defaulting to the production one
      def perform_action(data, notifier_module \ MyApp.EmailNotifier) do
        # ... some logic ...
        notifier_module.notify(data.recipient, "Action performed!")
      end
    end

    # test/my_app/service_that_notifies_test.exs
    defmodule MyApp.ServiceThatNotifiesTest do
      use ExUnit.Case
      alias MyApp.ServiceThatNotifies
      alias MyApp.MockNotifier

      setup do
        {:ok, pid} = MockNotifier.start_link([])
        on_exit(fn -> GenServer.stop(pid) end)
        {:ok, notifier_pid: pid}
      end

      test "performs action and sends notification", %{notifier_pid: _pid} do
        ServiceThatNotifies.perform_action(%{recipient: "user@example.com"}, MockNotifier)
        notifications = MockNotifier.get_notifications()
        assert notifications == [{"user@example.com", "Action performed!"}]
      end
    end
    ```

3.  **`Mox` Library**: When explicit dependency passing or behaviours become cumbersome for deeply nested dependencies, or if you prefer a more traditional mocking approach, the `Mox` library (from Dashbit) is a popular choice. It leverages Erlang's `:meck` under the hood. Mox allows you to:
    *   Define mock expectations dynamically in tests.
    *   Verify calls to mocked modules.
    *   Globally override modules for tests (use with caution as it can hide true dependencies).

    ```elixir
    # config/test.exs
    # config :mox, definitions: [MyApp.Repo]
    # Or define directly in test file with Mox.defmock/2

    # test/my_app/user_service_with_mox_test.exs
    defmodule MyApp.UserServiceWithMoxTest do
      use ExUnit.Case, async: true
      import Mox
      alias MyApp.UserService

      # Define a mock for MyApp.Repo. This assumes MyApp.Repo is defined as a behaviour.
      # If not, you'd typically pass a mock module explicitely, or configure in config/test.exs
      # Mox.defmock(MockRepo, for: MyApp.Repo) # If MyApp.Repo is a behaviour
      # Or if you inject a module name like `MyApp.Repo`, you can define it like this for testing:
      defmodule MockRepo do
        # This module will be used by Mox when we mock MyApp.Repo for a test
      end

      # Tells Mox to replace MyApp.Repo with MockRepo for this test suite
      # and ensures mock expectations are met.
      setup :verify_on_exit!
      @moduletag :mox # Mark tests that use mox

      test "creates a user successfully with Mox" do
        # Define the expected behavior of MyApp.Repo.insert when called
        expect(MyApp.Repo, :insert, fn _struct, params ->
          {:ok, Map.merge(%{id: 1}, _struct, params)}
        end)

        # Call the service, which will use our mocked repo
        # Note: If UserService explicitly takes a repo argument, pass MyApp.Repo
        # to leverage Mox's global override, or pass MockRepo directly.
        # For simpler demonstration, assume MyApp.Repo is the default
        {:ok, user} = UserService.create_user(%{email: "test@example.com"})
        assert user.email == "test@example.com"
        assert user.id == 1
      end

      test "returns error for existing email with Mox" do
        expect(MyApp.Repo, :insert, fn _struct, %{email: "existing@example.com"} ->
          {:error, %Changeset{errors: [email: {"has already been taken", []}]}}
        end)

        {:error, changeset} = UserService.create_user(%{email: "existing@example.com"})
        assert changeset.errors[:email]
      end
    end
    ```
    *Note: Mox is powerful but can lead to more brittle tests if not used carefully due to global state changes. Prefer explicit dependency injection and behaviours first, especially for unit tests.* In Elixir, preferring explicit function arguments or application environment configurations for dependencies generally leads to more robust and understandable tests.

#### Quick Checklist/Exercise

1.  **Identify a Dependency**: Pick a function in an existing Elixir module that interacts with another module (e.g., a data fetching module, an authentication provider). How would you refactor its function signature to allow for explicit dependency injection, providing a default production module?
2.  **Create a Stub/Mock Module**: Write a simple Elixir module that acts as a test double (either a stub returning predefined values or a basic mock capturing calls) for the dependency you identified in step 1.
3.  **Write a Test Case**: Using your test double, write an `ExUnit` test case for the function identified in step 1. Ensure the test verifies the function's logic without invoking the actual production dependency and potentially asserts interactions if using a mock.