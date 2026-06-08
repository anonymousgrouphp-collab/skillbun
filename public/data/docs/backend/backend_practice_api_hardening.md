## Practice: API Hardening Drill

API hardening is the process of strengthening your API's defenses against attacks and ensuring its reliability, performance, and maintainability in production. This drill focuses on applying robust security and reliability principles to an existing API.

### 1. Robust Input Validation
Input validation is paramount for preventing security vulnerabilities like injection attacks, data corruption, and application crashes. It ensures that incoming data conforms to expected formats, types, and constraints.

#### Core Concepts:
*   **Schema Validation:** Define strict schemas for all API inputs (path parameters, query parameters, request bodies).
*   **Data Type & Format Checks:** Validate data types (string, number, boolean), lengths, and specific formats (email, URL, UUID, date).
*   **Range & Enumeration Checks:** Ensure numerical values are within an acceptable range or string values are from a predefined list.
*   **Sanitization:** Cleanse or escape user input to neutralize potentially harmful characters, especially before storing or displaying it.

#### Example (Node.js with Joi):
```javascript
const Joi = require('joi');

const userSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required()
});

const validateUserInput = (req, res, next) => {
  const { error } = userSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

// Apply as middleware to your route
// app.post('/users', validateUserInput, createUser);
```

### 2. Pagination
Pagination is essential for handling large datasets efficiently, preventing performance bottlenecks, and improving user experience by returning manageable chunks of data.

#### Core Concepts:
*   **Offset-based Pagination:** Uses `limit` (number of items per page) and `offset` (number of items to skip) parameters. Simple to implement but can be inefficient for very large offsets.
*   **Cursor-based Pagination:** Uses a unique, immutable cursor (often an ID or timestamp) to mark the starting point for the next page. More efficient for large datasets and better for real-time feeds.

#### Example (Conceptual Offset-based):
```sql
SELECT * FROM products
ORDER BY id
LIMIT 10 OFFSET 20; -- Get items 21-30
```

### 3. Rate Limiting
Rate limiting controls the number of requests a user or client can make to an API within a specific timeframe. This prevents abuse, protects against DoS attacks, and ensures fair usage for all clients.

#### Core Concepts:
*   **Fixed Window:** Allows a certain number of requests within a fixed time window (e.g., 100 requests per hour).
*   **Sliding Window:** A more flexible approach that tracks requests in a moving window, providing smoother rate limiting.
*   **Token Bucket:** A theoretical bucket fills with tokens at a constant rate. Each request consumes a token, and requests are denied if the bucket is empty.

#### Example (Conceptual Middleware):
```javascript
// Using a library like 'express-rate-limit'
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
  headers: true // Include X-RateLimit-* headers
});

// Apply to all requests or specific routes
// app.use(apiLimiter);
// app.get('/protected', apiLimiter, (req, res) => { /* ... */ });
```

### 4. Advanced Error Handling
Consistent, centralized, and informative error handling is critical for API reliability and developer experience. It involves catching errors, logging them, and returning standardized, non-sensitive responses.

#### Core Concepts:
*   **Centralized Error Middleware:** A single point in your application to catch and process all errors.
*   **Custom Error Types:** Define specific error classes for common scenarios (e.g., `NotFoundError`, `ValidationError`, `AuthenticationError`).
*   **Consistent Error Responses:** Standardize the structure of error payloads (e.g., `{ "status": "error", "message": "User not found", "code": 404 }`).
*   **Avoid Leaking Sensitive Information:** Never expose stack traces or internal error details to clients in production.

#### Example (Express Error Middleware):
```javascript
// Catch-all error handler middleware
app.use((err, req, res, next) => {
  console.error(err); // Log the error internally

  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Something went wrong!';

  res.status(statusCode).json({
    status: 'error',
    message: message
    // Do NOT send stack trace or internal details in production
  });
});
```

### 5. Comprehensive Structured Logging
Structured logging makes it easier to monitor, debug, and audit your API. Logs should be machine-readable (e.g., JSON) and contain contextual information.

#### Core Concepts:
*   **Log Levels:** Use appropriate levels (e.g., `info`, `warn`, `error`, `debug`) to categorize messages.
*   **Contextual Information:** Include details like request ID, user ID, endpoint, timestamp, response status, duration, and environment.
*   **Sensitive Data Redaction:** Ensure no sensitive information (passwords, PII, API keys) is logged.
*   **External Logging Services:** Integrate with services like ELK Stack, Splunk, Datadog for centralized log management and analysis.

#### Example (Conceptual JSON Log):
```json
{
  "timestamp": "2023-10-27T10:30:00Z",
  "level": "info",
  "service": "user-service",
  "requestId": "a1b2c3d4e5",
  "method": "GET",
  "path": "/users/123",
  "status": 200,
  "durationMs": 45,
  "message": "User data fetched successfully"
}
```

### 6. Robust Authentication and Authorization Checks
Authentication verifies who the user is, while authorization determines what they are allowed to do. Both are critical for securing API resources.

#### Core Concepts:
*   **Authentication (AuthN):**
    *   **API Keys:** Simple for machine-to-machine, less secure for users.
    *   **JWT (JSON Web Tokens):** Stateless, commonly used for user authentication. Requires secure handling and validation.
    *   **OAuth 2.0:** Delegation protocol for third-party access.
*   **Authorization (AuthZ):**
    *   **Role-Based Access Control (RBAC):** Assign roles (e.g., `admin`, `user`) with predefined permissions.
    *   **Attribute-Based Access Control (ABAC):** More granular, uses attributes of the user, resource, and environment to make access decisions.

#### Example (Conceptual JWT Middleware):
```javascript
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user info to request
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

const authorize = (roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
};

// app.get('/admin-data', verifyToken, authorize(['admin']), getAdminData);
```

### 7. Preparing for Production Deployment
Beyond core functionality, a production-ready API requires attention to operational aspects and environment-specific configurations.

#### Core Concepts:
*   **Environment Variables:** Use environment variables for sensitive data (database credentials, API keys) and configuration (port numbers, logging levels).
*   **Security Headers:** Implement HTTP security headers (e.g., `Content-Security-Policy`, `X-Content-Type-Options`, `Strict-Transport-Security`) to protect against common web vulnerabilities.
*   **Performance Monitoring:** Integrate tools for monitoring API response times, error rates, and resource utilization.
*   **Containerization & Orchestration:** Use Docker for consistent environments and Kubernetes for scalable deployment.
*   **CI/CD Pipelines:** Automate testing, building, and deployment processes.
*   **Health Checks:** Expose a simple endpoint (e.g., `/health`) to allow load balancers and orchestrators to check API availability.

#### Example (Security Headers with Helmet for Express):
```javascript
const express = require('express');
const helmet = require('helmet');
const app = express();

app.use(helmet()); // Sets various HTTP headers for security

// You can customize headers if needed
// app.use(helmet.contentSecurityPolicy({ directives: { ... } }));
```

---

### Checklist/Exercise:
1.  **Input Validation & Error Handling:** Choose an existing API endpoint (e.g., a user registration or product update endpoint). Refactor it to include comprehensive input validation using a schema-based approach and integrate it with an advanced, centralized error handling mechanism that returns standardized, non-sensitive error responses.
2.  **Rate Limiting Implementation:** Apply rate limiting to a critical or resource-intensive API route (e.g., a search endpoint or login endpoint). Configure it to allow a reasonable number of requests per minute per IP address, and ensure proper `429 Too Many Requests` responses with `X-RateLimit-*` headers are returned when limits are exceeded.
3.  **Structured Logging Integration:** Enhance your API's logging capabilities by implementing structured logging for all incoming requests and outgoing responses. Ensure logs capture essential metadata (timestamp, request ID, method, path, status code, duration) in JSON format without exposing any sensitive user or system information.
