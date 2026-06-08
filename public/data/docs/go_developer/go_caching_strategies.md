# Caching Strategies and Implementation

Caching is a fundamental technique in software engineering to improve application performance and scalability by storing frequently accessed data in a faster, temporary storage layer. Understanding and implementing effective caching strategies is crucial for building high-performance Go applications.

## 1. The Importance of Caching

*   **Reduced Latency:** Accessing data from a cache is significantly faster than fetching it from a primary data source (database, external API, disk).
*   **Decreased Database Load:** Caching offloads read requests from the database, reducing its stress and allowing it to handle more write operations or complex queries.
*   **Improved User Experience:** Faster response times lead to a more responsive and satisfying user experience.
*   **Cost Savings:** By reducing the load on backend services, you might require fewer database instances or less powerful servers, leading to infrastructure cost savings.

## 2. Core Caching Concepts

*   **Cache Hit:** When requested data is found in the cache.
*   **Cache Miss:** When requested data is not found in the cache and must be fetched from the primary data source.
*   **Time-to-Live (TTL):** A mechanism to automatically invalidate cached entries after a specified duration, ensuring data freshness.
*   **Cache Eviction Policies:** When a cache reaches its capacity, older or less frequently used items must be removed to make space for new ones. Common policies include:
    *   **LRU (Least Recently Used):** Evicts the item that has not been accessed for the longest time.
    *   **LFU (Least Frequently Used):** Evicts the item that has been accessed the fewest times.
    *   **FIFO (First-In, First-Out):** Evicts the item that was added first.

## 3. Common Caching Patterns

### 3.1. Cache-Aside (Lazy Loading)

This is the most common caching pattern. The application is responsible for managing the cache.

*   **Read Operation:**
    1.  Application checks if data exists in the cache.
    2.  **Cache Hit:** Return data from the cache.
    3.  **Cache Miss:**
        a.  Fetch data from the primary data source (e.g., database).
        b.  Store data in the cache (optionally with a TTL).
        c.  Return data to the application.
*   **Write Operation:**
    1.  Application writes data directly to the primary data source.
    2.  Application invalidates or updates the corresponding entry in the cache.

**When to use:** Most general-purpose caching, good for read-heavy workloads. Simple to implement.

### 3.2. Write-Through

In this pattern, data is written synchronously to both the cache and the primary data source.

*   **Write Operation:**
    1.  Application writes data to the cache.
    2.  The cache immediately writes the data to the primary data source.
    3.  Once both writes are successful, the cache returns success to the application.
*   **Read Operation:** Same as Cache-Aside.

**When to use:** When data consistency is critical, and you can afford slightly higher write latency. Ensures data is always in sync between cache and database.

### 3.3. Write-Back (Write-Behind)

Data is written to the cache, and the cache asynchronously writes the data to the primary data source.

*   **Write Operation:**
    1.  Application writes data to the cache.
    2.  The cache immediately returns success to the application.
    3.  The cache later, asynchronously, writes the data to the primary data source.
*   **Read Operation:** Same as Cache-Aside.

**When to use:** For write-heavy workloads where high write throughput is crucial, and some data loss tolerance during a crash is acceptable (before data is persisted to the primary store). More complex to implement due to asynchronous nature and potential data loss.

## 4. Implementation in Go

Go offers flexibility for caching, from simple in-memory solutions to integrating with powerful external cache stores like Redis.

### 4.1. In-Memory Caching

For simpler use cases or when data doesn't need to be shared across multiple application instances, an in-memory cache is sufficient. A basic implementation involves using a `map` protected by a `sync.RWMutex` for concurrent access.

```go
package main

import (
	"fmt"
	"sync"
	"time"
)

// CacheEntry represents a cached item with its value and expiration time
type CacheEntry struct {
	value      interface{}
	expiration int64 // Unix timestamp
}

// InMemoryCache defines our simple in-memory cache
type InMemoryCache struct {
	cache map[string]CacheEntry
	mu    sync.RWMutex
}

// NewInMemoryCache creates and returns a new InMemoryCache
func NewInMemoryCache() *InMemoryCache {
	c := &InMemoryCache{
		cache: make(map[string]CacheEntry),
	}
	// Periodically clean up expired items (optional, but good practice)
	go c.cleanupLoop()
	return c
}

// Set adds or updates an item in the cache with a given TTL
func (c *InMemoryCache) Set(key string, value interface{}, ttl time.Duration) {
	c.mu.Lock()
	defer c.mu.Unlock()

	expiration := time.Now().Add(ttl).UnixNano()
	c.cache[key] = CacheEntry{
		value:      value,
		expiration: expiration,
	}
	fmt.Printf("Set: %s = %v (expires at %v)\n", key, value, time.Unix(0, expiration))
}

// Get retrieves an item from the cache
func (c *InMemoryCache) Get(key string) (interface{}, bool) {
	c.mu.RLock()
	entry, found := c.cache[key]
	c.mu.RUnlock()

	if !found {
		return nil, false // Key not found
	}

	if entry.expiration != 0 && time.Now().UnixNano() > entry.expiration {
		// Item has expired, remove it (lazy eviction)
		c.Remove(key) // This will acquire a write lock
		fmt.Printf("Get: %s expired and removed\n", key)
		return nil, false
	}

	fmt.Printf("Get: %s = %v (found)\n", key, entry.value)
	return entry.value, true
}

// Remove deletes an item from the cache
func (c *InMemoryCache) Remove(key string) {
	c.mu.Lock()
	defer c.mu.Unlock()
	delete(c.cache, key)
	fmt.Printf("Remove: %s\n", key)
}

// cleanupLoop periodically removes expired items
func (c *InMemoryCache) cleanupLoop() {
	ticker := time.NewTicker(5 * time.Second) // Clean up every 5 seconds
	defer ticker.Stop()

	for range ticker.C {
		c.mu.Lock()
		now := time.Now().UnixNano()
		cleanedCount := 0
		for key, entry := range c.cache {
			if entry.expiration != 0 && now > entry.expiration {
				delete(c.cache, key)
				cleanedCount++
			}
		}
		c.mu.Unlock()
		if cleanedCount > 0 {
			fmt.Printf("Cleanup: Removed %d expired items.\n", cleanedCount)
		}
	}
}

func main() {
	cache := NewInMemoryCache()

	// Example usage
	cache.Set("user:1", "Alice", 2*time.Second)
	cache.Set("product:101", "Laptop", 5*time.Second)

	fmt.Println("--- Initial Gets ---")
	val, ok := cache.Get("user:1")
	if ok {
		fmt.Println("User 1:", val)
	} else {
		fmt.Println("User 1 not found.")
	}

	val, ok = cache.Get("product:101")
	if ok {
		fmt.Println("Product 101:", val)
	} else {
		fmt.Println("Product 101 not found.")
	}

	time.Sleep(3 * time.Second) // Wait for user:1 to expire

	fmt.Println("--- After 3 seconds ---")
	val, ok = cache.Get("user:1") // Should be expired
	if ok {
		fmt.Println("User 1:", val)
	} else {
		fmt.Println("User 1 not found (expected).")
	}

	val, ok = cache.Get("product:101") // Still active
	if ok {
		fmt.Println("Product 101:", val)
	} else {
		fmt.Println("Product 101 not found.")
	}

	time.Sleep(3 * time.Second) // Wait for product:101 to expire

	fmt.Println("--- After 6 seconds ---")
	val, ok = cache.Get("product:101") // Should be expired
	if ok {
		fmt.Println("Product 101:", val)
	} else {
		fmt.Println("Product 101 not found (expected).")
	}

	// To prevent main from exiting immediately if cleanupLoop is still running
	select {}
}
```

### 4.2. External Caching with Redis

For distributed systems, scaling, or when data needs to be persistent or shared across multiple Go services, an external cache like [Redis](https://redis.io/) is an excellent choice. Redis is an open-source, in-memory data structure store, used as a database, cache, and message broker.

**Key Features of Redis for Caching:**
*   **High Performance:** In-memory nature provides extremely fast read/write operations.
*   **Data Structures:** Supports strings, hashes, lists, sets, sorted sets, etc., allowing flexible caching.
*   **Persistence:** Can optionally persist data to disk, allowing recovery after restarts.
*   **Replication & Clustering:** For high availability and horizontal scaling.
*   **TTL Support:** Built-in expiration for keys.

**Integration with Go:**
The `go-redis/redis/v8` (or `v9` for newer Go versions) is a popular and robust client library for Go.

```go
package main

import (
	"context"
	"fmt"
	"time"
	"github.com/go-redis/redis/v8" // For Go versions 1.13+
	// For Go versions 1.18+, use v9: "github.com/go-redis/redis/v9"
)

var ctx = context.Background()

func main() {
	// 1. Connect to Redis
	rdb := redis.NewClient(&redis.Options{
		Addr:     "localhost:6379", // Redis server address
		Password: "",               // No password by default
		DB:       0,                // Default DB
	})

	// Check connection
	pong, err := rdb.Ping(ctx).Result()
	if err != nil {
		fmt.Printf("Could not connect to Redis: %v\n", err)
		return
	}
	fmt.Printf("Connected to Redis: %s\n", pong)

	// 2. Set a key-value pair with a TTL (Time To Live)
	key := "mydata:123"
	value := "This is cached data"
	expiration := 10 * time.Second

	err = rdb.Set(ctx, key, value, expiration).Err()
	if err != nil {
		fmt.Printf("Error setting key in Redis: %v\n", err)
		return
	}
	fmt.Printf("Set key '%s' with value '%s' and expiration %v\n", key, value, expiration)

	// 3. Get the value from Redis
	val, err := rdb.Get(ctx, key).Result()
	if err == redis.Nil {
		fmt.Printf("Key '%s' not found in Redis.\n", key)
	} else if err != nil {
		fmt.Printf("Error getting key '%s' from Redis: %v\n", key, err)
	} else {
		fmt.Printf("Got value from Redis: '%s' for key '%s'\n", val, key)
	}

	// 4. Wait for the key to expire and try to get it again
	fmt.Printf("Waiting for %v for key '%s' to expire...\n", expiration, key)
	time.Sleep(expiration + 1*time.Second)

	val, err = rdb.Get(ctx, key).Result()
	if err == redis.Nil {
		fmt.Printf("Key '%s' not found in Redis (expected after expiration).\n", key)
	} else if err != nil {
		fmt.Printf("Error getting key '%s' from Redis: %v\n", key, err)
	} else {
		fmt.Printf("Got value from Redis: '%s' for key '%s' (unexpected).\n", val, key)
	}

	// 5. Delete a key
	deleteKey := "temp:data"
	rdb.Set(ctx, deleteKey, "data to delete", 5*time.Minute)
	fmt.Printf("Set temporary key '%s'\n", deleteKey)

	delCount, err := rdb.Del(ctx, deleteKey).Result()
	if err != nil {
		fmt.Printf("Error deleting key '%s': %v\n", deleteKey, err)
	} else {
		fmt.Printf("Deleted %d keys, including '%s'\n", delCount, deleteKey)
	}
}
```
*(Note: To run the Redis example, you need a Redis server running locally on port 6379 and install the `go-redis` library: `go get github.com/go-redis/redis/v8` or `go get github.com/go-redis/redis/v9`)*

## 5. Checklist / Exercise

1.  **Identify the right pattern:** You have a web service that primarily reads user profiles from a database. Updates to profiles are rare. Which caching pattern (Cache-Aside, Write-Through, Write-Back) would you choose for user profile data and why?
2.  **In-Memory vs. Distributed:** Your Go application is a single instance running on one server. If you anticipate scaling to multiple instances in the future, how would your choice of caching solution (in-memory vs. Redis) be affected?
3.  **Implement a Cache-Aside Strategy:** Outline the steps you would take to integrate a Redis-based cache-aside strategy into a Go service that fetches products by ID from a PostgreSQL database. Assume you have a `GetProductFromDB(id int) (Product, error)` function.