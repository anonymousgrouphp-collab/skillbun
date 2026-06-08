# HTML5 & Advanced CSS3 for Modern Web: Study Guide

This guide will walk you through the essential concepts and techniques for mastering modern web development using HTML5 and advanced CSS3. We'll cover semantic structuring, powerful layout tools, responsive design, accessibility best practices, and more.

## 1. Mastering Semantic HTML5

Semantic HTML is about using HTML elements that convey meaning about the content they contain, rather than just how they should look. This is crucial for accessibility, SEO, and maintainability.

### Core Concepts
*   **Meaningful Markup:** Using tags like `<article>`, `<nav>`, `<aside>`, `<footer>` helps screen readers, search engines, and developers understand the structure and purpose of different parts of a webpage.
*   **Benefits:** Improved accessibility for users with disabilities, better search engine optimization (SEO), easier development and maintenance, and clearer code readability.

### Key Semantic Elements
*   `<header>`: Introduces a section or page, often containing headings, navigation, or logos.
*   `<nav>`: Defines a block of navigation links.
*   `<main>`: Represents the dominant content of the `<body>`, unique to each document.
*   `<article>`: Represents a self-contained composition, like a blog post, news story, or forum post.
*   `<section>`: A generic standalone section within a document, typically with a heading.
*   `<aside>`: Content indirectly related to the main content, often presented as a sidebar.
*   `<footer>`: Represents a footer for its nearest sectioning content or sectioning root.
*   `<figure>` & `<figcaption>`: Used for self-contained content (like images, diagrams, code snippets) with an optional caption.
*   `<time>`, `<mark>`, `<details>`, `<summary>`: More specific semantic elements for various content types.

### Code Example: Basic Semantic Structure
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Semantic Page</title>
</head>
<body>
    <header>
        <h1>My Awesome Website</h1>
        <nav aria-label="Main navigation">
            <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </nav>
    </header>
    <main>
        <section id="home">
            <h2>Welcome!</h2>
            <p>This is the main content area.</p>
        </section>
        <article>
            <h3>Blog Post Title</h3>
            <p>Content of the blog post...</p>
            <figure>
                <img src="https://via.placeholder.com/150" alt="Placeholder image">
                <figcaption>A beautiful image illustrating the post.</figcaption>
            </figure>
        </article>
        <aside aria-label="Related content">
            <h4>Related Links</h4>
            <ul>
                <li><a href="#">Link to another article</a></li>
                <li><a href="#">External resource</a></li>
            </ul>
        </aside>
    </main>
    <footer>
        <p>&copy; 2023 My Semantic Website</p>
    </footer>
</body>
</html>
```

### Checklist/Exercise
1.  Explain why `<div>` and `<span>` are considered non-semantic elements.
2.  Which semantic tag would best represent a self-contained piece of content, like a blog post or news article, that could be syndicated?
3.  Create a simple HTML structure for a product listing (e.g., three products), incorporating `<section>`, `<article>`, and `<figure>` for each product.

## 2. Advanced CSS3 Techniques

### 2.1. Flexbox for One-Dimensional Layouts

Flexbox (Flexible Box Module) is a one-dimensional layout module that helps in distributing space among items in a container and aligning them, either horizontally or vertically.

### Core Concepts
*   **Flex Container:** The parent element with `display: flex;` or `display: inline-flex;`.
*   **Flex Items:** The direct children of the flex container.
*   **Main Axis:** The primary axis along which flex items are laid out (default: horizontal).
*   **Cross Axis:** The axis perpendicular to the main axis (default: vertical).

### Key Properties
*   **On the container:**
    *   `display: flex;`
    *   `flex-direction`: `row` (default), `column`, `row-reverse`, `column-reverse`
    *   `justify-content`: Controls alignment along the main axis (`flex-start`, `flex-end`, `center`, `space-between`, `space-around`, `space-evenly`)
    *   `align-items`: Controls alignment along the cross axis (`flex-start`, `flex-end`, `center`, `baseline`, `stretch`)
    *   `flex-wrap`: `nowrap` (default), `wrap`, `wrap-reverse`
    *   `gap`: Shorthand for `row-gap` and `column-gap` (defines space between items).
*   **On the items:**
    *   `flex-grow`: Ability for an item to grow if necessary.
    *   `flex-shrink`: Ability for an item to shrink if necessary.
    *   `flex-basis`: Default size of an element before remaining space is distributed.

### Code Example: Centering with Flexbox
```css
.container {
    display: flex;
    justify-content: center; /* Horizontally center content */
    align-items: center;    /* Vertically center content */
    height: 200px;
    border: 1px solid #ccc;
    background-color: #f9f9f9;
}
.item {
    width: 100px;
    height: 100px;
    background-color: lightblue;
    border-radius: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: sans-serif;
}
```
```html
<div class="container">
    <div class="item">Centered</div>
</div>
```

### Checklist/Exercise
1.  How do you make Flex items wrap to the next line when there isn't enough space in the container?
2.  What is the main difference in spacing between `justify-content: space-between;` and `justify-content: space-around;`?
3.  Create a horizontal navigation bar using Flexbox where items are evenly spaced with equal space around them.

### 2.2. CSS Grid Layout for Two-Dimensional Layouts

CSS Grid Layout is a powerful two-dimensional layout system that allows you to design complex, responsive layouts with rows and columns simultaneously. It's ideal for main page layouts.

### Core Concepts
*   **Grid Container:** The parent element with `display: grid;` or `display: inline-grid;`.
*   **Grid Items:** The direct children of the grid container.
*   **Grid Lines:** The dividing lines that form the grid structure (vertical for columns, horizontal for rows).
*   **Grid Tracks:** The spaces between grid lines (rows and columns).
*   **Grid Cells:** The smallest unit of the grid, formed by the intersection of a row and a column.
*   **Grid Areas:** Named areas within the grid that can span multiple cells.

### Key Properties
*   **On the container:**
    *   `display: grid;`
    *   `grid-template-columns`: Defines column tracks (e.g., `1fr 1fr 1fr`, `100px auto 200px`, `repeat(3, 1fr)`).
    *   `grid-template-rows`: Defines row tracks.
    *   `gap`, `row-gap`, `column-gap`: Space between grid tracks.
    *   `grid-template-areas`: Assigns names to grid areas for easier placement.
    *   `justify-items`, `align-items`, `place-items`: Controls alignment of content *within* grid cells.
*   **On the items:**
    *   `grid-column`: Defines an item's start and end column lines.
    *   `grid-row`: Defines an item's start and end row lines.
    *   `grid-area`: Places an item into a named grid area or defines its position by line numbers.

### Code Example: Basic Grid Structure
```css
.grid-container {
    display: grid;
    grid-template-columns: 1fr 2fr 1fr; /* Three columns: left and right 1 unit, middle 2 units */
    grid-template-rows: auto 100px;    /* First row auto-height, second row 100px */
    gap: 10px;
    height: 300px;
    border: 1px solid #ccc;
    background-color: #f9f9f9;
}
.grid-item {
    background-color: lightgreen;
    padding: 10px;
    border: 1px solid darkgreen;
    font-family: sans-serif;
    display: flex; /* For item content centering */
    justify-content: center;
    align-items: center;
}
.item1 { grid-column: 1 / 3; } /* Spans from column line 1 to 3 */
.item4 { grid-row: 1 / 3; }    /* Spans from row line 1 to 3 */
```
```html
<div class="grid-container">
    <div class="grid-item item1">Header (Col 1-2)</div>
    <div class="grid-item">Item 2 (Col 3)</div>
    <div class="grid-item item4">Sidebar (Row 1-2)</div>
    <div class="grid-item">Main Content (Col 1)</div>
    <div class="grid-item">Footer (Col 2)</div>
</div>
```

### Checklist/Exercise
1.  When would you typically choose CSS Grid for a layout instead of Flexbox?
2.  How would you create a three-column layout where the middle column is twice as wide as the left and right columns using `fr` units?
3.  Use `grid-template-areas` to define a layout with a `header`, `main`, and `footer` section, where the header and footer span all columns, and the main content is in the middle column with two sidebars.

### 2.3. CSS Custom Properties (Variables)

CSS Custom Properties, often called CSS variables, allow you to define reusable values (like colors, fonts, spacing) that can be accessed throughout your CSS. They significantly improve maintainability and consistency.

### Core Concepts
*   **Definition:** `--variable-name: value;` (e.g., `--primary-color: #007bff;`). They are case-sensitive.
*   **Usage:** `property: var(--variable-name);`.
*   **Scope:** Custom properties are cascade-aware. They can be defined globally (typically on `:root`) or locally within specific selectors, affecting only their descendants.
*   **Benefits:** Easier maintenance, consistent design, simplified theme switching, and dynamic styling with JavaScript.

### Code Example: Defining and Using Variables
```css
:root { /* Global scope */
    --primary-color: #007bff;
    --secondary-color: #6c757d;
    --spacing-md: 1rem;
    --font-family: 'Arial', sans-serif;
}

body {
    font-family: var(--font-family);
    background-color: var(--secondary-color);
    padding: var(--spacing-md);
}

h1 {
    color: var(--primary-color);
    margin-bottom: var(--spacing-md);
}

.card {
    border: 1px solid var(--secondary-color);
    padding: var(--spacing-md);
    margin-top: var(--spacing-md);
    background-color: white;
    border-radius: 5px;
}
```

### Checklist/Exercise
1.  Where is the most common and recommended place to define global CSS custom properties?
2.  How do you apply a custom property named `--button-bg` to the `background-color` of a button element?
3.  Define a `--line-height-base` variable for text line height and apply it to the `body` element.

### 2.4. Modern Responsive Design Patterns

Responsive web design ensures that websites adapt seamlessly to various screen sizes, orientations, and devices, providing an optimal viewing experience for all users.

### Key Techniques
*   **Media Queries:** CSS rules applied conditionally based on device characteristics (e.g., width, height, orientation). Syntax: `@media screen and (max-width: 768px) { /* styles */ }`.
    *   **Mobile-First Approach:** Design for the smallest screen first, then progressively enhance for larger screens using `min-width` queries (`@media (min-width: 768px)`).
*   **Fluid Units:** Use relative units instead of fixed pixels for widths, heights, fonts, etc.
    *   `em`: Relative to the font-size of the element's parent.
    *   `rem`: Relative to the font-size of the root `html` element.
    *   `vw` (viewport width): Relative to 1% of the viewport's width.
    *   `vh` (viewport height): Relative to 1% of the viewport's height.
*   **Flexible Images/Media:** Images and videos should scale within their containers.
    *   `img { max-width: 100%; height: auto; display: block; }`
    *   For `iframe` (e.g., YouTube videos), use aspect ratio boxes.
*   **Viewport Meta Tag:** Essential for mobile browsers to render the page correctly.
    *   `<meta name="viewport" content="width=device-width, initial-scale=1.0">`

### Code Example: Basic Media Query (Mobile-First)
```css
/* Default styles (mobile-first) */
body {
    margin: 0;
    padding: 15px;
    font-family: sans-serif;
    background-color: #fff;
    color: #333;
}

.container {
    width: 100%;
    max-width: 480px; /* Max width for small screens */
    margin: 0 auto;
    padding: 10px;
    border: 1px solid #eee;
    background-color: lightgoldenrodyellow;
}

/* Styles for screens wider than 768px (e.g., tablets/desktops) */
@media (min-width: 768px) {
    body {
        padding: 30px;
        background-color: #f0f8ff;
    }
    .container {
        width: 80%;
        max-width: 960px; /* Max width for larger screens */
        padding: 20px;
        background-color: lightcyan;
    }
}
```

### Checklist/Exercise
1.  Why is a "mobile-first" approach often recommended for responsive design over a "desktop-first" approach?
2.  What CSS property combination ensures images don't overflow their containers on smaller screens while maintaining their aspect ratio?
3.  Write a media query (using a mobile-first approach) that changes the `font-size` of the `body` to `18px` when the screen width is `992px` or wider.

### 2.5. CSS Preprocessors (Sass/SCSS)

CSS preprocessors are scripting languages that extend CSS with features like variables, nesting, mixins, functions, and partials. They help make CSS more maintainable, scalable, and powerful. Sass (Syntactically Awesome Style Sheets) is one of the most popular.

### Core Concepts
*   **Sass vs. SCSS:** Sass originally used an indented syntax. SCSS (Sassy CSS) is a newer syntax that is a superset of CSS, meaning any valid CSS is also valid SCSS. SCSS is more widely used today.
*   **Compilation:** Preprocessor code (e.g., `.scss` files) must be compiled into standard CSS (`.css` files) before being used by browsers.

### Key Features (SCSS)
*   **Variables:** Store reusable values like colors, fonts, or spacing. `$primary-color: #337ab7;`
*   **Nesting:** Nest CSS selectors inside one another to follow your HTML structure, reducing repetition.
    ```scss
    nav {
        ul {
            margin: 0;
            padding: 0;
            li {
                list-style: none;
                a {
                    display: block;
                    padding: 10px 15px;
                    &:hover { /* The '&' refers to the parent selector (a) */
                        color: blue;
                    }
                }
            }
        }
    }
    ```
*   **Partials & Imports:** Organize your CSS into smaller, modular files (partials, typically starting with `_`) and import them into a main file using `@import 'filename';`.
*   **Mixins:** Reusable blocks of CSS declarations that can accept arguments.
*   **Extend/Inheritance:** Share a set of CSS properties from one selector to another (`@extend .message-shared;`).

### Code Example: SCSS Nesting and Variables
```scss
// _variables.scss
$font-stack: Helvetica, sans-serif;
$primary-color: #333;
$spacing-base: 1em;

// style.scss
@import 'variables';

body {
    font: 100% $font-stack;
    color: $primary-color;
    margin: 0;
    padding: $spacing-base;
}

.header {
    background-color: lighten($primary-color, 30%); // Sass functions!
    padding: $spacing-base * 1.5;

    h1 {
        color: white;
        margin-bottom: $spacing-base / 2;
    }

    nav {
        ul {
            margin: 0;
            padding: 0;
            list-style: none;
            li {
                display: inline-block;
                a {
                    display: block;
                    padding: 6px 12px;
                    text-decoration: none;
                    color: white;
                    &:hover {
                        text-decoration: underline;
                    }
                }
            }
        }
    }
}
```

### Checklist/Exercise
1.  Name two distinct benefits of using a CSS preprocessor like Sass in a large project.
2.  What is the purpose of "nesting" in SCSS, and how does it improve the organization of your stylesheets?
3.  How would you define a Sass variable for a border-radius value of `5px` and then apply it to a `.card` element?

### 2.6. Fundamental Web Accessibility (A11y)

Web accessibility (often abbreviated as A11y, referring to 11 letters between A and Y) is the practice of making websites usable by everyone, regardless of their abilities or disabilities, and the devices they use.

### Key Principles (WCAG - Web Content Accessibility Guidelines)
*   **Perceivable:** Information and UI components must be presentable to users in ways they can perceive.
*   **Operable:** UI components and navigation must be operable.
*   **Understandable:** Information and the operation of the user interface must be understandable.
*   **Robust:** Content must be robust enough that it can be interpreted reliably by a wide variety of user agents, including assistive technologies.

### Techniques for Accessibility
*   **Semantic HTML Structure:** The correct use of semantic HTML elements (e.g., `<header>`, `<footer>`, `<nav>`, `<main>`, `<article>`, `<h1>` to `<h6>`) naturally improves accessibility by providing meaningful structure to assistive technologies like screen readers.
*   **ARIA Attributes (Accessible Rich Internet Applications):** Provide additional semantic meaning where native HTML is insufficient (e.g., for custom widgets, dynamic content).
    *   `role`: Defines the purpose of an element (e.g., `role="button"`, `role="alert"`).
    *   `aria-label`: Provides a label for an element when no visible label exists.
    *   `aria-describedby`, `aria-labelledby`: Link an element to other elements that provide its description or label.
    *   `aria-expanded`, `aria-haspopup`, `aria-live`: Used for dynamic content and interactive components.
    *   **Rule of thumb:** "No ARIA is better than bad ARIA." Use native HTML elements with their inherent semantics first.
*   **Color Contrast:** Ensure sufficient contrast between text and background colors for readability. WCAG AA guidelines recommend a minimum contrast ratio of 4.5:1 for small text and 3:1 for large text. Use tools like WebAIM Color Contrast Checker.
*   **Keyboard Navigation:** All interactive elements (links, buttons, form controls) must be reachable and operable using only the keyboard (`Tab`, `Shift+Tab` for navigation, `Enter`/`Spacebar` for activation). Ensure visible focus indicators (`:focus` styles).
*   **Alternative Text for Images:** Provide meaningful `alt` attributes for `<img>` tags to describe the image content to users who cannot see it.
    *   `<img src="logo.png" alt="SkillBun company logo">`
    *   Empty `alt=""` for purely decorative images.

### Code Example: ARIA and Focus
```html
<button type="button" aria-label="Close dialog" class="close-button">
    &times; <!-- A times symbol -->
</button>

<div role="alert" aria-live="assertive" class="status-message">
    Item added to cart successfully!
</div>

<style>
    .close-button {
        /* Basic button styling */
        padding: 8px 12px;
        background-color: #dc3545;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }
    .close-button:focus {
        outline: 2px solid blue; /* Visible focus indicator */
        outline-offset: 2px;
    }
    .status-message {
        padding: 10px;
        margin-top: 10px;
        background-color: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
        border-radius: 4px;
    }
</style>
```

### Checklist/Exercise
1.  Why is using semantic HTML (e.g., `<button>` instead of `<div>` with a click handler) considered a fundamental accessibility practice?
2.  When would you use an `aria-label` attribute, and what problem does it solve?
3.  What is the recommended minimum contrast ratio for normal text according to WCAG AA guidelines, and why is this important?

### 2.7. Modern CSS Frameworks (Bootstrap/Material UI)

CSS frameworks are collections of pre-written CSS, JavaScript, and HTML components that accelerate web development. They provide ready-to-use styles for common UI elements and implement responsive design principles out-of-the-box.

### Core Concepts
*   **Component-based:** Provide pre-styled components like navigation bars, forms, cards, buttons, modals.
*   **Utility-first (often):** Many frameworks use utility classes (e.g., `text-center`, `m-auto`, `p-3`) for quick styling.
*   **Responsive Grids:** Built-in grid systems (Flexbox or Grid-based) for creating responsive layouts.

### Examples
*   **Bootstrap:** The most popular open-source CSS framework. It's comprehensive, mobile-first, and highly customizable. Uses utility classes extensively.
*   **Material-UI (MUI):** A React component library that implements Google's Material Design. Focuses on providing ready-to-use React components rather than just CSS classes.
*   **Tailwind CSS:** A utility-first CSS framework that provides low-level utility classes to build custom designs directly in your markup without writing custom CSS.

### Basic Usage (Bootstrap CDN)
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bootstrap Example</title>
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet"
          integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN" crossorigin="anonymous">
</head>
<body>
    <div class="container mt-5">
        <h1 class="mb-4">Welcome to My Bootstrap Page</h1>
        <button type="button" class="btn btn-primary me-2">Primary button</button>
        <button type="button" class="btn btn-secondary">Secondary button</button>

        <div class="alert alert-success mt-4" role="alert">
            A simple success alert—check it out!
        </div>

        <div class="row mt-5">
            <div class="col-md-4">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Card Title 1</h5>
                        <p class="card-text">Some quick example text.</p>
                        <a href="#" class="btn btn-info">Go somewhere</a>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Card Title 2</h5>
                        <p class="card-text">Some quick example text.</p>
                        <a href="#" class="btn btn-info">Go somewhere</a>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Card Title 3</h5>
                        <p class="card-text">Some quick example text.</p>
                        <a href="#" class="btn btn-info">Go somewhere</a>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Bootstrap JS (Popper.js and Bootstrap JS Bundle) -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"
            integrity="sha384-C6RzsynM9kWDrMNeT87bh95OGNyZPhcTNXj1NW7RuBCsyN/o0jlpcV8Qyq46cDfL"
            crossorigin="anonymous"></script>
</body>
</html>
```

### Checklist/Exercise
1.  Name two distinct advantages of using a CSS framework like Bootstrap in a web development project.
2.  How would you include Bootstrap's CSS and JavaScript in a basic HTML page using a Content Delivery Network (CDN)?
3.  Identify a common UI component (e.g., button, alert, card) that CSS frameworks typically provide pre-styled classes for.

### 2.8. Basic Animation Principles

Animations add visual motion to web elements, enhancing user experience by providing feedback, guiding attention, and making interfaces more engaging.

### Core Concepts
*   **Transitions:** Smoothly change property values over a specified duration when a state change occurs (e.g., on hover, focus, or class toggle).
*   **Transforms:** Apply 2D or 3D transformations to an element (e.g., moving, rotating, scaling, skewing) without affecting document flow.
*   **Keyframe Animations:** Define a sequence of animation styles (`@keyframes`) that elements can follow, allowing for more complex, multi-step animations.

### Key Properties
*   **`transition` Property:**
    *   `transition: [property] [duration] [timing-function] [delay];`
    *   `property`: The CSS property to transition (e.g., `background-color`, `transform`, `all`).
    *   `duration`: How long the transition takes (e.g., `0.3s`, `300ms`).
    *   `timing-function`: Speed curve of the transition (e.g., `ease`, `linear`, `ease-in`, `ease-out`, `ease-in-out`, `cubic-bezier()`).
    *   `delay`: When the transition starts.
*   **`transform` Property:**
    *   `translate(x, y)`: Moves an element.
    *   `rotate(angle)`: Rotates an element (e.g., `rotate(45deg)`).
    *   `scale(x, y)`: Resizes an element.
    *   `skew(x-angle, y-angle)`: Skews an element.
*   **`@keyframes` Rule and `animation` Property:**
    *   `@keyframes identifier { from { /* style */ } to { /* style */ } }` or `0% { /* style */ } 50% { /* style */ } 100% { /* style */ }`
    *   `animation: [name] [duration] [timing-function] [delay] [iteration-count] [direction] [fill-mode];`

### Code Example: Button Hover Transition
```css
.my-button {
    padding: 10px 20px;
    background-color: blue;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
    /* Define transitions for multiple properties */
    transition: background-color 0.3s ease-in-out, transform 0.3s ease-in-out;
}

.my-button:hover {
    background-color: darkblue;
    transform: translateY(-3px) scale(1.05); /* Lifts and slightly scales on hover */
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2); /* Adds a subtle shadow */
}
```
```html
<button class="my-button">Hover Me</button>
```

### Checklist/Exercise
1.  What is the primary difference between using the `transition` property and the `@keyframes` rule for animations?
2.  How would you make an element move 50 pixels to the right along the X-axis using the `transform` property?
3.  Write CSS to make a square `div` element smoothly change its `background-color` from `red` to `blue` over `0.5` seconds when hovered.