# Data Persistence with SQL and NoSQL in Go

Data persistence is crucial for most applications, allowing them to store and retrieve information beyond the lifespan of the program. Go provides robust tools and libraries for interacting with both traditional SQL and modern NoSQL databases.

## 1. SQL Databases in Go

Go's standard library offers the `database/sql` package, which provides a generic interface for interacting with SQL databases. Database-specific drivers then implement this interface. For modern PostgreSQL interaction, `pgx` is a popular and high-performance choice.

### Core Concepts (`database/sql`)

*   **`sql.DB`**: Represents a pool of open database connections. It's safe for concurrent use by multiple goroutines.
*   **`sql.Open()`**: Establishes a connection to the database (or rather, opens the driver). Does *not* verify the connection is valid.
*   **`db.Ping()`**: Verifies the database connection is alive.
*   **`db.Exec()`**: For queries that don't return rows (e.g., `INSERT`, `UPDATE`, `DELETE`, `CREATE TABLE`). Returns `sql.Result`.
*   **`db.Query()`**: For queries that return rows (e.g., `SELECT`). Returns `sql.Rows`.
*   **`db.QueryRow()`**: For queries expected to return at most one row. Returns `sql.Row`.
*   **`rows.Scan()` / `row.Scan()`**: Populates Go variables from database columns.
*   **Prepared Statements**: Use `db.Prepare()` to precompile SQL statements, which can improve performance and prevent SQL injection.

### Example: PostgreSQL with `pgx` driver

First, install the `pgx` driver:
```bash
go get github.com/jackc/pgx/v5
```

```go
package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"time"

	_ "github.com/jackc/pgx/v5/stdlib" // Standard library compatible driver for pgx
)

type Product struct {
	ID        int
	Name      string
	Price     float64
	CreatedAt time.Time
}

func main() {
	// Database connection string
	// Replace with your actual database URL
	connStr := "postgresql://user:password@localhost:5432/mydatabase?sslmode=disable"

	db, err := sql.Open("pgx", connStr)
	if err != nil {
		log.Fatalf("Unable to connect to database: %v\n", err)
	}
	defer db.Close()

	// Ping the database to verify connection
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err = db.PingContext(ctx)
	if err != nil {
		log.Fatalf("Cannot ping database: %v\n", err)
	}
	fmt.Println("Successfully connected to PostgreSQL!")

	// 1. Create a table
	createTableSQL := `
	CREATE TABLE IF NOT EXISTS products (
		id SERIAL PRIMARY KEY,
		name VARCHAR(255) NOT NULL,
		price NUMERIC(10, 2) NOT NULL,
		created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
	);`
	_, err = db.ExecContext(ctx, createTableSQL)
	if err != nil {
		log.Fatalf("Error creating table: %v\n", err)
	}
	fmt.Println("Table 'products' created or already exists.")

	// 2. Insert a product
	insertSQL := `INSERT INTO products (name, price) VALUES ($1, $2) RETURNING id`
	var productID int
	err = db.QueryRowContext(ctx, insertSQL, "Laptop", 1200.50).Scan(&productID)
	if err != nil {
		log.Fatalf("Error inserting product: %v\n", err)
	}
	fmt.Printf("Inserted product with ID: %d\n", productID)

	// 3. Select products
	rows, err := db.QueryContext(ctx, `SELECT id, name, price, created_at FROM products WHERE price > $1`, 1000.00)
	if err != nil {
		log.Fatalf("Error querying products: %v\n", err)
	}
	defer rows.Close()

	fmt.Println("\nProducts over $1000:")
	for rows.Next() {
		var p Product
		if err := rows.Scan(&p.ID, &p.Name, &p.Price, &p.CreatedAt); err != nil {
			log.Fatalf("Error scanning product row: %v\n", err)
		}
		fmt.Printf("  ID: %d, Name: %s, Price: %.2f, CreatedAt: %s\n", p.ID, p.Name, p.Price, p.CreatedAt.Format(time.RFC3339))
	}
	if err = rows.Err(); err != nil {
		log.Fatalf("Error iterating rows: %v\n", err)
	}

	// 4. Update a product
	updateSQL := `UPDATE products SET price = $1 WHERE name = $2`
	result, err := db.ExecContext(ctx, updateSQL, 1250.00, "Laptop")
	if err != nil {
		log.Fatalf("Error updating product: %v\n", err)
	}
	rowsAffected, _ := result.RowsAffected()
	fmt.Printf("\nUpdated %d product(s).\n", rowsAffected)
}
```

## 2. ORMs and Query Builders

While `database/sql` is powerful, it can involve boilerplate code for complex operations. ORMs (Object-Relational Mappers) and query builders abstract away SQL, mapping database tables to Go structs.

*   **GORM**: A popular ORM that aims to be developer-friendly. It provides methods for CRUD operations, associations, migrations, and more, typically working with Go structs.
    *   **Pros**: High abstraction, simplifies complex queries, supports various databases.
    *   **Cons**: Can hide SQL details, potential for N+1 problems if not careful.
*   **SQLC**: Generates type-safe Go code from raw SQL queries. You write SQL, and SQLC generates Go functions that call the SQL and handle scanning results.
    *   **Pros**: Keeps SQL explicit, type-safe, compile-time checks, minimal runtime overhead.
    *   **Cons**: Less abstraction, requires writing all SQL manually.
*   **sqlx**: An extension to `database/sql` that provides helper functions for common tasks, like easily scanning rows into structs and handling named parameters. It's a lightweight layer over the standard library.
    *   **Pros**: Bridging gap between raw `database/sql` and full ORMs, improved convenience, still close to SQL.
    *   **Cons**: Less abstraction than GORM, more verbose than SQLC for some operations.

## 3. NoSQL Databases in Go

NoSQL databases offer flexible schemas and are optimized for specific data models and use cases, such as high-performance key-value stores or document databases.

### Redis (Key-Value Store, Cache, Message Broker)

Redis is an in-memory data structure store, used as a database, cache, and message broker. Go clients like `go-redis` (`github.com/go-redis/redis/v8`) make interaction straightforward.

```bash
go get github.com/go-redis/redis/v8
```

```go
package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/go-redis/redis/v8"
)

var ctx = context.Background()

func main() {
	rdb := redis.NewClient(&redis.Options{
		Addr:     "localhost:6379", // Redis server address
		Password: "",               // No password set
		DB:       0,                // Default DB
	})

	// Ping to check connection
	_, err := rdb.Ping(ctx).Result()
	if err != nil {
		log.Fatalf("Could not connect to Redis: %v", err)
	}
	fmt.Println("Successfully connected to Redis!")

	// Set a key-value pair
	err = rdb.Set(ctx, "mykey", "myvalue", 0).Err() // 0 expiration means no expiration
	if err != nil {
		log.Fatalf("Could not set key: %v", err)
	}
	fmt.Println("Set 'mykey' to 'myvalue'")

	// Get a value by key
	val, err := rdb.Get(ctx, "mykey").Result()
	if err != nil {
		log.Fatalf("Could not get key: %v", err)
	}
	fmt.Printf("Got 'mykey': %s\n", val)

	// Set with expiration
	err = rdb.Set(ctx, "volatile_key", "expires_soon", 10*time.Second).Err()
	if err != nil {
		log.Fatalf("Could not set volatile_key: %v", err)
	}
	fmt.Println("Set 'volatile_key' with 10s expiration.")

	// Check if a key exists
	exists, err := rdb.Exists(ctx, "mykey").Result()
	if err != nil {
		log.Fatalf("Could not check existence: %v", err)
	}
	fmt.Printf("Does 'mykey' exist? %d\n", exists)

	// Delete a key
	delCount, err := rdb.Del(ctx, "mykey").Result()
	if err != nil {
		log.Fatalf("Could not delete key: %v", err)
	}
	fmt.Printf("Deleted %d key(s).\n", delCount)
}
```

### MongoDB (Document Database)

MongoDB is a popular NoSQL document database, storing data in flexible, JSON-like documents. The official Go driver (`go.mongodb.org/mongo-driver`) is used for interaction.

```bash
go get go.mongodb.org/mongo-driver/mongo
```

Basic connection:
```go
package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/bson" // For BSON operations
)

func main() {
	// Set client options
	clientOptions := options.Client().ApplyURI("mongodb://localhost:27017")

	// Connect to MongoDB
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Fatalf("Error connecting to MongoDB: %v", err)
	}
	defer func() {
		if err = client.Disconnect(ctx); err != nil {
			log.Fatalf("Error disconnecting from MongoDB: %v", err)
		}
	}()

	// Ping the primary to verify connection
	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatalf("Could not ping MongoDB: %v", err)
	}
	fmt.Println("Successfully connected to MongoDB!")

	// Access a collection
	collection := client.Database("testdb").Collection("users")

	// Insert a single document
	user := bson.D{{"name", "Alice"}, {"age", 30}}
	insertResult, err := collection.InsertOne(ctx, user)
	if err != nil {
		log.Fatalf("Error inserting document: %v", err)
	}
	fmt.Printf("Inserted a single document with ID: %v\n", insertResult.InsertedID)

	// Find a single document
	var result bson.M
	err = collection.FindOne(ctx, bson.M{"name": "Alice"}).Decode(&result)
	if err != nil {
		log.Fatalf("Error finding document: %v", err)
	}
	fmt.Printf("Found document: %v\n", result)
}
```

## Quick Check / Exercises

1.  Explain the primary difference between `db.Exec()` and `db.Query()` in Go's `database/sql` package, and when you would use each.
2.  Name two advantages of using an ORM like GORM compared to directly using `database/sql` for complex applications.
3.  Describe a use case where Redis would be a more suitable choice for data persistence than PostgreSQL.