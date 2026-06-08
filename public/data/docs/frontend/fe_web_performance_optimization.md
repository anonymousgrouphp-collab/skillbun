# Web Performance Optimization (Core Web Vitals) Study Guide

Web Performance Optimization (WPO) is the practice of improving how quickly web pages load and render. It's crucial for user experience, search engine ranking (SEO), and conversion rates. A slow website frustrates users, leads to higher bounce rates, and can negatively impact business goals. This guide focuses on core techniques and the critical Core Web Vitals metrics.

## 1. Understanding Core Web Vitals

Core Web Vitals are a set of standardized metrics from Google that measure real-world user experience for loading performance, interactivity, and visual stability of a page. They are a critical factor in Google's search ranking algorithm.

### 1.1. Largest Contentful Paint (LCP)

*   **What it measures:** The time it takes for the largest content element (image or text block) in the viewport to become visible. It reflects the perceived loading speed.
*   **Good Threshold:** LCP should occur within **2.5 seconds** of when the page first starts loading.
*   **Optimization Techniques:**
    *   **Optimize server response time:** Use a fast server, CDN, cache assets.
    *   **Remove render-blocking resources:** Defer non-critical CSS and JavaScript.
    *   **Optimize image/video sizes:** Use responsive images, compress files, consider modern formats (WebP, AVIF).
    *   **Preload critical resources:** Use `<link rel="preload">` for important assets.
    *   **Server-side rendering (SSR) or Static Site Generation (SSG):** Deliver fully rendered HTML to the browser.

### 1.2. First Input Delay (FID)

*   **What it measures:** The time from when a user first interacts with a page (e.g., clicks a button, taps a link) to the time when the browser is actually able to begin processing that interaction. It reflects page responsiveness.
*   **Good Threshold:** FID should be **100 milliseconds** or less.
*   **Optimization Techniques:**
    *   **Reduce JavaScript execution time:** Minimize, compress, and defer JavaScript. Break up long-running tasks into smaller, asynchronous chunks.
    *   **Use Web Workers:** Offload heavy computational tasks to a background thread, preventing the main thread from being blocked.
    *   **Avoid excessive DOM size:** A smaller DOM tree leads to faster rendering and less JavaScript processing.

### 1.3. Cumulative Layout Shift (CLS)

*   **What it measures:** The sum total of all individual layout shift scores for every unexpected layout shift that occurs during the entire lifespan of the page. It reflects visual stability.
*   **Good Threshold:** CLS score should be **0.1** or less.
*   **Optimization Techniques:**
    *   **Always include `width` and `height` attributes for images and video elements:** This allows the browser to reserve the correct amount of space in the document.
    *   **Reserve space for dynamically injected content:** Use CSS aspect-ratio boxes or set a minimum height.
    *   **Avoid inserting content above existing content:** Unless it's in response to a user interaction.
    *   **Use CSS `transform` for animations:** Avoid animating properties that trigger layout changes (e.g., `width`, `height`, `top`, `left`).

## 2. General Web Performance Optimization Techniques

Beyond Core Web Vitals, several other techniques contribute to a faster website.

### 2.1. Image Optimization

Images often make up the largest portion of a page's total bytes. Optimizing them is crucial.

*   **Compression:** Use tools to compress images without significant quality loss.
*   **Modern Formats:** Use WebP or AVIF instead of JPEG or PNG for better compression and quality.
*   **Responsive Images:** Use `srcset` and `sizes` attributes to serve appropriately sized images for different screen resolutions and viewports.

### 2.2. Lazy Loading

Defer loading of non-critical resources (images, iframes) until they are needed, typically when they enter the viewport.

*   **Native Lazy Loading:** Modern browsers support the `loading="lazy"` attribute for `<img>` and `<iframe>` elements.

    ```html
    <img src="low-res-placeholder.jpg" data-src="actual-image.jpg" alt="A beautiful landscape" loading="lazy" width="1200" height="800">
    
    <iframe src="video-embed.html" loading="lazy" width="560" height="315" title="Embedded video player"></iframe>
    ```

### 2.3. Code Splitting

Break down large JavaScript bundles into smaller chunks that can be loaded on demand or in parallel.

*   **Dynamic `import()`:** Use `import()` syntax for dynamic module loading, often utilized by bundlers like Webpack or Rollup.

    ```javascript
    // Before code splitting
    import { someHeavyModule } from './heavy-module';
    
    // After code splitting (loads only when needed)
    document.getElementById('myButton').addEventListener('click', async () => {
      const { someHeavyModule } = await import('./heavy-module');
      someHeavyModule();
    });
    ```

### 2.4. Asset Compression

Compress text-based assets (HTML, CSS, JavaScript) transmitted from the server to the browser.

*   **Gzip/Brotli:** Configure your web server (e.g., Nginx, Apache) or CDN to automatically compress these files before sending them.

## 3. Checklist / Exercise

1.  **Core Web Vitals Identification:** List the three Core Web Vitals and briefly explain what aspect of user experience each is designed to measure.
2.  **CLS Prevention:** You have an image on your page that loads after some JavaScript executes. How can you most effectively prevent Cumulative Layout Shift (CLS) caused by this image?
3.  **LCP Improvement:** Your Largest Contentful Paint (LCP) score is consistently poor. Name two distinct techniques you could implement to improve it.