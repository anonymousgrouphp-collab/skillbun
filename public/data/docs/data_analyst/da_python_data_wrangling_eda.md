# Python for Data Manipulation, EDA & Basic Automation: Study Guide

This guide covers the essential Python skills required for data manipulation, exploratory data analysis (EDA), and basic automation. Mastering these concepts will provide a strong foundation for any aspiring data analyst.

## 1. Python Fundamentals

Python's simplicity and extensive libraries make it ideal for data tasks.

### Core Concepts

*   **Variables and Data Types**: Store different types of information (integers, floats, strings, booleans).
*   **Operators**: Perform arithmetic, comparison, and logical operations.
*   **Control Flow**:
    *   `if`/`elif`/`else`: Execute code conditionally.
    *   `for` loops: Iterate over sequences.
    *   `while` loops: Repeat code as long as a condition is true.
*   **Data Structures**:
    *   **Lists**: Ordered, mutable collections `[1, "a", True]`.
    *   **Tuples**: Ordered, immutable collections `(1, "a", True)`.
    *   **Dictionaries**: Unordered, mutable key-value pairs `{"name": "Alice", "age": 30}`.
    *   **Sets**: Unordered collections of unique items `{1, 2, 3}`.
*   **Functions**: Reusable blocks of code that perform specific tasks.

### Code Example: Python Fundamentals

```python
# Variables and Data Types
name = "Alice"
age = 30
is_student = True
grades = [85, 92, 78]

# Control Flow (if-else)
if age >= 18:
    status = "Adult"
else:
    status = "Minor"

print(f"{name} is an {status}.")

# Function to calculate average
def calculate_average(score_list):
    return sum(score_list) / len(score_list)

avg_grade = calculate_average(grades)
print(f"Average grade: {avg_grade:.2f}")
```

## 2. NumPy for Numerical Operations

NumPy (Numerical Python) is the foundational library for scientific computing, providing powerful array objects and tools for working with them.

### Core Concepts

*   **`ndarray`**: The primary object in NumPy, a multi-dimensional array of homogeneous data types.
*   **Array Creation**: From lists, using `np.zeros()`, `np.ones()`, `np.arange()`, `np.linspace()`.
*   **Indexing and Slicing**: Accessing specific elements or subsets of arrays.
*   **Array Operations**: Element-wise arithmetic operations, broadcasting, aggregation functions (`.sum()`, `.mean()`, `.max()`, `.min()`).

### Code Example: NumPy

```python
import numpy as np

# Create a NumPy array
data = np.array([10, 20, 30, 40, 50])
print(f"Original array: {data}")

# Element-wise operations
squared_data = data ** 2
print(f"Squared data: {squared_data}")

# Slicing and aggregation
subset = data[1:4] # Elements at index 1, 2, 3
print(f"Subset: {subset}")
print(f"Mean of subset: {subset.mean():.2f}")
```

## 3. Pandas for Data Manipulation and EDA

Pandas is indispensable for data loading, cleaning, transformation, and initial exploratory data analysis.

### Core Concepts

*   **`Series`**: A one-dimensional labeled array capable of holding any data type.
*   **`DataFrame`**: A two-dimensional labeled data structure with columns of potentially different types, similar to a spreadsheet or SQL table.
*   **Data Loading**: Reading data from various sources (e.g., `.csv`, `.xlsx`, SQL databases) using `pd.read_csv()`.
*   **Data Cleaning**:
    *   Handling Missing Values: `df.isnull()`, `df.dropna()`, `df.fillna()`.
    *   Handling Duplicates: `df.duplicated()`, `df.drop_duplicates()`.
    *   Type Conversion: `df['column'].astype('type')`.
*   **Data Transformation**:
    *   Applying functions (`.apply()`, `.map()`).
    *   Creating new columns.
*   **Merging & Concatenation**: Combining DataFrames using `pd.merge()` (like SQL joins) and `pd.concat()`.
*   **Aggregation**: Grouping data by one or more columns and applying aggregate functions (`.groupby()`).
*   **Exploratory Data Analysis (EDA)**:
    *   `df.head()`, `df.tail()`: View first/last rows.
    *   `df.info()`: Summary of DataFrame, including data types and non-null values.
    *   `df.describe()`: Statistical summary of numerical columns.
    *   `df['column'].value_counts()`: Count unique values in a column.

### Code Example: Pandas

```python
import pandas as pd
import numpy as np

# Create a sample DataFrame
data = {
    'Name': ['Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Alice'],
    'Age': [24, 27, 22, np.nan, 29, 24],
    'City': ['New York', 'Los Angeles', 'Chicago', 'New York', 'Los Angeles', 'New York'],
    'Salary': [70000, 80000, 65000, 72000, 85000, 70000]
}
df = pd.DataFrame(data)
print("Original DataFrame:")
print(df)

# EDA: Check for missing values and duplicates
print("\nMissing values:\n", df.isnull().sum())
print("\nDuplicates:\n", df.duplicated().sum())

# Data Cleaning: Fill missing 'Age' with the mean, drop duplicates
df['Age'].fillna(df['Age'].mean(), inplace=True)
df.drop_duplicates(inplace=True)

# Data Transformation: Create a new column 'Salary_USD_K'
df['Salary_USD_K'] = df['Salary'] / 1000

# Aggregation: Average salary by City
avg_salary_by_city = df.groupby('City')['Salary_USD_K'].mean().reset_index()
print("\nAverage Salary by City (USD_K):\n", avg_salary_by_city)
```

## 4. Data Visualization with Matplotlib & Seaborn

Visualization is crucial for understanding data patterns and communicating insights.

### Core Concepts

*   **Matplotlib**: A comprehensive library for creating static, animated, and interactive visualizations. Provides fine-grained control over plots.
*   **Seaborn**: A high-level data visualization library built on Matplotlib. It provides a more convenient interface for drawing attractive and informative statistical graphics.
*   **Common Plot Types**:
    *   **Histograms**: Distribution of a single numerical variable (`plt.hist()`, `sns.histplot()`).
    *   **Scatter Plots**: Relationship between two numerical variables (`plt.scatter()`, `sns.scatterplot()`).
    *   **Bar Charts**: Compare categories (`plt.bar()`, `sns.barplot()`, `sns.countplot()`).
    *   **Box Plots**: Visualize distribution and outliers (`sns.boxplot()`).

### Code Example: Matplotlib & Seaborn

```python
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
import numpy as np

# Sample data
data = {'Category': ['A', 'B', 'A', 'C', 'B', 'A', 'C'],
        'Value': [10, 15, 12, 18, 13, 11, 20]}
df_viz = pd.DataFrame(data)

# Create a simple bar plot using Seaborn
plt.figure(figsize=(6, 4))
sns.barplot(x='Category', y='Value', data=df_viz)
plt.title('Average Value per Category')
plt.xlabel('Category')
plt.ylabel('Average Value')
plt.show()

# Create a scatter plot with Matplotlib
np.random.seed(42)
x_data = np.random.rand(50) * 10
y_data = 2 * x_data + np.random.randn(50) * 5 # Linear relationship with noise

plt.figure(figsize=(6, 4))
plt.scatter(x_data, y_data)
plt.title('Scatter Plot of X vs Y')
plt.xlabel('X-axis')
plt.ylabel('Y-axis')
plt.grid(True)
plt.show()
```

## 5. Basic Automation

Basic automation involves writing scripts to handle repetitive data tasks efficiently.

### Core Concepts

*   **Scripting**: Writing sequences of commands that can be executed automatically.
*   **File I/O**: Reading from and writing to files (`open()`, `read()`, `write()`, `close()`).
*   **Looping through files/folders**: Using `os` module (e.g., `os.listdir()`, `os.path.join()`) to process multiple files.
*   **Error Handling**: Using `try-except` blocks to gracefully handle unexpected issues.

### Code Example: Basic Automation (File Processing)

```python
import os

# Create a dummy data directory and files for demonstration
if not os.path.exists("data_reports"):
    os.makedirs("data_reports")
with open("data_reports/report_2023_01.txt", "w") as f:
    f.write("Sales: 100\nProfit: 20\nRegion: East")
with open("data_reports/report_2023_02.txt", "w") as f:
    f.write("Sales: 120\nProfit: 25\nRegion: West")

# Automate reading specific lines from multiple files
data_folder = "data_reports"
sales_data = {}

for filename in os.listdir(data_folder):
    if filename.endswith(".txt"):
        filepath = os.path.join(data_folder, filename)
        with open(filepath, 'r') as f:
            for line in f:
                if "Sales:" in line:
                    month = filename.split('_')[2].split('.')[0] # Extract '01', '02'
                    sales = int(line.split(':')[1].strip())
                    sales_data[f"Month {month}"] = sales
                    break # Assuming 'Sales' is unique per file

print("\nAggregated Sales Data:")
print(sales_data)

# Cleanup dummy files/folder (uncomment to run)
# os.remove("data_reports/report_2023_01.txt")
# os.remove("data_reports/report_2023_02.txt")
# os.rmdir("data_reports")
```

## Checklist / Exercise

1.  **Pandas Data Cleaning**: Load a CSV file (you can use a public dataset like `titanic.csv`). Identify and fill missing 'Age' values with the median, and drop any rows with missing 'Embarked' values.
2.  **NumPy & Pandas Integration**: Create a NumPy array of 100 random integers between 1 and 100. Convert this array into a Pandas Series. Calculate the mean, median, and standard deviation of this Series.
3.  **Basic Visualization**: Using the cleaned Titanic DataFrame from Exercise 1, create a bar chart showing the count of passengers by 'Sex' using Seaborn.
