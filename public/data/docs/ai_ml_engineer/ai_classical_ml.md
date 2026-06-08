# Classical Machine Learning: A Study Guide

Classical Machine Learning forms the bedrock of artificial intelligence, focusing on algorithms that learn from data to make predictions or decisions without being explicitly programmed. This guide dives into the fundamental concepts and techniques essential for any AI/ML Engineer.

## 1. Introduction to Classical Machine Learning

Classical ML encompasses a wide range of algorithms that have been around for decades, providing robust solutions to many real-world problems. Unlike deep learning, which often requires massive datasets and computational power, classical methods can be effective with smaller datasets and are often more interpretable.

## 2. Supervised Learning

Supervised learning involves training a model on a labeled dataset, meaning each input example in the training data has an associated output label. The goal is for the model to learn a mapping function from inputs to outputs, which can then be used to predict outputs for new, unseen inputs.

### Core Concepts:
*   **Regression:** Predicting a continuous output value (e.g., house prices, temperature).
    *   **Algorithms:** Linear Regression, Polynomial Regression, Decision Tree Regressor, Random Forest Regressor.
*   **Classification:** Predicting a discrete output label or category (e.g., spam/not spam, disease/no disease).
    *   **Algorithms:** Logistic Regression, Support Vector Machines (SVM), K-Nearest Neighbors (k-NN), Decision Trees, Naive Bayes.

### Example: Linear Regression

Linear Regression is a simple yet powerful algorithm for predicting a continuous target variable based on one or more independent predictor variables. It assumes a linear relationship between the input features and the target.

```python
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error

# Sample Data
X = np.array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).reshape(-1, 1) # Feature
y = np.array([2, 4.1, 5.8, 8.2, 10.3, 12.1, 14, 15.9, 18, 20.1]) # Target

# Split data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Initialize and train the model
model = LinearRegression()
model.fit(X_train, y_train)

# Make predictions
y_pred = model.predict(X_test)

# Evaluate the model
mse = mean_squared_error(y_test, y_pred)
print(f"Coefficients: {model.coef_}")
print(f"Intercept: {model.intercept_}")
print(f"Mean Squared Error: {mse:.2f}")
```

## 3. Unsupervised Learning

Unsupervised learning deals with unlabeled data. The goal is to find hidden patterns, structures, or relationships within the data without any prior knowledge of output labels. It's often used for exploratory data analysis, dimensionality reduction, and pattern discovery.

### Core Concepts:
*   **Clustering:** Grouping similar data points together based on their inherent characteristics.
    *   **Algorithms:** K-Means, Hierarchical Clustering, DBSCAN.
*   **Dimensionality Reduction:** Reducing the number of input features while retaining as much relevant information as possible.
    *   **Algorithms:** Principal Component Analysis (PCA), t-Distributed Stochastic Neighbor Embedding (t-SNE).

### Example: K-Means Clustering

K-Means is a popular clustering algorithm that partitions `n` observations into `k` clusters, where each observation belongs to the cluster with the nearest mean (centroid).

## 4. Feature Engineering

Feature engineering is the process of creating new features or transforming existing ones from raw data to improve the performance of machine learning models. It's often considered one of the most critical steps in the ML pipeline.

### Key Techniques:
*   **Handling Missing Values:** Imputation (mean, median, mode), dropping rows/columns.
*   **Encoding Categorical Features:** One-Hot Encoding, Label Encoding.
*   **Scaling Numerical Features:** Standardization (Z-score scaling), Normalization (Min-Max scaling).
*   **Creating New Features:** Polynomial features, interaction terms, aggregations.
*   **Discretization:** Converting continuous features into discrete bins.

## 5. Model Validation

Model validation is crucial for assessing how well a machine learning model generalizes to unseen data. It helps in understanding if the model is overfitting (performing well on training data but poorly on new data) or underfitting (not capturing the underlying patterns in the data).

### Techniques:
*   **Train-Test Split:** Dividing the dataset into a training set (to train the model) and a test set (to evaluate its performance on unseen data). A common split is 70/30 or 80/20.
*   **Cross-Validation:** A more robust technique where the data is split into `k` folds. The model is trained `k` times, each time using `k-1` folds for training and the remaining fold for testing. The results are then averaged.
    *   **K-Fold Cross-Validation:** Most common type.

### Evaluation Metrics:
*   **For Regression:** Mean Squared Error (MSE), Root Mean Squared Error (RMSE), Mean Absolute Error (MAE), R-squared.
*   **For Classification:**
    *   **Accuracy:** (True Positives + True Negatives) / Total Observations.
    *   **Precision:** True Positives / (True Positives + False Positives).
    *   **Recall (Sensitivity):** True Positives / (True Positives + False Negatives).
    *   **F1-Score:** Harmonic mean of Precision and Recall.
    *   **Confusion Matrix:** A table showing the performance of a classification model.

## 6. Basic Interpretability Techniques

Understanding why a model makes certain predictions is vital, especially in critical applications. Interpretability helps in debugging models, building trust, and gaining insights into the problem domain.

### Common Techniques:
*   **Model Coefficients (Linear Models):** In linear regression, the coefficients directly indicate the strength and direction of the relationship between each feature and the target.
*   **Feature Importance (Tree-based Models):** Algorithms like Decision Trees, Random Forests, and Gradient Boosting Machines can rank features by their contribution to the model's predictions.
*   **Partial Dependence Plots (PDPs):** Show the marginal effect of one or two features on the predicted outcome of a model.
*   **SHAP (SHapley Additive exPlanations) / LIME (Local Interpretable Model-agnostic Explanations):** More advanced techniques that provide local (instance-level) and global explanations for complex models.

## Quick Checklist/Exercise

1.  **Differentiate:** Explain the primary difference between supervised and unsupervised learning and provide an example of a real-world problem for each.
2.  **Scenario:** You are building a model to predict customer churn. What kind of machine learning problem is this (regression/classification/clustering)? What evaluation metric would you prioritize and why?
3.  **Feature Engineering Challenge:** Imagine you have a dataset with a 'Date' column and a 'Price' column. List two potential new features you could engineer from the 'Date' column and explain how they might benefit a predictive model for 'Price'.