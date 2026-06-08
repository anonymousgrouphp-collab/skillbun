# JavaScript/TypeScript Fundamentals Study Guide

Mastering JavaScript and TypeScript fundamentals is paramount for any aspiring backend developer working with the Node.js ecosystem. This guide will solidify your understanding of modern JavaScript features, asynchronous programming, the Node.js runtime, type-safe code with TypeScript, and efficient package management.

## 1. Modern JavaScript (ES6+ Features)

ECMAScript 2015 (ES6) introduced significant enhancements to JavaScript, making it more powerful and developer-friendly. Familiarity with these features is crucial for writing clean, modern code.

*   **`let` and `const`**: Block-scoped variable declarations, replacing `var`. `const` is for immutable references.
*   **Arrow Functions (`=>`)**: Shorter syntax for functions, lexical `this` binding.
    ```javascript
    // Traditional function
    function add(a, b) {
        return a + b;
    }
    // Arrow function
    const addArrow = (a, b) => a + b;
    ```
*   **Template Literals (`` ` ``):** Embed expressions within strings using backticks.
    ```javascript
    const name = "Alice";
    console.log(`Hello, ${name}!`); // Hello, Alice!
    ```
*   **Destructuring (Array & Object)**: Extract values from arrays or properties from objects into distinct variables.
    ```javascript
    const person = { firstName: "John", lastName: "Doe" };
    const { firstName, lastName } = person; // John, Doe
    const colors = ["red", "blue"];
    const [primary, secondary] = colors; // red, blue
    ```
*   **Spread/Rest Operators (`...`)**: 
    *   **Spread**: Expands iterables (arrays, strings, objects) into individual elements.
        ```javascript
        const arr1 = [1, 2];
        const arr2 = [...arr1, 3, 4]; // [1, 2, 3, 4]
        ```
    *   **Rest**: Collects remaining elements into an array.
        ```javascript
        function sumAll(...numbers) {
            return numbers.reduce((acc, num) => acc + num, 0);
        }
        sumAll(1, 2, 3); // 6
        ```
*   **Classes**: Syntactic sugar for constructor functions, providing a more traditional object-oriented syntax.
*   **Modules (`import`/`export`)**: Standardized way to organize code into reusable modules.
    ```javascript
    // myModule.js
    export const PI = 3.14;
    export function multiply(a, b) { return a * b; }

    // main.js
    import { PI, multiply } from './myModule.js';
    console.log(multiply(PI, 2));
    ```

## 2. Asynchronous JavaScript

Backend applications are inherently asynchronous, dealing with database queries, API calls, and file I/O. Understanding how JavaScript handles asynchronicity is vital.

*   **Callbacks**: Functions passed as arguments to other functions, to be executed later. While fundamental, excessive nesting leads to "callback hell."
*   **Promises**: An object representing the eventual completion (or failure) of an asynchronous operation and its resulting value.
    *   **States**: `pending`, `fulfilled` (resolved), `rejected`.
    *   Methods: `.then()` for handling fulfillment, `.catch()` for handling rejection, `.finally()` for code that runs regardless of the outcome.
*   **Async/Await**: Syntactic sugar built on top of Promises, allowing asynchronous code to be written in a synchronous-like style, making it more readable and easier to debug. An `async` function implicitly returns a Promise, and `await` pauses execution until a Promise settles.

    ```javascript
    async function fetchData(url) {
        try {
            const response = await fetch(url); // await the fetch call
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json(); // await the JSON parsing
            console.log(data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }
    // Example usage (assuming fetch is available in environment like browser/Node.js with node-fetch)
    // fetchData('https://api.example.com/data');
    ```

## 3. The JavaScript Event Loop

The Event Loop is a crucial concept for understanding how JavaScript (especially in Node.js) handles concurrency with a single-threaded execution model.

*   **Components**:
    *   **Call Stack**: Executes synchronous code.
    *   **Web APIs (Browser) / Node.js C++ APIs**: Handles asynchronous tasks (e.g., `setTimeout`, network requests, file system operations).
    *   **Callback Queue (Task Queue)**: Stores callbacks of completed asynchronous tasks.
    *   **Event Loop**: Continuously monitors the Call Stack and the Callback Queue. If the Call Stack is empty, it pushes the first function from the Callback Queue onto the Call Stack for execution.
*   **Significance**: Ensures non-blocking I/O operations, allowing JavaScript to perform multiple operations without waiting for one to complete before starting another.

## 4. Node.js Runtime

Node.js is an open-source, cross-platform JavaScript runtime environment that allows you to execute JavaScript code outside a web browser.

*   **V8 Engine**: Built on Chrome's V8 JavaScript engine, which compiles JavaScript into native machine code.
*   **Event-Driven Architecture**: Uses the Event Loop to handle concurrent connections efficiently, making it suitable for scalable network applications.
*   **Non-blocking I/O**: Almost all I/O operations in Node.js are non-blocking, meaning the application doesn't wait for data to be read or written. This allows it to handle many concurrent requests.
*   **Use Cases**: Building backend APIs (REST, GraphQL), microservices, real-time applications (websockets), command-line tools.

## 5. TypeScript for Type-Safe Code

TypeScript is a typed superset of JavaScript that compiles to plain JavaScript. It brings static type-checking to JavaScript applications, significantly enhancing code quality and developer experience.

*   **Benefits**:
    *   **Type Safety**: Catches errors at compile-time instead of runtime.
    *   **Improved Tooling**: Better autocompletion, refactoring, and navigation in IDEs.
    *   **Readability & Maintainability**: Explicit types make code easier to understand and manage.
    *   **Scalability**: Easier to build and maintain large-scale applications.
*   **Basic Types**:
    *   `string`, `number`, `boolean`: Primitives.
    *   `any`: Opt-out of type-checking for a variable.
    *   `void`: For functions that don't return a value.
    *   `null`, `undefined`.
    *   `Array`: `number[]` or `Array<number>`.
    *   `Tuple`: `[string, number]`.
    *   `Enum`: A set of named constants.
*   **Interfaces & Types**: Define custom shapes for objects.
    ```typescript
    interface User {
        id: number;
        name: string;
        email?: string; // Optional property
    }

    type UserRole = "admin" | "editor" | "viewer"; // Union type

    function greetUser(user: User, role: UserRole): string {
        return `Hello, ${user.name}! Your role is ${role}.`;
    }

    const newUser: User = { id: 1, name: "Alice" };
    console.log(greetUser(newUser, "admin"));
    ```

## 6. Package Management with npm/yarn

Node.js relies heavily on external packages. `npm` (Node Package Manager) and `yarn` are popular package managers for installing, managing, and sharing code modules.

*   **`package.json`**: The heart of a Node.js project. It describes the project, lists its dependencies (`dependencies` and `devDependencies`), and defines scripts.
*   **Common Commands**:
    *   `npm init` / `yarn init`: Initializes a new `package.json` file.
    *   `npm install` / `yarn install`: Installs all dependencies listed in `package.json`.
    *   `npm install <package>` / `yarn add <package>`: Installs a specific package.
    *   `npm install -D <package>` / `yarn add -D <package>`: Installs a package as a dev dependency.
    *   `npm uninstall <package>` / `yarn remove <package>`: Uninstalls a package.
    *   `npm run <script>` / `yarn <script>`: Executes a script defined in `package.json`.
*   **Difference**: While `npm` and `yarn` serve the same purpose, `yarn` was initially created by Facebook to address performance and security concerns with `npm` (v3-v4). Modern `npm` (v5+) has largely caught up, making both excellent choices.

---

### Quick Check-in / Exercises

1.  **ES6 Feature**: Write a function using an arrow function that takes an array of numbers and returns a new array with each number doubled. Use `const` for the function declaration.
2.  **Asynchronous Practice**: Briefly explain the difference between `Promise.then().catch()` and `async/await` when handling asynchronous operations, and when you might prefer one over the other.
3.  **TypeScript Challenge**: Define a TypeScript interface for a `Product` with `id` (number), `name` (string), `price` (number), and an optional `description` (string). Then, create a variable of type `Product`.
