# Slowly Changing Dimensions (SCD) Implementation

## Introduction to Slowly Changing Dimensions

In data warehousing, dimension tables store descriptive attributes about the business. These attributes, while generally stable, can change over time (e.g., a customer's address, an employee's department, a product's category). Managing these changes effectively is crucial for accurate historical reporting and trend analysis. "Slowly Changing Dimensions" (SCDs) are a set of strategies designed to handle these evolving dimension attributes in a data warehouse environment. Without proper SCD implementation, historical analysis can become inaccurate, as past facts might be associated with current dimension attributes.

## Core Concepts

*   **Dimension Tables:** These tables contain descriptive data about business entities (e.g., Customer, Product, Time, Employee). They provide context to the numerical facts stored in fact tables.
*   **Slowly Changing Dimensions:** This term refers to the methods used to manage and track changes in the attributes of dimension tables over time. The "slowly" part emphasizes that these changes are not frequent enough to warrant a completely new dimension entry every time, but they still need to be captured for historical accuracy.

## SCD Type 1: Overwrite the Existing Value

**Concept:** SCD Type 1 handles changes by simply overwriting the existing attribute value with the new one. No history is preserved for the changed attribute.

**Use Cases:**
*   Correcting errors (e.g., a misspelled product name).
*   Attributes where historical context is not important or relevant (e.g., a temporary status that only the current value matters).
*   When storage space is a significant constraint and historical tracking is deemed unnecessary for specific attributes.

**Pros:**
*   Simplest to implement.
*   Requires minimal storage space.
*   Fast query performance (no need to join or filter based on dates/flags for current record).

**Cons:**
*   **No historical data:** Past fact records will reflect the *new* attribute value, not the value that was current at the time the fact occurred. This can lead to inaccurate historical reporting.

**Example (SQL - Update):**

Assume a `DimCustomer` table: `CustomerID`, `CustomerName`, `Address`.

```sql
-- Initial state
INSERT INTO DimCustomer (CustomerID, CustomerName, Address)
VALUES (101, 'Alice Smith', '123 Main St');

-- Alice moves to a new address
UPDATE DimCustomer
SET Address = '456 Oak Ave'
WHERE CustomerID = 101;
```

After the update, `DimCustomer` for `CustomerID = 101` will only show `456 Oak Ave`. Any past sales attributed to Alice will now appear to be from `456 Oak Ave`, even if they occurred when she lived at `123 Main St`.

## SCD Type 2: Add a New Row for Each Change

**Concept:** SCD Type 2 handles changes by creating a new row in the dimension table for each change in a tracked attribute. This preserves the full history of the attribute.

**Techniques for Tracking History:**
1.  **Start Date and End Date:** Two columns (`StartDate`, `EndDate`) define the period during which a particular dimension record was valid. The `EndDate` for the current record is typically `NULL` or a high date (e.g., `9999-12-31`).
2.  **Current Flag:** A boolean column (`IsCurrent`) indicates whether a row represents the currently active version of the dimension member.
3.  **Version Number:** An integer column (`Version`) increments with each change for a given dimension member.

**Use Cases:**
*   Attributes where historical accuracy is critical for reporting (e.g., customer's geographic region, employee's department, product's price category).
*   When analyzing trends and changes over time are important.

**Pros:**
*   Preserves full historical accuracy.
*   Allows analysis of how attributes changed over time.

**Cons:**
*   Increases table size and storage requirements.
*   Requires more complex ETL processes to manage start/end dates and current flags.
*   Queries can be slightly more complex (e.g., filtering for `IsCurrent = TRUE` or `EndDate IS NULL`).

**Example (SQL - Insert/Update with StartDate/EndDate/IsCurrent):**

Assume a `DimCustomer` table: `CustomerSK` (Surrogate Key), `CustomerID` (Business Key), `CustomerName`, `Address`, `StartDate`, `EndDate`, `IsCurrent`.

```sql
-- Initial state
INSERT INTO DimCustomer (CustomerSK, CustomerID, CustomerName, Address, StartDate, EndDate, IsCurrent)
VALUES (1, 101, 'Alice Smith', '123 Main St', '2022-01-01', NULL, TRUE);

-- Alice moves to a new address on 2023-01-15
-- Step 1: Update the old record's EndDate and IsCurrent flag
UPDATE DimCustomer
SET EndDate = '2023-01-14', IsCurrent = FALSE
WHERE CustomerID = 101 AND IsCurrent = TRUE;

-- Step 2: Insert a new record for the changed attribute
INSERT INTO DimCustomer (CustomerSK, CustomerID, CustomerName, Address, StartDate, EndDate, IsCurrent)
VALUES (2, 101, 'Alice Smith', '456 Oak Ave', '2023-01-15', NULL, TRUE);
```

Now, `DimCustomer` has two records for `CustomerID = 101`, each valid for a specific period.

## SCD Type 3: Add a New Attribute for the Change

**Concept:** SCD Type 3 introduces a new column(s) in the dimension table to store a limited number of previous attribute values. It typically tracks the "current" and "previous" value.

**Use Cases:**
*   When only the immediate previous value needs to be tracked.
*   When preserving the full history (Type 2) is overkill, but Type 1 is insufficient.
*   Example: Tracking a customer's "previous address" alongside their "current address".

**Pros:**
*   Relatively simple to implement.
*   Less storage overhead than Type 2.
*   Preserves some limited history.

**Cons:**
*   Only tracks a fixed, limited number of past values (e.g., only one "previous" value).
*   Not suitable for tracking attributes that change frequently or require full history.

**Example (SQL - Update with Previous Column):**

Assume a `DimCustomer` table: `CustomerID`, `CustomerName`, `CurrentAddress`, `PreviousAddress`.

```sql
-- Initial state
INSERT INTO DimCustomer (CustomerID, CustomerName, CurrentAddress, PreviousAddress)
VALUES (101, 'Alice Smith', '123 Main St', NULL);

-- Alice moves to a new address
UPDATE DimCustomer
SET PreviousAddress = CurrentAddress, -- Store the old address in PreviousAddress
    CurrentAddress = '456 Oak Ave'    -- Update CurrentAddress to the new one
WHERE CustomerID = 101;
```

Now, `DimCustomer` for `CustomerID = 101` shows `CurrentAddress = '456 Oak Ave'` and `PreviousAddress = '123 Main St'`. If she moves again, '123 Main St' will be lost.

## Hybrid SCD Approaches

Many real-world scenarios combine aspects of different SCD types, leading to hybrid approaches:

*   **SCD Type 4 (History Table):** Similar to Type 1 for the main dimension table, but a separate "history" table stores all past versions of selected attributes, similar to Type 2. This keeps the main dimension table lean for current lookups while providing full history elsewhere.
*   **SCD Type 6 (Combination of Type 1, 2, and 3):** This combines elements for different attributes within the same dimension table:
    *   Some attributes might be Type 1 (overwrite).
    *   Others might be Type 2 (new row with dates/flags).
    *   And some might be Type 3 (previous column).
    *   It often also incorporates a "current version" column and a "surrogate key" for each version (like Type 2), plus a "natural key" reference to the original dimension member for easy lookup of all versions.

Choosing a hybrid approach allows for fine-tuned management of dimension changes based on the specific requirements of each attribute and business need.

## Implementation Considerations

*   **ETL Process Complexity:** Implementing SCDs, especially Type 2, significantly increases the complexity of your ETL (Extract, Transform, Load) processes. You need logic to detect changes, update existing records (for `EndDate`/`IsCurrent` flags), and insert new records.
*   **Performance Impact:**
    *   Type 2 dimensions can grow large, potentially affecting join performance. Proper indexing is crucial.
    *   Queries on Type 2 dimensions often require filtering by `IsCurrent` or `EndDate` to get the current view, or by `StartDate`/`EndDate` for historical views.
*   **Surrogate Keys:** Always use surrogate keys in your dimension tables. These are independent of the business key and simplify managing changes, especially in Type 2, where a single business entity can have multiple rows.
*   **Business Key:** The natural key (e.g., `CustomerID`) is still essential to identify the business entity across different versions of the dimension member.
*   **Choosing the Right Type:** The decision on which SCD type to use depends entirely on the business requirements for historical reporting on each specific attribute. Not all attributes in a dimension table need to follow the same SCD strategy.

## Checklist / Exercises

1.  **Scenario Analysis:** You are designing a `DimProduct` table. The `ProductPrice` changes frequently, and your business needs to know the price a product had at the time of any past sale. What SCD type would you recommend for the `ProductPrice` attribute, and why?
2.  **SCD Type 1 vs. Type 2:** Explain a business scenario where using SCD Type 1 for a `CustomerEmail` attribute would be acceptable, and another scenario where it would be unacceptable, requiring SCD Type 2 instead.
3.  **ETL Logic for Type 2:** Outline the high-level steps an ETL job would take to process incoming source data for a dimension table implementing SCD Type 2. Focus on detecting changes and updating/inserting records.