# Express.js: Minimalist Web Framework

Express.js is a fast, unopinionated, minimalist web framework for Node.js. It simplifies the process of building robust APIs and web applications by providing a thin layer of fundamental web application features, without obscuring Node.js features.

## 1. Introduction to Express.js

Express.js is the de-facto standard framework for building server-side applications with Node.js. It provides:
*   **Routing:** Handling different HTTP methods and URLs.
*   **Middleware:** Functions that have access to the request object (`req`), the response object (`res`), and the next middleware function in the application’s request-response cycle.
*   **Templating:** Integration with various templating engines for dynamic content (though often used for APIs without templates).
*   **High Performance:** Built on Node.js's non-blocking I/O model.

**Why use Express.js?**
It offers a robust set of features for web and mobile applications, is highly performant, scalable, and has a vast community and ecosystem.

## 2. Getting Started: Setting Up an Express Project

To begin, you need Node.js and npm (Node Package Manager) installed.

1.  **Initialize your project:**
    ```bash
npm init -y
    ```
2.  **Install Express.js:**
    ```bash
npm install express
    ```
3.  **Create your main application file** (e.g., `app.js` or `server.js`):
    ```javascript
// app.js
const express = require('express');
const app = express();
const port = 3000;

// Define a simple route
app.get('/', (req, res) => {
  res.send('Hello from Express!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
    ```
4.  **Run your application:**
    ```bash
node app.js
    ```
    Visit `http://localhost:3000` in your browser.

## 3. Core Concepts

### 3.1. Routing

Routing refers to how an application responds to a client request to a particular endpoint, which is a URI (or path) and a specific HTTP request method (GET, POST, PUT, DELETE, etc.).

```javascript
// GET request to the root URL
app.get('/', (req, res) => {
  res.send('Welcome to the homepage!');
});

// POST request to /users
app.post('/users', (req, res) => {
  res.status(201).send('User created');
});

// Route parameters for dynamic data
app.get('/users/:id', (req, res) => {
  const userId = req.params.id;
  res.send(`Fetching user with ID: ${userId}`);
});

// Chained route handlers
app.route('/books')
  .get((req, res) => {
    res.send('Get a random book');
  })
  .post((req, res) => {
    res.send('Add a book');
  });
```

### 3.2. Middleware

Middleware functions are functions that execute during the request-response cycle. They can:
*   Execute any code.
*   Make changes to the request and the response objects.
*   End the request-response cycle.
*   Call the next middleware function in the stack.

Middleware functions are typically used for tasks like logging, authentication, parsing request bodies, etc.

```javascript
// Custom logger middleware
const logger = (req, res, next) => {
  console.log(`${req.method} ${req.url} at ${new Date().toISOString()}`);
  next(); // Pass control to the next middleware/route handler
};

// Apply middleware globally
app.use(logger);

// Apply middleware to a specific route
app.get('/admin', logger, (req, res) => {
  res.send('Admin dashboard');
});

// Built-in middleware for static files
app.use(express.static('public')); // Serves static files from 'public' directory

// Built-in middleware for JSON body parsing (requires Express 4.16.0+)
app.use(express.json()); 

// Example of using parsed body in a POST route
app.post('/items', (req, res) => {
  console.log('Request body:', req.body);
  res.status(201).json({ message: 'Item received', data: req.body });
});
```

### 3.3. Request (`req`) and Response (`res`) Objects

*   **`req` (Request Object):** Contains information about the HTTP request, such as `req.params` (route parameters), `req.query` (query string parameters), `req.body` (parsed request body for POST/PUT), `req.headers`, `req.method`, `req.url`, etc.
*   **`res` (Response Object):** Used to send a response back to the client. Common methods include `res.send()`, `res.json()`, `res.status()`, `res.redirect()`, `res.render()`, etc.

### 3.4. Error Handling

Express comes with a default error handler, but you can define custom error-handling middleware. Error-handling middleware functions have four arguments: `(err, req, res, next)`.

```javascript
// Example: Route that might throw an error
app.get('/broken', (req, res, next) => {
  try {
    throw new Error('Something went wrong!');
  } catch (error) {
    next(error); // Pass the error to the error-handling middleware
  }
});

// Custom error-handling middleware (must be the last middleware loaded)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
```

## 4. Integrating with Database Drivers (Conceptual)

Express itself does not dictate any particular database. You integrate with databases by installing their respective Node.js drivers or ORMs (Object-Relational Mappers) and using them within your Express route handlers or services.

Common choices include:
*   **MongoDB:** Using `mongoose` ODM.
*   **PostgreSQL:** Using `pg` client or `sequelize` ORM.
*   **MySQL:** Using `mysql2` client or `sequelize` ORM.

**Conceptual Example:**

```javascript
// Assuming 'db' is a connected database client instance
app.get('/products', async (req, res, next) => {
  try {
    const products = await db.collection('products').find({}).toArray(); // MongoDB example
    // const products = await db.query('SELECT * FROM products'); // SQL example
    res.json(products);
  } catch (error) {
    next(error); // Pass database errors to the error handler
  }
});
```

## Quick Checklist / Exercises

1.  **Create a simple Express application** that listens on port `5000` and has a `GET /hello` route that responds with `{"message": "Hello, SkillBunner!"}`.
2.  **Implement a custom middleware** that logs the current timestamp for every incoming request to the console, and apply it globally to your Express application.
3.  **Add a `POST /data` route** that expects a JSON body (e.g., `{"name": "test"}`). Use `express.json()` middleware to parse the body and respond with `201 Created` and the received JSON data.