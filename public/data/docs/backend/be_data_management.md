# Data Management & Storage

As a backend developer, mastering data management and storage is fundamental. It's the art and science of efficiently storing, retrieving, and organizing data to ensure your applications are robust, scalable, and performant. This guide will walk you through essential concepts, from understanding various database types to optimizing query performance.

## 1. Understanding Database Types

Databases are broadly categorized into two main types: Relational (SQL) and Non-Relational (NoSQL).

### 1.1 Relational Databases (SQL)

Relational databases store data in tables, which are structured with rows and columns. They enforce a schema, ensuring data integrity through relationships between tables. They are ideal for applications requiring ACID (Atomicity, Consistency, Isolation, Durability) properties, complex queries, and structured data.

*   **Core Concepts:**
    *   **Tables:** Collections of related data organized into rows and columns.
    *   **Rows (Records):** Individual entries in a table.
    *   **Columns (Fields):** Attributes of the data, each with a specific data type.
    *   **Primary Key:** Uniquely identifies each row in a table.
    *   **Foreign Key:** Establishes a link between data in two tables.
    *   **Normalization:** Organizing data to reduce redundancy and improve data integrity.
*   **Popular Examples:** PostgreSQL, MySQL, SQL Server, Oracle.
*   **When to Use:** Financial systems, e-commerce platforms, applications with complex relationships, reporting.

#### SQL Query Example:

```sql
-- Create a 'users' table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL
);

-- Create an 'orders' table linked to 'users'
CREATE TABLE orders (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    order_date DATE NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Insert data
INSERT INTO users (username, email) VALUES ('johndoe', 'john.doe@example.com');
INSERT INTO orders (user_id, order_date, total_amount) VALUES (1, '2023-10-26', 99.99);

-- Select data with a JOIN
SELECT u.username, o.order_id, o.total_amount
FROM users u
JOIN orders o ON u.id = o.user_id
WHERE u.username = 'johndoe';
```

### 1.2 Non-Relational Databases (NoSQL)

NoSQL databases provide a mechanism for storage and retrieval of data that is modeled in means other than the tabular relations used in relational databases. They are designed for flexibility, scalability, and handling large volumes of unstructured or semi-structured data, often prioritizing availability and partition tolerance over strict consistency (BASE properties).

*   **Core Concepts:**
    *   **Schema-less:** Flexible schema, allowing for varied data structures within the same collection/document.
    *   **Horizontal Scalability:** Easier to scale out by adding more servers.
    *   **BASE Properties:** Basically Available, Soft state, Eventually consistent.
*   **Types of NoSQL Databases:**
    *   **Document Databases:** Store data in flexible, semi-structured documents (e.g., JSON, BSON). Ideal for content management, user profiles. (e.g., MongoDB, Couchbase)
    *   **Key-Value Stores:** Simple data model where data is stored as a collection of key-value pairs. Highly scalable for simple lookups. (e.g., Redis, DynamoDB)
    *   **Column-Family Stores:** Store data in columns rather than rows. Optimized for analytical queries and large datasets. (e.g., Cassandra, HBase)
    *   **Graph Databases:** Store data in a graph structure of nodes and edges. Ideal for social networks, recommendation engines. (e.g., Neo4j, ArangoDB)

#### MongoDB Example (Document Database):

```javascript
// Connect to MongoDB and switch to 'mydatabase'
use mydatabase;

// Insert a document into the 'products' collection
db.products.insertOne({
  name: "Laptop Pro",
  brand: "TechCo",
  price: 1200,
  features: ["16GB RAM", "512GB SSD", "Intel i7"],
  availability: {
    inStock: true,
    quantity: 50
  }
});

// Find all products with price less than 1500
db.products.find({ price: { $lt: 1500 } }).pretty();

// Update a product's price
db.products.updateOne(
  { name: "Laptop Pro" },
  { $set: { price: 1150, "availability.quantity": 45 } }
);
```

## 2. Data Modeling

Data modeling is the process of creating a visual representation or blueprint for the database, defining how data is structured and related.

*   **For Relational Databases:** Often involves Entity-Relationship Diagrams (ERDs) to map out entities, attributes, and relationships. Normalization is a key technique to reduce data redundancy and improve data integrity.
*   **For NoSQL Databases:** Focuses on access patterns. Denormalization is common to optimize for read performance, often embedding related data within documents to minimize joins.

## 3. Querying & Indexing

Efficient querying is crucial for application performance. Understanding how to retrieve data effectively and how to optimize those retrievals is a core skill.

*   **Querying Techniques:**
    *   **SQL:** `SELECT`, `INSERT`, `UPDATE`, `DELETE` statements, `JOIN` operations (INNER, LEFT, RIGHT, FULL), `GROUP BY`, `ORDER BY`, `WHERE` clauses.
    *   **NoSQL:** Each database type has its own query language or API (e.g., MongoDB Query Language, Redis commands, Cassandra Query Language (CQL)).
*   **Indexing:** An index is a special lookup table that the database search engine can use to speed up data retrieval. Without indexes, the database might have to scan every row to find the requested data, which is slow for large tables.
    *   **How it works:** Similar to an index in a book, it maps a value to the physical location of the data.
    *   **Trade-offs:** Indexes consume disk space and can slow down write operations (INSERT, UPDATE, DELETE) because the index also needs to be updated.

#### Indexing Example (SQL):

```sql
-- Create an index on the 'email' column of the 'users' table
CREATE INDEX idx_users_email ON users (email);

-- Explain the query plan to see if the index is used
EXPLAIN SELECT * FROM users WHERE email = 'john.doe@example.com';
```

## 4. Database Optimization & Scalability

Ensuring your database can handle increasing loads and remains performant is vital.

*   **Query Optimization:** Analyze slow queries using tools like `EXPLAIN` (SQL) to understand execution plans and identify bottlenecks. Refactor queries, add appropriate indexes.
*   **Caching:** Store frequently accessed data in a faster, temporary storage layer (e.g., Redis, Memcached) to reduce the load on the primary database.
*   **Replication:** Creating multiple copies of your database. Provides high availability (if the primary fails, a replica can take over) and can distribute read loads (read replicas).
*   **Sharding (Horizontal Partitioning):** Distributing data across multiple independent database servers (shards). Each shard holds a subset of the total data. This allows for massive horizontal scaling.

## Quick Understanding Checklist/Exercise:

1.  **Scenario Analysis:** You need to build a backend for a social media application that stores user profiles, posts, and complex friend connections. Which type of database (Relational, Document, Graph, Key-Value) would be most suitable for managing the friend connections, and why?
2.  **Indexing Impact:** Explain a situation where adding an index to a database table might *decrease* overall write performance but *significantly improve* read performance. Provide a concrete example.
3.  **SQL Query Design:** You have two tables: `authors` (id, name) and `books` (id, title, author_id, publication_year). Write a single SQL query to retrieve the `name` of all authors who have published a book after the year 2020, along with the `title` of those books. Each author-book pair should appear on its own row.