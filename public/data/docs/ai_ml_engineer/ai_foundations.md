# Programming and Math Foundations for AI/ML

This study guide is designed to establish a robust foundation in Python programming, data manipulation, visualization, and the core mathematical concepts (linear algebra, calculus, probability, and statistics) crucial for understanding and implementing AI/ML algorithms. Mastering these fundamentals will empower you to grasp complex AI/ML theories and translate them into practical solutions.

## 1. Python Programming Foundations

Python is the lingua franca of AI/ML due to its simplicity, extensive libraries, and vast community support. A strong command of its ecosystem is non-negotiable.

### 1.1 Core Python Concepts
Before diving into AI/ML specific libraries, ensure a solid understanding of fundamental Python constructs:
*   **Variables and Data Types:** Understand primitive types (integers, floats, strings, booleans) and common collection types (lists, tuples, dictionaries, sets).
*   **Control Flow:** Master `if-else` statements for conditional execution and `for` and `while` loops for iteration.
*   **Functions:** Learn to define and call functions, manage arguments, handle return values, and grasp variable scope.
*   **Object-Oriented Programming (OOP) Basics:** Familiarize yourself with classes, objects, methods, and attributes, as many ML libraries are designed with OOP principles.

### 1.2 Data Manipulation with Pandas
Pandas is the cornerstone library for data analysis and manipulation in Python. Its primary data structure, the DataFrame, is central to working with tabular data.

*   **DataFrame Basics:** Learn to create DataFrames, inspect their structure (`head()`, `info()`, `describe()`, `shape`), and select specific columns or rows.
*   **Data Loading:** Efficiently read data from various file formats like CSV, Excel, and JSON using `pd.read_csv()`, `pd.read_excel()`, etc.
*   **Data Cleaning:** Understand how to identify and handle missing values (`isnull()`, `dropna()`, `fillna()`), and remove duplicate entries (`drop_duplicates()`).
*   **Data Transformation:** Filter data based on conditions (`df[df['column'] > value]`), sort DataFrames (`sort_values()`), group data for aggregation (`groupby()`), and apply aggregate functions (`mean()`, `sum()`, `count()`).

**Code Example (Pandas):**
```python
import pandas as pd
import numpy as np

# Create a sample DataFrame
data = {
    'Name': ['Alice', 'Bob', 'Charlie', 'David', 'Eve'],
    'Age': [24, 27, np.nan, 32, 29],
    'City': ['New York', 'Los Angeles', 'Chicago', 'New York', 'Boston'],
    'Salary': [70000, 80000, 65000, 90000, np.nan]
}
df = pd.DataFrame(data)

print("Original DataFrame:")
print(df)

# Handle missing values: fill Age with mean, Salary with median
df['Age'].fillna(df['Age'].mean(), inplace=True)
df['Salary'].fillna(df['Salary'].median(), inplace=True)

# Group by City and calculate average age and sum of salary
grouped_data = df.groupby('City').agg(
    Avg_Age=('Age', 'mean'),
    Total_Salary=('Salary', 'sum')
).reset_index()

print("\nProcessed Data (Missing values handled, Grouped by City):")
print(grouped_data)
```

### 1.3 Data Visualization with Matplotlib & Seaborn
Visualization is a critical skill for exploring data, identifying patterns, and communicating insights. Matplotlib and Seaborn are the go-to libraries.

*   **Matplotlib Basics:** Learn to create figures and axes, and generate fundamental plot types like line plots, scatter plots, bar plots, and histograms.
*   **Seaborn:** Built on Matplotlib, Seaborn provides a high-level interface for producing aesthetically pleasing and informative statistical graphics. Explore functions like `scatterplot()`, `histplot()`, `boxplot()`, and `heatmap()`.

**Code Example (Matplotlib/Seaborn):**
```python
import matplotlib.pyplot as plt
import seaborn as sns

# Re-using the 'df' and 'grouped_data' from the previous Pandas example

plt.figure(figsize=(12, 5))

# Histogram of Age distribution
plt.subplot(1, 2, 1) # 1 row, 2 columns, 1st plot
sns.histplot(df['Age'], bins=5, kde=True)
plt.title('Distribution of Age')
plt.xlabel('Age')
plt.ylabel('Count')

# Bar plot of Total Salary by City
plt.subplot(1, 2, 2) # 1 row, 2 columns, 2nd plot
sns.barplot(x='City', y='Total_Salary', data=grouped_data)
plt.title('Total Salary by City')
plt.xlabel('City')
plt.ylabel('Total Salary')

plt.tight_layout()
plt.show()
```

### Checklist/Exercise:
1.  Write a Python function that takes a list of numerical values and returns a dictionary containing their mean, median, and mode.
2.  Using Pandas, load a dataset from a URL (e.g., `https://raw.githubusercontent.com/mwaskom/seaborn-data/master/iris.csv`), clean any potential missing values by dropping rows, and then group the data by a categorical column to calculate the average of another numerical column.
3.  Generate a pair plot using Seaborn for the loaded dataset to visualize relationships between all numerical features.

## 2. Mathematical Foundations

A strong grasp of mathematics is essential to truly understand the 