## Core AR/VR Development in Unity

This study guide focuses on implementing foundational Augmented Reality (AR) and Virtual Reality (VR) experiences using Unity's comprehensive XR packages. We'll cover essential components like environmental tracking, spatial interactions, locomotion systems, and crucial platform-specific considerations.

### 1. Introduction to Unity's XR Ecosystem

Unity is the leading platform for developing AR and VR applications. Its extensibility allows developers to build immersive experiences for a wide range of devices.

*   **XR Plugin Management**: This system allows Unity to communicate with various platform-specific SDKs (Software Development Kits) like ARCore (Google), ARKit (Apple), Oculus, Valve SteamVR, and OpenXR. It enables you to target multiple XR devices with a single project.
*   **XR Interaction Toolkit**: A high-level, component-based system that provides a framework for creating VR and AR interactions. It abstracts common input and interaction patterns, making it easier to implement features like grabbing, teleporting, and UI interaction.

### 2. Setting Up Your Unity Project for XR

To begin AR/VR development, you need to configure your Unity project correctly:

1.  **Create a New Project**: Start with a new 3D project in Unity Hub.
2.  **Install XR Packages**: Open `Window > Package Manager`.
    *   Switch to `Unity Registry`.
    *   Install `XR Plugin Management`.
    *   Install `XR Interaction Toolkit` (ensure you also import the `Default Input Actions` and `Starter Assets` samples).
3.  **Configure XR Plugin Management**: Go to `Edit > Project Settings > XR Plugin Management`.
    *   Under the `Windows, Mac, Linux` tab (for VR headset simulation or PC VR), enable `OpenXR`. Ensure appropriate feature groups (e.g., `Oculus Quest Support`, `Valve Index Controller Support`) are enabled if using OpenXR.
    *   Under the `Android` tab, enable `OpenXR` and/or `ARCore` (for AR). If using OpenXR, enable `Oculus Quest Support` for Meta Quest devices.
    *   Under the `iOS` tab, enable `ARKit` (for AR).
4.  **Set Up Input System**: `XR Interaction Toolkit` relies on Unity's new Input System. If prompted to enable it, do so and restart Unity.

### 3. Environmental Tracking (AR Specific)

Environmental tracking is fundamental for AR applications, allowing digital content to interact with the real world.

*   **AR Foundation**: Unity's cross-platform API for AR, built on top of ARCore and ARKit. It provides common features across platforms.
    *   **Core AR Objects**: In your scene, you typically need an `AR Session` (manages the AR lifecycle) and an `AR Session Origin` (transforms AR camera and detected features into Unity's coordinate space).
    *   **Plane Detection**: Allows the AR device to detect horizontal (e.g., floors, tables) and vertical (e.g., walls) surfaces in the real world.
        *   Add `AR Plane Manager` to your `AR Session Origin`.
        *   Assign an `AR Plane` prefab to visualize detected planes.
    *   **Image Tracking**: Enables the AR application to recognize predefined 2D images (e.g., posters, pictures) and anchor digital content to them.
        *   Create a `Reference Image Library` (Project window, right-click `Create > XR > AR Reference Image Library`).
        *   Add `AR Tracked Image Manager` to your `AR Session Origin` and assign your `Reference Image Library`.
    *   **Object Tracking**: (More advanced) Recognizes and tracks predefined 3D objects in the environment.

### 4. Spatial Interactions (AR/VR)

Spatial interactions define how users manipulate objects and navigate within the AR/VR environment.

*   **Interactables and Interactors**: The core of `XR Interaction Toolkit`.
    *   **`XRBaseInteractor`**: Represents the user's input (e.g., a hand controller, a gaze).
        *   `XR Ray Interactor`: Allows interaction from a distance using a raycast (e.g., pointing at a button).
        *   `XR Direct Interactor`: For direct, physical contact with objects (e.g., grabbing a cube).
    *   **`XRBaseInteractable`**: Represents objects in the scene that can be interacted with.
        *   `XR Grab Interactable`: Makes an object grabbable by `XR Direct Interactor` or `XR Ray Interactor`.
        *   `XR Simple Interactable`: For basic trigger events.
*   **UI Interactions**: Interacting with Unity UI in XR requires special setup.
    *   Use an `XR UI Canvas` (Canvas with an `XR Graphic Raycaster`).
    *   Interact with UI using an `XR Ray Interactor` or specialized interactors like `XR Poke Interactor` for touch-like interactions.

#### Code Example: Custom Grabbable Object Behavior

While `XRGrabInteractable` handles basic grabbing, you often need custom behavior. This script demonstrates how to extend it for visual feedback.

```csharp
using UnityEngine;
using UnityEngine.XR.Interaction.Toolkit;

public class CustomGrabbableObject : XRGrabInteractable
{
    public Color hoverColor = Color.cyan;
    private Color originalColor;
    private MeshRenderer meshRenderer;

    protected override void Awake()
    {
        base.Awake();
        meshRenderer = GetComponent<MeshRenderer>();
        if (meshRenderer != null)
        {
            originalColor = meshRenderer.material.color;
        }
    }

    // Called when an interactor starts hovering over this object
    protected override void OnHoverEntered(HoverEnterEventArgs args)
    {
        base.OnHoverEntered(args);
        if (meshRenderer != null)
        {
            meshRenderer.material.color = hoverColor;
        }
    }

    // Called when an interactor stops hovering over this object
    protected override void OnHoverExited(HoverExitEventArgs args)
    {
        base.OnHoverExited(args);
        if (meshRenderer != null && !isSelected) // Revert only if not currently selected
        {
            meshRenderer.material.color = originalColor;
        }
    }

    // Called when an interactor starts selecting (grabbing) this object
    protected override void OnSelectEntered(SelectEnterEventArgs args)
    {
        base.OnSelectEntered(args);
        Debug.Log($"Object {gameObject.name} grabbed by {args.interactorObject.transform.name}");
        if (meshRenderer != null)
        {
            meshRenderer.material.color = Color.green; // Example: Green when grabbed
        }
    }

    // Called when an interactor stops selecting (releasing) this object
    protected override void OnSelectExited(SelectExitEventArgs args)
    {
        base.OnSelectExited(args);
        Debug.Log($"Object {gameObject.name} released by {args.interactorObject.transform.name}");
        if (meshRenderer != null)
        {
            meshRenderer.material.color = originalColor; // Revert to original color
        }
    }
}
```
*To use this code*: Create a 3D object (e.g., a Cube) in your scene. Add an `XR Grab Interactable` component to it, ensuring it has a `Rigidbody` and `Collider`. Then, add this `CustomGrabbableObject` script to the same GameObject.

### 5. Locomotion Systems (VR Specific)

Locomotion systems allow users to move through virtual environments.

*   **Teleportation**: Instantly moves the user to a new location, often used to prevent motion sickness.
    *   Components: `Teleportation Provider`, `Teleportation Anchor` (fixed teleport points), `Teleportation Area` (regions where teleportation is allowed).
*   **Continuous Move**: Provides smooth, joystick-based movement, similar to traditional video games. Can cause motion sickness for some users.
    *   Component: `Continuous Move Provider`.
*   **Snap Turn**: Rotates the user's view in fixed angular increments (e.g., 45 degrees), preventing rapid, smooth rotation that can induce motion sickness.
    *   Component: Configurable within `Continuous Turn Provider` or a dedicated `Snap Turn Provider`.

### 6. Platform-Specific Considerations

While Unity's XR packages aim for cross-platform compatibility, certain aspects remain platform-dependent.

*   **Unity's XR Plugin Management**: Your central point for enabling and configuring plugins for different platforms (e.g., Oculus, OpenXR, ARCore, ARKit).
*   **OpenXR**: An open royalty-free standard for accessing AR/VR platforms and devices. It allows developers to target a wide range of hardware with a single API, reducing fragmentation. When using OpenXR, you often need to enable specific *feature groups* for particular devices (e.g., Oculus, Valve).
*   **ARCore (Android) / ARKit (iOS)**: These are Google's and Apple's native AR SDKs, respectively. AR Foundation provides a unified interface to utilize their capabilities like plane detection, image tracking, and world tracking on their respective mobile platforms.
*   **Oculus Integration**: While OpenXR covers basic Oculus functionality, the `Oculus Integration` package from the Unity Asset Store provides access to advanced Oculus-specific features like hand tracking, passthrough AR, haptic feedback, and platform services.

### Checklist/Exercise to Test Understanding

1.  **Project Setup & Interactor Configuration**: Create a new Unity 3D project. Install `XR Plugin Management` and `XR Interaction Toolkit`. Add an `XR Origin (VR/AR)` prefab to your scene and ensure the controllers can cast rays.
2.  **Grabbable Object**: Create a 3D cube, add `XR Grab Interactable`, `Rigidbody`, and a `Box Collider` to it. Test grabbing and releasing the cube with your simulated XR controllers or actual headset.
3.  **Basic Locomotion**: Implement either a `Teleportation Area` (with a `Teleportation Provider`) or `Continuous Move Provider` with `Snap Turn` in your VR scene, allowing you to move around a simple environment (e.g., a plane with a few obstacles).
