# Advanced React: Performance & Custom Hooks

This guide will cover essential techniques for optimizing React application performance and creating reusable logic with custom hooks and error boundaries. Mastering these concepts is crucial for building robust and efficient frontend applications.

## 1. Introduction to React Performance Optimization

Optimizing React applications means ensuring they render efficiently and provide a smooth user experience. Common performance issues arise from unnecessary re-renders of components, leading to wasted computation and slower UIs. React provides several tools to help us control and prevent these re-renders.

## 2. Optimizing Component Re-renders with `React.memo`

-   **What it is:** `React.memo` is a Higher-Order Component (HOC) that wraps a functional component. It memoizes the component's rendered output, meaning it can reuse the last rendered result instead of re-rendering if its props haven't changed.
-   **How it works:** By default, `React.memo` performs a shallow comparison of the component's props. If the new props are shallowly equal to the old props, React skips rendering the component and reuses the last rendered result.
-   **When to use it:** Use `React.memo` for pure functional components that frequently re-render with the same props. It's particularly useful for components that receive many props or perform expensive calculations in their render method.
-   **Caveats:** The shallow comparison itself has a cost. If props change frequently, or if the component is very simple, the overhead of `React.memo` might outweigh the benefits. Be mindful of object and array props, as shallow comparison will see them as different if their reference changes, even if their contents are the same.

```jsx
import React from 'react';

// A functional component that will log every time it re-renders
const DisplayMessage = ({ message, count }) => {
  console.log('DisplayMessage component re-rendered');
  return (
    <div>
      <p>{message}</p>
      <p>Count: {count}</p>
    </div>
  );
};

// Wrap the component with React.memo to prevent unnecessary re-renders
export default React.memo(DisplayMessage);

// Usage in parent component:
/*
import React, { useState } from 'react';
import MemoizedDisplayMessage from './DisplayMessage';

function App() {
  const [value, setValue] = useState('');
  const [fixedCount, setFixedCount] = useState(0);

  return (
    <div>
      <input type="text" value={value} onChange={(e) => setValue(e.target.value)} />
      <button onClick={() => setFixedCount(fixedCount + 1)}>Increment Fixed Count</button>
      
      {/!* DisplayMessage will only re-render if its 'message' or 'count' props change *!/}
      <MemoizedDisplayMessage message="Hello, React!" count={fixedCount} />
      
      {/!* This will cause App to re-render, but MemoizedDisplayMessage won't if its props are unchanged *!/}
      <p>Input Value: {value}</p>
    </div>
  );
}
*/
```

## 3. Memoizing Functions with `useCallback`

-   **What it is:** `useCallback` is a React Hook that returns a memoized version of a callback function. This means the function's reference will only change if one of its dependencies changes.
-   **How it works:** When a component re-renders, JavaScript functions are recreated. If you pass a function as a prop to a `React.memo` child component, that child component will re-render even if its other props haven't changed because the function prop's reference has changed. `useCallback` prevents this by returning the same function instance across renders, as long as its dependencies remain unchanged.
-   **When to use it:**
    -   When passing callback functions as props to `React.memo` child components to prevent their unnecessary re-renders.
    -   When a function is a dependency in other Hooks like `useEffect`, `useMemo`, or other `useCallback` hooks, to prevent infinite loops or unintended re-executions.

```jsx
import React, { useState, useCallback } from 'react';

const MyButton = React.memo(({ onClick, children }) => {
  console.log(`Button "${children}" re-rendered`);
  return <button onClick={onClick}>{children}</button>;
});

function App() {
  const [countA, setCountA] = useState(0);
  const [countB, setCountB] = useState(0);

  // This function reference will not change across renders because it uses an empty dependency array
  // and the functional update form of `setCountA`.
  const incrementA = useCallback(() => {
    setCountA(prevCount => prevCount + 1);
  }, []); // Empty dependency array: this function instance is stable

  // This function reference WILL change across renders if `countB` changes, 
  // as `countB` is a dependency and is used directly in the function body.
  const incrementB = useCallback(() => {
    setCountB(countB + 1);
  }, [countB]); // Dependency array includes countB: function re-created if countB changes

  return (
    <div>
      <p>Count A: {countA}</p>
      <MyButton onClick={incrementA}>Increment A (stable callback)</MyButton>
      
      <p>Count B: {countB}</p>
      <MyButton onClick={incrementB}>Increment B (callback changes)</MyButton>

      {/* This button will cause App to re-render, affecting all children not memoized *!/}
      <button onClick={() => setCountA(countA + 1)}>Normal Increment A (unstable callback in parent)</button>
    </div>
  );
}
```

## 4. Memoizing Values with `useMemo`

-   **What it is:** `useMemo` is a React Hook that returns a memoized value.
-   **How it works:** It only recomputes the memoized value when one of its dependencies has changed. This prevents expensive computations from running on every render if their inputs haven't changed.
-   **When to use it:** For calculations that are computationally expensive and whose result doesn't need to be recalculated unless their inputs (dependencies) change.
-   **Caveats:** Use judiciously. `useMemo` itself has a small overhead. For simple calculations, the cost of memoization might outweigh the benefits. Only use it for truly expensive computations.

```jsx
import React, { useState, useMemo } from 'react';

function App() {
  const [number, setNumber] = useState(0);
  const [toggle, setToggle] = useState(false);

  // An example of an expensive calculation
  const expensiveCalculation = (num) => {
    console.log('Performing expensive calculation...');
    for (let i = 0; i < 1000000000; i++) {
      num += 1;
    }
    return num;
  };

  // Memoize the result of the expensive calculation.
  // It will only re-run `expensiveCalculation` if the `number` state changes.
  // If `toggle` changes, `App` re-renders, but `memoizedValue` is not re-computed.
  const memoizedValue = useMemo(() => expensiveCalculation(number), [number]);

  return (
    <div>
      <input
        type="number"
        value={number}
        onChange={(e) => setNumber(parseInt(e.target.value))}
      />
      <p>Calculated Value: {memoizedValue}</p>
      
      <button onClick={() => setToggle(!toggle)}>Toggle Rerender</button>
      <p>Toggle State: {toggle ? 'On' : 'Off'}</p>
    </div>
  );
}
```

## 5. Creating Reusable Logic with Custom Hooks

-   **What are Custom Hooks?** Custom Hooks are JavaScript functions whose names start with the word "use" (e.g., `useMyHook`) and that can call other Hooks (like `useState`, `useEffect`, `useCallback`, `useMemo`). They allow you to extract component logic into reusable functions.
-   **Benefits:**
    -   **Reusability:** Share stateful logic across multiple components without prop drilling, render props, or higher-order components.
    -   **Readability:** Keep components cleaner and more focused on their UI responsibilities by abstracting complex logic into custom hooks.
    -   **Separation of Concerns:** Better organize your code by separating logic related to a specific feature or behavior.
-   **How to create:**
    1.  Define a regular JavaScript function. Its name **must** start with `use` (e.g., `useToggle`, `useFetchData`).
    2.  Inside the function, you can use any other React Hooks (`useState`, `useEffect`, etc.).
    3.  The custom hook can return any values (state, functions, objects) that your component needs.

### Example: `useToggle` Custom Hook

```jsx
// useToggle.js - Define your custom hook in a separate file
import { useState, useCallback } from 'react';

function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);

  // Use useCallback to ensure the `toggle` function reference is stable
  const toggle = useCallback(() => {
    setValue(prevValue => !prevValue);
  }, []); // Empty dependency array because setValue is stable

  return [value, toggle]; // Return the state and the toggler function
}

export default useToggle;

// App.js - Use the custom hook in a functional component
import React from 'react';
import useToggle from './useToggle'; // Import your custom hook

function App() {
  // Use the custom hook as if it were a built-in hook
  const [isDarkMode, toggleDarkMode] = useToggle(false);
  const [showDetails, toggleDetails] = useToggle(true);

  return (
    <div>
      <h1>Custom Hooks Example</h1>
      <p>Dark Mode: {isDarkMode ? 'On' : 'Off'}</p>
      <button onClick={toggleDarkMode}>Toggle Dark Mode</button>

      <p>Show Details: {showDetails ? 'Yes' : 'No'}</p>
      <button onClick={toggleDetails}>Toggle Details</button>

      {showDetails && <p>These are some hidden details that are now visible!</p>}
    </div>
  );
}
```

## 6. Implementing Error Boundaries

-   **What are Error Boundaries?** Error boundaries are React components that catch JavaScript errors anywhere in their child component tree, log those errors, and display a fallback UI instead of allowing the entire application to crash. They prevent a single error from bringing down the whole user interface.
-   **Limitations:** Error boundaries only catch errors in the render phase, lifecycle methods, and constructors of the tree below them. They do *not* catch errors in:
    -   Event handlers (e.g., `onClick`, `onChange`)
    -   Asynchronous code (e.g., `setTimeout`, `requestAnimationFrame`, `Promise` callbacks)
    -   Server-side rendering
    -   Errors thrown in the error boundary component itself
-   **How to implement:** Error boundaries are class components that implement either (or both) of the lifecycle methods `static getDerivedStateFromError()` or `componentDidCatch()`.
    -   `static getDerivedStateFromError(error)`: Used to update state and render a fallback UI after an error has been thrown.
    -   `componentDidCatch(error, errorInfo)`: Used for side effects like logging the error information to an error reporting service.

```jsx
// ErrorBoundary.js
import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  // This lifecycle method is called after an error is thrown by a descendant component.
  // It receives the error as a parameter and should return a value to update state.
  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  // This lifecycle method is called after an error is thrown.
  // It receives the error object and an object with `componentStack` information.
  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service here
    console.error("Uncaught error detected by Error Boundary:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div style={{
          padding: '20px',
          border: '1px solid red',
          backgroundColor: '#ffebeb',
          color: '#d8000c',
          borderRadius: '5px'
        }}>
          <h2>Oops! Something went wrong.</h2>
          <p>We're sorry for the inconvenience. Please try again later.</p>
          <details style={{ whiteSpace: 'pre-wrap', marginTop: '10px', fontSize: '0.8em' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }

    return this.props.children; // Render children normally if no error
  }
}

export default ErrorBoundary;

// BuggyComponent.js - A component designed to throw an error
import React from 'react';

function BuggyComponent() {
  // Simulate an error during render
  throw new Error('I am a buggy component and I crashed!');
}

export default BuggyComponent;

// App.js - Using the ErrorBoundary
import React from 'react';
import ErrorBoundary from './ErrorBoundary';
import BuggyComponent from './BuggyComponent';

function App() {
  return (
    <div>
      <h1>Error Boundary Demo</h1>
      <p>This content is outside the error boundary and will render normally.</p>
      
      <ErrorBoundary>
        {/* Any error thrown by BuggyComponent will be caught by ErrorBoundary */}
        <BuggyComponent />
      </ErrorBoundary>

      <p>This content is also outside the error boundary. The application did not crash!</p>
      
      {/* If BuggyComponent were rendered here directly without an ErrorBoundary parent, 
          the entire application would crash. */}
    </div>
  );
}
```

## 7. Quick Checklist/Exercise

1.  **Explain the core difference between `useCallback` and `useMemo`.** When would you use one over the other to optimize a React application?
2.  **You have a complex data fetching and processing logic in a component that needs to be used in three different components.** Describe how you would refactor this logic to make it reusable across these components, adhering to React's best practices.
3.  **A component deep in your UI tree occasionally crashes due to an unexpected data format received from an API.** What React feature would you implement around this component to prevent the entire application from failing and provide a graceful user experience?