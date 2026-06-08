# JavaScript Modules & Classes: A Study Guide

This guide explores two fundamental concepts in modern JavaScript development: ES Modules for effective code organization and ES6 Classes, which provide a more structured approach to object-oriented programming built on JavaScript's prototypal inheritance model.

## 1. ES Modules (ECMAScript Modules)

ES Modules provide a standardized way to organize your JavaScript code into reusable units. They help in preventing global scope pollution, improve maintainability, and allow for efficient dependency management.

### Why Use Modules?

*   **Code Organization**: Break down large applications into smaller, manageable files.
*   **Reusability**: Write code once and reuse it across different parts of your application or even different projects.
*   **Encapsulation**: Keep variables and functions local to a module unless explicitly exported, preventing naming conflicts.
*   **Dependency Management**: Clearly define dependencies between different parts of your codebase.

### `export` Statement

The `export` statement is used to make functions, objects, or primitive values available from a module. There are two main types of exports:

1.  **Named Exports**: Export multiple values from a module. Consumers must use the exact name to import them.

    ```javascript
    // math.js
    export const add = (a, b) => a + b;
    export const subtract = (a, b) => a - b;

    export function multiply(a, b) {
      return a * b;
    }
    ```

2.  **Default Exports**: Export a single, primary value from a module. You can have only one default export per module.

    ```javascript
    // logger.js
    const logMessage = (message) => console.log(`[LOG]: ${message}`);
    export default logMessage;
    
    // OR directly
    // export default (message) => console.log(`[LOG]: ${message}`);
    ```

### `import` Statement

The `import` statement is used to bring exported members from another module into the current scope.

1.  **Named Imports**: Import specific named exports.

    ```javascript
    // app.js
    import { add, subtract } from './math.js';

    console.log(add(5, 3)); // 8
    console.log(subtract(10, 4)); // 6
    ```

2.  **Default Imports**: Import the default export. You can give it any local name.

    ```javascript
    // app.js
    import log from './logger.js'; // 'log' is a local name for the default export

    log('Application started successfully!');
    ```

3.  **Importing All as Namespace**: Import all named exports into a single object.

    ```javascript
    // app.js
    import * as MathOperations from './math.js';

    console.log(MathOperations.add(2, 2)); // 4
    ```

### Code Example: ES Modules

**`utils.js`:**
```javascript
export const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

export const PI = 3.14159;

const greeting = (name) => `Hello, ${name}!`;
export default greeting;
```

**`app.js`:**
```javascript
import greet from './utils.js';
import { capitalize, PI } from './utils.js';
// Or import * as Utils from './utils.js';

console.log(greet('Alice')); // Hello, Alice!
console.log(capitalize('world')); // World
console.log(`The value of PI is approximately ${PI}`); // The value of PI is approximately 3.14159
```

**Note**: When using modules in a browser, you need to add `type="module"` to your script tag:
`<script type="module" src="app.js"></script>`

## 2. Prototypal Inheritance

JavaScript is a prototype-based language, meaning objects can inherit properties and methods directly from other objects. This is the core mechanism behind object inheritance in JavaScript, even with ES6 classes.

### The `prototype` Chain

Every JavaScript object has an internal `[[Prototype]]` slot, which points to another object, its prototype. When you try to access a property or method on an object, if it's not found directly on the object, JavaScript looks up the `[[Prototype]]` chain until it finds the property or reaches the end of the chain (an object whose prototype is `null`).

*   **`__proto__` (deprecated)**: A non-standard, but widely implemented, property that exposes the internal `[[Prototype]]` of an object. Use `Object.getPrototypeOf()` instead.
*   **`prototype` (of functions)**: A property on constructor functions. When you create an object with `new MyConstructor()`, the newly created object's `[[Prototype]]` will point to `MyConstructor.prototype`.

### `Object.create()`

This method creates a new object, using an existing object as the prototype of the newly created object.

```javascript
const animal = {
  sound: 'Generic sound',
  makeSound: function() {
    console.log(this.sound);
  }
};

const dog = Object.create(animal);
dog.sound = 'Woof!'; // 'dog' now has its own 'sound' property
dog.makeSound(); // Woof! (dog's own sound)

const cat = Object.create(animal);
cat.makeSound(); // Generic sound (inherits from animal)
```

## 3. ES6 Classes

Introduced in ECMAScript 2015 (ES6), classes are 