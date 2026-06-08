## Study Guide: Authentication, Authorization & Session Management

This guide explores the foundational pillars of application security: Authentication, Authorization, and Session Management. Mastering these concepts is crucial for building secure and robust applications that protect user data and maintain integrity.

### 1. Introduction to Core Concepts

*   **Authentication:** The process of verifying the identity of a user, system, or service. It answers the question, "Who are you?"
*   **Authorization:** The process of determining what an authenticated user or system is permitted to do. It answers the question, "What are you allowed to do?"
*   **Session Management:** The process of maintaining the state of a user's interaction with an application across multiple requests after they have been authenticated.

### 2. Authentication Mechanisms

Authentication ensures that only legitimate entities gain access.

#### 2.1 Password Hashing Best Practices

Never store passwords in plain text. Always hash them using a strong, slow, and salted algorithm.
*   **Salting:** A unique, random string added to each password before hashing to prevent rainbow table attacks and ensure that identical passwords have different hashes.
*   **Strong Hashing Algorithms:** Use algorithms designed to be slow and computationally intensive, making brute-force attacks impractical.
    *   **Bcrypt:** Widely used and highly recommended due to its adaptive nature (work factor).
    *   **Argon2:** The winner of the Password Hashing Competition, considered state-of-the-art.
    *   **PBKDF2:** Also a strong contender, often used in conjunction with NIST guidelines.
*   **Avoid:** MD5, SHA-1, SHA-256/512 (when used directly for passwords without proper salting and stretching/key derivation functions, as they are fast cryptographic hashes, not password-hashing functions).

**Example: Python with `bcrypt`**
```python
import bcrypt

def hash_password(password):
    salt = bcrypt.gensalt(rounds=12) # Specify work factor for bcrypt
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed_password.decode('utf-8')

def check_password(password, hashed_password):
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))

# Usage
user_password = "mySecretPassword123"
stored_hash = hash_password(user_password)
print(f"Hashed Password: {stored_hash}")

is_valid = check_password("mySecretPassword123", stored_hash)
print(f"Password Valid: {is_valid}") # True

is_invalid = check_password("wrongPassword", stored_hash)
print(f"Wrong Password Valid: {is_invalid}") # False
```

#### 2.2 Multi-Factor Authentication (MFA)

MFA adds layers of security by requiring users to provide two or more verification factors from independent categories.
*   **Knowledge Factor:** Something only the user knows (e.g., password, PIN).
*   **Possession Factor:** Something only the user has (e.g., phone with OTP app, hardware token).
*   **Inherence Factor:** Something only the user is (e.g., fingerprint, face scan).

Common MFA implementations include TOTP (Time-based One-Time Password), SMS codes, and push notifications to a registered device.

#### 2.3 OpenID Connect (OIDC)

An identity layer built on top of the OAuth 2.0 protocol. It enables clients to verify the identity of the end-user based on the authentication performed by an authorization server, as well as to obtain basic profile information about the end-user. It's widely used for Single Sign-On (SSO) across various applications.

#### 2.4 SAML (Security Assertion Markup Language)

An XML-based standard for exchanging authentication and authorization data between an identity provider (IdP) and a service provider (SP). Primarily used for enterprise-grade Single Sign-On (SSO) solutions, often involving B2B integrations.

### 3. Authorization Models

Authorization controls what an authenticated user can access or perform within an application.

#### 3.1 Role-Based Access Control (RBAC)

Users are assigned roles (e.g., "Admin", "Editor", "Viewer"), and permissions are assigned to these roles. Users inherit the permissions of their assigned roles.
*   **Advantages:** Simple to manage in organizations with clear functional roles; scales well for a moderate number of roles.
*   **Disadvantages:** Can become complex when highly granular or context-sensitive permissions are required.

**Example: Conceptual RBAC Configuration**
```json
{
  "roles": {
    "admin": ["create_user", "edit_user", "delete_user", "view_all_reports"],
    "editor": ["create_post", "edit_own_post", "view_post"],
    "viewer": ["view_post", "view_public_reports"]
  },
  "users": {
    "alice": ["admin"],
    "bob": ["editor"],
    "charlie": ["viewer", "editor"] // A user can have multiple roles
  }
}
```

#### 3.2 Attribute-Based Access Control (ABAC)

Access decisions are made dynamically based on attributes of the user, resource, action, and environment. Offers much finer-grained control than RBAC.
*   **User Attributes:** Role, department, security clearance, location.
*   **Resource Attributes:** Sensitivity, owner, creation date, type.
*   **Action Attributes:** Read, write, delete, approve.
*   **Environment Attributes:** Time of day, IP address, device type.

**Example: ABAC Policy Rule (Pseudo-code)**
```
ALLOW user TO read resource WHERE
  user.department == resource.department AND
  user.clearance >= resource.sensitivity_level AND
  request.ip_address IS IN user.allowed_ip_ranges AND
  resource.status != "archived"
```

#### 3.3 Granular Permissions

This refers to the practice of defining very specific, atomic permissions (e.g., `user:read`, `product:delete`). While fundamental, managing these at scale often requires an overarching model like RBAC or ABAC. Often, RBAC maps to a set of granular permissions, and ABAC uses granular permissions as part of its policy evaluation.

### 4. Session Management

Maintaining state for authenticated users securely is critical for a smooth and protected user experience.

#### 4.1 JSON Web Tokens (JWTs)

Self-contained, digitally signed tokens used to securely transmit information between parties, typically an authorization server and a client application.
*   **Structure:**
    *   **Header:** Type of token (JWT) and signing algorithm (e.g., HS256, RS256).
    *   **Payload:** Claims (statements about an entity, usually the user, and additional data like expiration time `exp`).
    *   **Signature:** Used to verify the token hasn't been tampered with. It's generated using the header, payload, and a secret key (or private key).
*   **Stateless:** The server does not need to store session information, reducing server load.
*   **Usage:** Often used in API authentication, passed in the `Authorization: Bearer <token>` header.
*   **Security Concerns:** JWTs are not inherently revocable before expiry without additional mechanisms. If compromised, they remain valid until expiration.

**Example: JWT Structure (Encoded)**
`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyNDI2MjJ9.jX-KjX_W-mX_R_K_X_X_X_X_X_X_X_X_X_X_X_X_X`

#### 4.2 Secure Cookies

Cookies are small pieces of data stored on the user's browser. For sessions, they should be configured with specific security flags to protect against common web vulnerabilities:
*   **`HttpOnly`:** Prevents client-side scripts (e.g., JavaScript) from accessing the cookie, mitigating XSS attacks.
*   **`Secure`:** Ensures the cookie is only sent over HTTPS connections, protecting against eavesdropping.
*   **`SameSite`:** Prevents the browser from sending the cookie with cross-site requests, mitigating CSRF attacks. Recommended values: `Lax` (default for many browsers) or `Strict`.
*   **`__Host-` or `__Secure-` prefixes:** Further enhance security by restricting cookie attributes (e.g., requiring `Secure` and a specific path).

**Example: Setting a Secure Cookie (Node.js/Express)**
```javascript
res.cookie('sessionId', 'your-unique-session-id', {
  httpOnly: true,
  secure: true, // Only send over HTTPS
  sameSite: 'Lax', // Protects against CSRF
  maxAge: 3600000, // 1 hour expiration (in milliseconds)
  path: '/' // The path the cookie is valid for
});
```

#### 4.3 Token Revocation

Mechanisms to invalidate sessions or tokens before their natural expiry, essential for security events like password changes or account compromises.
*   **Blacklisting:** Storing a list of invalidated tokens (e.g., compromised JWTs) on the server. The server checks this list for every incoming token.
*   **Short Expiry + Refresh Tokens:** Use short-lived access tokens (e.g., 15-minute expiry) for resource access and longer-lived refresh tokens for obtaining new access tokens. Revoking a refresh token immediately invalidates all associated future access tokens.
*   **Database-backed Sessions:** Storing session data in a database or dedicated session store (like Redis) makes revocation straightforward by simply deleting the session record.

### 5. Quick Checklist / Exercises

1.  **Scenario:** You are implementing a new user registration flow. Besides hashing the password, what two other essential security measures should be in place to ensure robust authentication for new users?
2.  **Concept Check:** Explain the key difference between RBAC and ABAC in terms of how access decisions are made. Provide a scenario where ABAC would be a more suitable authorization model than RBAC for a highly dynamic environment.
3.  **Problem Solving:** Your application uses JWTs for session management. A user reports suspicious activity on their account, and you need to immediately invalidate all their active sessions. Describe two distinct strategies you could implement to achieve this, considering the stateless nature of JWTs.