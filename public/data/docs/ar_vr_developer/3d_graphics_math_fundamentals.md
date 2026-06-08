# 3D Graphics & Linear Algebra for Games: Study Guide

Understanding 3D graphics and the underlying linear algebra is fundamental for any AR/VR developer. This guide will equip you with the essential mathematical and graphical concepts required to build immersive experiences.

## 1. Core Linear Algebra for 3D

Linear algebra provides the mathematical tools to describe position, orientation, and movement in 3D space.

### 1.1. Vectors

A vector is a quantity having both magnitude and direction, often represented as an arrow in 3D space. In game development, vectors represent positions, directions, velocities, and forces.

*   **Representation:** `(x, y, z)`
*   **Key Operations:**
    *   **Addition/Subtraction:** Combines directions/positions. `A + B = (Ax+Bx, Ay+By, Az+Bz)`
    *   **Scalar Multiplication:** Scales the vector's magnitude. `k * A = (k*Ax, k*Ay, k*Az)`
    *   **Magnitude (Length):** `|A| = sqrt(Ax^2 + Ay^2 + Az^2)`
    *   **Normalization:** Converts a vector into a unit vector (magnitude 1), preserving its direction. Useful for representing pure directions. `A_normalized = A / |A|`
    *   **Dot Product:** Returns a scalar value indicating how much two vectors point in the same direction. Useful for calculating angles, projecting vectors, and checking visibility. `A . B = |A| * |B| * cos(theta) = (Ax*Bx + Ay*By + Az*Bz)`
    *   **Cross Product:** Returns a new vector perpendicular to both input vectors. Useful for calculating surface normals and determining rotation axes. `A x B` (result depends on coordinate system handedness)

### 1.2. Matrices

A matrix is a rectangular array of numbers. In 3D graphics, 4x4 matrices are primarily used to represent and apply transformations (translation, rotation, scaling) to vectors and points.

*   **Representation:** A grid of numbers. For 3D transformations, typically 4x4.
*   **Matrix Multiplication:** The most common operation. Multiplying a vector by a transformation matrix applies the transformation. `Transformed_Vector = Matrix * Original_Vector`
*   **Transformation Types:**
    *   **Translation Matrix:** Moves an object.
    *   **Scaling Matrix:** Changes the size of an object.
    *   **Rotation Matrix:** Rotates an object around an axis.
    *   **Combined Transformations:** Multiple transformations can be concatenated (multiplied together) into a single matrix (e.g., `ModelMatrix = Translation * Rotation * Scale`).

### 1.3. Quaternions

Quaternions are an extension of complex numbers used to represent rotations in 3D space. They are superior to Euler angles (pitch, yaw, roll) because they do not suffer from "gimbal lock," a phenomenon where a degree of freedom is lost during certain rotations, leading to unintuitive behavior.

*   **Advantages:** Smooth interpolation between rotations, avoids gimbal lock, compact representation.
*   **Usage:** Most game engines (Unity, Unreal) handle quaternion math internally. You primarily use them to set and manipulate rotations via API calls rather than direct mathematical manipulation.

## 2. Fundamental 3D Graphics Concepts

### 2.1. Coordinate Systems

Objects in 3D space exist within different reference frames:

*   **Local/Object Space:** An object's own coordinate system, with its origin at its pivot point.
*   **World Space:** The global coordinate system of the entire scene. All objects ultimately exist here.
*   **View/Camera Space:** The coordinate system from the perspective of the camera. The camera is usually at the origin, looking down an axis (e.g., negative Z).
*   **Projection/Clip Space:** After applying projection, points are transformed into a cube (NDC - Normalized Device Coordinates) from -1 to 1 on each axis, ready for clipping and rasterization.

### 2.2. Transformations

Objects move from their local space to world space, then to view space, and finally to projection space. These transformations are achieved by multiplying vertices by specific matrices:

*   **Model Matrix (Object to World):** Transforms an object's local coordinates into world coordinates.
*   **View Matrix (World to View):** Transforms world coordinates into camera (view) coordinates. Essentially the inverse of the camera's world transformation.
*   **Projection Matrix (View to Projection/Clip):** Transforms 3D view-space coordinates into 2D clip-space coordinates, preparing them for the screen.

These are often combined into a single **Model-View-Projection (MVP) matrix**: `MVP = Projection * View * Model`.

### 2.3. Camera Projections

How 3D points are projected onto a 2D screen:

*   **Orthographic Projection:** Objects retain their original size regardless of distance from the camera. Used for 2D games, architectural drawings, or specific UI elements in 3D.
*   **Perspective Projection:** Objects further from the camera appear smaller, mimicking how the human eye perceives depth. Essential for realistic 3D games and AR/VR.

### 2.4. Rendering Pipelines (Basics)

The process by which 3D data is converted into a 2D image on screen.

*   **Vertex Processing:** Transforms vertices (position, normal, UVs) from object space through world, view, and projection space. Performs lighting calculations for vertices.
*   **Rasterization:** Converts the geometric primitives (triangles) into fragments (potential pixels) on the screen. Determines which pixels are covered by a triangle.
*   **Fragment Processing (Pixel Shader):** For each fragment, determines its final color, factoring in textures, lighting, shadows, and material properties.
*   **Standard Render Pipeline (SRP), Universal Render Pipeline (URP), High Definition Render Pipeline (HDRP):** In Unity, these are different rendering architectures.
    *   **SRP:** The legacy fixed-function pipeline.
    *   **URP:** A scriptable render pipeline designed for performance and scalability across various platforms (mobile, console, AR/VR). Highly customizable.
    *   **HDRP:** A scriptable render pipeline for high-fidelity graphics on high-end platforms, focusing on visual quality and realism.

For AR/VR, URP is often the default choice due to its performance and flexibility across devices.

## 3. Simple Code Example (Unity/C# Concept)

Here's how you might apply a simple transformation or calculate a dot product in a game engine like Unity:

```csharp
using UnityEngine;

public class MathExample : MonoBehaviour
{
    public Transform targetObject; // Assign in Inspector
    public float rotationSpeed = 50f;

    void Update()
    {
        // Example 1: Vector Operations
        Vector3 playerPosition = transform.position;
        Vector3 targetDirection = (targetObject.position - playerPosition).normalized;

        Debug.Log("Direction to target: " + targetDirection);

        // Calculate dot product to see if target is in front (assuming forward is Vector3.forward)
        float dotProduct = Vector3.Dot(transform.forward, targetDirection);
        if (dotProduct > 0.5f) // Arbitrary threshold
        {
            Debug.Log("Target is generally in front!");
        }
        else
        {
            Debug.Log("Target is not generally in front.");
        }

        // Example 2: Applying Rotation (internally uses Quaternions)
        // Rotate the object around its Y-axis over time
        transform.Rotate(Vector3.up * rotationSpeed * Time.deltaTime);
    }
}
```

This example demonstrates using `Vector3` for position and direction, calculating a dot product to check relative direction, and applying rotation using Unity's `Transform.Rotate`, which internally uses quaternions for smooth, gimbal-lock-free rotation.

## 4. Quick Understanding Checklist/Exercise

1.  **Vectors:** Given two vectors `A = (2, 3, 1)` and `B = (1, -1, 4)`, calculate their dot product. What does the sign of the result tell you about the angle between them?
2.  **Matrices & Transformations:** Explain how a single 4x4 matrix can represent a combination of translation, rotation, and scaling. Why is matrix multiplication order-dependent for transformations?
3.  **Coordinate Systems:** Describe the journey of a vertex from "Local Space" to "Projection Space" within a 3D rendering pipeline, mentioning the key matrices involved at each step.
