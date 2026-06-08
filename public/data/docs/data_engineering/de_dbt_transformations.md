# Data Transformation with dbt

dbt (data build tool) is an open-source command-line tool that enables data analysts and engineers to transform data in their warehouse by writing SQL `SELECT` statements. It brings software engineering best practices like modularity, version control, testing, and documentation to the data transformation layer, making data pipelines more reliable and maintainable.

## Why dbt?

Traditional data transformation often involves complex ETL scripts or custom code that can be hard to manage, test, and document. dbt simplifies this by:

*   **SQL-first approach**: Leveraging SQL, the lingua franca of data, making it accessible to a wider range of data professionals.
*   **Modularity**: Breaking down complex transformations into smaller, reusable models.
*   **Testing**: Defining data quality tests directly within your project to ensure accuracy and reliability.
*   **Documentation**: Automatically generating data lineage and documentation for all your models and their relationships.
*   **Version Control**: Integrating seamlessly with Git for collaborative development and change management.

## Core Concepts in dbt

1.  **Models**: At the heart of dbt, models are SQL `SELECT` statements that define your transformations. Each `.sql` file in your `models` directory represents a single model. dbt compiles these SQL files into views or tables in your data warehouse.

    *   **`ref()` function**: This Jinja macro allows you to reference other models or seeds in your project, building a directed acyclic graph (DAG) of dependencies. For example, `{{ ref('stg_orders') }}` refers to a model named `stg_orders`.

2.  **Sources**: Define your raw data tables that dbt reads from but doesn't manage. Using `source()` allows dbt to understand your raw data dependencies and generate lineage. For example, `{{ source('raw_data', 'customers') }}` refers to a table named `customers` within a `raw_data` schema (or source group).

3.  **Tests**: dbt allows you to define assertions about your data. These tests run queries against your data warehouse to identify inconsistencies or quality issues. Common tests include:

    *   `unique`: Ensures all values in a column are unique.
    *   `not_null`: Ensures a column does not contain any NULL values.
    *   `accepted_values`: Checks if column values are among a specified list.
    *   `relationships`: Validates foreign key relationships between models.

4.  **Documentation**: dbt can generate a web-based documentation site for your project, including model descriptions, column descriptions, tests, and a visual representation of your data lineage graph. This is defined in `schema.yml` files.

5.  **Materializations**: These determine how a model is persisted in your data warehouse. Common materializations include:

    *   **`view`**: Creates a view in the database, running the SQL query every time it's accessed. Good for frequently changing data or when storage is a concern.
    *   **`table`**: Creates a table, storing the results of the query. Offers better query performance but requires more storage and rebuild time.
    *   **`incremental`**: For large datasets, this materialization only processes new or changed records since the last run, significantly reducing build times.
    *   **`ephemeral`**: Creates a Common Table Expression (CTE) that is not directly materialized in the database, only referenced by downstream models.

## A Simple dbt Model Example

Consider transforming raw customer data into a cleaned dimension table.

**1. Define a `customers` source (in `models/sources.yml`):**

```yaml
version: 2

sources:
  - name: raw_data
    database: my_raw_db
    schema: public
    tables:
      - name: customers
        description: 