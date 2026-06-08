### Feature Engineering & Selection Study Guide

#### Introduction to Feature Engineering & Selection
*   **Feature Engineering:** The process of creating new features or transforming existing ones from raw data to improve the performance of machine learning models. It's often the most crucial step in the ML pipeline.
*   **Feature Selection:** The process of choosing a subset of relevant features for use in model construction. This helps reduce dimensionality, improve model interpretability, speed up training, and reduce overfitting.

#### I. Feature Engineering Techniques

##### A. Creating New Features
*   **Interaction Features:** Combining two or more features (e.g., product, sum, difference).
    *   Example: `Area = Length * Width`
*   **Polynomial Features:** Raising existing features to a power (e.g., x^2, x^3).
*   **Aggregations:** Grouping data and computing statistics (mean, sum, count, min, max).
*   **Domain-Specific Features:** Leveraging domain knowledge to create relevant features (e.g., "age_of_account" from "signup_date" and "current_date").

##### B. Transforming Existing Features

###### 1. Numerical Feature Scaling
*   **Purpose:** Ensures features contribute equally to the distance calculations and gradient descent optimization.
*   **Standardization (Z-score normalization):**
    *   Formula: `X_scaled = (X - mean(X)) / std(X)`
    *   Result: Mean = 0, Standard Deviation = 1.
    *   Suitable for: Algorithms sensitive to feature magnitudes (e.g., SVM, K-Means, Logistic Regression, Neural Networks).
*   **Normalization (Min-Max Scaling):**
    *   Formula: `X_scaled = (X - min(X)) / (max(X) - min(X))`
    *   Result: Values scaled to a fixed range, typically [0, 1].
    *   Suitable for: Algorithms requiring features in a specific bounded range (e.g., Neural Networks with sigmoid activation).

###### 2. Categorical Feature Encoding
*   **Purpose:** Convert categorical data into numerical format that ML algorithms can understand.
*   **One-Hot Encoding:**
    *   Creates new binary features for each category.
    *   Suitable for: Nominal (unordered) categories. Avoids imposing an arbitrary order.
    *   Issue: Can lead to high dimensionality (curse of dimensionality) for categories with many unique values.
*   **Label Encoding:**
    *   Assigns a unique integer to each category.
    *   Suitable for: Ordinal (ordered) categories where the numerical order makes sense.
    *   Issue: Implies an arbitrary order if used with nominal categories, which can mislead models.
*   **Target Encoding (Mean Encoding):**
    *   Replaces a category with the mean of the target variable for that category.
    *   Suitable for: High cardinality categorical features.
    *   Issue: Can lead to data leakage if not performed carefully (e.g., using cross-validation or out-of-fold encoding).

###### 3. Handling Outliers
*   **Definition:** Data points significantly different from other observations.
*   **Identification:** Box plots, Z-score, IQR method.
*   **Treatment:**
    *   **Capping/Winsorization:** Replacing outliers with a specified percentile value (e.g., 5th and 95th percentile).
    *   **Transformation:** Log transform, square root transform can reduce the impact of outliers.
    *   **Removal:** Removing outlier rows (use with caution, only if truly erroneous).
    *   **Robust Models:** Use models less sensitive to outliers (e.g., tree-based models).

###### 4. Handling Missing Values
*   **Identification:** `df.isnull().sum()`
*   **Treatment (Imputation):**
    *   **Mean/Median/Mode Imputation:** Replacing missing values with the mean (numerical), median (numerical, robust to outliers), or mode (categorical/numerical).
    *   **Forward/Backward Fill:** Propagating last/next valid observation.
    *   **K-NN Imputation:** Imputing based on the K-nearest neighbors.
    *   **Regression Imputation:** Predicting missing values using a regression model.
    *   **Constant Value:** Replacing with a specific constant (e.g., 0, "Unknown").
    *   **Deletion:** Removing rows/columns with missing values (use if missingness is low).

###### 5. Date/Time Features
*   **Extraction:** Extracting components like year, month, day, day of week, hour, minute, second.
*   **Cyclical Features:** Encoding cyclical data (e.g., month, day of week) using sine/cosine transformations to maintain continuity.
*   **Time Differences:** Calculating durations between dates.
*   **Lag Features:** Using past values of a time series as features.
*   **Rolling Statistics:** Calculating moving averages, standard deviations over a window.

#### II. Feature Selection Methods

##### A. Filter Methods
*   **Concept:** Select features based on their statistical properties relative to the target variable, independent of the chosen ML algorithm.
*   **Examples:**
    *   **Correlation:** Remove highly correlated features (redundant) or features with low correlation to the target.
    *   **Chi-squared test:** For categorical features and categorical target.
    *   **ANOVA F-value:** For numerical features and categorical target.
    *   **Variance Threshold:** Remove features with low variance (they provide little information).

##### B. Wrapper Methods
*   **Concept:** Use a specific machine learning algorithm to evaluate the usefulness of feature subsets. They "wrap" the model selection process.
*   **Examples:**
    *   **Forward Selection:** Start with no features, add the best feature at each step until a stopping criterion is met.
    *   **Backward Elimination:** Start with all features, remove the worst feature at each step.
    *   **Recursive Feature Elimination (RFE):** Recursively trains a model and removes the least important features, repeating until the desired number of features is reached. Computationally intensive.

##### C. Embedded Methods
*   **Concept:** Feature selection is built into the model training process itself.
*   **Examples:**
    *   **Lasso Regression (L1 Regularization):** Adds a penalty equal to the absolute value of the magnitude of coefficients. Can shrink some coefficients to exactly zero, effectively performing feature selection.
    *   **Ridge Regression (L2 Regularization):** Adds a penalty equal to the squared magnitude of coefficients. Shrinks coefficients towards zero but rarely to absolute zero.
    *   **Tree-based Models (e.g., Random Forest, Gradient Boosting):** Naturally provide feature importance scores based on how much each feature contributes to reducing impurity.

#### III. Impact on Algorithms and Model Performance
*   **Distance-based algorithms (K-NN, SVM, K-Means):** Highly sensitive to feature scaling.
*   **Linear Models (Linear/Logistic Regression):** Benefit from scaling, feature engineering (polynomials, interactions) to capture non-linearity, and regularization for feature selection.
*   **Tree-based Models (Decision Trees, Random Forests, Gradient Boosted Trees):** Generally less sensitive to feature scaling and outliers. Handle non-linear relationships well. Feature importance from these models is useful for selection.
*   **Neural Networks:** Require scaled input features for efficient training (gradient descent) and often benefit from carefully engineered features.

#### Code Example: Feature Scaling and Encoding with Scikit-learn

```python
import pandas as pd
from sklearn.preprocessing import StandardScaler, MinMaxScaler, OneHotEncoder, LabelEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer

# Sample Data
data = {
    'Age': [25, 30, 45, 20, 35, None, 60, 28, 55, 40],
    'Salary': [50000, 60000, 90000, 40000, 75000, 55000, 120000, None, 100000, 80000],
    'City': ['New York', 'London', 'Paris', 'New York', 'London', 'Paris', 'Berlin', 'New York', 'London', 'Paris'],
    'Experience': [2, 5, 15, 1, 8, 3, 25, 4, 20, 10],
    'Education': ['Bachelors', 'Masters', 'PhD', 'Bachelors', 'Masters', 'Bachelors', 'PhD', 'Bachelors', 'Masters', 'PhD']
}
df = pd.DataFrame(data)

# Define numerical and categorical features
numerical_features = ['Age', 'Salary', 'Experience']
categorical_features = ['City', 'Education']

# Create preprocessing pipelines for numerical and categorical features
numerical_transformer = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='median')), # Handle missing values
    ('scaler', StandardScaler()) # Standardize numerical features
])

categorical_transformer_onehot = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='most_frequent')), # Handle missing values for categorical
    ('onehot', OneHotEncoder(handle_unknown='ignore')) # One-hot encode categorical features
])

# Use ColumnTransformer to apply different transformations to different columns
preprocessor = ColumnTransformer(
    transformers=[
        ('num', numerical_transformer, numerical_features),
        ('cat', categorical_transformer_onehot, categorical_features)
    ])

# Apply preprocessing
df_preprocessed = preprocessor.fit_transform(df)

# To see the column names (for OneHotEncoder, this requires specific handling or using get_feature_names_out)
# For simplicity, let's just show the shape
print("Shape of preprocessed data:", df_preprocessed.shape)
# Original df.shape (10, 5) -> 3 numerical + 2 categorical * unique categories
# City: 4 unique (New York, London, Paris, Berlin)
# Education: 3 unique (Bachelors, Masters, PhD)
# Total columns: 3 (scaled num) + 4 (city one-hot) + 3 (education one-hot) = 10 columns

# Example of Label Encoding (manual for a specific column if ordinal)
# Note: LabelEncoder expects a 1D array, not a DataFrame column directly
le = LabelEncoder()
df['Education_Encoded'] = le.fit_transform(df['Education'].astype(str))
print("\nLabel Encoded 'Education' (original DF):")
print(df[['Education', 'Education_Encoded']].head())
```

#### Quick Checklist/Exercise:
1.  **Scenario:** You have a dataset with a `TransactionAmount` (numerical), `ProductCategory` (nominal categorical), and `TransactionDate` (date/time) column. Describe the appropriate feature engineering and scaling techniques you would apply to each to prepare them for a Logistic Regression model.
2.  **Concept Check:** Explain the key difference between Filter and Wrapper methods for feature selection. When would you prefer one over the other?
3.  **Outlier Impact:** Why are tree-based models generally less sensitive to outliers compared to linear regression models, and what's a common technique to mitigate outlier impact in numerical features?