## Data Modeling and Transformation with dbt

### Introduction

dbt (data build tool) has revolutionized the way analytics engineers and data teams transform data in their warehouses. It empowers data practitioners to build robust, version-controlled, and testable data transformations using SQL. This study guide covers the core concepts of data modeling and how dbt facilitates efficient, high-quality data transformation.

Traditionally, data pipelines often followed an ETL (Extract, Transform, Load) paradigm where transformation happened *before* data landed in the warehouse. dbt champions an ELT (Extract, Load, Transform) approach, where raw data is loaded into the warehouse first, and then transformed in-place using SQL. This shift leverages the power of modern cloud data warehouses for computation and allows for greater flexibility and agility.

### Core Concepts of Data Modeling

Data modeling is the process of organizing data into a structure that is logical, understandable, and efficient for querying and analysis. The goal is to make data accessible for business intelligence tools and reporting.

*   **Dimensional Modeling**: A widely adopted technique, popularized by Ralph Kimball, which structures data around business processes.
    *   **Fact Tables**: Contain quantitative measures (e.g., sales amount, quantity) and foreign keys that link to dimension tables. They represent business events.
    *   **Dimension Tables**: Contain descriptive attributes about the subjects of your business (e.g., customers, products, dates). They provide context to the facts.

### dbt Fundamentals

dbt brings software engineering best practices to data transformation. Here are its key components:

1.  **Project Structure**: A dbt project is a directory containing SQL and YAML files that define your data transformations.
    *   `dbt_project.yml`: The main configuration file for your project.
    *   `models/`: Contains SQL files (`.sql`) which are your core transformations (models).
    *   `seeds/`: CSV files representing small, static datasets you want to load into your warehouse.
    *   `tests/`: YAML files defining data quality tests (e.g., `unique`, `not_null`).
    *   `macros/`: Reusable Jinja SQL snippets.
    *   `snapshots/`: Capture changes in slowly changing dimensions over time.
    *   `analyses/`: SQL files that aren't compiled into tables/views but can be run directly.

2.  **Models**: The heart of dbt. A model is a `SELECT` statement that transforms raw data or other models into a new table or view in your data warehouse. They are defined as `.sql` files within the `models/` directory.

    *   **Materializations**: Control how a model is built in the data warehouse. Common types include:
        *   `view`: A logical view, always showing the latest data with no storage cost, but potentially slower query performance.
        *   `table`: A physical table, stored on disk. Faster query performance but requires storage and rebuilds on each run.
        *   `incremental`: Builds on previous runs by only processing new or changed records, ideal for large datasets.
        *   `ephemeral`: Not directly built into the database. Used as CTEs (Common Table Expressions) within other models.

3.  **Sources**: You define your raw input tables (e.g., from your operational databases or ingested files) as `sources` in YAML files. This allows dbt to understand data lineage from raw data.

    ```yaml
    # models/sources.yml
    version: 2

    sources:
      - name: raw_data
        database: your_raw_db
        schema: public
        tables:
          - name: orders
          - name: customers
    ```

4.  **Refs**: The `ref()` function is dbt's way of referencing other models. It ensures that dbt automatically manages dependencies, building upstream models before downstream ones.

    ```sql
    -- models/staging/stg_orders.sql
    SELECT
        id as order_id,
        user_id as customer_id,
        order_date,
        status
    FROM {{ source('raw_data', 'orders') }}
    ```

    ```sql
    -- models/marts/dim_customers.sql
    SELECT
        c.customer_id,
        c.first_name,
        c.last_name,
        min(o.order_date) as first_order_date,
        max(o.order_date) as most_recent_order_date,
        count(o.order_id) as number_of_orders
    FROM {{ ref('stg_customers') }} c
    LEFT JOIN {{ ref('stg_orders') }} o ON c.customer_id = o.customer_id
    GROUP BY 1, 2, 3
    ```

5.  **Tests**: dbt allows you to define tests to ensure the quality and integrity of your data. These can be singular tests (defined in `.sql` files) or generic tests (defined in YAML files).

    ```yaml
    # models/marts/dim_customers.yml
    version: 2

    models:
      - name: dim_customers
        description: "Customer dimension table"
        columns:
          - name: customer_id
            description: "Primary key for customers"
            tests:
              - unique
              - not_null
          - name: first_order_date
            tests:
              - not_null
    ```

6.  **Documentation**: dbt can generate a data catalog for your project, including descriptions for models, columns, sources, and tests. This fosters understanding and trust in your data.

### Quick Check / Exercise

1.  Explain the core difference between a `view` and a `table` materialization in dbt and when you would choose each.
2.  Describe how `ref()` and `source()` functions contribute to building a robust data lineage in a dbt project.
3.  Imagine you have a `raw_products` table. Write a simple dbt model (`stg_products.sql`) that selects `product_id`, `product_name`, and `price`, aliasing `product_id` to `id`. Assume `raw_products` is defined as a source named `ecommerce_raw`.