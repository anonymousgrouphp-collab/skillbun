# Data API Design & Serving

## Introduction to Data APIs
Data APIs (Application Programming Interfaces) are crucial for modern data ecosystems, enabling seamless interaction between data producers and consumers. As a Data Engineer, designing and serving robust data APIs is essential for democratizing access to transformed datasets, feeding analytics dashboards, powering applications, and training machine learning models. They define clear contracts for how data can be requested and delivered.

## Why Data APIs are Important for Data Engineers
*   **Data Democratization**: Provides controlled access to curated datasets for various stakeholders.
*   **Interoperability**: Enables different systems and applications to communicate and exchange data.
*   **Efficiency**: Reduces the need for point-to-point integrations and custom data extracts.
*   **Scalability & Performance**: Well-designed APIs can handle high volumes of requests efficiently.
*   **Security & Governance**: Allows for centralized control over data access, authentication, and authorization.

## Core Concepts in Data API Design

### 1. Data Contracts
A data contract is a formal agreement between data producers and consumers, defining the structure, format, semantics, and quality expectations of the data exposed via an API.
*   **Schema Definition**: Specifies data types, field names, and relationships (e.g., JSON Schema, OpenAPI/Swagger).
*   **Data Quality**: Agreements on data accuracy, completeness, and freshness.
*   **Evolution**: A strategy for backward compatibility and versioning to handle changes.

### 2. API Paradigms

#### a. RESTful APIs (Representational State Transfer)
*   **Principles**: Stateless, client-server separation, cacheable, layered system, uniform interface.
*   **Resources**: Data is exposed as resources identified by URLs (e.g., `/users`, `/products/{id}`).
*   **HTTP Methods**: Uses standard HTTP verbs (GET for retrieve, POST for create, PUT for update/replace, PATCH for partial update, DELETE for remove).
*   **Data Format**: Commonly uses JSON or XML.
*   **Use Cases**: Widely adopted for web services, mobile backends, and public APIs due to simplicity and broad tooling support.

#### b. GraphQL
*   **Principles**: A query language for APIs and a runtime for fulfilling those queries with your existing data.
*   **Single Endpoint**: Typically uses a single HTTP POST endpoint.
*   **Client-Driven Queries**: Clients specify exactly what data they need, preventing over-fetching or under-fetching.
*   **Schema**: Strongly typed schema defines all available data and operations.
*   **Use Cases**: Complex UIs, microservices architectures, mobile apps where data fetching efficiency is critical.

#### c. gRPC (Google Remote Procedure Call)
*   **Principles**: High-performance, open-source universal RPC framework.
*   **Protocol Buffers**: Uses Protocol Buffers (Protobuf) for defining service methods and message types, enabling efficient serialization and deserialization.
*   **HTTP/2**: Built on HTTP/2 for features like multiplexing, header compression, and server push.
*   **Streaming**: Supports various streaming types (unary, server streaming, client streaming, bidirectional streaming).
*   **Use Cases**: Microservices communication, high-performance needs, IoT, polyglot environments.

### 3. Key Design Principles
*   **Efficiency**: Optimize data retrieval (pagination, filtering, sorting), minimize latency.
*   **Scalability**: Design for horizontal scaling, use statelessness where possible, consider caching strategies.
*   **Security**: Implement authentication (API keys, OAuth2, JWT), authorization (RBAC, ABAC), input validation, encryption (HTTPS).
*   **Idempotency**: Operations can be called multiple times without changing the result beyond the initial call (especially for PUT, DELETE).
*   **Error Handling**: Provide clear, consistent error messages with appropriate HTTP status codes.
*   **Versioning**: Plan for API evolution (e.g., `/v1/users`, custom headers).

## Simple Code Example: Basic REST API with Flask (Python)
This example demonstrates a very simple RESTful API endpoint using Flask to serve user data.

```python
from flask import Flask, jsonify, request

app = Flask(__name__)

# Sample in-memory data
users = {
    "1": {"name": "Alice", "email": "alice@example.com"},
    "2": {"name": "Bob", "email": "bob@example.com"}
}

@app.route('/users/<user_id>', methods=['GET'])
def get_user(user_id):
    """
    Retrieves user details by ID.
    """
    user = users.get(user_id)
    if user:
        return jsonify(user), 200
    return jsonify({"message": "User not found"}), 404

@app.route('/users', methods=['POST'])
def create_user():
    """
    Creates a new user.
    """
    new_user_data = request.json
    if not new_user_data or 'name' not in new_user_data or 'email' not in new_user_data:
        return jsonify({"message": "Missing name or email"}), 400

    new_id = str(max(int(k) for k in users.keys()) + 1) if users else "1"
    users[new_id] = new_user_data
    return jsonify({"id": new_id, "name": new_user_data["name"], "email": new_user_data["email"]}), 201

if __name__ == '__main__':
    app.run(debug=True)
```
To run this:
1.  Install Flask: `pip install Flask`
2.  Save as `app.py`
3.  Run: `python app.py`
4.  Test with `curl` or Postman:
    *   `GET http://127.0.0.1:5000/users/1`
    *   `POST http://127.0.0.1:5000/users` with JSON body `{"name": "Charlie", "email": "charlie@example.com"}`

## Checklist/Exercise
1.  **Identify API Type**: Given a scenario where a high-performance, strongly-typed API is needed for internal microservice communication in a polyglot environment, which API paradigm (REST, GraphQL, gRPC) would you recommend and why?
2.  **Data Contract Definition**: Imagine you need to expose a dataset of customer orders. List at least three key elements you would include in its data contract.
3.  **Security Principle**: Explain why implementing API authentication and authorization is crucial for data APIs, especially when serving sensitive data.
