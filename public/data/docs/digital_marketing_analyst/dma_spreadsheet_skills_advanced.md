# Advanced Spreadsheet Skills for Analysis

Welcome to the Advanced Spreadsheet Skills for Analysis study guide! As a Digital Marketing Analyst, your ability to manipulate, clean, and analyze data efficiently in spreadsheets is paramount. This guide will equip you with advanced functions and tools in Excel and Google Sheets, transforming you into a spreadsheet power user.

## 1. Powerful Lookup Functions

Lookup functions are essential for retrieving specific data from large datasets.

### VLOOKUP (Vertical Lookup)

`VLOOKUP` searches for a value in the first column of a table array and returns a value in the same row from a column you specify.

*   **Syntax:** `=VLOOKUP(lookup_value, table_array, col_index_num, [range_lookup])`
*   **Use Cases:** Matching customer IDs to names, retrieving product details from a master list.
*   **Limitations:** Can only look right (returns values from columns to the right of the lookup column). Requires the lookup column to be the first in the `table_array`.

**Example:**
To find the price of "Product B" from a table where product names are in the first column and prices in the second:
```excel
=VLOOKUP("Product B", A2:B10, 2, FALSE)
```

### INDEX/MATCH

The combination of `INDEX` and `MATCH` is more flexible and powerful than `VLOOKUP`.

*   `MATCH`: Returns the relative position of an item in an array that matches a specified value in a specified order.
    *   **Syntax:** `=MATCH(lookup_value, lookup_array, [match_type])`
*   `INDEX`: Returns the value of an element in a table or an array, selected by the row and column number indexes.
    *   **Syntax:** `=INDEX(array, row_num, [column_num])`
*   **Use Cases:** Retrieving data from any column, looking up values to the left, using multiple criteria (with helper columns or advanced techniques).

**Example:**
To find the price of "Product B" where product names are in column B and prices in column A:
```excel
=INDEX(A2:A10, MATCH("Product B", B2:B10, 0))
```
Here, `MATCH` finds "Product B" in `B2:B10` and returns its row number, which `INDEX` then uses to fetch the corresponding price from `A2:A10`.

## 2. Advanced Data Transformation Functions (Google Sheets)

Google Sheets offers unique functions that allow for powerful data manipulation.

### QUERY

The `QUERY` function allows you to use SQL-like commands to select, filter, aggregate, and sort data. It's incredibly powerful for large datasets.

*   **Syntax:** `=QUERY(data, query, [headers])`
*   **Use Cases:** Filtering data based on multiple conditions, grouping and summing values, sorting results.

**Example:**
To select columns A and C from `A1:D100`, where column B is "Marketing" and sort by column A:
```excel
=QUERY(A1:D100, "SELECT A, C WHERE B = 'Marketing' ORDER BY A", 1)
```

### ARRAYFORMULA

`ARRAYFORMULA` enables you to apply a function to an entire range of cells rather than dragging it down individually, often simplifying complex calculations and improving performance.

*   **Syntax:** `=ARRAYFORMULA(array_formula)`
*   **Use Cases:** Applying a calculation to a whole column, performing operations on arrays, using other functions like `IF`, `SUM`, `VLOOKUP` across ranges.

**Example:**
To calculate `Price * Quantity` for an entire column D (assuming Price in B and Quantity in C), without dragging the formula:
```excel
=ARRAYFORMULA(B2:B100 * C2:C100)
```
This formula is entered only in D2, and it populates D2:D100.

## 3. Data Aggregation and Summarization: Pivot Tables

Pivot tables are indispensable tools for summarizing, analyzing, exploring, and presenting data. They allow you to quickly group data, calculate sums, averages, counts, and more, across various dimensions.

*   **Key Components:**
    *   **Rows:** Fields dragged here become rows in the pivot table.
    *   **Columns:** Fields dragged here become columns.
    *   **Values:** Numerical fields for aggregation (e.g., Sum, Average, Count).
    *   **Filters:** Used to narrow down the data shown in the pivot table.
*   **Use Cases:** Analyzing sales by region, website traffic by source, campaign performance by channel.

**Steps to Create a Basic Pivot Table (Excel/Google Sheets):**
1.  Select your data range.
2.  Go to `Insert` > `PivotTable` (Excel) or `Data` > `Pivot table` (Google Sheets).
3.  Choose where to place the pivot table (new worksheet is common).
4.  Drag your desired fields into the Rows, Columns, Values, and Filters areas. For example, drag 'Campaign' to Rows, 'Metric' (e.g., Clicks) to Values.

## 4. Data Quality and Presentation: Conditional Formatting & Data Validation

These features enhance data usability and integrity.

### Conditional Formatting

Conditional formatting automatically applies formatting (e.g., colors, icons, data bars) to cells based on specified rules. This helps in quickly identifying trends, outliers, or important data points.

*   **Use Cases:** Highlighting top 10% performing campaigns, flagging negative values, visualizing performance with data bars.

**Example:**
To highlight cells in `C2:C100` that have a value greater than 1000:
1.  Select `C2:C100`.
2.  Go to `Home` > `Conditional Formatting` > `Highlight Cells Rules` > `Greater Than...` (Excel) or `Format` > `Conditional formatting` (Google Sheets).
3.  Enter `1000` and choose your desired format.

### Data Validation

Data validation allows you to restrict the type of data or values that users can enter into a cell. This is crucial for maintaining data consistency and preventing errors.

*   **Use Cases:** Ensuring dates are entered correctly, limiting entries to a predefined list (e.g., "Organic", "Paid", "Referral"), enforcing numerical ranges.

**Example:**
To restrict cell `B2` to only accept values from a predefined list "Organic", "Paid", "Direct":
1.  Select `B2`.
2.  Go to `Data` > `Data Validation` (Excel/Google Sheets).
3.  Set "Allow" (Excel) or "Criteria" (Google Sheets) to "List" or "List of items".
4.  Enter the items: `Organic, Paid, Direct`.
5.  Check "Show in-cell dropdown" (Excel) or "Show dropdown list in cell" (Google Sheets).

---

## Quick Checklist/Exercise

1.  **Lookup Challenge:** You have a list of customer IDs in Sheet1 and their corresponding email addresses in Sheet2. Use `INDEX/MATCH` to retrieve the email address for a given customer ID from Sheet1.
2.  **Aggregation Task:** Using a dataset of marketing campaign performance (Campaign Name, Channel, Clicks, Conversions), create a Pivot Table that shows the total `Clicks` and `Conversions` for each `Channel`.
3.  **Data Integrity Check:** Set up Data Validation for a column named "Campaign Status" to only allow "Active", "Paused", or "Completed" as valid entries.