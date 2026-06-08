# Supervised Learning Algorithms: A Comprehensive Study Guide

Supervised learning is a foundational paradigm in machine learning where an algorithm learns from labeled training data. This data consists of input features (X) and corresponding output labels (y). The goal is to learn a mapping function from the input to the output, enabling the model to make predictions on new, unseen data.

Supervised learning tasks are broadly categorized into two types:
*   **Regression:** Predicting a continuous output value (e.g., house prices, temperature).
*   **Classification:** Predicting a categorical output label (e.g., spam/not spam, disease/no disease).

## 1. Regression Models
Regression models predict continuous numerical values. They learn the relationship between input features and a continuous target variable.

### 1.1. Linear Regression
Linear Regression models a linear relationship between the input features and the target. It assumes a straight-line relationship.
*   **Simple Linear Regression:** One independent variable.
*   **Multiple Linear Regression:** Multiple independent variables.
*   **Cost Function:** Typically Mean Squared Error (MSE), which measures the average squared difference between predicted and actual values.
*   **Optimization:** Often uses Gradient Descent to find the coefficients that minimize the cost function.
*   **Assumptions:** Linearity, independence of errors, homoscedasticity, normality of errors.

### 1.2. Polynomial Regression
Polynomial Regression models non-linear relationships by fitting a polynomial equation to the data. It extends linear regression by adding polynomial terms (e.g., $x^2, x^3$). Choosing the right polynomial degree is crucial to avoid underfitting or overfitting.

### 1.3. Regularized Regression (Ridge, Lasso, ElasticNet)
Regularization techniques are used to prevent overfitting, especially when dealing with high-dimensional data or multicollinearity, by adding a penalty term to the cost function.
*   **Ridge Regression (L2 Regularization):** Adds a penalty proportional to the sum of the squared magnitudes of the coefficients. It shrinks coefficients towards zero but rarely to absolute zero, thus reducing variance.
*   **Lasso Regression (L1 Regularization):** Adds a penalty proportional to the sum of the absolute magnitudes of the coefficients. It can shrink some coefficients exactly to zero, effectively performing feature selection.
*   **ElasticNet Regression:** Combines both L1 (Lasso) and L2 (Ridge) penalties. It's useful when there are multiple correlated features.

## 2. Classification Models
Classification models predict discrete class labels. They learn to categorize input data into one of several predefined classes.

### 2.1. Logistic Regression
Despite its name, Logistic Regression is a classification algorithm. It uses the sigmoid (logistic) function to output a probability score between 0 and 1, which is then mapped to a class label based on a threshold (e.g., 0.5).
*   **Cost Function:** Typically Cross-Entropy Loss (or Log Loss).
*   **Decision Boundary:** A hyperplane that separates the classes.

### 2.2. Support Vector Machines (SVMs)
SVMs aim to find the optimal hyperplane that best separates the data points of different classes in a high-dimensional space. The 