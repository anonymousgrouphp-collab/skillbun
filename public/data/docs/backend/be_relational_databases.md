## Relational Databases (SQL, PostgreSQL, MySQL) - Study Guide

Relational databases are fundamental to modern backend development, offering a structured way to store and manage data. This guide will help you master SQL for interacting with these databases, with a focus on PostgreSQL and MySQL, covering everything from basic queries to advanced features and performance optimization.

### 1. Introduction to Relational Databases and SQL

**Relational Databases** organize data into one or more tables (or "relations") of rows and columns. Each row represents a record, and each column represents an attribute. Relationships between tables are established using primary and foreign keys.

**SQL (Structured Query Language)** is the standard language for managing and manipulating relational databases. It's used for defining, querying, and updating data, as well as controlling access to the database.

**PostgreSQL and MySQL** are two of the most popular open-source relational database management systems (RDBMS). While both adhere to the SQL standard, they have distinct features, performance characteristics, and communities.

### 2. Core SQL Concepts

SQL is broadly categorized into several sub-languages:

*   **Data Definition Language (DDL):** Used for defining database schema.
    *   `CREATE TABLE`: To create new tables.
    *   `ALTER TABLE`: To modify existing table structures.
    *   `DROP TABLE`: To delete tables.
    *   `CREATE INDEX`: To create indexes for performance.

    **Example (DDL): Creating a `Products` table**
    ```sql
    CREATE TABLE Products (
        product_id INT PRIMARY KEY AUTO_INCREMENT,
        product_name VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        stock_quantity INT DEFAULT 0
    );
    ```

*   **Data Manipulation Language (DML):** Used for managing data within schema objects.
    *   `SELECT`: To retrieve data from tables.
    *   `INSERT INTO`: To add new rows to a table.
    *   `UPDATE`: To modify existing rows in a table.
    *   `DELETE FROM`: To remove rows from a table.

    **Example (DML): Selecting all products with price > 50**
    ```sql
    SELECT product_id, product_name, price
    FROM Products
    WHERE price > 50.00;
    ```

*   **Data Control Language (DCL):** Used for controlling access to data and the database.
    *   `GRANT`: To give users specific privileges.
    *   `REVOKE`: To remove user privileges.

*   **Transaction Control Language (TCL):** Used for managing transactions in a database.
    *   `COMMIT`: To save changes permanently.
    *   `ROLLBACK`: To undo changes since the last `COMMIT` or `SAVEPOINT`.
    *   `SAVEPOINT`: To set a point within a transaction to which you can later roll back.

### 3. Advanced SQL Concepts

#### A. Complex Joins

Joins are used to combine rows from two or more tables based on a related column between them.

*   **`INNER JOIN`**: Returns rows when there is a match in *both* tables.
*   **`LEFT JOIN` (or `LEFT OUTER JOIN`)**: Returns all rows from the left table, and the matched rows from the right table. If no match, `NULL` for right table columns.
*   **`RIGHT JOIN` (or `RIGHT OUTER JOIN`)**: Returns all rows from the right table, and the matched rows from the left table. If no match, `NULL` for left table columns.
*   **`FULL JOIN` (or `FULL OUTER JOIN`)**: Returns all rows when there is a match in one of the tables. Returns `NULL` where there is no match.

    **Example: Joining `Orders` and `Customers` tables**
    ```sql
    SELECT c.customer_name, o.order_id, o.order_date
    FROM Customers c
    INNER JOIN Orders o ON c.customer_id = o.customer_id
    WHERE o.order_date >= '2023-01-01';
    ```

#### B. Subqueries

A subquery (or inner query) is a query nested inside another SQL query. It can be used in `SELECT`, `INSERT`, `UPDATE`, `DELETE` statements, as well as `WHERE`, `FROM`, and `HAVING` clauses.

    **Example: Finding products with a price higher than the average price**
    ```sql
    SELECT product_name, price
    FROM Products
    WHERE price > (SELECT AVG(price) FROM Products);
    ```

#### C. Transactions

Transactions ensure data integrity by grouping multiple database operations into a single logical unit. They adhere to **ACID properties**:
*   **Atomicity:** All operations in a transaction succeed, or none do.
*   **Consistency:** A transaction brings the database from one valid state to another.
*   **Isolation:** Concurrent transactions execute independently without interfering with each other.
*   **Durability:** Once a transaction is committed, its changes are permanent.

    **Example: Transferring funds in a bank (simplified)**
    ```sql
    START TRANSACTION;
    UPDATE Accounts SET balance = balance - 100 WHERE account_id = 1;
    UPDATE Accounts SET balance = balance + 100 WHERE account_id = 2;
    -- If any error occurs, ROLLBACK; otherwise, COMMIT;
    COMMIT;
    ```

#### D. Stored Procedures and Functions

*   **Stored Procedures:** Pre-compiled SQL code blocks stored in the database. They can accept parameters, execute complex logic, and return multiple result sets. They are useful for encapsulating business logic, improving performance, and enhancing security.
*   **Functions:** Similar to stored procedures but must return a single value and can be used within SQL expressions.

    **Example (MySQL): Simple stored procedure**
    ```sql
    DELIMITER //
    CREATE PROCEDURE GetProductDetails (IN p_product_id INT)
    BEGIN
        SELECT product_name, price, stock_quantity
        FROM Products
        WHERE product_id = p_product_id;
    END //
    DELIMITER ;

    -- To call the procedure:
    CALL GetProductDetails(101);
    ```

#### E. Performance Tuning

Optimizing database performance is crucial for scalable applications. Key strategies include:

*   **Indexing:** Create appropriate indexes on frequently queried columns (especially those used in `WHERE` clauses, `JOIN` conditions, and `ORDER BY`). Be mindful of write performance impact.
*   **Query Optimization:** Use `EXPLAIN` (or `EXPLAIN ANALYZE` in PostgreSQL) to understand query execution plans. Rewrite inefficient queries.
*   **Schema Design:** Normalize your database to reduce data redundancy, but consider strategic denormalization for read-heavy workloads.
*   **Hardware and Configuration:** Ensure sufficient CPU, RAM, and fast I/O. Tune database server configuration parameters (e.g., buffer sizes, connection limits).
*   **Connection Pooling:** Efficiently manage database connections from your application.

### 4. PostgreSQL vs. MySQL (Key Differences)

Both are excellent choices, but here are some common perceptions:

*   **PostgreSQL:** Often considered more feature-rich, robust, and extensible, with strong support for complex queries, advanced data types (e.g., JSONB), and concurrency control (MVCC). Favored for data warehousing and complex enterprise applications.
*   **MySQL:** Known for its ease of use, speed, and wide adoption in web applications (LAMP stack). Strong community support and tools. Good for high-read, simpler transaction workloads. Offers different storage engines (e.g., InnoDB, MyISAM).

### Quick Checklist/Exercise:

1.  **DDL Practice:** Write SQL to create two tables: `Authors` (id, name) and `Books` (id, title, author_id). Ensure `author_id` is a foreign key referencing `Authors.id`.
2.  **DML and Join Practice:** Insert sample data into your `Authors` and `Books` tables. Then, write a query using an `INNER JOIN` to list all book titles along with their author names.
3.  **Transaction Concept:** Explain why transferring money between two bank accounts *must* be handled within a database transaction, referring to the ACID properties.