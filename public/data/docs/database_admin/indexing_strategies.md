# Indexing Strategies & Maintenance

Indexes are special lookup tables that the database search engine can use to speed up data retrieval. Think of them like an index in a book. Without an index, you'd have to read the entire book to find a specific topic. With an index, you can quickly jump to the relevant page. While they speed up `SELECT` operations, they add overhead to `INSERT`, `UPDATE`, and `DELETE` operations as the index itself needs to be updated.

## 1. Core Index Types

Different workloads benefit from different index structures.

### 1.1 B-tree Indexes
*   **Description**: The most common and default index type. B-tree (Balanced Tree) indexes are well-suited for a wide range of queries.
*   **Use Cases**:
    *   Equality (`=`) and range (`<`, `>`, `<=`, `>=`) comparisons.
    *   `ORDER BY` and `GROUP BY` clauses.
    *   `LIKE` patterns that do not start with a wildcard (e.g., `LIKE 'prefix%'`).
*   **Example**:
    ```sql
    CREATE INDEX idx_products_price ON products (price);
    ```

### 1.2 Hash Indexes
*   **Description**: Hash indexes store a 32-bit hash code for each column value. They are much smaller than B-tree indexes but only support simple equality comparisons.
*   **Use Cases**:
    *   Only for equality lookups (`=`).
*   **Limitations**:
    *   No range searches, sorting, or `LIKE` patterns.
    *   Historically less robust in PostgreSQL (before version 10, they weren't crash-safe or WAL-logged). While improved, B-tree remains the default for most equality checks due to broader utility.
*   **Example**:
    ```sql
    CREATE INDEX idx_users_email_hash ON users USING HASH (email);
    ```

### 1.3 GIN (Generalized Inverted Index)
*   **Description**: GIN indexes are designed for columns that contain multiple values, such as arrays, JSONB, or full-text search documents. They store a list of locations for each item within the indexed data.
*   **Use Cases**:
    *   Full-text search (e.g., `tsvector`, `tsquery`).
    *   Indexing arrays (e.g., `ARRAY @> value`).
    *   JSONB data (e.g., `jsonb_ops` for existence, `jsonb_path_ops` for containment).
*   **Example (Full-text search)**:
    ```sql
    ALTER TABLE articles ADD COLUMN tsv tsvector;
    UPDATE articles SET tsv = to_tsvector('english', title || ' ' || body);
    CREATE INDEX idx_articles_tsv ON articles USING GIN (tsv);
    ```

### 1.4 GiST (Generalized Search Tree)
*   **Description**: GiST indexes are highly extensible and can be used for various specialized data types and query patterns that don't fit standard B-tree models. They are "lossy" meaning they might return false positives that need to be filtered by the actual table.
*   **Use Cases**:
    *   Spatial data (e.g., PostGIS `geometry` types).
    *   Range types (`int4range`, `daterange`).
    *   Full-text search (alternative to GIN, different performance characteristics).
    *   K-nearest neighbor searches.
*   **Example (PostGIS)**:
    ```sql
    CREATE EXTENSION postgis;
    CREATE TABLE locations (id SERIAL PRIMARY KEY, geom GEOMETRY(Point, 4326));
    CREATE INDEX idx_locations_geom ON locations USING GiST (geom);
    ```

## 2. Advanced Indexing Strategies

### 2.1 Multi-column Indexes (Composite Indexes)
*   **Description**: Indexes created on multiple columns. The order of columns matters significantly.
*   **Use Cases**:
    *   When queries frequently filter or sort by multiple columns together.
    *   The leftmost columns of the index can be used independently.
*   **Rule of Thumb**: Place the most frequently queried or restrictive column first.
*   **Example**:
    ```sql
    CREATE INDEX idx_orders_customer_date ON orders (customer_id, order_date DESC);
    -- This index can be used for:
    -- SELECT * FROM orders WHERE customer_id = 123;
    -- SELECT * FROM orders WHERE customer_id = 123 AND order_date >= '2023-01-01';
    ```

### 2.2 Partial Indexes
*   **Description**: Indexes that only include a subset of rows from a table, defined by a `WHERE` clause.
*   **Use Cases**:
    *   When queries frequently target a small, specific portion of a large table.
    *   Can significantly reduce index size and maintenance overhead.
*   **Example**:
    ```sql
    CREATE INDEX idx_products_active_high_price ON products (price) WHERE status = 'active' AND price > 1000;
    -- This index will only be used by queries like:
    -- SELECT * FROM products WHERE status = 'active' AND price > 1500;
    ```

### 2.3 Expression Indexes (Function-based Indexes)
*   **Description**: Indexes created on the result of an expression or function applied to one or more columns.
*   **Use Cases**:
    *   When queries frequently filter or sort by a derived value.
    *   Ensures the expression in the query exactly matches the expression in the index definition.
*   **Example**:
    ```sql
    CREATE INDEX idx_users_lower_email ON users (lower(email));
    -- This index can be used by:
    -- SELECT * FROM users WHERE lower(email) = 'john.doe@example.com';
    ```

### 2.4 Index-Only Scans
*   **Description**: A performance optimization where PostgreSQL can answer a query entirely from the index without needing to access the main table. This is possible if all columns requested by the query are present in the index.
*   **Requirements**:
    *   All selected columns must be part of the index (or included in `INCLUDE` clause).
    *   The tuple in the table must be "visible" to the current transaction (managed by `VACUUM` and `visibility map`).
*   **Benefits**: Significantly faster, especially for `SELECT COUNT(*)` or `SELECT column_name WHERE ...` queries.
*   **Example**: If `idx_products_price` (on `price` column) exists, and `VACUUM` has been run:
    ```sql
    SELECT price FROM products WHERE price > 100; -- Can be an index-only scan
    SELECT COUNT(*) FROM products WHERE price > 100; -- Can be an index-only scan
    ```
    To explicitly create an index suitable for index-only scan on additional columns without making them part of the B-tree key:
    ```sql
    CREATE INDEX idx_products_price_id ON products (price) INCLUDE (id);
    -- Now SELECT id, price FROM products WHERE price > 100; can be index-only scan
    ```

## 3. Impact on Query Performance and Storage

*   **Reads (SELECT)**: Indexes generally speed up `SELECT` queries by reducing the amount of data the database needs to scan.
*   **Writes (INSERT, UPDATE, DELETE)**: Indexes can slow down write operations because the database also needs to update the index structures in addition to the main table. More indexes mean more overhead.
*   **Storage**: Indexes consume disk space. Over-indexing can lead to significant storage bloat.
*   **Maintenance**: Indexes require maintenance (e.g., `VACUUM`) to remain efficient.

## 4. Index Maintenance Techniques

Indexes, especially in PostgreSQL, can suffer from "bloat" due to dead tuples after `UPDATE` and `DELETE` operations. Proper maintenance is crucial.

### 4.1 `REINDEX`
*   **Purpose**: Rebuilds an index from scratch. This can be used to:
    *   Remove index bloat (reclaim disk space and improve performance).
    *   Repair corrupted indexes.
    *   Change index parameters (e.g., `FILLFACTOR`).
*   **Syntax**:
    ```sql
    REINDEX TABLE table_name;           -- Rebuild all indexes on a table
    REINDEX INDEX index_name;           -- Rebuild a specific index
    REINDEX DATABASE database_name;     -- Rebuild all indexes in a database (use with caution!)
    ```
*   **Considerations**: `REINDEX` can block read/write operations on the table/index being rebuilt, especially `REINDEX TABLE` or `REINDEX DATABASE`. For production, `REINDEX CONCURRENTLY` (PostgreSQL 12+) is preferred as it allows concurrent access, but it takes longer and uses more resources.
    ```sql
    REINDEX INDEX CONCURRENTLY index_name;
    ```

### 4.2 `VACUUM` and `ANALYZE`
*   **Purpose**: `VACUUM` reclaims storage occupied by "dead" tuples (rows marked for deletion or overwritten by updates). `ANALYZE` collects statistics about table contents, which the query planner uses to choose the most efficient execution plans.
*   **`VACUUM`**:
    *   Regular `VACUUM`: Marks dead tuples as reusable space. It does not return space to the OS. Essential for preventing table bloat and enabling index-only scans.
    *   `VACUUM FULL`: Rewrites the entire table and index files to disk, reclaiming all dead space and returning it to the OS. It requires an exclusive lock and is very slow, often not recommended for busy production systems. `pg_repack` or `CLUSTER` might be better alternatives for reclaiming disk space with less downtime.
*   **`ANALYZE`**: Updates the statistics. This is crucial for the query planner to make good decisions. Often run automatically by `autovacuum`.
*   **Syntax**:
    ```sql
    VACUUM table_name;
    VACUUM ANALYZE table_name; -- Vacuum and then analyze
    ANALYZE table_name;
    ```
*   **Autovacuum**: PostgreSQL's `autovacuum` daemon automatically performs `VACUUM` and `ANALYZE` operations in the background. It's generally sufficient for most workloads, but understanding how it works and tuning it is important.

## Checklist / Exercise

1.  **Scenario**: You have a `users` table with columns `id`, `username`, `email`, `registration_date`, `last_login`. Users frequently log in using their `email` (case-insensitive) and `password`. You also often need to retrieve users by their `registration_date` within a range.
    *   **Question**: Which type(s) of index would you create to optimize login by email and range searches by registration date? Provide the SQL.
2.  **Explain**: What is the primary difference between a `GIN` index and a `GiST` index in terms of their typical use cases?
3.  **Maintenance**: Your database administrator reports that a large table's indexes are bloated and queries are slowing down, despite `autovacuum` running regularly. Which index maintenance command would you suggest to address index bloat and why?