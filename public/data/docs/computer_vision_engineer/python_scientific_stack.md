# Python Scientific Stack: NumPy, Pandas, Matplotlib

This study guide introduces the foundational libraries of the Python scientific stack: NumPy for numerical computation, Pandas for data manipulation, and Matplotlib for data visualization. These tools are indispensable for any Computer Vision Engineer working with data.

## 1. NumPy: Numerical Python

### What is it?
NumPy (Numerical Python) is the fundamental package for numerical computing in Python. It provides support for large, multi-dimensional arrays and matrices, along with a collection of high-level mathematical functions to operate on these arrays.

### Key Concepts
*   **`ndarray`**: The core object in NumPy is the `ndarray`, which is a homogeneous multi-dimensional array of fixed-size items. It's much more efficient than Python's built-in lists for numerical operations.
*   **Vectorization**: NumPy operations are often implemented in C or Fortran, allowing them to perform computations on entire arrays of data without explicit Python `for` loops. This process, known as vectorization, leads to significantly faster execution.
*   **Broadcasting**: NumPy's broadcasting rules allow arithmetic operations between arrays with different shapes, provided they are compatible.

### Basic Usage Example
```python
import numpy as np

# Create a 1D array
arr1 = np.array([1, 2, 3, 4, 5])
print(f"1D Array: {arr1}, Shape: {arr1.shape}")

# Create a 2D array (matrix)
arr2 = np.array([[10, 20, 30], [40, 50, 60]])
print(f"\n2D Array:\n{arr2}, Shape: {arr2.shape}")

# Basic operations
print(f"\nSum of arr1: {np.sum(arr1)}")
print(f"Mean of arr2: {np.mean(arr2)}")

# Element-wise multiplication
arr3 = np.array([5, 4, 3, 2, 1])
print(f"Element-wise product of arr1 and arr3: {arr1 * arr3}")
```

## 2. Pandas: Data Analysis and Manipulation Library

### What is it?
Pandas is an open-source library providing high-performance, easy-to-use data structures and data analysis tools for the Python programming language. It is particularly well-suited for working with tabular and time-series data.

### Key Concepts
*   **`Series`**: A one-dimensional labeled array capable of holding any data type (integers, strings, floats, Python objects, etc.). It's essentially a column in a spreadsheet or a SQL table.
*   **`DataFrame`**: A two-dimensional labeled data structure with columns of potentially different types. You can think of it like a spreadsheet or SQL table, or a dictionary of `Series` objects.
*   **Indexing and Selection**: Pandas provides powerful tools for selecting and filtering data based on labels, integer locations, or boolean conditions.
*   **Data Cleaning and Preparation**: Functions for handling missing data, merging, reshaping, and transforming datasets.

### Basic Usage Example
```python
import pandas as pd
import numpy as np

# Create a Series
s = pd.Series([10, 20, 30, 40], index=['a', 'b', 'c', 'd'])
print(f"Series:\n{s}")

# Create a DataFrame from a dictionary
data = {
    'Name': ['Alice', 'Bob', 'Charlie', 'David'],
    'Age': [25, 30, 35, 28],
    'City': ['New York', 'Paris', 'London', 'Tokyo']
}
df = pd.DataFrame(data)
print(f"\nDataFrame:\n{df}")

# Select a column
print(f"\nNames:\n{df['Name']}")

# Filter rows based on a condition
print(f"\nPeople older than 30:\n{df[df['Age'] > 30]}")

# Add a new column
df['Height_cm'] = [165, 180, 175, 170]
print(f"\nDataFrame with new column:\n{df}")
```

## 3. Matplotlib: Plotting Library

### What is it?
Matplotlib is a comprehensive library for creating static, animated, and interactive visualizations in Python. It's highly customizable and capable of producing publication-quality figures.

### Key Concepts
*   **Figure and Axes**: The **Figure** is the entire window or page on which everything is drawn. The **Axes** is the area where the data is actually plotted (e.g., a single plot). A Figure can contain multiple Axes.
*   **Plot Types**: Supports a wide range of plots, including line plots, scatter plots, bar charts, histograms, pie charts, and more.
*   **Customization**: Offers extensive options for customizing titles, labels, legends, colors, markers, line styles, and annotations.

### Basic Usage Example
```python
import matplotlib.pyplot as plt
import numpy as np

# Generate some data
x = np.linspace(0, 10, 100) # 100 points between 0 and 10
y = np.sin(x)

# Create a simple line plot
plt.figure(figsize=(8, 4)) # Optional: set figure size
plt.plot(x, y, label='sin(x)', color='blue', linestyle='--')
plt.title('Sine Wave')
plt.xlabel('X-axis')
plt.ylabel('Y-axis')
plt.legend()
plt.grid(True)
plt.show()

# Create a scatter plot
np.random.seed(42)
n_points = 50
x_scatter = np.random.rand(n_points) * 10
y_scatter = np.random.rand(n_points) * 5
plt.figure(figsize=(7, 5))
plt.scatter(x_scatter, y_scatter, color='red', marker='o', alpha=0.7)
plt.title('Random Scatter Plot')
plt.xlabel('Feature A')
plt.ylabel('Feature B')
plt.show()
```

## Practical Application & Exercise

To solidify your understanding, try the following:

1.  **NumPy Challenge**: Create a 3x3 NumPy array of random integers between 1 and 100. Calculate its mean, standard deviation, and transpose it. Print all results.
2.  **Pandas Challenge**: Create a Pandas DataFrame with columns `Product` (e.g., 'Laptop', 'Mouse', 'Keyboard'), `Price` (e.g., 1200, 25, 75), and `Quantity` (e.g., 5, 20, 10). Calculate the total revenue (`Price * Quantity`) for each product and add it as a new column named `Total_Revenue`.
3.  **Matplotlib Challenge**: Using the `Total_Revenue` data from the Pandas challenge, create a bar chart showing the total revenue for each product. Label the axes and give the chart a suitable title.
