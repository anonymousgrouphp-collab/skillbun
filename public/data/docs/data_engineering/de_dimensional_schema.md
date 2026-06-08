# Dimensional Modeling & Schema Design

Dimensional modeling is a design technique used for data warehouses, optimizing them for querying and reporting. It structures data into easily understandable facts (measurements) and dimensions (contextual attributes), making it highly effective for business intelligence and analytics.

## 1. Core Concepts of Dimensional Modeling

### 1.1. Facts

Facts are numerical measurements of a business process or event. They are typically stored in fact tables and represent the quantitative data for analysis.

*   **Definition**: Quantitative metrics (e.g., sales amount, quantity sold, profit).
*   **Measures**: The actual numerical values within a fact table.
*   **Types of Fact Tables**:
    *   **Transactional Fact Tables**: Record individual events at the lowest grain (e.g., each line item of a sale).
    *   **Periodic Snapshot Fact Tables**: Summarize activity over a fixed period (e.g., daily total sales, monthly inventory levels).
    *   **Accumulating Snapshot Fact Tables**: Track the progress of a business process through distinct milestones (e.g., an order's lifecycle from placement to delivery).

### 1.2. Dimensions

Dimensions provide the descriptive context for the facts. They answer the "who, what, where, when, why, and how" of a business event.

*   **Definition**: Tables containing descriptive attributes that characterize the facts (e.g., Product, Customer, Date, Store).
*   **Attributes**: Characteristics within a dimension (e.g., for Product: Product Name, Category, Brand).
*   **Hierarchies**: Natural groupings within dimensions that allow for drill-down and roll-up analysis (e.g., Date: Day > Month > Quarter > Year).

### 1.3. Grain

The grain defines the lowest level of detail stored in a fact table. It's crucial for accurate aggregation and preventing data duplication.

*   **Definition**: What a single row in the fact table represents (e.g., "one line item on a sales receipt," "one sensor reading per minute").
*   **Importance**: Establishing the correct grain ensures consistency and prevents misinterpretation of aggregated data.

### 1.4. Surrogate Keys

Surrogate keys are essential for efficient and robust dimensional modeling.

*   **Definition**: System-generated, non-business, sequential integer keys used as primary keys in dimension tables and foreign keys in fact tables.
*   **Why use them?**:
    *   **Performance**: Integer keys are typically faster for joins than multi-column natural keys or long string keys.
    *   **Immutability**: Insulate the data warehouse from changes in source system natural keys, which can change or be reused.
    *   **History Tracking**: Enable the implementation of Slowly Changing Dimensions (SCD Type 2) by providing a unique identifier for each version of a dimension member.
    *   **Integration**: Seamlessly integrate data from multiple source systems, even if they use different natural key formats.

## 2. Schema Designs for Data Warehouses

### 2.1. Star Schema

*   **Structure**: A central fact table directly joined to multiple denormalized dimension tables, forming a star shape.
*   **Characteristics**:
    *   Dimension tables are typically wide, containing all attributes related to that dimension.
    *   Fewer joins are required for most queries.
*   **Advantages**:
    *   **Simplicity**: Easy to understand and navigate for business users.
    *   **Query Performance**: Optimized for fast query execution due to fewer joins and simpler join paths.
    *   **BI Tool Friendly**: Most analytical and reporting tools are optimized to work efficiently with star schemas.
*   **Disadvantages**:
    *   **Data Redundancy**: Denormalization can lead to some data duplication within dimension tables.
    *   **Less Flexible**: Can be harder to accommodate highly complex or rapidly evolving dimensional hierarchies.

### 2.2. Snowflake Schema

*   **Structure**: An extension of the star schema where dimension tables are further normalized into sub-dimensions.
*   **Characteristics**:
    *   Dimension tables can have child dimension tables, creating a more normalized, branching structure.
    *   More joins are typically needed for queries.
*   **Advantages**:
    *   **Reduced Data Redundancy**: Normalization minimizes data duplication across tables.
    *   **Easier to Maintain**: Changes to a normalized dimension attribute affect fewer tables.
    *   **More Flexible**: Can represent complex hierarchical relationships more accurately.
*   **Disadvantages**:
    *   **Complex Queries**: More joins are required, potentially impacting query performance.
    *   **Increased Complexity**: Can be harder for business users to understand due to multiple linked dimension tables.
    *   **BI Tool Limitations**: Some BI tools may not perform as optimally with snowflake schemas compared to star schemas.

## 3. Slowly Changing Dimensions (SCDs)

SCDs are techniques used to manage changes in dimension attributes over time, ensuring historical accuracy for analysis.

### 3.1. SCD Type 0: Retain Original

*   **Description**: Dimension attributes are never changed once loaded. The data reflects the state at the time of the initial load.
*   **Use Case**: For attributes that are truly static or where historical changes are irrelevant (e.g., a person's birth date).

### 3.2. SCD Type 1: Overwrite

*   **Description**: New data overwrites old data. History is not preserved.
*   **Use Case**: Correcting errors or for attributes where only the most current value is relevant for analysis (e.g., a customer's email address if history isn't needed).
*   **Impact**: Reports will always show the most current attribute value, losing any historical context.

### 3.3. SCD Type 2: Add New Row

*   **Description**: A new row is added to the dimension table to track changes in an attribute. The old row remains but is marked as historical. This is the most common and powerful SCD type.
*   **Implementation**: Requires additional columns in the dimension table:
    *   `StartDate`: The date/time when the version became active.
    *   `EndDate`: The date/time when the version became inactive (or a sentinel value like `9999-12-31` for the current version).
    *   `IsCurrent` / `CurrentFlag`: A boolean or indicator to identify the currently active version of a dimension member.
*   **Use Case**: When historical accuracy is critical for analysis (e.g., tracking a customer's address changes to see sales by region at the time of purchase).

```sql
-- Example: Implementing SCD Type 2 for a DimCustomer table

-- Initial state (Alice Smith in East region)
SELECT CustomerKey, NaturalKey, CustomerName, Region, StartDate, EndDate, IsCurrent
FROM DimCustomer
WHERE NaturalKey = 'CUST001';

-- Output:
-- CustomerKey | NaturalKey | CustomerName | Region | StartDate  | EndDate    | IsCurrent
-- 101         | CUST001    | Alice Smith  | East   | 2020-01-01 | 9999-12-31 | TRUE

-- Scenario: Alice Smith moves to West region on 2023-11-01

-- Step 1: Update the old row to mark it as historical
UPDATE DimCustomer
SET 
    EndDate = '2023-10-31',
    IsCurrent = FALSE
WHERE 
    NaturalKey = 'CUST001' AND IsCurrent = TRUE;

-- Step 2: Insert a new row for the new version of Alice Smith
INSERT INTO DimCustomer (NaturalKey, CustomerName, Region, StartDate, EndDate, IsCurrent)
VALUES ('CUST001', 'Alice Smith', 'West', '2023-11-01', '9999-12-31', TRUE);

-- Current state after the update and insert
SELECT CustomerKey, NaturalKey, CustomerName, Region, StartDate, EndDate, IsCurrent
FROM DimCustomer
WHERE NaturalKey = 'CUST001'
ORDER BY StartDate;

-- Output:
-- CustomerKey | NaturalKey | CustomerName | Region | StartDate  | EndDate    | IsCurrent
-- 101         | CUST001    | Alice Smith  | East   | 2020-01-01 | 2023-10-31 | FALSE
-- 102         | CUST001    | Alice Smith  | West   | 2023-11-01 | 9999-12-31 | TRUE
```

### 3.4. SCD Type 3: Add New Column

*   **Description**: Adds new columns to the dimension table to store a limited history (typically the current and one previous state).
*   **Use Case**: When only the most recent previous state is needed for analysis, and a full history (like SCD Type 2) is overkill (e.g., tracking a customer's `current_region` and `previous_region`).
*   **Limitations**: Only tracks a fixed, small number of historical states.

## 4. Data Vault Modeling (Brief Overview)

Data Vault is another data modeling approach for data warehouses, often used in agile environments, emphasizing auditability and flexibility. It differs significantly from dimensional modeling but often serves as the raw, historical layer from which dimensional models (for reporting) are generated.

*   **Hubs**: Store unique business keys (e.g., `CustomerID`, `ProductID`) and their associated load metadata.
*   **Links**: Represent relationships or transactions between two or more Hubs (e.g., `OrderLink` connecting a `CustomerHub` and `ProductHub`).
*   **Satellites**: Store descriptive attributes (context) and their historical changes, attached to Hubs or Links. Each Satellite tracks changes for a specific set of attributes.
*   **Key Differentiator**: Highly normalized and designed for historical tracking and integration of diverse data sources, making it very flexible. It typically requires a separate 