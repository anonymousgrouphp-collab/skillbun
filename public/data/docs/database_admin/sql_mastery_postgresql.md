# SQL Mastery & Advanced Querying (PostgreSQL) Study Guide

This guide delves into advanced SQL concepts specific to PostgreSQL, equipping you with the skills to write efficient, powerful, and maintainable database queries and objects. We'll cover everything from data definition and manipulation to advanced querying techniques, procedural programming, and performance optimization.

## 1. SQL Fundamentals Refresher

A quick overview of the core SQL categories:

*   **DDL (Data Definition Language):** Used to define and manage database objects.
    *   `CREATE`: To create databases, tables, views, functions, etc.
    *   `ALTER`: To modify existing database objects.
    *   `DROP`: To delete database objects.
    *   `TRUNCATE`: To remove all records from a table quickly, resetting identity sequences.
    *   `RENAME`: To rename database objects.
    ```sql
    -- Example: DDL
    CREATE TABLE products (
        product_id SERIAL PRIMARY KEY,
        product_name VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) DEFAULT 0.00
    );
    ALTER TABLE products ADD COLUMN description TEXT;
    ```

*   **DML (Data Manipulation Language):** Used to manage data within schema objects.
    *   `SELECT`: To retrieve data.
    *   `INSERT`: To add new rows.
    *   `UPDATE`: To modify existing rows.
    *   `DELETE`: To remove rows.
    *   **PostgreSQL specific: UPSERT (`INSERT ... ON CONFLICT`)**: A powerful way to insert a row if it doesn't exist, or update it if it does.
    ```sql
    -- Example: DML (UPSERT)
    INSERT INTO products (product_id, product_name, price)
    VALUES (1, 'Laptop', 1200.00)
    ON CONFLICT (product_id) DO UPDATE
    SET product_name = EXCLUDED.product_name, price = EXCLUDED.price;
    ```

*   **DCL (Data Control Language):** Used to manage user permissions and control access to the database.
    *   `GRANT`: To give users specific privileges.
    *   `REVOKE`: To remove privileges.
    ```sql
    -- Example: DCL
    GRANT SELECT, INSERT ON products TO sales_user;
    REVOKE DELETE ON products FROM sales_user;
    ```

## 2. Advanced Joins

Beyond basic `INNER` and `LEFT` joins, PostgreSQL offers powerful joining capabilities:

*   **`CROSS JOIN`**: Produces a Cartesian product (every row from the first table joined with every row from the second table).
    ```sql
    SELECT * FROM table_a CROSS JOIN table_b;
    ```

*   **`SELF JOIN`**: Joining a table to itself. Useful for comparing rows within the same table, e.g., finding employees who earn more than their managers.
    ```sql
    SELECT e1.employee_name, e2.employee_name AS manager_name
    FROM employees e1 JOIN employees e2 ON e1.manager_id = e2.employee_id
    WHERE e1.salary > e2.salary;
    ```

*   **`LATERAL JOIN` (PostgreSQL Specific)**: A powerful feature where the right-hand side of the `LATERAL` clause can reference columns from the left-hand side. It's similar to a correlated subquery but often more efficient and expressive for complex scenarios like "top-N per group".
    ```sql
    -- Example: Find the top 2 products for each category
    SELECT c.category_name, p.product_name, p.price
    FROM categories c,
    LATERAL (
        SELECT product_name, price
        FROM products
        WHERE products.category_id = c.category_id
        ORDER BY price DESC
        LIMIT 2
    ) AS p;
    ```

## 3. Common Table Expressions (CTEs)

CTEs, defined with the `WITH` clause, enhance query readability and simplify complex, multi-step calculations. They are temporary, named result sets.

*   **Non-Recursive CTEs**: For breaking down complex queries into logical, readable steps.
    ```sql
    WITH monthly_sales AS (
        SELECT
            EXTRACT(YEAR FROM order_date) AS sales_year,
            EXTRACT(MONTH FROM order_date) AS sales_month,
            SUM(total_amount) AS total_sales
        FROM orders
        GROUP BY 1, 2
    )
    SELECT sales_year, sales_month, total_sales
    FROM monthly_sales
    WHERE sales_year = 2023
    ORDER BY sales_month;
    ```

*   **Recursive CTEs**: Used for querying hierarchical or graph-like data (e.g., organizational charts, bill of materials). They have an anchor member (initial query) and a recursive member (references the CTE itself).
    ```sql
    WITH RECURSIVE subordinates AS (
        SELECT employee_id, manager_id, employee_name, 0 AS level
        FROM employees
        WHERE employee_id = 101 -- Starting with a specific manager
        UNION ALL
        SELECT e.employee_id, e.manager_id, e.employee_name, s.level + 1
        FROM employees e
        INNER JOIN subordinates s ON e.manager_id = s.employee_id
    )
    SELECT * FROM subordinates;
    ```

## 4. Window Functions

Window functions perform calculations across a set of table rows that are somehow related to the current row, without grouping them into a single output row (unlike aggregate functions). They operate on a "window" of rows defined by the `OVER()` clause.

*   **Syntax**: `function_name(...) OVER ([PARTITION BY expr,...] [ORDER BY expr [ASC|DESC],...] [frame_clause])`
*   **Ranking Functions**:
    *   `ROW_NUMBER()`: Assigns a unique sequential integer to each row within its partition.
    *   `RANK()`: Assigns the same rank to rows with identical values in the `ORDER BY` clause, with gaps in the sequence.
    *   `DENSE_RANK()`: Similar to `RANK()`, but without gaps.
    *   `NTILE(N)`: Divides rows into `N` groups.
*   **Analytic Functions**:
    *   `LAG(expression, offset, default)`: Accesses data from a previous row.
    *   `LEAD(expression, offset, default)`: Accesses data from a subsequent row.
    *   `FIRST_VALUE(expression)` / `LAST_VALUE(expression)`: Returns the value of the expression from the first/last row of the window frame.
*   **Aggregate Functions as Window Functions**: `SUM()`, `AVG()`, `COUNT()`, `MIN()`, `MAX()` can be used with `OVER()` to perform cumulative or running calculations.
*   **Frame Clauses**: `ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`, `RANGE BETWEEN ...`.
    ```sql
    -- Example: Calculate a running total and rank products by price within categories
    SELECT
        product_name,
        category_id,
        price,
        SUM(price) OVER (PARTITION BY category_id ORDER BY price) AS running_category_total,
        RANK() OVER (PARTITION BY category_id ORDER BY price DESC) AS price_rank_in_category
    FROM products;
    ```

## 5. Stored Procedures & User-Defined Functions (UDFs)

PostgreSQL supports procedural language PL/pgSQL for creating complex logic server-side.

*   **User-Defined Functions (UDFs)**: Designed to return a value (or a set of values). They can be used in `SELECT`, `WHERE`, `HAVING` clauses.
    ```sql
    CREATE FUNCTION get_product_price(p_product_id INT)
    RETURNS DECIMAL(10, 2)
    LANGUAGE plpgsql
    AS $$
    DECLARE
        product_price DECIMAL(10, 2);
    BEGIN
        SELECT price INTO product_price FROM products WHERE product_id = p_product_id;
        RETURN product_price;
    END;
    $$;

    -- Usage
    SELECT product_name, get_product_price(product_id) FROM products;
    ```

*   **Stored Procedures**: Introduced in PostgreSQL 11. Procedures do not return a value but are designed to execute a sequence of SQL statements, often involving transaction control (`COMMIT`, `ROLLBACK`).
    ```sql
    CREATE PROCEDURE update_product_stock(p_product_id INT, p_quantity_change INT)
    LANGUAGE plpgsql
    AS $$
    BEGIN
        UPDATE products
        SET stock_quantity = stock_quantity + p_quantity_change
        WHERE product_id = p_product_id;
        COMMIT; -- Procedures can manage transactions
    END;
    $$;

    -- Usage
    CALL update_product_stock(1, -5); -- Reduce stock for product_id 1 by 5
    ```

## 6. Triggers

Triggers are special kinds of functions that automatically execute (or "fire") when a specified event occurs in the database (e.g., `INSERT`, `UPDATE`, `DELETE`).

*   **Components**: A trigger event, a trigger function, and the `CREATE TRIGGER` statement linking them.
*   **Timing**: `BEFORE` or `AFTER` the event.
*   **Granularity**: `FOR EACH ROW` (fires for each row affected) or `FOR EACH STATEMENT` (fires once per statement).
    ```sql
    -- Example: Log product price changes
    CREATE TABLE product_price_audits (
        audit_id SERIAL PRIMARY KEY,
        product_id INT,
        old_price DECIMAL(10, 2),
        new_price DECIMAL(10, 2),
        change_date TIMESTAMP DEFAULT NOW()
    );

    CREATE FUNCTION log_price_change()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    AS $$
    BEGIN
        IF OLD.price IS DISTINCT FROM NEW.price THEN
            INSERT INTO product_price_audits (product_id, old_price, new_price)
            VALUES (OLD.product_id, OLD.price, NEW.price);
        END IF;
        RETURN NEW;
    END;
    $$;

    CREATE TRIGGER product_price_update_trigger
    AFTER UPDATE OF price ON products
    FOR EACH ROW
    EXECUTE FUNCTION log_price_change();
    ```

## 7. Views

Views are virtual tables based on the result-set of a SQL query. They don't store data themselves but provide a way to abstract complex queries, simplify data access, and enforce security.

*   **Standard Views (`CREATE VIEW`)**:
    ```sql
    CREATE VIEW high_value_products AS
    SELECT product_id, product_name, price
    FROM products
    WHERE price > 1000;

    -- Usage
    SELECT * FROM high_value_products;
    ```

*   **Materialized Views (`CREATE MATERIALIZED VIEW`)**: Unlike standard views, materialized views store the query result physically on disk. This improves read performance but requires periodic refreshing to get up-to-date data.
    ```sql
    CREATE MATERIALIZED VIEW daily_sales_summary AS
    SELECT
        order_date::date AS sales_day,
        COUNT(order_id) AS total_orders,
        SUM(total_amount) AS total_revenue
    FROM orders
    GROUP BY order_date::date
    ORDER BY sales_day;

    -- To refresh data
    REFRESH MATERIALIZED VIEW daily_sales_summary;
    ```

## 8. Query Execution Flow & Basic Optimization

Understanding how PostgreSQL executes queries is crucial for writing performant SQL.

*   **`EXPLAIN` and `EXPLAIN ANALYZE`**: These commands show the query plan – how PostgreSQL plans to retrieve and process data. `EXPLAIN ANALYZE` also executes the query and provides actual runtime statistics.
    ```sql
    EXPLAIN ANALYZE SELECT * FROM products WHERE price > 500 ORDER BY product_name;
    ```
    *   Look for expensive operations: `Seq Scan` on large tables (suggests missing indexes), `Hash Join` vs. `Nested Loop Join` (depends on data size), high `rows` and `actual time` values.
*   **Indexing**: Properly indexed columns significantly speed up `SELECT` queries, especially in `WHERE`, `JOIN`, `ORDER BY`, and `GROUP BY` clauses.
    *   `CREATE INDEX idx_products_price ON products (price);`
    *   Consider B-tree, Hash, GIN, GIST indexes based on data types and query patterns.
*   **Basic Optimization Tips**:
    *   Avoid `SELECT *` in production code; select only necessary columns.
    *   Filter data as early as possible (`WHERE` clause).
    *   Use appropriate data types.
    *   Normalize your database schema to reduce redundancy.
    *   Minimize subqueries; often, `JOIN`s or CTEs are more efficient.

## 9. PostgreSQL-Specific SQL Extensions & Features

PostgreSQL offers many powerful extensions:

*   **JSONB Data Type & Operators**: For efficient storage and querying of JSON data.
    *   `jsonb_insert()`, `jsonb_build_object()`, `->`, `->>`.
    *   `CREATE INDEX idx_users_metadata_gin ON users USING GIN (metadata);` (for `jsonb` columns).
    ```sql
    SELECT data->>'name' AS item_name FROM json_data WHERE data @> '{"status": "active"}';
    ```
*   **Array Data Type & Functions**: Store lists of values directly in a column.
    *   `array_append()`, `unnest()`, `@>`, `<@`.
    ```sql
    SELECT * FROM orders WHERE 'Laptop' = ANY(items_ordered);
    ```
*   **`GENERATE_SERIES()`**: Creates a series of numbers, timestamps, or dates. Useful for generating test data or time-based reports.
    ```sql
    SELECT generate_series(1, 10) AS num;
    SELECT generate_series('2023-01-01'::date, '2023-01-31'::date, '1 day'::interval) AS day;
    ```
*   **`UUID` Data Type**: For globally unique identifiers, often used as primary keys.
    *   `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`
    *   `SELECT uuid_generate_v4();`
*   **`LISTEN` / `NOTIFY`**: A messaging system for inter-process communication within PostgreSQL, often used for real-time applications or caching invalidation.

## Checklist / Exercise

1.  **CTE Challenge**: Write a SQL query using a non-recursive CTE to find the average order value for each customer, and then list customers whose average order value is above the overall average order value across all customers.
2.  **Window Function Application**: Using the `products` table (assuming it has `product_id`, `product_name`, `category_id`, `price`), write a query to find the second most expensive product in each `category_id`.
3.  **Optimization Identification**: You have a query `SELECT customer_name, total_orders FROM customers WHERE registration_date < '2023-01-01' ORDER BY total_orders DESC;`. Describe at least two potential optimization strategies for this query in PostgreSQL, assuming `customers` is a large table.