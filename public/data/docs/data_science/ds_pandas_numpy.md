# Data Manipulation with Pandas & NumPy

This study guide covers advanced data structures and essential data manipulation techniques using Python's powerful Pandas and NumPy libraries. You'll learn how to efficiently handle, clean, and transform data for analysis and machine learning tasks.

## 1. NumPy: The Foundation for Numerical Computing

NumPy (Numerical Python) is the core library for scientific computing in Python. It provides a high-performance multidimensional array object (`ndarray`) and tools for working with these arrays.

### Core Concepts:
*   **`ndarray`**: A homogeneous multidimensional array. All elements in a NumPy array must be of the same data type.
*   **Vectorized Operations**: NumPy allows you to perform operations on entire arrays without explicit loops, leading to significant performance gains.
*   **Broadcasting**: A mechanism for performing operations on arrays of different shapes.

### Code Example: NumPy Array Creation & Basic Operations

```python
import numpy as np

# Creating a 1D array
arr1 = np.array([1, 2, 3, 4, 5])
print(f"1D Array: {arr1}, Shape: {arr1.shape}")

# Creating a 2D array
arr2 = np.array([[10, 20, 30], [40, 50, 60]])
print(f"2D Array:\n{arr2}, Shape: {arr2.shape}")

# Vectorized operations
result = arr1 * 2 + 10
print(f"Vectorized operation (arr1 * 2 + 10): {result}")

# Element-wise addition of two arrays
arr3 = np.array([5, 4, 3, 2, 1])
sum_arr = arr1 + arr3
print(f"Element-wise sum: {sum_arr}")
```

## 2. Pandas: Data Structures for Labeled Data

Pandas is built on top of NumPy and provides easy-to-use data structures and data analysis tools. Its primary data structures are `Series` (1-dimensional) and `DataFrame` (2-dimensional).

### Core Concepts:
*   **`Series`**: A one-dimensional labeled array capable of holding any data type (integers, strings, floats, Python objects, etc.). It's like a column in a spreadsheet or a SQL table, or a dictionary.
*   **`DataFrame`**: A two-dimensional labeled data structure with columns of potentially different types. You can think of it like a spreadsheet, a SQL table, or a dictionary of Series objects.

### Code Example: Pandas Series & DataFrame Creation

```python
import pandas as pd

# Creating a Series
s = pd.Series([10, 20, 30, 40], index=['a', 'b', 'c', 'd'])
print(f"Series:\n{s}\n")

# Creating a DataFrame from a dictionary
data = {
    'Name': ['Alice', 'Bob', 'Charlie', 'David'],
    'Age': [25, 30, 35, 28],
    'City': ['New York', 'Los Angeles', 'Chicago', 'Houston']
}
df = pd.DataFrame(data)
print(f"DataFrame:\n{df}\n")

# Accessing a column (returns a Series)
print(f"'Name' column:\n{df['Name']}\n")
```

## 3. Indexing and Selection

Accessing specific subsets of your data is crucial. Pandas offers powerful indexing methods.

### Core Concepts:
*   **`[]` (Bracket Notation)**: For column selection or row slicing.
*   **`.loc`**: Label-based indexing (select by label of rows and columns).
*   **`.iloc`**: Integer-location based indexing (select by positional integer of rows and columns).
*   **Boolean Indexing**: Selecting data based on a condition.

### Code Example: Indexing and Selection

```python
# Using the DataFrame 'df' from above

# Select a single column
print(f"df['Age']:\n{df['Age']}\n")

# Select multiple columns
print(f"df[['Name', 'City']]:\n{df[['Name', 'City']]}\n")

# Select row(s) by label using .loc
df_loc = df.loc[0]
print(f"df.loc[0]:\n{df_loc}\n")
df_loc_multiple = df.loc[1:3, ['Name', 'Age']]
print(f"df.loc[1:3, ['Name', 'Age']]:\n{df_loc_multiple}\n")

# Select row(s) by integer position using .iloc
df_iloc = df.iloc[0]
print(f"df.iloc[0]:\n{df_iloc}\n")
df_iloc_multiple = df.iloc[1:3, 0:2]
print(f"df.iloc[1:3, 0:2]:\n{df_iloc_multiple}\n")

# Boolean indexing
young_people = df[df['Age'] < 30]
print(f"People younger than 30:\n{young_people}\n")
```

## 4. Grouping and Aggregation

`groupby()` is a fundamental method for splitting data into groups based on some criteria and then applying a function (like sum, mean, count) to each group.

### Core Concepts:
*   **`groupby()`**: Groups rows together based on one or more column values.
*   **Aggregation Functions**: `mean()`, `sum()`, `count()`, `min()`, `max()`, `std()`, `var()`, `first()`, `last()`, `size()`.
*   **`agg()`**: Apply multiple aggregation functions simultaneously.

### Code Example: Grouping and Aggregation

```python
import pandas as pd

data_group = {
    'Department': ['HR', 'IT', 'HR', 'IT', 'Finance', 'HR'],
    'Employee': ['A', 'B', 'C', 'D', 'E', 'F'],
    'Salary': [60000, 80000, 65000, 90000, 75000, 70000]
}
df_group = pd.DataFrame(data_group)

# Group by 'Department' and calculate mean salary
department_avg_salary = df_group.groupby('Department')['Salary'].mean()
print(f"Average Salary by Department:\n{department_avg_salary}\n")

# Group by 'Department' and apply multiple aggregations
department_stats = df_group.groupby('Department')['Salary'].agg(['mean', 'max', 'count'])
print(f"Department Statistics:\n{department_stats}\n")
```

## 5. Merging, Joining, and Concatenating DataFrames

Combining data from different sources is a common task. Pandas provides various methods for this.

### Core Concepts:
*   **`pd.concat()`**: Stacks DataFrames either vertically (rows) or horizontally (columns).
*   **`pd.merge()`**: Combines DataFrames based on common columns (like SQL joins: inner, outer, left, right).
*   **`.join()`**: A convenience method on DataFrames for joining based on index or a column.

### Code Example: Merging DataFrames

```python
import pandas as pd

df1 = pd.DataFrame({'ID': [1, 2, 3], 'Name': ['A', 'B', 'C']})
df2 = pd.DataFrame({'ID': [2, 3, 4], 'Score': [85, 92, 78]})

# Inner merge (only common IDs)
merged_df = pd.merge(df1, df2, on='ID', how='inner')
print(f"Inner Merged DataFrame:\n{merged_df}\n")

# Left merge (keep all from df1, add matching from df2)
left_merged_df = pd.merge(df1, df2, on='ID', how='left')
print(f"Left Merged DataFrame:\n{left_merged_df}\n")

df_concat1 = pd.DataFrame({'A': [1, 2], 'B': [3, 4]})
df_concat2 = pd.DataFrame({'A': [5, 6], 'B': [7, 8]})
concatenated_df = pd.concat([df_concat1, df_concat2], axis=0) # axis=0 for rows
print(f"Concatenated DataFrame (rows):\n{concatenated_df}\n")
```

## 6. Reshaping and Pivoting Data

Restructuring your data is often necessary for different analysis needs.

### Core Concepts:
*   **`pivot_table()`**: Creates a spreadsheet-style pivot table as a DataFrame.
*   **`melt()`**: Transforms DataFrame from wide to long format.
*   **`stack()`/`unstack()`**: Reshape DataFrames by pivoting between rows and columns for hierarchical indexes.

### Code Example: Pivoting Data

```python
import pandas as pd

data_pivot = {
    'Date': ['2023-01-01', '2023-01-01', '2023-01-02', '2023-01-02'],
    'City': ['New York', 'Los Angeles', 'New York', 'Los Angeles'],
    'Temperature': [30, 50, 32, 55],
    'Humidity': [70, 60, 72, 65]
}
df_pivot = pd.DataFrame(data_pivot)

# Create a pivot table showing average temperature by city for each date
pivoted_df = df_pivot.pivot_table(values='Temperature', index='Date', columns='City', aggfunc='mean')
print(f"Pivoted DataFrame (Temperature by City/Date):\n{pivoted_df}\n")
```

## 7. Data Cleaning Basics

Real-world data is often messy. Handling missing values and duplicates is a critical first step in data cleaning.

### Core Concepts:
*   **Missing Values**: Represented as `NaN` (Not a Number) in Pandas. Use `isna()`, `dropna()`, `fillna()`.
*   **Duplicates**: Identical rows. Use `duplicated()` and `drop_duplicates()`.

### Code Example: Handling Missing Values & Duplicates

```python
import pandas as pd
import numpy as np

df_clean = pd.DataFrame({
    'A': [1, 2, np.nan, 4, 2],
    'B': [5, np.nan, 7, 8, 5],
    'C': ['X', 'Y', 'Z', 'X', 'Y']
})
print(f"Original DataFrame with NaNs and duplicates:\n{df_clean}\n")

# Check for missing values
print(f"Missing values:\n{df_clean.isna()}\n")
print(f"Count of missing values per column:\n{df_clean.isna().sum()}\n")

# Drop rows with any missing values
df_dropped = df_clean.dropna()
print(f"DataFrame after dropping NaNs:\n{df_dropped}\n")

# Fill missing values with a specific value (e.g., 0)
df_filled = df_clean.fillna(0)
print(f"DataFrame after filling NaNs with 0:\n{df_filled}\n")

# Fill missing values with the mean of the column (for numerical columns)
df_filled_mean = df_clean.copy()
df_filled_mean['A'] = df_filled_mean['A'].fillna(df_filled_mean['A'].mean())
print(f"DataFrame after filling 'A' NaNs with mean:\n{df_filled_mean}\n")

# Identify duplicate rows
print(f"Duplicate rows:\n{df_clean.duplicated()}\n")

# Drop duplicate rows (keeping the first occurrence)
df_no_duplicates = df_clean.drop_duplicates()
print(f"DataFrame after dropping duplicates:\n{df_no_duplicates}\n")
```

## Quick Checklist/Exercises:

1.  **NumPy**: Create a 3x3 NumPy array of random integers between 1 and 100. Then, calculate the sum of each column and print the result. (Hint: `np.random.randint`, `sum(axis=0)`)
2.  **Pandas DataFrames**: Load the `data_group` dictionary from section 4 into a Pandas DataFrame. Then, filter the DataFrame to only show employees with a 'Salary' greater than 70,000.
3.  **Data Cleaning**: Create a Pandas Series with some `NaN` values and some duplicate string values. Use `.fillna()` to replace `NaN`s with 'Missing' and then `.drop_duplicates()` to remove duplicate strings.