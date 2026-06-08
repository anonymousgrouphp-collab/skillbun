# Data Manipulation & Visualization Study Guide

## Introduction
Welcome to the Data Manipulation & Visualization module! This section is crucial for any aspiring AI/ML Engineer, as it lays the foundation for understanding, preparing, and exploring data – a prerequisite for building robust machine learning models. We'll delve into NumPy for efficient numerical operations, Pandas for powerful data wrangling, and Matplotlib/Seaborn for insightful data visualization.

## 1. NumPy: The Numerical Computing Powerhouse
NumPy (Numerical Python) is the fundamental package for numerical computation in Python. It provides support for large, multi-dimensional arrays and matrices, along with a collection of high-level mathematical functions to operate on these arrays.

### Core Concepts
*   **`ndarray`**: The core object in NumPy, representing an N-dimensional array of homogeneous data types.
*   **Vectorized Operations**: NumPy allows operations on entire arrays without explicit loops, leading to highly efficient code.
*   **Broadcasting**: A powerful mechanism that allows NumPy to work with arrays of different shapes when performing arithmetic operations.
*   **Indexing and Slicing**: Efficiently access subsets of arrays, similar to Python lists but extended to multiple dimensions.
*   **Array Creation**: Functions like `np.array()`, `np.zeros()`, `np.ones()`, `np.arange()`, `np.linspace()`.

### Example: Array Creation and Basic Operations
```python
import numpy as np

# Create a 2D array (matrix)
matrix = np.array([[1, 2, 3], [4, 5, 6]])
print("Original Matrix:\n", matrix)

# Get shape and data type
print("Shape:", matrix.shape)
print("Data Type:", matrix.dtype)

# Perform a vectorized operation (add 10 to all elements)
matrix_plus_10 = matrix + 10
print("Matrix + 10:\n", matrix_plus_10)

# Slicing: Get the first row
first_row = matrix[0, :]
print("First Row:", first_row)

# Reshape: Convert to a 1D array
flat_array = matrix.reshape(-1)
print("Flattened Array:", flat_array)
```

### Quick Check
1.  Create a 3x3 NumPy array filled with random integers between 1 and 100.
2.  Calculate the mean and standard deviation of this array.
3.  Extract the second column of the array.

## 2. Pandas: The Data Wrangling Toolkit
Pandas is a fast, powerful, flexible, and easy-to-use open-source data analysis and manipulation tool, built on top of the Python programming language.

### Core Concepts
*   **`Series`**: A one-dimensional labeled array capable of holding any data type.
*   **`DataFrame`**: A two-dimensional labeled data structure with columns of potentially different types, analogous to a spreadsheet or SQL table.
*   **Data Loading**: Reading data from various sources (CSV, Excel, SQL databases) using `pd.read_csv()`, `pd.read_excel()`, etc.
*   **Data Inspection**: `df.head()`, `df.info()`, `df.describe()`, `df.value_counts()`.
*   **Handling Missing Values**: `df.isnull().sum()`, `df.dropna()`, `df.fillna()`.
*   **Data Transformation**: Renaming columns, changing data types, applying functions to columns.
*   **Categorical Encoding**: Converting categorical data into numerical format (e.g., one-hot encoding with `pd.get_dummies()`).
*   **Aggregation & Grouping**: `df.groupby()`, `df.agg()` for summarizing data.
*   **Merging & Joining**: Combining DataFrames based on common columns (`pd.merge()`, `df.join()`).

### Example: Data Loading, Cleaning, and Aggregation
```python
import pandas as pd
import numpy as np

# Create a sample DataFrame
data = {
    'City': ['New York', 'Los Angeles', 'Chicago', 'Houston', 'New York', 'Los Angeles', np.nan],
    'Temperature': [75, 82, 68, 90, 78, np.nan, 72],
    'Humidity': [60, 65, 70, 55, 62, 68, 75],
    'Month': ['Jan', 'Jan', 'Feb', 'Feb', 'Mar', 'Mar', 'Jan']
}
df = pd.DataFrame(data)
print("Original DataFrame:\n", df)

# Inspect missing values
print("\nMissing values:\n", df.isnull().sum())

# Fill missing 'Temperature' with the mean, drop rows with missing 'City'
df['Temperature'].fillna(df['Temperature'].mean(), inplace=True)
df_cleaned = df.dropna(subset=['City'])
print("\nCleaned DataFrame:\n", df_cleaned)

# Group by 'City' and calculate average temperature
avg_temp_by_city = df_cleaned.groupby('City')['Temperature'].mean().reset_index()
print("\nAverage Temperature by City:\n", avg_temp_by_city)

# One-hot encode the 'Month' column
df_encoded = pd.get_dummies(df_cleaned, columns=['Month'], drop_first=True)
print("\nDataFrame with Month One-Hot Encoded:\n", df_encoded)
```

### Quick Check
1.  Load a CSV file (you can create a dummy one or use a public dataset like `titanic.csv`).
2.  Identify and handle any missing values in a chosen column (e.g., fill with median or mode).
3.  Calculate the average of a numerical column, grouped by a categorical column.

## 3. Matplotlib & Seaborn: Visualizing Insights
Matplotlib is a comprehensive library for creating static, animated, and interactive visualizations in Python. Seaborn is a Python data visualization library based on Matplotlib, providing a high-level interface for drawing attractive and informative statistical graphics.

### Core Concepts
*   **Matplotlib Anatomy**: Figures, axes, titles, labels, legends.
*   **Basic Plot Types**: Line plots (`plt.plot()`), scatter plots (`plt.scatter()`), bar charts (`plt.bar()`), histograms (`plt.hist()`).
*   **Subplots**: Arranging multiple plots within a single figure (`plt.subplots()`).
*   **Customization**: Adjusting colors, markers, line styles, adding text annotations.
*   **Seaborn Statistical Plots**: 
    *   **Distribution plots**: `sns.histplot()`, `sns.kdeplot()`, `sns.boxplot()`, `sns.violinplot()`.
    *   **Relational plots**: `sns.scatterplot()`, `sns.lineplot()`.
    *   **Categorical plots**: `sns.barplot()`, `sns.countplot()`.
    *   **Regression plots**: `sns.regplot()`.

### Example: Basic Plotting with Matplotlib and Seaborn
```python
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
import pandas as pd

# Matplotlib Example: Simple Scatter Plot
x = np.random.rand(50)
y = 2 * x + 1 + np.random.randn(50) * 0.5

plt.figure(figsize=(8, 6))
plt.scatter(x, y, color='blue', alpha=0.7)
plt.title('Simple Scatter Plot with Matplotlib')
plt.xlabel('X-axis Label')
plt.ylabel('Y-axis Label')
plt.grid(True)
plt.show()

# Seaborn Example: Distribution Plot (Histogram & KDE)
df_sales = pd.DataFrame({
    'Product_A_Sales': np.random.normal(loc=100, scale=15, size=100),
    'Product_B_Sales': np.random.normal(loc=120, scale=10, size=100)
})

plt.figure(figsize=(10, 6))
sns.histplot(df_sales['Product_A_Sales'], kde=True, color='green', label='Product A')
sns.histplot(df_sales['Product_B_Sales'], kde=True, color='orange', label='Product B')
plt.title('Sales Distribution for Products A and B')
plt.xlabel('Sales Units')
plt.ylabel('Frequency')
plt.legend()
plt.show()

# Seaborn Example: Box Plot for comparison
plt.figure(figsize=(8, 6))
sns.boxplot(data=df_sales, palette='viridis')
plt.title('Box Plot of Product Sales')
plt.ylabel('Sales Units')
plt.show()
```

### Quick Check
1.  Create a line plot showing the trend of a numerical series over time (you can generate dummy time series data).
2.  Generate a histogram and a Kernel Density Estimate (KDE) plot for a numerical column from a Pandas DataFrame using Seaborn.
3.  Create a bar chart comparing the counts of different categories in a categorical column using Matplotlib or Seaborn `countplot`.

## Conclusion
Mastering NumPy, Pandas, Matplotlib, and Seaborn is fundamental for any data-driven role. These tools empower you to efficiently manipulate data, extract meaningful features, and communicate insights through compelling visualizations, forming the bedrock for advanced machine learning tasks. Continue practicing these tools with real-world datasets to solidify your understanding and expertise.