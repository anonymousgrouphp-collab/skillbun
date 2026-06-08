## Context and Cancellation in Go

### Introduction to the `context` Package

In Go, managing the lifecycle of goroutines, especially in complex applications involving API calls, database operations, or long-running tasks, can be challenging. This is where the `context` package comes in. The `context.Context` interface provides a way to carry request-scoped values, cancellation signals, and deadlines across API boundaries and between goroutines. It's crucial for resource management, preventing leaks, and ensuring graceful shutdown in concurrent programs.

### Why `context.Context`?

Consider a web request that might involve multiple database queries, external API calls, and computation, all potentially handled by different goroutines. If the client disconnects or a timeout occurs, you need a mechanism to signal all related goroutines to stop their work, release resources, and return early. `context.Context` facilitates this propagation of signals and values.

### Core Concepts

1.  **Cancellation Signals**: The primary use case is to signal goroutines to stop their work. When a `Context` is cancelled, its `Done()` channel is closed, which can be listened to by dependent goroutines.
2.  **Timeouts and Deadlines**: `Context` allows you to set a timeout (a duration after which the context automatically cancels) or a deadline (a specific time at which the context automatically cancels). This is essential for controlling resource usage and preventing indefinite waits.
3.  **Request-Scoped Values**: You can attach immutable, request-scoped values to a `Context`. This is useful for passing data like user authentication tokens, trace IDs, or locale preferences down the call chain without cluttering function signatures.
4.  **Immutability and Hierarchy**: `Context` objects are immutable and form a tree-like hierarchy. Child contexts inherit properties from their parent. Cancelling a parent context automatically cancels all its children.

### Key Functions for Creating and Managing Contexts

*   **`context.Background()`**: Returns a non-nil, empty Context. It is typically used by the main function, initialization, and tests, and as the top-level Context for incoming requests.
*   **`context.TODO()`**: Returns a non-nil, empty Context. It should be used when you are unsure which Context to use or if the current function doesn't yet support Contexts but will in the future. It signals that a proper Context should be used later.
*   **`context.WithCancel(parent Context)`**: Returns a new `Context` and a `CancelFunc`. Calling the `CancelFunc` cancels the derived context and all its children. The `Done()` channel of the derived context is closed.
*   **`context.WithTimeout(parent Context, timeout time.Duration)`**: Returns a new `Context` and a `CancelFunc`. The derived context is automatically cancelled after the `timeout` duration has passed. The `CancelFunc` can still be called to cancel it earlier.
*   **`context.WithDeadline(parent Context, d time.Time)`**: Returns a new `Context` and a `CancelFunc`. Similar to `WithTimeout`, but cancels the context at a specific time `d`.
*   **`context.WithValue(parent Context, key, val interface{})`**: Returns a new `Context` that carries the specified `key-value` pair. The `Value()` method can retrieve the value associated with the key.

### How to Use `Context` in Goroutines

Goroutines should monitor the `Done()` channel of their `Context`. When `Done()` is closed, they should clean up and exit. The `select` statement is commonly used for this.

```go
package main

import (
	"context"
	"fmt"
	"time"
)

func worker(ctx context.Context, id int) {
	for {
		select {
		case <-ctx.Done():
			fmt.Printf("Worker %d: Context cancelled. Shutting down.\n", id)
			return
		case <-time.After(1 * time.Second):
			fmt.Printf("Worker %d: Doing work...\n", id)
		}
	}
}

func main() {
	// Create a context that will be cancelled after 3 seconds
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel() // It's good practice to call cancel to release resources

	fmt.Println("Starting workers...")

	go worker(ctx, 1)
	go worker(ctx, 2)

	// Wait for context to cancel
	<-ctx.Done()
	fmt.Printf("Main: Context finished with error: %v\n", ctx.Err())

	// Give workers a moment to clean up
	time.Sleep(1 * time.Second)
	fmt.Println("Main: All workers shut down. Exiting.")
}
```

In this example:

*   `main` creates a `Context` that automatically cancels after 3 seconds using `context.WithTimeout`.
*   Two `worker` goroutines are started, each receiving this context.
*   Each `worker` uses a `select` statement to either perform work or react to the `ctx.Done()` channel being closed.
*   When the timeout occurs, `ctx.Done()` is closed, signaling both workers to shut down gracefully.
*   `defer cancel()` ensures that the context's resources are released even if the function exits early.

### Best Practices

*   **Pass `Context` as the first argument**: Always pass `context.Context` as the first argument to functions that need it.
*   **Don't store `Context` in `struct` types**: `Context` should be passed explicitly, not embedded or stored in a struct, to make the data flow explicit and avoid unintended sharing or leaks.
*   **Use `Background()` or `TODO()` at the top**: Start with `context.Background()` for the root of your context tree or `context.TODO()` if you're not yet sure.
*   **Always call the `CancelFunc`**: When using `WithCancel`, `WithTimeout`, or `WithDeadline`, always call the returned `CancelFunc` to release resources associated with the context, especially if the context is derived from a parent context that might live longer.
*   **Check `ctx.Err()`**: After `ctx.Done()` is closed, `ctx.Err()` will return the reason for the context's cancellation (`context.Canceled` or `context.DeadlineExceeded`).

### Checklist/Exercise

1.  Explain the primary difference between `context.Background()` and `context.TODO()` and when to use each.
2.  Write a small Go program that launches a goroutine. The main function should use `context.WithCancel` to start the goroutine, and then, after 2 seconds, cancel the context. The goroutine should detect the cancellation and print a message before exiting.
3.  Describe a scenario where propagating request-scoped values with `context.WithValue` would be beneficial, providing a concrete example of what kind of data would be passed.