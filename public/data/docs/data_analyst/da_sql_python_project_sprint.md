# Practical Project: SQL & Python Data Analysis Sprint

This sprint provides a hands-on experience in tackling a real-world dataset, integrating advanced SQL for efficient data extraction with Python (Pandas) for robust cleaning, transformation, and initial analysis. You will move from raw data to actionable insights, concluding with preliminary visualizations to present key findings.

## 1. Advanced SQL for Data Extraction

Efficiently extracting the right data is the foundation of any analysis. Beyond basic `SELECT` statements, mastering advanced SQL techniques ensures you retrieve clean, aggregated, and appropriately structured data directly from your database.

### Key Concepts:

*   **Common Table Expressions (CTEs):** Organize complex queries into readable, manageable blocks. They improve readability and can be referenced multiple times within a single query.
    ```sql
    WITH SalesSummary AS (
        SELECT
            product_id,
            SUM(amount) AS total_sales,
            COUNT(order_id) AS total_orders
        FROM orders
        GROUP BY product_id
    )
    SELECT
        p.product_name,
        ss.total_sales,
        ss.total_orders
    FROM products p
    JOIN SalesSummary ss ON p.product_id = ss.product_id
    WHERE ss.total_sales > 1000;
    ```
*   **Window Functions:** Perform calculations across a set of table rows related to the current row, without grouping rows together. Examples include `ROW_NUMBER()`, `RANK()`, `LAG()`, `LEAD()`, `NTILE()`, `AVG() OVER()`, `SUM() OVER()`. These are crucial for tasks like ranking, calculating running totals, or comparing values across rows.
    ```sql
    SELECT
        order_id,
        customer_id,
        order_date,
        SUM(amount) OVER (PARTITION BY customer_id ORDER BY order_date) AS running_total_spend,
        LAG(order_date, 1, order_date) OVER (PARTITION BY customer_id ORDER BY order_date) AS previous_order_date
    FROM orders;
    ```
*   **Complex Joins and Subqueries:** Effectively combine data from multiple tables using `INNER JOIN`, `LEFT JOIN`, `RIGHT JOIN`, and `FULL OUTER JOIN`. Utilize subqueries for conditional filtering or as derived tables to simplify complex logic.
*   **Filtering with `HAVING`:** Filter results after aggregation, complementing `WHERE` clauses that filter before aggregation. This is essential for analyzing grouped data (e.g., groups with a total sum above a certain threshold).

## 2. Python (Pandas) for Data Cleaning & Transformation

Once data is extracted, Python with the Pandas library becomes your primary tool for preparing it for analysis. This involves addressing inconsistencies, missing values, and reshaping data.

### Key Concepts:

*   **Data Loading:** Efficiently load SQL query results into a Pandas DataFrame using `pd.read_sql()`. This typically requires a database connector (e.g., `psycopg2` for PostgreSQL, `mysql-connector-python` for MySQL, `sqlite3` for SQLite) and an SQLAlchemy engine.
    ```python
    import pandas as pd
    from sqlalchemy import create_engine

    # Replace with your actual database connection string
    engine = create_engine('postgresql://user:password@host:port/database_name')

    sql_query = """SELECT customer_id, order_date, total_amount FROM orders WHERE order_date >= '2023-01-01';"""
    df = pd.read_sql(sql_query, engine)
    print(df.head())
    ```
*   **Handling Missing Values:** Identify and manage `NaN` values using methods like `df.isnull().sum()` (to count), `df.dropna()` (to remove rows/columns), and `df.fillna()` (to impute missing values).
*   **Data Type Conversion:** Ensure columns have appropriate data types (`df['column'].astype('int')`, `pd.to_datetime()`). Incorrect data types can lead to errors in calculations or analyses.
*   **Duplicate Management:** Identify and remove duplicate rows using `df.duplicated()` (to find) and `df.drop_duplicates()` (to remove). This ensures each observation is unique.
*   **Text Manipulation:** Clean and standardize string data using Pandas string methods (`.str.lower()`, `.str.strip()`, `.str.replace()`, `.str.contains()`). Essential for consistent categorical data.
*   **Feature Engineering:** Create new, informative features from existing ones (e.g., `df['year'] = df['date_column'].dt.year`, `df['revenue_per_customer'] = df['total_revenue'] / df['customer_count']`). This can unlock deeper insights.

## 3. Exploratory Data Analysis (EDA) & Preliminary Statistics

EDA is the process of understanding your dataset's characteristics, identifying patterns, anomalies, and testing hypotheses before formal modeling.

### Key Concepts:

*   **Descriptive Statistics:** Summarize the main features of a dataset using `df.describe()` (numerical summary), `df.info()` (data types and non-null counts), `df.value_counts()` (categorical distribution), `df.mean()`, `df.median()`, `df.mode()`, `df.std()`.
*   **Correlation Analysis:** Understand linear relationships between numerical variables using `df.corr()`. A heatmap visualization of the correlation matrix is highly effective.
*   **Outlier Detection:** Identify extreme values that might skew analysis (e.g., using box plots, Z-scores, or the Interquartile Range (IQR) method). Deciding how to handle outliers is a critical step.
*   **Distribution Analysis:** Examine the spread and shape of data for individual variables using histograms, KDE plots, and Q-Q plots. This helps in understanding data normality or skewness.

## 4. Basic Data Visualization

Presenting your findings through clear and concise visualizations is crucial for communicating insights to both technical and non-technical audiences.

### Key Concepts:

*   **Matplotlib & Seaborn:** Powerful Python libraries for creating static, interactive, and animated visualizations. Seaborn builds on Matplotlib, offering a higher-level interface for statistical graphics.
*   **Common Plot Types:**
    *   **Histograms:** Show the distribution of a single numerical variable.
    *   **Bar Charts:** Compare categorical data or show counts of different categories.
    *   **Scatter Plots:** Illustrate relationships between two numerical variables, often used for identifying correlations.
    *   **Box Plots:** Display distribution, skewness, and potential outliers for numerical data, often across different categories.
    *   **Line Plots:** Show trends over time or sequence, ideal for time-series data.

## Quick Check-in Exercise:

1.  **SQL Task:** Write a SQL query using a CTE to find the top 5 customers by total purchase amount in the last 3 months from an `orders` table (columns: `customer_id`, `order_date`, `amount`). Assume `order_date` is a `DATE` type.
2.  **Python Task:** After loading a DataFrame `df` with `customer_id`, `product_name`, and `price`, write Pandas code to:
    *   Check for missing values in any column.
    *   Fill missing `product_name` values with "Unknown Product".
    *   Convert the `price` column to a numeric type, coercing errors to `NaN`.
3.  **Analysis Task:** If you notice a high positive correlation (e.g., > 0.8) between two numerical features during EDA, what are two potential implications or next steps you might consider regarding these features for further analysis or modeling?