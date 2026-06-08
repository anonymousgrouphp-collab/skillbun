# Node.js Backend Development: Study Guide

Welcome to the exciting world of Node.js backend development! This guide will help you understand the core concepts and get started with building scalable and high-performance applications using JavaScript/TypeScript.

## 1. Introduction to Node.js

Node.js is an open-source, cross-platform JavaScript runtime environment that allows developers to execute JavaScript code outside a web browser. Built on Chrome's V8 JavaScript engine, Node.js excels at building fast, scalable network applications, often used for backend APIs, microservices, and real-time applications.

**Key Characteristics:**
*   **Event-driven:** Node.js uses an event-driven architecture, where events trigger functions.
*   **Non-blocking I/O:** It handles multiple operations concurrently without waiting for any single operation to complete, making it highly efficient.
*   **Single-threaded:** Node.js uses a single thread for execution, leveraging the event loop for concurrency.

## 2. Key Features and Concepts

### 2.1 The Event Loop

The Node.js event loop is a core concept that enables non-blocking I/O operations. It continuously monitors for new events (e.g., incoming requests, file I/O completion) and dispatches them to their respective callback functions. This mechanism allows Node.js to handle a large number of concurrent connections efficiently without creating a new thread for each request.

### 2.2 NPM: Node Package Manager

NPM is the default package manager for Node.js. It's used to install, share, and manage project dependencies. Think of it as a vast registry of open-source packages that you can easily integrate into your projects.

**Common NPM Commands:**
*   `npm init`: Initializes a new Node.js project and creates a `package.json` file.
*   `npm install <package-name>`: Installs a specific package.
*   `npm install`: Installs all dependencies listed in `package.json`.
*   `npm start`: Runs the script defined as "start" in `package.json`.

### 2.3 Modules: CommonJS vs. ES Modules

Node.js supports two primary module systems for organizing and reusing code:

*   **CommonJS (CJS):** The traditional module system in Node.js.
    ```javascript
    // myModule.js
    function greet(name) {
      return `Hello, ${name}!`;
    }
    module.exports = greet;

    // app.js
    const greet = require('./myModule');
    console.log(greet('World')); // Output: Hello, World!
    ```
*   **ES Modules (ESM):** The standard module system for JavaScript, increasingly supported in Node.js.
    ```javascript
    // myModule.mjs (or .js with "type": "module" in package.json)
    export function greet(name) {
      return `Hello, ${name}!`;
    }

    // app.mjs (or .js with "type": "module")
    import { greet } from './myModule.mjs';
    console.log(greet('Node.js')); // Output: Hello, Node.js!
    ```

## 3. Getting Started with Express.js

Express.js is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications. It simplifies the process of building robust APIs and web servers.

### 3.1 Installation

First, create a new project and install Express:
```bash
mkdir my-express-app
cd my-express-app
npm init -y
npm install express
```

### 3.2 Basic Server Setup

Create an `app.js` file:
```javascript
const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello from Express!');
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
```
Run with `node app.js`.

### 3.3 Routing

Routing defines how an application responds to a client request to a particular endpoint, which is a URI (or path) and a specific HTTP request method (GET, POST, PUT, DELETE, etc.).

```javascript
// ... (previous setup)

app.get('/api/users', (req, res) => {
  res.json([{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]);
});

app.post('/api/users', (req, res) => {
  // Assume req.body contains user data (requires body-parser middleware)
  res.status(201).send('User created');
});

// Route with URL parameters
app.get('/api/users/:id', (req, res) => {
  const userId = req.params.id;
  res.send(`User ID: ${userId}`);
});

// ... (listen setup)
```

### 3.4 Middleware

Middleware functions are functions that have access to the request object (`req`), the response object (`res`), and the next middleware function in the application’s request-response cycle. They can execute code, make changes to the request and response objects, end the request-response cycle, or call the next middleware function.

```javascript
const express = require('express');
const app = express();

// A simple custom logger middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} at ${new Date().toISOString()}`);
  next(); // Pass control to the next middleware/route handler
});

// Built-in middleware for parsing JSON bodies
app.use(express.json());

app.post('/data', (req, res) => {
  console.log('Received data:', req.body);
  res.json({ message: 'Data received!', data: req.body });
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

## 4. Asynchronous Programming in Node.js

Given Node.js's non-blocking nature, mastering asynchronous programming is crucial.

*   **Callbacks:** Functions passed as arguments to other functions, to be executed after the parent function completes an operation. Can lead to "callback hell" for complex asynchronous flows.
    ```javascript
    // Simulating an async operation
    function fetchData(callback) {
      setTimeout(() => {
        callback(null, "Data fetched successfully!");
      }, 1000);
    }
    fetchData((err, data) => {
      if (err) console.error(err);
      console.log(data); // Output after 1 second: Data fetched successfully!
    });
    ```
*   **Promises:** Objects representing the eventual completion or failure of an asynchronous operation. They provide a cleaner way to handle async code than callbacks.
    ```javascript
    function fetchDataPromise() {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          // resolve("Data fetched successfully with Promise!");
          reject("Error fetching data!");
        }, 1000);
      });
    }
    fetchDataPromise()
      .then(data => console.log(data))
      .catch(error => console.error(error)); // Output: Error fetching data!
    ```
*   **Async/Await:** Syntactic sugar built on top of Promises, making asynchronous code look and behave more like synchronous code. It's the preferred method for modern async operations.
    ```javascript
    async function getMyData() {
      try {
        const data = await fetchDataPromise();
        console.log(data);
      } catch (error) {
        console.error("Caught error with async/await:", error);
      }
    }
    getMyData(); // Output: Caught error with async/await: Error fetching data!
    ```

## Quick Checklist/Exercise

1.  **Explain the core purpose of Node.js** and how its non-blocking I/O model contributes to its performance for backend applications.
2.  **Differentiate between `require()` and `import`** for module management in Node.js. When would you use each?
3.  **Write a simple Express.js application** that listens on port 4000 and has two routes:
    *   `/`: Returns "Welcome to the API!"
    *   `/hello/:name`: Returns "Hello, [name]!" (where `[name]` is a URL parameter).