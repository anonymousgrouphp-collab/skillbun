# API Security, Authentication & Lifecycle Management: A Deep Dive

Welcome to the comprehensive guide on securing and managing APIs. This study guide delves into the critical aspects of protecting your APIs from common threats, implementing robust identity and access controls, and effectively overseeing the API's journey from inception to retirement.

## 1. API Security Fundamentals & Common Threats

API security is paramount to protect sensitive data, prevent unauthorized access, and maintain the integrity of your services. Understanding common vulnerabilities is the first step towards building resilient APIs.

### Core Security Principles
*   **Least Privilege**: Grant only the necessary permissions to users and services.
*   **Defense in Depth**: Implement multiple layers of security controls.
*   **Input Validation**: Sanitize and validate all incoming data to prevent injection attacks.
*   **Error Handling**: Avoid exposing sensitive information in error messages.

### OWASP API Security Top 10 (Summary of Key Threats)
1.  **Broken Object Level Authorization (BOLA)**: Exploiting vulnerable authorization checks to access resources they shouldn't.
2.  **Broken User Authentication**: Weak authentication mechanisms or flaws allowing attackers to bypass authentication.
3.  **Excessive Data Exposure**: APIs revealing too much sensitive data, even if not explicitly requested.
4.  **Lack of Resources & Rate Limiting**: APIs vulnerable to brute-force attacks or denial of service due to insufficient rate limiting.
5.  **Broken Function Level Authorization**: Complex access control policies leading to authorization flaws at the function level.
6.  **Mass Assignment**: Attackers guessing object properties and supplying them in requests to modify internal object properties they shouldn't.

## 2. API Authentication

Authentication is the process of verifying the identity of a client or user making a request to your API. It's the first line of defense.

### Key Authentication Mechanisms
*   **API Keys**: Simple, single-factor authentication, often used for machine-to-machine communication or public APIs with limited access.
    *   **Pros**: Easy to implement.
    *   **Cons**: Can be easily compromised if hardcoded or exposed; no inherent user context.
*   **Basic Authentication**: Sends credentials (username:password) Base64-encoded in the `Authorization` header. Not secure without HTTPS.
*   **Bearer Tokens (e.g., JWT - JSON Web Tokens)**: A common approach where an access token (often a JWT) is issued upon successful login and sent in the `Authorization: Bearer <token>` header for subsequent requests.
    *   **JWTs**: Self-contained tokens that can carry claims (user ID, roles, expiry) and are cryptographically signed to prevent tampering.
*   **OAuth 2.0**: An authorization framework that allows a third-party application to obtain limited access to a user's resources on an HTTP service. It delegates user authentication to the service provider.
*   **OpenID Connect (OIDC)**: An identity layer built on top of OAuth 2.0, providing authentication and identity claims (who the user is) in a standardized way, usually via ID Tokens (JWTs).

## 3. API Authorization

Authorization determines what an authenticated user or service is permitted to do once their identity has been verified. It answers the question: 