# Data Preparation & Transformation for Visualization

## Introduction
Raw data, in its initial form, is rarely suitable for direct visualization. It often contains inconsistencies, missing values, and is structured in a way that makes analysis difficult. Data preparation and transformation are crucial steps to clean, structure, and refine this raw data into a 'tidy' format, enabling optimal and insightful visualizations.

## Core Concepts

### 1. The Concept of "Tidy Data"
"Tidy data" is a standard way of structuring datasets that makes analysis and visualization easier. It adheres to three principles:
*   Each variable forms a column.
*   Each observation forms a row.
*   Each type of observational unit forms a table.

**Benefit**: Tidy data simplifies operations like filtering, grouping, and aggregation, making it the ideal input for most visualization tools.

### 2. Data Cleaning
**Purpose**: To ensure the quality, accuracy, and consistency of your data.
**Techniques**:
*   **Handling Duplicates**: Identifying and removing redundant records.
*   **Correcting Inconsistent Entries**: Standardizing variations (e.g., 'NY', 'New York', 'new york' to 'New York').
*   **Addressing Structural Errors**: Correcting typos, misspellings, or incorrect data types.

### 3. Handling Missing Values
Missing data (`NaN`, `null`, blank) can bias analysis and break visualizations. Strategies include:
*   **Identification**: Locating where data is missing.
*   **Removal**: Deleting rows or columns with missing values (`dropna()`). Use with caution to avoid losing valuable information.
*   **Imputation**: Filling missing values with estimated or predefined data.
    *   **Mean/Median/Mode Imputation**: Replacing missing numerical values with the mean, median, or mode of the respective column.
    *   **Constant Value**: Filling with a specific value (e.g., 0, 'Unknown').
    *   **Forward/Backward Fill**: Propagating the last/next valid observation forward/backward.

### 4. Data Structuring & Transformation
These techniques reshape and enrich your data for better analysis and visualization.

*   **Data Shaping (Pivoting/Unpivoting)**
    *   **Pivoting (Wide to Long)**: Transforms values from rows into new columns. Often used to summarize data.
    *   **Unpivoting (Long to Wide)**: Transforms columns into row values. This is frequently used to convert 