# Understanding Data, Data Types & Sources

Welcome to the foundational module on understanding data! As a Data Visualization Specialist, your ability to create impactful visualizations hinges entirely on a deep comprehension of the underlying data. This guide will equip you with the essential knowledge of data types, structures, sources, and critical concepts like granularity and cardinality, all crucial for effective data representation.

## 1. Data Types

Data can be broadly categorized into quantitative and qualitative, with further subdivisions that dictate how it can be analyzed and visualized.

### 1.1. Quantitative Data (Numerical)
Represents measurable quantities.

*   **Continuous Data**: Can take any value within a given range.
    *   *Examples*: Temperature (25.5°C), height (175.3 cm), time (3.14 seconds).
*   **Discrete Data**: Can only take specific, distinct values, often integers.
    *   *Examples*: Number of students (25), count of clicks (120), age in years (30).

### 1.2. Qualitative Data (Categorical)
Represents characteristics or categories.

*   **Nominal Data**: Categories without any intrinsic order or ranking.
    *   *Examples*: Colors (Red, Blue, Green), marital status (Single, Married, Divorced), country (USA, Canada, Mexico).
*   **Ordinal Data**: Categories with a meaningful order or ranking, but the difference between categories isn't necessarily uniform or measurable.
    *   *Examples*: Education level (High School, Bachelor's, Master's, PhD), satisfaction ratings (Low, Medium, High), product size (Small, Medium, Large).

## 2. Data Structures

The way data is organized significantly impacts how you process and visualize it.

### 2.1. Tabular Data
Organized into rows and columns, similar to a spreadsheet or a database table. Each row represents a record, and each column represents an attribute or field.
*   *Characteristics*: Structured, easy to query, ideal for many common visualizations (bar charts, line charts, scatter plots).
*   *Examples*: CSV files, Excel spreadsheets, SQL database tables.

### 2.2. Hierarchical Data
Data organized in a tree-like structure, where items have parent-child relationships.
*   *Characteristics*: Shows nested relationships, branching.
*   *Examples*: Organizational charts, file system directories, JSON/XML documents (when nested).

### 2.3. Network/Graph Data
Represents entities (nodes) and their relationships (edges).
*   *Characteristics*: Focuses on connections and interactions.
*   *Examples*: Social networks (people connected by friendships), transportation networks (cities connected by roads), citation networks.

### 2.4. Geospatial Data
Data that represents objects or phenomena on the Earth's surface.
*   *Characteristics*: Includes location information (latitude, longitude), often with attributes.
*   *Examples*: Maps, GPS coordinates, population density by region, weather patterns.

## 3. Common Data Sources

Understanding where data comes from helps in strategizing data extraction, cleaning, and preparation.

### 3.1. Databases
Structured collections of data.
*   **Relational Databases (SQL)**: Data stored in tables with predefined schemas, relationships between tables.
    *   *Examples*: MySQL, PostgreSQL, SQL Server, Oracle.
*   **NoSQL Databases**: More flexible schemas, suited for large volumes of unstructured or semi-structured data.
    *   *Examples*: MongoDB (document-based), Cassandra (column-family), Redis (key-value), Neo4j (graph).

### 3.2. APIs (Application Programming Interfaces)
Interfaces that allow different software systems to communicate and exchange data.
*   *Characteristics*: Data often returned in JSON or XML format.
*   *Examples*: Weather APIs, social media APIs (Twitter, Facebook), stock market data APIs.

### 3.3. Files
Data stored in various file formats.
*   **CSV (Comma Separated Values)**: Plain text, tabular data, delimited by commas.
*   **JSON (JavaScript Object Notation)**: Human-readable, light-weight data-interchange format, often used for hierarchical and semi-structured data.
*   **XML (Extensible Markup Language)**: Markup language, often used for hierarchical data, more verbose than JSON.
*   **Excel Spreadsheets (.xlsx, .xls)**: Proprietary format, commonly used for tabular data, supports multiple sheets, formulas.
*   **Parquet/ORC**: Columnar storage formats, optimized for big data analytics.

## 4. Fundamental Concepts for Visualization

### 4.1. Data Granularity
Refers to the level of detail at which the data is recorded or stored.
*   **High Granularity (Fine-grained)**: Very detailed data (e.g., individual transaction records, hourly sensor readings). Offers more possibilities for analysis but can be complex.
*   **Low Granularity (Coarse-grained)**: Summarized or aggregated data (e.g., daily sales totals, monthly average temperatures). Simpler to analyze but less detailed.
*   *Relevance for Visualization*: Choosing the right granularity is critical. Too fine-grained data can lead to cluttered, unreadable visualizations. Too coarse-grained data might hide important patterns. You often aggregate data to a suitable granularity for a specific visualization.

### 4.2. Data Cardinality
Refers to the number of unique values in a particular column or attribute.
*   **High Cardinality**: Many unique values (e.g., customer IDs, email addresses, exact timestamps).
*   **Low Cardinality**: Few unique values (e.g., gender, country codes, True/False flags).
*   *Relevance for Visualization*: 
    *   High cardinality dimensions can be problematic for categorical charts (e.g., bar charts with thousands of bars). They might be better suited for filtering, grouping, or detailed tables.
    *   Low cardinality dimensions are excellent for grouping, filtering, and segmenting data in various charts (e.g., using "Gender" as a color encoding).

## 5. Simple Data Structure Example (Python)

Here's an example of how different data types might appear in a simple tabular structure, represented as a list of dictionaries in Python:

```python
# A list of dictionaries representing tabular data
sales_data = [
    {
        "transaction_id": "TXN001",    # Nominal (string, unique ID)
        "product_name": "Laptop",     # Nominal (string)
        "category": "Electronics",    # Nominal (string)
        "quantity": 2,                # Discrete Quantitative (integer)
        "price_usd": 1200.50,         # Continuous Quantitative (float)
        "region": "North",            # Nominal (string)
        "satisfaction_rating": "High", # Ordinal (string)
        "sale_date": "2023-01-15"      # Date (can be treated as ordinal or temporal)
    },
    {
        "transaction_id": "TXN002",
        "product_name": "Mouse",
        "category": "Electronics",
        "quantity": 5,
        "price_usd": 25.00,
        "region": "South",
        "satisfaction_rating": "Medium",
        "sale_date": "2023-01-16"
    },
    {
        "transaction_id": "TXN003",
        "product_name": "Keyboard",
        "category": "Electronics",
        "quantity": 1,
        "price_usd": 75.99,
        "region": "North",
        "satisfaction_rating": "High",
        "sale_date": "2023-01-15"
    }
]

# Example of accessing data and types
print(f"Product name (TXN001): {sales_data[0]['product_name']} (Type: Nominal)")
print(f"Price (TXN001): {sales_data[0]['price_usd']} (Type: Continuous Quantitative)")
print(f"Satisfaction rating (TXN002): {sales_data[1]['satisfaction_rating']} (Type: Ordinal)")
```

## 6. Quick Understanding Checklist/Exercise

1.  Identify the data type (quantitative continuous, quantitative discrete, nominal, ordinal) for each of the following:
    *   A. Number of houses sold in a month.
    *   B. The temperature in Celsius.
    *   C. Customer feedback ratings (Very Poor, Poor, Average, Good, Excellent).
    *   D. Types of fruits (Apple, Banana, Orange).
2.  Imagine you have a dataset of customer orders. What would be an example of "high granularity" data versus "low granularity" data for sales reporting?
3.  Why is it generally problematic to create a bar chart where each bar represents a unique customer email address (assuming thousands of customers)? What concept does this relate to?
