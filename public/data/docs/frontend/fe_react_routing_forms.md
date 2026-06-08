# React Routing & Form Handling

This study guide covers the essential aspects of client-side routing using React Router DOM and efficient form handling with controlled components and basic client-side validation in React applications.

## 1. Client-Side Routing with React Router DOM

Client-side routing allows your single-page application (SPA) to navigate between different views without full page reloads, providing a smoother user experience. React Router DOM is the standard library for this in React.

### Core Concepts & Components

*   **`BrowserRouter`**: This component uses the HTML5 history API (pushState, replaceState, and the popstate event) to keep your UI in sync with the URL. It's typically wrapped around your entire application or the part where routing is needed.
*   **`Routes`**: A container for a set of individual `<Route>` components. When the URL changes, `Routes` looks through all its child `Route` elements to find the best match and renders that branch of the UI.
*   **`Route`**: Renders UI when its `path` matches the current URL. It takes `path` and `element` props.
    *   `path`: The URL path to match (e.g., `/home`, `/users/:id`).
    *   `element`: The React component to render when the path matches.
*   **`Link`**: Used for declarative navigation within your application. It renders an accessible anchor tag (`<a>`) with the correct `href` and prevents a full page reload.
    *   `to`: The path to navigate to.
*   **`useNavigate`**: A hook that provides a function to programmatically navigate. Useful for redirects after form submission or button clicks.
    *   `const navigate = useNavigate();`
    *   `navigate('/dashboard');`
    *   `navigate(-1);` (go back one step in history).
*   **`useParams`**: A hook that lets you access URL parameters (dynamic segments) defined in your route path (e.g., `id` in `/users/:id`).
    *   `const { id } = useParams();`

### Basic Routing Example

First, install React Router DOM:

```bash
npm install react-router-dom
# or
yarn add react-router-dom
```

```jsx
// App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';

const Home = () => <h2>Home Page</h2>;
const About = () => <h2>About Us</h2>;
const Contact = () => <h2>Contact Info</h2>;

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const goToDashboard = () => {
    navigate('/dashboard'); // Programmatic navigation
  };

  return (
    <div>
      <h2>User Profile for ID: {userId}</h2>
      <button onClick={goToDashboard}>Go to Dashboard</button>
    </div>
  );
};

const Dashboard = () => <h2>Dashboard</h2>;

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Home</Link> | 
        <Link to="/about">About</Link> | 
        <Link to="/contact">Contact</Link> | 
        <Link to="/users/123">User 123</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/users/:userId" element={<UserProfile />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* Catch-all route for 404 Not Found */}
        <Route path="*" element={<h2>404 Not Found</h2>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

## 2. Form Handling with Controlled Components

In React, controlled components are the recommended way to handle forms. An input form element whose `value` is controlled by React state is called a controlled component. This means React's state is the 