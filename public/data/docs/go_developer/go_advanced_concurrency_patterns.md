# Advanced Concurrency Patterns in Go

Go's concurrency model, built on goroutines and channels, is powerful. Beyond the basics, understanding advanced patterns is crucial for building robust, scalable, and maintainable concurrent applications. This guide explores several common advanced patterns.

## 1. Worker Pools

### Concept

Worker pools are a way to limit the number of concurrently executing goroutines that handle a set of tasks. Instead of creating a new goroutine for every task, a fixed number of 'worker' goroutines are launched. These workers then pull tasks from a shared queue (a channel) and process them. This pattern is essential for managing resource consumption, preventing system overload, and improving throughput by reusing goroutines.

### How it Works

1.  **Jobs Channel**: A channel used to send tasks to the workers.
2.  **Results Channel**: A channel used to collect results from the workers.
3.  **Worker Goroutines**: A fixed number of goroutines that read from the jobs channel, perform work, and send results to the results channel.
4.  **Dispatcher**: A component that sends tasks to the jobs channel and waits for results.

### Example: Simple Worker Pool

```go
package main

import (
	"fmt"
	"time"
)

// worker function simulates doing some work
func worker(id int, jobs <-chan int, results chan<- string) {
	for j := range jobs {
		fmt.Printf("Worker %d started job %d\n", id, j)
		time.Sleep(time.Millisecond * 100) // Simulate work
		results <- fmt.Sprintf("Worker %d finished job %d", id, j)
	}
}

func main() {
	const numJobs = 9
	jobs := make(chan int, numJobs)
	results := make(chan string, numJobs)

	// Start 3 workers
	for w := 1; w <= 3; w++ {
		go worker(w, jobs, results)
	}

	// Send jobs to the workers
	for j := 1; j <= numJobs; j++ {
		jobs <- j
	}
	close(jobs) // Close the jobs channel to signal no more jobs

	// Collect all results
	for a := 1; a <= numJobs; a++ {
		fmt.Println(<-results)
	}
}
```

## 2. Fan-in/Fan-out

### Concept

This pattern involves distributing work (fan-out) and then aggregating results (fan-in).

*   **Fan-out**: A single data source or task generator sends items to multiple goroutines for parallel processing. Each processing goroutine typically performs the same type of work on its assigned item.
*   **Fan-in**: The results from multiple parallel goroutines are collected into a single channel. This allows for centralized processing or further pipelining of the aggregated results.

### Use Cases

*   Processing large datasets where each item can be processed independently.
*   Making multiple parallel API calls and combining their responses.
*   Image processing where different parts of an image are processed concurrently.

## 3. Throttling

### Concept

Throttling (or rate-limiting) is a technique used to control the rate at which operations are performed. This is crucial for preventing resource exhaustion (e.g., hitting API rate limits, overwhelming a database, or consuming too much CPU/memory).

### Techniques

*   **Buffered Channels (Semaphores)**: A buffered channel can act as a semaphore. Sending to the channel acquires a 