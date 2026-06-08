# User Interface Frameworks and Styling: Study Guide

Designing UIs for desktop apps requires considerations for mouse/keyboard inputs, resizable windows, system styling sync, and multiple resolutions.

## 1. Key Concepts

### Concept 1: Responsive Layouts
Designing fluid layouts that scale gracefully from small window sizes to fullscreen monitors.

### Concept 2: Theme Synchronization
Detecting and subscribing to OS dark/light theme changes to adjust application themes automatically.

### Concept 3: Custom Titlebars & Window Dragging
Disabling default OS title bars and creating custom HTML title bars that support window dragging.

## 2. Practical Example

### User Interface Frameworks and Styling Example Setup
```javascript
Creating a draggable custom window titlebar using CSS:
.titlebar {
  -webkit-app-region: drag;
  height: 30px;
  background: var(--bg-color);
}
.titlebar-button {
  -webkit-app-region: no-drag; /* buttons must remain clickable */
}
```

## 3. Quick Check-Up

1. How do you implement window dragging without blocking button clicks in a custom titlebar?
2. Explain how you listen to system theme changes in React/CSS using media queries.
3. What is layout jank and how do you prevent it when resizing a desktop window?
