# Web Development Taste Test: Frontend Basics

Welcome to the exciting world of frontend web development! This module serves as your "taste test," introducing you to the fundamental technologies that power every website you interact with: HTML for structure, CSS for styling, and JavaScript for interactivity. By the end, you'll have a foundational understanding of how these three work together to create engaging user experiences, including principles of responsive design.

## 1. HTML: The Backbone of the Web

HTML (HyperText Markup Language) is the standard markup language for documents designed to be displayed in a web browser. It provides the structure of a web page using elements and tags. Think of HTML as the skeleton of your website.

### Core Concepts:
*   **Elements & Tags**: HTML documents are composed of HTML elements. Each element is represented by an opening tag, content, and a closing tag (e.g., `<p>This is a paragraph.</p>`). Some tags are self-closing (e.g., `<img />`).
*   **Attributes**: Tags can have attributes that provide additional information about the element (e.g., `<a href="https://example.com">Link</a>`).
*   **Document Structure**: Every HTML page typically includes `<!DOCTYPE html>`, `<html>`, `<head>`, and `<body>` tags.

### Simple HTML Example:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My First Web Page</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h1>Hello, Frontend World!</h1>
    <p id="greeting">This is a basic static web page built with HTML.</p>
    <button>Click Me</button>
    <script src="script.js"></script>
</body>
</html>
```

## 2. CSS: Styling Your Web Pages

CSS (Cascading Style Sheets) is used for describing the presentation of a document written in HTML. It dictates how HTML elements should be displayed, covering aspects like colors, fonts, layout, and more. CSS is what makes your website visually appealing.

### Core Concepts:
*   **Selectors**: Used to "select" the HTML elements you want to style (e.g., `p`, `.my-class`, `#my-id`).
*   **Properties & Values**: Styles are defined using `property: value;` pairs (e.g., `color: blue;`, `font-size: 16px;`).
*   **The Cascade**: Rules determine which styles apply when multiple rules target the same element.
*   **Linking CSS**:
    *   **Inline**: ` <p style="color: red;">` (generally discouraged for larger projects).
    *   **Internal**: `<style>` tag within the `<head>` of HTML.
    *   **External**: `<link>` tag pointing to an external `.css` file (most common and recommended).

### Simple CSS Example (from `style.css`):

```css
body {
    font-family: Arial, sans-serif;
    background-color: #f4f4f4;
    margin: 20px;
}

h1 {
    color: #333;
    text-align: center;
}

#greeting {
    color: #555;
    font-size: 18px;
    padding: 10px;
    border: 1px solid #ccc;
    background-color: #fff;
}

button {
    background-color: #007bff;
    color: white;
    padding: 10px 15px;
    border: none;
    cursor: pointer;
    font-size: 16px;
}

button:hover {
    background-color: #0056b3;
}
```

## 3. JavaScript: Adding Interactivity

JavaScript is a programming language that enables you to create dynamically updating content, control multimedia, animate images, and much more. It makes web pages interactive and responsive to user actions.

### Core Concepts:
*   **Variables**: Store data (`let`, `const`).
*   **Functions**: Reusable blocks of code.
*   **DOM Manipulation**: The Document Object Model (DOM) is a programming interface for web documents. It represents the page structure in a tree-like manner. JavaScript can access and change the content, structure, and style of HTML elements.
*   **Event Handling**: Responding to user actions (clicks, key presses, form submissions).

### Simple JavaScript Example (from `script.js`):

```javascript
// Select the paragraph and button elements
const greetingParagraph = document.getElementById('greeting');
const clickMeButton = document.querySelector('button');

// Add an event listener to the button
clickMeButton.addEventListener('click', () => {
    // Change the text content of the paragraph
    greetingParagraph.textContent = 'You clicked the button! JavaScript is working!';
    // Change its style
    greetingParagraph.style.color = 'green';
    greetingParagraph.style.fontWeight = 'bold';
});

console.log("JavaScript loaded and ready!");
```

## 4. Responsive Design Principles

Responsive Web Design (RWD) is an approach to web design that makes web pages render well on a variety of devices and window or screen sizes from minimum to maximum display size. It ensures your website looks good and functions correctly on desktops, tablets, and mobile phones.

### Key Principles:
*   **Fluid Grids**: Use relative units (percentages, `em`, `rem`, `vw`, `vh`) for layout instead of fixed pixel widths.
*   **Flexible Images and Media**: Ensure images and videos scale within their containing elements, often using `max-width: 100%; height: auto;`.
*   **Media Queries**: CSS rules that apply styles only when certain conditions are met (e.g., `max-width` of the viewport). This allows for device-specific styling.
*   **Mobile-First Approach**: Design and develop for the smallest screens first, then progressively enhance for larger screens.

### Example Media Query:

```css
/* Styles for screens smaller than 768px */
@media screen and (max-width: 768px) {
    body {
        margin: 10px;
    }
    h1 {
        font-size: 24px;
    }
    #greeting {
        font-size: 16px;
    }
}
```

---

### Quick Checklist / Exercise:

1.  **HTML Structure**: Create a new HTML file (`index.html`) with a heading (`<h1>`), a paragraph (`<p>`), and an image (`<img>`) element.
2.  **CSS Styling**: Link an external CSS file (`styles.css`) to your HTML. Add CSS rules to center the heading, change the paragraph's text color, and give the image a border.
3.  **JavaScript Interactivity**: Add a button to your `index.html`. Using an external JavaScript file (`script.js`), write code that changes the text content of your paragraph when the button is clicked.