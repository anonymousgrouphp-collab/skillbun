# TypeScript Fundamentals: The Backbone of Angular

TypeScript is a strongly-typed superset of JavaScript that compiles to plain JavaScript. Developed by Microsoft, it extends JavaScript by adding static type definitions, enabling developers to write more robust and maintainable code, especially crucial for large-scale applications like those built with Angular.

### Why TypeScript?
*   **Type Safety:** Catches errors during development (compile-time) instead of runtime.
*   **Enhanced Tooling:** Better autocompletion, refactoring, and error checking in IDEs.
*   **Readability & Maintainability:** Clearer code intent, easier for teams to understand and scale.
*   **Modern JavaScript Features:** Supports ES6+ features, even for older browser targets.

## Core Concepts

### 1. Basic Types & Type Inference
TypeScript introduces a range of types to define data structures.

*   **Primitive Types:** `string`, `number`, `boolean`, `null`, `undefined`, `symbol`, `bigint`.
*   **Special Types:**
    *   `any`: Opts out of type checking. Use sparingly.
    *   `unknown`: A safer alternative to `any`. Requires type narrowing before use.
    *   `void`: For functions that do not return any value.
    *   `never`: For functions that never return (e.g., throw an error, infinite loop).
*   **Type Inference:** TypeScript can often deduce the type of a variable based on its assigned value, reducing the need for explicit type annotations.

```typescript
let myName: string = "Alice"; // Explicit Type Annotation
let age = 30; // Type Inference: age is number
let isActive: boolean = true; // Explicit Type Annotation

function logValue(value: unknown) {
  if (typeof value === 'string') {
    console.log(value.toUpperCase()); // Type Narrowing
  }
}
logValue("hello");
```

### 2. Interfaces
Interfaces define the shape (structure) of an object. They are powerful tools for ensuring consistency and type-checking data structures.

```typescript
interface User {
  id: number;
  name: string;
  email?: string; // Optional property
  greet(message: string): void; // Method signature
}

const user1: User = {
  id: 1,
  name: "Bob",
  greet(message: string) {
    console.log(`${message}, ${this.name}!`);
  }
};

user1.greet("Hello"); // Output: Hello, Bob!
```

### 3. Classes
TypeScript provides full support for ES6 classes, including inheritance, access modifiers, and constructors, bringing Object-Oriented Programming (OOP) principles to JavaScript.

*   **Access Modifiers:**
    *   `public`: Accessible everywhere (default).
    *   `private`: Only accessible within the class it's declared.
    *   `protected`: Accessible within the class and by subclasses.

```typescript
class Product {
  private id: number;
  public name: string;
  protected price: number;

  constructor(id: number, name: string, price: number) {
    this.id = id;
    this.name = name;
    this.price = price;
  }

  getProductInfo(): string {
    return `ID: ${this.id}, Name: ${this.name}, Price: $${this.price}`;
  }
}

class ElectronicProduct extends Product {
  private brand: string;

  constructor(id: number, name: string, price: number, brand: string) {
    super(id, name, price); // Call parent class constructor
    this.brand = brand;
  }

  getFullProductInfo(): string {
    return `${super.getProductInfo()}, Brand: ${this.brand}`;
  }
}

const laptop = new ElectronicProduct(101, "Laptop", 1200, "Dell");
console.log(laptop.getFullProductInfo());
// Output: ID: 101, Name: Laptop, Price: $1200, Brand: Dell
```

### 4. Enums
Enums (enumerations) allow you to define a set of named constants. They can be numeric or string-based.

```typescript
enum Direction {
  Up,    // 0 by default
  Down,  // 1
  Left,  // 2
  Right  // 3
}

enum Status {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED"
}

console.log(Direction.Up);       // Output: 0
console.log(Status.COMPLETED);   // Output: "COMPLETED"
```

### 5. Generics
Generics enable you to create reusable components that can work with a variety of types, providing flexibility while maintaining type safety. They allow you to write code that works on types as parameters.

```typescript
function identity<T>(arg: T): T {
  return arg;
}

let output1 = identity<string>("myString"); // output1 is type string
let output2 = identity<number>(100);     // output2 is type number

// Generic Interface
interface Box<T> {
  value: T;
}
const stringBox: Box<string> = { value: "hello" };
const numberBox: Box<number> = { value: 123 };
```

### 6. Modules
Modules help organize code into separate, self-contained files. They promote reusability and prevent global scope pollution. Use `import` and `export` statements.

```typescript
// src/utils.ts
export function greet(name: string): string {
  return `Hello, ${name}!`;
}

export const PI = 3.14159;

// src/app.ts
import { greet, PI } from './utils'; // Relative path

console.log(greet("World")); // Output: Hello, World!
console.log(PI);             // Output: 3.14159
```

### 7. Decorators
Decorators are special declarations that can be attached to classes, methods, accessors, properties, or parameters. They provide a powerful way to add metadata or extend functionality to existing code without modifying its structure. Angular heavily uses decorators for defining components (`@Component`), services (`@Injectable`), etc.

*Note: Decorators are an experimental feature and require enabling `"experimentalDecorators": true` and `"emitDecoratorMetadata": true` in your `tsconfig.json`.*

```typescript
function logClass(constructor: Function) {
  console.log(`Class ${constructor.name} was instantiated.`);
}

@logClass
class MyService {
  constructor() {
    // Some service logic
  }
}

new MyService(); // When `new MyService()` is called, logs: Class MyService was instantiated.
```

### 8. Advanced Type Utilities
TypeScript offers advanced features for more complex type manipulations:

*   **Type Aliases:** Create new names for existing types or combine types.
    ```typescript
    type ID = string | number; // Union type alias
    let userId: ID = "abc-123";
    type Point = { x: number; y: number; }; // Object type alias
    ```
*   **Union Types:** Allow a variable to hold one of several types (`typeA | typeB`).
    ```typescript
    function printId(id: string | number) {
      console.log(id);
    }
    ```
*   **Intersection Types:** Combine multiple types into a single type (`typeA & typeB`). An object of an intersection type must have all properties from all combined types.
    ```typescript
    type Draggable = { drag(): void };
    type Resizable = { resize(): void };
    type UIWidget = Draggable & Resizable; // Must have both drag() and resize() methods
    ```
*   **Literal Types:** Types that are exactly one specific string, number, or boolean value.
    ```typescript
    let alignment: "left" | "right" | "center";
    alignment = "center"; // Valid
    // alignment = "top"; // Error
    ```
*   **Type Guards:** Mechanisms to narrow down the type of a variable within a conditional block (`typeof`, `instanceof`, `in` operator).
*   **Utility Types:** Built-in types for common type transformations (e.g., `Partial<T>`, `Readonly<T>`, `Pick<T, K>`, `Omit<T, K>`).
    *   `Partial<T>`: Makes all properties in `T` optional.
    *   `Readonly<T>`: Makes all properties in `T` `readonly`.
    *   `Pick<T, K>`: Constructs a type by picking the set of properties `K` from `T`.
    *   `Omit<T, K>`: Constructs a type by picking all properties from `T` and then removing `K`.

## Quick Understanding Checklist/Exercises:

1.  **Interfaces vs. Type Aliases for Classes:** Explain the primary benefit of using an `interface` over a `type alias` when defining the shape of an object that will be *implemented* by a class. Provide a brief example if possible.
2.  **Generic Function:** Write a generic function `reverseArray<T>(arr: T[]): T[]` that takes an array of any type `T` and returns a new array with its elements in reverse order.
3.  **Utility Type Application:** Given an original type `interface Config { port: number; host: string; timeout: number; }`, how would you define a new type `PartialConfig` where all properties are optional? Provide the TypeScript code for `PartialConfig`.
