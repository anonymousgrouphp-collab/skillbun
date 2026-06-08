# Building Truly Accessible UI Components

Accessibility (a11y) in UI component development is not just a regulatory requirement; it's a fundamental aspect of inclusive design. It ensures that your interfaces are usable by everyone, including individuals with disabilities, by adhering to standards like WCAG (Web Content Accessibility Guidelines). Integrating accessibility from the start enhances user experience for all and avoids costly reworks.

## Core Accessibility Concepts

### 1. Semantic HTML

Semantic HTML is the foundation of an accessible web. Using HTML elements for their intended purpose provides inherent meaning and structure that assistive technologies like screen readers can interpret.

*   **Bad Example:** `<div>` used as a button:
    ```html
    <div onclick="doSomething()" onkeypress="handleKeyPress()">Click Me</div>
    ```
*   **Good Example:** Using a native `<button>` element:
    ```html
    <button type="button" onclick="doSomething()">Click Me</button>
    ```
    The native button automatically handles keyboard interaction, focus, and conveys its role to assistive technologies.

**Key Semantic Elements:**
*   **Headings:** `<h1>` to `<h6>` for document structure.
*   **Lists:** `<ul>`, `<ol>`, `<li>` for grouping related items.
*   **Landmarks:** `<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>` for page regions.
*   **Forms:** `<form>`, `<label>`, `<input>`, `<textarea>`, `<select>` for interactive controls.

### 2. Keyboard Navigation

Many users, including those with motor disabilities or who are blind, rely solely on a keyboard to navigate and interact with web content.
*   **Tab Order:** Ensure a logical tab order that follows the visual layout of the page. By default, interactive HTML elements (`<a href>`, `<button>`, `<input>`, `<textarea>`, `<select>`) are focusable and navigable via the `Tab` key.
*   **Focus Indicators:** Always provide clear visual focus indicators (e.g., a distinct outline) for interactive elements. Browsers provide defaults, but ensure custom styling doesn't remove them (`outline: none;` is an anti-pattern).
*   **Interactive Elements:** All interactive elements must be reachable and operable via keyboard alone. This includes custom components. For non-native interactive elements, `tabindex="0"` can make them focusable, and `tabindex="-1"` makes them programmatically focusable but not part of the natural tab order.

### 3. ARIA Attributes (Accessible Rich Internet Applications)

ARIA provides a way to add semantic information to HTML when native HTML semantics are insufficient, especially for complex UI components built with JavaScript. Use ARIA to:
*   **Define Roles:** Indicate the type of UI component (e.g., `role="dialog"`, `role="alert"`, `role="tablist"`).
*   **Define States:** Convey current conditions (e.g., `aria-expanded="true"`, `aria-checked="false"`).
*   **Define Properties:** Provide additional information (e.g., `aria-label="Close button"`, `aria-labelledby="id-of-label"`, `aria-describedby="id-of-description"`).

**The First Rule of ARIA:** If you can use a native HTML element or attribute with the semantics and behavior you require, use it instead. Only use ARIA when semantic HTML is not sufficient.

**Example for a custom toggle switch:**
```html
<div role="switch"
     aria-checked="false"
     tabindex="0"
     aria-label="Enable notifications">
  <span class="switch-handle"></span>
</div>
```

### 4. Focus Management

Beyond basic keyboard navigation, explicit focus management is crucial for dynamic content and complex interactions.
*   **Modal Dialogs:** When a modal opens, focus should be moved inside the modal (typically to the first interactive element or close button). Focus should be trapped within the modal until it's closed, then returned to the element that triggered it.
*   **Dynamic Content Updates:** If new content appears or disappears, consider where focus should go. For example, after submitting a form, if an error message appears, focus might be moved to the error.
*   **Skipping to Main Content:** Provide a "Skip to Main Content" link for keyboard and screen reader users to bypass repetitive navigation links.

### 5. Contrast Requirements

Sufficient color contrast ensures that text and graphical components are distinguishable for users with low vision or color blindness.
*   **WCAG 2.1 AA Standards:**
    *   **Text:** A contrast ratio of at least 4.5:1 for normal text and 3:1 for large text (18pt or 14pt bold).
    *   **Graphical Objects & UI Components:** A contrast ratio of at least 3:1 against adjacent colors.
*   **Tools:** Use browser developer tools (e.g., Chrome Lighthouse, Firefox Accessibility Inspector) or online contrast checkers (e.g., WebAIM Contrast Checker) to verify compliance.

## WCAG Standards

The Web Content Accessibility Guidelines (WCAG) are the international standards for web accessibility. Adhering to WCAG 2.1 (or newer) AA level ensures a high level of accessibility for most users. These guidelines are organized into four main principles (POUR):
*   **Perceivable:** Information and UI components must be presentable to users in ways they can perceive.
*   **Operable:** UI components and navigation must be operable.
*   **Understandable:** Information and the operation of UI must be understandable.
*   **Robust:** Content must be robust enough that it can be interpreted reliably by a wide variety of user agents, including assistive technologies.

## Code Example: Accessible Custom Button

Let's create a custom "Like" button that handles accessibility correctly.

```html
<button id="likeButton"
        type="button"
        aria-pressed="false"
        aria-label="Like button. Current state: not liked."
        onclick="toggleLike(this)">
  <span aria-hidden="true">👍</span> Like
</button>

<script>
  function toggleLike(buttonElement) {
    const isPressed = buttonElement.getAttribute('aria-pressed') === 'true';
    buttonElement.setAttribute('aria-pressed', String(!isPressed));

    const newLabel = !isPressed
      ? 'Like button. Current state: liked.'
      : 'Like button. Current state: not liked.';
    buttonElement.setAttribute('aria-label', newLabel);

    // Visual feedback (e.g., add/remove a class)
    buttonElement.classList.toggle('liked', !isPressed);

    console.log(`Button state changed to: ${!isPressed ? 'liked' : 'not liked'}`);
  }
</script>

<style>
  button {
    padding: 10px 15px;
    border: 1px solid #ccc;
    border-radius: 5px;
    background-color: #f0f0f0;
    cursor: pointer;
    font-size: 16px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  button:hover {
    background-color: #e0e0e0;
  }
  button:focus {
    outline: 2px solid blue; /* Clear focus indicator */
    outline-offset: 2px;
  }
  button.liked {
    background-color: #d1e7dd;
    border-color: #28a745;
    color: #28a745;
  }
</style>
```
**Explanation:**
*   Uses a native `<button>` for inherent semantics, keyboard support, and focusability.
*   `aria-pressed="false"`: Indicates a toggle button's current state (not pressed). Updated via JavaScript.
*   `aria-label`: Provides an accessible name for the button, including its current state, useful for screen reader users. This overrides the visual text "Like" for assistive technologies, providing more context.
*   `aria-hidden="true"`: Hides the emoji from screen readers, as the `aria-label` provides sufficient context.
*   `tabindex="0"` is not explicitly needed here because `<button>` is naturally focusable.
*   Clear focus styles are provided in CSS.

## Quick Understanding Checklist/Exercise

1.  **Identify and fix:** Given a custom `div` element acting as a checkbox, describe how you would transform it into an accessible component using semantic HTML and ARIA.
2.  **Evaluate contrast:** You're designing a button with light gray text (`#AAAAAA`) on a white background (`#FFFFFF`). Is this accessible according to WCAG 2.1 AA for normal text? If not, what would be a compliant foreground color?
3.  **Keyboard trap:** Imagine a modal dialog that opens, and when a user presses `Tab` repeatedly, they can navigate to elements *behind* the modal. What accessibility principle is being violated, and how would you fix it using focus management?