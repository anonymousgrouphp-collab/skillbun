# Excel/Google Sheets for Advanced Data Analysis: Study Guide

This guide will equip you with advanced spreadsheet capabilities essential for complex data manipulation, analysis, and reporting. Mastering these tools will significantly enhance your efficiency and analytical depth in data-driven tasks.

## 1. Advanced Lookup Functions

These functions are crucial for retrieving specific data from large datasets based on one or more criteria.

### a. VLOOKUP (Vertical Lookup)

Used to find data in a table or a range by row. It searches for a value in the first column of a table array and returns a value in the same row from a column you specify.

*   **Syntax:** `=VLOOKUP(lookup_value, table_array, col_index_num, [range_lookup])`
*   **Key Concept:** `range_lookup` (TRUE for approximate match, FALSE for exact match, always prefer `FALSE` for data analysis unless specific sorting and approximate matching are intended).
*   **Example:** To find the price of a product `P001` from a table where product IDs are in the first column and prices in the second:
    ```excel
    =VLOOKUP("P001", A2:B100, 2, FALSE)
    ```

### b. INDEX-MATCH

A more flexible alternative to VLOOKUP. `MATCH` finds the position of an item in a range, and `INDEX` returns the value at a specified position in a range.

*   **Advantages:** Can look up to the left, faster with large datasets, less prone to errors when columns are inserted/deleted.
*   **Syntax:** `=INDEX(return_range, MATCH(lookup_value, lookup_range, [match_type]))`
*   **Key Concept:** `match_type` (0 for exact match, -1 for exact or smallest greater than, 1 for exact or largest less than).
*   **Example:** Same as above, finding the price of `P001` where product IDs are in `A:A` and prices in `B:B`:
    ```excel
    =INDEX(B:B, MATCH("P001", A:A, 0))
    ```

### c. XLOOKUP (Excel 365+)

The modern successor to VLOOKUP and HLOOKUP, offering greater flexibility and simpler syntax.

*   **Advantages:** Default exact match, can lookup left/right, up/down, returns multiple values, handles #N/A gracefully.
*   **Syntax:** `=XLOOKUP(lookup_value, lookup_array, return_array, [if_not_found], [match_mode], [search_mode])`
*   **Example:** Finding the price of `P001`:
    ```excel
    =XLOOKUP("P001", A:A, B:B, "Not Found")
    ```

## 2. Advanced Aggregation and Summarization

### a. SUMIFS, COUNTIFS, AVERAGEIFS

These functions allow you to sum, count, or average data based on multiple criteria.

*   **Syntax:** 
    *   `=SUMIFS(sum_range, criteria_range1, criteria1, [criteria_range2, criteria2], ...)`
    *   `=COUNTIFS(criteria_range1, criteria1, [criteria_range2, criteria2], ...)`
    *   `=AVERAGEIFS(average_range, criteria_range1, criteria1, [criteria_range2, criteria2], ...)`
*   **Example:** Sum sales for `Product A` in `Region North`:
    ```excel
    =SUMIFS(C:C, A:A, "Product A", B:B, "North")
    ```

### b. Pivot Tables

A powerful tool for summarizing, analyzing, exploring, and presenting data. They allow you to transform columns into rows and vice-versa, group data, and perform calculations rapidly.

*   **Core Components:**
    *   **Rows:** Fields dragged here become row labels.
    *   **Columns:** Fields dragged here become column labels.
    *   **Values:** Fields dragged here are summarized (e.g., Sum, Count, Average).
    *   **Filters:** Fields used to filter the entire pivot table.
*   **Use Case:** Quickly analyze total sales by product category and region, or count customers per city.
*   **Configuration:** Select your data range -> Insert -> PivotTable -> Choose fields and drag to appropriate areas.

## 3. Data Quality and Integrity Tools

### a. Data Validation

Restricts the type of data or values that users enter into a cell, ensuring data consistency and reducing errors.

*   **Types:** List (dropdowns), Whole number, Decimal, Date, Time, Text length, Custom (formula-based).
*   **Configuration:** Select cell(s) -> Data (tab) -> Data Validation -> Settings (choose rule), Input Message, Error Alert.
*   **Example:** To create a dropdown list in cell `A1` with values `"High", "Medium", "Low"`:
    1.  Select `A1`.
    2.  Go to `Data` > `Data Validation`.
    3.  Under `Allow:`, select `List`.
    4.  In `Source:`, type `High,Medium,Low`.
    5.  Click `OK`.

### b. Conditional Formatting

Applies formatting (colors, icons, data bars) to cells based on specified conditions, making patterns and trends visually apparent.

*   **Rules:** Highlight Cell Rules (e.g., greater than, text contains), Top/Bottom Rules, Data Bars, Color Scales, Icon Sets.
*   **Use Case:** Highlight all sales figures above a certain target in green, or display a red data bar for low inventory.
*   **Configuration:** Select range -> Home (tab) -> Conditional Formatting -> New Rule (or choose a preset).

## 4. Dynamic Array Formulas (Excel 365+)

These formulas return arrays of values that 'spill' into adjacent cells automatically, without needing to be entered as CSE (Ctrl+Shift+Enter) formulas.

*   **Key Concept:** A single formula in one cell can populate multiple cells.
*   **Functions:** `UNIQUE`, `SORT`, `FILTER`, `SEQUENCE`, `RANDARRAY`.
*   **Example (UNIQUE):** To get a unique list of products from column `A`:
    ```excel
    =UNIQUE(A:A)
    ```
    This formula, entered in one cell, will spill the unique product list downwards.

## 5. Power Query (Get & Transform) / Google Sheets (Data Connectors & Apps Script)

Power Query (in Excel) and its conceptual equivalents in Google Sheets (though less direct and often involving add-ons or Apps Script for complex ETL) enable robust data cleaning, shaping, and combining data from various sources.

*   **Purpose:** Act as an ETL (Extract, Transform, Load) tool within spreadsheets.
*   **Key Features (Power Query):
    *   **Extract:** Connect to diverse data sources (CSV, Excel files, databases, web).
    *   **Transform:** Clean and shape data (remove duplicates, unpivot columns, split columns, merge queries, fill down, replace values).
    *   **Load:** Load the transformed data back into Excel (as a table or only as a connection).
*   **Basic ETL Process Overview:**
    1.  **Get Data:** Import data from a source (e.g., `Data` tab -> `Get Data` in Excel).
    2.  **Transform Data:** The Power Query Editor opens, allowing you to apply various transformations.
    3.  **Close & Load:** Load the cleaned data into your spreadsheet for analysis.
*   **Example (Power Query Steps):**
    1.  Import a CSV file containing sales data.
    2.  Use `Remove Rows` > `Remove Duplicates` on the 'OrderID' column.
    3.  Use `Split Column` > `By Delimiter` on a 'ProductName' column to separate product name and variant.
    4.  Use `Merge Queries` to combine sales data with customer demographic data based on 'CustomerID'.
    5.  `Close & Load` to bring the combined, cleaned data into an Excel sheet.

## Checklist/Exercise:

1.  **Scenario:** You have a list of employee IDs in column A, their departments in column B, and their salaries in column C. Use `INDEX-MATCH` to find the salary of `EmployeeID_12345`.
2.  **Task:** Create a pivot table to show the total sales for each `ProductCategory` across different `Regions`. Highlight regions with sales over `$10,000` using conditional formatting.
3.  **Challenge:** Using Power Query (or outlining the steps if using Google Sheets), import two separate CSV files: `customers.csv` (CustomerID, Name, City) and `orders.csv` (OrderID, CustomerID, Product, Amount). Merge them to create a single table showing OrderID, Customer Name, City, Product, and Amount. Remove any duplicate OrderIDs during the process.
