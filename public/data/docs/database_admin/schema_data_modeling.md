# Schema Design, Data Modeling & Constraints Study Guide

Database administrators must possess a strong understanding of schema design, data modeling, and constraints to build robust, efficient, and maintainable databases. This guide covers the foundational concepts and practical applications.

## 1. Data Modeling & Entity-Relationship Diagrams (ERDs)
Data modeling is the process of creating a visual representation or blueprint of a database system. It helps to define and analyze data requirements needed to support business processes.

*   **Conceptual Model**: High-level, business-oriented view of data.
*   **Logical Model**: More detailed, defines entities, attributes, and relationships without specific database technology.
*   **Physical Model**: The actual design implemented in a specific database system, including data types and constraints.

**Entity-Relationship Diagrams (ERDs)** are graphical tools used to represent the logical structure of a database.
*   **Entities**: Represent real-world objects or concepts (e.g., `Students`, `Courses`). Typically correspond to tables.
*   **Attributes**: Properties or characteristics of an entity (e.g., `student_id`, `first_name` for `Students`). Typically correspond to columns.
*   **Relationships**: Describe how entities are associated with each other (e.g., a `Student` *enrolls in* a `Course`).
    *   **One-to-One (1:1)**: E.g., a `User` has one `Profile`.
    *   **One-to-Many (1:N)**: E.g., a `Department` has many `Employees`.
    *   **Many-to-Many (N:M)**: E.g., `Students` can take many `Courses`, and `Courses` can have many `Students` (often resolved with a junction/associative table).

## 2. Database Normalization
Normalization is a systematic approach to decompose tables to eliminate data redundancy and improve data integrity. The goal is to reduce data anomalies (insertion, update, deletion).

*   **First Normal Form (1NF)**:
    *   Each column must contain atomic (indivisible) values.
    *   No repeating groups or arrays within a single column.
    *   Each row must be unique.
*   **Second Normal Form (2NF)**:
    *   Must be in 1NF.
    *   All non-key attributes must be fully dependent on the entire primary key. (Applies to tables with composite primary keys).
*   **Third Normal Form (3NF)**:
    *   Must be in 2NF.
    *   No transitive dependencies: non-key attributes should not depend on other non-key attributes.
*   **Boyce-Codd Normal Form (BCNF)**:
    *   A stricter version of 3NF. Every determinant (an attribute or set of attributes that determines another attribute) must be a candidate key.
    *   Addresses specific cases where 3NF might still allow anomalies (e.g., tables with overlapping composite candidate keys).

## 3. Choosing Appropriate Data Types
Selecting the correct data types is crucial for performance, storage efficiency, and data integrity. Incorrect choices can lead to data truncation, slower queries, or invalid data.

*   **Numeric**: `INT`, `BIGINT` (whole numbers), `DECIMAL`/`NUMERIC` (exact precision floating-point), `FLOAT`/`REAL` (approximate floating-point).
*   **String**: `VARCHAR(N)` (variable-length string up to N characters), `CHAR(N)` (fixed-length string), `TEXT` (large variable-length string).
*   **Date/Time**: `DATE` (date only), `TIME` (time only), `DATETIME`/`TIMESTAMP` (date and time).
*   **Boolean**: `BOOLEAN` (or `TINYINT(1)` in some systems).
*   **Binary**: `BLOB`, `VARBINARY` (for binary data like images or files).

## 4. Defining Constraints
Constraints are rules enforced by the database management system (DBMS) to limit the type of data that can be inserted or updated in a table, ensuring data integrity and reliability.

*   **PRIMARY KEY**: Uniquely identifies each record in a table. It must contain unique values and cannot contain `NULL` values. A table can have only one primary key.
*   **FOREIGN KEY**: Establishes a link between data in two tables. It points to a `PRIMARY KEY` or `UNIQUE` key in another (or the same) table, enforcing referential integrity (e.g., preventing deletion of a `Department` if `Employees` are still assigned to it).
*   **UNIQUE**: Ensures that all values in a column (or a group of columns) are distinct. Unlike a `PRIMARY KEY`, it can typically contain one `NULL` value.
*   **NOT NULL**: Ensures that a column cannot have a `NULL` value. Every row must have a value for that column.
*   **CHECK**: Defines a condition that all values in a column must satisfy. For example, `CHECK (Age >= 18)`.
*   **DEFAULT**: Provides a default value for a column if no value is explicitly specified during insertion.

## 5. Schema Migrations
Schema migration is the process of managing incremental, reversible changes to a database schema. As applications evolve, the database schema often needs to change to support new features or optimizations.

*   **Why use them?**: Automates database schema changes, ensures consistency across development, staging, and production environments, facilitates team collaboration, and provides version control for the database.
*   **Tools**: Frameworks specifically designed to handle schema migrations:
    *   **Flyway**: Simple, convention-based migration tool that uses SQL scripts. It maintains a schema history table to track applied migrations.
    *   **Liquibase**: More powerful and flexible, supporting various formats (SQL, XML, YAML, JSON) for defining changesets. It offers advanced features like rollbacks and context-aware migrations.

## Example: SQL Schema Design with Constraints
Let's design a simple schema for a `Library` system with `Books` and `Authors`.

```sql
-- Create Authors table
CREATE TABLE Authors (
    author_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE,
    birth_date DATE,
    CHECK (birth_date < CURRENT_DATE)
);

-- Create Books table
CREATE TABLE Books (
    book_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) UNIQUE NOT NULL,
    publication_year INT NOT NULL,
    isbn CHAR(13) UNIQUE NOT NULL,
    author_id INT NOT NULL,
    genre VARCHAR(50),
    stock_quantity INT DEFAULT 0,
    CHECK (publication_year > 1000 AND publication_year <= YEAR(CURRENT_DATE)),
    CHECK (stock_quantity >= 0),
    FOREIGN KEY (author_id) REFERENCES Authors(author_id) ON DELETE RESTRICT ON UPDATE CASCADE
);
```

## Quick Understanding Checklist/Exercise
1.  Describe a scenario where violating 3NF could lead to an update anomaly, and how normalizing to 3NF resolves it.
2.  You are designing a `Users` table. What constraints would you apply to an `email` column and why? What about a `password_hash` column?
3.  Imagine you have a `products` table and need to add a new column `last_modified_date`. Explain how a schema migration tool would handle this change and why it's beneficial over manual SQL execution.