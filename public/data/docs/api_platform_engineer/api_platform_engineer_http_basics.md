# HTTP/HTTPS Fundamentals for APIs

HTTP (Hypertext Transfer Protocol) and its secure counterpart, HTTPS, are the foundational protocols for communication over the web and are absolutely critical for API development. Understanding their core mechanisms is essential for designing, implementing, and consuming robust, efficient, and secure APIs.

## 1. HTTP Methods (Verbs)

HTTP methods, also known as HTTP verbs, indicate the desired action to be performed on a resource. They are a core part of RESTful API design.

*   **GET**: Retrieves data from a specified resource. It should be idempotent (multiple identical requests have the same effect as a single one) and safe (does not alter server state).
    *   _Example_: `GET /users/123`
*   **POST**: Submits data to be processed to a specified resource. Often causes a change in state or side effects on the server.
    *   _Example_: `POST /users` (with user data in the request body)
*   **PUT**: Updates an existing resource or creates a new one if it doesn't exist, by completely replacing it with the data provided in the request body. Idempotent.
    *   _Example_: `PUT /users/123` (with complete user data in the request body)
*   **PATCH**: Applies partial modifications to a resource. Non-idempotent by default, but can be designed to be.
    *   _Example_: `PATCH /users/123` (with partial user data in the request body, e.g., only updating the email)
*   **DELETE**: Removes a specified resource. Idempotent.
    *   _Example_: `DELETE /users/123`
*   **HEAD**: Identical to GET, but retrieves only the response headers, without the response body. Useful for checking resource existence or metadata without transferring the entire content.
*   **OPTIONS**: Describes the communication options for the target resource. Clients can use this to determine the allowed methods and other capabilities of a server for a given URL.

### Example: Using `curl` for API Interaction

```bash
# GET request to fetch a user
curl -X GET https://api.example.com/users/456

# POST request to create a new user
curl -X POST -H "Content-Type: application/json" \
     -d '{"name": "Jane Doe", "email": "jane.doe@example.com"}' \
     https://api.example.com/users

# DELETE request to remove a user
curl -X DELETE https://api.example.com/users/456
```

## 2. HTTP Status Codes

Status codes are 3-digit numbers returned by the server in response to an HTTP request, indicating whether a specific HTTP request has been successfully completed. They are grouped into five classes:

*   **1xx Informational**: Request received, continuing process.
    *   `100 Continue`: The client should continue with its request.
*   **2xx Success**: The action was successfully received, understood, and accepted.
    *   `200 OK`: Standard response for successful HTTP requests.
    *   `201 Created`: The request has been fulfilled, and a new resource has been created.
    *   `204 No Content`: The server successfully processed the request, but is not returning any content.
*   **3xx Redirection**: Further action needs to be taken by the user agent to fulfill the request.
    *   `301 Moved Permanently`: The requested resource has been assigned a new permanent URI.
    *   `302 Found`: The requested resource resides temporarily under a different URI.
*   **4xx Client Error**: The request contains bad syntax or cannot be fulfilled.
    *   `400 Bad Request`: The server cannot or will not process the request due to an apparent client error.
    *   `401 Unauthorized`: Authentication is required and has failed or has not yet been provided.
    *   `403 Forbidden`: The server understood the request but refuses to authorize it.
    *   `404 Not Found`: The requested resource could not be found.
    *   `405 Method Not Allowed`: The method specified in the Request-Line is not allowed for the resource identified by the Request-URI.
*   **5xx Server Error**: The server failed to fulfill an apparently valid request.
    *   `500 Internal Server Error`: A generic error message, given when an unexpected condition was encountered.
    *   `503 Service Unavailable`: The server is currently unable to handle the request due to temporary overload or scheduled maintenance.

## 3. HTTP Headers

HTTP headers are key-value pairs that carry metadata about the request or response. They provide essential information about the message body, the sender, the receiver, or the transaction itself.

*   **Common Request Headers**:
    *   `Host`: The domain name of the server.
    *   `User-Agent`: Client application type and operating system.
    *   `Accept`: Media types that are acceptable for the response.
    *   `Content-Type`: The media type of the body sent to the server (e.g., `application/json`).
    *   `Authorization`: Credentials for authenticating a user agent with a server (e.g., `Bearer <token>`).
    *   `Cache-Control`: Caching directives for caches along the request/response chain.
*   **Common Response Headers**:
    *   `Content-Type`: The media type of the resource sent to the client.
    *   `Content-Length`: The size of the response body in bytes.
    *   `Server`: Information about the origin server's software.
    *   `Set-Cookie`: Sends cookies from the server to the user agent.
    *   `Cache-Control`: Caching directives for caches.
    *   `Location`: Used in redirection (3xx) to indicate the URI to redirect to.

## 4. Statelessness

HTTP is a **stateless** protocol. This means each request from a client to a server is independent and contains all the information needed to process it. The server does not retain any memory of previous requests from the same client. This design choice simplifies server design and improves scalability.

For APIs, statelessness implies:
*   Each API request must carry all the necessary data (e.g., authentication tokens, parameters) for the server to fulfill it.
*   If session management is required (e.g., user login), state must be managed client-side (e.g., using cookies, JWTs in headers) or via external state management services, not within the core HTTP request/response cycle.

## 5. Connection Management

Originally, HTTP/1.0 opened a new TCP connection for each request and closed it after the response. This was inefficient. HTTP/1.1 introduced **persistent connections** (or Keep-Alive), allowing multiple requests and responses to be sent over the same TCP connection, significantly reducing latency and overhead.

Later versions, HTTP/2 and HTTP/3, further optimized connection management through features like multiplexing (sending multiple requests/responses concurrently over a single connection) and stream prioritization, improving performance especially in high-latency environments.

## 6. Caching Mechanisms

Caching is crucial for API performance and scalability. HTTP provides robust caching mechanisms that allow clients, proxies, and servers to store copies of responses to fulfill subsequent requests faster.

Key headers for caching:
*   **`Cache-Control`**: The primary header for caching directives.
    *   `no-cache`: Must revalidate with origin server before using a cached copy.
    *   `no-store`: Never cache anything.
    *   `max-age=<seconds>`: Specifies the maximum amount of time a resource is considered fresh.
    *   `public`: Cacheable by any cache.
    *   `private`: Cacheable only by a private cache (e.g., browser).
*   **`ETag`**: An opaque identifier assigned by the web server to a specific version of a resource. If the client has a cached version, it sends the `ETag` in an `If-None-Match` request header. If the server's version matches, it returns `304 Not Modified`, saving bandwidth.
*   **`Last-Modified`**: A timestamp indicating when the resource was last modified. Used with `If-Modified-Since` header to check for freshness, similar to `ETag`.

## 7. HTTPS for Secure API Communication

HTTPS (Hypertext Transfer Protocol Secure) is the secure version of HTTP. It uses **TLS (Transport Layer Security)**, formerly SSL (Secure Sockets Layer), to encrypt communication between a client and a server. HTTPS is paramount for any API, especially those handling sensitive data.

### How HTTPS Works (Simplified):
1.  **TLS Handshake**: When a client requests an HTTPS URL, it initiates a TLS handshake with the server.
2.  **Certificate Exchange**: The server sends its digital certificate (issued by a Certificate Authority - CA) to the client. This certificate contains the server's public key.
3.  **Verification**: The client verifies the certificate's authenticity, ensuring it trusts the CA and the certificate has not expired or been revoked.
4.  **Key Exchange**: If verified, the client and server negotiate a symmetric session key. The client encrypts this session key with the server's public key (from the certificate) and sends it to the server. The server then decrypts it with its private key.
5.  **Encrypted Communication**: All subsequent communication (requests and responses) is encrypted and decrypted using this shared symmetric session key.

### Benefits of HTTPS for APIs:
*   **Confidentiality**: Prevents eavesdropping; sensitive data (passwords, tokens, personal info) remains private.
*   **Integrity**: Ensures data is not tampered with during transmission; any alteration is detectable.
*   **Authenticity**: Verifies the identity of the server, preventing man-in-the-middle attacks.

For API Platform Engineers, always enforce HTTPS. It's not an option; it's a security requirement.

---

## Quick Checklist/Exercise:

1.  **Scenario**: You are building an API endpoint to allow users to update their profile picture. Which HTTP method would be most appropriate for this operation, assuming the entire picture file is sent with the request? Explain why.
2.  **Status Code Interpretation**: An API request to `GET /products/non-existent-id` returns a `404 Not Found` status code. What does this code signify, and what action should the client typically take?
3.  **Security Question**: Why is it critical to use HTTPS instead of HTTP for an API that handles user authentication credentials (like usernames and passwords)? Briefly describe one key protection HTTPS provides.
