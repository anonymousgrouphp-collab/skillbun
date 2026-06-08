# Core React.js & Component-Based UI

This study guide will walk you through the fundamental concepts of React.js, focusing on its component-based architecture, data flow, state management, and essential features that enable building dynamic and interactive user interfaces.

## 1. Component-Based Architecture

React's core principle is building UIs from small, isolated, and reusable pieces called components. These components manage their own state and can be composed together to form complex UIs.

### Functional Components
These are JavaScript functions that accept `props` (properties) as an argument and return React elements (JSX). They are the modern and preferred way to write components, especially with the introduction of Hooks.

### Class Components
These are ES6 classes that extend `React.Component` and implement a `render()` method that returns React elements. While still supported, they are less commonly used for new development due to the simplicity and power of functional components with Hooks.

#### Code Example: Simple Functional Component

```jsx
import React from 'react';

function WelcomeMessage(props) {
  return <h1>Hello, {props.name}!</h1>;
}

export default WelcomeMessage;
```

#### Checklist/Exercise
1. Explain the main advantage of a component-based architecture.
2. Describe the key difference between a functional and a class component in terms of syntax.
3. Create a simple functional component that displays your favorite color.

## 2. Props for Data Flow

`Props` (short for properties) are a mechanism for passing data from a parent component to a child component. They are read-only, ensuring that data flows in a unidirectional manner (down the component tree), which helps in maintaining predictable application state.

#### Code Example: Passing and Using Props

```jsx
// Parent Component (App.js)
import React from 'react';
import UserProfile from './UserProfile';

function App() {
  return (
    <div>
      <UserProfile name="Alice" age={30} />
      <UserProfile name="Bob" age={25} />
    </div>
  );
}

// Child Component (UserProfile.js)
import React from 'react';

function UserProfile(props) {
  return (
    <div>
      <h2>User: {props.name}</h2>
      <p>Age: {props.age}</p>
    </div>
  );
}

export default UserProfile;
```

#### Checklist/Exercise
1. What does "unidirectional data flow" mean in the context of React props?
2. Can a child component directly modify the props it receives? Why or why not?
3. Modify the `UserProfile` component to also accept and display an `email` prop.

## 3. State Management with `useState` and `useReducer`

State represents data that a component can manage and change over time, leading to re-rendering of the component and its children.

### `useState` Hook
The most common Hook for adding state to functional components. It returns a stateful value and a function to update it.

```jsx
const [stateValue, setStateValue] = useState(initialValue);
```

### `useReducer` Hook
An alternative to `useState` for more complex state logic or when the next state depends on the previous one. It's often preferred when state updates involve multiple sub-values or when the logic is more intricate.

```jsx
const [state, dispatch] = useReducer(reducerFunction, initialState);
```

#### Code Example: `useState` for a Counter

```jsx
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  const increment = () => {
    setCount(count + 1);
  };

  const decrement = () => {
    setCount(prevCount => prevCount - 1); // Using functional update for safety
  };

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>Increment</button>
      <button onClick={decrement}>Decrement</button>
    </div>
  );
}

export default Counter;
```

#### Checklist/Exercise
1. When should you prefer `useReducer` over `useState`?
2. What is the purpose of the `setCount` function returned by `useState`?
3. Implement a component with a `useState` hook that toggles a boolean value (e.g., show/hide an element).

## 4. Essential Hooks

Hooks are functions that let you "hook into" React state and lifecycle features from functional components.

### `useEffect` Hook
Used for performing side effects in functional components, such as data fetching, subscriptions, or manually changing the DOM. It runs after every render by default, but its behavior can be controlled by a dependency array.

```jsx
useEffect(() => {
  // Side effect code here
  return () => {
    // Cleanup code here (optional)
  };
}, [dependency1, dependency2]); // Dependency array
```

### `useContext` Hook
Allows functional components to consume values from the React Context API, avoiding prop drilling.

### `useRef` Hook
Returns a mutable `ref` object whose `.current` property is initialized to the passed argument (`initialValue`). The returned object will persist for the full lifetime of the component. Useful for direct DOM manipulation, or storing mutable values that don't trigger re-renders.

### Custom Hooks
Functions that start with `use` and can call other Hooks. They allow you to extract reusable stateful logic from components.

#### Code Example: `useEffect` for Data Fetching

```jsx
import React, { useState, useEffect } from 'react';

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://jsonplaceholder.typicode.com/users')
      .then(response => response.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      });
  }, []); // Empty dependency array means this effect runs only once after the initial render

  if (loading) return <p>Loading users...</p>;

  return (
    <div>
      <h2>Users:</h2>
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default UserList;
```

#### Checklist/Exercise
1. Explain how the dependency array in `useEffect` influences its execution.
2. When would you use `useRef` instead of `useState`?
3. Design a custom hook `useLocalStorage` that stores and retrieves a value from `localStorage`.

## 5. Conditional Rendering

React allows you to render different elements or components based on certain conditions.

Common methods:
*   `if`/`else` statements
*   Ternary operator (`condition ? true : false`)
*   Logical `&&` operator (`condition && <Component />`)

#### Code Example: Conditional Rendering

```jsx
import React, { useState } from 'react';

function LoginControl() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLoginClick = () => setIsLoggedIn(true);
  const handleLogoutClick = () => setIsLoggedIn(false);

  let button;
  if (isLoggedIn) {
    button = <button onClick={handleLogoutClick}>Logout</button>;
  } else {
    button = <button onClick={handleLoginClick}>Login</button>;
  }

  return (
    <div>
      {isLoggedIn ? <h1>Welcome back!</h1> : <h1>Please log in.</h1>}
      {button}
      {isLoggedIn && <p>You are currently logged in.</p>}
    </div>
  );
}

export default LoginControl;
```

#### Checklist/Exercise
1. Describe a scenario where the logical `&&` operator is a concise choice for conditional rendering.
2. How would you conditionally render an entire component based on a user's role (e.g., `AdminDashboard` vs. `UserDashboard`)?
3. Create a component that displays a "Loading..." message if a `isLoading` prop is true, otherwise shows "Data Loaded!".

## 6. List Rendering

To display a collection of items, you typically use JavaScript's `map()` array method to transform an array of data into an array of React elements. Each item in the list must have a unique `key` prop.

The `key` prop helps React identify which items have changed, are added, or are removed, improving performance and avoiding issues with component state.

#### Code Example: List Rendering

```jsx
import React from 'react';

function TodoList() {
  const todos = [
    { id: 1, text: 'Learn React' },
    { id: 2, text: 'Build a project' },
    { id: 3, text: 'Deploy to Netlify' },
  ];

  return (
    <div>
      <h2>My Todos</h2>
      <ul>
        {todos.map(todo => (
          <li key={todo.id}>
            {todo.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TodoList;
```

#### Checklist/Exercise
1. Why is the `key` prop important when rendering lists in React?
2. What happens if you omit the `key` prop or use an array index as a key when the list items can be reordered or filtered?
3. Render a list of user names from an array, ensuring each list item has a unique key.

## 7. React Router for Declarative Navigation

React Router is a popular library for adding declarative routing to React applications. It allows you to build single-page applications with multiple views that can be navigated using URLs.

Key components:
*   `BrowserRouter`: Wraps your entire application to enable routing.
*   `Routes`: A container for defining individual `Route` components.
*   `Route`: Maps a URL path to a specific component.
*   `Link`: Used for navigation between routes without full page reloads.

#### Code Example: Simple React Router Setup (React Router v6+)

First, install it: `npm install react-router-dom`

```jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

function Home() { return <h2>Home Page</h2>; }
function About() { return <h2>About Us</h2>; }
function Contact() { return <h2>Contact Page</h2>; }

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Home</Link> | {' '}
        <Link to="/about">About</Link> | {' '}
        <Link to="/contact">Contact</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

#### Checklist/Exercise
1. What is the primary benefit of using a library like React Router in a Single-Page Application?
2. Explain the difference between `<Link to="/path">` and `<a href="/path">` in a React application using React Router.
3. Add a new route `/dashboard` and a corresponding `Dashboard` component to the example above.

## 8. Context API for Global State

The Context API provides a way to pass data deeply through the component tree without having to manually pass props down at every level (prop drilling). It's suitable for "global" data like authenticated user, theme, or language settings.

Steps:
1.  `createContext`: Create a Context object.
2.  `Provider`: A component that supplies the context value to its children.
3.  `useContext`: A Hook in functional components to consume the context value.

#### Code Example: Basic Context API Setup

```jsx
import React, { createContext, useContext, useState } from 'react';

// 1. Create a Context
const ThemeContext = createContext(null);

// Theme Provider Component
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Component consuming the theme
function ThemeButton() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  return (
    <button onClick={toggleTheme} style={{ background: theme === 'dark' ? '#333' : '#eee', color: theme === 'dark' ? '#eee' : '#333' }}>
      Current Theme: {theme}
    </button>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ThemeButton />
      <p>This text will change style based on theme in a real app.</p>
    </ThemeProvider>
  );
}

export default App;
```

#### Checklist/Exercise
1. What problem does the Context API solve, and what is "prop drilling"?
2. When might you choose Context API over a more robust state management library like Redux?
3. Modify the example to also store and display a `userName` in the context.

## 9. PropTypes for Type Checking

While JavaScript is dynamically typed, `PropTypes` provide a way to define the expected types for props passed to components. This helps catch bugs early by issuing warnings in the console during development if props don't match the specified types.

First, install: `npm install prop-types`

#### Code Example: Using PropTypes

```jsx
import React from 'react';
import PropTypes from 'prop-types';

function Greeting({ name, age, isStudent }) {
  return (
    <div>
      <p>Hello, {name}!</p>
      <p>You are {age} years old.</p>
      {isStudent && <p>You are a student.</p>}
    </div>
  );
}

// Define PropTypes for the Greeting component
Greeting.propTypes = {
  name: PropTypes.string.isRequired, // 'name' must be a string and is required
  age: PropTypes.number,           // 'age' must be a number (optional)
  isStudent: PropTypes.bool       // 'isStudent' must be a boolean (optional)
};

// Default props values (optional)
Greeting.defaultProps = {
  age: 20,
  isStudent: false
};

export default Greeting;
```

#### Checklist/Exercise
1. Why is type checking with PropTypes beneficial in React development?
2. What does `PropTypes.string.isRequired` signify?
3. Add `PropTypes` to your `UserProfile` component created earlier, ensuring `name` is a required string and `age` is a required number.

This guide provides a solid foundation for understanding Core React.js and building component-based UIs. Practice these concepts to solidify your knowledge!