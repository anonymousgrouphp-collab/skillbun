# Relational Database Fundamentals

Welcome to the foundational module on Relational Database Fundamentals! As a Database Administrator (DBA), a deep understanding of how relational databases function is paramount. This guide will equip you with the core concepts, architecture, design principles, and essential SQL knowledge, with a practical focus on PostgreSQL.

## 1. What is a Relational Database?

A Relational Database Management System (RDBMS) organizes data into one or more tables (or "relations") of rows and columns. Each table is a collection of related data entries, and each row represents a record, while each column represents an attribute.

**Core Concepts:**
*   **Tables:** The primary structure for storing data, also known as relations.
*   **Rows (Tuples):** Individual records within a table.
*   **Columns (Attributes):** Specific fields within a table that hold data for each row.
*   **Keys:**
    *   **Primary Key:** Uniquely identifies each row in a table. It cannot contain NULL values and must be unique.
    *   **Foreign Key:** A column (or set of columns) that refers to the primary key of another table, establishing a link between them. This enforces referential integrity.
*   **Data Integrity:** Ensuring the accuracy and consistency of data over its entire lifecycle.
    *   **Entity Integrity:** No primary key column can have NULL values.
    *   **Referential Integrity:** Foreign key values must either match a primary key value in the referenced table or be NULL.

## 2. Relational Database Architecture

RDBMS architecture typically follows a client-server model. Clients (applications, users) send requests to the database server, which processes them and returns results.

**Key Components within a Database Server:**
*   **Storage Manager:** Manages the physical storage of data on disk, including file organization, indexing, and buffering.
*   **Query Processor:** Parses, optimizes, and executes SQL queries. It transforms SQL into an execution plan.
*   **Transaction Manager:** Ensures the reliability of transactions by enforcing ACID properties. It handles concurrency control and recovery.
*   **Buffer Manager:** Manages the caching of data blocks in memory to reduce disk I/O.

**PostgreSQL Specifics:**
PostgreSQL uses a process-based architecture. The `postmaster` process is the parent process that listens for client connections. For each new connection, `postmaster` forks a new `postgres` backend process to handle the client's session. Other background processes include the WAL writer, background writer, autovacuum launcher, etc.

## 3. Schema Design Principles

Effective schema design is crucial for database performance, scalability, and maintainability.

*   **Entity-Relationship (ER) Modeling:** A high-level conceptual data model that describes entities (objects of interest), their attributes, and relationships between them.
*   **Normalization:** A process of organizing columns and tables in a relational database to minimize data redundancy and improve data integrity.
    *   **1st Normal Form (1NF):** Eliminate repeating groups in tables. Each column must contain atomic (indivisible) values.
    *   **2nd Normal Form (2NF):** Be in 1NF and all non-key attributes must be fully functionally dependent on the primary key. (Eliminate partial dependencies).
    *   **3rd Normal Form (3NF):** Be in 2NF and eliminate transitive dependencies. (Non-key attributes should not depend on other non-key attributes).
    *   *Note:* Higher forms (BCNF, 4NF, 5NF) exist but 3NF is often sufficient for practical applications.
*   **Data Types:** Choosing appropriate data types minimizes storage requirements and improves query performance.
    *   **Common PostgreSQL Data Types:** `INTEGER`, `BIGINT`, `VARCHAR(n)`, `TEXT`, `BOOLEAN`, `DATE`, `TIMESTAMP`, `NUMERIC(p,s)`, `UUID`.
*   **Indexes:** Special lookup tables that the database search engine can use to speed up data retrieval.
    *   **Primary Key Index:** Automatically created for primary keys.
    *   **B-tree Index:** Most common type, suitable for equality and range queries.
    *   **GIN/GIST Index:** For complex data types like JSONB, arrays, full-text search.

## 4. Transaction Management (ACID Properties)

A transaction is a single logical unit of work performed on a database. RDBMS ensure transaction reliability through ACID properties:

*   **Atomicity:** A transaction is treated as a single, indivisible unit. Either all operations within it complete successfully, or none do. If any part fails, the entire transaction is rolled back.
*   **Consistency:** A transaction brings the database from one valid state to another. It must not violate any defined integrity constraints (e.g., primary key, foreign key, check constraints).
*   **Isolation:** Concurrent transactions execute independently without interfering with each other. The final state of the database should be the same as if the transactions were executed serially.
    *   **PostgreSQL Isolation Levels:** `READ COMMITTED` (default), `REPEATABLE READ`, `SERIALIZABLE`.
*   **Durability:** Once a transaction is committed, its changes are permanently stored and survive system failures (e.g., power loss).

## 5. Essential SQL Knowledge

SQL (Structured Query Language) is the standard language for interacting with relational databases.

### Data Definition Language (DDL)
Used for defining and managing database schema.

```sql
-- Create a new table
CREATE TABLE Customers (
    customer_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE,
    registration_date DATE DEFAULT CURRENT_DATE
);

-- Add a new column to an existing table
ALTER TABLE Customers ADD COLUMN phone_number VARCHAR(20);

-- Drop a table
DROP TABLE IF EXISTS Customers;
```

### Data Manipulation Language (DML)
Used for managing data within schema objects.

```sql
-- Insert new records
INSERT INTO Customers (first_name, last_name, email)
VALUES ('John', 'Doe', 'john.doe@example.com'),
       ('Jane', 'Smith', 'jane.smith@example.com');

-- Select data
SELECT customer_id, first_name, last_name FROM Customers WHERE registration_date = '2023-01-01';

-- Update records
UPDATE Customers
SET email = 'john.d@example.com'
WHERE customer_id = 1;

-- Delete records
DELETE FROM Customers
WHERE customer_id = 2;
```

### Basic Queries and Operators
*   **WHERE Clause:** Filters rows based on specified conditions.
*   **ORDER BY Clause:** Sorts the result set.
*   **GROUP BY Clause:** Groups rows that have the same values in specified columns into a summary row. Often used with aggregate functions (COUNT, SUM, AVG, MIN, MAX).
*   **JOINs:** Combine rows from two or more tables based on a related column between them.
    *   `INNER JOIN`: Returns rows when there is a match in both tables.
    *   `LEFT JOIN` (or `LEFT OUTER JOIN`): Returns all rows from the left table, and the matching rows from the right table. If no match, NULL is returned for right side.
    *   `RIGHT JOIN` (or `RIGHT OUTER JOIN`): Similar to `LEFT JOIN`, but returns all rows from the right table.
    *   `FULL JOIN` (or `FULL OUTER JOIN`): Returns rows when there is a match in one of the tables.

## Checklist/Exercises:

1.  Explain the purpose of a Primary Key and a Foreign Key, and how they contribute to data integrity.
2.  Describe the four ACID properties of database transactions and provide a real-world scenario where violating one of them could lead to data inconsistencies.
3.  Given two tables `Orders (order_id PK, customer_id FK, order_date)` and `Customers (customer_id PK, customer_name)`, write a PostgreSQL SQL query to retrieve the `order_id` and `customer_name` for all orders placed on '2023-01-15'.