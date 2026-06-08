# Study Guide: RESTful API Principles

Welcome to this comprehensive guide on RESTful API Principles! Mastering these concepts is fundamental for any backend developer. REST (Representational State Transfer) is an architectural style for designing networked applications, emphasizing a stateless client-server communication model.

## 1. Introduction to REST

REST is not a protocol or a standard; it's a set of architectural constraints that, when applied, create a web service that's scalable, maintainable, and flexible. It leverages existing HTTP methods and protocols.

### Core REST Principles (Architectural Constraints):
*   **Client-Server**: Separation of concerns allows independent evolution of client and server.
*   **Stateless**: Each request from client to server must contain all the information needed to understand the request. The server should not store any client context between requests.
*   **Cacheable**: Responses must explicitly or implicitly define themselves as cacheable to prevent clients from reusing stale or inappropriate data.
*   **Uniform Interface**: Simplifies overall system architecture, improving visibility, independent evolvability, and scalability.
    *   Resource Identification in Requests
    *   Resource Manipulation through Representations
    *   Self-descriptive Messages
    *   Hypermedia as the Engine of Application State (HATEOAS)
*   **Layered System**: A client cannot ordinarily tell whether it is connected directly to the end server or to an intermediary along the way.
*   **Code on Demand (Optional)**: Servers can temporarily extend or customize the functionality of a client by transferring executable code.

## 2. Resource-Based Design

RESTful APIs focus on **resources**, which are typically represented by nouns. These resources are manipulated using HTTP methods. Think of resources as entities in your application.

*   **Good**: `/users`, `/products/123`, `/orders`
*   **Bad**: `/getAllUsers`, `/deleteProduct?id=123` (verbs in URL)

## 3. HTTP Methods (Verbs)

HTTP methods define the desired action to be performed on the identified resource.

*   **GET**: Retrieve a representation of the resource. Safe (does not alter server state) and Idempotent.
    *   Example: `GET /products/123`
*   **POST**: Create a new resource or submit data for processing. Not Idempotent.
    *   Example: `POST /products` (with product data in body)
*   **PUT**: Update or *replace* an existing resource entirely, or create a new resource at a specified URI if it doesn't exist. Idempotent.
    *   Example: `PUT /products/123` (with complete updated product data in body)
*   **PATCH**: Partially update an existing resource. Idempotent (if specific operation).
    *   Example: `PATCH /products/123` (with partial product data in body, e.g., only price change)
*   **DELETE**: Remove the specified resource. Idempotent.
    *   Example: `DELETE /products/123`

## 4. HTTP Status Codes

Status codes are essential for clients to understand the outcome of their requests.

*   **2xx Success**
    *   `200 OK`: General success.
    *   `201 Created`: Resource successfully created (typically after POST).
    *   `204 No Content`: Request processed successfully, but no content to return (e.g., successful DELETE).
*   **4xx Client Error**
    *   `400 Bad Request`: Server cannot process the request due to malformed syntax.
    *   `401 Unauthorized`: Authentication is required and has failed or not yet been provided.
    *   `403 Forbidden`: Client does not have access rights to the content.
    *   `404 Not Found`: The server cannot find the requested resource.
    *   `405 Method Not Allowed`: The HTTP method used is not supported for the resource.
    *   `409 Conflict`: Request conflicts with the current state of the server.
    *   `429 Too Many Requests`: User has sent too many requests in a given amount of time.
*   **5xx Server Error**
    *   `500 Internal Server Error`: Generic error message for an unexpected condition.
    *   `503 Service Unavailable`: The server is not ready to handle the request.

## 5. Statelessness

Every request must be treated independently. The server does not store any session state about the client between requests. All necessary information (e.g., authentication tokens) must be included with each request.

## 6. Idempotency

An operation is idempotent if executing it multiple times produces the same result as executing it once. This is crucial for reliable API design, especially when dealing with network retries.

*   **Idempotent**: `GET`, `PUT`, `DELETE`
*   **Not Idempotent**: `POST` (multiple POSTs could create multiple resources)

## 7. Versioning

As your API evolves, you'll need to introduce changes without breaking existing clients. Versioning helps manage these changes.

*   **URI Versioning**: Include the version number in the URL path.
    *   Example: `/v1/users`, `/v2/users`
*   **Query Parameter Versioning**: Add a version parameter to the query string.
    *   Example: `/users?api-version=1.0`
*   **Header Versioning**: Use a custom HTTP header.
    *   Example: `X-API-Version: 1.0`
*   **Accept Header (Media Type) Versioning**: Use content negotiation.
    *   Example: `Accept: application/vnd.skillbun.v1+json`

## 8. Pagination

When dealing with collections of resources, it's common to have a large number of items. Pagination allows clients to fetch a subset of results.

*   **Offset/Limit**: Clients specify a starting point (offset) and the number of items to return (limit).
    *   Example: `GET /products?offset=10&limit=5` (skip first 10, get next 5)
*   **Cursor-based**: Clients receive a pointer (cursor) to the next set of results, which is more robust for dynamic data sets.
    *   Example: `GET /products?after=cursor_value&limit=5`

## 9. Filtering

Filtering allows clients to specify criteria to narrow down the results of a collection.

*   **Query Parameters**: Common method for filtering.
    *   Example: `GET /products?category=electronics&price_gt=100`

## 10. HATEOAS (Hypermedia as the Engine of Application State)

HATEOAS is a constraint of the REST uniform interface. It means that a REST client interacts with a REST server entirely through hypermedia provided dynamically by the server. The server provides links within its responses, guiding the client on available actions and related resources.

**Example without HATEOAS:**
```json
{
  