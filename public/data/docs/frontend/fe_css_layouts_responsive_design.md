# CSS Layouts & Responsive Design

This study guide will equip you with the essential skills to create robust and adaptable web layouts. We'll dive into modern CSS layout techniques like Flexbox and CSS Grid, and explore how to implement responsive design principles to ensure your websites look great on any device.

## 1. CSS Flexbox (Flexible Box Layout)

Flexbox is a one-dimensional layout system that allows you to design a flexible and efficient way to arrange items within a container along a single axis (either row or column). It's perfect for distributing space among items and aligning them.

### Core Concepts:
-   **Flex Container**: The parent element with `display: flex;` or `display: inline-flex;`.
-   **Flex Items**: The direct children of the flex container.

### Key Properties:

#### For the Flex Container:
-   `display: flex;`: Initializes a flex container.
-   `flex-direction`: Defines the main axis (`row`, `row-reverse`, `column`, `column-reverse`).
-   `justify-content`: Aligns items along the main axis (`flex-start`, `flex-end`, `center`, `space-between`, `space-around`, `space-evenly`).
-   `align-items`: Aligns items along the cross axis (`flex-start`, `flex-end`, `center`, `baseline`, `stretch`).
-   `flex-wrap`: Controls whether flex items are forced onto one line or can wrap onto multiple lines (`nowrap`, `wrap`, `wrap-reverse`).

#### For the Flex Items:
-   `flex-grow`: Defines the ability for a flex item to grow if necessary.
-   `flex-shrink`: Defines the ability for a flex item to shrink if necessary.
-   `flex-basis`: Defines the default size of an element before the remaining space is distributed.
-   `flex`: Shorthand for `flex-grow`, `flex-shrink`, and `flex-basis`.

### Example: Basic Flex Container

```html
<div class="flex-container">
  <div class="item">1</div>
  <div class="item">2</div>
  <div class="item">3</div>
</div>
```

```css
.flex-container {
  display: flex;
  justify-content: space-around; /* Distribute items with space around */
  align-items: center; /* Vertically center items */
  height: 100px;
  background-color: #eee;
  border: 1px solid #ccc;
}
.item {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  margin: 5px;
}
```

## 2. CSS Grid Layout

CSS Grid is a two-dimensional layout system that allows you to arrange elements into columns and rows. It's ideal for creating complex, structured page layouts.

### Core Concepts:
-   **Grid Container**: The parent element with `display: grid;` or `display: inline-grid;`.
-   **Grid Items**: The direct children of the grid container.
-   **Grid Lines**: The dividing lines between columns and rows.
-   **Grid Tracks**: The space between two grid lines (columns or rows).
-   **Grid Cells**: The smallest unit of a grid, like a table cell.
-   **Grid Areas**: Named areas that span multiple cells.

### Key Properties:

#### For the Grid Container:
-   `display: grid;`: Initializes a grid container.
-   `grid-template-columns`: Defines the number and width of columns (e.g., `1fr 2fr 1fr`, `repeat(3, 1fr)`, `auto auto 100px`). `fr` unit represents a fraction of the available space.
-   `grid-template-rows`: Defines the number and height of rows.
-   `gap`: Shorthand for `row-gap` and `column-gap` (space between grid tracks).
-   `justify-items`: Aligns grid items along the row axis within their cells.
-   `align-items`: Aligns grid items along the column axis within their cells.
-   `grid-template-areas`: Defines a grid layout by referencing the names of the grid areas.

#### For the Grid Items:
-   `grid-column`: Defines the starting and ending column lines for an item (`start / end` or `span X`).
-   `grid-row`: Defines the starting and ending row lines for an item.
-   `grid-area`: Assigns a name to a grid item so it can be referenced by `grid-template-areas`.

### Example: Basic Grid Layout

```html
<div class="grid-container">
  <div class="header">Header</div>
  <div class="sidebar">Sidebar</div>
  <div class="main">Main Content</div>
  <div class="footer">Footer</div>
</div>
```

```css
.grid-container {
  display: grid;
  grid-template-columns: 1fr 3fr; /* One sidebar, three content units */
  grid-template-rows: auto 1fr auto; /* Header, main content, footer */
  gap: 10px;
  height: 300px;
  background-color: #eee;
  border: 1px solid #ccc;
}
.header { grid-column: 1 / -1; background-color: #ff9800; padding: 10px; } /* Spans all columns */
.sidebar { background-color: #4caf50; padding: 10px; }
.main { background-color: #2196f3; padding: 10px; }
.footer { grid-column: 1 / -1; background-color: #607d8b; padding: 10px; } /* Spans all columns */
div[class$="-container"] > div { color: white; display: flex; align-items: center; justify-content: center; }
```

## 3. Responsive Design

Responsive design ensures that web pages render well on a variety of devices and window or screen sizes, from minimal to maximal display.

### 3.1. Media Queries

Media queries allow you to apply CSS styles only when certain conditions are met, such as screen width, height, or orientation. This is the cornerstone of responsive design.

### Syntax:
```css
@media screen and (min-width: 768px) {
  /* Styles applied when screen width is 768px or wider */
  .container {
    width: 90%;
  }
}

@media screen and (max-width: 600px) {
  /* Styles applied when screen width is 600px or narrower */
  nav ul li {
    display: block;
  }
}
```
**Common Breakpoints:**
-   Small devices (phones): `max-width: 576px`
-   Medium devices (tablets): `min-width: 576px` and `max-width: 768px`
-   Large devices (desktops): `min-width: 768px` and `max-width: 992px`
-   Extra large devices (large desktops): `min-width: 1200px`

### 3.2. Viewport Units

Viewport units (`vw`, `vh`, `vmin`, `vmax`) are relative units that are based on the size of the viewport (the browser window). They are excellent for creating fluid typography and elements that scale proportionally with the screen size.

-   `1vw`: 1% of the viewport width.
-   `1vh`: 1% of the viewport height.
-   `1vmin`: 1% of the smaller dimension (width or height).
-   `1vmax`: 1% of the larger dimension (width or height).

### Example: Fluid Typography

```css
body {
  font-size: 16px; /* Default font size */
}

h1 {
  font-size: 5vw; /* Heading size scales with viewport width */
}

@media screen and (min-width: 768px) {
  h1 {
    font-size: 3em; /* Use em for larger screens */
  }
}
```

### 3.3. Fluid Images

Fluid images scale automatically to fit their containing elements, preventing overflow on smaller screens.

### Implementation:
```css
img {
  max-width: 100%; /* Ensures image doesn't exceed its container's width */
  height: auto;    /* Maintains aspect ratio */
  display: block;  /* Removes extra space below image */
}
```

## 4. Mobile-First Approach

A best practice in responsive design is the mobile-first approach. This involves designing and developing for the smallest screen sizes first, then progressively enhancing the layout for larger screens using `min-width` media queries. This ensures a solid base experience for all users and optimized performance for mobile devices.

---

## Quick Checklist/Exercise:

1.  **Flexbox Task**: Create a horizontal navigation bar where items are evenly spaced, and on hover, the text color changes.
2.  **CSS Grid Task**: Design a simple 3-column photo gallery layout using CSS Grid. Make sure the photos have a `gap` of `15px` between them.
3.  **Responsive Challenge**: Take your 3-column photo gallery. Using media queries, make it a 1-column layout on screens smaller than `600px` wide.
