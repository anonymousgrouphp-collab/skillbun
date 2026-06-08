# API Gateways & Proxies: Study Guide

## 1. Introduction
In modern distributed systems, especially those built with microservices, managing the flow of requests between clients and numerous backend services becomes complex. This is where API Gateways and Proxies become indispensable components. They act as a single entry point for all client requests, abstracting the complexity of the backend services.

### What is a Proxy?
A proxy server acts as an intermediary for requests from clients seeking resources from other servers. When a client connects to a proxy server, it requests some resource, and the proxy server evaluates the request and determines how to fulfill it. There are two main types:
*   **Forward Proxy:** Sits in front of clients, forwarding requests to the internet on behalf of clients (e.g., corporate firewalls, VPNs).
*   **Reverse Proxy:** Sits in front of backend servers, forwarding client requests to the appropriate backend server (e.g., Nginx, Apache HTTP Server). This is the type most relevant to API Gateways.

### What is an API Gateway?
An API Gateway is a specialized type of reverse proxy that sits between a client and a collection of backend services. It acts as a single, central entry point for clients, routing requests to the appropriate microservice, and often handles cross-cutting concerns such as authentication, rate limiting, and caching, reducing the burden on individual microservices.

### Why Use API Gateways & Proxies?
*   **Simplification for Clients:** Clients interact with a single endpoint, unaware of the underlying microservice architecture.
*   **Traffic Management:** Efficient routing, load balancing, and traffic control.
*   **Security:** Centralized authentication, authorization, and protection against common threats.
*   **Observability:** Centralized logging, monitoring, and tracing.
*   **Cross-Cutting Concerns:** Offloading tasks like rate limiting, caching, and request/response transformation from microservices.
*   **API Evolution:** Easier management of API versions and gradual rollout of changes.

## 2. Key Features and Benefits of API Gateways
API Gateways offer a rich set of features that enhance the manageability, security, and performance of distributed applications:

*   **Request Routing & Load Balancing:** Directs incoming requests to the correct backend service based on defined rules (e.g., URL path, headers). It can also distribute traffic across multiple instances of a service to ensure high availability and responsiveness.
*   **Authentication & Authorization:** Verifies client identity and permissions before forwarding requests to backend services. This can involve integrating with OAuth2, JWT, API keys, etc.
*   **Rate Limiting & Throttling:** Controls the number of requests a client can make within a specified timeframe, preventing abuse and protecting backend services from overload.
*   **Request/Response Transformation:** Modifies request or response payloads, headers, or parameters to adapt to different client or service requirements.
*   **Caching:** Stores responses from backend services to serve subsequent identical requests faster, reducing load on backend systems and improving latency.
*   **Logging & Monitoring:** Centralizes logging of API requests and responses, providing a single point for observability and troubleshooting.
*   **Security (WAF Integration):** Can integrate with Web Application Firewalls (WAFs) to protect against common web exploits and DDoS attacks.
*   **API Versioning:** Helps manage different versions of an API, allowing clients to use older versions while newer versions are deployed.
*   **Service Discovery Integration:** Dynamically discovers and registers backend services.

## 3. API Gateway vs. Reverse Proxy: What's the Difference?
While an API Gateway is fundamentally a reverse proxy, the distinction lies in their purpose and feature set:

*   **Reverse Proxy:** Primarily focuses on forwarding requests to one or more backend servers, providing basic load balancing, SSL termination, and sometimes simple caching.
*   **API Gateway:** Builds upon the reverse proxy functionality by adding API-specific concerns. It understands the 