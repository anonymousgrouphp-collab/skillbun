# Practice Lab: Data Cleansing & Transformation

Welcome to the Practice Lab for Data Cleansing & Transformation! This hands-on lab is designed to solidify your understanding and practical skills in turning raw, often messy, real-world datasets into clean, reliable, and analysis-ready information. Data quality is paramount in any data-driven decision-making process, and mastering these techniques is a cornerstone of a successful data engineering career.

## 1. Understanding Messy Data

Real-world datasets are rarely perfect. "Messy data" refers to data that contains errors, inconsistencies, or is incomplete, making it unsuitable for direct analysis. Common issues include:

*   **Missing Values:** Gaps in the dataset where data points are absent (e.g., `null`, `NaN`, `N/A`).
*   **Outliers:** Data points that significantly deviate from other observations, potentially indicating errors or unusual events.
*   **Inconsistencies:** Variations in data representation (e.g., "New York", "NY", "nyc" for the same city), duplicate records, or conflicting information.
*   **Incorrect Data Types/Formats:** Numbers stored as strings, incorrect date formats, or non-standardized units.

## 2. Core Concepts & Techniques

### 2.1 Data Cleansing

The process of detecting and correcting errors and inconsistencies in data to improve its quality.

*   **Handling Missing Values:**
    *   **Deletion:** Remove rows or columns with missing values. (Use with caution; can lead to data loss).
    *   **Imputation:** Fill missing values with calculated estimates (mean, median, mode) or more sophisticated methods (regression, K-NN).
        ```python
        import pandas as pd
        df = pd.DataFrame({'A': [1, 2, None, 4], 'B': [5, None, 7, 8]})
        # Fill with mean
        df['A'].fillna(df['A'].mean(), inplace=True)
        # Fill with a specific value
        df['B'].fillna(0, inplace=True)
        ```
*   **Detecting & Treating Outliers:**
    *   **Statistical Methods:** Z-score (for normally distributed data), IQR (Interquartile Range) for skewed data.
    *   **Visualization:** Box plots, scatter plots can visually identify outliers.
    *   **Treatment:** Remove outliers, cap them (replace with a threshold value), or transform the data.
        ```python
        # Using IQR to detect outliers
        Q1 = df['ColumnX'].quantile(0.25)
        Q3 = df['ColumnX'].quantile(0.75)
        IQR = Q3 - Q1
        lower_bound = Q1 - 1.5 * IQR
        upper_bound = Q3 + 1.5 * IQR
        df_filtered = df[(df['ColumnX'] >= lower_bound) & (df['ColumnX'] <= upper_bound)]
        ```
*   **Resolving Inconsistencies:**
    *   **Standardization:** Convert similar values to a single standard form (e.g., "USA", "U.S.", "United States" -> "United States").
    *   **De-duplication:** Identify and remove duplicate records.
    *   **Data Type Conversion:** Ensure columns have appropriate data types (e.g., numeric, datetime).

### 2.2 Data Transformation

The process of converting data from one format or structure into another, often to make it more suitable for analysis or a specific downstream system.

*   **Feature Scaling:**
    *   **Normalization (Min-Max Scaling):** Scales values to a fixed range, typically 0 to 1. `X_scaled = (X - X.min()) / (X.max() - X.min())`
    *   **Standardization (Z-score Normalization):** Scales values to have zero mean and unit variance. `X_scaled = (X - X.mean()) / X.std()`
*   **Feature Engineering:** Creating new features from existing ones to improve model performance or provide more insights (e.g., `age_group` from `age`, `total_price` from `quantity * unit_price`).
*   **Aggregation & Pivoting:** Summarizing data (e.g., sum, average) and restructuring it (e.g., changing rows to columns).
*   **Encoding Categorical Data:** Converting categorical variables into a numerical format for machine learning models (e.g., One-Hot Encoding, Label Encoding).

## 3. Data Quality Checks & Documentation

After performing cleansing and transformation, it's crucial to verify the quality of the processed data.

*   **Post-processing checks:**
    *   Check for remaining missing values.
    *   Verify data types.
    *   Run summary statistics to ensure values are within expected ranges.
    *   Perform basic aggregations to spot inconsistencies.
*   **Documenting Assumptions:** Record all significant decisions made during cleansing and transformation. This includes:
    *   How missing values were handled (method, justification).
    *   Criteria for outlier detection and treatment.
    *   Rules applied for standardization or de-duplication.
    *   Rationale for any feature engineering or data type conversions.
    This documentation is vital for reproducibility, debugging, and collaboration.

## 4. Example: Cleaning a Customer Dataset (Python with Pandas)

Let's consider a simple customer dataset with potential issues.

```python
import pandas as pd
import numpy as np

# Sample messy data
data = {
    'CustomerID': [101, 102, 103, 104, 105, 106, 107, 108],
    'Name': ['Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Frank', 'Grace', 'Alice'],
    'Age': [25, 30, np.nan, 40, 22, 600, 35, 25],
    'City': ['New York', 'Los Angeles', 'NY', 'Chicago', 'LA', 'Houston', 'Miami', 'new york'],
    'Spend': [100.50, 200.00, 50.75, np.nan, 120.00, 150.25, 300.00, 100.50],
    'EnrollmentDate': ['2023-01-15', '2022-11-20', '2023-03-10', '2022-09-01', '2023-02-28', 'invalid-date', '2023-04-05', '2023-01-15']
}
df = pd.DataFrame(data)
print("Original DataFrame:")
print(df)
print("-" * 30)

# 1. Handle Missing Values
# Impute missing Age with median
df['Age'].fillna(df['Age'].median(), inplace=True)
# Impute missing Spend with 0
df['Spend'].fillna(0, inplace=True)

# 2. Detect & Treat Outliers (Age)
# Simple check: Age cannot be 600. Let's cap it to a reasonable maximum, say 100.
df['Age'] = df['Age'].apply(lambda x: x if x <= 100 else np.nan)
df['Age'].fillna(df['Age'].median(), inplace=True) # Re-impute if capped to nan

# 3. Standardize City Names
city_mapping = {
    'NY': 'New York',
    'new york': 'New York',
    'LA': 'Los Angeles'
}
df['City'] = df['City'].replace(city_mapping)

# 4. Handle Duplicates
df.drop_duplicates(subset=['CustomerID', 'Name', 'Age'], inplace=True)

# 5. Convert EnrollmentDate to datetime, coercing errors
df['EnrollmentDate'] = pd.to_datetime(df['EnrollmentDate'], errors='coerce')
# Fill any remaining invalid dates (coerced to NaT) with a default or mode
df['EnrollmentDate'].fillna(df['EnrollmentDate'].mode()[0], inplace=True)


print("Cleaned & Transformed DataFrame:")
print(df)

# Example Data Quality Check: Verify no NaNs in Age or Spend
print(f"\nMissing values after cleansing:\n{df.isnull().sum()}")
```

## 5. Checklist/Exercise

1.  **Identify Issues:** Given a dataset (imagine one with columns like `Product_ID`, `Price`, `Quantity`, `Date_Sold`, `Region`), list at least three potential data quality issues you'd expect to find in `Price`, `Quantity`, and `Date_Sold` columns.
2.  **Strategy for Missing Values:** For a `Customer_Satisfaction_Score` column (0-10 scale), which imputation strategy (deletion, mean, median, mode, or other) would you choose for missing values and why?
3.  **Transformation for Analysis:** You have a `Transaction_Amount` column in USD. Describe a data transformation you might apply to this column before feeding it to a machine learning model, and explain its purpose.