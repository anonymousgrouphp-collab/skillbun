# Advanced SQL Proficiency Study Guide

This guide will help you master advanced SQL concepts crucial for data transformation, including window functions, Common Table Expressions (CTEs), subqueries, and initial performance considerations. Proficiency in these areas is vital for any Analytics Engineer looking to build robust and efficient data pipelines.

## 1. Window Functions

Window functions perform calculations across a set of table rows that are somehow related to the current row. Unlike aggregate functions (like `SUM()`, `AVG()`) which collapse rows into a single result, window functions return a value for *each* row, based on the defined "window" of rows.

### Core Concepts:
*   **`OVER()` Clause**: Defines the window or set of rows over which the function operates.
*   **`PARTITION BY`**: Divides the query's result set into partitions (groups) to which the window function is applied independently. It's similar to `GROUP BY` but doesn't collapse rows.
*   **`ORDER BY`**: Orders the rows within each partition. This is crucial for functions sensitive to order, like `ROW_NUMBER()`, `LAG()`, `LEAD()`, or cumulative sums.

### Common Window Functions:
*   **Ranking Functions**: `ROW_NUMBER()`, `RANK()`, `DENSE_RANK()`, `NTILE()`
*   **Analystic Functions**: `LAG()`, `LEAD()`, `FIRST_VALUE()`, `LAST_VALUE()`
*   **Aggregate Functions used as Window Functions**: `SUM() OVER()`, `AVG() OVER()`, `COUNT() OVER()`, `MAX() OVER()`, `MIN() OVER()`

### Example: Calculating a Running Total and Rank

Suppose you have a `sales` table with `order_id`, `customer_id`, `order_date`, and `amount`.

```sql
SELECT
    order_id,
    customer_id,
    order_date,
    amount,
    SUM(amount) OVER (PARTITION BY customer_id ORDER BY order_date) AS running_total_per_customer,
    ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date DESC) AS most_recent_order_rank
FROM
    sales;
```

## 2. Common Table Expressions (CTEs)

CTEs, defined using the `WITH` clause, provide a way to write auxiliary statements for use within a larger query. They improve query readability, modularity, and can simplify complex, multi-step data transformations.

### Core Concepts:
*   **Readability**: Break down complex queries into logical, named, and easier-to-understand blocks.
*   **Reusability**: A CTE can be referenced multiple times within the same subsequent `SELECT`, `INSERT`, `UPDATE`, or `DELETE` statement.
*   **Recursion (Advanced)**: CTEs can be self-referencing, allowing for recursive queries (e.g., traversing hierarchical data like organizational charts).

### Syntax:

```sql
WITH cte_name (column1, column2, ...) AS (
    -- CTE query definition
    SELECT column1, column2
    FROM your_table
    WHERE condition
),
another_cte AS (
    -- Another CTE that can reference cte_name
    SELECT a.column1, b.column_x
    FROM cte_name a
    JOIN another_table b ON a.column_y = b.column_y
)
-- Main query that uses the CTEs
SELECT c.column1, d.column_z
FROM another_cte c
JOIN yet_another_table d ON c.column2 = d.column_a
WHERE c.column1 > 100;
```

### Example: Calculating Average Sales per Region using CTEs

```sql
WITH RegionalSales AS (
    SELECT
        region,
        SUM(amount) AS total_region_sales
    FROM
        orders
    GROUP BY
        region
)
SELECT
    region,
    total_region_sales,
    total_region_sales / (SELECT SUM(total_region_sales) FROM RegionalSales) * 100 AS percentage_of_total_sales
FROM
    RegionalSales
ORDER BY
    total_region_sales DESC;
```

## 3. Subqueries

A subquery (also known as an inner query or inner select) is a query embedded inside another SQL query. Subqueries can be used in the `SELECT`, `FROM`, `WHERE`, `HAVING` clauses, and even with `INSERT`, `UPDATE`, `DELETE` statements.

### Core Concepts:
*   **Types**: Scalar (returns a single value), Row (returns a single row), Column (returns a single column), Table (returns multiple rows and columns).
*   **Placement**: Can be used with `IN`, `EXISTS`, comparison operators (`=`, `>`, `<`), etc.
*   **Correlation**: Correlated subqueries depend on the outer query for their execution.

### When to Use (and When Not To):
*   **Use when**: You need to filter data based on values derived from another query, or perform complex checks.
*   **Consider CTEs/JOINs when**: Readability is paramount, or when the subquery can be logically broken down or joined for better performance and clarity.

### Example: Finding Customers Who Placed Orders Above Average Value

```sql
SELECT
    customer_id,
    order_id,
    amount
FROM
    orders
WHERE
    amount > (
        SELECT AVG(amount)
        FROM orders
    );
```

## 4. Initial Performance Considerations

Writing efficient SQL is crucial for managing large datasets and ensuring responsive applications. Here are initial considerations for performance optimization:

*   **Indexing**: Create indexes on columns frequently used in `WHERE` clauses, `JOIN` conditions, and `ORDER BY` clauses. Indexes speed up data retrieval but can slow down data modification operations (INSERT, UPDATE, DELETE).
*   **`EXPLAIN` / `EXPLAIN ANALYZE`**: Use these commands to understand how your database executes a query. They show the query plan, including join methods, scan types, and execution times, helping identify bottlenecks.
    *   `EXPLAIN SELECT * FROM large_table WHERE column_x = 'value';`
*   **Avoid `SELECT *`**: Explicitly list the columns you need. This reduces network traffic, memory usage, and can allow the database to use covering indexes.
*   **Filter Early and Aggressively**: Apply `WHERE` clauses as early as possible to reduce the number of rows processed by subsequent operations like joins or aggregations.
*   **Understand JOIN Types**: Choose the most appropriate `JOIN` type (`INNER JOIN`, `LEFT JOIN`, `RIGHT JOIN`, `FULL OUTER JOIN`) based on your data and desired outcome to prevent unintended cartesian products or unnecessary row processing.
*   **Minimize Data Transfer**: If retrieving data from a remote server, only select necessary columns and filter rows on the server side before transferring data.

## Exercises / Checklist:

1.  **Window Function Application**: Write a query that calculates the difference in `amount` between each order and the previous order for the same customer, ordered by `order_date`.
2.  **CTE Refactoring**: Rewrite a complex query that uses multiple subqueries in the `WHERE` clause to instead use one or more CTEs, improving its readability.
3.  **Performance Hypothesis**: You have a query running slowly. Without looking at the `EXPLAIN` plan, list two common reasons for slow query performance and suggest a potential fix for each.
