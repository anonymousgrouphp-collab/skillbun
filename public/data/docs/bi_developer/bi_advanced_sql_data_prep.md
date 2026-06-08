# Advanced SQL for Data Preparation & Transformation

This guide delves into advanced SQL features essential for BI Developers to perform intricate data manipulation, preparation, and transformation tasks. Mastering these concepts will significantly enhance your ability to process complex datasets efficiently and produce highly refined data for analytical purposes.

## 1. Window Functions

Window functions perform calculations across a set of table rows that are somehow related to the current row. Unlike aggregate functions (like `SUM()`, `AVG()`), window functions do not group rows into a single output row; instead, they return a value for each row, based on the "window" of rows defined.

### Core Concepts

*   **`PARTITION BY`**: Divides the query result set into partitions to which the window function is applied. Similar to `GROUP BY` but doesn't collapse rows.
*   **`ORDER BY`**: Defines the logical order of rows within each partition.
*   **`OVER()` Clause**: Defines the window (set of rows) on which the window function operates.

### Common Window Functions

*   **`ROW_NUMBER()`**: Assigns a unique sequential integer to each row within its partition, starting with 1.
*   **`RANK()`**: Assigns a rank within its partition with gaps. If two rows have the same value, they get the same rank, and the next rank skips a number.
*   **`DENSE_RANK()`**: Assigns a rank within its partition without gaps. If two rows have the same value, they get the same rank, and the next rank is consecutive.
*   **`LAG(column, offset, default)`**: Accesses data from a previous row in the same result set without the use of a self-join.
*   **`LEAD(column, offset, default)`**: Accesses data from a subsequent row in the same result set.
*   **`NTILE(n)`**: Divides rows into `n` groups and assigns a group number to each row.

### Example: Ranking and Lag/Lead

```sql
SELECT
    OrderID,
    CustomerID,
    OrderDate,
    TotalAmount,
    ROW_NUMBER() OVER (PARTITION BY CustomerID ORDER BY OrderDate) AS RowNumPerCustomer,
    RANK() OVER (PARTITION BY CustomerID ORDER BY TotalAmount DESC) AS RankByAmountDesc,
    LAG(OrderDate, 1, '1900-01-01') OVER (PARTITION BY CustomerID ORDER BY OrderDate) AS PreviousOrderDate,
    LEAD(OrderDate, 1, '9999-12-31') OVER (PARTITION BY CustomerID ORDER BY OrderDate) AS NextOrderDate
FROM
    Orders;
```

## 2. Common Table Expressions (CTEs)

CTEs are temporary, named result sets that you can reference within a single SQL statement (SELECT, INSERT, UPDATE, DELETE). They improve query readability, allow for recursive queries, and help break down complex queries into logical, manageable steps.

### Syntax

```sql
WITH CTE_Name (Column1, Column2, ...) AS (
    -- CTE definition query
    SELECT Column1, Column2
    FROM YourTable
    WHERE Condition
)
-- Main query that uses the CTE
SELECT *
FROM CTE_Name
WHERE AnotherCondition;
```

### Example

```sql
WITH CustomerTotalSales AS (
    SELECT
        CustomerID,
        SUM(TotalAmount) AS LifetimeSales
    FROM
        Orders
    GROUP BY
        CustomerID
),
TopCustomers AS (
    SELECT
        CustomerID,
        LifetimeSales
    FROM
        CustomerTotalSales
    WHERE
        LifetimeSales > 1000
)
SELECT
    c.CustomerID,
    c.LifetimeSales,
    COUNT(o.OrderID) AS NumberOfOrders
FROM
    TopCustomers c
JOIN
    Orders o ON c.CustomerID = o.CustomerID
GROUP BY
    c.CustomerID, c.LifetimeSales
ORDER BY
    c.LifetimeSales DESC;
```

## 3. Subqueries

A subquery (or inner query) is a query nested inside another SQL query. It can return a single value (scalar subquery), a single row, a single column, or a table.

### Types & Use Cases

*   **`IN` / `NOT IN`**: Checks if a value is present in a list returned by the subquery.
*   **`EXISTS` / `NOT EXISTS`**: Checks for the existence of rows returned by the subquery. Often more efficient than `IN` for large result sets.
*   **Scalar Subquery**: Returns a single value. Can be used anywhere an expression is expected.
*   **Correlated Subquery**: Depends on the outer query for its values and executes once for each row processed by the outer query.

### Example

```sql
-- Scalar Subquery
SELECT
    ProductName,
    Price
FROM
    Products
WHERE
    Price > (SELECT AVG(Price) FROM Products);

-- EXISTS Subquery (Correlated)
SELECT
    c.CustomerID,
    c.CustomerName
FROM
    Customers c
WHERE
    EXISTS (SELECT 1 FROM Orders o WHERE o.CustomerID = c.CustomerID AND o.OrderDate >= '2023-01-01');
```

## 4. Views

A view is a virtual table based on the result-set of an SQL query. It contains rows and columns, just like a real table, but it does not store data itself. Instead, it derives its data from the tables on which it is based.

### Purpose

*   **Simplification**: Hides complex queries, joins, and calculations.
*   **Security**: Restricts access to specific rows and columns without granting full table permissions.
*   **Data Abstraction**: Presents data in a format suitable for specific applications or users.

### Syntax

```sql
CREATE VIEW ActiveCustomerOrders AS
SELECT
    c.CustomerID,
    c.CustomerName,
    o.OrderID,
    o.OrderDate,
    o.TotalAmount
FROM
    Customers c
JOIN
    Orders o ON c.CustomerID = o.CustomerID
WHERE
    c.IsActive = TRUE;

-- To query the view
SELECT * FROM ActiveCustomerOrders WHERE OrderDate >= '2024-01-01';
```

## 5. Stored Procedures

A stored procedure is a prepared SQL code that you can save and reuse. They encapsulate a set of SQL statements, making them powerful tools for complex operations, automation, and maintaining business logic.

### Benefits

*   **Reusability**: Execute the same code multiple times with different parameters.
*   **Performance**: Pre-compiled execution plans can lead to faster execution.
*   **Security**: Grant users permission to execute procedures without direct table access.
*   **Encapsulation**: Centralize and manage complex business logic.

### Syntax (Example for SQL Server/PostgreSQL concept)

```sql
-- SQL Server syntax example
CREATE PROCEDURE GetCustomerOrders
    @CustomerID INT,
    @MinOrderAmount DECIMAL(10, 2)
AS
BEGIN
    SELECT
        OrderID,
        OrderDate,
        TotalAmount
    FROM
        Orders
    WHERE
        CustomerID = @CustomerID
        AND TotalAmount >= @MinOrderAmount
    ORDER BY
        OrderDate DESC;
END;

-- Executing the procedure
EXEC GetCustomerOrders @CustomerID = 101, @MinOrderAmount = 50.00;
```

## 6. Complex Data Type Handling

Modern SQL databases often support complex data types like `JSON`, `XML`, `ARRAY`, or `STRUCT` (in analytical databases). Handling these types requires specific functions to extract, query, and manipulate their internal structure.

*   **JSON Handling (e.g., PostgreSQL, SQL Server, MySQL 8+)**:
    *   `JSON_VALUE()` / `->>`: Extract scalar values.
    *   `JSON_QUERY()` / `->`: Extract JSON objects or arrays.
    *   `JSON_TABLE()` (SQL standard, in MySQL, Oracle): Unnest JSON arrays into rows.
    *   `JSON_EACH()` (PostgreSQL): Expands the top-level JSON object into a set of key-value pairs.

*   **Array Handling (e.g., PostgreSQL)**:
    *   `ANY`, `ALL` operators: Check elements within an array.
    *   `UNNEST()`: Expands an array into a set of rows.
    *   `array_agg()`: Aggregate values into an array.

### Example: JSON in PostgreSQL

```sql
CREATE TABLE Products (
    ProductID SERIAL PRIMARY KEY,
    Details JSONB
);

INSERT INTO Products (Details) VALUES
('{"name": "Laptop", "specs": {"cpu": "i7", "ram": "16GB"}, "tags": ["electronics", "computing"]}'),
('{"name": "Mouse", "specs": {"type": "wireless"}, "tags": ["electronics", "peripherals"]}');

-- Querying JSON data
SELECT
    ProductID,
    Details ->> 'name' AS ProductName,
    Details -> 'specs' ->> 'cpu' AS CPU,
    Details -> 'tags' ->> 0 AS FirstTag -- Accessing array element
FROM
    Products
WHERE
    Details ->> 'name' = 'Laptop';
```

## Checklist/Exercise:

1.  Write a SQL query using `ROW_NUMBER()` to find the third most recent order for each customer from an `Orders` table (columns: `OrderID`, `CustomerID`, `OrderDate`).
2.  Refactor a query that calculates the average order value for customers who have placed more than 5 orders into two CTEs: one for customer order counts and another for average order value, then combine them.
3.  Create a view named `HighValueProducts` that shows `ProductID`, `ProductName`, and `Price` for all products with a `Price` greater than 100 from a `Products` table.