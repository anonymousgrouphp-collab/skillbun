# JavaScript Fundamentals & ES6+ Study Guide

Welcome to the foundational concepts of JavaScript! Mastering these topics is crucial for any frontend developer. This guide covers essential syntax, core programming constructs, and modern ES6+ features that will empower you to write robust and efficient JavaScript code.

## 1. Variables: `let` and `const`

Variables are containers for storing data. JavaScript introduced `let` and `const` in ES6 to address issues with `var`.

*   **`let`**: Declares a block-scoped local variable. It can be reassigned.
*   **`const`**: Declares a block-scoped, read-only named constant. It must be initialized at declaration and cannot be reassigned.

```javascript
// Using let
let userName = "Alice";
userName = "Bob"; // Reassignment is allowed

// Using const
const PI = 3.14159;
// PI = 3.14; // Error: Assignment to constant variable.

const user = { name: "Charlie" };
user.name = "David"; // Object properties can be modified, but the object reference cannot be reassigned.
// user = { name: "Eve" }; // Error: Reassignment not allowed.
```

## 2. Data Types

JavaScript categorizes data into two main types: primitive and non-primitive.

### Primitive Data Types
These are immutable and represent a single value.
*   **String**: Textual data (e.g., `"hello"`).
*   **Number**: Integer and floating-point numbers (e.g., `10`, `3.14`).
*   **Boolean**: Logical entity representing `true` or `false`.
*   **`null`**: Intentional absence of any object value. (It's a primitive value, but `typeof null` returns "object" - a historical bug).
*   **`undefined`**: A variable that has been declared but not assigned a value.
*   **Symbol** (ES6+): A unique and immutable data type, often used for object property keys.
*   **BigInt** (ES11): Used to represent whole numbers larger than 2<sup>53</sup> - 1.

### Non-Primitive Data Types
These are mutable and can store collections of data.
*   **Object**: A collection of key-value pairs (e.g., `{ name: "Alice", age: 30 }`). This includes arrays (`[]`) and functions as special types of objects.

```javascript
let name = "SkillBun";             // String
let age = 5;                       // Number
let isActive = true;               // Boolean
let score = null;                  // Null
let job;                           // Undefined
const id = Symbol('id');           // Symbol
const bigNumber = 9007199254740991n; // BigInt

let person = {                     // Object
    firstName: "John",
    lastName: "Doe"
};
let numbers = [1, 2, 3];           // Array (special type of object)
```

## 3. Operators

Operators perform operations on values and variables.

*   **Arithmetic**: `+`, `-`, `*`, `/`, `%` (modulo), `**` (exponentiation).
*   **Assignment**: `=`, `+=`, `-=`, `*=`, `/=`, etc.
*   **Comparison**: `==` (loose equality), `===` (strict equality), `!=`, `!==`, `<`, `>`, `<=`, `>=`.
*   **Logical**: `&&` (AND), `||` (OR), `!` (NOT).
*   **Ternary**: `condition ? exprIfTrue : exprIfFalse`. A shorthand for `if-else`.

```javascript
let x = 10, y = 5;
console.log(x + y);       // Arithmetic: 15
x += y;                   // Assignment: x is now 15
console.log(x === 15);    // Comparison: true (strict equality)
console.log(x > 10 && y < 10); // Logical: true
let result = (x > y) ? "X is greater" : "Y is greater"; // Ternary: "X is greater"
```

## 4. Control Flow

Control flow statements determine the order in which instructions are executed.

*   **`if/else if/else`**: Executes code based on a condition.
*   **`switch`**: Evaluates an expression and executes code blocks based on matching `case` values.
*   **Loops**: Repeat a block of code multiple times.
    *   `for`: For a known number of iterations.
    *   `while`: Repeats as long as a condition is true.
    *   `do...while`: Executes the block once, then repeats as long as a condition is true.
    *   `for...of` (ES6+): Iterates over iterable objects (Arrays, Strings, Maps, Sets, etc.).
    *   `for...in`: Iterates over enumerable properties of an object.

```javascript
// if/else
let temperature = 25;
if (temperature > 30) {
    console.log("It's hot!");
} else if (temperature > 20) {
    console.log("It's warm.");
} else {
    console.log("It's cool.");
}

// switch
let day = "Monday";
switch (day) {
    case "Monday":
        console.log("Start of the week.");
        break;
    case "Friday":
        console.log("End of the week.");
        break;
    default:
        console.log("Mid-week.");
}

// for loop
for (let i = 0; i < 3; i++) {
    console.log("Iteration " + i);
}

// for...of
const colors = ["red", "green", "blue"];
for (const color of colors) {
    console.log(color);
}
```

## 5. Functions

Functions are blocks of code designed to perform a particular task.

*   **Function Declaration**: Defined using the `function` keyword. Hoisted.
    ```javascript
    function greet(name) {
        return "Hello, " + name + "!";
    }
    console.log(greet("Alice"));
    ```
*   **Function Expression**: Defined as part of an expression (e.g., assigned to a variable). Not hoisted.
    ```javascript
    const sayHello = function(name) {
        return "Hi, " + name + "!";
    };
    console.log(sayHello("Bob"));
    ```
*   **Arrow Functions** (ES6+): A more concise syntax, especially for simple functions. They do not have their own `this` context.
    ```javascript
    const add = (a, b) => a + b;
    console.log(add(5, 3)); // 8

    const multiply = (a, b) => {
        // Multi-line arrow function needs explicit return
        return a * b;
    };
    console.log(multiply(4, 2)); // 8
    ```

## 6. Scope

Scope determines the accessibility of variables, functions, and objects in some part of your code.

*   **Global Scope**: Variables declared outside any function or block are globally accessible.
*   **Function Scope**: Variables declared with `var` inside a function are only accessible within that function.
*   **Block Scope** (ES6+ with `let` and `const`): Variables declared inside a block (`{}`) are only accessible within that block.

```javascript
const globalVar = "I'm global";

function exampleScope() {
    const functionVar = "I'm function-scoped";
    if (true) {
        const blockVar = "I'm block-scoped";
        console.log(globalVar);     // Accessible
        console.log(functionVar);   // Accessible
        console.log(blockVar);      // Accessible
    }
    // console.log(blockVar); // Error: blockVar is not defined here
}
exampleScope();
// console.log(functionVar); // Error: functionVar is not defined here
```

## 7. Hoisting

Hoisting is a JavaScript mechanism where variable and function declarations are moved to the top of their containing scope during the compilation phase.

*   **`var` declarations**: Hoisted and initialized with `undefined`.
*   **`let`/`const` declarations**: Hoisted, but not initialized. Accessing them before declaration results in a `ReferenceError` (Temporal Dead Zone).
*   **Function declarations**: Hoisted entirely, making them callable before their definition in the code.

```javascript
console.log(hoistedVar); // undefined (var is hoisted and initialized)
var hoistedVar = "I am hoisted";

// console.log(hoistedLet); // ReferenceError: Cannot access 'hoistedLet' before initialization
// let hoistedLet = "I am not initialized";

greetHoisted(); // "Hello from a hoisted function!"
function greetHoisted() {
    console.log("Hello from a hoisted function!");
}
```

## 8. ES6+ Features

ES6 (ECMAScript 2015) introduced many significant features that modernize JavaScript.

### a. Template Literals
Allow for embedded expressions and multi-line strings using backticks (`` ` ``).

```javascript
const user = "Alice";
const greeting = `Hello, ${user}!
How are you doing today?`;
console.log(greeting);
// Output:
// Hello, Alice!
// How are you doing today?
```

### b. Destructuring Assignment
A concise way to extract values from arrays or properties from objects into distinct variables.

*   **Array Destructuring**:
    ```javascript
    const numbers = [10, 20, 30];
    const [first, second] = numbers;
    console.log(first);  // 10
    console.log(second); // 20
    ```
*   **Object Destructuring**:
    ```javascript
    const person = { name: "Bob", age: 25 };
    const { name, age } = person;
    console.log(name); // Bob
    console.log(age);  // 25
    ```

### c. Spread and Rest Operators (`...`)
*   **Spread Operator**: Expands an iterable (like an array or string) into individual elements or an object into key-value pairs.
    ```javascript
    const arr1 = [1, 2];
    const arr2 = [...arr1, 3, 4]; // [1, 2, 3, 4]

    const obj1 = { a: 1, b: 2 };
    const obj2 = { ...obj1, c: 3 }; // { a: 1, b: 2, c: 3 }
    ```
*   **Rest Parameters**: Collects an indefinite number of arguments into an array.
    ```javascript
    function sumAll(...numbers) {
        return numbers.reduce((acc, current) => acc + current, 0);
    }
    console.log(sumAll(1, 2, 3));    // 6
    console.log(sumAll(5, 10, 15, 20)); // 50
    ```

## Quick Checklist/Exercise:

1.  Explain the key difference between `let` and `const` regarding mutability and reassignment.
2.  Given `const data = { value: 10 };`, what would be the result of `data.value = 20;` and `data = { value: 30 };`? Explain why.
3.  Write a function using an arrow function that takes two numbers and returns their product. Then, call it with example values and log the result to the console.