# Software Architecture & Design Patterns in Unity for XR

## Introduction
Developing immersive XR experiences in Unity requires more than just coding features; it demands a robust, scalable, and maintainable codebase. Software architecture and design patterns provide proven solutions to common problems, helping developers manage complexity, facilitate collaboration, and ensure projects remain adaptable over time. Applying these principles leads to cleaner code, easier debugging, and enhanced performance, crucial for the demanding nature of XR applications.

## I. SOLID Principles
SOLID is an acronym for five design principles intended to make software designs more understandable, flexible, and maintainable.

### 1. Single Responsibility Principle (SRP)
> A class should have only one reason to change.
*   **Concept**: Each class or module should be responsible for a single piece of functionality.
*   **Unity Context**: Instead of a `PlayerController` handling input, movement, health, and inventory, split these responsibilities into `PlayerInputHandler`, `PlayerMovement`, `HealthSystem`, and `InventoryManager` components. This makes each component easier to test, modify, and reuse.

### 2. Open/Closed Principle (OCP)
> Software entities (classes, modules, functions, etc.) should be open for extension, but closed for modification.
*   **Concept**: You should be able to add new functionality without altering existing, working code.
*   **Unity Context**: Use interfaces or abstract classes. For example, an `IDamageable` interface can be implemented by various game objects (players, enemies, destructible environments). Adding a new type of damageable object doesn't require modifying the `DamageDealer` script, only implementing the interface on the new object.

### 3. Liskov Substitution Principle (LSP)
> Objects in a program should be replaceable with instances of their subtypes without altering the correctness of that program.
*   **Concept**: If class `S` is a subtype of class `T`, then objects of type `T` may be replaced with objects of type `S` without breaking the application.
*   **Unity Context**: If you have a `BaseEnemy` class and `MeleeEnemy` and `RangedEnemy` derived classes, any code expecting a `BaseEnemy` should work correctly when given a `MeleeEnemy` or `RangedEnemy`. This means derived classes should not change the fundamental behavior defined by the base class in a way that breaks its contracts.

### 4. Interface Segregation Principle (ISP)
> Clients should not be forced to depend on interfaces they do not use.
*   **Concept**: Rather than one large interface, many small, specific interfaces are better.
*   **Unity Context**: Instead of a single `IGameObject` interface with `Move()`, `Attack()`, `TakeDamage()`, `Interact()`, etc., create `IMoveable`, `IAttackable`, `IDamageable`, `IInteractable`. A player might implement `IMoveable`, `IAttackable`, `IDamageable`, while a static interactable object only implements `IInteractable`.

### 5. Dependency Inversion Principle (DIP)
> High-level modules should not depend on low-level modules. Both should depend on abstractions. Abstractions should not depend on details. Details should depend on abstractions.
*   **Concept**: Decouple modules by introducing interfaces.
*   **Unity Context**: A `PlayerController` (high-level) shouldn't directly instantiate or depend on a concrete `UnityInputSystem` (low-level). Instead, both should depend on an `IInputService` interface. The `PlayerController` uses `IInputService`, and `UnityInputSystem` implements `IInputService`.

## II. Architectural Patterns

### 1. MVC (Model-View-Controller)
*   **Concept**: Separates an application into three main components:
    *   **Model**: Manages data and business logic. Independent of the UI.
    *   **View**: The user interface. Displays data from the Model.
    *   **Controller**: Handles user input, interacts with the Model, and updates the View.
*   **Unity Context**:
    *   **Model**: Plain C# classes representing game state (e.g., `PlayerStats`, `InventoryData`).
    *   **View**: Unity UI elements (Canvas, Text, Image) and associated MonoBehaviour scripts that render the Model's data.
    *   **Controller**: MonoBehaviour scripts that receive input (e.g., from `Input.GetAxis`), manipulate the Model, and instruct the View to update.
*   **Example**: Player health UI. Model: `PlayerHealth` class (holds current HP). View: `HealthBarUI` (displays health visually). Controller: `PlayerHealthController` (listens for damage events, updates `PlayerHealth`, tells `HealthBarUI` to refresh).

### 2. MVVM (Model-View-ViewModel)
*   **Concept**: Similar to MVC but with a ViewModel layer that acts as an intermediary between the View and Model, specifically designed for data binding.
    *   **Model**: Same as MVC.
    *   **View**: UI components. Binds directly to the ViewModel.
    **ViewModel**: Exposes data and commands from the Model in a way that is easily consumable by the View. It transforms Model data into View-specific data and handles View logic.
*   **Unity Context**: Often used with reactive programming libraries (e.g., UniRx) for data binding.
    *   **Model**: `PlayerStats` (plain C#).
    *   **View**: `PlayerUIComponent` (Monobehaviour) with UI elements.
    *   **ViewModel**: `PlayerViewModel` (plain C# class) that holds `ReactiveProperties` (e.g., `ReactiveProperty<int> Health`) which the View subscribes to. Input from View might trigger commands on ViewModel, which then updates Model.

### 3. Dependency Injection (DI)
*   **Concept**: A design pattern used to implement DIP. It's a technique where an object receives other objects (dependencies) that it depends on, rather than creating them itself.
*   **Benefits**: Reduces coupling, improves testability, makes code more modular and reusable.
*   **Unity Context**: Can be done manually (constructor injection, property injection) or using a DI framework like Zenject/Extenject, VContainer, or StrangeIoC.
*   **Example (Manual Property Injection)**:

    ```csharp
    // ILogger.cs
    public interface ILogger
    {
        void Log(string message);
    }

    // ConsoleLogger.cs
    public class ConsoleLogger : ILogger
    {
        public void Log(string message)
        {
            UnityEngine.Debug.Log(message);
        }
    }

    // GameService.cs
    public class GameService : MonoBehaviour
    {
        private ILogger _logger;

        // Public property for injection
        public ILogger Logger {
            set { _logger = value; }
        }

        void Start()
        {
            if (_logger == null)
            {
                _logger = new ConsoleLogger(); // Fallback or default
            }
            _logger.Log("GameService started!");
        }
    }

    // Injector (could be a simple factory or a context script)
    public class DependencyInjector : MonoBehaviour
    {
        void Awake()
        {
            ILogger consoleLogger = new ConsoleLogger();
            GameService gameService = FindObjectOfType<GameService>();
            if (gameService != null)
            {
                gameService.Logger = consoleLogger;
            }
        }
    }
    ```

### 4. Service Locators
*   **Concept**: Provides a global point of access to services without coupling users to the concrete classes that implement those services. A "locator" object knows how to obtain services (e.g., via a dictionary or factory).
*   **Comparison to DI**: DI *pushes* dependencies to an object; Service Locator *pulls* dependencies from a central registry. Service Locator can introduce hidden dependencies and make testing harder, but it can be simpler to implement in small projects.
*   **Unity Context**: A static `ServiceLocator` class with `Register<T>` and `Get<T>` methods.

    ```csharp
    public static class ServiceLocator
    {
        private static readonly Dictionary<Type, object> _services = new Dictionary<Type, object>();

        public static void Register<T>(T service)
        {
            _services[typeof(T)] = service;
        }

        public static T Get<T>()
        {
            if (_services.TryGetValue(typeof(T), out object service))
            {
                return (T)service;
            }
            throw new InvalidOperationException($"Service of type {typeof(T)} not registered.");
        }
    }
    // Usage:
    // In an Init script: ServiceLocator.Register<ILogger>(new ConsoleLogger());
    // In a GameService: ILogger logger = ServiceLocator.Get<ILogger>();
    ```

### 5. State Machines (Finite State Machines - FSM)
*   **Concept**: A computational model that can be in exactly one of a finite number of states at any given time. It can transition from one state to another in response to inputs or events.
*   **Benefits**: Excellent for managing complex behaviors with distinct stages (e.g., AI behaviors, animation states, UI flows).
*   **Unity Context**:
    *   **Simple FSM (Enum + Switch)**: For basic behaviors.
    *   **Class-based FSM**: More robust, using abstract `State` classes and a `StateMachine` manager.
*   **Example (Simple Enemy FSM)**:

    ```csharp
    public enum EnemyState { Idle, Patrol, Chase, Attack, Flee }

    public class EnemyAI : MonoBehaviour
    {
        public EnemyState currentState;

        void Start()
        {
            currentState = EnemyState.Idle;
        }

        void Update()
        {
            HandleState();
        }

        void HandleState()
        {
            switch (currentState)
            {
                case EnemyState.Idle:
                    // Check for player proximity
                    if (IsPlayerNearby()) {
                        currentState = EnemyState.Chase;
                    }
                    break;
                case EnemyState.Patrol:
                    // Move along path, check for player
                    break;
                case EnemyState.Chase:
                    // Follow player, check attack range
                    if (IsInAttackRange()) {
                        currentState = EnemyState.Attack;
                    } else if (!IsPlayerNearby()) {
                        currentState = EnemyState.Patrol;
                    }
                    break;
                case EnemyState.Attack:
                    // Perform attack, check health
                    if (!IsInAttackRange()) {
                        currentState = EnemyState.Chase;
                    } else if (Health < 20) {
                        currentState = EnemyState.Flee;
                    }
                    break;
                case EnemyState.Flee:
                    // Run away
                    break;
            }
        }

        // Dummy methods for example clarity
        bool IsPlayerNearby() { return UnityEngine.Random.value > 0.5f; }
        bool IsInAttackRange() { return UnityEngine.Random.value > 0.7f; }
        float Health = 100f; // Simplified
    }
    ```

## Checklist / Exercises
1.  **Refactor an existing Unity script**: Identify a God-Object MonoBehaviour in one of your projects (or imagine one) that handles input, movement, health, and inventory. Describe how you would refactor it to adhere to the Single Responsibility Principle.
2.  **Design an `IDamageable` interface**: Create a C# interface `IDamageable` with a `TakeDamage(int amount)` method. Then, create two MonoBehaviour scripts, `PlayerHealth` and `EnemyHealth`, that implement this interface. Explain how this demonstrates the Open/Closed Principle.
3.  **Identify suitable pattern**: For a complex AI behavior in an XR game that involves distinct phases like "Searching," "Engaging," and "Reloading," which design pattern would be most suitable to manage these transitions and actions, and why?
