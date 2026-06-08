# Introduction to dbt (data build tool)

dbt (data build tool) is an open-source command-line tool that enables data analysts and engineers to transform data in their warehouse by writing `SELECT` statements. It brings software engineering best practices to data transformation, such as version control, modularity, testing, and documentation.

## 1. What is dbt and Why Use It?

Traditionally, data transformation often occurred within ETL (Extract, Transform, Load) tools, with the 'T' happening before loading into the warehouse. dbt champions the ELT (Extract, Load, Transform) paradigm, where raw data is first loaded into the data warehouse, and then transformations are performed directly within the warehouse using SQL.

**Key Benefits of dbt:**
*   **SQL-first approach:** Transforms are defined as SQL `SELECT` statements, making it accessible to data analysts.
*   **Version Control:** Integrates seamlessly with Git, allowing tracking changes, collaboration, and rollbacks.
*   **Modularity:** Break down complex transformations into smaller, reusable models.
*   **Testing:** Define and run tests to ensure data quality and integrity.
*   **Documentation:** Automatically generates data lineage graphs and project documentation.
*   **Reproducibility:** Ensures consistent and reliable data transformations.

## 2. dbt Architecture

dbt doesn't store or process data itself; instead, it compiles SQL code and executes it against your data warehouse (e.g., Snowflake, BigQuery, Redshift, Databricks).

**Core Components:**
*   **dbt Project:** A directory containing all your dbt models, tests, macros, and configurations.
*   **`dbt_project.yml`:** The main configuration file for your dbt project.
*   **`profiles.yml`:** Stores connection details (credentials) for your data warehouse. This file is typically stored outside the dbt project directory (e.g., in `~/.dbt/`) for security reasons.
*   **Data Warehouse:** Where your raw data resides and transformed data is stored.
*   **dbt CLI:** The command-line interface to interact with your dbt project.

## 3. Project Setup

### Installation

Install dbt core along with the adapter for your specific data warehouse. For example, for Snowflake:

```bash
pip install dbt-snowflake
```

For BigQuery:

```bash
pip install dbt-bigquery
```

### Initializing a Project

Navigate to your desired directory and run:

```bash
dbt init my_dbt_project
```

This command creates a new directory named `my_dbt_project` with a basic dbt project structure.

### Configuring Your Connection (`profiles.yml`)

You'll need to configure your data warehouse connection in `~/.dbt/profiles.yml`. Example for Snowflake:

```yaml
my_dbt_project: # This should match your project name in dbt_project.yml
  target: dev
  outputs:
    dev:
      type: snowflake
      account: your_account_identifier
      user: your_username
      password: your_password
      role: your_role
      database: your_database
      warehouse: your_warehouse
      schema: your_schema
      threads: 4 # Number of concurrent queries
```

### Configuring Your Project (`dbt_project.yml`)

This file contains project-specific settings. Key configurations include `name`, `profile` (linking to `profiles.yml`), and `model-paths`.

```yaml
name: 'my_dbt_project'
version: '1.0.0'
config-version: 2

profile: 'my_dbt_project' # Name of the profile in profiles.yml

model-paths: ["models"]
seed-paths: ["seeds"]
test-paths: ["tests"]
analysis-paths: ["analyses"]
macro-paths: ["macros"]

target-path: "target" # directory which will store compiled SQL and run artifacts
```

## 4. Core Concepts

### a. Models

Models are the heart of dbt. They are `SELECT` statements that define a data transformation. Each `.sql` file in your `models/` directory becomes a dbt model.

**Materializations:**
dbt models can be materialized in various ways, determining how they are built in your data warehouse:
*   **`view` (default):** A virtual table; queries run directly against the underlying tables. Good for complex logic on small data.
*   **`table`:** A physical table; dbt creates and populates a new table. Good for performance on large data.
*   **`incremental`:** Inserts or updates new records into an existing table. Efficient for regularly updated large tables.
*   **`ephemeral`:** Not directly materialized into the database; referenced as CTEs by other models. Good for intermediary steps that don't need to be persisted.

**Example Model (`models/stg_customers.sql`):**

```sql
{{ config(materialized='view') }}

SELECT
    id AS customer_id,
    name AS customer_name,
    email AS customer_email,
    created_at
FROM
    {{ source('raw_data', 'customers') }}
WHERE
    is_active = TRUE
```

Here, `{{ config(...) }}` sets the materialization. `{{ source(...) }}` is a Jinja macro to reference a declared source.

### b. Sources

Sources allow you to define and document the upstream raw data tables that your dbt project depends on. This helps dbt understand data lineage from external systems.

**Example Source Definition (`models/sources.yml`):**

```yaml
version: 2

sources:
  - name: raw_data # Logical name for your raw data source
    database: raw_db # Actual database name
    schema: public # Actual schema name
    tables:
      - name: customers # Name of the table
      - name: orders
```

### c. Tests

dbt allows you to define assertions about your data. Tests help ensure data quality and integrity.

**Types of Tests:**
*   **Generic Tests:** Pre-defined tests (e.g., `not_null`, `unique`, `accepted_values`, `relationships`). Applied directly in `schema.yml`.
*   **Singular Tests:** Custom SQL queries that return 0 rows if the test passes and >0 rows if it fails. Stored as `.sql` files in the `tests/` directory.

**Example Generic Tests (`models/schema.yml`):**

```yaml
version: 2

models:
  - name: stg_customers
    description: "Staged customer data"
    columns:
      - name: customer_id
        description: "The unique identifier for a customer"
        tests:
          - unique
          - not_null
      - name: customer_email
        description: "The email address of the customer"
        tests:
          - unique
          - not_null
```

## 5. dbt CLI Commands

*   `dbt debug`: Checks your dbt connection and project setup.
*   `dbt compile`: Compiles your dbt models into executable SQL queries without running them against the database.
*   `dbt run`: Executes all your dbt models against your data warehouse, creating or updating tables/views.
*   `dbt test`: Runs all defined tests on your dbt models.
*   `dbt docs generate`: Generates documentation for your project (data lineage, model definitions, tests).
*   `dbt docs serve`: Serves the generated documentation locally in your browser.

## Quick Checklist/Exercise:

1.  Explain the primary difference between the ETL and ELT paradigms, and how dbt fits into ELT.
2.  What is the purpose of `profiles.yml` versus `dbt_project.yml`?
3.  You want to create a dbt model that is very fast to query but doesn't store intermediate data persistently in your database. Which materialization would you choose and why?
