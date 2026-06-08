### Advanced SQL & Relational Databases - Study Guide

#### 1. Introduction
Advanced SQL and a deep understanding of Relational Database Management Systems (RDBMS) are crucial for Data Engineers. This guide will propel your SQL proficiency beyond basic CRUD operations into complex querying, performance optimization, and fundamental database design principles. Mastering these concepts ensures efficient data handling, robust system design, and optimized analytical capabilities.

#### 2. Advanced SQL Constructs

##### 2.1 Window Functions
Window functions perform calculations across a set of table rows that are related to the current row, without reducing the number of rows returned by the query. They are powerful for analytical tasks like calculating moving averages, rankings, or cumulative sums.

*   **Core Concepts**:
    *   `OVER()` clause: Defines the window (set of rows) for the function.
    *   `PARTITION BY`: Divides the rows into groups within the window.
    *   `ORDER BY`: Orders rows within each partition.
    *   Common functions: `ROW_NUMBER()`, `RANK()`, `DENSE_RANK()`, `NTILE()`, `LAG()`, `LEAD()`, `NTH_VALUE()`, `FIRST_VALUE()`, `LAST_VALUE()`.

*   **Example**: Calculate the running total of sales per product category.

    ```sql
    SELECT
        order_id,
        product_category,
        sale_amount,
        SUM(sale_amount) OVER (PARTITION BY product_category ORDER BY order_id) AS running_total_sales
    FROM
        sales_data;
    ```

##### 2.2 Common Table Expressions (CTEs)
CTEs (Common Table Expressions), introduced with the `WITH` clause, help break down complex queries into readable, manageable logical units. They act like temporary, named result sets that you can reference within a single SQL statement (SELECT, INSERT, UPDATE, DELETE).

*   **Core Concepts**:
    *   Enhance readability and maintainability of complex queries.
    *   Can be self-referencing (recursive CTEs), useful for hierarchical data.
    *   Only exist for the duration of the query execution.

*   **Example**: Find the average sales for each product category and then list products whose sales exceed that average.

    ```sql
    WITH CategoryAverage AS (
        SELECT
            product_category,
            AVG(sale_amount) AS avg_category_sale
        FROM
            sales_data
        GROUP BY
            product_category
    )
    SELECT
        s.product_name,
        s.sale_amount,
        ca.avg_category_sale
    FROM
        sales_data s
    JOIN
        CategoryAverage ca ON s.product_category = ca.product_category
    WHERE
        s.sale_amount > ca.avg_category_sale;
    ```

##### 2.3 Complex Queries & Subqueries
Beyond basic `JOIN`s, complex queries often involve multiple subqueries, correlated subqueries, or advanced `CASE` statements. Understanding `EXISTS`, `NOT EXISTS`, `ALL`, and `ANY` operators is vital for efficient data filtering and comparison.

#### 3. Relational Database Management Systems (RDBMS) Concepts

##### 3.1 ACID Properties
ACID is an acronym for Atomicity, Consistency, Isolation, and Durability. These are a set of properties that guarantee that database transactions are processed reliably.

*   **Atomicity**: A transaction is treated as a single, indivisible unit. Either all its operations are completed, or none are.
*   **Consistency**: A transaction brings the database from one valid state to another. Data integrity rules are maintained.

*   **Isolation**: Concurrent transactions execute independently without interfering with each other. The result of concurrent transactions is the same as if they were executed serially.
*   **Durability**: Once a transaction is committed, its changes are permanent and survive system failures.

##### 3.2 Transactions
A transaction is a single logical unit of work performed on a database. It ensures data integrity when multiple operations need to be performed together.

*   **Syntax**:
    ```sql
    BEGIN TRANSACTION; -- or START TRANSACTION
    -- SQL statements (e.g., INSERT, UPDATE, DELETE)
    IF condition_met THEN
        COMMIT;
    ELSE
        ROLLBACK;
    END IF;
    ```
    `COMMIT` makes all changes permanent. `ROLLBACK` undoes all changes since `BEGIN TRANSACTION`.

##### 3.3 Database Normalization
Normalization is the process of organizing the columns and tables of a relational database to minimize data redundancy and improve data integrity.

*   **Normal Forms**:
    *   **1NF (First Normal Form)**: Eliminate repeating groups in tables. Each column contains atomic values.
    *   **2NF (Second Normal Form)**: Must be in 1NF. Non-key attributes must be fully dependent on the primary key (no partial dependency).
    *   **3NF (Third Normal Form)**: Must be in 2NF. No transitive dependencies (non-key attributes should not depend on other non-key attributes).
    *   **BCNF (Boyce-Codd Normal Form)**: A stricter version of 3NF. Every determinant must be a candidate key.

##### 3.4 Denormalization
Denormalization is the process of intentionally introducing redundancy into a database by adding duplicate data or grouping data to improve read performance. It's often used in data warehousing or OLAP systems where read speed is critical and write operations are less frequent.

#### 4. Performance Optimization

##### 4.1 Indexing
An index is a special lookup table that the database search engine can use to speed up data retrieval. Think of it like an index in a book.

*   **Types**: B-tree (most common), Hash, Bitmap.
*   **When to use**: On columns frequently used in `WHERE` clauses, `JOIN` conditions, `ORDER BY` clauses, or `GROUP BY` clauses.
*   **When to avoid**: On columns with very few unique values, small tables, or columns that are updated very frequently.

*   **Example**: Create an index on the `customer_id` column.

    ```sql
    CREATE INDEX idx_customer_id ON customers (customer_id);
    ```

##### 4.2 Query Plans (Execution Plans)
A query plan is a sequence of operations that the database system performs to execute a SQL query. Analyzing query plans helps identify bottlenecks and understand how the database retrieves data.

*   **Tools**: `EXPLAIN` (PostgreSQL, MySQL), `EXPLAIN ANALYZE` (PostgreSQL - also executes the query and shows actual timings).
*   **Key elements**: Table scans (full or index), join types (nested loop, hash, merge), sorts, aggregations.

##### 4.3 Query Optimization Techniques
*   **Select specific columns**: `SELECT column1, column2` instead of `SELECT *`.
*   **Avoid `OR` in `WHERE` clauses where possible**: `UNION ALL` or `IN` might be faster if indices are involved.
*   **Optimize `JOIN` clauses**: Ensure join conditions are indexed.
*   **Filter early**: Apply `WHERE` clauses as early as possible to reduce the dataset size before other operations.
*   **Use `LIMIT`**: Restrict the number of rows returned if only a sample is needed.

#### 5. Quick Checklist/Exercise

1.  **Window Function Application**: Write a SQL query using a window function to find the top 3 highest-selling products within each `region`.
2.  **CTE Refactoring**: You have a complex query with multiple nested subqueries. Explain how you would refactor it using CTEs to improve readability and maintainability.
3.  **Normalization vs. Denormalization**: Describe a scenario where denormalization would be beneficial for performance, even though it introduces data redundancy.