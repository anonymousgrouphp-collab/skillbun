# Inter-Process Communication (IPC)

## Introduction

Inter-Process Communication (IPC) refers to a set of mechanisms that allow independent processes to communicate and synchronize their actions. In modern operating systems, processes typically run in isolation with their own memory spaces. IPC breaks this isolation, enabling processes to exchange data, share resources, and coordinate their execution. This is crucial for building complex, modular, and concurrent applications, especially in multi-process environments, common in C/C++ systems development.

## Core IPC Mechanisms

Here's an exploration of common IPC mechanisms:

### 1. Pipes
Pipes are one of the simplest forms of IPC, providing a unidirectional flow of data.

*   **Unnamed Pipes:**
    *   Used for communication between processes with a common ancestor (e.g., parent-child). 
    *   Created with the `pipe()` system call, returning two file descriptors: one for reading and one for writing.
    *   Data written to the write end can be read from the read end.
    *   Often used in conjunction with `fork()` and `dup2()`.
*   **Named Pipes (FIFOs - First-In, First-Out):**
    *   Allow communication between unrelated processes.
    *   Represented as a special file in the file system.
    *   Created using `mkfifo()`.
    *   Processes open the FIFO file like a regular file for reading or writing.

### 2. Message Queues
Message queues allow processes to exchange data in the form of discrete messages. They offer a structured way to send and receive data, and messages can be retrieved based on types, not just FIFO order.

*   **Features:**
    *   Messages are tagged with types, allowing selective retrieval.
    *   Messages are stored on the kernel until retrieved by a process.
    *   Can be used by unrelated processes.
*   **Operations:** `msgget` (create/access queue), `msgsnd` (send message), `msgrcv` (receive message), `msgctl` (control queue).

### 3. Shared Memory
Shared memory is the fastest IPC mechanism. It allows multiple processes to access the same region of physical memory, eliminating data copying between kernel and user space.

*   **Mechanism:**
    *   One process creates a shared memory segment.
    *   Other processes attach to this segment.
    *   All processes can then read and write to this memory region directly.
*   **Key Consideration:** Shared memory provides no built-in synchronization. It **must** be used with synchronization mechanisms like semaphores or mutexes to prevent race conditions and ensure data consistency.
*   **Operations:** `shmget` (create/access segment), `shmat` (attach), `shmdt` (detach), `shmctl` (control segment).

### 4. Semaphores
Semaphores are synchronization primitives used to control access to shared resources and prevent race conditions, especially with shared memory.

*   **Types:**
    *   **Binary Semaphores (Mutexes):** Act like locks, allowing only one process to access a critical section.
    *   **Counting Semaphores:** Allow a specified number of processes to access a resource concurrently.
*   **Operations:** `semget` (create/access set), `semop` (perform `wait` (decrement) and `signal` (increment)), `semctl` (control set).

### 5. Mutexes
Mutexes (Mutual Exclusion) are a specific type of binary semaphore primarily used to protect critical sections of code, ensuring only one thread/process can access shared data at a time. While semaphores can be used for more general resource counting, mutexes enforce strict mutual exclusion.

### 6. Unix Domain Sockets
Unix domain sockets (UDS) enable communication between processes on the same host. They are similar to network sockets but communicate within the kernel, typically using file system paths instead of IP addresses and ports.

*   **Features:**
    *   Faster and more efficient than network sockets for local communication.
    *   Can be stream-oriented (like TCP) or datagram-oriented (like UDP).
    *   Reliable, full-duplex communication.
    *   Leverage file system permissions for access control.

### 7. Message Passing Interface (MPI)
MPI is a standardized and portable message-passing library specification, primarily used for parallel programming in distributed memory environments (i.e., multiple computers).

*   **Concept:** Processes explicitly send and receive messages to and from other processes.
*   **Focus:** High-performance computing, clusters, and supercomputers.

### 8. Remote Procedure Call (RPC)
RPC is a protocol that allows a program to execute a procedure on a different address space (commonly a remote server) as if it were a local call.

*   **Concept:** Abstracts remote communication, making it appear like a local function call.
*   **Components:** Client stub, server stub, RPC runtime.
*   **Use Cases:** Distributed systems, client-server architectures (e.g., gRPC).

## Trade-offs and Use Cases

| IPC Mechanism        | Advantages                                    | Disadvantages                                  | Typical Use Cases                                      |
| :------------------- | :-------------------------------------------- | :--------------------------------------------- | :----------------------------------------------------- |
| **Pipes**            | Simple, low overhead (unnamed)                | Unidirectional, limited to related processes (unnamed) | Parent-child communication, shell pipelines            |
| **Named Pipes (FIFO)** | Unrelated processes, file system based        | Unidirectional, slower than shared memory      | Simple daemon communication, inter-script communication |
| **Message Queues**   | Structured messages, message types, persistent | Slower than shared memory, fixed message size  | Task queues, request/response systems                |
| **Shared Memory**    | Fastest IPC                                   | Requires external synchronization              | High-throughput data exchange, large data sharing     |
| **Semaphores/Mutexes** | Essential for synchronization, flexible      | Can lead to deadlocks if misused               | Protecting shared resources/memory, critical sections |
| **Unix Domain Sockets** | Faster than network sockets (local), full-duplex | Limited to local host                          | Client-server on same machine, daemon control        |
| **MPI**              | Scalable for distributed systems              | High learning curve, complex setup             | High-performance computing, scientific simulations     |
| **RPC**              | Abstracts remote calls, platform-independent   | Overhead of serialization/deserialization      | Microservices, distributed object systems              |

## Simple Code Example: Unnamed Pipe

This C example demonstrates how two processes (parent and child) can communicate using an unnamed pipe, sending a message from parent to child.

```c
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h> // For pipe, fork, close, read, write
#include <string.h>
#include <sys/wait.h> // For wait()

#define MSG_SIZE 256

int main() {
    int pipefd[2]; // pipefd[0] for read, pipefd[1] for write
    pid_t pid;
    char buffer[MSG_SIZE];
    const char *parent_msg = "Hello from parent process!";

    // Create a pipe
    if (pipe(pipefd) == -1) {
        perror("pipe");
        exit(EXIT_FAILURE);
    }

    pid = fork();

    if (pid == -1) {
        perror("fork");
        exit(EXIT_FAILURE);
    }

    if (pid == 0) { // Child process
        close(pipefd[1]); // Close unused write end
        printf("Child process: Reading from pipe...\n");
        ssize_t bytes_read = read(pipefd[0], buffer, MSG_SIZE);
        if (bytes_read > 0) {
            printf("Child received: \"%s\"\n", buffer);
        } else {
            perror("Child read error");
        }
        close(pipefd[0]); // Close read end
        exit(EXIT_SUCCESS);
    } else { // Parent process
        close(pipefd[0]); // Close unused read end
        printf("Parent process: Writing to pipe...\n");
        write(pipefd[1], parent_msg, strlen(parent_msg) + 1); // +1 for null terminator
        printf("Parent sent: \"%s\"\n", parent_msg);

        close(pipefd[1]); // Close write end
        wait(NULL); // Wait for child to finish
        printf("Parent process: Child finished.\n");
        exit(EXIT_SUCCESS);
    }

    return 0;
}
```

**To Compile and Run:**
```bash
gcc -o pipe_example pipe_example.c
./pipe_example
```

## Quick Check for Understanding

1.  Which IPC mechanism typically offers the highest performance for data exchange and what critical component must accompany its use for safe operation?
2.  Describe a scenario where a named pipe (FIFO) would be preferred over an unnamed pipe, and explain why.
3.  For communication between two C++ processes running on the *same physical server*, list two IPC mechanisms that would generally be faster than using standard TCP/IP network sockets.