# HTTP Server Fundamentals & Routing in Go

Go's `net/http` package provides a robust and efficient way to build web servers. This guide covers the core concepts of handling HTTP requests, generating responses, managing JSON data, and integrating popular routing libraries.

## 1. Introduction to Go's `net/http` Package

Go's standard library includes the `net/http` package, which is a complete HTTP client and server implementation. It's renowned for its simplicity, performance, and concurrency model, making it a powerful choice for web development without external dependencies for basic servers.

## 2. Core Concepts: `http.Handler`, `http.ResponseWriter`, `http.Request`

At the heart of Go's HTTP server are three key components:

*   **`http.Handler` Interface:** Defines an interface with a single method, `ServeHTTP(w http.ResponseWriter, r *http.Request)`. Any type that implements this interface can act as an HTTP request handler.
*   **`http.HandleFunc`:** A convenient adapter that allows you to use ordinary functions with the signature `func(w http.ResponseWriter, r *http.Request)` as HTTP handlers.
*   **`http.ResponseWriter`:** An interface that gathers the HTTP server's response header and body. You use it to write the HTTP status code, set headers, and send the response body back to the client.
*   **`http.Request`:** Represents an incoming HTTP request received by a server. It provides access to the request method, URL, headers, body, and more.

### Starting a Server

Use `http.ListenAndServe(addr string, handler http.Handler)` to start an HTTP server. The `addr` parameter specifies the listening address (e.g., `":8080"`), and `handler` is typically `nil` to use the default `http.DefaultServeMux`.

```go
package main

import (
	"fmt"
	"log"
	"net/http"
)

func helloHandler(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/hello" {
		http.Error(w, "404 not found.", http.StatusNotFound)
		return
	}

	if r.Method != "GET" {
		http.Error(w, "Method is not supported.", http.StatusMethodNotAllowed)
		return
	}

	fmt.Fprintf(w, "Hello, Gopher!")
}

func main() {
	http.HandleFunc("/hello", helloHandler)

	fmt.Printf("Starting server at port 8080\n")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal(err)
	}
}
```

## 3. Handling Requests and Generating Responses

**Handling Requests (`http.Request`):**

*   **Method:** `r.Method` (e.g., `GET`, `POST`, `PUT`).
*   **URL Path:** `r.URL.Path` (e.g., `/users/123`).
*   **Query Parameters:** `r.URL.Query().Get("paramName")`.
*   **Headers:** `r.Header.Get("Content-Type")`.
*   **Body:** Read from `r.Body` (typically using `json.NewDecoder` for JSON).

**Generating Responses (`http.ResponseWriter`):**

*   **Setting Headers:** `w.Header().Set("Content-Type", "application/json")`.
*   **Writing Status Code:** `w.WriteHeader(http.StatusOK)` (should be called before `w.Write`).
*   **Writing Body:** `w.Write([]byte("Response body"))` or `fmt.Fprintf(w, "Formatted string")`.

## 4. JSON Serialization and Deserialization

Go's `encoding/json` package allows for easy serialization (encoding) and deserialization (decoding) of JSON data to and from Go structs.

### Example: Handling JSON Payload

```go
package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

type User struct {
	ID   string `json:"id"`
	Name string `json:"name"`
	Email string `json:"email"`
}

func createUserHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	var user User
	// Deserialize (Decode) JSON from request body to Go struct
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// In a real app, you'd save 'user' to a database, etc.
	fmt.Printf("Received user: %+v\n", user)

	// For demonstration, just respond with the created user (simulating creation)
	user.ID = "new-user-123" // Assign a mock ID

	// Serialize (Encode) Go struct to JSON and send as response
	w.WriteHeader(http.StatusCreated)
	if err := json.NewEncoder(w).Encode(user); err != nil {
		log.Printf("Error encoding response: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
	}
}

func main() {
	http.HandleFunc("/users", createUserHandler)

	fmt.Printf("Starting server on port 8080 for JSON demo\n")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal(err)
	}
}
```

To test this:

`curl -X POST -H "Content-Type: application/json" -d '{"name":"Jane Doe","email":"jane@example.com"}' http://localhost:8080/users`

## 5. Routing with `net/http` and External Libraries

Go's `net/http` provides basic routing capabilities using `http.ServeMux` (the default multiplexer). You can register handlers for exact paths.

```go
// Basic routing with default ServeMux
http.HandleFunc("/", indexHandler)
http.HandleFunc("/about", aboutHandler)
```

However, `net/http`'s built-in router lacks advanced features like:

*   **Path Parameters:** Extracting variables from URLs (e.g., `/users/{id}`).
*   **Middleware:** Functions that process requests before or after the main handler.
*   **Grouped Routes:** Organizing routes with shared middleware or prefixes.

For these advanced needs, popular external routing libraries are used:

*   **`chi`:** A small, fast, and expressive HTTP router for Go. It's built on `net/context` and is a great choice for REST APIs.
*   **`gin-gonic/gin`:** A high-performance HTTP web framework. Known for its speed and features like middleware, routing, and rendering.
*   **`labstack/echo`:** Another high-performance, minimalist Go web framework that is extensible.

These libraries typically provide a `Router` instance where you register routes, methods, and handlers with support for path parameters.

```go
// Example with 'chi' (Conceptual)
// import "github.com/go-chi/chi/v5"

// func main() {
// 	r := chi.NewRouter()
// 	r.Use(middleware.Logger) // Example middleware

// 	r.Get("/users/{id}", getUserHandler)

// 	log.Fatal(http.ListenAndServe(":8080", r))
// }

// func getUserHandler(w http.ResponseWriter, r *http.Request) {
// 	id := chi.URLParam(r, "id")
// 	fmt.Fprintf(w, "Fetching user with ID: %s", id)
// }
```

## Checklist/Exercises

1.  **Build a simple `GET` endpoint:** Create an endpoint `/greet?name=YourName` that returns "Hello, YourName!" and defaults to "Hello, Guest!" if `name` is not provided.
2.  **Implement a `POST` endpoint with JSON:** Create an endpoint `/items` that accepts a JSON payload `{"name":"ItemName", "quantity":5}` and responds with the received item (you can mock saving it).
3.  **Explain the role of `http.ResponseWriter` and `http.Request`:** Describe their purpose and how they facilitate communication between the server and client in a Go HTTP server context.