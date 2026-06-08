# Middleware and API Design in Go

This study guide covers the essential concepts of middleware implementation in Go and best practices for designing RESTful APIs, including versioning and documentation.

## 1. Introduction to Middleware

**What is Middleware?**
Middleware refers to functions or components that sit between an incoming request and the final handler, or between an outgoing response and the client. They intercept requests and responses to perform common tasks that are independent of the core business logic. This promotes code reusability and separation of concerns.

**Why use Middleware?**
- **Modularity:** Encapsulate cross-cutting concerns (e.g., logging, authentication) into separate, reusable components.
- **Reusability:** Apply the same functionality across multiple routes or endpoints without duplicating code.
- **Maintainability:** Easier to manage and update shared functionalities.
- **Request/Response Transformation:** Modify requests before they reach the handler or responses before they are sent to the client.

**Common Use Cases:**
- **Logging:** Recording details about incoming requests and outgoing responses.
- **Authentication:** Verifying the identity of the client (e.g., checking tokens, sessions).
- **Authorization:** Determining if an authenticated client has permission to access a specific resource.
- **Error Recovery/Handling:** Catching panics or errors to return graceful error responses.
- **Rate Limiting:** Restricting the number of requests a client can make within a given timeframe.
- **Data Compression/Decompression:** Handling `gzip` or other compression schemes.

## 2. Implementing Middleware in Go

In Go's `net/http` package, middleware is typically implemented by chaining `http.Handler` or `http.HandlerFunc` types. A middleware function takes an `http.Handler` (or `http.HandlerFunc`) as an argument and returns a new `http.Handler` that wraps the original handler with additional logic.

**Basic Middleware Structure (Higher-Order Function):**

```go
package main

import (
	"fmt"
	"log"
	"net/http"
	"time"
)

// LoggerMiddleware logs details of each incoming request.
func LoggerMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		log.Printf("Started %s %s", r.Method, r.URL.Path)

		// Call the next handler in the chain
		next.ServeHTTP(w, r)

		duration := time.Since(start)
		log.Printf("Completed %s %s in %v", r.Method, r.URL.Path, duration)
	})
}

// AuthMiddleware simulates a simple authentication check.
func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// In a real app, you'd check tokens, sessions, etc.
		if r.Header.Get("X-API-KEY") != "secret-api-key" {
			http.Error(w, "Forbidden", http.StatusForbidden)
			return
		}
		// If authentication passes, call the next handler
		next.ServeHTTP(w, r)
	})
}

// HelloHandler is a simple final handler.
func HelloHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Hello, Go Web!")
}

func main() {
	// Create a handler chain
	// The order matters: LoggerMiddleware runs first, then AuthMiddleware, then HelloHandler.
	finalHandler := http.HandlerFunc(HelloHandler)
	authProtectedHandler := AuthMiddleware(finalHandler)
	loggedAuthProtectedHandler := LoggerMiddleware(authProtectedHandler)

	http.Handle("/hello", loggedAuthProtectedHandler)

	log.Println("Server starting on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
```

## 3. Principles of RESTful API Design

**What is REST?**
REST (Representational State Transfer) is an architectural style for designing networked applications. It emphasizes a stateless client-server communication model, where resources are identified by URIs and manipulated using a uniform interface (HTTP methods).

**Core REST Principles:**
- **Resources:** Everything is a resource (e.g., `/users`, `/products/123`). Resources are identified by URIs.
- **Statelessness:** Each request from client to server must contain all the information needed to understand the request. The server should not store any client context between requests.
- **Client-Server:** Separation of concerns between the client (UI) and the server (data storage, business logic).
- **Uniform Interface:** A consistent way of interacting with resources, primarily through standard HTTP methods.
    - **Identification of Resources:** Using URIs.
    - **Manipulation of Resources through Representations:** Data formats like JSON or XML.
    - **Self-descriptive Messages:** Each message includes enough information to describe how to process it.
    - **HATEOAS (Hypermedia As The Engine Of Application State):** Clients discover available actions dynamically through hypermedia links in resource representations.

**HTTP Methods (Verbs) for Resource Manipulation:**
- `GET`: Retrieve a resource or a collection of resources. (Idempotent, Safe)
- `POST`: Create a new resource or submit data for processing. (Not Idempotent, Not Safe)
- `PUT`: Update an existing resource entirely or create it if it doesn't exist. (Idempotent, Not Safe)
- `PATCH`: Partially update an existing resource. (Not Idempotent, Not Safe)
- `DELETE`: Remove a resource. (Idempotent, Not Safe)

**HTTP Status Codes (Common Examples):**
- `200 OK`: Successful request.
- `201 Created`: Resource successfully created (typically after a `POST`).
- `204 No Content`: Successful request, but no response body (e.g., `DELETE`).
- `400 Bad Request`: Client-side error (malformed syntax, invalid request message).
- `401 Unauthorized`: Authentication required or failed.
- `403 Forbidden`: Client is authenticated but does not have permission.
- `404 Not Found`: Resource does not exist.
- `405 Method Not Allowed`: HTTP method not supported for the resource.
- `500 Internal Server Error`: Generic server-side error.

**Resource Naming Conventions:**
- Use nouns (plural) for collection resources (e.g., `/users`, `/products`).
- Use singular nouns or IDs for specific resources (e.g., `/users/123`, `/products/abc`).
- Avoid verbs in URIs (e.g., instead of `/getAllUsers`, use `/users`).
- Use hyphens for readability (`my-resource`), not underscores (`my_resource`).
- Keep URIs simple and intuitive.

## 4. API Versioning Strategies

API versioning is crucial for evolving your API while maintaining backward compatibility for existing clients.

**Common Approaches:**
1.  **URL Versioning:** Include the version number directly in the URL path.
    -   Example: `/v1/users`, `/v2/users`
    -   Pros: Simple, highly visible, easy for clients to use.
    -   Cons: Requires routing changes, pollutes URIs, forces client code changes when versions change.

2.  **Header Versioning:** Include the version number in a custom HTTP header or the `Accept` header.
    -   Example (Custom Header): `X-API-Version: 1`
    -   Example (Accept Header): `Accept: application/vnd.myapi.v1+json`
    -   Pros: Keeps URIs clean, allows multiple versions to be served from the same endpoint.
    -   Cons: Less discoverable than URL versioning, requires clients to set specific headers.

3.  **Query Parameter Versioning:** Include the version number as a query parameter.
    -   Example: `/users?version=1`, `/users?api-version=2`
    -   Pros: Easy to implement, flexible.
    -   Cons: Can be confusing (query parameters usually filter resources), less RESTful as query parameters are meant for filtering/pagination.

## 5. API Documentation with OpenAPI/Swagger

**Importance of API Documentation:**
Good API documentation is vital for developers to understand how to use your API effectively. It reduces friction, improves developer experience, and minimizes support requests.

**What is OpenAPI/Swagger?**
- **OpenAPI Specification (OAS):** A language-agnostic, human-readable description format for REST APIs. It allows developers to describe their API's endpoints, operations, input/output parameters, authentication methods, and more in a standardized way (YAML or JSON).
- **Swagger Tools:** A set of open-source tools that implement the OpenAPI Specification:
    -   **Swagger UI:** Automatically generates interactive API documentation from an OpenAPI definition.
    -   **Swagger Editor:** A browser-based editor to write OpenAPI definitions.
    -   **Swagger Codegen:** Generates client SDKs, server stubs, and documentation from an OpenAPI definition.

**Benefits of using OpenAPI:**
-   **Machine-readable:** Enables automated processes like client code generation, testing, and mocking.
-   **Interactive Documentation:** Swagger UI provides a live, interactive portal for exploring and testing API endpoints.
-   **Improved Collaboration:** A single source of truth for API contracts, facilitating communication between frontend, backend, and QA teams.
-   **Consistency:** Encourages consistent API design by providing a schema to adhere to.

In Go, tools like `swag` (for Gin, Echo, etc.) can generate OpenAPI specifications directly from your Go code comments, integrating documentation directly into your development workflow.

--- 

### Quick Check / Exercise

1.  Explain the primary purpose of middleware in a web application and provide two distinct examples of functionalities it can handle.
2.  Describe two different strategies for API versioning (e.g., URL, Header, Query Parameter) and briefly discuss one advantage and one disadvantage for each.
3.  Why is API documentation, especially using standards like OpenAPI/Swagger, crucial for modern API development and consumption?