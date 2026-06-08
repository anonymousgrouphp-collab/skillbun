# Foundational Skills for Data Engineers

Welcome to the bedrock of your Data Engineering journey! This topic is designed to equip you with the essential technical proficiencies that every data engineer must master. From crafting efficient code to managing vast datasets and collaborating effectively, these foundational skills are your stepping stones to building robust data pipelines and infrastructures.

## 1. Programming Fundamentals

Proficiency in at least one general-purpose programming language is non-negotiable. Python and SQL are the most critical languages for data engineers.

### A. Python for Data Engineering

Python's simplicity, vast libraries (like Pandas, NumPy), and strong community support make it the language of choice for data manipulation, scripting, and automation.

#### Core Concepts:
*   **Basic Syntax & Data Types**: Variables, strings, numbers, booleans.
*   **Data Structures**: Lists, tuples, dictionaries, sets. Understanding when to use which is key for efficiency.
*   **Control Flow**: `if/else`, `for` loops, `while` loops.
*   **Functions**: Defining and calling functions, parameters, return values.
*   **Object-Oriented Programming (OOP) Basics**: Classes, objects, methods, attributes. This helps in writing modular and reusable code.
*   **File I/O**: Reading from and writing to files (CSV, JSON, text).

#### Simple Python Example:
Calculating the average of a list of numbers.

```python
def calculate_average(numbers):
    if not numbers:
        return 0
    return sum(numbers) / len(numbers)

data_points = [10, 20, 30, 40, 50]
average = calculate_average(data_points)
print(f"The average is: {average}")
```

### B. SQL (Structured Query Language)

SQL is the universal language for interacting with relational databases. As a data engineer, you'll use SQL daily to define schemas, extract data, transform it, and load it into various systems.

#### Core Concepts:
*   **Data Definition Language (DDL)**: `CREATE TABLE`, `ALTER TABLE`, `DROP TABLE`. Used to define and manage database structures.
*   **Data Manipulation Language (DML)**: `SELECT`, `INSERT`, `UPDATE`, `DELETE`. Used to manage data within tables.
*   **Basic Queries**: Filtering (`WHERE`), ordering (`ORDER BY`), limiting (`LIMIT`/`TOP`).
*   **Aggregations**: `COUNT`, `SUM`, `AVG`, `MIN`, `MAX`.
*   **Joins**: `INNER JOIN`, `LEFT JOIN`, `RIGHT JOIN`, `FULL OUTER JOIN`. Essential for combining data from multiple tables.
*   **Subqueries & CTEs (Common Table Expressions)**: For complex data retrieval.

#### Simple SQL Example:
Selecting products with a price greater than 50 and joining with their respective categories.

```sql
SELECT
    p.product_name,
    p.price,
    c.category_name
FROM
    products p
INNER JOIN
    categories c ON p.category_id = c.category_id
WHERE
    p.price > 50
ORDER BY
    p.price DESC;
```

## 2. Database Essentials

Understanding different database paradigms is crucial for selecting the right tool for the job.

### A. Relational Databases

Based on the relational model, data is organized into tables with predefined schemas. Key characteristics include ACID properties (Atomicity, Consistency, Isolation, Durability).
*   **Concepts**: Tables, columns, rows, primary keys, foreign keys, indexes, normalization.
*   **Examples**: PostgreSQL, MySQL, SQL Server, Oracle.

### B. NoSQL Databases

Designed for flexibility, scalability, and handling specific data models that don't fit well into the relational structure.
*   **Key-Value Stores**: Simple, high-performance (e.g., Redis, DynamoDB).
*   **Document Databases**: Store data in flexible, semi-structured documents (e.g., MongoDB, Couchbase).
*   **Column-Family Databases**: Optimized for aggregate queries over large datasets (e.g., Cassandra, HBase).
*   **Graph Databases**: For highly connected data (e.g., Neo4j).

## 3. Version Control with Git

Git is the industry standard for tracking changes in code, collaborating with teams, and managing different versions of projects.

#### Core Concepts:
*   **Repositories**: A project folder managed by Git.
*   **Commits**: Snapshots of your code at a specific point in time.
*   **Branches**: Independent lines of development.
*   **Merging/Rebasing**: Combining changes from different branches.
*   **Remote Repositories**: Hosting your Git project on platforms like GitHub, GitLab, or Bitbucket.

#### Basic Git Workflow:

```bash
# Initialize a new repository
git init

# Add changes to the staging area
git add .

# Commit changes
git commit -m "Initial commit of project setup"

# Create and switch to a new branch
git checkout -b feature/new-dashboard

# Push changes to a remote repository
git push origin feature/new-dashboard
```

## 4. Operating System Basics (Linux)

Many data engineering tools and servers run on Linux. Familiarity with the command line interface (CLI) is essential for deploying applications, managing servers, and scripting tasks.

#### Essential Linux Commands:
*   `ls`: List directory contents.
*   `cd`: Change directory.
*   `pwd`: Print working directory.
*   `mkdir`, `rmdir`: Create/remove directories.
*   `cp`, `mv`, `rm`: Copy, move, remove files.
*   `cat`, `less`, `head`, `tail`: View file contents.
*   `grep`: Search for patterns in files.
*   `chmod`, `chown`: Manage file permissions and ownership.
*   `ssh`: Securely connect to remote servers.
*   `scp`: Securely copy files between hosts.

#### Example: Checking a log file and copying it.

```bash
# Check the last 10 lines of an application log
tail -n 10 /var/log/myapp/app.log

# Copy the log file to your home directory for analysis
cp /var/log/myapp/app.log ~/app_logs/today.log
```

## 5. Core Data Concepts

A foundational understanding of data itself is paramount.

### A. Data Types & Structures

Understanding how data is represented and organized.
*   **Primitive Types**: Integers, floats, strings, booleans, dates.
*   **Complex Structures**: Arrays, objects/structs, nested data (common in JSON/XML).
*   **Schema**: The structure or blueprint of data (e.g., defining columns and their types in a database table).

### B. Introduction to ETL/ELT

These are fundamental data integration processes.
*   **ETL (Extract, Transform, Load)**: Data is extracted from source systems, transformed (cleaned, aggregated, enriched) outside the target system (often in a staging area), and then loaded into the target data warehouse.
*   **ELT (Extract, Load, Transform)**: Data is extracted, loaded directly into the target data lake/warehouse, and then transformed within the target system using its processing power. This is common with modern cloud data warehouses.

## Quick Check / Exercise

1.  **Python Challenge**: Write a Python function that takes a list of dictionaries (each representing a user with keys 'name' and 'age') and returns a new list containing only users older than 30.
2.  **SQL Challenge**: Assuming you have a table `employees` with columns `employee_id`, `name`, `department_id`, and a table `departments` with columns `department_id`, `department_name`. Write a SQL query to find the names of all employees working in the 'Sales' department.
3.  **Git Scenario**: You've made several changes to a file `data_processing.py`. Describe the sequence of Git commands you would use to save these changes to your local repository and then push them to a remote branch named `feature/data-update`.