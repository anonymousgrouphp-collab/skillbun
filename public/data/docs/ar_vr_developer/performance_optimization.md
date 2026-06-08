# XR Performance Optimization Study Guide

Achieving high frame rates and maintaining user comfort are paramount in XR experiences. Poor performance can lead to motion sickness, discomfort, and a broken sense of immersion. This guide outlines comprehensive strategies to optimize your XR applications for peak performance.

## 1. Understanding Performance Bottlenecks in XR

XR applications are incredibly demanding. Rendering two slightly different views for each eye, often at high resolutions and refresh rates (e.g., 90Hz or 120Hz), means the GPU and CPU have to work overtime. Common bottlenecks include:
*   **CPU-Bound:** Too many draw calls, complex scripting, physics simulations, or excessive garbage collection.
*   **GPU-Bound:** High polygon counts, complex shaders, unoptimized textures, or too many post-processing effects.
*   **Memory-Bound:** Large uncompressed textures, excessive geometry, or many objects loaded simultaneously.

## 2. Core Optimization Strategies

### A. Draw Call Reduction & Batching

A "draw call" is a command from the CPU to the GPU to draw a batch of triangles. Each draw call carries overhead. Reducing their number is crucial.
*   **Static Batching:** Combines multiple static (non-moving) meshes into one large mesh at editor time, reducing draw calls. The combined mesh shares one material.
*   **Dynamic Batching:** Automatically batches small meshes that share the same material at runtime. Objects must meet certain criteria (e.g., vertex count limit, uniform scaling).
*   **GPU Instancing:** If many identical objects share the same mesh and material but have different transformations (positions, rotations, scales), GPU instancing allows the GPU to render them efficiently with a single draw call.

### B. Occlusion Culling

Prevents rendering of objects that are completely hidden behind other objects from the camera's perspective. This reduces the number of rendered polygons and draw calls. It typically requires baking in the editor based on static geometry.

### C. Level of Detail (LODs)

LOD systems swap out high-detail meshes for lower-detail versions as an object moves further away from the camera. This significantly reduces the polygon count of distant objects without a noticeable loss of visual quality.

### D. Texture Compression

Uncompressed textures consume vast amounts of memory and bandwidth, impacting loading times and GPU performance.
*   **Choose appropriate formats:** Use block compression formats like DXT (desktop), ETC (Android), or PVRTC (iOS) that are native to mobile GPUs.
*   **Reduce texture resolution:** Use the lowest acceptable resolution for your textures.
*   **Mipmaps:** Generate mipmaps for textures. These are smaller versions of the texture used for objects further away, reducing texture sampling overhead.

### E. Lighting Optimization

Real-time lighting can be very expensive.
*   **Baked Lighting:** Use lightmaps (pre-calculated lighting stored in textures) for static objects. This offloads lighting calculations from runtime to editor time.
*   **Light Culling:** Ensure lights only illuminate necessary areas and are culled effectively by the engine.
*   **Reduce Real-time Lights:** Minimize the number of real-time lights, especially directional and point lights with shadows, as they are very costly. Use fewer lights with larger ranges, or use light probes for dynamic objects interacting with baked lighting.
*   **Disable Shadows:** Shadows, particularly real-time dynamic shadows, are extremely performance-intensive. Only enable them where absolutely critical.

### F. Efficient Garbage Collection (GC)

In managed memory environments (like C# in Unity), the garbage collector reclaims memory from unused objects. Frequent allocations and deallocations can trigger GC pauses, causing noticeable frame drops (stutters).
*   **Object Pooling:** Reuse objects instead of destroying and re-instantiating them frequently. This is critical for projectiles, enemies, or UI elements that appear and disappear often.
*   **Minimize heap allocations:** Avoid allocating new memory in performance-critical loops or `Update()` methods. Use `structs` where appropriate (though be mindful of copying costs).
*   **Cache references:** Don't repeatedly call `GetComponent()` or other expensive lookup functions. Cache references to components.
*   **Pre-allocate collections:** If you know the approximate size of a list or array, pre-allocate it to avoid re-sizing overhead.

## 3. Simple Code Example: Object Pooling (Unity C#)

This basic example demonstrates a simple object pool for a `Projectile` script.

```csharp
using UnityEngine;
using System.Collections.Generic;

public class ObjectPool : MonoBehaviour
{
    public static ObjectPool Instance { get; private set; }

    public GameObject objectPrefab;
    public int initialPoolSize = 10;

    private Queue<GameObject> _pool = new Queue<GameObject>();

    void Awake()
    {
        if (Instance != null && Instance != this)
        {
            Destroy(gameObject);
        }
        else
        {
            Instance = this;
        }

        // Populate the pool
        for (int i = 0; i < initialPoolSize; i++)
        {
            GameObject obj = Instantiate(objectPrefab);
            obj.SetActive(false);
            _pool.Enqueue(obj);
        }
    }

    public GameObject GetPooledObject()
    {
        if (_pool.Count > 0)
        {
            GameObject obj = _pool.Dequeue();
            obj.SetActive(true);
            return obj;
        }
        else
        {
            // Optionally expand the pool if needed
            GameObject obj = Instantiate(objectPrefab);
            Debug.LogWarning("Pool expanded! Consider increasing initial pool size.");
            return obj;
        }
    }

    public void ReturnPooledObject(GameObject obj)
    {
        obj.SetActive(false);
        _pool.Enqueue(obj);
    }
}

// Example usage in a 'Shooter' script
/*
public class Shooter : MonoBehaviour
{
    public float fireRate = 0.5f;
    private float nextFireTime;

    void Update()
    {
        if (Input.GetButtonDown("Fire1") && Time.time > nextFireTime)
        {
            nextFireTime = Time.time + fireRate;
            GameObject projectile = ObjectPool.Instance.GetPooledObject();
            projectile.transform.position = transform.position;
            projectile.transform.rotation = transform.rotation;
            // Set projectile velocity, etc.
        }
    }
}
*/
```
*Note: This is a simplified example. Production-ready object pools often handle multiple prefab types, dynamic resizing, and more robust error checking.*

## 4. Quick Checklist / Exercise

1.  **Scenario:** Your XR application experiences frequent micro-stutters when many enemies are destroyed and respawned. What optimization technique would you primarily implement to address this?
2.  **Question:** Explain the difference between Static Batching and Dynamic Batching, and when you would use each.
3.  **Task:** Identify two common causes of an XR application becoming "GPU-bound" and suggest a specific optimization for each.