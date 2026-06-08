# Camera Models and Calibration

Understanding how cameras perceive the world and how to correct for their imperfections is fundamental in computer vision. This topic delves into the mathematical models that describe camera behavior and the techniques used to accurately map 3D world points to 2D image points.

## 1. The Pinhole Camera Model

The pinhole camera model is the simplest and most widely used mathematical model to approximate how a camera projects a 3D scene onto a 2D image plane. It assumes an infinitesimally small aperture (pinhole) through which light rays pass. While a simplification, it forms the basis for more complex models.

**Key Concepts:**
*   **Optical Center (Pinhole):** The single point where all light rays converge.
*   **Image Plane:** The plane where the projected 2D image is formed, typically inverted in a true pinhole model, but often conceptualized as being in front of the pinhole for mathematical convenience.
*   **Focal Length:** The distance between the pinhole and the image plane.

## 2. Intrinsic Parameters

Intrinsic parameters describe the internal characteristics of the camera itself. They are independent of the camera's position and orientation in the world.

**Components of the Intrinsic Matrix (K):**

```
K = | fx  s   cx |
    | 0   fy  cy |
    | 0   0   1  |
```

*   `fx`, `fy`: **Focal Lengths** in terms of pixel units along the x and y axes, respectively. These convert distances from world units to pixel units. Often `fx` and `fy` are very similar or identical for square pixels.
*   `cx`, `cy`: **Principal Point** (or optical center). This is the image coordinates of the point where the optical axis intersects the image plane. Ideally, it's at the center of the image.
*   `s`: **Skew Coefficient**. Represents the skew between the x and y axes of the image sensor. For most modern cameras, this is negligible and often assumed to be 0.

## 3. Extrinsic Parameters

Extrinsic parameters describe the camera's position and orientation in the 3D world coordinate system. They relate the camera's coordinate system to the global world coordinate system.

**Components:**

*   **Rotation Matrix (R):** A 3x3 matrix that defines the camera's orientation (pitch, yaw, roll) relative to the world coordinate system.
*   **Translation Vector (t):** A 3x1 vector that defines the camera's position (x, y, z) relative to the world coordinate system.

Together, `R` and `t` form a rigid body transformation that transforms 3D points from the world frame to the camera frame.

## 4. Lens Distortion Models

Real-world camera lenses are not perfect and introduce distortions that deviate from the ideal pinhole model. These distortions can significantly affect the accuracy of computer vision tasks.

**Types of Distortion:**

*   **Radial Distortion:**
    *   **Barrel Distortion:** Lines bulge outwards from the center (common in wide-angle lenses).
    *   **Pincushion Distortion:** Lines pinch inwards towards the center (common in telephoto lenses).
    *   Modeled by coefficients `k1`, `k2`, `k3`.

*   **Tangential Distortion:**
    *   Occurs when the lens is not perfectly aligned parallel to the image sensor.
    *   Causes objects to appear 