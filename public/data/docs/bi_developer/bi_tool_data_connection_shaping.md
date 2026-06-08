# Data Connection & Initial Shaping in BI Tools

Connecting to data sources and preparing data are foundational steps in any Business Intelligence (BI) project. Before you can build insightful reports and dashboards, your data must be accessible, clean, and in a usable format. This guide will walk you through the essential concepts and techniques for connecting to various data sources and performing initial data shaping within a BI tool, with a focus on features like Power Query Editor.

## 1. The Importance of Data Connection and Shaping

Raw data rarely comes in a perfect state for analysis. It might be spread across multiple systems, contain inconsistencies, have incorrect data types, or include irrelevant information.

*   **Data Connection**: The process of establishing a link between your BI tool and the source where your data resides. A robust BI tool can connect to a vast array of data sources.
*   **Data Shaping/Transformation**: The process of cleaning, transforming, and restructuring raw data into a format suitable for analysis and modeling. This preliminary step significantly impacts the accuracy and performance of your BI solutions.

## 2. Common Data Sources in BI Tools

Modern BI tools offer extensive connectivity options. Here are common categories:

*   **Databases**:
    *   **Relational Databases**: SQL Server, MySQL, PostgreSQL, Oracle, Azure SQL Database, Amazon RDS.
    *   **NoSQL Databases**: MongoDB, Cassandra (often via connectors or APIs).
*   **Files**:
    *   **Spreadsheets**: Excel (XLSX, XLS), CSV.
    *   **Text Files**: TXT, JSON, XML.
    *   **Other Formats**: Parquet, Avro.
*   **Web Services/APIs**: REST APIs, OData feeds.
*   **Cloud Services**:
    *   **Cloud Data Warehouses**: Snowflake, Google BigQuery, Amazon Redshift.
    *   **Cloud Storage**: Azure Blob Storage, AWS S3, Google Cloud Storage.
    *   **SaaS Applications**: Salesforce, Dynamics 365, Google Analytics (often via built-in connectors).

## 3. Initial Data Shaping & Transformation with Power Query Editor

Power Query Editor (found in tools like Power BI, Excel, and SQL Server Analysis Services) is a powerful Extract, Transform, Load (ETL) tool that allows you to connect, transform, and combine data from various sources. The transformations applied in Power Query are recorded as steps and can be refreshed automatically, ensuring your data model always uses the latest prepared data.

### Key Capabilities and Common Transformations:

*   **Connecting to Data Sources**: Easily select from a wide range of connectors.
*   **Column Management**:
    *   `Remove Columns`: Eliminate unnecessary columns.
    *   `Choose Columns`: Select only the columns you need.
    *   `Rename Columns`: Give columns meaningful names.
*   **Row Management**:
    *   `Remove Rows`: Remove top/bottom rows, blank rows, or duplicate rows.
    *   `Keep Rows`: Keep top/bottom rows, or filter specific rows.
*   **Data Type Conversion**: Ensure columns have the correct data type (e.g., Text, Number, Date, Currency). This is crucial for accurate calculations and filtering.
*   **Splitting Columns**: Divide a single column into multiple columns based on a delimiter, number of characters, or positions.
*   **Merging Queries**: Combine two or more queries (tables) based on a common column (e.g., SQL JOIN operations).
*   **Appending Queries**: Stack rows from two or more queries (tables) with the same schema on top of each other (e.g., SQL UNION ALL operations).
*   **Pivoting/Unpivoting Columns**:
    *   `Pivot Column`: Transform rows into columns, often used for summarizing data.
    *   `Unpivot Columns`: Transform columns into rows, often used to normalize "cross-tab" data.
*   **Adding Custom Columns**: Create new columns using custom formulas (M language).
*   **Conditional Columns**: Add columns based on specific conditions.
*   **Replacing Values**: Find and replace specific values within a column.
*   **Handling Errors and Nulls**: Remove or replace error values, fill down/up null values.

### The M Language

Behind every step you perform in Power Query Editor, a corresponding M formula is generated. M is a powerful functional language that gives you granular control over your transformations. While you can achieve a lot with the graphical interface, understanding M allows for more complex and custom transformations.

## 4. Example: Connecting to a CSV and Basic Shaping

Let's illustrate a common scenario: connecting to a CSV file and performing initial clean-up.

Imagine you have a `SalesData.csv` file with the following content:

```csv
OrderID,Product,Quantity,Price,OrderDate,Region
1001,Laptop,2,1200.00,2023-01-15,East
1002,Mouse,5,25.50,2023-01-16,West
1003,Keyboard,1,75.00,2023-01-15,East
1004,Monitor,1,300.00,2023-01-17,South
1005,Webcam,3,50.00,2023-01-16,West
```

**Steps in a BI Tool (e.g., Power BI Desktop Power Query Editor):**

1.  **Connect to Data**: 
    *   Click `Get Data` -> `Text/CSV`.
    *   Browse to and select `SalesData.csv`.
    *   In the preview window, ensure the delimiter and data detection are correct. Click `Transform Data`.
2.  **Initial Review**: The data loads into Power Query Editor. Check column headers and inferred data types.
3.  **Rename Columns (if needed)**: If `OrderDate` was `SaleDate`, you'd double-click the column header and rename it.
4.  **Change Data Types**:
    *   `OrderID`: Ensure it's `Whole Number`.
    *   `Product`: Ensure it's `Text`.
    *   `Quantity`: Ensure it's `Whole Number`.
    *   `Price`: Ensure it's `Decimal Number` or `Currency`.
    *   `OrderDate`: Ensure it's `Date`.
    *   `Region`: Ensure it's `Text`.
    *   To change, right-click the column header -> `Change Type` -> Select desired type.
5.  **Remove Unnecessary Columns**: If the `Region` column wasn't needed for your analysis, you would:
    *   Right-click the `Region` column header -> `Remove`.
6.  **Load Data**: Once transformations are complete, click `Close & Apply` to load the shaped data into your BI tool's data model.

Each of these actions is recorded as "Applied Step" in Power Query Editor, making the transformation process transparent and repeatable.

## 5. Checklist/Exercise

1.  **Identify the appropriate data source connector**: You need to import customer data stored in a Microsoft SQL Server database. Which connector would you typically use in Power Query Editor?
2.  **Perform a common transformation**: You have a `FullName` column (e.g., "John Doe") and need separate `FirstName` and `LastName` columns. Describe the Power Query transformation you would use and how you'd typically access it.
3.  **Explain the significance of data typing**: Why is it critical to ensure columns like `SalesAmount` and `OrderDate` have the correct data types (e.g., Decimal Number, Date) *before* building a semantic model?