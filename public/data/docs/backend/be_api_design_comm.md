# API Design & Communication Study Guide

## Introduction to API Design & Communication
APIs (Application Programming Interfaces) are the backbone of modern software architecture, enabling different software systems to communicate and exchange data. Effective API design is crucial for building scalable, maintainable, and robust backend services. This guide covers core concepts, design principles, and best practices for creating powerful APIs.

## Core Concepts

### 1. REST (Representational State Transfer)
REST is an architectural style for designing networked applications. It emphasizes a stateless client-server communication model and uses standard HTTP methods.

*   **Resources:** Everything is treated as a resource, identified by a unique URI (e.g., `/users`, `/products/123`).
*   **HTTP Methods:**
    *   `GET`: Retrieve a resource. (Idempotent and Safe)
    *   `POST`: Create a new resource. (Not Idempotent)
    *   `PUT`: Update an existing resource (full replacement). (Idempotent)
    *   `PATCH`: Partially update an existing resource. (Not Idempotent)
    *   `DELETE`: Remove a resource. (Idempotent)
*   **Statelessness:** Each request from client to server must contain all the information necessary to understand the request. The server should not store any client context between requests.
*   **Uniform Interface:** Consistent way of interacting with resources, promoting simplicity and decoupling.
*   **HATEOAS (Hypermedia As The Engine Of Application State):** Resources provide links to related resources, guiding clients through the application's state.

#### Example: Simple REST Endpoint for Users

```http
GET /users
Host: api.example.com
Accept: application/json
```

```json
[
  {
    "id": "1",
    "name": "Alice",
    "email": "alice@example.com",
    "links": [
      {"rel": "self", "href": "/users/1"}
    ]
  },
  {
    "id": "2",
    "name": "Bob",
    "email": "bob@example.com",
    "links": [
      {"rel": "self", "href": "/users/2"}
    ]
  }
]
```

### 2. GraphQL
GraphQL is a query language for APIs and a runtime for fulfilling those queries with your existing data. It allows clients to request exactly the data they need, no more, no less.

*   **Single Endpoint:** Typically, a single `/graphql` endpoint handles all data operations.
*   **Declarative Data Fetching:** Clients specify the structure of the response, leading to efficient data retrieval.
*   **Schema Definition Language (SDL):** A strongly typed schema defines available data types, queries, and mutations.
*   **Queries:** Used to read (fetch) data.
*   **Mutations:** Used to write (create, update, delete) data.
*   **Subscriptions:** Enable real-time data updates to clients.

#### Example: GraphQL Query for User Data

```graphql
query GetUser($id: ID!) {
  user(id: $id) {
    name
    email
  }
}
```

```json
{
  "data": {
    "user": {
      "name": "Alice",
      "email": "alice@example.com"
    }
  }
}
```

### 3. API Security
Securing APIs is paramount to protect sensitive data and prevent unauthorized access.

*   **Authentication:** Verifying the identity of a client making a request.
    *   **API Keys:** Simple tokens often passed in headers or query parameters.
    *   **OAuth 2.0:** An authorization framework for delegated access, commonly used for third-party applications.
    *   **JWT (JSON Web Tokens):** Self-contained, digitally signed tokens used for secure information exchange and authentication.
*   **Authorization:** Determining what an authenticated client is allowed to do or access.
    *   Role-Based Access Control (RBAC) and Attribute-Based Access Control (ABAC) are common strategies.
*   **Rate Limiting:** Prevents abuse by restricting the number of requests a client can make within a specified timeframe.
*   **Input Validation:** Sanitize and validate all incoming data to prevent injection attacks (e.g., SQL injection, XSS) and ensure data integrity.
*   **HTTPS/SSL/TLS:** Encrypts communication between client and server, protecting data in transit.

### 4. API Versioning
Managing changes to your API over time is essential to avoid breaking existing client applications.

*   **URL Versioning:** Include the version number directly in the URL (e.g., `api.example.com/v1/users`).
*   **Header Versioning:** Specify the API version in a custom HTTP header (e.g., `Accept-Version: v1`).
*   **Query Parameter Versioning:** Pass the version as a query parameter (e.g., `api.example.com/users?version=v1`).

### 5. API Documentation
Clear, comprehensive, and up-to-date documentation is vital for developers consuming your API, ensuring ease of use and adoption.

*   **Tools:** Swagger/OpenAPI, Postman Documentation, Docusaurus.
*   **Content:** Detailed descriptions of endpoints, HTTP methods, request/response structures, authentication requirements, error codes, and illustrative examples.

## Checklist / Exercise

1.  **Identify HTTP Method:** For an API endpoint `/products/{id}` that fully replaces a product's details, which HTTP method would you use? Explain why.
2.  **GraphQL vs. REST:** Describe one key advantage of using GraphQL over REST for a client application that needs very specific subsets of data from multiple related resources, avoiding over-fetching.
3.  **API Security:** What are two common methods for authenticating clients when they make requests to a REST API, and what's a primary difference between how they function?
