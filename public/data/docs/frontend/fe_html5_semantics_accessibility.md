# HTML5: Structure, Semantics & Accessibility Study Guide

Welcome to the study guide on HTML5 Structure, Semantics, and Accessibility! Mastering these concepts is crucial for building robust, maintainable, and inclusive web experiences.

## 1. Introduction to HTML5 Structure and Semantics

HTML5 introduced a rich set of semantic elements that provide meaning to the content they enclose, improving document structure and aiding both developers and machines (like search engines and screen readers). Unlike generic `<div>` elements, semantic tags clearly communicate the purpose of their content.

### Core Semantic Elements

*   `<header>`: Represents introductory content, typically containing navigation, headings, and logos.
*   `<nav>`: Defines a set of navigation links.
*   `<main>`: Represents the dominant content of the `<body>`. There should only be one `<main>` element per document.
*   `<article>`: Represents self-contained content, such as a blog post, news story, or forum post.
*   `<section>`: Groups related content. It should typically have a heading.
*   `<aside>`: Represents content that is tangentially related to the content around it (e.g., sidebars, pull quotes).
*   `<footer>`: Represents a footer for its nearest sectioning content or the root element. Typically contains copyright information, contact info, or related links.
*   `<figure>` and `<figcaption>`: Used for self-contained content like images, diagrams, or code snippets, with an optional caption.
*   `<time>`: Represents a date and/or time.
*   `<mark>`: Highlights parts of text.

### Importance of Semantic HTML

*   **Accessibility:** Screen readers use semantic structure to help users navigate and understand content.
*   **SEO:** Search engines better understand the content hierarchy and context, potentially improving rankings.
*   **Maintainability:** Code is easier to read and maintain for developers.
*   **Responsiveness:** Semantic elements often have default browser styles that can be easily overridden, and their inherent meaning makes it simpler to apply responsive design principles.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Semantic HTML Example</title>
</head>
<body>
    <header>
        <h1>My Awesome Blog</h1>
        <nav>
            <ul>
                <li><a href="/">Home</a></li>
                <li><a href="/about">About</a></li>
                <li><a href="/contact">Contact</a></li>
            </ul>
        </nav>
    </header>

    <main>
        <article>
            <header>
                <h2>My First Semantic Post</h2>
                <p>Published on <time datetime="2023-10-26">October 26, 2023</time></p>
            </header>
            <section>
                <h3>Introduction</h3>
                <p>This post explains the importance of semantic HTML.</p>
            </section>
            <section>
                <h3>Code Example</h3>
                <figure>
                    <pre><code>&lt;header&gt;&lt;nav&gt;...&lt;/nav&gt;&lt;/header&gt;</code></pre>
                    <figcaption>Basic header and navigation structure.</figcaption>
                </figure>
            </section>
            <footer>
                <p>Categories: HTML5, Web Development</p>
            </footer>
        </article>

        <aside>
            <h3>Related Articles</h3>
            <ul>
                <li><a href="#">Understanding ARIA</a></li>
                <li><a href="#">Accessible Forms</a></li>
            </ul>
        </aside>
    </main>

    <footer>
        <p>&copy; 2023 SkillBun. All rights reserved.</p>
    </footer>
</body>
</html>
```

## 2. Accessibility Fundamentals

Web accessibility (often abbreviated as A11y) means designing and developing websites so that people with disabilities can perceive, understand, navigate, and interact with the web. HTML5 provides many features to aid in creating accessible content.

### Key Accessibility Practices

*   **Alternative Text for Images:** Always provide meaningful `alt` attributes for `<img>` tags. This text is read by screen readers if the image cannot be displayed.
    ```html
    <img src="logo.png" alt="SkillBun Logo">
    ```
*   **Accessible Forms:**
    *   Use `<label>` elements associated with form controls via the `for` attribute (matching the input's `id`). This allows screen readers to announce the purpose of input fields.
    *   Utilize appropriate HTML5 input types (e.g., `type="email"`, `type="date"`) for better browser validation and user experience.
    *   Provide clear error messages and instructions.
    ```html
    <label for="username">Username:</label>
    <input type="text" id="username" name="username" required>
    ```
*   **Keyboard Navigation:** Ensure all interactive elements (links, buttons, form controls) are reachable and operable using only the keyboard (e.g., Tab, Enter, Spacebar).
*   **Semantic Headings:** Use `<h1>` through `<h6>` in a logical hierarchy to structure content. Don't skip heading levels (e.g., go from `<h1>` to `<h3>`).
*   **Language Attribute:** Set the `lang` attribute on the `<html>` tag to declare the document's primary language. This helps screen readers pronounce content correctly.
    ```html
    <html lang="en">
    ```

### Embedding Multimedia

HTML5 offers native elements for embedding audio and video, with built-in accessibility features:

*   `<audio>`: For embedding audio content.
*   `<video>`: For embedding video content.

Both elements support the `controls` attribute to provide default playback controls. For video, the `<track>` element can be used to add captions, subtitles, or descriptions for accessibility.

```html
<video controls width="640" height="360" poster="video-thumbnail.jpg">
    <source src="my-video.mp4" type="video/mp4">
    <source src="my-video.webm" type="video/webm">
    <track kind="captions" srclang="en" label="English captions" src="captions.vtt">
    <p>Your browser does not support the video tag.</p>
</video>
```

## 3. ARIA Attributes

ARIA (Accessible Rich Internet Applications) attributes provide additional semantics to HTML elements, especially for dynamic content and custom UI components that lack native HTML semantics. ARIA does *not* replace semantic HTML; it enhances it when necessary.

### When to Use ARIA

*   When native HTML elements don't fully support the semantics or behavior of a UI component (e.g., a custom slider, a tabbed interface, a dialog box).
*   To communicate dynamic changes to content or structure (e.g., live regions).

### Key ARIA Concepts

*   **Roles (`role="..."`):** Define the type of UI element or page region (e.g., `role="button"`, `role="alert"`, `role="dialog"`, `role="tablist"`).
*   **States (`aria-checked="true"`, `aria-disabled="true"`):** Describe the current condition of an element.
*   **Properties (`aria-label="..."`, `aria-labelledby="..."`, `aria-describedby="..."`, `aria-expanded="true"`):** Provide additional information or relationships to elements.

### Example with ARIA

Consider a custom button that toggles visibility of content:

```html
<button id="toggleButton" aria-expanded="false" aria-controls="contentPanel" role="button">
    Toggle Content
</button>
<div id="contentPanel" hidden>
    This content is now visible.
</div>

<script>
    const button = document.getElementById('toggleButton');
    const panel = document.getElementById('contentPanel');

    button.addEventListener('click', () => {
        const isExpanded = button.getAttribute('aria-expanded') === 'true';
        button.setAttribute('aria-expanded', !isExpanded);
        panel.hidden = isExpanded;
    });
</script>
```
*   `role="button"`: Explicitly defines the element as a button to assistive technologies.
*   `aria-expanded="false"`: Indicates that the controlled element is currently collapsed.
*   `aria-controls="contentPanel"`: Specifies that this button controls the element with `id="contentPanel"`.

### ARIA Golden Rule

"No ARIA is better than bad ARIA." Only use ARIA when native HTML cannot achieve the desired semantic meaning or interactivity. Always prefer native HTML elements with inherent semantics.

## Exercises

1.  **Semantic Markup:** Re-structure a simple blog post HTML (title, author, date, main content, comments section) using appropriate HTML5 semantic elements (`<article>`, `<header>`, `<footer>`, `<section>`, `<aside>`).
2.  **Accessible Image:** Add an `<img>` tag to your blog post and provide a descriptive `alt` attribute. Discuss what makes a good `alt` text.
3.  **ARIA Usage:** Imagine you're building a custom accordion component. Explain which ARIA roles, states, or properties you would use for the accordion headers and content panels to make it accessible.