# Web Development Prerequisites: HTML5, CSS3, and Modern JavaScript (ES6+)

This study guide reinforces the foundational knowledge of web development, essential for building robust enterprise web applications with Angular. We'll cover HTML5 for semantic structure, CSS3 for advanced styling and responsive design, and modern JavaScript (ES6+) for programming logic and modularity.

## 1. HTML5: Structuring Semantic Web Content

HTML5 is the latest evolution of HTML, focusing on providing more semantic meaning to web content, which improves accessibility and search engine optimization (SEO).

### Core Concepts:
*   **Semantic Elements**: Elements like `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<aside>`, and `<footer>` clearly define the role and content of different parts of a web page.
*   **New Form Input Types**: Input types such as `email`, `url`, `number`, `date`, `range`, and `search` provide better user experience and native validation.
*   **Multimedia Support**: Native `<audio>` and `<video>` tags allow embedding media without requiring third-party plugins.
*   **Canvas and SVG**: Provide APIs for drawing graphics and embedding scalable vector graphics directly within the browser.

### Example: Semantic Structure
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Semantic HTML5 Page</title>
</head>
<body>
    <header>
        <h1>My Awesome Website</h1>
        <nav>
            <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About</a></li>
            </ul>
        </nav>
    </header>
    <main>
        <section id="home">
            <h2>Welcome!</h2>
            <p>This is the main content area.</p>
        </section>
        <article>
            <h3>Latest Blog Post</h3>
            <p>Content of the blog post...</p>
        </article>
    </main>
    <footer>
        <p>&copy; 2024 My Website</p>
    </footer>
</body>
</html>
```

## 2. CSS3: Advanced Styling and Responsive Design

CSS3 extends CSS2 with powerful features for styling, animations, and responsive layouts, enabling more dynamic and visually appealing web pages.

### Core Concepts:
*   **Advanced Selectors**: Enhance targeting with attribute selectors (`[type="text"]`), pseudo-classes (`:nth-child`, `:hover`), and pseudo-elements (`::before`, `::after`).
*   **Box Model**: Understanding `content`, `padding`, `border`, and `margin` is fundamental. Using `box-sizing: border-box;` is crucial for predictable layout sizing.
*   **Flexbox**: A one-dimensional layout system for arranging items in rows or columns. Excellent for responsive navigation bars, forms, and component layouts.
*   **CSS Grid**: A two-dimensional layout system for arranging items into rows and columns simultaneously. Ideal for overall page layouts and complex structural designs.
*   **Responsive Design with Media Queries**: Using `@media screen and (max-width: 768px)` to apply different styles based on screen size, device orientation, or resolution, ensuring your site looks great on any device.
*   **Transitions and Animations**: Create smooth visual effects. `transition` for gradual property changes and `@keyframes` with `animation` for complex, time-based animations.
*   **Custom Properties (CSS Variables)**: Define reusable values like `--primary-color: #336699;` to improve maintainability and consistency across your stylesheets.

### Example: Flexbox and Media Query
```css
/* Basic styling */
body {
    font-family: sans-serif;
    margin: 0;
}

.container {
    display: flex; /* Enable Flexbox */
    flex-direction: column; /* Stack items vertically by default */
    gap: 20px;
    padding: 20px;
}

.item {
    background-color: lightblue;
    padding: 15px;
    border: 1px solid steelblue;
    text-align: center;
}

/* Media Query for larger screens */
@media screen and (min-width: 768px) {
    .container {
        flex-direction: row; /* Arrange items horizontally on larger screens */
        justify-content: space-around; /* Distribute space around items */
        flex-wrap: wrap; /* Allow items to wrap to the next line */
    }
    .item {
        flex: 1 1 30%; /* Allow items to grow, shrink, and have a base width */
        max-width: 30%; /* Ensure max width for responsiveness */
    }
}
```

## 3. Modern JavaScript (ES6+): Programming Logic and Modularity

ECMAScript 2015 (ES6) introduced significant enhancements that make JavaScript more powerful, readable, and suitable for large-scale applications. Subsequent yearly updates continue to add new features.

### Core Concepts:
*   **Variables (`let`, `const`)**: Block-scoped alternatives to `var`. `const` is for variables whose reference should not be reassigned, while `let` is for reassignable variables.
*   **Arrow Functions**: Provide a shorter syntax for writing functions and lexically bind `this`, making them useful in many contexts.
    ```javascript
    // Traditional function
    function add(a, b) {
        return a + b;
    }
    // Arrow function
    const addArrow = (a, b) => a + b;
    ```
*   **Template Literals**: Use backticks (`` ` ``) for easily creating multi-line strings and embedding expressions (`${expression}`) directly within string literals.
    ```javascript
    const name = "Alice";
    const greeting = `Hello, ${name}!
Welcome to our site.`;
    ```
*   **Destructuring Assignment**: A convenient way to extract values from arrays or properties from objects into distinct variables with concise syntax.
    ```javascript
    const person = { firstName: 'John', lastName: 'Doe' };
    const { firstName, lastName } = person; // firstName = 'John', lastName = 'Doe'

    const colors = ['red', 'green', 'blue'];
    const [primary, secondary] = colors; // primary = 'red', secondary = 'green'
    ```
*   **Spread and Rest Operators (`...`)**: 
    *   **Spread**: Expands an iterable (like an array or string) into individual elements, or properties from an object into a new object.
        ```javascript
        const arr1 = [1, 2];
        const arr2 = [...arr1, 3, 4]; // [1, 2, 3, 4]
        const obj1 = { a: 1 };
        const obj2 = { ...obj1, b: 2 }; // { a: 1, b: 2 }
        ```
    *   **Rest**: Gathers an indefinite number of arguments into an array.
        ```javascript
        function sumAll(...args) {
            return args.reduce((acc, curr) => acc + curr, 0);
        }
        sumAll(1, 2, 3, 4); // 10
        ```
*   **Classes**: Provide a clearer and more familiar syntax for creating objects and dealing with inheritance, building upon JavaScript's prototype-based inheritance model.
    ```javascript
    class Person {
        constructor(name) {
            this.name = name;
        }
        greet() {
            console.log(`Hello, my name is ${this.name}`);
        }
    }
    const john = new Person('John');
    john.greet(); // Hello, my name is John
    ```
*   **Modules (`import`/`export`)**: Native support for organizing JavaScript code into separate files (modules), allowing code splitting, reuse, and better maintainability.
    ```javascript
    // utils.js
    export const PI = 3.14;
    export function multiply(a, b) {
        return a * b;
    }

    // main.js
    import { PI, multiply } from './utils.js';
    console.log(multiply(PI, 2));
    ```
*   **Asynchronous JavaScript (`Promises`, `Async/Await`)**: These features simplify working with asynchronous operations (like fetching data from an API).
    *   **Promises**: Objects representing the eventual completion or failure of an asynchronous operation, providing a cleaner way to handle callbacks.
        ```javascript
        fetch('https://api.example.com/data')
            .then(response => response.json())
            .then(data => console.log(data))
            .catch(error => console.error('Error:', error));
        ```
    *   **Async/Await**: Syntactic sugar built on top of Promises, making asynchronous code look and behave more like synchronous code, improving readability and error handling.
        ```javascript
        async function fetchData() {
            try {
                const response = await fetch('https://api.example.com/data');
                const data = await response.json();
                console.log(data);
            } catch (error) {
                console.error('Error:', error);
            }
        }
        fetchData();
        ```

### Quick Checklist/Exercise:
1.  **HTML5**: What is the primary benefit of using semantic HTML5 elements like `<article>` and `<aside>`? Provide a short example of their typical usage.
2.  **CSS3**: Explain the difference between `display: flex` and `display: grid`. When would you choose one over the other for a web layout?
3.  **JavaScript (ES6+)**: Write a short JavaScript snippet using `const`, an arrow function, and template literals to greet a user with their full name (e.g., "Hello, John Doe!").