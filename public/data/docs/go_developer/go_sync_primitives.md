## Synchronization Primitives in Go

In concurrent programming, multiple goroutines often need to access shared resources. Without proper coordination, this can lead to **race conditions**, where the final outcome depends on the non-deterministic order of operations. Go's `sync` package provides fundamental **synchronization primitives** to manage shared access, prevent data corruption, and orchestrate goroutine execution.

### 1. Mutex (Mutual Exclusion Lock)

A `sync.Mutex` is a basic synchronization primitive that provides mutual exclusion. It ensures that only one goroutine can access a critical section of code at any given time, preventing race conditions on shared resources.

*   **Concept**: A lock that can be held by only one goroutine at a time. Other goroutines attempting to acquire the lock will block until it's released.
*   **Methods**:
    *   `Lock()`: Acquires the lock. If the lock is already held, the calling goroutine blocks until it's available.
    *   `Unlock()`: Releases the lock. It's crucial to `defer` the `Unlock()` call immediately after `Lock()` to ensure the lock is always released, even if errors occur.
*   **Use Case**: Protecting shared variables (e.g., counters, maps, structs) from concurrent writes and reads.

```go
package main

import (
	"fmt"
	"sync"
	"time"
)

var ( 
	counter int
	mu      sync.Mutex
)

func increment() {
	mu.Lock()
	defer mu.Unlock() // Ensure lock is released
	counter++
}

func main() {
	var wg sync.WaitGroup

	for i := 0; i < 1000; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			increment()
		}()
	}

	wg.Wait()
	fmt.Println("Final Counter:", counter)
}
```

### 2. RWMutex (Reader-Writer Mutex)

A `sync.RWMutex` is a more sophisticated lock that distinguishes between readers and writers. It allows multiple goroutines to read a shared resource concurrently, but only one goroutine to write to it at a time. A writer will block all readers and other writers, while a reader will block only writers.

*   **Concept**: Optimized for scenarios where reads are much more frequent than writes.
*   **Methods**:
    *   `RLock()`: Acquires a read lock. Multiple goroutines can hold read locks simultaneously.
    *   `RUnlock()`: Releases a read lock.
    *   `Lock()`: Acquires a write lock. Blocks if any read or write locks are held.
    *   `Unlock()`: Releases a write lock.
*   **Use Case**: Caching mechanisms, configuration data that is read often but updated rarely.

### 3. WaitGroup

A `sync.WaitGroup` is used to wait for a collection of goroutines to finish executing. It acts as a counter that can be incremented and decremented.

*   **Concept**: A counter for goroutines. `Add` increments, `Done` decrements, `Wait` blocks until the counter is zero.
*   **Methods**:
    *   `Add(delta int)`: Adds `delta` to the internal counter. Call *before* starting goroutines.
    *   `Done()`: Decrements the internal counter by 1. Call this typically with `defer` inside the goroutine.
    *   `Wait()`: Blocks until the internal counter becomes zero.
*   **Use Case**: Ensuring all background tasks complete before proceeding, orchestrating worker pools.

### 4. Once

A `sync.Once` guarantees that a function will be executed exactly once, no matter how many times it's called concurrently.

*   **Concept**: Ensures a specific setup function runs only a single time across multiple goroutines.
*   **Method**:
    *   `Do(f func())`: Executes the function `f` only on the first call. Subsequent calls will not execute `f`.
*   **Use Case**: Singleton initialization, loading configuration only once, expensive resource setup.

```go
package main

import (
	"fmt"
	"sync"
	"time"
)

var ( 
	once sync.Once
	setupDone = false
)

func performSetup() {
	fmt.Println("Performing one-time setup...")
	time.Sleep(100 * time.Millisecond) // Simulate work
	setupDone = true
	fmt.Println("Setup complete.")
}

func main() {
	var wg sync.WaitGroup

	for i := 0; i < 5; i++ {
		wg.Add(1)
		go func(id int) {
			defer wg.Done()
			fmt.Printf("Goroutine %d calling setup...
", id)
			once.Do(performSetup)
			fmt.Printf("Goroutine %d finished, setupDone: %t
", id, setupDone)
		}(i)
	}

	wg.Wait()
	fmt.Println("All goroutines finished.")
}
```

### 5. Cond (Condition Variable)

A `sync.Cond` allows goroutines to wait for a certain condition to be met and to be notified when that condition changes. It always requires an associated `sync.Locker` (usually a `sync.Mutex`).

*   **Concept**: Enables goroutines to communicate about a shared state change. Goroutines `Wait()` until `Signal()` or `Broadcast()` is called.
*   **Methods**:
    *   `Wait()`: Atomically unlocks the associated locker, suspends the calling goroutine, and then relocks the locker when it's woken up. Must be called with the locker held.
    *   `Signal()`: Wakes up at most one goroutine waiting on the condition.
    *   `Broadcast()`: Wakes up all goroutines waiting on the condition.
*   **Use Case**: Implementing producer-consumer patterns, managing task queues, complex state synchronization.

### Summary & Best Practices

*   **Choose the right primitive**: `Mutex` for exclusive access, `RWMutex` for read-heavy scenarios, `WaitGroup` for task completion, `Once` for single-time initialization, `Cond` for sophisticated state coordination.
*   **Defer Unlock**: Always use `defer mu.Unlock()` immediately after `mu.Lock()` to prevent deadlocks and ensure resources are released.
*   **Minimal Locking**: Lock only the critical section that needs protection. Holding locks longer than necessary reduces concurrency.
*   **Avoid Deadlocks**: Be careful with nested locks or acquiring locks in different orders across goroutines.

### Checklist / Exercises

1.  **Scenario Matching**: You have a configuration map that is read by hundreds of goroutines frequently but updated only once every few minutes. Which synchronization primitive is most suitable for protecting this map, and why?
2.  **Race Condition Fix**: Identify the race condition in the following code snippet and explain how to fix it using `sync.Mutex`:
    ```go
    package main

    import (
    	"fmt"
    	"sync"
    )

    var balance int = 100

    func deposit(amount int) {
    	balance += amount
    }

    func main() {
    	var wg sync.WaitGroup
    	for i := 0; i < 100; i++ {
    		wg.Add(1)
    		go func() {
    			defer wg.Done()
    			deposit(10)
    		}()
    	}
    	wg.Wait()
    	fmt.Println("Final Balance:", balance)
    }
    ```
3.  **Coordinating Startup**: You need to start 5 worker goroutines, and the `main` goroutine should only print "All workers started" *after* all 5 worker goroutines have confirmed they've successfully initialized. How would you use `sync.WaitGroup` to achieve this synchronization?
