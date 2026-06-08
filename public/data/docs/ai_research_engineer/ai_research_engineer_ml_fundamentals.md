# Machine Learning Fundamentals: Study Guide

Machine Learning (ML) is a powerful subset of Artificial Intelligence that enables systems to learn from data, identify patterns, and make decisions or predictions with minimal human intervention. Instead of being explicitly programmed for every scenario, ML models are trained on vast amounts of data to adapt and improve their performance over time.

## 1. Core Learning Paradigms

Machine Learning is broadly categorized into two primary paradigms:

### 1.1 Supervised Learning

In supervised learning, the model is trained on a labeled dataset, where each data point has an associated "correct" output or target variable. The goal is to learn a mapping function from input features to output labels or values.

*   **Regression:** Predicts a continuous numerical value.
    *   *Example:* Predicting house prices based on features like square footage, number of bedrooms, and location.
*   **Classification:** Predicts a categorical label or class.
    *   *Example:* Classifying emails as "spam" or "not spam", or identifying different types of diseases based on medical symptoms.

### 1.2 Unsupervised Learning

Unsupervised learning deals with unlabeled data. The goal is to find hidden patterns, structures, or relationships within the data without any prior knowledge of output labels or target variables.

*   **Clustering:** Groups similar data points together into clusters.
    *   *Example:* Segmenting customers into different groups based on their purchasing behavior or demographics for targeted marketing.
*   **Dimensionality Reduction:** Reduces the number of features (variables) in a dataset while retaining most of the important information.
    *   *Example:* Using Principal Component Analysis (PCA) to simplify high-dimensional genomic data for visualization or to speed up subsequent supervised learning tasks.

## 2. Key Steps in a Machine Learning Workflow

A typical ML project follows a structured workflow to ensure effective model development:

1.  **Data Collection & Preprocessing:** Gathering relevant data, cleaning it (handling missing values, outliers), transforming it (e.g., scaling numerical features, encoding categorical features), and splitting it into training and testing sets.
2.  **Feature Engineering:** Creating new features or modifying existing ones from raw data to improve model performance and understanding.
3.  **Model Selection:** Choosing an appropriate ML algorithm based on the problem type (regression, classification, clustering) and characteristics of the dataset.
4.  **Model Training:** Feeding the preprocessed training data to the chosen algorithm to allow it to learn patterns and relationships.
5.  **Model Evaluation:** Assessing the model's performance on unseen testing data using specific metrics to understand its generalization capabilities.
6.  **Hyperparameter Tuning:** Optimizing the configuration parameters of the learning algorithm (not learned from the data) to achieve better performance.
7.  **Deployment:** Integrating the trained and validated model into a production environment for making real-world predictions or decisions.

## 3. Model Evaluation Metrics

Choosing the right evaluation metric is crucial for understanding how well a model performs and for comparing different models.

### 3.1 For Regression Models

*   **Mean Squared Error (MSE):** The average of the squared differences between predicted and actual values. It penalizes larger errors more heavily.
    ```
    MSE = (1/n) * sum((y_actual - y_pred)^2)
    ```
*   **Root Mean Squared Error (RMSE):** The square root of MSE. It is often preferred over MSE because it is in the same units as the target variable, making it more interpretable.
*   **R-squared (Coefficient of Determination):** Represents the proportion of the variance in the dependent variable that is predictable from the independent variables. It ranges from 0 to 1, where 1 indicates a perfect fit.

### 3.2 For Classification Models

*   **Accuracy:** The proportion of correctly predicted instances out of the total instances. While intuitive, it can be misleading for imbalanced datasets.
    ```
    Accuracy = (TP + TN) / (TP + TN + FP + FN)
    ```
*   **Precision:** The proportion of positive identifications that were actually correct. It's important when the cost of False Positives is high (e.g., predicting a non-spam email as spam).
    ```
    Precision = TP / (TP + FP)
    ```
*   **Recall (Sensitivity):** The proportion of actual positives that were correctly identified. It's important when the cost of False Negatives is high (e.g., failing to detect a cancerous tumor).
    ```
    Recall = TP / (TP + FN)
    ```
*   **F1-Score:** The harmonic mean of Precision and Recall. It provides a balance between these two metrics, especially useful in cases with imbalanced classes.
    ```
    F1-Score = 2 * (Precision * Recall) / (Precision + Recall)
    ```
*   **Confusion Matrix:** A table that summarizes the performance of a classification algorithm by showing the counts of True Positives (TP), True Negatives (TN), False Positives (FP), and False Negatives (FN).
    *   **True Positives (TP):** Instances correctly predicted as positive.
    *   **True Negatives (TN):** Instances correctly predicted as negative.
    *   **False Positives (FP):** Instances incorrectly predicted as positive (Type I error).
    *   **False Negatives (FN):** Instances incorrectly predicted as negative (Type II error).

## 4. Classic Machine Learning Algorithms

Understanding these foundational algorithms is key to building more complex ML systems:

*   **Linear Regression:** A supervised algorithm used for regression tasks. It models the relationship between a dependent variable and one or more independent variables by fitting a linear equation to the observed data.
*   **Logistic Regression:** Despite its name, it's a supervised algorithm primarily used for binary classification. It models the probability of a certain class or event occurring, often using a sigmoid function.
*   **Decision Trees & Random Forests:**
    *   **Decision Tree:** A non-parametric supervised learning method used for classification and regression. It builds a model in the form of a tree structure, where internal nodes represent tests on attributes, branches represent outcomes, and leaf nodes represent class labels or values.
    *   **Random Forest:** An ensemble learning method for classification and regression that operates by constructing a multitude of decision trees at training time and outputting the mode of the classes (for classification) or mean prediction (for regression) of the individual trees.
*   **K-Nearest Neighbors (KNN):** A non-parametric, instance-based learning algorithm used for both classification and regression. It classifies a new data point based on the majority class (or average value) of its 'k' nearest neighbors in the feature space.
*   **K-Means Clustering:** An unsupervised algorithm that partitions 'n' observations into 'k' clusters. Each observation belongs to the cluster with the nearest mean (centroid), serving as a prototype of the cluster.

## 5. Simple Code Example: Linear Regression with Scikit-learn

Here's a basic Python example demonstrating how to train and evaluate a simple linear regression model using the popular `scikit-learn` library.

```python
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score

# 1. Generate some synthetic data for demonstration
# Independent variable (feature): house size in square feet
X = np.array([500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400]).reshape(-1, 1)
# Dependent variable (target): house price in thousands USD, with some noise
y = np.array([150, 175, 190, 220, 240, 270, 285, 310, 330, 350])

# 2. Split data into training and testing sets
# This helps assess how well the model generalizes to unseen data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)

# 3. Create a Linear Regression model instance
model = LinearRegression()

# 4. Train the model using the training data
# The model learns the relationship between X_train and y_train
model.fit(X_train, y_train)

# 5. Make predictions on the unseen test set
y_pred = model.predict(X_test)

# 6. Evaluate the model's performance
mse = mean_squared_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

print(f"Model Intercept (c): {model.intercept_:.2f}") # The value of y when X is 0
print(f"Model Coefficient (m): {model.coef_[0]:.2f}") # The slope of the line
print(f"Mean Squared Error on test set: {mse:.2f}")
print(f"R-squared score on test set: {r2:.2f}")

# Example of making a new prediction
new_house_size = np.array([[1500]]) # A new house of 1500 sq ft
predicted_price = model.predict(new_house_size)[0]
print(f"Predicted price for a 1500 sq ft house: ${predicted_price:.2f} (in thousands)")
```

## 6. Quick Understanding Checklist/Exercise

1.  Describe a real-world scenario where a classification model would be more appropriate than a regression model, and explain why.
2.  Explain why `Accuracy` can be a misleading evaluation metric when dealing with highly imbalanced datasets. Which two metrics from the classification section would you use instead to get a better understanding of model performance, and why?
3.  What is the primary objective of K-Means clustering? If you were to apply K-Means to a dataset, what is the significance of choosing the 'k' value?