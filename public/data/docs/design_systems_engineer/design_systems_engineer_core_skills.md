# Core Skills: Design Tokens & Component Development

Welcome to the core skills module for Design Systems Engineers, focusing on the practical application of design tokens and robust component development. This module equips you with the foundational knowledge and hands-on understanding to build scalable, consistent, and maintainable user interfaces.

## 1. Understanding Design Tokens

Design tokens are the visual design atoms of your design system. They are named entities that store design decisions such as colors, fonts, spacing, and animation timings, acting as a single source of truth. Instead of hardcoding values like `#FF0000` or `16px`, you use tokens like `--color-primary-500` or `--spacing-md`.

### Why Use Design Tokens?

*   **Consistency:** Ensures a unified look and feel across all platforms and products by referencing shared design values.
*   **Scalability:** Allows easy updates to design properties across an entire product without manual intervention on every instance.
*   **Maintainability:** Centralizes design decisions, making it simpler to manage and evolve your design system.
*   **Theming:** Facilitates dynamic theming (e.g., dark mode, brand variations) by swapping token values.
*   **Cross-Platform Harmony:** Bridges the gap between design tools (Figma, Sketch) and development environments (Web, iOS, Android) by providing a common language for design values.

### How Design Tokens Work

Design tokens typically involve a naming convention (e.g., `--category-type-variant-state`), a value, and sometimes a description. They are usually transformed into various formats suitable for different platforms:

*   **Web:** CSS Custom Properties (CSS Variables), Sass variables, JavaScript objects.
*   **iOS:** Swift enums/structs.
*   **Android:** XML resources.

**Example: Color Token Hierarchy**

```css
/* Alias Tokens (semantic, context-aware) */
--color-brand-primary: var(--color-blue-600);
--color-text-default: var(--color-neutral-900);
--color-background-surface: var(--color-neutral-000);

/* Primitives (raw, base values) */
--color-blue-600: #1D4ED8;
--color-neutral-900: #171717;
--color-neutral-000: #FFFFFF;
```

This structure allows you to change the underlying primitive (e.g., `--color-blue-600`) without affecting all alias tokens, or change an alias (e.g., `--color-brand-primary`) to point to a different primitive.

### Tools for Managing Design Tokens

Tools like **Style Dictionary** (from Amazon) are popular for transforming design tokens defined in a single source (e.g., JSON or YAML) into various platform-specific outputs. Figma plugins like "Figma Tokens" also streamline this process for designers.

## 2. Robust Component Development

Component development in a design system focuses on creating reusable, accessible, and well-tested UI components that consume design tokens.

### Atomic Design Principles

Adopting Brad Frost's Atomic Design methodology helps structure your component library:

*   **Atoms:** Basic HTML tags or their styled equivalents (e.g., `Button`, `Input`, `Label`).
*   **Molecules:** Groups of atoms functioning together (e.g., `SearchForm` containing an `Input` and a `Button`).
*   **Organisms:** Collections of molecules and/or atoms forming complex, distinct sections of an interface (e.g., `Header` with a logo, navigation, and search).
*   **Templates:** Page-level objects that place organisms into a layout.
*   **Pages:** Specific instances of templates showing real content.

### Component Library & Documentation

A dedicated component library (e.g., **Storybook**, Playroom) is crucial for:

*   **Isolation:** Developing and testing components in isolation.
*   **Documentation:** Providing live, interactive documentation for components, including props, usage examples, and accessibility guidelines.
*   **Collaboration:** Facilitating communication between designers, developers, and product managers.

### Modern Frontend Techniques for Components

*   **Frameworks/Libraries:** React, Vue, Svelte provide efficient ways to build interactive UI components.
*   **Styling Solutions:**
    *   **CSS-in-JS:** (e.g., Styled Components, Emotion) allows writing CSS directly in JavaScript, leveraging JS features for dynamic styling and easy token consumption.
    *   **Utility-first CSS:** (e.g., Tailwind CSS) provides low-level utility classes that can be composed to build any design, often integrating with design tokens.
    *   **CSS Preprocessors:** (e.g., Sass, Less) offer features like variables, mixins, and nesting that can consume tokens compiled to Sass variables.
    *   **CSS Modules:** Scopes CSS to components, preventing global style conflicts.
*   **Accessibility (a11y):** Integrating ARIA attributes, semantic HTML, and keyboard navigation from the start ensures components are usable by everyone.
*   **Testing:**
    *   **Unit Tests:** Verify individual functions and small parts of a component.
    *   **Integration Tests:** Ensure components work correctly when combined.
    *   **Snapshot Tests:** Capture the rendered output of a component and compare it to a previous snapshot to detect unintended UI changes.

### Example: A Simple Button Component using Design Tokens (React + Styled Components)

```jsx
// src/tokens/colors.js (or generated from Style Dictionary)
export const colors = {
  primary: 'var(--color-brand-primary)',
  textDefault: 'var(--color-text-default)',
};

// src/tokens/spacing.js
export const spacing = {
  sm: 'var(--spacing-sm)',
  md: 'var(--spacing-md)',
};

// src/components/Button.jsx
import React from 'react';
import styled from 'styled-components';
import { colors, spacing } from '../tokens'; // Assuming tokens are available as CSS variables or JS objects

const StyledButton = styled.button`
  background-color: ${colors.primary};
  color: ${colors.textDefault};
  padding: ${spacing.sm} ${spacing.md};
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    background-color: lightgray;
    cursor: not-allowed;
  }
`;

const Button = ({ children, onClick, disabled }) => (
  <StyledButton onClick={onClick} disabled={disabled}>
    {children}
  </StyledButton>
);

export default Button;
```
This example shows how `StyledButton` consumes `colors.primary`, `colors.textDefault`, `spacing.sm`, and `spacing.md` which are effectively design tokens (either direct CSS variables or values resolved from them).

## Quick Test Your Understanding

1.  **Token Transformation:** Describe one common tool used to transform design tokens from a single source (e.g., JSON) into multiple platform-specific formats (e.g., CSS variables, JavaScript objects).
2.  **Benefits of Isolation:** Explain why developing components in isolation (e.g., using Storybook) is crucial for a design system.
3.  **Theming with Tokens:** How do design tokens facilitate dynamic theming (e.g., light/dark mode) without modifying individual component styles?
