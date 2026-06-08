# Database Design & Schema

Database design is the process of structuring and organizing data in a database. A well-designed database is crucial for application performance, scalability, maintainability, and data integrity. This study guide covers core principles, including modeling, normalization, indexing, and managing schema changes.

## 1. Entity-Relationship (ER) Diagrams

ER Diagrams are visual representations of the relationships between entities in a database. They help in conceptualizing the database structure before actual implementation.

- **Entities:** Real-world objects (e.g., `Customer`, `Product`, `Order`). Represented as rectangles.
- **Attributes:** Properties of an entity (e.g., `Customer` has `customer_id`, `name`, `email`). Represented as ovals connected to entities.
- **Relationships:** Associations between entities (e.g., a `Customer` *places* an `Order`). Represented as diamonds connecting entities.
- **Cardinality:** Defines the number of instances of one entity that can be associated with instances of another entity (e.g., One-to-One, One-to-Many, Many-to-Many).

## 2. Relational Schema Design

Translating an ER model into a relational schema involves defining tables, columns, primary keys, and foreign keys.

- **Tables:** Correspond to entities.
- **Columns:** Correspond to attributes.
- **Primary Key (PK):** A unique identifier for each record in a table (e.g., `customer_id` for `Customer` table).
- **Foreign Key (FK):** A column (or set of columns) in one table that refers to the primary key of another table, establishing a link between them (e.g., `customer_id` in an `Order` table linking to the `Customer` table).

**Example: Basic Relational Schema**

```sql
-- Customers Table
CREATE TABLE Customers (
    customer_id INT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE
);

-- Products Table
CREATE TABLE Products (
    product_id INT PRIMARY KEY,
    product_name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL
);

-- Orders Table (linking Customers and Products)
CREATE TABLE Orders (
    order_id INT PRIMARY KEY,
    customer_id INT NOT NULL,
    order_date DATE NOT NULL,
    total_amount DECIMAL(10, 2),
    FOREIGN KEY (customer_id) REFERENCES Customers(customer_id)
);

-- Order_Items Table (for Many-to-Many relationship between Orders and Products)
CREATE TABLE Order_Items (
    order_item_id INT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES Orders(order_id),
    FOREIGN KEY (product_id) REFERENCES Products(product_id)
);
```

## 3. Normalization Forms (1NF, 2NF, 3NF)

Normalization is a process of organizing the columns and tables of a relational database to minimize data redundancy and improve data integrity. The most common forms are:

-   **First Normal Form (1NF):**
    -   Each column must contain atomic (indivisible) values.
    -   No repeating groups or arrays within a single row.
    -   Each row must be unique.

-   **Second Normal Form (2NF):**
    -   Must be in 1NF.
    -   No non-prime attribute (an attribute not part of any candidate key) is dependent on only a part of a composite primary key.

-   **Third Normal Form (3NF):**
    -   Must be in 2NF.
    -   No transitive dependencies (i.e., no non-prime attribute is dependent on another non-prime attribute).

## 4. Indexing Strategies

Indexes are special lookup tables that the database search engine can use to speed up data retrieval. They are similar to an index in a book.

-   **How Indexes Work:** Indexes create a sorted data structure (like a B-tree) that points to the actual data rows. When you query data on an indexed column, the database can quickly find the relevant rows without scanning the entire table.
-   **Types of Indexes:**
    -   **Clustered Index:** Determines the physical order of data in a table. A table can have only one clustered index (often the Primary Key).
    -   **Non-Clustered Index:** Does not alter the physical order of the table. Stores the indexed columns and pointers to the actual data rows. A table can have multiple non-clustered indexes.
-   **When to Use Indexes:**
    -   On columns frequently used in `WHERE` clauses, `JOIN` conditions, `ORDER BY` clauses, or `GROUP BY` clauses.
    -   On columns with high cardinality (many distinct values).
-   **When to Avoid/Be Cautious:**
    -   On tables with very frequent `INSERT`, `UPDATE`, `DELETE` operations, as indexes need to be updated too, which adds overhead.
    -   On columns with very low cardinality (few distinct values).

```sql
-- Example of creating a non-clustered index
CREATE INDEX idx_customer_email
ON Customers (email);

-- Example of creating a composite index
CREATE INDEX idx_order_customer_date
ON Orders (customer_id, order_date);
```

## 5. Schema Migration Tools

Schema migration tools help manage and apply changes to your database schema in a controlled and versioned manner. They ensure that all developers and environments use the same database structure.

-   **Why use them:**
    -   Version control for database schema.
    -   Automated application of changes across environments (dev, staging, production).
    -   Rollback capabilities.
    -   Collaboration among teams.
-   **Popular Tools/Concepts:**
    -   **Alembic (Python/SQLAlchemy):** A lightweight database migration tool for usage with the SQLAlchemy Database Toolkit for Python.
    -   **Flyway (Java):** Database migration tool that strongly favors simplicity and convention over configuration.
    -   **Liquibase (Java):** Open-source database-independent library for tracking, managing and applying database schema changes.
    -   **ORM-specific Migrations:** Many Object-Relational Mappers (ORMs) like Django ORM, Ruby on Rails ActiveRecord, and Laravel Eloquent include built-in migration systems.

**Example: Conceptual ORM Migration**

When using an ORM, you typically define your model changes in code, and the ORM generates the migration file. For instance, adding a `phone_number` to a `User` model:

1.  **Modify Model:** Add `phone_number` field in `User` model class.
2.  **Generate Migration:** Run a command like `python manage.py makemigrations` (Django) or `rails generate migration AddPhoneNumberToUsers` (Rails).
3.  **Apply Migration:** Run `python manage.py migrate` or `rails db:migrate` to apply changes to the database.

## Checklist / Exercise

1.  **Identify Normalization Issues:** Given a table with `(StudentID, CourseName, InstructorName, InstructorOffice, Grade)`, identify potential violations of 2NF and 3NF, and explain how to normalize it.
2.  **Design ERD & Schema:** For a simple online library system, identify at least three entities and their relationships. Then, outline the basic relational schema (tables, primary keys, foreign keys) that would represent this.
3.  **Indexing Decision:** You have a `Users` table with millions of records. Queries frequently filter by `last_login_date` and sort results by `registration_date`. Describe which columns you would consider indexing and why, including any potential trade-offs.
