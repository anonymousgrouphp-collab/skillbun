# API Authentication & Security Best Practices: A Comprehensive Study Guide

API security is paramount for protecting sensitive data and maintaining the integrity of web applications. This guide covers essential authentication strategies, robust security practices, and common vulnerability mitigation techniques.

## 1. Authentication Strategies

Authentication verifies a user's identity, ensuring only legitimate users can access protected resources. We'll explore three primary methods:

### 1.1 Session-based Authentication

Traditional method where the server creates a session for a user upon successful login, storing session data (e.g., user ID) server-side. A session ID, often stored in a cookie, is sent with each subsequent request.

*   **How it works**: User logs in -> Server creates session -> Server sends session ID (cookie) -> Browser sends cookie with each request -> Server validates session ID.
*   **Pros**: Simple to implement, easy to invalidate sessions.
*   **Cons**: Requires server-side state, less scalable for distributed systems, vulnerable to CSRF if not properly secured.

### 1.2 JSON Web Tokens (JWT)

JWTs are an open standard for securely transmitting information between parties as a JSON object. They are stateless, meaning the server doesn't need to store session data.

*   **Structure**: A JWT consists of three parts separated by dots (`.`):
    1.  **Header**: Contains the token type (JWT) and the signing algorithm (e.g., HS256, RS256).
    2.  **Payload**: Contains claims (statements about an entity, typically the user, and additional data). Common claims include `iss` (issuer), `exp` (expiration time), `sub` (subject), and custom data.
    3.  **Signature**: Created by taking the encoded header, the encoded payload, a secret key, and the algorithm specified in the header. Used to verify the token hasn't been tampered with.

*   **How it works**: User logs in -> Server creates JWT with user data and signs it -> Server sends JWT to client -> Client stores JWT (e.g., localStorage, cookie) -> Client sends JWT in `Authorization` header (`Bearer <token>`) with each request -> Server verifies signature and claims.

*   **Pros**: Stateless, scalable, can contain custom data.
*   **Cons**: Tokens cannot be easily invalidated before expiration (requires blocklisting), sensitive data should not be stored in the payload.

```javascript
// Simple pseudocode for JWT creation and verification (Node.js using 'jsonwebtoken')

// npm install jsonwebtoken
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'your_super_secret_key'; // Keep this secure!

// 1. Create a JWT
const payload = { userId: '123', username: 'testuser' };
const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });
console.log('Generated JWT:', token);

// 2. Verify a JWT
try {
  const decoded = jwt.verify(token, SECRET_KEY);
  console.log('Decoded JWT:', decoded);
} catch (error) {
  console.error('JWT verification failed:', error.message);
}
```

### 1.3 OAuth 2.0

OAuth 2.0 is an authorization framework that enables an application to obtain limited access to a user's resources on another HTTP service (e.g., Facebook, Google) without exposing their credentials. It's about authorization, not authentication, but often used in conjunction with OpenID Connect for authentication.

*   **Roles**: Resource Owner (user), Client (application), Authorization Server, Resource Server.
*   **How it works (Authorization Code Grant Flow)**:
    1.  Client directs user to Authorization Server.
    2.  User grants permission to Client.
    3.  Authorization Server redirects user back to Client with an Authorization Code.
    4.  Client exchanges Authorization Code for an Access Token (and optionally a Refresh Token) at the Authorization Server.
    5.  Client uses Access Token to access protected resources on the Resource Server.

*   **Pros**: Delegated access, widely adopted for third-party integrations.
*   **Cons**: Complex to implement correctly, requires careful configuration.

## 2. Core Security Best Practices

Beyond authentication, several practices are crucial for robust API security.

### 2.1 Password Hashing with bcrypt

Never store passwords in plain text. Use a strong, one-way hashing algorithm like bcrypt to hash passwords before storing them. Bcrypt is deliberately slow and includes salting to prevent rainbow table attacks.

```javascript
// Simple pseudocode for bcrypt (Node.js using 'bcrypt')

// npm install bcrypt
const bcrypt = require('bcrypt');
const saltRounds = 10; // Cost factor: higher = slower, more secure

// 1. Hash a password
bcrypt.hash('mysecretpassword', saltRounds, (err, hash) => {
  if (err) throw err;
  console.log('Hashed password:', hash);

  // 2. Compare a password
  bcrypt.compare('mysecretpassword', hash, (err, result) => {
    if (err) throw err;
    console.log('Password match:', result); // true or false
  });
});
```

### 2.2 Input Sanitization

Sanitizing all user input is vital to prevent injection attacks.

*   **SQL Injection**: Attackers inject malicious SQL queries into input fields. Mitigation: **Always use parameterized queries or prepared statements**. Never concatenate user input directly into SQL queries.
*   **Cross-Site Scripting (XSS)**: Attackers inject malicious client-side scripts (e.g., JavaScript) into web pages viewed by other users. Mitigation: **Output encode all untrusted data** before rendering it in HTML. Use libraries that automatically escape HTML entities.

### 2.3 Rate Limiting

Restrict the number of requests a user or IP address can make to an API within a given timeframe. This protects against brute-force attacks, DDoS attempts, and resource exhaustion.

*   **Strategies**: Fixed window, sliding window, token bucket.
*   **Implementation**: Use middleware in your API framework (e.g., `express-rate-limit` for Node.js).

### 2.4 Cross-Origin Resource Sharing (CORS) Configuration

CORS is a browser security feature that restricts cross-origin HTTP requests initiated from scripts. It prevents a malicious website from making requests to your API on behalf of a user.

*   **How it works**: The browser performs a 