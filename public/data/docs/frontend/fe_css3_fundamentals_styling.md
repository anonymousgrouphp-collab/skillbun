# CSS3: Styling & Core Concepts

CSS3 (Cascading Style Sheets Level 3) is the language used to style web pages. It defines how HTML elements are displayed on screen, paper, or in other media. Mastering CSS3 is crucial for any frontend developer to create visually appealing and responsive user interfaces.

## 1. CSS Selectors

CSS selectors are patterns used to select the HTML elements you want to style.

*   **Type Selector:** Selects all elements of a given HTML tag.
    ```css
    p {
        color: blue;
    }
    ```
*   **Class Selector:** Selects elements with a specific class attribute.
    ```html
    <div class="card">...</div>
    ```
    ```css
    .card {
        border: 1px solid #ccc;
    }
    ```
*   **ID Selector:** Selects a *single* element with a specific ID attribute (IDs must be unique per page).
    ```html
    <button id="submitBtn">Submit</button>
    ```
    ```css
    #submitBtn {
        background-color: green;
    }
    ```
*   **Universal Selector:** Selects all elements.
    ```css
    * {
        margin: 0;
        padding: 0;
    }
    ```
*   **Attribute Selector:** Selects elements with a specific attribute or attribute value.
    ```css
    input[type="text"] {
        border: 1px solid blue;
    }
    ```
*   **Pseudo-classes:** Selects elements based on their state (e.g., `:hover`, `:active`, `:first-child`).
    ```css
    a:hover {
        color: red;
    }
    ```
*   **Pseudo-elements:** Selects a part of an element (e.g., `::before`, `::after`, `::first-line`).
    ```css
    p::first-line {
        font-weight: bold;
    }
    ```
*   **Combinators:** Combine selectors to target elements based on their relationship.
    *   ` ` (Descendant Selector): `div p` (selects all `<p>` inside a `<div>`)
    *   `>` (Child Selector): `ul > li` (selects `<li>` directly inside a `<ul>`)
    *   `+` (Adjacent Sibling Selector): `h1 + p` (selects the `<p>` immediately following an `<h1>`)
    *   `~` (General Sibling Selector): `h1 ~ p` (selects all `<p>` preceded by an `<h1>`)

## 2. Specificity

Specificity is the algorithm CSS uses to determine which style declaration is most relevant to an element and thus should be applied. When multiple rules apply to the same element, the one with higher specificity wins.

*   **Inline Styles:** Highest specificity (e.g., `style="color: red;"` directly in HTML).
*   **IDs:** Second highest (1,0,0).
*   **Classes, Attributes, Pseudo-classes:** Medium specificity (0,1,0).
*   **Elements, Pseudo-elements:** Lowest specificity (0,0,1).
*   **Universal Selector (`*`)**: 0 specificity.
*   **`!important`**: Overrides *all* other specificity, but should be used sparingly as it makes CSS harder to maintain.

Example:
```css
/* Specificity: 0,0,1 */
p { color: blue; }

/* Specificity: 0,1,0 */
.text { color: green; }

/* Specificity: 1,0,0 */
#myParagraph { color: red; }
```
If an element has `id="myParagraph"` and `class="text"`, and is a `p` tag, its text will be `red` due to ID selector's higher specificity.

## 3. The Box Model

Every HTML element is considered a rectangular box. The CSS Box Model describes how elements are rendered and includes:

*   **Content:** The actual content of the element (text, images, video). Its dimensions are `width` and `height`.
*   **Padding:** The space between the content and the border. It's inside the box and takes the background color.
*   **Border:** The line that goes around the padding and and content.
*   **Margin:** The space outside the border, pushing other elements away. It is transparent.

```css
.box {
    width: 200px;
    height: 100px;
    padding: 20px;       /* 20px all around */
    border: 5px solid black;
    margin: 10px auto;   /* 10px top/bottom, auto left/right for centering */
}
```

**`box-sizing` property:**
*   **`content-box` (default):** `width` and `height` apply *only* to the content area. Padding and border add to the total width/height.
*   **`border-box`:** `width` and `height` include content, padding, and border. This makes layout calculations much easier.
    ```css
    * {
        box-sizing: border-box; /* Highly recommended for modern layouts */
    }
    ```

## 4. The Cascade

The "C" in CSS stands for Cascade. It defines how the browser resolves conflicting style declarations for an element. The cascade follows these rules:

1.  **Importance:** `!important` rules take precedence. (User `!important` > Author `!important` > Author > User > Browser default styles).
2.  **Origin:** Where the style comes from (Browser's default styles, User's custom styles, Author's styles from linked stylesheets/inline styles).
3.  **Specificity:** As explained above, a more specific selector wins.
4.  **Order:** If all other factors are equal, the last declared rule (further down the stylesheet or later in the `style` attribute) wins.

## 5. Inheritance

Some CSS properties are inherited by child elements from their parent elements, while others are not.

**Commonly inherited properties:**
*   `color`, `font-family`, `font-size`, `font-weight`, `line-height`, `text-align`, `list-style`, `cursor`.

**Properties NOT inherited (e.g.):**
*   `border`, `margin`, `padding`, `background`, `width`, `height`.

You can explicitly control inheritance:
*   `inherit`: Forces a property to inherit its parent's computed value.
*   `initial`: Resets a property to its initial (default) value.
*   `unset`: Behaves like `inherit` for inherited properties, and `initial` for non-inherited properties.

```html
<div style="color: blue;">
    This text is blue.
    <p>This paragraph also inherits blue color.</p>
    <span style="color: initial;">This span resets to default text color.</span>
</div>
```

## 6. CSS Units

CSS units define the size or dimension of an element or property. They fall into two main categories:

### Absolute Units

Always resolve to the same physical size, regardless of screen resolution or other factors.
*   `px` (pixels): The most common absolute unit. One pixel corresponds to one dot on the screen. Great for precise control, but less flexible for responsive design.

### Relative Units

Resolve to a size relative to something else (e.g., parent element's font size, root font size, or viewport size). Ideal for responsive design.
*   `em`: Relative to the `font-size` of the *parent* element. If not set, it inherits.
    ```css
    .parent { font-size: 16px; }
    .child { font-size: 1.5em; /* 1.5 * 16px = 24px */ }
    ```
*   `rem` (root em): Relative to the `font-size` of the *root* HTML element (`<html>`). This provides more predictable scaling.
    ```css
    html { font-size: 16px; }
    .header { font-size: 2rem; /* 2 * 16px = 32px */ }
    .paragraph { font-size: 1rem; /* 1 * 16px = 16px */ }
    ```
*   `vw` (viewport width): Relative to 1% of the viewport's width. `100vw` is the full width of the viewport.
*   `vh` (viewport height): Relative to 1% of the viewport's height. `100vh` is the full height of the viewport.
    ```css
    h1 { font-size: 5vw; /* Font size scales with viewport width */ }
    .full-screen { height: 100vh; }
    ```

## 7. Styling Properties

### Text Styling

*   `font-family`: Specifies the font (e.g., `"Arial", sans-serif`).
*   `font-size`: Controls the size of the text (e.g., `16px`, `1.2rem`).
*   `font-weight`: Sets the thickness of the characters (e.g., `normal`, `bold`, `400`, `700`).
*   `color`: Sets the foreground color of the text.
*   `text-align`: Aligns text (`left`, `right`, `center`, `justify`).
*   `line-height`: Sets the height of each line of text.
*   `letter-spacing`: Sets the space between characters.
*   `text-decoration`: Adds decoration to text (`underline`, `overline`, `line-through`, `none`).

### Colors & Backgrounds

**Colors:**
*   `color`: For text color.
*   `background-color`: For the background of an element.

Color values can be:
*   Named colors: `red`, `blue`, `hotpink`
*   Hexadecimal: `#FF0000` (red), `#336699`
*   RGB: `rgb(255, 0, 0)`
*   RGBA: `rgba(255, 0, 0, 0.5)` (Red with 50% opacity)
*   HSL: `hsl(0, 100%, 50%)`
*   HSLA: `hsla(0, 100%, 50%, 0.5)`

**Backgrounds:**
*   `background-image`: Specifies one or more background images (`url('image.jpg')`).
*   `background-repeat`: Controls if/how an image repeats (`no-repeat`, `repeat-x`, `repeat-y`, `repeat`).
*   `background-position`: Sets the starting position of a background image (`top center`, `20px 50%`).
*   `background-size`: Specifies the size of the background images (`auto`, `cover`, `contain`, `100% 100%`).
*   `background`: A shorthand property for all background properties.
    ```css
    .hero {
        background: url('hero.jpg') no-repeat center center / cover;
        color: white;
        padding: 50px;
    }
    ```

---

## Quick Understanding Checklist/Exercise

1.  Explain the difference between `em` and `rem` units, and when you might prefer to use `rem`.
2.  If you have a `div` with `width: 200px`, `padding: 20px`, and `border: 5px solid black`, what will its total rendered width be if `box-sizing: content-box`? What if it's `box-sizing: border-box`?
3.  Given the following HTML, what color will the text "Hello World" be, and why?
    ```html
    <style>
        .container { color: blue; }
        p { color: green; }
        #greeting { color: red; }
    </style>
    <div class="container">
        <p id="greeting">Hello World</p>
    </div>
    ```