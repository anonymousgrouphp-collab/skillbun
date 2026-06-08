# Network Programming with Sockets

Welcome to the exciting world of network programming with sockets! This topic equips you with the fundamental knowledge and practical skills to build robust, high-performance networked applications using C/C++. Understanding sockets is crucial for any systems developer looking to interact with the broader digital landscape.

## 1. Introduction to Sockets

At its core, network programming involves enabling different processes, possibly on different machines, to communicate over a network. Sockets provide the endpoint for this communication. In C/C++, Berkeley sockets (or POSIX sockets) are the standard API for network communication.

*   **What is a Socket?** A socket is an abstract endpoint of a communication path, acting as an interface between an application and the network protocol stack. It's like a file descriptor, allowing you to read from and write to the network.
*   **Why C/C++ for Network Programming?** C/C++ offers low-level control over system resources, direct memory access, and minimal overhead, making it ideal for high-performance and resource-efficient network applications like proxies, web servers, and real-time data streaming.

## 2. TCP vs. UDP Protocols

Sockets can operate over different network protocols, with TCP and UDP being the most common for application-layer communication.

*   **Transmission Control Protocol (TCP)**:
    *   **Connection-oriented**: Requires a three-way handshake to establish a connection before data transfer.
    *   **Reliable**: Guarantees delivery of data, retransmitting lost packets.
    *   **Ordered**: Ensures data arrives in the order it was sent.
    *   **Flow Control & Congestion Control**: Manages data flow to prevent overwhelming the receiver or the network.
    *   *Analogy*: Like making a phone call, you establish a connection, talk, and then hang up.
*   **User Datagram Protocol (UDP)**:
    *   **Connectionless**: Sends data packets (datagrams) without establishing a connection.
    *   **Unreliable**: No guarantees of delivery, order, or duplication. Packets may be lost, duplicated, or arrive out of order.
    *   **Minimal Overhead**: Faster due to less protocol overhead.
    *   *Analogy*: Like sending a postcard, you send it and hope it arrives.

**When to use which?** TCP for web browsing, email, file transfer (where reliability is paramount). UDP for real-time applications like online gaming, VoIP, live streaming (where speed and low latency are prioritized over perfect reliability).

## 3. Basic Socket API Functions

Here are the core functions used in socket programming. The server typically uses `socket()`, `bind()`, `listen()`, `accept()`, `send()`, `recv()`, `close()`. The client uses `socket()`, `connect()`, `send()`, `recv()`, `close()`.

### Server-Side Operations

1.  **`socket()`**: Creates a new socket.
    ```c
    int sockfd = socket(AF_INET, SOCK_STREAM, 0);
    // AF_INET for IPv4, SOCK_STREAM for TCP, 0 for default protocol
    // For UDP, use SOCK_DGRAM
    ```
2.  **`bind()`**: Assigns a local address and port to the socket.
    ```c
    struct sockaddr_in server_addr;
    server_addr.sin_family = AF_INET;
    server_addr.sin_port = htons(PORT); // Convert port to network byte order
    server_addr.sin_addr.s_addr = INADDR_ANY; // Listen on all available interfaces

    bind(sockfd, (struct sockaddr*)&server_addr, sizeof(server_addr));
    ```
3.  **`listen()`**: Puts the socket into a passive mode, waiting for incoming connection requests.
    ```c
    listen(sockfd, BACKLOG_QUEUE_SIZE); // BACKLOG_QUEUE_SIZE is max pending connections
    ```
4.  **`accept()`**: Extracts the first connection request on the queue of pending connections, creates a new connected socket, and returns a new file descriptor for it.
    ```c
    struct sockaddr_in client_addr;
    socklen_t client_len = sizeof(client_addr);
    int client_sockfd = accept(sockfd, (struct sockaddr*)&client_addr, &client_len);
    ```

### Client-Side Operations

1.  **`socket()`**: Same as server.
2.  **`connect()`**: Establishes a connection to a specified address and port (server).
    ```c
    struct sockaddr_in server_addr;
    server_addr.sin_family = AF_INET;
    server_addr.sin_port = htons(SERVER_PORT);
    inet_pton(AF_INET, "127.0.0.1", &server_addr.sin_addr); // Convert IP string to binary

    connect(sockfd, (struct sockaddr*)&server_addr, sizeof(server_addr));
    ```

### Data Transfer & Cleanup

*   **`send()` / `recv()`**: Used for TCP to send/receive data on a connected socket.
    ```c
    send(client_sockfd, buffer, len, 0);
    recv(client_sockfd, buffer, len, 0);
    ```
*   **`sendto()` / `recvfrom()`**: Used for UDP to send/receive data to/from a specific address.
    ```c
    sendto(sockfd, buffer, len, 0, (struct sockaddr*)&dest_addr, sizeof(dest_addr));
    recvfrom(sockfd, buffer, len, 0, (struct sockaddr*)&src_addr, &src_len);
    ```
*   **`close()`**: Closes a socket descriptor, releasing its resources.
    ```c
    close(sockfd);
    ```

## 4. I/O Models

How your application handles incoming and outgoing data significantly impacts its performance and scalability. There are several I/O models.

*   **Blocking I/O**: The default. When `recv()` or `accept()` is called, the program blocks (pauses) until data is available or a connection is made. Simple to implement but inefficient for handling multiple concurrent clients, as each client typically needs its own thread or process.

*   **Non-blocking I/O**: The socket is configured to return immediately if an I/O operation cannot be completed without blocking. You typically set this using `fcntl`:
    ```c
    int flags = fcntl(sockfd, F_GETFL, 0);
    fcntl(sockfd, F_SETFL, flags | O_NONBLOCK);
    ```
    This requires polling (`while(errno == EAGAIN || errno == EWOULDBLOCK)`), which can waste CPU cycles.

*   **I/O Multiplexing**: A more efficient way to handle multiple non-blocking I/O operations. A single thread can monitor multiple sockets for readiness (e.g., ready to read, ready to write, new connection).
    *   **`select()`**: Monitors multiple file descriptors (sockets) for readiness. Limited by `FD_SETSIZE` (typically 1024) and requires copying file descriptor sets between kernel and user space on each call, which can be inefficient for many descriptors.
    *   **`poll()`**: Similar to `select()` but uses an array of `struct pollfd` and has no hard limit on the number of file descriptors. More scalable than `select()`.
    *   **`epoll()` (Linux specific)**: A highly scalable, event-driven mechanism. It maintains an internal list of registered file descriptors and notifies the application only when an event occurs on one of them. Supports edge-triggered and level-triggered modes. Ideal for high-concurrency servers.
        *   `epoll_create()`: Creates an epoll instance.
        *   `epoll_ctl()`: Adds, modifies, or deletes file descriptors from the instance.
        *   `epoll_wait()`: Waits for I/O events on the epoll instance.
    *   **`kqueue()` (BSD/macOS specific)**: Analogous to `epoll()` on BSD-derived systems, offering similar high performance and scalability.

## 5. Basic Client-Server Communication (TCP Echo Example)

Let's outline a very basic TCP echo server and client to illustrate the flow.

### Server Flow

1.  Create listening socket (`socket`).
2.  Set socket options (e.g., `SO_REUSEADDR` with `setsockopt`).
3.  Bind socket to an IP address and port (`bind`).
4.  Listen for incoming connections (`listen`).
5.  Enter an infinite loop:
    a.  Accept a new client connection (`accept`). This returns a *new* socket descriptor for communication with this specific client.
    b.  Read data from the client (`recv`).
    c.  Echo data back to the client (`send`).
    d.  Close the client socket (`close`).

### Client Flow

1.  Create client socket (`socket`).
2.  Connect to the server's IP address and port (`connect`).
3.  Send data to the server (`send`).
4.  Receive echoed data from the server (`recv`).
5.  Close the client socket (`close`).

## 6. Socket Options (`setsockopt`, `getsockopt`)

Socket options allow you to configure various behaviors of a socket.

*   **`SO_REUSEADDR`**: Allows reuse of local addresses. Useful for servers that need to restart quickly after termination, preventing "Address already in use" errors.
    ```c
    int optval = 1;
    setsockopt(sockfd, SOL_SOCKET, SO_REUSEADDR, &optval, sizeof(optval));
    ```
*   **`TCP_NODELAY`**: Disables Nagle's algorithm, which buffers small amounts of data to send them in larger segments. Disabling it reduces latency at the cost of potentially more small packets.

## 7. Event-Driven Programming Models

For highly concurrent applications, an event-driven architecture is often preferred. Instead of blocking or constantly polling, the application reacts to events (e.g., data arrived, connection established).

*   **Raw `epoll`/`kqueue` usage**: Directly using these system calls provides the highest control and performance for event notification, forming the backbone of many high-performance network servers.
*   **Libraries like `libuv`**: `libuv` (used by Node.js) provides a cross-platform asynchronous I/O library that abstracts away the complexities of `epoll`, `kqueue`, `IOCP` (Windows), etc., offering a unified event loop API for non-blocking operations.

## 8. Network Protocol Design and Data Handling

When sending data over a network, you need to consider how to structure and interpret it.

*   **Endianness**: Different systems store multi-byte values (like integers) in different byte orders (little-endian vs. big-endian). Network protocols typically use **network byte order** (big-endian) for consistency. Functions like `htons()`, `ntohs()`, `htonl()`, `ntohl()` convert between host and network byte order for short (16-bit) and long (32-bit) integers.
*   **Serialization/Deserialization**: The process of converting data structures into a format suitable for transmission (serialization) and reconstructing them on the receiving end (deserialization).
    *   **Fixed-size structures**: Simple but inflexible if structure changes.
    *   **Length-prefixed messages**: A common technique where the message length is sent first, followed by the actual data. This allows the receiver to know exactly how much data to expect.
    *   **Text-based protocols**: JSON, XML, custom delimited strings. Human-readable but often larger and slower to parse.
    *   **Binary protocols**: Protocol Buffers, FlatBuffers, custom binary formats. Efficient in terms of size and speed, but less human-readable.

## Checklist/Exercise

1.  **Distinguish between `select()`, `poll()`, and `epoll()`**: Explain their primary differences, advantages, and disadvantages in terms of scalability and performance for server applications.
2.  **UDP Client-Server Scenario**: Describe the sequence of socket API calls required for a simple UDP client to send a message to a UDP server and receive a single response.
3.  **Endianness Conversion**: You have a 32-bit integer `int value = 0x12345678;` on a little-endian machine. How would you ensure it's sent in network byte order, and what would the byte sequence look like on the wire if the network is big-endian? Explain the function used.