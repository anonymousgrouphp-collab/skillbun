# Web & API Application Architecture Fundamentals

As an Application Security Engineer, understanding the foundational architecture of web and API applications is paramount. It allows you to accurately identify potential attack surfaces, comprehend data flow, and implement robust security controls effectively. This guide covers the essential components and patterns that form modern application landscapes.

## 1. Modern Web Application Components

### 1.1 HTTP/S Protocol
The Hypertext Transfer Protocol (HTTP) is the backbone of data communication for the web.
*   **Request-Response Cycle**: Clients (browsers) send requests to servers, and servers send responses back.
*   **HTTP Methods (Verbs)**:
    *   `GET`: Retrieve data (e.g., fetching a web page or resource).
    *   `POST`: Submit data to be processed to a specified resource (e.g., creating a new user).
    *   `PUT`: Update an existing resource or create one if it doesn't exist (e.g., updating user profile).
    *   `DELETE`: Remove a specified resource.
    *   `PATCH`: Apply partial modifications to a resource.
*   **Status Codes**: Indicate the outcome of an HTTP request (e.g., `200 OK`, `404 Not Found`, `500 Internal Server Error`).
*   **HTTPS (HTTP Secure)**: HTTP layered on top of SSL/TLS for encrypted and authenticated communication, protecting data integrity and confidentiality.

### 1.2 Client-Server Architecture
This is the fundamental model:
*   **Client**: The application requesting data or services (e.g., web browser, mobile app, desktop client).
*   **Server**: The application providing data or services, responding to client requests (e.g., web server, API server, database server).
This separation allows for distributed systems, easier management, and scalability.

### 1.3 RESTful APIs (Representational State Transfer)
REST is an architectural style for designing networked applications. It emphasizes a stateless client-server interaction and a uniform interface.
*   **Key Principles**:
    *   **Stateless**: Each request from client to server must contain all the information necessary to understand the request.
    *   **Client-Server**: Separation of concerns.
    *   **Cacheable**: Responses must explicitly or implicitly define themselves as cacheable to prevent clients from reusing stale or inappropriate data.
    *   **Uniform Interface**: Resources are identified by URIs, and standard HTTP methods are used to manipulate them.
*   **Resources**: Any information that can be named, like `users`, `products`, `orders`. Manipulated via URIs (e.g., `/api/users/123`).

**Example of a REST API Request:**
```http
GET /api/products/42 HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer <token>
```

### 1.4 GraphQL
An open-source data query and manipulation language for APIs, and a runtime for fulfilling queries with existing data.
*   **Key Differences from REST**:
    *   **Single Endpoint**: Typically uses a single HTTP POST endpoint (e.g., `/graphql`).
    *   **Precise Data Fetching**: Clients specify exactly what data they need, avoiding over-fetching or under-fetching.
    *   **Strongly Typed Schema**: Defines the data structure and operations available.
*   **Operations**:
    *   **Queries**: For reading data.
    **Mutations**: For writing data (creating, updating, deleting).
    *   **Subscriptions**: For real-time data updates.

**Example of a GraphQL Query:**
```graphql
query GetProductDetails {
  product(id: "42") {
    name
    price
    description
  }
}
```

### 1.5 Microservices Architecture
An architectural style that structures an application as a collection of loosely coupled, independently deployable services.
*   **Characteristics**:
    *   **Decentralized**: Each service can be developed, deployed, and scaled independently.
    *   **Small and Focused**: Each service performs a single business capability.
    *   **Communication**: Services communicate via lightweight mechanisms (e.g., HTTP/REST, message queues).
*   **Advantages**: Improved scalability, resilience, faster development cycles, technological diversity.
*   **Challenges**: Operational complexity, distributed data management, inter-service communication overhead.

## 2. Database Interactions

Applications interact with databases to store and retrieve persistent data.
*   **Relational Databases (SQL)**: Structured data, ACID properties (Atomicity, Consistency, Isolation, Durability). Examples: PostgreSQL, MySQL, SQL Server.
*   **NoSQL Databases**: Flexible schemas, designed for specific data models and use cases (e.g., document, key-value, graph, column-family). Examples: MongoDB, Cassandra, Redis.
*   **Security Considerations**: Secure connection strings, least privilege access, input validation, encryption of data at rest and in transit.

## 3. Common Deployment Patterns

*   **Monolithic Deployment**: A single, unified application where all components are tightly coupled and deployed together. Simpler to develop initially but can be harder to scale and maintain.
*   **Distributed Deployment (Microservices)**: Services are deployed independently, often using containerization (e.g., Docker) and orchestration (e.g., Kubernetes). Offers greater flexibility and scalability but increases operational complexity.
*   **Load Balancing**: Distributes incoming network traffic across multiple servers to ensure high availability and responsiveness.
*   **API Gateways**: A single entry point for all API requests, handling routing, authentication, rate limiting, and other cross-cutting concerns for microservices.
*   **Content Delivery Networks (CDNs)**: Distribute static assets (images, CSS, JS) geographically closer to users to reduce latency and improve load times.

## Quick Understanding Checklist/Exercise:

1.  Explain the key advantage of HTTPS over HTTP for an application handling sensitive user data.
2.  Describe one scenario where a `PUT` request would be more appropriate than a `POST` request in a RESTful API.
3.  You need to retrieve specific user details (name and email) from a server without fetching unnecessary data like their full transaction history. Which API architecture (REST or GraphQL) is inherently better suited for this and why?