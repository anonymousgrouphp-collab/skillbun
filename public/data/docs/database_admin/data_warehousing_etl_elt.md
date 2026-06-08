# Data Warehousing, Data Lakes & ETL/ELT: Study Guide

Transactional DBAs must understand analytical pipelines. Data Warehouses (OLAP) are optimized for aggregation queries, fed by Extract, Transform, Load (ETL/ELT) jobs.

## 1. Key Concepts

### Concept 1: Data Warehouses vs Data Lakes
Data Warehouses store highly structured, schema-on-write analytical data (Snowflake, BigQuery). Data Lakes store raw, unstructured data (S3, HDFS).

### Concept 2: Columnar Storage
Analytical databases store data by columns rather than rows, minimizing IO operations for aggregate queries (e.g., SUM, AVG).

### Concept 3: ETL vs ELT
Extract-Transform-Load (transforms data in transit) vs Extract-Load-Transform (loads raw data first, transforms using target engine power).

## 2. Practical Example

### Data Warehousing, Data Lakes & ETL/ELT Example Setup
```javascript
Example of columnar storage scanning compared to row-oriented storage for an aggregation query (visualizing columns stored in contiguous blocks).
```

## 3. Quick Check-Up

1. Why are row-oriented databases poor choices for analytical aggregation queries?
2. What is schema-on-read in data lakes, and how does it compare to data warehousing?
3. Under what conditions is ELT preferred over ETL?
