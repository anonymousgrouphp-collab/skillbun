# SQL Essentials for Data Extraction

This guide covers the fundamental SQL clauses essential for efficient data extraction, filtering, and aggregation from relational databases. Mastering these concepts is crucial for any BI Developer.

## 1. SELECT and FROM

These are the most basic clauses used to retrieve data. `SELECT` specifies the columns you want to retrieve, while `FROM` indicates the table(s) from which to retrieve them.

*   **`SELECT *`**: Retrieves all columns from the specified table.
*   **`SELECT column1, column2`**: Retrieves only specified columns.
*   **Aliases (`AS`)**: Used to give a temporary name to a column or table, making the output more readable.

**Syntax:**
```sql
SELECT column1, column2 AS alias_name
FROM table_name;
```

**Example:**
```sql
SELECT OrderID, OrderDate, CustomerID
FROM Orders;

SELECT ProductName AS Item, UnitPrice
FROM Products;
```

## 2. WHERE Clause

The `WHERE` clause is used to filter records based on specified conditions, returning only the rows that satisfy the condition.

*   **Comparison Operators**: `=`, `!=` (or `<>`), `>`, `<`, `>=`, `<=`
*   **Logical Operators**: `AND`, `OR`, `NOT`
*   **Special Operators**:
    *   `IN`: Specifies multiple possible values for a column.
    *   `BETWEEN`: Filters values within a given range.
    *   `LIKE`: Searches for a specified pattern in a column (e.g., `%` for any sequence of characters, `_` for any single character).
    *   `IS NULL` / `IS NOT NULL`: Tests for NULL values.

**Syntax:**
```sql
SELECT column1, column2
FROM table_name
WHERE condition;
```

**Example:**
```sql
SELECT ProductName, UnitPrice
FROM Products
WHERE UnitPrice > 50 AND CategoryID = 1;

SELECT CustomerName
FROM Customers
WHERE Country IN ('USA', 'Canada') OR City LIKE 'L%';
```

## 3. GROUP BY Clause

The `GROUP BY` clause groups rows that have the same values in specified columns into summary rows. It is often used with aggregate functions to perform calculations on each group.

*   **Aggregate Functions**: `COUNT()`, `SUM()`, `AVG()`, `MIN()`, `MAX()`

**Syntax:**
```sql
SELECT column1, aggregate_function(column2)
FROM table_name
GROUP BY column1;
```

**Example:**
```sql
SELECT CustomerID, COUNT(OrderID) AS TotalOrders
FROM Orders
GROUP BY CustomerID;

SELECT CategoryID, AVG(UnitPrice) AS AveragePrice
FROM Products
GROUP BY CategoryID;
```

## 4. HAVING Clause

The `HAVING` clause is used to filter groups based on conditions, similar to `WHERE` but applied after `GROUP BY`. It filters the results of aggregate functions.

**Syntax:**
```sql
SELECT column1, aggregate_function(column2)
FROM table_name
GROUP BY column1
HAVING condition_on_aggregate;
```

**Example:**
```sql
SELECT CustomerID, COUNT(OrderID) AS TotalOrders
FROM Orders
GROUP BY CustomerID
HAVING COUNT(OrderID) > 5;

SELECT CategoryID, AVG(UnitPrice) AS AveragePrice
FROM Products
GROUP BY CategoryID
HAVING AVG(UnitPrice) < 30;
```

## 5. ORDER BY Clause

The `ORDER BY` clause is used to sort the result-set of a query by one or more columns. By default, it sorts in ascending order.

*   **`ASC`**: Ascending (default).
*   **`DESC`**: Descending.

**Syntax:**
```sql
SELECT column1, column2
FROM table_name
ORDER BY column1 ASC|DESC, column2 ASC|DESC;
```

**Example:**
```sql
SELECT ProductName, UnitPrice
FROM Products
ORDER BY UnitPrice DESC;

SELECT CustomerName, City
FROM Customers
ORDER BY City ASC, CustomerName ASC;
```

## 6. Understanding SQL JOINs

`JOIN` clauses are used to combine rows from two or more tables based on a related column between them. They are fundamental for integrating data from different parts of a relational database.

### 6.1. INNER JOIN
Returns only the rows that have matching values in both tables.

**Syntax:**
```sql
SELECT T1.column, T2.column
FROM Table1 AS T1
INNER JOIN Table2 AS T2 ON T1.matching_column = T2.matching_column;
```

**Example:**
```sql
SELECT O.OrderID, C.CustomerName
FROM Orders AS O
INNER JOIN Customers AS C ON O.CustomerID = C.CustomerID;
```

### 6.2. LEFT JOIN (LEFT OUTER JOIN)
Returns all rows from the left table, and the matching rows from the right table. If there is no match in the right table, `NULL` values are returned for the right table's columns.

**Syntax:**
```sql
SELECT T1.column, T2.column
FROM Table1 AS T1
LEFT JOIN Table2 AS T2 ON T1.matching_column = T2.matching_column;
```

**Example:**
```sql
SELECT C.CustomerName, O.OrderID
FROM Customers AS C
LEFT JOIN Orders AS O ON C.CustomerID = O.CustomerID;
```

### 6.3. RIGHT JOIN (RIGHT OUTER JOIN)
Returns all rows from the right table, and the matching rows from the left table. If there is no match in the left table, `NULL` values are returned for the left table's columns.

**Syntax:**
```sql
SELECT T1.column, T2.column
FROM Table1 AS T1
RIGHT JOIN Table2 AS T2 ON T1.matching_column = T2.matching_column;
```

**Example:**
```sql
SELECT P.ProductName, OD.Quantity
FROM Products AS P
RIGHT JOIN OrderDetails AS OD ON P.ProductID = OD.ProductID;
```

### 6.4. FULL JOIN (FULL OUTER JOIN)
Returns all rows when there is a match in either the left or the right table. If there are rows in one table that do not have matches in the other, `NULL` values are returned for the non-matching side.

**Syntax:**
```sql
SELECT T1.column, T2.column
FROM Table1 AS T1
FULL OUTER JOIN Table2 AS T2 ON T1.matching_column = T2.matching_column;
```

**Example:**
```sql
SELECT C.CustomerName, O.OrderID
FROM Customers AS C
FULL OUTER JOIN Orders AS O ON C.CustomerID = O.CustomerID
WHERE C.CustomerID IS NULL OR O.CustomerID IS NULL; -- To find non-matching records
```

## Quick Check / Exercise

1.  Write a SQL query to find the names of products that have a `UnitPrice` greater than 25 and belong to `CategoryID` 3. Order the results by `ProductName` in ascending order.
2.  You have two tables: `Employees` (columns: `EmployeeID`, `Name`, `DepartmentID`) and `Departments` (columns: `DepartmentID`, `DepartmentName`). Write a query to list all employees and their respective department names. Include employees even if they are not assigned to any department yet.
3.  Write a query to calculate the total number of orders for each customer, but only include customers who have placed more than 10 orders. Display `CustomerID` and `TotalOrders`.
