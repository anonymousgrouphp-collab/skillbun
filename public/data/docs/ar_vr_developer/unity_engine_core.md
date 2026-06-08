# Unity Engine Core Concepts: Study Guide

## 1. Introduction to Unity's Architecture
Unity is a powerful cross-platform game engine widely used for developing AR/VR applications. Its architecture is built around a component-based design, making it highly modular and flexible. Every element in a Unity scene is ultimately a `GameObject` equipped with `Components` that define its behavior and appearance.

## 2. GameObjects: The Foundation
*   **Definition**: GameObjects are the fundamental objects in Unity that represent characters, props, lights, cameras, and more. They are essentially empty containers until you attach components to them.
*   **Transform Component**: Every GameObject automatically includes a `Transform` component, which defines its position, rotation, and scale in the 3D world. This is the only component a GameObject *must* have.
*   **Creating a GameObject**:
    *   Right-click in the Hierarchy window -> Create Empty.
    *   Or, GameObject menu -> Create Empty.

## 3. Components: Building Blocks of Functionality
*   **Definition**: Components are modular pieces of functionality that you attach to GameObjects to give them specific behaviors, appearances, or properties. A GameObject can have multiple components.
*   **Common Components**:
    *   `Mesh Renderer`: Renders 3D models.
    *   `Collider`: Defines the physical boundary for collision detection.
    *   `Rigidbody`: Enables a GameObject to be controlled by Unity's physics engine.
    *   `Light`: Emits light.
    *   `Camera`: Renders the scene to the screen.
    *   **Custom Scripts**: Scripts written in C# are also components (`MonoBehaviour`) that allow you to define custom logic.
*   **Adding Components**: Select a GameObject in the Hierarchy, then in the Inspector window, click "Add Component" and search for the desired component.

## 4. Prefabs: Reusable Assets
*   **Definition**: A Prefab is a pre-configured GameObject stored in your Project assets. It serves as a template that you can reuse multiple times throughout your scenes.
*   **Benefits**:
    *   **Efficiency**: Create complex objects once and instance them repeatedly.
    *   **Consistency**: All instances of a Prefab share the same properties.
    *   **Easy Modification**: Changes made to the original Prefab asset are automatically applied to all its instances, simplifying updates.
*   **Creating a Prefab**: Drag a GameObject from the Hierarchy window into the Project window.

## 5. Scene Management
*   **Definition**: Scenes are individual files that contain all the GameObjects, environments, and settings for a particular part of your game or application (e.g., a main menu scene, a level scene).
*   **Loading Scenes**: Use the `SceneManager` class to load and unload scenes dynamically. This is crucial for managing application flow and memory.
*   **Example (C#)**:
    ```csharp
    using UnityEngine;
    using UnityEngine.SceneManagement;

    public class SceneLoader : MonoBehaviour
    {
        public void LoadNextScene(string sceneName)
        {
            SceneManager.LoadScene(sceneName);
        }
    }
    ```

## 6. Physics
Unity's physics engine simulates real-world physics.
*   **Rigidbody**: To make a GameObject physically interact (e.g., fall under gravity, respond to forces, collide), it *must* have a `Rigidbody` component.
    *   `Rigidbody` for 3D objects, `Rigidbody2D` for 2D.
*   **Colliders**: These components define the shape of a GameObject for collision detection.
    *   Examples: `BoxCollider`, `SphereCollider`, `CapsuleCollider`, `MeshCollider`.
    *   **Trigger**: If a collider is marked as "Is Trigger," it detects collisions without physical interaction, useful for zones or pickups.
*   **Physics Material**: Can be applied to colliders to define surface properties like friction and bounciness.
*   **`FixedUpdate()`**: Physics calculations should primarily occur within `FixedUpdate()` rather than `Update()`, as `FixedUpdate()` runs at a fixed timestep independent of frame rate, ensuring consistent physics.

## 7. Lighting
Lighting significantly impacts the visual quality of your AR/VR experience.
*   **Light Types**:
    *   **Directional Light**: Simulates a distant light source (like the sun), casting parallel rays.
    *   **Point Light**: Emits light in all directions from a single point.
    *   **Spot Light**: Emits light in a cone shape.
    *   **Area Light**: Emits light from a 2D surface (mostly used for baked lighting).
*   **Lighting Modes**:
    *   **Realtime**: Lights are calculated every frame, providing dynamic and interactive lighting (more performance-intensive).
    *   **Baked**: Light calculations are pre-computed and stored in lightmaps, offering high-quality static lighting at runtime (less performance-intensive, good for static environments).
*   **Light Probes & Reflection Probes**: Used to provide more realistic lighting and reflections for dynamic objects within a baked light environment.

## 8. Animation
Unity's Mecanim animation system provides powerful tools for creating and managing complex animations.
*   **Animator Component**: Attached to a GameObject, this component references an Animator Controller, which defines the animation state machine.
*   **Animator Controller**: A visual tool for organizing and blending animation clips, managing transitions between states, and using parameters to control animation flow.
*   **Animation Clips**: Individual animation sequences (e.g., "walk," "idle," "jump").
*   **Blend Trees**: Used within an Animator Controller to blend multiple animation clips based on parameter values, creating fluid movements (e.g., blending walk and run based on speed).

## 9. Scripting Lifecycle
Unity scripts (MonoBehaviours) follow a specific execution order for their built-in methods. Understanding this lifecycle is crucial for predictable behavior.
*   **Key Lifecycle Methods**:
    *   `Awake()`: Called when an instance of the script is being loaded. Always called before any Start functions and before any GameObjects are enabled.
    *   `OnEnable()`: Called when the object becomes enabled and active.
    *   `Start()`: Called on the frame when a script is first enabled, just before any `Update()` methods are called.
    *   `FixedUpdate()`: Called at a fixed framerate interval. Used for physics calculations.
    *   `Update()`: Called once per frame. Most game logic goes here.
    *   `LateUpdate()`: Called once per frame, after all `Update()` functions have been called. Useful for camera follow scripts.
    *   `OnDisable()`: Called when the object becomes disabled or inactive.
    *   `OnDestroy()`: Called when the GameObject is destroyed.
*   **Code Example: Basic Script Lifecycle**
    ```csharp
    using UnityEngine;

    public class LifecycleExample : MonoBehaviour
    {
        // 1. Called when the script instance is being loaded.
        void Awake()
        {
            Debug.Log("Awake called!");
        }

        // 2. Called when the object becomes enabled and active.
        void OnEnable()
        {
            Debug.Log("OnEnable called!");
        }

        // 3. Called on the frame when a script is first enabled.
        void Start()
        {
            Debug.Log("Start called!");
        }

        // 4. Called once per frame for general game logic.
        void Update()
        {
            // Debug.Log("Update called!"); // Will log every frame, avoid for constant logs.
        }

        // 5. Called when the object becomes disabled or inactive.
        void OnDisable()
        {
            Debug.Log("OnDisable called!");
        }

        // 6. Called when the GameObject is destroyed.
        void OnDestroy()
        {
            Debug.Log("OnDestroy called!");
        }
    }
    ```

## 10. Input Systems
Unity provides ways to handle user input from various devices (keyboard, mouse, gamepad, touch, VR controllers).
*   **Legacy Input Manager**: Access input directly via `Input` class (e.g., `Input.GetKeyDown(KeyCode.Space)`, `Input.GetAxis("Horizontal")`). Simple but can be less flexible for complex schemes.
*   **New Input System (Package Manager)**: A more robust and flexible system allowing for input action maps, binding schemes, and event-driven input. Highly recommended for modern projects, especially AR/VR, for better controller abstraction and remapping capabilities. It requires installation via the Package Manager.

## 11. UI Systems (Canvas, UGUI)
Unity's built-in UI system, often referred to as UGUI (Unity UI), is based on the `Canvas` component.
*   **Canvas**: All UI elements must be children of a Canvas GameObject. The Canvas manages the rendering and layout of UI.
    *   **Render Modes**: Screen Space - Overlay, Screen Space - Camera, World Space (critical for AR/VR UI).
*   **Rect Transform**: All UI elements use a `Rect Transform` instead of a standard `Transform`, providing properties like width, height, anchors, and pivots for responsive UI layout.
*   **UGUI Elements**: Standard UI controls like `Button`, `Text`, `Image`, `Slider`, `Toggle`, `Scroll Rect`.
*   **Event System**: Handles user interactions with UI elements (clicks, hovers, drags). Automatically added to scenes when a Canvas is created.

## 💡 Quick Checklist / Exercise:
1.  **Identify Components**: Open a new Unity project. Create a 3D Cube GameObject. List at least three components attached to it by default.
2.  **Prefab Creation**: Create a new Empty GameObject, add a `Rigidbody` component to it, and then turn it into a Prefab. Explain the benefits of doing so.
3.  **Scripting Lifecycle**: If you have a script with `Awake()`, `Start()`, and `Update()` methods, in what order will "Awake!", "Start!", and "Update!" messages appear in the console when the GameObject becomes active and running for the first time? (Assume the GameObject is active from scene load).
