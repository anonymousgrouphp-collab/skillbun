# Introduction to Data Types and Structures for Data Analysts

Understanding the fundamental types and structures of data is the bedrock of effective data analysis. As a data analyst, you'll encounter data in various forms, and knowing how to categorize, handle, and assess its quality is paramount to drawing accurate insights.

## 1. Understanding Data: The Foundation of Analytics
Data forms the raw material for insights. Before you can clean, transform, or model data, you must first understand what kind of data you're working with and how it's organized. This foundational knowledge prevents misinterpretations, ensures appropriate analytical methods are used, and underpins data integrity.

## 2. Essential Data Types
Data types classify the kind of values a variable or column can hold. Choosing the correct data type is crucial for storage efficiency, accurate computations, and appropriate visualizations.

### Numerical Data
Represents quantities that can be measured or counted.
*   **Integers (int):** Whole numbers without decimal points (e.g., `age`, `number_of_items`, `OrderID`).
*   **Floating-point (float):** Numbers with decimal points, used for precise measurements (e.g., `price`, `temperature`, `average_score`).

### Categorical Data
Represents qualitative characteristics or groups. Values typically fall into a limited set of categories.
*   **Nominal:** Categories without any inherent order or ranking (e.g., `gender` (Male, Female, Other), `city` (New York, London, Tokyo), `product_color` (Red, Blue, Green)).
*   **Ordinal:** Categories with a clear, meaningful order or ranking, but the difference between categories might not be uniform or measurable (e.g., `customer_satisfaction` (Very Poor, Poor, Neutral, Good, Very Good), `education_level` (High School, Bachelor's, Master's, PhD)).

### Temporal Data
Represents points or intervals in time.
*   **Dates:** Specific calendar dates (e.g., `2023-01-15`).
*   **Times:** Specific times of day (e.g., `14:30:00`).
*   **Timestamps:** A combination of date and time, often including time zones (e.g., `2023-01-15 14:30:00 UTC`).

### Boolean Data
Represents truth values, typically with two possible states.
*   **True/False (Binary):** Often represented as 1/0 (e.g., `is_active`, `is_shipped`, `has_discount`).

### Text (String) Data
Represents sequences of characters.
*   **Free Text:** Names, descriptions, addresses, comments, product reviews (e.g., `customer_name`, `product_description`).

## 3. Common Data Structures in Analytics
Data structures define how data is organized, managed, and stored, facilitating efficient access and modification. For data analysts, understanding common organizational patterns is key.

### Tables (Tabular Data)
This is the most common and intuitive data structure in analytics, resembling a spreadsheet.
*   Organized into **rows** (records/observations) and **columns** (fields/attributes).
*   Examples: Spreadsheets (Excel), CSV files, relational databases (SQL tables), Pandas DataFrames.
*   Each column typically holds data of a single type (e.g., a 'Price' column contains only numerical values).

### Time Series Data
A sequence of data points indexed (or listed) in time order.
*   Each data point has a corresponding timestamp.
*   Used for analyzing trends, seasonality, and forecasting.
*   Examples: Stock prices over days, sensor readings from a device every minute, website traffic per hour.

### Hierarchical Data
Data organized in a tree-like structure, with parent-child relationships.
*   Elements are arranged in levels or ranks, where one element is subordinate to another.
*   Examples: Organizational charts, file systems, XML documents, some nested JSON structures, geographical data (continent -> country -> state -> city).

### JSON (JavaScript Object Notation)
A lightweight data-interchange format that is human-readable and easy for machines to parse.
*   Built on two structures:
    *   **Objects:** A collection of `key: value` pairs (e.g., `{"name": "Alice", "age": 30}`).
    *   **Arrays:** An ordered list of values (e.g., `["apple", "banana", "cherry"]`).
*   Often used for web APIs and configuration files, supporting nested structures.

### XML (eXtensible Markup Language)
A markup language that defines a set of rules for encoding documents in a format that is both human-readable and machine-readable.
*   Uses tags to define elements and attributes to provide metadata.
*   Supports complex hierarchical structures.
*   Examples: Data interchange between systems, configuration files, web services (SOAP).

## 4. Principles of Data Integrity
Data integrity refers to the overall completeness, accuracy, and consistency of data throughout its entire lifecycle. Maintaining data integrity is crucial for reliable analysis and decision-making.

### Key Aspects:
*   **Entity Integrity:** Ensures that each record in a table has a unique identifier (a primary key) and that this identifier is never null. This guarantees that each row can be uniquely identified.
*   **Referential Integrity:** Maintains consistency between related tables by ensuring that relationships between them remain valid. For example, if a foreign key in one table refers to a primary key in another table, then every foreign key value must have a corresponding primary key value.
*   **Domain Integrity:** Ensures that all values in a column are valid according to predefined rules (e.g., data types, range constraints, allowable values). For instance, an 'Age' column might have a domain constraint that values must be positive integers.
*   **User-Defined Integrity:** Business rules that don't fit into the above categories but are essential for the specific application (e.g., 'An order quantity cannot exceed available stock').

## 5. Data Profiling: Unveiling Data Characteristics
Data profiling is the process of examining the data available in an existing information source and collecting statistics and information about that data. It helps analysts understand the data's content, structure, and quality before performing more in-depth analysis.

### What it reveals:
*   **Data Types:** Actual data types vs. expected data types.
*   **Uniqueness:** Number of distinct values, identification of primary key candidates.
*   **Completeness:** Percentage of non-null values for each column.
*   **Patterns:** Regular expressions, format consistency.
*   **Distributions:** Frequency of values, minimum, maximum, mean, median, standard deviation.
*   **Relationships:** Identification of potential foreign keys between datasets.
*   **Potential Issues:** Inconsistent data entry, unexpected values, outliers.

## 6. Initial Data Quality Assessment
Poor data quality can lead to flawed analysis, incorrect conclusions, and bad business decisions. Initial assessment helps identify and prioritize data cleaning efforts.

### Key Dimensions of Data Quality:
*   **Accuracy:** Is the data correct and does it reflect reality? (e.g., Is a customer's address up-to-date?)
*   **Completeness:** Is all necessary data present? Are there missing values where there shouldn't be? (e.g., Is the 'Email' field always populated for customer records?)
*   **Consistency:** Is the data uniform across different datasets or systems? Does it follow the same format and definitions? (e.g., Is 'Country' always stored as a full name or sometimes as a two-letter code?)
*   **Timeliness:** Is the data up-to-date and available when needed? (e.g., Are sales figures from last quarter available today?)
*   **Validity:** Does the data conform to defined rules, types, and constraints? (e.g., Is 'Age' always a positive integer? Is 'Email' in a valid format?)
*   **Uniqueness:** Are there any duplicate records that should not exist? (e.g., Are there two identical customer records for the same person?)

### Process:
1.  **Identify Data Sources:** Understand where the data originates.
2.  **Define Quality Metrics:** Establish what 'good' data means for your specific analysis.
3.  **Assess Quality:** Use profiling tools and manual checks to evaluate data against metrics.
4.  **Report Issues:** Document findings, including the extent and impact of data quality problems.
5.  **Plan Remediation:** Outline steps for data cleaning and improvement.

## 7. Practical Example: Python for Data Types and JSON

```python
import pandas as pd
import json

# Example of a DataFrame (tabular data) and its data types
print("--- Working with Tabular Data (Pandas DataFrame) ---")
data = {
    'OrderID': [101, 102, 103, 104, 105],
    'Product': ['Laptop', 'Mouse', 'Keyboard', 'Monitor', 'Webcam'],
    'Price': [1200.50, 25.00, 75.99, 300.25, 49.99],
    'OrderDate': ['2023-01-15', '2023-01-15', '2023-01-16', '2023-01-17', '2023-01-18'],
    'IsShipped': [True, True, False, True, False],
    'Category': ['Electronics', 'Electronics', 'Electronics', 'Electronics', 'Peripherals'],
    'Rating': ['Excellent', 'Good', 'Average', 'Excellent', 'Good'] # Ordinal category
}
df = pd.DataFrame(data)

print("\n--- DataFrame Info (Overview of columns and types) ---")
df.info()

print("\n--- Explicit Data Types (df.dtypes) ---")
print(df.dtypes)

print("\n--- Value Counts for Categorical Data (Category, Rating) ---")
print("Category:\n", df['Category'].value_counts())
print("\nRating:\n", df['Rating'].value_counts())

# Example of JSON data (demonstrates hierarchical structure and key-value pairs)
print("\n--- Working with JSON Data ---")
json_data_string = """
{
  "customer": {
    "id": "CUST001",
    "name": "Alice Smith",
    "contact": {
      "email": "alice@example.com",
      "phone": "123-456-7890"
    },
    "orders": [
      {"orderId": "ORD001", "item": "Laptop", "quantity": 1, "price": 1200.50},
      {"orderId": "ORD002", "item": "Mouse", "quantity": 2, "price": 25.00}
    ],
    "preferences": ["email_promo", "sms_alerts"]
  }
}
"""

# Parse the JSON string into a Python dictionary/list
parsed_json = json.loads(json_data_string)

print("\n--- Parsed JSON Data Structure (Pretty Printed) ---")
print(json.dumps(parsed_json, indent=2))

# Accessing data within the JSON structure
print(f"\nCustomer Name: {parsed_json['customer']['name']}")
print(f"First Order Item: {parsed_json['customer']['orders'][0]['item']}")
print(f"Customer Preferences: {', '.join(parsed_json['customer']['preferences'])}")
```

## 8. Quick Check: Test Your Understanding
1.  Identify the most appropriate data type for "Customer ID" (assuming it's a unique string like `CUST001`) and "Product Review Score" (on a scale of 1 to 5 stars). Justify your choices.
2.  Explain the difference between **Entity Integrity** and **Referential Integrity** using a simple example of two related tables (e.g., `Customers` and `Orders`).
3.  You receive a dataset where the "Price" column contains values like "12.99 USD", "£5.50", and "20". What data quality dimension is primarily at risk here, and how would you begin to address this issue?