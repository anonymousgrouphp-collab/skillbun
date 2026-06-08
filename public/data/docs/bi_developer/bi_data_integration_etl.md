# Data Integration & Transformation (ETL/ELT)

## Introduction

Data Integration and Transformation are critical processes in Business Intelligence (BI) and data analytics. They involve combining data from various disparate sources into a unified, consistent, and structured format suitable for analysis, reporting, and decision-making. This ensures that BI tools have access to clean, reliable, and relevant data.

## ETL vs. ELT

The two primary paradigms for data integration and transformation are **ETL (Extract, Transform, Load)** and **ELT (Extract, Load, Transform)**.

### ETL (Extract, Transform, Load)
*   **Extract:** Data is pulled from source systems (databases, files, APIs, etc.).
*   **Transform:** Data is cleaned, standardized, aggregated, joined, and enriched *before* loading into the target data warehouse or data mart. This often occurs on a separate staging server.
*   **Load:** The transformed data is then loaded into the target system.

**Characteristics:**
*   Traditional approach.
*   Requires pre-processing data before it hits the data warehouse.
*   Good for smaller data volumes or when strict data governance is needed before storage.
*   Can be slower if transformations are complex, as they occur outside the target system's analytical engine.

### ELT (Extract, Load, Transform)
*   **Extract:** Data is pulled from source systems.
*   **Load:** Raw, untransformed data is loaded directly into the target data warehouse (often cloud-based, with powerful processing capabilities).
*   **Transform:** Data is then transformed *within* the target data warehouse using its native processing power (e.g., SQL in a columnar database).

**Characteristics:**
*   Modern approach, favored with cloud data warehouses (Snowflake, BigQuery, Redshift) due to their scalable compute.
*   Leverages the target system's processing power for transformations, often making it faster for large datasets.
*   Allows storing raw data, providing flexibility for future transformations or analyses.
*   Data governance and privacy considerations might need to be handled carefully as raw data is loaded first.

## Data Pipeline Concepts

A data pipeline is a series of processes that automate the movement and transformation of data from source systems to a target destination. Key components include:

*   **Sources:** Where the data originates (e.g., operational databases like OLTP, flat files, APIs, streaming data).
*   **Staging Area:** A temporary storage area where extracted data can be held before transformation (in ETL) or before loading (in ELT, though less critical for raw load).
*   **Transformation Logic:** The rules and processes applied to data (e.g., SQL scripts, Python functions, data mapping tools).
*   **Target Destination:** The final repository for processed data, typically a data warehouse, data lake, or data mart, optimized for analytical queries.
*   **Orchestration/Scheduling:** Tools that manage and schedule the execution of pipeline tasks (e.g., Apache Airflow, Azure Data Factory, AWS Glue).
*   **Monitoring & Alerting:** Systems to track pipeline health, performance, and notify about failures.

## Key Transformation Types

Data transformation is the heart of preparing data for analysis. Common types include:

1.  **Cleaning:** Handling missing values (nulls), removing duplicates, correcting inconsistencies, parsing data.
2.  **Standardization:** Ensuring consistent data formats, units, and spellings (e.g., 'USA', 'U.S.', 'United States' all becoming 'United States').
3.  **Aggregation:** Summarizing data to a higher level of granularity (e.g., summing sales per day, counting unique customers per month).
4.  **Joining/Merging:** Combining data from multiple sources based on common keys to create a unified view.
5.  **Derivation:** Creating new attributes or metrics from existing ones (e.g., `profit = sales - cost`, `age = current_date - birth_date`).
6.  **Filtering:** Selecting specific rows or columns relevant for analysis.
7.  **Data Type Conversion:** Changing data types to be consistent or suitable for target system.

## Simple SQL Transformation Example

Consider a scenario where we have raw sales data and want to create a `daily_summary` table with aggregated sales and calculated profit.

```sql
-- Raw Sales Data (Example Table: raw_sales)
-- | sale_id | product_id | sale_date  | quantity | unit_price | cost_price |
-- |---------|------------|------------|----------|------------|------------|
-- | 1       | P001       | 2023-01-01 | 10       | 10.00      | 6.00       |
-- | 2       | P002       | 2023-01-01 | 5        | 25.00      | 15.00      |
-- | 3       | P001       | 2023-01-02 | 7        | 10.00      | 6.00       |

-- Transformation: Aggregate daily sales and calculate daily profit
INSERT INTO daily_sales_summary (summary_date, total_sales_amount, total_profit_amount, total_items_sold)
SELECT
    CAST(sale_date AS DATE) AS summary_date,
    SUM(quantity * unit_price) AS total_sales_amount,
    SUM(quantity * (unit_price - cost_price)) AS total_profit_amount,
    SUM(quantity) AS total_items_sold
FROM
    raw_sales
WHERE
    sale_date IS NOT NULL -- Simple cleaning: ignore sales with no date
GROUP BY
    CAST(sale_date AS DATE);

-- Resulting daily_sales_summary table (Conceptual)
-- | summary_date | total_sales_amount | total_profit_amount | total_items_sold |
-- |--------------|--------------------|---------------------|------------------|
-- | 2023-01-01   | 225.00             | 95.00               | 15               |
-- | 2023-01-02   | 70.00              | 28.00               | 7                |
```

This SQL snippet demonstrates:
*   **Extraction (conceptual):** `FROM raw_sales`
*   **Cleaning:** `WHERE sale_date IS NOT NULL`
*   **Derivation:** `quantity * unit_price` (sales amount), `quantity * (unit_price - cost_price)` (profit amount)
*   **Aggregation:** `SUM()` and `GROUP BY` to summarize daily data
*   **Loading (conceptual):** `INSERT INTO daily_sales_summary`

## Checklist / Exercise

1.  **Differentiate:** Explain a key scenario where ELT would be preferred over ETL, justifying your choice.
2.  **Identify:** List three common data transformation challenges that a BI Developer might face.
3.  **Propose:** You have customer names stored as "LAST, FIRST". Describe the transformation steps needed to present them as "FIRST LAST".
