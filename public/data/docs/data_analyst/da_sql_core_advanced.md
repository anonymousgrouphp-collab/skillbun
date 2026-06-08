# Advanced SQL for Data Querying & Performance

This study guide covers advanced SQL constructs and essential database concepts for efficient data querying and performance optimization. Mastering these topics is crucial for any data analyst working with large datasets.

## 1. Advanced SQL Querying Techniques

### 1.1. Joins

Joins are fundamental for combining data from multiple tables. While `INNER JOIN` is common, advanced scenarios require a deeper understanding of other join types.

*   **INNER JOIN**: Returns rows when there is a match in both tables.
*   **LEFT (OUTER) JOIN**: Returns all rows from the left table, and the matching rows from the right table. If there is no match, `NULL` is returned for the right table's columns.
*   **RIGHT (OUTER) JOIN**: Returns all rows from the right table, and the matching rows from the left table. If there is no match, `NULL` is returned for the left table's columns.
*   **FULL (OUTER) JOIN**: Returns all rows when there is a match in one of the tables. If no match, `NULL` is returned for the side that does not have a match.
*   **CROSS JOIN**: Returns the Cartesian product of the rows from the joined tables (each row from the first table combined with each row from the second table). Typically used carefully.
*   **SELF JOIN**: A table is joined with itself. Useful for comparing rows within the same table.

```sql
SELECT
    e.employee_name,
    m.employee_name AS manager_name
FROM
    Employees e
LEFT JOIN
    Employees m ON e.manager_id = m.employee_id;
```

### 1.2. Grouping & Aggregation (GROUP BY, HAVING)

`GROUP BY` is used with aggregate functions (e.g., `COUNT`, `SUM`, `AVG`, `MAX`, `MIN`) to group rows that have the same values in specified columns into a set of summary rows. `HAVING` is used to filter these groups based on a specified condition, similar to how `WHERE` filters individual rows.

```sql
SELECT
    department_id,
    COUNT(employee_id) AS total_employees,
    AVG(salary) AS avg_salary
FROM
    Employees
GROUP BY
    department_id
HAVING
    AVG(salary) > 60000;
```

### 1.3. Common Table Expressions (CTEs)

CTEs are temporary, named result sets that you can reference within a single SQL statement (SELECT, INSERT, UPDATE, DELETE). They improve readability, modularity, and can simplify complex queries by breaking them into logical, readable steps.

```sql
WITH HighEarners AS (
    SELECT
        employee_id,
        employee_name,
        salary
    FROM
        Employees
    WHERE
        salary > 70000
)
SELECT
    he.employee_name,
    he.salary
FROM
    HighEarners he
JOIN
    Departments d ON he.department_id = d.department_id;
```

### 1.4. Window Functions

Window functions perform calculations across a set of table rows that are somehow related to the current row. Unlike `GROUP BY`, window functions do not collapse rows into a single output row; they return a value for each row, based on the window.

*   **Ranking Functions**: `ROW_NUMBER()`, `RANK()`, `DENSE_RANK()`, `NTILE()`
*   **Analytic Functions**: `LAG()`, `LEAD()`, `FIRST_VALUE()`, `LAST_VALUE()`
*   **Aggregate Functions**: `SUM() OVER()`, `AVG() OVER()`, `COUNT() OVER()`

```sql
SELECT
    employee_name,
    department_id,
    salary,
    RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) AS salary_rank_in_dept
FROM
    Employees;
```

### 1.5. Subqueries

Subqueries (or inner queries) are queries nested inside another SQL query. They can be used in `SELECT`, `FROM`, `WHERE`, and `HAVING` clauses. They can be correlated (dependent on the outer query) or non-correlated (independent).

```sql
SELECT
    employee_name,
    salary
FROM
    Employees
WHERE
    department_id IN (SELECT department_id FROM Departments WHERE department_name = 'Sales');
```

### 1.6. Complex CASE Statements

`CASE` statements allow you to implement `IF-THEN-ELSE` logic directly within your SQL queries, enabling conditional outputs based on specified criteria.

```sql
SELECT
    order_id,
    order_total,
    CASE
        WHEN order_total > 1000 THEN 'High Value'
        WHEN order_total > 500 THEN 'Medium Value'
        ELSE 'Low Value'
    END AS order_category
FROM
    Orders;
```

### 1.7. Stored Procedures

Stored procedures are pre-compiled SQL statements stored in the database. They can encapsulate complex logic, improve performance by reducing network traffic, enhance security, and promote code reusability.

```sql
-- Example (syntax varies by RDBMS, e.g., SQL Server)
CREATE PROCEDURE GetHighSalaryEmployees
    @MinSalary DECIMAL(10, 2)
AS
BEGIN
    SELECT
        employee_name,
        salary
    FROM
        Employees
    WHERE
        salary >= @MinSalary;
END;

-- EXEC GetHighSalaryEmployees 75000;
```

## 2. Database Design & Performance

### 2.1. Basic Database Design: Normalization

Normalization is the process of organizing the columns and tables of a relational database to minimize data redundancy and improve data integrity.

*   **First Normal Form (1NF)**: Each column contains atomic (indivisible) values, and there are no repeating groups of columns.
*   **Second Normal Form (2NF)**: Is in 1NF and all non-key attributes are fully functionally dependent on the primary key.
*   **Third Normal Form (3NF)**: Is in 2NF and all non-key attributes are non-transitively dependent on the primary key (i.e., no column depends on another non-key column).

### 2.2. Indexing Strategies

Indexes are special lookup tables that the database search engine can use to speed up data retrieval. They are crucial for performance on large datasets but add overhead to data modification operations.

*   **Clustered Index**: Determines the physical order of data in the table. A table can have only one clustered index (e.g., often on the Primary Key).
*   **Non-Clustered Index**: Stores the data logically sorted, but the physical order of the rows is not affected. It contains pointers to the actual data rows.
*   **When to use**: On columns frequently used in `WHERE` clauses, `JOIN` conditions, `ORDER BY` clauses, and `GROUP BY` clauses.
*   **When to avoid**: On small tables, columns with very few unique values, or columns that are frequently updated.

### 2.3. Query Optimization Techniques

Optimizing queries ensures efficient data retrieval, especially critical for large databases.

*   **`EXPLAIN` / `EXPLAIN ANALYZE`**: Use your RDBMS's `EXPLAIN` command (e.g., `EXPLAIN PLAN` in Oracle, `EXPLAIN` in MySQL/PostgreSQL) to understand how the database executes a query. This shows the execution plan, including join types, index usage, and scan methods.
*   **Avoid `SELECT *`**: Explicitly list the columns you need to reduce data transfer and processing.
*   **Minimize Subqueries**: While useful, deeply nested or correlated subqueries can sometimes be less efficient than `JOIN`s or `CTE`s. Evaluate alternatives.
*   **Proper Indexing**: Ensure relevant columns are indexed. Regularly review and maintain indexes.
*   **Filter Early**: Apply `WHERE` clauses as early as possible to reduce the dataset size before expensive operations like joins or aggregations.
*   **Understand `JOIN` Types**: Choose the most appropriate `JOIN` type. `INNER JOIN` is often faster than `LEFT JOIN` if the filter conditions can be applied early.
*   **Limit Results**: Use `LIMIT` or `TOP` to retrieve only the necessary number of rows, especially for previewing data.

## Checklist / Exercise

1.  **Window Function Application**: Write a SQL query using a window function to find the second highest salary within each department.
2.  **CTE Refactoring**: Rewrite a complex query that uses multiple subqueries into a more readable version using Common Table Expressions.
3.  **Indexing Strategy**: For a table with `order_id`, `customer_id`, `order_date`, and `total_amount`, which columns would you consider indexing and why, if you frequently query orders by `customer_id` and sort results by `order_date`?
