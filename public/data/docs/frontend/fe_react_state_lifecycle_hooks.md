## State Management with Hooks (useState, useEffect, useContext)

Welcome to this study guide on State Management with React Hooks! Mastering `useState`, `useEffect`, and `useContext` is fundamental for building robust and maintainable React applications. These hooks provide powerful ways to manage local component state, handle side effects, and simplify global state management without relying on class components or complex third-party libraries for simpler use cases.

---

### 1. `useState`: Managing Local Component State

**Concept:**
`useState` is a React Hook that allows you to add state to functional components. It returns a pair of values: the current state and a function that updates it. When the setter function is called, React re-renders the component with the new state value.

**Syntax:**
```jsx
const [state, setState] = useState(initialState);
```
- `state`: The current value of the state.
- `setState`: A function to update the state. Calling it triggers a re-render.
- `initialState`: The initial value of the state. This can be a primitive value (number, string, boolean) or an object/array. It's only used during the initial render.

**Code Example:**
Let's create a simple counter component.

```jsx
import React, { useState } from 'react';

function Counter() {
  // Declare a state variable called 'count' and a setter 'setCount'
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
      <button onClick={() => setCount(0)}>
        Reset
      </button>
    </div>
  );
}

export default Counter;
```

**Key Takeaways:**
*   `useState` makes functional components stateful.
*   It always returns an array with two elements: current state and an updater function.
*   Updates are asynchronous and batched by React for performance.
*   The initial state is only used on the first render.

---

### 2. `useEffect`: Handling Side Effects

**Concept:**
`useEffect` is a React Hook that lets you perform side effects in functional components. Side effects are operations that interact with the outside world, such as data fetching, subscriptions, manually changing the DOM, timers, or logging. It runs after every render, but you can control when it runs using its dependency array.

**Syntax:**
```jsx
useEffect(() => {
  // Code for side effect
  return () => {
    // Optional cleanup function
  };
}, [dependencies]); // Dependency array
```

-   The first argument is a function that contains your side effect logic.
-   The optional second argument, the `dependencies` array, controls when the effect re-runs:
    *   **No array:** Effect runs after *every* render.
    *   **Empty array (`[]`):** Effect runs only once after the initial render (like `componentDidMount`).
    *   **Array with values (`[propA, stateB]`):** Effect runs on the initial render and whenever any value in the array changes.
-   The effect function can optionally return a cleanup function. This function runs before the component unmounts, and before the effect re-runs due to a dependency change. This is crucial for preventing memory leaks (e.g., unsubscribing, clearing timers).

**Code Example (Data Fetching with Cleanup):**
```jsx
import React, { useState, useEffect } from 'react';

function PostFetcher({ postId }) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Simulate API call
    const fetchPost = async () => {
      try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${postId}`);
        const data = await response.json();
        setPost(data);
      } catch (error) {
        console.error("Failed to fetch post:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();

    // Cleanup function (optional, but good practice for subscriptions, event listeners)
    return () => {
      // Any cleanup here, e.g., aborting fetch requests if using AbortController
      console.log('Cleaning up effect for postId:', postId);
    };
  }, [postId]); // Re-run effect whenever postId changes

  if (loading) return <p>Loading post...</p>;
  if (!post) return <p>No post found.</p>;

  return (
    <div>
      <h3>{post.title}</h3>
      <p>{post.body}</p>
    </div>
  );
}

export default PostFetcher;
```

**Key Takeaways:**
*   `useEffect` manages side effects (API calls, subscriptions, DOM manipulation).
*   The dependency array `[]` controls when the effect re-runs.
*   A cleanup function returned by `useEffect` is vital for preventing memory leaks and resource management.
*   Always include all values used inside the effect (props, state, functions) in the dependency array, unless they are stable functions or values.

---

### 3. `useContext`: Simple Global State Management

**Concept:**
`useContext` is a React Hook that allows you to subscribe to React Context within a functional component. Context provides a way to pass data through the component tree without having to pass props down manually at every level (prop drilling). It's ideal for 