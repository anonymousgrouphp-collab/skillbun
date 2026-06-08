# JavaScript Fundamentals & Modern ESNext Study Guide

This guide provides a deep dive into JavaScript, from its core fundamentals to modern ESNext features, asynchronous programming, error handling, and robust DOM manipulation.

## 1. Introduction to JavaScript

JavaScript is a high-level, interpreted scripting language primarily used for creating interactive web pages. It's an essential technology alongside HTML and CSS for web development. Beyond browsers, JavaScript runs on servers (Node.js), mobile devices (React Native), and desktop applications (Electron).

*   **What is JavaScript?** A versatile programming language for web and beyond.
*   **JavaScript in the browser vs. Node.js:** Browser JS interacts with the DOM; Node.js is a runtime environment for server-side execution.
*   **Setting up your development environment:** Browser developer console (F12) for quick tests, and Visual Studio Code with Node.js for projects.

```javascript
// Simple example in browser console or script.js
console.log("Hello, SkillBun JavaScript Journey!");
```

**Exercise:**
1.  Open your browser's developer console (F12) and execute `console.log("My first JS line!");`.
2.  Create an `index.html` file and link an external `script.js` file to it.
3.  Confirm `script.js` is running by logging a message from it to the console.

## 2. Fundamentals: Variables, Data Types, Operators, and Control Flow

### 2.1. Variables
Variables are containers for storing data values. JavaScript has three keywords for declaring variables: `var`, `let`, and `const`.

*   **`var`**: Function-scoped, can be re-declared and re-assigned. Has hoisting issues (variable declarations are moved to the top of their scope).
*   **`let`**: Block-scoped, cannot be re-declared in the same scope, but can be re-assigned. Preferred for variables that need to change.
*   **`const`**: Block-scoped, cannot be re-declared or re-assigned. Preferred for variables whose values should not change. *Note: For objects/arrays declared with `const`, their content can still be modified, but the variable itself cannot be re-assigned to a new object/array.*

```javascript
var oldVariable = "Hello";
let mutableValue = 10;
const fixedValue = "Constant String";

mutableValue = 20; // OK
// fixedValue = "New String"; // Error: Assignment to constant variable.
```

**Exercise:**
1.  Declare a `const` variable `courseName` and assign "JavaScript Fundamentals" to it.
2.  Declare a `let` variable `progressPercentage` with an initial value of `0`, then reassign it to `50`.
3.  Briefly explain why `let` and `const` are generally preferred over `var` in modern JavaScript development.

### 2.2. Data Types
JavaScript values are categorized into primitive and non-primitive (object) types.

*   **Primitive Data Types:**
    *   `string`: Textual data (e.g., `"SkillBun"`, `'JS'`).
    *   `number`: Integer or floating-point numbers (e.g., `10`, `3.14`).
    *   `boolean`: `true` or `false`.
    *   `null`: Intentional absence of any object value. It's a primitive type, but `typeof null` returns `"object"` (a historical bug).
    *   `undefined`: A variable that has been declared but not assigned a value.
    *   `symbol` (ES6): Unique and immutable values, often used as object property keys.
    *   `bigint` (ES2020): For numbers larger than `2^53 - 1`.
*   **Non-Primitive Data Type:**
    *   `object`: Complex data structures like arrays, functions, and plain objects. They are stored by reference.

```javascript
let userName = "Alice";          // string
let userAge = 25;                // number
let isAuthenticated = true;      // boolean
let emptyValue = null;           // null
let notAssigned;                 // undefined

const person = { name: "Bob", age: 30 }; // object
const numbers = [1, 2, 3];              // object (array)
```

**Exercise:**
1.  What will `console.log(typeof null)` output, and why is this often considered a quirk in JavaScript?
2.  Create an array `colors = ["red", "green", "blue"]` and an object `product = { name: "Laptop", price: 1200 }`. Explain why both are considered non-primitive types.
3.  Describe the key conceptual difference between `null` and `undefined`.

### 2.3. Operators
Operators perform operations on values and variables.

*   **Arithmetic:** `+`, `-`, `*`, `/`, `%` (modulus), `**` (exponentiation).
*   **Assignment:** `=`, `+=`, `-=`, `*=` etc.
*   **Comparison:** `==` (loose equality), `===` (strict equality), `!=`, `!==`, `>`, `<`, `>=`, `<=`. `===` is generally preferred to avoid type coercion issues.
*   **Logical:** `&&` (AND), `||` (OR), `!` (NOT).
*   **Ternary (Conditional):** `condition ? exprIfTrue : exprIfFalse`.

```javascript
let x = 10, y = 5;
console.log(x + y);    // 15
console.log(x === "10"); // false (strict equality)
console.log(x == "10");  // true (loose equality - type coercion)
console.log(x > y && y !== 0); // true
let status = (x > 0) ? "Positive" : "Non-Positive"; // "Positive"
```

**Exercise:**
1.  Explain the crucial difference between `==` and `===` operators. Provide an example where they produce different results.
2.  Evaluate the following expression: `!(true && false) || (5 > 3)`.
3.  Use the ternary operator to assign the string "Even" or "Odd" to a variable `parity` based on whether a number `num` is even or odd.

### 2.4. Control Flow
Control flow statements dictate the order in which instructions are executed.

*   **`if...else if...else`**: Executes different blocks of code based on conditions.
*   **`switch`**: Evaluates an expression and executes code blocks based on matching `case` values.
*   **Loops:**
    *   `for`: Repeats a block of code a specified number of times.
    *   `while`: Repeats a block of code as long as a condition is true.
    *   `do...while`: Similar to `while`, but guarantees execution at least once.
    *   `for...in`: Iterates over enumerable properties of an object (keys).
    *   `for...of` (ES6): Iterates over iterable objects (like arrays, strings, maps, sets) to get values.

```javascript
let score = 85;
if (score >= 90) {
    console.log("Grade A");
} else if (score >= 80) {
    console.log("Grade B");
} else {
    console.log("Grade C");
}

for (let i = 0; i < 3; i++) {
    console.log(`Loop iteration ${i}`);
}

const fruits = ["apple", "banana"];
for (const fruit of fruits) {
    console.log(fruit); // apple, banana
}
```

**Exercise:**
1.  Write a `for` loop that prints numbers from 1 to 5, then uses `continue` to skip printing the number 3.
2.  Use a `switch` statement to print the name of the day corresponding to a number `dayOfWeek` (1 for Monday, 2 for Tuesday, etc.).
3.  When would you choose `for...of` over `for...in` when working with arrays?

## 3. Functions, Objects, and Arrays

### 3.1. Functions
Functions are blocks of code designed to perform a particular task. They promote reusability and modularity.

*   **Function Declaration:** `function myFunction(params) { ... }`
*   **Function Expression:** `const myFunction = function(params) { ... };`
*   **Arrow Functions (ES6+):** `const myFunction = (params) => { ... };` (concise, lexical `this` binding).
*   **Parameters and Arguments:** Placeholders for values a function expects vs. actual values passed.
*   **Return Values:** Functions can return data using the `return` keyword.
*   **Scope:** Determines the accessibility of variables (global, function/local, block).

```javascript
function addNumbers(a, b) { // Function Declaration
    return a + b;
}

const multiply = (x, y) => x * y; // Arrow Function (concise body)

console.log(addNumbers(5, 3));   // 8
console.log(multiply(4, 2));     // 8
```

**Exercise:**
1.  Write a function `calculateArea` that takes `width` and `height` as parameters and returns the area of a rectangle.
2.  Convert the `calculateArea` function into an arrow function expression.
3.  Explain what "lexical `this` binding" means in the context of arrow functions, especially compared to traditional function expressions.

### 3.2. Objects
Objects are collections of key-value pairs (properties and methods). They are fundamental to JavaScript and represent real-world entities.

*   **Creating Objects:** Most commonly using object literal syntax `{}`.
*   **Accessing Properties:** Dot notation (`object.property`) or bracket notation (`object['property']`).
*   **Adding/Deleting Properties:** Assign a value to a new key to add; use `delete object.property` to remove.
*   **Methods:** Functions stored as object properties.

```javascript
const car = {
    make: "Toyota",
    model: "Camry",
    year: 2020,
    start: function() {
        console.log(`${this.make} ${this.model} is starting...`);
    },
    "fuel type": "petrol" // Property with spaces needs bracket notation
};

console.log(car.make);          // "Toyota"
car.color = "blue";             // Add a new property
car.start();                    // Call a method
console.log(car["fuel type"]); // Access using bracket notation
```

**Exercise:**
1.  Create an object `person` with properties `firstName`, `lastName`, and `age`. Add a method `getFullName` that returns the full name.
2.  Access the `age` property using both dot and bracket notation.
3.  How would you add a new property `email` to the `person` object and then delete the `age` property?

### 3.3. Arrays
Arrays are ordered lists of values (elements). They are special types of objects.

*   **Creating Arrays:** `[]` literal syntax or `new Array()`.
*   **Accessing/Modifying Elements:** Using zero-based index `array[index]`.
*   **Common Array Methods:**
    *   `push()`: Adds element(s) to the end.
    *   `pop()`: Removes and returns the last element.
    *   `shift()`: Removes and returns the first element.
    *   `unshift()`: Adds element(s) to the beginning.
    *   `splice(start, deleteCount, item1, ...)`: Changes the contents of an array by removing or replacing existing elements and/or adding new elements in place.
    *   `slice(start, end)`: Returns a shallow copy of a portion of an array into a new array.
    *   `concat()`: Merges two or more arrays.

```javascript
const shoppingList = ["milk", "eggs", "bread"];
console.log(shoppingList[0]);   // "milk"
shoppingList.push("cheese");    // ["milk", "eggs", "bread", "cheese"]
shoppingList.shift();           // ["eggs", "bread", "cheese"]

const subList = shoppingList.slice(0, 2); // ["eggs", "bread"]
shoppingList.splice(1, 1, "butter"); // Replaces "bread" with "butter"
```

**Exercise:**
1.  Create an array `numbers = [10, 20, 30]`. Add `5` to the beginning and `40` to the end of the array.
2.  Remove the element at index 1 from the `numbers` array without leaving a gap.
3.  Explain the key difference in behavior between `splice()` and `slice()` in terms of modifying the original array.

## 4. Modern ES6+ Features

### 4.1. Destructuring Assignment
Allows you to unpack values from arrays or properties from objects into distinct variables.

*   **Array Destructuring:**
*   **Object Destructuring:**

```javascript
const [a, b] = [1, 2]; // Array destructuring
console.log(a, b);     // 1 2

const user = { name: "Jane", age: 28, city: "NYC" };
const { name, age } = user; // Object destructuring
console.log(name, age);     // Jane 28

const { city, country = "USA" } = user; // With default value
console.log(city, country); // NYC USA
```

**Exercise:**
1.  Destructure an array `data = ["apple", "banana", "cherry", "date"]` to extract the first, third, and fourth elements into variables `fruit1`, `fruit3`, and `fruit4`.
2.  Given an object `product = { id: 101, itemName: "Book", price: 25.99 }`, destructure it to get `itemName` and `price`. Rename `itemName` to `title` during destructuring.
3.  Explain how you would use destructuring to swap the values of two variables `x` and `y` without a temporary variable.

### 4.2. Spread and Rest Operators (`...`)
Both use the three dots (`...`) but serve different purposes based on context.

*   **Spread Operator:** Expands an iterable (like an array or string) into individual elements.
    *   Used for copying arrays/objects, combining arrays/objects, passing arguments to functions.
*   **Rest Parameters:** Gathers an arbitrary number of arguments into an array.
    *   Must be the last parameter in a function definition.

```javascript
// Spread for arrays
const arr1 = [1, 2];
const arr2 = [...arr1, 3, 4]; // [1, 2, 3, 4]

// Spread for objects (shallow copy/merge)
const obj1 = { a: 1, b: 2 };
const obj2 = { ...obj1, c: 3 }; // { a: 1, b: 2, c: 3 }

// Rest parameters
function sumAll(...numbers) { // numbers will be an array [1, 2, 3]
    return numbers.reduce((acc, num) => acc + num, 0);
}
console.log(sumAll(1, 2, 3)); // 6
```

**Exercise:**
1.  Combine two arrays `arrA = ["A", "B"]` and `arrB = ["C", "D"]` into a new single array `arrC` using the spread operator.
2.  Create a function `getMin` that accepts any number of numeric arguments and returns the smallest one using the rest operator and `Math.min`.
3.  How can you use the spread operator to create a *shallow copy* of an object?

### 4.3. Template Literals
Also known as template strings, they provide an easier way to create multi-line strings and perform string interpolation.

*   Enclosed by backticks (`` ` ``).
*   Support multi-line strings without `\n`.
*   Support embedded expressions (`${expression}`) for dynamic values.

```javascript
const product = "Keyboard";
const price = 75;

const description = `The ${product} is priced at $${price}.
It's a great deal!`;

console.log(description);
// Output:
// The Keyboard is priced at $75.
// It's a great deal!
```

**Exercise:**
1.  Create a multi-line string that displays your favorite quote and its author, using template literals.
2.  Given variables `firstName = "John"` and `lastName = "Doe"`, use a template literal to construct the string "His full name is John Doe."
3.  Briefly explain what a "tagged template literal" is and one potential use case.

### 4.4. Classes
ES6 introduced classes as syntactic sugar over JavaScript's existing prototype-based inheritance. They provide a clearer and cleaner way to create objects and deal with inheritance.

*   **`class` keyword:** Defines a class.
*   **`constructor` method:** A special method for creating and initializing an object created with a class.
*   **`extends` keyword:** Used to create a subclass (inheritance).
*   **`super()` method:** Calls the parent class's constructor.

```javascript
class Person {
    constructor(name, age) {
        this.name = name;
        this.age = age;
    }
    greet() {
        console.log(`Hello, my name is ${this.name} and I am ${this.age} years old.`);
    }
}

class Student extends Person {
    constructor(name, age, studentId) {
        super(name, age); // Call parent constructor
        this.studentId = studentId;
    }
    study() {
        console.log(`${this.name} (ID: ${this.studentId}) is studying.`);
    }
}

const alice = new Person("Alice", 30);
alice.greet(); // Hello, my name is Alice and I am 30 years old.

const bob = new Student("Bob", 20, "S123");
bob.greet();   // Hello, my name is Bob and I am 20 years old.
bob.study();   // Bob (ID: S123) is studying.
```

**Exercise:**
1.  Create a `Vehicle` class with properties `make` and `model`, and a method `drive` that logs "[make] [model] is driving."
2.  Create a `Car` class that `extends Vehicle` and adds a `numDoors` property. Override the `drive` method to log "[make] [model] (with [numDoors] doors) is driving."
3.  Explain the primary purpose of the `super()` call within the constructor of a subclass.

### 4.5. Modules (ESM)
Modules allow you to break your code into separate files, making it more organized and reusable. `import` and `export` statements are used for this.

*   **`export`**: Used to expose functions, objects, or primitive values from a module.
    *   **Named Exports:** `export const myVar = ...;`, `export function myFunction() { ... }`
    *   **Default Exports:** `export default myValue;` (only one default export per module)
*   **`import`**: Used to bring exported members into another module.

```javascript
// utils.js
export const PI = 3.14159;
export function add(a, b) {
    return a + b;
}
export default function subtract(a, b) {
    return a - b;
}

// main.js
import { PI, add } from './utils.js';        // Named imports
import minus from './utils.js';             // Default import
import * as mathUtils from './utils.js';    // Import all as an object

console.log(PI);            // 3.14159
console.log(add(10, 5));    // 15
console.log(minus(10, 5));  // 5
console.log(mathUtils.PI);  // 3.14159

// Note: For browser, specify type="module" in script tag: <script type="module" src="main.js"></script>
```

**Exercise:**
1.  Create a file `mathOperations.js`. Inside it, `export` a named function `multiply(a, b)` and a named constant `EULER = 2.718`.
2.  In a separate file `app.js`, `import` `multiply` and `EULER` from `mathOperations.js` and use them to log `multiply(5, 4)` and `EULER`.
3.  Describe a scenario where you would use a default export instead of named exports.

## 5. Advanced Array Methods

ES6+ introduced powerful array iteration methods that simplify common tasks.

*   **`forEach()`**: Executes a provided function once for each array element. (No return value).
*   **`map()`**: Creates a *new array* populated with the results of calling a provided function on every element in the calling array.
*   **`filter()`**: Creates a *new array* with all elements that pass the test implemented by the provided function.
*   **`reduce()`**: Executes a reducer function (that you provide) on each element of the array, resulting in a single output value.
*   **`find()`**: Returns the *first* element in the provided array that satisfies the provided testing function. Otherwise `undefined`.
*   **`findIndex()`**: Returns the *index* of the first element in the array that satisfies the provided testing function. Otherwise `-1`.
*   **`some()`**: Checks if *at least one* element in the array satisfies the provided testing function. Returns `true` or `false`.
*   **`every()`**: Checks if *all* elements in the array satisfy the provided testing function. Returns `true` or `false`.

```javascript
const numbers = [1, 2, 3, 4, 5];

numbers.forEach(num => console.log(num * 2)); // Logs 2, 4, 6, 8, 10

const doubled = numbers.map(num => num * 2); // [2, 4, 6, 8, 10]
const evens = numbers.filter(num => num % 2 === 0); // [2, 4]
const sum = numbers.reduce((acc, num) => acc + num, 0); // 15

const firstEven = numbers.find(num => num % 2 === 0); // 2
const hasNegative = numbers.some(num => num < 0); // false
const allPositive = numbers.every(num => num > 0); // true
```

**Exercise:**
1.  Given an array of strings `words = ["apple", "banana", "apricot", "grape"]`, use `filter()` to create a new array containing only words that start with the letter "a".
2.  Given an array of objects `products = [{name: "Shirt", price: 20}, {name: "Pants", price: 40}]`, use `map()` to create a new array containing only the names of the products.
3.  Use `reduce()` to calculate the total price of all products in the `products` array from the previous exercise.

## 6. Asynchronous JavaScript

JavaScript is single-threaded, meaning it executes one task at a time. Asynchronous operations allow long-running tasks (like network requests, file I/O) to run in the background without blocking the main thread.

### 6.1. Callbacks (Briefly)
Traditionally, asynchronous code relied on callbacks. This led to "callback hell" or "pyramid of doom" for deeply nested asynchronous operations, making code hard to read and maintain.

### 6.2. Promises
Promises provide a cleaner way to handle asynchronous operations, representing a value that may be available now, or in the future, or never. A Promise can be in one of three states:
*   **Pending:** Initial state, neither fulfilled nor rejected.
*   **Fulfilled (Resolved):** The operation completed successfully.
*   **Rejected:** The operation failed.

*   `new Promise((resolve, reject) => ...)`: Creates a new promise.
*   `.then()`: Handles successful resolution.
*   `.catch()`: Handles rejection (errors).
*   `.finally()`: Executes after the promise is settled (either resolved or rejected).
*   `Promise.all()`, `Promise.race()`, `Promise.any()`, `Promise.allSettled()`: Static methods for handling multiple promises.

```javascript
const fetchData = (shouldSucceed) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (shouldSucceed) {
                resolve("Data fetched successfully!");
            } else {
                reject("Failed to fetch data.");
            }
        }, 1000); // Simulate network delay
    });
};

fetchData(true)
    .then(data => console.log(data)) // Data fetched successfully!
    .catch(error => console.error("Error:", error))
    .finally(() => console.log("Fetch attempt completed."));

fetchData(false)
    .then(data => console.log(data)) 
    .catch(error => console.error("Error:", error)); // Error: Failed to fetch data.
```

**Exercise:**
1.  Create a Promise that resolves after 2 seconds with the message "Operation completed!". Use `.then()` to log this message.
2.  Modify the Promise to reject with "Operation failed!" if a random number generated inside the Promise is less than 0.5. Use `.catch()` to handle the rejection.
3.  Explain the purpose of `Promise.all()` and provide a simple code example of how it can be used to wait for multiple asynchronous operations to complete.

### 6.3. Async/Await
`async` and `await` are ES2017 features that provide a more synchronous-like syntax for working with Promises, making asynchronous code easier to read and write.

*   **`async` keyword:** Used to define an asynchronous function. An `async` function always returns a Promise.
*   **`await` keyword:** Can only be used inside an `async` function. It pauses the execution of the `async` function until the Promise it's waiting for settles (resolves or rejects).
*   Error handling with `try...catch` blocks becomes natural.

```javascript
async function processData() {
    try {
        console.log("Starting data fetch...");
        const result = await fetchData(true); // Await the promise resolution
        console.log("Result:", result);

        const anotherResult = await fetchData(false); // This will throw an error
        console.log("Another result:", anotherResult);

    } catch (error) {
        console.error("Caught an async error:", error);
    } finally {
        console.log("Async process finished.");
    }
}

processData();
// Output:
// Starting data fetch...
// Result: Data fetched successfully!
// Caught an async error: Failed to fetch data.
// Async process finished.
```

**Exercise:**
1.  Convert the `fetchData` promise example from the previous section into an `async` function called `getProcessedData` that uses `await`.
2.  Demonstrate how `try...catch` blocks are used for error handling within an `async` function, using your `getProcessedData` function.
3.  Can you use the `await` keyword in the global scope (outside of an `async` function) in a modern browser environment? Briefly explain.

## 7. Error Handling

Robust applications require proper error handling to prevent crashes and provide meaningful feedback. JavaScript uses `try...catch...finally` blocks for synchronous error handling and built-in `Error` objects.

*   **`try` block:** Contains the code that might throw an error.
*   **`catch` block:** Executes if an error occurs in the `try` block. It receives the error object.
*   **`finally` block:** Executes regardless of whether an error occurred or not (useful for cleanup).
*   **`throw` statement:** Used to create custom errors or re-throw existing errors.

```javascript
function divide(a, b) {
    if (b === 0) {
        throw new Error("Division by zero is not allowed.");
    }
    return a / b;
}

try {
    console.log(divide(10, 2)); // 5
    console.log(divide(10, 0)); // This line throws an error
    console.log("This line will not be executed.");
} catch (error) {
    console.error("An error occurred:", error.message);
} finally {
    console.log("Execution of try/catch block completed.");
}

// Custom Error example
class CustomValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = "CustomValidationError";
    }
}

function validateInput(input) {
    if (typeof input !== 'number') {
        throw new CustomValidationError("Input must be a number.");
    }
    return input;
}

try {
    validateInput("hello");
} catch (error) {
    console.error(`Custom error: ${error.name}: ${error.message}`);
}
```

**Exercise:**
1.  Write a function `parseJSONSafe(jsonString)` that attempts to parse a JSON string. If parsing fails, it should catch the error and return `null` instead of throwing.
2.  Use a `try...catch` block to call `parseJSONSafe` with both a valid JSON string (`'{"key":"value"}'`) and an invalid one (`'{bad json}'`). Log the results.
3.  When is the `finally` block particularly useful, and what kind of code would you typically place inside it?

## 8. DOM Manipulation and Event Handling

### 8.1. What is the DOM?
The Document Object Model (DOM) is a programming interface for web documents. It represents the page structure as a tree of objects, where each node is an object representing an HTML element, attribute, or text. JavaScript interacts with HTML and CSS via the DOM to dynamically change content, style, and structure.

### 8.2. Selecting Elements
To manipulate elements, you first need to select them.

*   `document.getElementById('id')`: Selects a single element by its ID.
*   `document.getElementsByClassName('class')`: Selects all elements with a specific class (returns an HTMLCollection).
*   `document.getElementsByTagName('tag')`: Selects all elements with a specific tag name (returns an HTMLCollection).
*   `document.querySelector('selector')`: Selects the first element that matches a CSS selector (modern, preferred for single elements).
*   `document.querySelectorAll('selector')`: Selects all elements that match a CSS selector (returns a NodeList).

```html
<!-- index.html -->
<div id="main-container">
    <p class="item">First paragraph</p>
    <p class="item">Second paragraph</p>
</div>
```
```javascript
const container = document.getElementById("main-container");
const firstP = document.querySelector(".item"); // Selects the first <p> with class 'item'
const allPs = document.querySelectorAll(".item"); // Selects both <p> tags

console.log(container);
console.log(firstP.textContent); // First paragraph
allPs.forEach(p => console.log(p.textContent)); // First paragraph, Second paragraph
```

**Exercise:**
1.  On an HTML page, add a `div` with `id="greeting"` and a `span` inside it with `class="user-name"`. Select the `span` element using `querySelector`.
2.  Change the text content of the selected `span` to your name.
3.  Explain the key difference between `document.querySelector()` and `document.querySelectorAll()` regarding their return values.

### 8.3. Modifying HTML and CSS
Once elements are selected, you can change their content, attributes, and styles.

*   **Content:**
    *   `element.textContent`: Gets or sets the text content of an element (safe).
    *   `element.innerHTML`: Gets or sets the HTML content of an element (can be risky if content is user-generated due to XSS).
*   **Attributes:**
    *   `element.setAttribute('attr', 'value')`: Sets an attribute's value.
    *   `element.getAttribute('attr')`: Gets an attribute's value.
    *   `element.removeAttribute('attr')`: Removes an attribute.
*   **Classes:**
    *   `element.classList.add('class')`, `.remove('class')`, `.toggle('class')`.
*   **Styles:**
    *   `element.style.propertyName = 'value'`: Directly applies inline styles.
*   **Creating/Appending Elements:**
    *   `document.createElement('tagName')`
    *   `parentElement.appendChild(childElement)`
    *   `parentElement.prepend(childElement)`
    *   `parentElement.insertBefore(newElement, referenceElement)`

```html
<!-- index.html -->
<div id="box" class="inactive">Hello</div>
<ul id="myList"><li>Item 1</li></ul>
```
```javascript
const box = document.getElementById("box");
box.textContent = "Hello SkillBun!"; // Change text
box.classList.add("active");      // Add a CSS class
box.style.backgroundColor = "lightblue"; // Change background

const listItem = document.createElement("li");
listItem.textContent = "Item 2";
document.getElementById("myList").appendChild(listItem);
```

**Exercise:**
1.  Create an HTML `button` with `id="toggleButton"`. When this button is clicked, toggle a CSS class `highlight` on a `div` element with `id="targetDiv"`.
2.  Dynamically create an image element (`<img>`), set its `src` and `alt` attributes, and append it to the `body` of the document.
3.  Explain when it is appropriate to use `textContent` versus `innerHTML` for updating element content, considering security and performance.

### 8.4. Event Handling
Event handling allows JavaScript to react to user interactions or browser events (clicks, key presses, form submissions, page loads).

*   **`addEventListener()` (Preferred):** Attaches an event handler function to an element without overwriting existing handlers. `element.addEventListener(event, handlerFunction, options)`.
*   **Event Object:** An object automatically passed to the event handler, containing details about the event.
*   **Common Events:** `click`, `mouseover`, `keydown`, `submit`, `load`, `scroll`, etc.
*   **`event.preventDefault()`:** Prevents the browser's default action (e.g., a form submitting, a link navigating).
*   **`event.stopPropagation()`:** Stops the event from bubbling up the DOM tree.
*   **Event Bubbling/Capturing (Briefly):** The order in which events are handled on nested elements.

```html
<!-- index.html -->
<button id="myButton">Click Me</button>
<a href="https://example.com" id="myLink">Visit Example</a>
```
```javascript
const button = document.getElementById("myButton");
button.addEventListener("click", (event) => {
    console.log("Button was clicked!");
    console.log("Event type:", event.type);
});

const link = document.getElementById("myLink");
link.addEventListener("click", (event) => {
    event.preventDefault(); // Stop the link from navigating
    console.log("Link click prevented. You can handle it here.");
});

document.body.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        console.log("Enter key pressed!");
    }
});
```

**Exercise:**
1.  Add a `mouseover` event listener to a `div` element with `id="hoverArea"` that changes its background color to `yellow` when the mouse enters, and back to `white` on `mouseout`.
2.  Create an HTML form with an input field and a submit button. Add a `submit` event listener to the form that prevents its default submission and logs the value of the input field to the console.
3.  Explain the purpose of `event.preventDefault()` and provide a scenario where it would be essential.

### 8.5. Performance Considerations (DOM)
Manipulating the DOM can be expensive. Optimizing DOM interactions is crucial for responsive web applications.

*   **Batching DOM updates:** Make changes offline (e.g., build HTML string, then `innerHTML` once) or modify elements when they are detached from the DOM, then re-attach.
*   **Event Delegation:** Attach a single event listener to a parent element instead of multiple listeners to individual child elements. The event object can then be used to determine which child triggered the event.
*   **Debouncing/Throttling:** Control how often a function is called, especially for events that fire frequently (e.g., `scroll`, `resize`, `mousemove`, `input`).
*   **Avoiding Reflows and Repaints:** Changes to layout or style properties often trigger browser reflows (recalculating element positions/sizes) and repaints (redrawing elements), which are costly. Minimize direct `element.style` manipulations in loops; prefer CSS classes.

```javascript
// Example of batching DOM updates (simplified)
const list = document.getElementById('myList');
let fragment = document.createDocumentFragment(); // Create an off-DOM container

for (let i = 0; i < 1000; i++) {
    const li = document.createElement('li');
    li.textContent = `Item ${i}`;
    fragment.appendChild(li);
}
list.appendChild(fragment); // Append once, triggering one reflow/repaint

// Example of Event Delegation
document.getElementById('parentContainer').addEventListener('click', function(event) {
    if (event.target.classList.contains('child-button')) {
        console.log('Child button clicked:', event.target.textContent);
    }
});
```

**Exercise:**
1.  Explain why continuously changing `element.style.width` within a `mousemove` event handler without any optimization can lead to poor performance.
2.  Describe how event delegation works and its main benefit for performance, especially with dynamic content.
3.  What is the core idea behind "debouncing" an event handler, and provide a common use case for it?