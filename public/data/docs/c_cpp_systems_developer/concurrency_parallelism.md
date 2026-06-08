# Concurrency & Parallelism

Concurrency and parallelism are fundamental concepts for building high-performance and responsive systems. They involve executing multiple computations simultaneously, either by interleaving tasks on a single core (concurrency) or by truly running them at the same instant on multiple cores or processors (parallelism). Mastering these concepts is crucial for any C/C++ Systems Developer.

## 1. Concurrency vs. Parallelism

*   **Concurrency:** Deals with managing multiple tasks that make progress seemingly at the same time. It's about structuring a program to handle multiple independent computations, often by interleaving their execution on a single processing unit. Think of a single chef juggling multiple cooking tasks.
*   **Parallelism:** Involves actually executing multiple tasks simultaneously. This requires multiple processing units (cores, CPUs). Think of multiple chefs working on different dishes at the same time.

## 2. Core Threading Mechanisms

Threads are the basic units of execution that can run concurrently within a single process.

### a. C++11 `<thread>`

The `<thread>` library introduced in C++11 provides a portable way to create and manage threads.

*   **Creating a Thread:** Instantiate `std::thread` with a callable object (function, lambda, functor).
*   **`join()`:** Waits for the thread to complete its execution. Essential for proper resource management.
*   **`detach()`:** Detaches the thread from the `std::thread` object. The thread then runs independently in the background (daemon thread). Resources are reclaimed automatically upon completion.

```cpp
#include <iostream>
#include <thread>

void hello_from_thread() {
    std::cout << "Hello from thread!" << std::endl;
}

int main() {
    std::thread t(hello_from_thread);
    t.join(); // Wait for the thread to finish
    std::cout << "Hello from main!" << std::endl;
    return 0;
}
```

### b. POSIX Threads (pthreads)

Pthreads is a standard API for creating and managing threads on POSIX-compliant operating systems (like Linux, macOS). While C++11 `<thread>` is preferred for modern C++ development due to its platform independence, pthreads still form the underlying basis for many systems and are essential for certain low-level or system-specific tasks. Key functions include `pthread_create`, `pthread_join`, `pthread_exit`.

## 3. Synchronization Primitives

When multiple threads access shared resources, data races can occur. Synchronization primitives help coordinate thread execution and protect shared data.

### a. Mutexes (`std::mutex`, `pthread_mutex_t`)

A mutex (mutual exclusion) is a lock that ensures only one thread can access a critical section (shared resource) at a time.

*   **`std::mutex`:** The basic C++ mutex.
    *   `lock()`: Acquires the lock. Blocks if already locked.
    *   `unlock()`: Releases the lock.
*   **`std::lock_guard`:** A RAII (Resource Acquisition Is Initialization) wrapper for `std::mutex`. Automatically locks on construction and unlocks on destruction, preventing common errors.
*   **`std::unique_lock`:** More flexible than `std::lock_guard`, allows deferred locking, timed locking, and can be moved.

### b. Condition Variables (`std::condition_variable`, `pthread_cond_t`)

Condition variables allow threads to wait for a certain condition to become true, typically in conjunction with a mutex. They are used for thread communication and producer-consumer patterns.

*   **`wait()`:** Releases the mutex and blocks the current thread until another thread notifies it.
*   **`notify_one()`:** Wakes up one waiting thread.
*   **`notify_all()`:** Wakes up all waiting threads.

### c. Semaphores (C++20 `std::counting_semaphore`, `sem_t`)

Semaphores are signaling mechanisms that control access to a common resource by multiple threads. A counting semaphore maintains an internal counter, decrementing it when a thread acquires access and incrementing it when released. When the counter is zero, no more threads can acquire access until one is released.

## 4. Atomic Operations (`std::atomic`)

`std::atomic` provides atomic operations for fundamental types, ensuring that operations like reads, writes, and modifications (e.g., increment) are indivisible and thread-safe without explicit locks. This is crucial for lock-free programming.

```cpp
#include <atomic>
#include <thread>
#include <vector>
#include <iostream>

std::atomic<int> counter{0};

void increment_counter() {
    for (int i = 0; i < 1000; ++i) {
        counter.fetch_add(1); // Atomically increments counter
    }
}

int main() {
    std::vector<std::thread> threads;
    for (int i = 0; i < 10; ++i) {
        threads.emplace_back(increment_counter);
    }

    for (std::thread& t : threads) {
        t.join();
    }

    std::cout << "Final counter value: " << counter << std::endl; // Expected: 10000
    return 0;
}
```

## 5. Thread-Safe Data Structures

These are data structures (like queues, stacks, hash maps) designed to be used by multiple threads without introducing data races. They typically achieve thread safety by internally using mutexes, condition variables, or atomic operations to protect their state.

## 6. High-Level Concurrency Constructs

### a. Futures and Promises (`std::future`, `std::promise`)

These provide a mechanism to retrieve the result of an asynchronous operation (e.g., a function executed in a separate thread). A `std::promise` sets a value or an exception, and a `std::future` retrieves it. This simplifies passing results between threads.

### b. Thread Pools

A thread pool is a collection of pre-initialized worker threads that can be reused to execute a number of tasks. This avoids the overhead of creating and destroying threads for each task, improving performance and resource management.

## 7. Parallel Algorithms from the STL (C++17 Execution Policies)

C++17 introduced parallel versions of many standard library algorithms (e.g., `std::sort`, `std::for_each`, `std::transform`). These can be invoked with execution policies to hint to the compiler whether to execute them sequentially (`std::execution::seq`), in parallel (`std::execution::par`), or unsequenced (`std::execution::unseq`).

```cpp
#include <vector>
#include <algorithm>
#include <execution>
#include <iostream>

int main() {
    std::vector<int> data(1000000);
    // Populate data...

    // Parallel sort
    std::sort(std::execution::par, data.begin(), data.end());

    std::cout << "Vector sorted in parallel." << std::endl;
    return 0;
}
```

## 8. Basics of Lock-Free Programming

Lock-free programming aims to achieve concurrency without using traditional locks (mutexes). It relies heavily on atomic operations and memory ordering. While offering potentially higher performance and avoiding deadlocks, it is significantly more complex and harder to get right, requiring a deep understanding of memory models.

## 9. Exposure to External Libraries

### a. OpenMP (Open Multi-Processing)

OpenMP is an API that supports multi-platform shared-memory multiprocessing programming in C, C++, and Fortran. It uses compiler directives (pragmas) to parallelize sections of code, loops, or tasks, making it relatively easy to adopt for existing codebases.

### b. TBB (Intel Threading Building Blocks)

TBB is a C++ template library for parallel programming that abstracts away many low-level threading details. It focuses on task-based parallelism and offers high-level constructs for parallel algorithms and concurrent data structures, designed to be highly scalable.

---

### Quick Check-Up / Exercises:

1.  **Distinguish:** Explain the core difference between `std::thread::join()` and `std::thread::detach()`.
2.  **Scenario:** You have a shared integer counter that multiple threads need to increment. What is the simplest and most efficient C++ mechanism to ensure thread-safety for this counter without introducing a mutex? Provide a one-line code snippet.
3.  **Purpose:** What problem do `std::condition_variable`s primarily solve in multi-threaded programming?
