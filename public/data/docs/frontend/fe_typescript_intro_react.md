# TypeScript for Frontend Development: Study Guide

TypeScript is a superset of JavaScript that adds static typing to the language. Developed by Microsoft, it compiles down to plain JavaScript, making it compatible with any JavaScript environment. For frontend development, TypeScript significantly enhances code quality, maintainability, and developer experience.

## 1. Understanding the Benefits of Static Typing

Static typing allows you to catch errors at compile-time rather than runtime. This means many common bugs are identified before your code even reaches the browser, leading to:

*   **Early Error Detection:** Type mismatches, misspelled property names, and incorrect function arguments are flagged immediately by your IDE or compiler.
*   **Improved Code Readability and Maintainability:** Types act as documentation, making it easier for developers to understand the expected shape of data and parameters.
*   **Enhanced Developer Tooling:** IDEs can provide better autocompletion, refactoring tools, and navigation due to the explicit type information.
*   **Easier Refactoring:** When you change a type definition, TypeScript will highlight all places in your codebase that are affected, ensuring consistency.
*   **Better Collaboration:** Teams can work more efficiently with a shared understanding of data structures and API contracts.

## 2. Basic TypeScript Syntax and Types

TypeScript introduces type annotations using a colon (`:`) followed by the type.

### Primitive Types

*   `string`: For text data.
    ```typescript
    let userName: string = "Alice";
    ```
*   `number`: For numeric data (integers and floating-point numbers).
    ```typescript
    let userAge: number = 30;
    ```
*   `boolean`: For true/false values.
    ```typescript
    let isActive: boolean = true;
    ```
*   `null` and `undefined`: Represent explicit absence of a value.
    ```typescript
    let someValue: null = null;
    let anotherValue: undefined = undefined;
    ```
*   `any`: Opts out of type checking for a variable. Use sparingly.
    ```typescript
    let dynamicData: any = "can be anything";
    dynamicData = 123;
    ```
*   `unknown`: Similar to `any` but safer; you must narrow its type before performing operations.
    ```typescript
    let unknownValue: unknown = 4;
    if (typeof unknownValue === 'number') {
      console.log(unknownValue * 2); 
    }
    ```

### Arrays

Specify the type of elements followed by `[]` or use the generic `Array<Type>`.

```typescript
let numbers: number[] = [1, 2, 3];
let names: Array<string> = ["Alice", "Bob"];
```

### Tuples

Fixed-size arrays where each element has a known type.

```typescript
let user: [string, number] = ["Alice", 30];
// user = [30, "Alice"]; // Error: Type order mismatch
```

### Enums

A way of giving more friendly names to sets of numeric values.

```typescript
enum Direction {
  Up = 1,
  Down,
  Left,
  Right,
}

let go: Direction = Direction.Up;
console.log(go); // Output: 1
```

### Union Types

Allows a variable to be one of several types.

```typescript
let id: string | number;
id = "abc";
id = 123;
// id = true; // Error
```

### Type Aliases

Create a new name for a type.

```typescript
type ID = string | number;
type UserAge = number;

let userId: ID = "u123";
let age: UserAge = 25;
```

### Functions

Type parameters, return values, and function signatures.

```typescript
function add(a: number, b: number): number {
  return a + b;
}

const greet = (name: string): void => {
  console.log(`Hello, ${name}`);
};

// Optional parameter
function sayHello(name: string, greeting?: string): string {
  return `${greeting || "Hello"}, ${name}`;
}

// Default parameter
function multiply(a: number, b: number = 2): number {
  return a * b;
}
```

## 3. Interfaces

Interfaces are a powerful way to define contracts within your code and to define the shape of objects. They enforce that an object conforms to a certain structure.

```typescript
interface User {
  id: number;
  name: string;
  email?: string; // Optional property
  readonly createdAt: Date; // Readonly property
}

interface Employee extends User {
  employeeId: string;
  department: string;
}

const user1: User = {
  id: 1,
  name: "John Doe",
  createdAt: new Date(),
};

const employee1: Employee = {
  id: 2,
  name: "Jane Smith",
  email: "jane@example.com",
  createdAt: new Date(),
  employeeId: "EMP001",
  department: "Engineering",
};

// user1.createdAt = new Date(); // Error: Cannot assign to 'createdAt' because it is a read-only property.
```

## 4. Integrating TypeScript into React Projects

Using TypeScript with React significantly improves component robustness and developer experience.

### Setting up a React with TypeScript Project

Using Vite (recommended for new projects):

```bash
npm create vite@latest my-react-ts-app -- --template react-ts
cd my-react-ts-app
npm install
npm run dev
```

Using Create React App (legacy, but still works):

```bash
npx create-react-app my-react-ts-app --template typescript
cd my-react-ts-app
npm start
```

### Typing Props and State in Functional Components

React's `FC` (FunctionComponent) type is often used, or you can explicitly type `props`.

```typescript
import React, { useState } from 'react';

interface ButtonProps {
  text: string;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}

const MyButton: React.FC<ButtonProps> = ({ text, onClick, disabled }) => {
  return (
    <button onClick={onClick} disabled={disabled}>
      {text}
    </button>
  );
};

interface CounterState {
  count: number;
}

const Counter: React.FC = () => {
  const [count, setCount] = useState<number>(0);

  const increment = () => setCount(prevCount => prevCount + 1);

  return (
    <div>
      <p>Count: {count}</p>
      <MyButton text="Increment" onClick={increment} />
    </div>
  );
};

export default Counter;
```

### Event Handling Types

React provides a set of types for synthetic events, e.g., `React.MouseEvent`, `React.ChangeEvent`, `React.FormEvent`.

```typescript
import React, { useState } from 'react';

const InputField: React.FC = () => {
  const [value, setValue] = useState<string>('');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log('Submitted:', value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" value={value} onChange={handleChange} />
      <button type="submit">Submit</button>
    </form>
  );
};

export default InputField;
```

## Quick Checklist/Exercise

1.  **Identify Type Errors:** Given `let data: [string, number] = [5, "hello"];`, explain why this produces a TypeScript error and how to fix it.
2.  **Define an Interface:** Create an interface `Product` with properties `id` (number), `name` (string), `price` (number), and an optional `description` (string).
3.  **Typed React Component:** Write a simple React functional component `WelcomeMessage` that accepts a `name` prop (string) and renders "Hello, [name]!". Ensure `name` is properly typed.