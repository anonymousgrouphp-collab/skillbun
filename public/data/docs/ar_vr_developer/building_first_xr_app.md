# Project: Building Your First XR Application

Welcome to the exciting world of Extended Reality (XR)! This project guides you through creating your very first AR (Augmented Reality) or VR (Virtual Reality) application. By applying fundamental concepts, you'll set up a basic interactive scene and prepare it for testing, solidifying your understanding of core XR development principles.

## 1. Understanding the XR Landscape: AR vs. VR

Before diving in, it's crucial to distinguish between AR and VR, as your choice impacts tools and design.

*   **Augmented Reality (AR)**: Overlays digital content onto the real world.
    *   **Key Characteristics**: Uses device cameras, tracks real-world surfaces, maintains user presence in reality.
    *   **Examples**: Pokémon GO, Snapchat filters, IKEA Place.
    *   **Common Platforms**: AR Foundation (Unity), ARCore (Android), ARKit (iOS).
*   **Virtual Reality (VR)**: Creates a completely immersive, simulated environment.
    *   **Key Characteristics**: Blocks out the real world, often requires headsets, provides a sense of presence within a digital space.
    *   **Examples**: Beat Saber, VRChat, Half-Life: Alyx.
    *   **Common Platforms**: OpenXR (Unity/Unreal), SteamVR, Oculus SDK.

For your first project, Unity with its XR Interaction Toolkit is a highly recommended and versatile choice for both AR and VR.

## 2. Core Components of an XR Application

Regardless of whether you choose AR or VR, most XR applications share fundamental building blocks:

### a. Scene Setup and Environment

*   **XR Origin**: The central component representing the user's position and orientation in the XR space. It typically includes the camera and input mechanisms.
*   **Environmental Tracking (AR)**: For AR, this involves detecting horizontal/vertical planes (floors, tables) or tracking specific images/objects in the real world to place virtual content.
*   **Virtual Environment (VR)**: For VR, this means designing and building the 3D world where the user will be immersed. This could be simple geometric shapes or complex imported models.
*   **Lighting**: Proper lighting is crucial for realism and visual appeal in both AR and VR.

### b. User Presence and Input

*   **Camera Setup**: The camera attached to the XR Origin is what the user sees through. In AR, it renders the real-world feed; in VR, it renders the virtual world.
*   **Input Management**: How the user interacts with the virtual environment.
    *   **AR**: Touch gestures (tap, swipe, pinch), sometimes head gaze.
    *   **VR**: Hand controllers (buttons, joysticks, triggers), hand tracking, gaze.
    *   **XR Interaction Toolkit (Unity)**: Provides a standardized framework for handling various XR inputs and interactions.

### c. Interactions and Object Manipulation

*   **Interactables**: Objects in your scene that users can interact with (e.g., buttons, levers, pickable objects).
*   **Interactors**: Components that enable interaction (e.g., ray interactor for pointing, direct interactor for touching/grabbing).
*   **Interaction Events**: Scripts respond to user actions like `OnSelectEnter`, `OnSelectExit`, `OnActivate`.

## 3. Step-by-Step: Building a Basic VR Grab Scene (Unity Example)

Let's outline a simple project using Unity to create a VR scene where you can grab a cube.

1.  **Create a New Unity Project**:
    *   Open Unity Hub.
    *   Create a new 3D Core project.
    *   Target a suitable platform (e.g., Android for mobile VR, or PC/Mac/Linux Standalone for PC VR development).
2.  **Install XR Interaction Toolkit**:
    *   Go to `Window > Package Manager`.
    *   Select "Unity Registry".
    *   Search for "XR Interaction Toolkit" and install it.
    *   Install "XR Plugin Management" as well.
3.  **Configure XR Plugin Management**:
    *   Go to `Edit > Project Settings > XR Plugin Management`.
    *   Enable your target VR platform (e.g., Oculus, OpenXR).
4.  **Set up XR Origin**:
    *   Right-click in the Hierarchy window.
    *   Select `XR > XR Origin (VR/Desktop)`. This will create a basic setup with a camera and controllers.
5.  **Create an Environment**:
    *   Add a 3D Plane to serve as the floor (`GameObject > 3D Object > Plane`). Position it at (0,0,0).
    *   Add some simple 3D objects (e.g., Cubes, Spheres) to populate the space.
6.  **Make an Object Grabbable**:
    *   Create a 3D Cube (`GameObject > 3D Object > Cube`).
    *   Add a `Rigidbody` component to the Cube (important for physics interactions).
    *   Add an `XR Grab Interactable` component to the Cube.
7.  **Test in Editor or on Device**:
    *   **Editor**: If using OpenXR, you might need a runtime like SteamVR. With Unity's built-in XR Device Simulator (requires `XR Interaction Toolkit Samples`), you can simulate interactions.
    *   **Device**: Build and deploy to your VR headset. Connect your device, go to `File > Build Settings`, select your platform, add your scene, and click "Build And Run".

## 4. Simple Interaction Script Example (Unity C#)

Let's create a script that changes the color of an object when it's grabbed.

1.  Create a new C# Script called `ColorChanger` (Right-click in Project window > `Create > C# Script`).
2.  Paste the following code:

    ```csharp
    using UnityEngine;
    using UnityEngine.XR.Interaction.Toolkit;

    public class ColorChanger : MonoBehaviour
    {
        private Renderer objectRenderer;
        private XRGrabInteractable grabInteractable;
        private Color originalColor;

        void Awake()
        {
            objectRenderer = GetComponent<Renderer>();
            grabInteractable = GetComponent<XRGrabInteractable>();

            if (objectRenderer != null)
            {
                originalColor = objectRenderer.material.color;
            }

            if (grabInteractable != null)
            {
                // Subscribe to interaction events
                grabInteractable.selectEntered.AddListener(OnGrabStarted);
                grabInteractable.selectExited.AddListener(OnGrabEnded);
            }
            else
            {
                Debug.LogWarning("XRGrabInteractable component not found on this GameObject.");
            }
        }

        private void OnGrabStarted(SelectEnterEventArgs args)
        {
            if (objectRenderer != null)
            {
                objectRenderer.material.color = Color.blue; // Change to blue when grabbed
            }
        }

        private void OnGrabEnded(SelectExitEventArgs args)
        {
            if (objectRenderer != null)
            {
                objectRenderer.material.color = originalColor; // Revert to original color when released
            }
        }

        void OnDestroy()
        {
            // Unsubscribe to prevent memory leaks
            if (grabInteractable != null)
            {
                grabInteractable.selectEntered.RemoveListener(OnGrabStarted);
                grabInteractable.selectExited.RemoveListener(OnGrabEnded);
            }
        }
    }
    ```

3.  Attach this `ColorChanger` script to your grabbable Cube GameObject (alongside the `Rigidbody` and `XR Grab Interactable`).

Now, when you grab the cube, its color will change to blue, and when you release it, it will revert to its original color.

## 5. Testing and Iteration

*   **Emulator/Simulator**: For quick iteration, use Unity's XR Device Simulator or specific platform emulators (e.g., Android Studio emulator for ARCore).
*   **Real Hardware**: Essential for final testing as it accounts for real-world performance, tracking accuracy, and user comfort. Build your application to your target device regularly.
*   **Debugging**: Use Unity's console for debugging messages and `Debug.Log()` statements to track script execution.

## Quick Understanding Checklist/Exercise

1.  Describe the primary difference in "environmental setup" between an AR and a VR application.
2.  List three common components that are typically part of an `XR Origin` in Unity.
3.  Explain why adding a `Rigidbody` component is crucial for an `XR Grab Interactable` object in Unity.
