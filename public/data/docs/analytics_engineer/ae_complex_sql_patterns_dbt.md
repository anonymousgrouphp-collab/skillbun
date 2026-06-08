# Complex SQL Patterns for dbt Transformations

This guide explores advanced SQL techniques essential for building sophisticated data transformations within dbt. Mastering these patterns allows you to handle complex data relationships, temporal changes, and intricate reporting requirements efficiently and scalably.

## 1. Recursive CTEs for Hierarchical Data

**Concept:** Common Table Expressions (CTEs) allow you to define temporary, named result sets. A **Recursive CTE** is a special type of CTE that can reference itself, enabling you to traverse hierarchical or graph-like data structures. This is invaluable for scenarios like organizational charts, bill of materials, or network paths where data relationships form a parent-child chain.

A recursive CTE consists of two main parts:
1.  **Anchor Member:** The initial query that establishes the base result set for the recursion.
2.  **Recursive Member:** The query that references the CTE itself and the anchor member, iterating to build upon the previous result set. These two members are connected by `UNION ALL`. A termination condition is crucial to prevent infinite loops.

**Example: Employee Hierarchy**

Imagine an `employees` table with `employee_id`, `employee_name`, and `manager_id`.

```sql
WITH RECURSIVE employee_hierarchy AS (
    -- Anchor Member: Start with the top-level employees (no manager)
    SELECT
        employee_id,
        employee_name,
        manager_id,
        0 AS level
    FROM
        {{ source('raw_data', 'employees') }}
    WHERE
        manager_id IS NULL

    UNION ALL

    -- Recursive Member: Find employees whose manager is in the previous step
    SELECT
        e.employee_id,
        e.employee_name,
        e.manager_id,
        eh.level + 1 AS level
    FROM
        {{ source('raw_data', 'employees') }} AS e
    JOIN
        employee_hierarchy AS eh
        ON e.manager_id = eh.employee_id
)
SELECT * FROM employee_hierarchy;
```

## 2. Pivot and Unpivot Operations

**Concept:** These operations are about restructuring data between "long" and "wide" formats, which is crucial for reporting and analysis.

*   **Pivot:** Transforms rows into columns. For instance, converting monthly sales records (each month as a row) into a single row where each month's sales is a separate column.
*   **Unpivot:** Transforms columns into rows. Useful for normalizing data where several columns represent similar attributes (e.g., `sales_q1`, `sales_q2`) into a single `quarter` column and a `sales_amount` column.

While some SQL dialects (like SQL Server, Oracle) have explicit `PIVOT`/`UNPIVOT` clauses, many databases (including Snowflake, BigQuery, PostgreSQL) achieve this using conditional aggregation (for pivot) or `UNION ALL`/`UNNEST` (for unpivot).

**Example: Pivoting Sales Data (Conditional Aggregation)**

```sql
SELECT
    product_id,
    SUM(CASE WHEN sale_month = 'Jan' THEN sales_amount ELSE 0 END) AS sales_jan,
    SUM(CASE WHEN sale_month = 'Feb' THEN sales_amount ELSE 0 END) AS sales_feb,
    SUM(CASE WHEN sale_month = 'Mar' THEN sales_amount ELSE 0 END) AS sales_mar
FROM
    {{ ref('monthly_sales') }} -- Assuming a model with product_id, sale_month, sales_amount
GROUP BY
    product_id;
```

**Example: Unpivoting Product Attributes (UNION ALL)**

```sql
SELECT product_id, 'color' AS attribute_name, color AS attribute_value FROM {{ ref('products_wide') }}
UNION ALL
SELECT product_id, 'size' AS attribute_name, size AS attribute_value FROM {{ ref('products_wide') }}
UNION ALL
SELECT product_id, 'material' AS attribute_name, material AS attribute_value FROM {{ ref('products_wide') }};
```

## 3. Sophisticated Window Functions

**Concept:** Window functions perform calculations across a set of table rows that are related to the current row. Unlike aggregate functions, they do not collapse rows; instead, they return a value for each row in the original query. They operate on a "window" of rows defined by the `OVER` clause, which includes `PARTITION BY` (to group rows) and `ORDER BY` (to define the order within each group).

**Key Use Cases:**

*   **Ranking:** Assigning ranks within a group.
    *   `ROW_NUMBER()`: Assigns a unique, sequential integer.
    *   `RANK()`: Assigns the same rank to ties, then skips subsequent numbers.
    *   `DENSE_RANK()`: Assigns the same rank to ties, but does not skip numbers.
    *   `NTILE(N)`: Divides rows into N groups and assigns a rank.
*   **Lead/Lag:** Accessing data from a subsequent (`LEAD()`) or preceding (`LAG()`) row within the same result set. Useful for calculating differences or comparing values over time.
*   **Deduplication:** Identifying and often filtering out duplicate records based on certain criteria.
*   **Running Totals/Moving Averages:** Calculating cumulative sums or averages over a specified window.

**Example: Deduplication using `ROW_NUMBER()`**

```sql
WITH deduplicated_customers AS (
    SELECT
        customer_id,
        customer_name,
        email,
        registration_date,
        ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY registration_date DESC) as rn
    FROM
        {{ source('raw_data', 'customers') }}
)
SELECT
    customer_id,
    customer_name,
    email,
    registration_date
FROM
    deduplicated_customers
WHERE
    rn = 1; -- Keep only the latest record for each customer_id
```

**Example: Calculating Month-over-Month Sales Growth using `LAG()`**

```sql
WITH monthly_sales_summary AS (
    SELECT
        DATE_TRUNC('month', order_date) AS sales_month,
        SUM(order_total) AS total_sales
    FROM
        {{ source('raw_data', 'orders') }}
    GROUP BY 1
)
SELECT
    sales_month,
    total_sales,
    LAG(total_sales, 1, 0) OVER (ORDER BY sales_month) AS previous_month_sales,
    (total_sales - LAG(total_sales, 1, 0) OVER (ORDER BY sales_month)) / NULLIF(LAG(total_sales, 1, 0) OVER (ORDER BY sales_month), 0) AS mom_growth_rate
FROM
    monthly_sales_summary
ORDER BY
    sales_month;
```

## 4. Handling Temporal Data

**Concept:** Managing data that changes over time is a core challenge in analytics engineering. This involves tracking historical states and generating comprehensive time series.

*   **Snapshotting Logic (SCD Type 2):** Slowly Changing Dimensions (SCD) Type 2 tracks historical changes to dimension attributes by creating new rows for each change, along with `valid_from` and `valid_to` (or `dbt_valid_from`, `dbt_valid_to`) columns. dbt has built-in `snapshots` functionality to automate this.
*   **Date Series Generation (Date Spine):** Creating a continuous sequence of dates (or timestamps) to ensure all periods are represented, even if there's no data. This is crucial for accurate time-series analysis and preventing "missing" data points.

**Example: dbt Snapshot Configuration (SCD Type 2)**

```yaml
-- snapshots/my_customers_snapshot.sql
{% snapshot my_customers_snapshot %}

{{ 
    config(
      target_schema='snapshots',
      unique_key='customer_id',
      strategy='check',
      check_cols=['customer_name', 'email_address'] -- Columns to monitor for changes
    )
}}

SELECT
    customer_id,
    customer_name,
    email_address,
    current_timestamp() as _updated_at -- A timestamp to capture when the record was last seen/updated
FROM
    {{ source('raw_data', 'customers') }}

{% endsnapshot %}
```
When run, dbt will generate a `my_customers_snapshot` table with `dbt_valid_from` and `dbt_valid_to` columns, tracking changes to `customer_name` or `email_address`.

**Example: Date Series Generation (PostgreSQL/Snowflake-like)**

```sql
WITH RECURSIVE date_spine AS (
    -- Anchor member: Start date
    SELECT '2023-01-01'::DATE AS dt
    UNION ALL
    -- Recursive member: Add one day until end date
    SELECT (dt + INTERVAL '1 day')::DATE
    FROM date_spine
    WHERE dt < '2023-12-31'::DATE
)
SELECT dt FROM date_spine;
```
For databases like BigQuery or specific UDFs, other methods like `GENERATE_DATE_ARRAY` or UDTFs might be used.

---

## Quick Understanding Checklist/Exercise

1.  **Hierarchy Traversal:** You have a `products` table with `product_id`, `product_name`, and `parent_product_id` for nested product categories. Write a SQL query using a recursive CTE to find all sub-products for a given `parent_product_id` (e.g., 'electronics').
2.  **Sales Data Restructuring:** Your `quarterly_sales` table has columns `product_id`, `q1_sales`, `q2_sales`, `q3_sales`, `q4_sales`. Write a SQL query to unpivot this data into `product_id`, `quarter`, `sales_amount` format.
3.  **Customer Activity Ranking:** From an `orders` table (with `customer_id`, `order_date`, `order_total`), write a SQL query to rank customers by their total `order_total` within each `month`, showing the `customer_id`, `total_order_value`, and their `rank_in_month`. If multiple customers have the same `order_total` in a month, they should receive the same rank, and no ranks should be skipped.