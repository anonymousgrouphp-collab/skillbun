# Design Tokens: Definition, Structure & Implementation

Design Tokens are an integral part of modern design systems, acting as the single source of truth for styling decisions. They abstract raw values (like hex codes, pixel sizes) into named entities that can be programmatically managed and transformed for different platforms, ensuring consistency and scalability across products.

## 1. What are Design Tokens?

Design tokens are the smallest, atomic pieces of a design system. They are named entities that store visual design attributes. Instead of hardcoding values like `#007bff` or `16px` directly into your code, you reference a token, e.g., `color.brand.primary` or `spacing.medium`.

### Core Concepts:
*   **Single Source of Truth:** All design decisions are centralized. Change a token value once, and it updates everywhere it's used.
*   **Abstract Values:** Tokens are platform-agnostic. They are data (often JSON) that can be transformed into platform-specific outputs (CSS variables, Sass maps, JavaScript objects, iOS `.h`/`.m` files, Android XML).
*   **Bridging Design & Development:** Tokens formalize the handoff, ensuring designers and developers speak the same language when it comes to visual properties.

### Benefits:
*   **Consistency:** Guarantees a unified look and feel across all platforms and products.
*   **Efficiency:** Reduces manual work, accelerates development, and simplifies design updates.
*   **Maintainability:** Easier to update, refactor, and scale design decisions.
*   **Cross-Platform Adaptability:** A single set of tokens can generate outputs for web, iOS, Android, and other environments.

## 2. Structure of Design Tokens

Design tokens are typically structured hierarchically to manage complexity and provide clear context. This structure often follows a dot-notation (e.g., `category.type.item.variant`).

### Common Token Categories:
*   **Global/Primitive Tokens:** Raw, context-agnostic values. These are the absolute base values (e.g., specific hex colors, font sizes in `px`, basic spacing units). They are highly reusable but don't convey specific usage.
    *   `color.base.blue.500: #007bff`
    *   `font.size.base: 16px`
    *   `spacing.100: 4px`

*   **Alias/Semantic Tokens:** Context-specific values that reference primitive tokens. They describe the *purpose* or *intent* of a value within the design system, making the system more flexible and themable.
    *   `color.brand.primary: { value: '{color.base.blue.500}' }`
    *   `spacing.component.gap: { value: '{spacing.200}' }`
    *   `font.family.body: { value: '{font.family.system}' }`

*   **Component-Specific Tokens:** Values directly tied to the styling of a particular component. These often reference alias tokens.
    *   `button.primary.background: { value: '{color.brand.primary}' }`
    *   `card.border.radius: { value: '{border.radius.medium}' }`

### Example JSON Structure:

```json
{
  