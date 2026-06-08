# DAX Fundamentals (Power BI) Study Guide

Data Analysis Expressions (DAX) is the formula language used throughout Microsoft Power BI, SQL Server Analysis Services Tabular models, and Azure Analysis Services. It's crucial for transforming raw data into meaningful insights by creating powerful custom calculations. This guide covers the foundational concepts of DAX, focusing on measures, calculated columns, and the vital concept of evaluation contexts.

## 1. What is DAX?

DAX is a collection of functions, operators, and constants that can be used in a formula, or expression, to calculate and return one or more values. It's used to define custom calculations in Power BI data models, enabling advanced analytics beyond basic aggregations.

## 2. Key DAX Components

DAX formulas are primarily used to create two types of calculated objects:

### a. Measures

-   **Purpose:** Dynamic calculations that are evaluated at query time, typically used in visuals like tables, matrices, and charts. They do not occupy physical space in the data model.
-   **Context:** Measures are heavily influenced by the filter context of the visual where they are used.
-   **Example:** Calculating Total Sales.

    ```dax
    Total Sales = SUM('Sales'[SalesAmount])
    ```

### b. Calculated Columns

-   **Purpose:** Columns added to an existing table in the data model. Their values are computed during data refresh and stored in the model, taking up memory.
-   **Context:** Evaluated row by row (row context) when the data model is processed.
-   **Example:** Creating a "Profit Margin" column.

    ```dax
    Profit Margin = DIVIDE('Sales'[ProfitAmount], 'Sales'[SalesAmount])
    ```

## 3. Understanding Evaluation Contexts (Crucial Concept)

Understanding how DAX evaluates formulas is fundamental. There are three primary evaluation contexts:

### a. Row Context

-   **Definition:** The "current row" under evaluation. It is implicitly present for calculated columns (the formula is evaluated for each row). For measures, row context is typically created by iterator functions (e.g., `SUMX`, `AVERAGEX`) that iterate over a table row by row.
-   **How it Works:** When you define a calculated column like `[Full Name] = [FirstName] & " " & [LastName]`, DAX iterates through each row of the table, making the values of `[FirstName]` and `[LastName]` for *that specific row* available to the formula.

### b. Filter Context

-   **Definition:** The set of filters applied to the data model. These filters can come from:
    -   Report visuals (e.g., a bar chart filtered by "Year 2023").
    -   Slicers and filters panes.
    -   Relationships between tables.
    -   Other DAX expressions (especially with `CALCULATE`).
-   **How it Works:** When a measure is placed in a visual, the filter context determines which subset of data the measure operates on. For example, a `Total Sales` measure in a table showing sales by "Region" will calculate sales for each specific region due to the filter context applied to each row of the table.

### c. Query Context

-   **Definition:** The overall request or query sent to the data model, which defines the initial shape of the results. This is less explicit in DAX formulas themselves but influences how the final data is presented.

### Interplay of Contexts

The `CALCULATE` function is the most powerful function in DAX as it allows you to modify the filter context. It's used to explicitly add, remove, or modify filters during the evaluation of an expression.

```dax
Sales Last Year = CALCULATE(
    SUM('Sales'[SalesAmount]),
    SAMEPERIODLASTYEAR('Date'[Date])
)
```
In this example, `CALCULATE` changes the filter context to evaluate `SUM('Sales'[SalesAmount])` for the same period as the current filter context, but in the previous year.

## 4. Fundamental DAX Functions

A brief overview of essential DAX function categories:

-   **Aggregation Functions:** `SUM`, `AVERAGE`, `MIN`, `MAX`, `COUNT`, `DISTINCTCOUNT`.
-   **Iterator Functions:** `SUMX`, `AVERAGEX`, `MAXX`, `MINX` (operate row-by-row over a table, then aggregate).
-   **Logical Functions:** `IF`, `AND`, `OR`, `NOT`.
-   **Text Functions:** `CONCATENATE`, `LEFT`, `RIGHT`, `LEN`, `SEARCH`.
-   **Date and Time Functions:** `DATE`, `YEAR`, `MONTH`, `DAY`, `TODAY`, `NOW`, `CALENDARAUTO`.
-   **Table Manipulation/Filter Functions:** `FILTER`, `ALL`, `ALLEXCEPT`, `RELATED`, `RELATEDTABLE`.
-   **Relationship Functions:** `USERELATIONSHIP`, `CROSSFILTER`.

## 5. Quick Check-in Exercise

1.  Explain the key difference in how and when a `Measure` vs. a `Calculated Column` is evaluated and stored.
2.  Describe a scenario where `Row Context` is implicitly applied, and another where it needs to be explicitly created using an iterator function.
3.  How does the `CALCULATE` function fundamentally alter the evaluation of a DAX expression?
