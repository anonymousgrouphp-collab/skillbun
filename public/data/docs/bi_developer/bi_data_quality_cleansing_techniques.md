# Data Quality and Cleansing Techniques

Data is the lifeblood of Business Intelligence (BI). However, raw data often contains errors, inconsistencies, and incompleteness that can lead to flawed analyses and poor decision-making. Data quality and cleansing techniques are crucial for transforming raw, unreliable data into high-quality, trustworthy information, ensuring that BI initiatives deliver accurate and actionable insights.

## Core Concepts of Data Quality

Before diving into cleansing techniques, it's essential to understand the key dimensions of data quality:

*   **Accuracy:** Data accurately reflects the real-world event or object it represents. (e.g., A customer's address is actually where they live).
*   **Consistency:** Data is uniform across different systems and sources, without contradictions. (e.g., A customer's name is spelled the same in all relevant databases).
*   **Validity:** Data conforms to defined business rules and data types. (e.g., A 'date_of_birth' field contains a valid date and not text).
*   **Completeness:** All required data is present and not missing. (e.g., No empty fields for critical customer information).
*   **Uniqueness:** No duplicate records exist within the dataset. (e.g., Each customer has only one unique record).
*   **Timeliness:** Data is available when needed and is current enough for the task at hand.

## Data Cleansing Techniques

Data cleansing involves a series of systematic steps to identify and rectify data quality issues.

### 1. Identifying and Handling Missing Values

Missing values (often represented as `NULL`, `NaN`, or empty strings) can skew analyses. Strategies include:

*   **Identification:** Detecting missing values (e.g., using `df.isnull().sum()` in Pandas).
*   **Imputation:** Filling missing values with a substituted value.
    *   **Mean/Median/Mode:** Replacing with the average, middle, or most frequent value for numerical or categorical data, respectively.
    *   **Constant Value:** Replacing with a predefined value (e.g., 'Unknown', 0).
    *   **Forward/Backward Fill:** Propagating the last/next valid observation forward/backward.
    *   **Regression Imputation:** Predicting missing values based on other variables.
*   **Deletion:** Removing rows or columns with missing values. This should be done cautiously to avoid significant data loss.

### 2. Resolving Duplicates

Duplicate records can lead to overcounting and biased statistics.

*   **Identification:** Detecting rows that are identical across all or a subset of columns (e.g., `df.duplicated()` in Pandas).
*   **Removal:** Eliminating duplicate rows, often keeping the first or last occurrence (e.g., `df.drop_duplicates()`).

### 3. Standardizing Data Formats

Ensuring data is in a uniform format across the dataset.

*   **Case Conversion:** Converting text to a consistent case (e.g., `UPPER`, `lower`, `Title Case`).
*   **Trimming Whitespace:** Removing leading/trailing spaces (e.g., `str.strip()`).
*   **Format Consistency:** Ensuring dates (e.g., `YYYY-MM-DD`), phone numbers (e.g., `(XXX) XXX-XXXX`), or addresses follow a single pattern.
*   **Spell Checking/Synonym Consolidation:** Correcting typos and unifying different representations of the same entity (e.g., 'NY' vs. 'New York').
*   **Regular Expressions (Regex):** Using regex for complex pattern matching, extraction, and replacement.

### 4. Performing Precise Data Type Conversions

Data often enters a system with an incorrect data type, which can prevent proper analysis or calculations.

*   **Conversion:** Explicitly changing data types (e.g., converting a string '123' to an integer 123 using `df['column'].astype(int)`).
*   **Error Handling:** Managing values that cannot be converted (e.g., `pd.to_numeric(df['col'], errors='coerce')` will turn unconvertible values into `NaN`).
*   **Date/Time Conversion:** Parsing diverse date/time string formats into standard datetime objects (`pd.to_datetime()`).

## Code Example: Data Cleansing with Pandas (Python)

Let's illustrate some of these techniques using a simple Python Pandas example.

```python
import pandas as pd
import numpy as np

# Sample DataFrame with data quality issues
data = {
    'ProductID': [101, 102, 103, 101, 104, 105, 106, 107],
    'ProductName': ['  Laptop  ', 'Keyboard', 'Mouse', '  Laptop  ', 'Monitor', 'Webcam', 'Speaker', 'Headphones'],
    'Price': [1200.50, 75.00, np.nan, 1200.50, 300, 50, '65.00', 'invalid_price'],
    'Category': ['Electronics', 'electronics', 'Electronics', 'Electronics', 'Displays', np.nan, 'Audio', 'Audio'],
    'DateAdded': ['2023-01-15', '2023-01-20', '2023-02-01', '01/15/2023', '2023-03-10', '2023-04-05', 'N/A', '2023-05-20']
}
df = pd.DataFrame(data)

print("Original DataFrame:\n", df)
print("\nMissing values before cleansing:\n", df.isnull().sum())

# --- 1. Handling Missing Values ---
# For 'Price', we have 'nan' and 'invalid_price' (which will become NaN after coercion)
# Let's first try to convert 'Price' to numeric, coercing errors to NaN
df['Price'] = pd.to_numeric(df['Price'], errors='coerce')
# Impute missing 'Price' with the median
df['Price'].fillna(df['Price'].median(), inplace=True)

# Impute missing 'Category' with 'Unknown'
df['Category'].fillna('Unknown', inplace=True)

# For 'DateAdded', 'N/A' is a missing value indication, let's treat it as NaN for now
df['DateAdded'].replace('N/A', np.nan, inplace=True)
# Then fill with a default date, or drop rows if critical
# For simplicity, let's forward-fill if we assume some temporal order
df['DateAdded'].fillna(method='ffill', inplace=True)

# --- 2. Resolving Duplicates ---
# Identify and remove duplicates based on 'ProductID' and 'ProductName'
# Keep the first occurrence
df.drop_duplicates(subset=['ProductID', 'ProductName'], keep='first', inplace=True)

# --- 3. Standardizing Data Formats ---
# Standardize 'ProductName' by trimming whitespace and converting to Title Case
df['ProductName'] = df['ProductName'].str.strip().str.title()

# Standardize 'Category' by converting to Title Case
df['Category'] = df['Category'].str.title()

# --- 4. Performing Precise Data Type Conversions ---
# Convert 'DateAdded' to datetime objects, handling various formats
df['DateAdded'] = pd.to_datetime(df['DateAdded'], errors='coerce')

print("\nCleaned DataFrame:\n", df)
print("\nMissing values after cleansing:\n", df.isnull().sum())
print("\nData Types after cleansing:\n", df.dtypes)
```

## Quick Checklist/Exercise

1.  **Scenario Analysis:** You have a dataset of customer orders where the `delivery_date` column has about 15% missing values. Describe at least two different strategies you might use to handle these missing values, and explain the pros and cons of each in this context.
2.  **Concept Distinction:** Explain the difference between data **accuracy** and data **validity**. Provide an example for each where data might be valid but inaccurate, or accurate but invalid.
3.  **Technique Application:** A column named `email_address` contains various entries like ` user@example.com`, `ANOTHER@EXAMPLE.COM`, `third.user@example.com `. Propose a sequence of data cleansing steps to standardize this column, ensuring all emails are in a consistent, clean format (e.g., lowercase, no leading/trailing spaces).