# Data Modeling & Warehousing

This study guide explores the critical concepts of data modeling and warehousing, essential for any data engineer. You'll learn how to design efficient data structures for analytical workloads and understand the architecture behind modern data storage solutions like data warehouses, data lakes, and lakehouses.

## 1. Data Modeling Fundamentals

Data modeling is the process of creating a visual representation or blueprint of a data system. It defines how data is structured, stored, and accessed. Effective data modeling ensures data integrity, consistency, and efficient retrieval, especially for analytical queries.

### Types of Data Models
*   **Conceptual Data Model:** High-level, technology-agnostic view. Focuses on business concepts and relationships between them (e.g., "Customer places Order").
*   **Logical Data Model:** More detailed than conceptual, but still technology-agnostic. Defines entities, attributes, and relationships, often using Entity-Relationship Diagrams (ERDs). It specifies data types and primary/foreign keys.
*   **Physical Data Model:** Technology-specific implementation of the logical model. Maps data to actual database objects (tables, columns, indexes, constraints) in a particular DBMS (e.g., PostgreSQL, Snowflake).

### Dimensional Modeling
A paradigm specifically designed for data warehousing and analytical workloads, focusing on query performance and ease of understanding for business users.

*   **Fact Tables:** Contain numerical measurements (metrics) related to business processes, along with foreign keys to dimension tables. Examples: `sales_amount`, `quantity_sold`, `profit`.
*   **Dimension Tables:** Contain descriptive attributes related to the facts. They provide context to the measurements. Examples: `product_name`, `customer_region`, `date`.

#### Star Schema
The simplest and most common dimensional model. A central fact table is directly connected to multiple dimension tables. It's denormalized for query performance.

#### Snowflake Schema
An extension of the Star Schema where dimension tables are normalized into multiple related tables. This reduces data redundancy but can increase query complexity due to more joins.

**Example: Star Schema for Sales Data**

```sql
-- Dimension Table: DimProduct
CREATE TABLE DimProduct (
    product_key INT PRIMARY KEY,
    product_id VARCHAR(50) UNIQUE,
    product_name VARCHAR(255),
    category VARCHAR(100),
    brand VARCHAR(100)
);

-- Dimension Table: DimCustomer
CREATE TABLE DimCustomer (
    customer_key INT PRIMARY KEY,
    customer_id VARCHAR(50) UNIQUE,
    customer_name VARCHAR(255),
    city VARCHAR(100),
    country VARCHAR(100)
);

-- Dimension Table: DimDate
CREATE TABLE DimDate (
    date_key INT PRIMARY KEY, -- YYYYMMDD
    full_date DATE UNIQUE,
    day_of_week VARCHAR(10),
    month_name VARCHAR(10),
    year INT
);

-- Fact Table: FactSales
CREATE TABLE FactSales (
    sales_key SERIAL PRIMARY KEY,
    product_key INT REFERENCES DimProduct(product_key),
    customer_key INT REFERENCES DimCustomer(customer_key),
    date_key INT REFERENCES DimDate(date_key),
    sales_amount DECIMAL(10, 2),
    quantity_sold INT,
    unit_price DECIMAL(10, 2)
);
```

## 2. Data Warehousing Concepts

A **data warehouse** is a centralized repository of integrated data from one or more disparate sources. It's designed for reporting and data analysis, and is a core component of business intelligence.

### Characteristics of a Data Warehouse (W.H. Inmon)
*   **Subject-Oriented:** Organized around major subjects of the enterprise (e.g., sales, customers, products), not specific operational applications.
*   **Integrated:** Data is integrated from various sources, resolving inconsistencies and ensuring a unified view.
*   **Time-Variant:** Data includes a time element, allowing for historical analysis (e.g., data from 5 years ago is still available).
*   **Non-Volatile:** Once data is stored, it is not updated or deleted. New data is added incrementally.

### ETL vs. ELT
*   **ETL (Extract, Transform, Load):** Data is extracted from source systems, transformed (cleaned, standardized, aggregated) in a staging area, and then loaded into the data warehouse. Traditional approach.
*   **ELT (Extract, Load, Transform):** Data is extracted, loaded directly into the raw layer of the data warehouse/lake, and then transformed within the target system using its processing power. Common in modern cloud-based data warehouses and data lakes.

### Traditional vs. Modern Data Warehouses
*   **Traditional:** On-premise, tightly coupled compute and storage, often proprietary hardware (e.g., Teradata, Netezza). Scalability is challenging and expensive.
*   **Modern (Cloud-native):** Cloud-based, decoupled compute and storage, elastic scalability, pay-as-you-go model (e.g., Snowflake, Google BigQuery, Amazon Redshift). Highly performant for analytical workloads.

## 3. Data Lakes

A **data lake** is a centralized repository that allows you to store all your structured, semi-structured, and unstructured data at any scale. Unlike a data warehouse, it stores data in its raw, native format without a predefined schema.

*   **Schema-on-read:** The schema is applied when the data is read, not when it's written. This offers immense flexibility.
*   **Purpose:** Ideal for storing vast amounts of raw data, enabling advanced analytics, machine learning, and data exploration without upfront modeling constraints.
*   **Technologies:** Typically built on distributed file systems like HDFS (Hadoop Distributed File System) or cloud object storage services like AWS S3, Azure Data Lake Storage, Google Cloud Storage.

## 4. Lakehouse Architecture

The **Lakehouse** architecture combines the best features of data lakes and data warehouses. It aims to provide the flexibility and cost-effectiveness of data lakes with the data management features and performance of data warehouses.

*   **Key Features:**
    *   **ACID Transactions:** Ensures reliability for data modifications.
    *   **Schema Enforcement & Governance:** Provides data quality and control, similar to a data warehouse.
    *   **Time Travel:** Ability to access previous versions of data.
    *   **Direct Data Access:** Data remains in open formats (e.g., Parquet, ORC) in the data lake, accessible by various tools.
    *   **Support for diverse workloads:** SQL analytics, BI, data science, machine learning on the same copy of data.
*   **Benefits:**
    *   Reduced data duplication and movement.
    *   Improved data quality and reliability.
    *   Simplified data architecture.
    *   Cost-effective due to open formats and cloud storage.
*   **Technologies:** Often implemented using open table formats like Delta Lake, Apache Iceberg, or Apache Hudi on top of cloud object storage.

## Quick Check / Exercises

1.  Describe the primary difference in data organization and query approach between a Star Schema and a Snowflake Schema.
2.  Explain why "schema on read" is a defining characteristic of a Data Lake and what advantage it offers over a traditional Data Warehouse.
3.  Identify two key features of a Lakehouse architecture that address common limitations of a pure Data Lake.