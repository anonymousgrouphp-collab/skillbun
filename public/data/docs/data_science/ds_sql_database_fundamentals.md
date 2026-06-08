# SQL and Database Fundamentals: Study Guide

SQL (Structured Query Language) is the backbone for managing and manipulating data in relational databases. This guide covers the essential concepts and commands required to interact with databases, extract information, and prepare it for analysis.

## 1. Relational Database Concepts

A relational database organizes data into one or more tables (relations) of rows and columns.

*   **Tables:** Collections of related data organized into rows and columns. Each table represents a specific entity (e.g., `Customers`, `Products`).
*   **Rows (Records/Tuples):** A single entry in a table, representing a single instance of the entity.
*   **Columns (Fields/Attributes):** Represent specific data points or characteristics of the entity (e.g., `customer_name`, `product_price`).
*   **Primary Key (PK):** A column (or set of columns) that uniquely identifies each row in a table. It cannot contain NULL values and must be unique.
*   **Foreign Key (FK):** A column (or set of columns) in one table that refers to the Primary Key in another table. It establishes a link between two tables, enforcing referential integrity.
*   **Database Schema:** The logical design or structure of the entire database, defining how data is organized and the relationships between tables.

## 2. Basic SQL Commands (Data Query Language - DQL)

### 2.1. Retrieving Data: `SELECT` Statement

The `SELECT` statement is used to fetch data from a database.

*   **Selecting all columns:**
    ```sql
    SELECT *
    FROM table_name;
    ```
*   **Selecting specific columns:**
    ```sql
    SELECT column1, column2
    FROM table_name;
    ```

### 2.2. Filtering Data: `WHERE` Clause

The `WHERE` clause is used to filter records based on specified conditions.

```sql
SELECT column1, column2
FROM table_name
WHERE condition;
```
**Operators:** `=`, `<>`, `>`, `<`, `>=`, `<=`, `LIKE`, `IN`, `BETWEEN`, `AND`, `OR`, `NOT`, `IS NULL`, `IS NOT NULL`.

### 2.3. Sorting Data: `ORDER BY` Clause

`ORDER BY` sorts the result-set in ascending (ASC, default) or descending (DESC) order.

```sql
SELECT column1, column2
FROM table_name
ORDER BY column1 ASC, column2 DESC;
```

### 2.4. Limiting Results: `LIMIT` Clause (MySQL/PostgreSQL) or `TOP` (SQL Server)

Used to restrict the number of rows returned by the query.

```sql
SELECT *
FROM table_name
LIMIT 10; -- Returns the first 10 rows
```

## 3. Data Manipulation Language (DML) Basics

These commands are used to add, modify, and delete data in a database.

### 3.1. Inserting Data: `INSERT INTO`

```sql
INSERT INTO table_name (column1, column2)
VALUES (value1, value2);

-- Or for all columns:
INSERT INTO table_name
VALUES (value1, value2, value3);
```

### 3.2. Updating Data: `UPDATE`

Modifies existing records in a table. **Always use `WHERE` to avoid updating all rows!**

```sql
UPDATE table_name
SET column1 = new_value1, column2 = new_value2
WHERE condition;
```

### 3.3. Deleting Data: `DELETE FROM`

Deletes existing records in a table. **Always use `WHERE` to avoid deleting all rows!**

```sql
DELETE FROM table_name
WHERE condition;
```

## 4. Advanced SQL Concepts

### 4.1. Joining Tables: `JOIN` Clauses

`JOIN` is used to combine rows from two or more tables based on a related column between them.

*   **`INNER JOIN`**: Returns rows when there is a match in both tables.
*   **`LEFT JOIN` (or `LEFT OUTER JOIN`)**: Returns all rows from the left table, and the matched rows from the right table. NULLs for unmatched right rows.
*   **`RIGHT JOIN` (or `RIGHT OUTER JOIN`)**: Returns all rows from the right table, and the matched rows from the left table. NULLs for unmatched left rows.

```sql
SELECT Orders.OrderID, Customers.CustomerName
FROM Orders
INNER JOIN Customers ON Orders.CustomerID = Customers.CustomerID;
```

### 4.2. Aggregating Data: `GROUP BY` and Aggregate Functions

`GROUP BY` groups rows that have the same values in specified columns into summary rows. Aggregate functions perform calculations on a set of rows and return a single value.

*   **Aggregate Functions:** `COUNT()`, `SUM()`, `AVG()`, `MIN()`, `MAX()`.

```sql
SELECT Country, COUNT(CustomerID) AS TotalCustomers
FROM Customers
GROUP BY Country;
```

### 4.3. Filtering Groups: `HAVING` Clause

`HAVING` is used to filter results of aggregate functions, similar to `WHERE` but applied after `GROUP BY`.

```sql
SELECT Country, COUNT(CustomerID) AS TotalCustomers
FROM Customers
GROUP BY Country
HAVING COUNT(CustomerID) > 5;
```

## Practical Example

Let's imagine we have two tables: `Products` (ProductID, ProductName, Price, CategoryID) and `Categories` (CategoryID, CategoryName).

```sql
-- Create sample tables (for demonstration, not part of typical query)
-- CREATE TABLE Categories (CategoryID INT PRIMARY KEY, CategoryName VARCHAR(50));
-- INSERT INTO Categories VALUES (1, 'Electronics'), (2, 'Books'), (3, 'Food');

-- CREATE TABLE Products (ProductID INT PRIMARY KEY, ProductName VARCHAR(100), Price DECIMAL(10, 2), CategoryID INT, FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID));
-- INSERT INTO Products VALUES (101, 'Laptop', 1200.00, 1), (102, 'The Hitchhiker''s Guide', 15.50, 2), (103, 'Smartphone', 800.00, 1), (104, 'Milk', 3.00, 3), (105, 'SQL Basics', 25.00, 2);

-- Query: Find the total number of products and their average price for each category,
-- but only for categories with more than one product.
SELECT
    C.CategoryName,
    COUNT(P.ProductID) AS NumberOfProducts,
    AVG(P.Price) AS AveragePrice
FROM
    Products AS P
INNER JOIN
    Categories AS C ON P.CategoryID = C.CategoryID
GROUP BY
    C.CategoryName
HAVING
    COUNT(P.ProductID) > 1
ORDER BY
    AveragePrice DESC;
```

## Checklist / Exercise

1.  Write a SQL query to select the `ProductName` and `Price` of all products that cost more than $500, ordered by price in descending order.
2.  Explain the difference between `INNER JOIN` and `LEFT JOIN`. When would you use each?
3.  Given a table `Employees` with columns `EmployeeID`, `FirstName`, `LastName`, `Department`, and `Salary`, write a query to find the total salary expense for each `Department`.
