# API Security & Authentication

Welcome to the critical domain of API Security & Authentication. In today's interconnected world, APIs are the backbone of most applications, making their security paramount. This guide will equip you with the knowledge to build robust and secure APIs, protecting sensitive data and maintaining user trust.

## 1. Authentication Mechanisms
Authentication verifies the identity of a user or client attempting to access an API.

### 1.1 JSON Web Tokens (JWT)
JWTs are a compact, URL-safe means of representing claims to be transferred between two parties. They are widely used for stateless authentication.

*   **How it works:** A server generates a JWT upon successful login, signs it with a secret key, and sends it to the client. The client then sends this token with subsequent requests in the `Authorization` header. The server verifies the token's signature to authenticate the request without needing to check a session database.
*   **Components:** Header (algorithm & token type), Payload (claims), Signature (hash of header, payload, and secret).
*   **Benefits:** Stateless, scalable, compact.
*   **Drawbacks:** Tokens cannot be revoked easily (unless implemented with a blacklist), susceptible to XSS if stored insecurely.

### 1.2 OAuth 2.0
OAuth 2.0 is an authorization framework that enables an application to obtain limited access to a user's data on another HTTP service (e.g., Facebook, Google, GitHub). It's about *delegated authorization*, not authentication itself, but it's often used with OpenID Connect for authentication.

*   **Roles:** Resource Owner, Client, Authorization Server, Resource Server.
*   **Flows:** Authorization Code Grant (most common for web apps), Client Credentials Grant (for machine-to-machine), Implicit Grant (deprecated), PKCE (for public clients).
*   **Benefits:** Secure delegation of access, standardizes authorization.
*   **Drawbacks:** Complex to implement correctly.

### 1.3 Session Management
Traditional web authentication where a server creates a session for a user upon login, stores session data (e.g., user ID) on the server, and sends a session ID (often in a cookie) to the client. The client sends this cookie with each request.

*   **Benefits:** Easy to revoke sessions, simpler for single-server setups.
*   **Drawbacks:** Requires server-side storage, less scalable for distributed systems.

### 1.4 API Keys
Simple tokens (often long, random strings) used to identify a calling application. Usually passed in a header (`X-API-Key`) or query parameter.

*   **Use Cases:** Identifying client applications, rate limiting, simple service-to-service communication.
*   **Security:** Should be treated like passwords, rotated regularly, and restricted by IP or domain.

## 2. Authorization Mechanisms
Authorization determines *what* an authenticated user or client is allowed to do.

### 2.1 Role-Based Access Control (RBAC)
Users are assigned roles (e.g., `admin`, `editor`, `viewer`), and permissions are granted to roles. Users inherit permissions from their assigned roles.

*   **Example:** An `admin` role might have permissions to `create`, `read`, `update`, `delete` all resources, while a `viewer` role only has `read` access.
*   **Benefits:** Simple to understand and manage for many applications.
*   **Drawbacks:** Can become complex if many granular permissions are needed.

### 2.2 Attribute-Based Access Control (ABAC)
Access decisions are based on the attributes of the user (e.g., `department`, `location`), the resource (e.g., `data_sensitivity`, `owner`), the action (e.g., `read`, `write`), and the environment (e.g., `time_of_day`, `IP_address`).

*   **Benefits:** Highly granular, flexible, and dynamic.
*   **Drawbacks:** More complex to design and implement.

## 3. Common API Vulnerabilities
Understanding and mitigating these vulnerabilities is crucial for API security.

*   **SQL Injection:** Malicious SQL code injected via input fields, allowing attackers to manipulate or steal database data. **Prevention:** Use parameterized queries or ORMs.
*   **Cross-Site Scripting (XSS):** Attackers inject malicious client-side scripts into web pages viewed by other users. **Prevention:** Input sanitization, output encoding, Content Security Policy (CSP).
*   **Cross-Site Request Forgery (CSRF):** An attacker tricks a victim into submitting a malicious request to an application where they are authenticated. **Prevention:** Anti-CSRF tokens, SameSite cookies, referrer header checks.

## 4. Security Best Practices

### 4.1 Input Validation
Always validate all inputs (query parameters, request bodies, headers) on the server-side to ensure they conform to expected types, lengths, and formats. This prevents many injection attacks and data integrity issues.

### 4.2 Password Hashing (bcrypt)
Never store plain-text passwords. Use strong, one-way cryptographic hashing functions that include salting and are computationally expensive.

```javascript
const bcrypt = require('bcrypt');
const saltRounds = 10; // A higher number increases security but takes more time

async function hashPassword(password) {
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
}

async function comparePassword(plainPassword, hashedPassword) {
  const match = await bcrypt.compare(plainPassword, hashedPassword);
  return match;
}

// Usage example
async function authenticateUser(userProvidedPassword, storedHashedPassword) {
  if (await comparePassword(userProvidedPassword, storedHashedPassword)) {
    console.log('Password match: User authenticated');
    // Proceed with login
  } else {
    console.log('Password mismatch: Authentication failed');
    // Deny login
  }
}
```

### 4.3 Rate Limiting
Controls the number of requests a user or client can make to an API within a given time window. This prevents brute-force attacks, denial-of-service (DoS) attacks, and resource exhaustion.

*   **Implementation:** Track requests per IP address, user ID, or API key. Block or throttle requests exceeding the limit.

## 5. Checklist/Exercise

1.  **JWT vs. Sessions:** Describe a scenario where JWT would be a better choice than session-based authentication for an API, and vice-versa.
2.  **Vulnerability Mitigation:** You've discovered your API is vulnerable to SQL Injection. What specific code change or architectural pattern would you implement to fix this, and why?
3.  **Password Security:** Explain why simply hashing a password with MD5 (without a salt) is insecure, even if it's a one-way function, and how bcrypt addresses these weaknesses.