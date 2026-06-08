# Supervised Learning: Regression and Classification Models

Supervised learning is a cornerstone of machine learning, where an algorithm learns from labeled training data. This data consists of input features (X) and corresponding output labels (y), and the goal is to learn a mapping function from X to y that can predict outcomes for unseen data. Supervised learning primarily tackles two types of problems: Regression and Classification.

## 1. Regression Models

Regression models are used to predict a continuous output variable.

### 1.1 Linear Regression

Linear Regression is a fundamental algorithm that models the relationship between a dependent variable (target) and one or more independent variables (features) by fitting a linear equation to the observed data.

*   **Concept:**
    The model assumes a linear relationship: `y = β₀ + β₁x₁ + β₂x₂ + ... + βₙxₙ + ε`, where `y` is the dependent variable, `xᵢ` are the independent variables, `βᵢ` are the coefficients, and `ε` is the error term. The goal is to find the coefficients (`β`) that minimize the sum of squared residuals (Ordinary Least Squares - OLS).
*   **Training:** Involves finding the best-fit line (or hyperplane in higher dimensions) that minimizes the Mean Squared Error (MSE) between predicted and actual values.
*   **Example (Scikit-learn):**
    ```python
    from sklearn.linear_model import LinearRegression
    from sklearn.model_selection import train_test_split
    import numpy as np

    # Sample data
    X = np.array([[1], [2], [3], [4], [5]])
    y = np.array([2, 4, 5, 4, 5])

    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Initialize and train the model
    model = LinearRegression()
    model.fit(X_train, y_train)

    # Make predictions
    predictions = model.predict(X_test)
    print(f"Coefficients: {model.coef_}")
    print(f"Intercept: {model.intercept_}")
    print(f"Predictions: {predictions}")
    ```

## 2. Classification Models

Classification models are used to predict a categorical output variable (e.g., "spam" or "not spam", "malignant" or "benign").

### 2.1 Logistic Regression

Despite its name, Logistic Regression is a classification algorithm. It models the probability of a binary outcome using a logistic (sigmoid) function.

*   **Concept:**
    It uses the sigmoid function `p(x) = 1 / (1 + e^(-(β₀ + βx)))` to map any real-valued number into a probability between 0 and 1. A threshold (commonly 0.5) is then applied to classify the outcome. It's fundamentally a linear model applied to a transformed probability.
*   **Training:** Involves finding coefficients that maximize the likelihood of the observed data using an optimization algorithm like gradient descent.
*   **Example (Scikit-learn):**
    ```python
    from sklearn.linear_model import LogisticRegression
    from sklearn.model_selection import train_test_split
    import numpy as np

    # Sample data
    X = np.array([[1], [2], [3], [4], [5]])
    y = np.array([0, 0, 1, 1, 1]) # 0 for class A, 1 for class B

    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Initialize and train the model
    model = LogisticRegression()
    model.fit(X_train, y_train)

    # Make predictions
    predictions = model.predict(X_test)
    print(f"Predictions: {predictions}")
    print(f"Predicted Probabilities: {model.predict_proba(X_test)}")
    ```

### 2.2 K-Nearest Neighbors (KNN)

KNN is a non-parametric, instance-based learning algorithm that classifies new data points based on the majority class of their 'k' nearest neighbors in the feature space.

*   **Concept:**
    *   For a new data point, calculate its distance to all training data points (e.g., Euclidean distance).
    *   Select the 'k' data points with the smallest distances.
    *   For classification: Assign the new point to the class most frequent among its 'k' neighbors.
    *   For regression: Assign the new point the average of the target values of its 'k' neighbors.
*   **Key Parameter:** `k` (the number of neighbors). Choosing an optimal `k` is crucial.

### 2.3 Decision Trees

Decision Trees are flowchart-like structures where each internal node represents a "test" on an attribute (e.g., "is age > 30?"), each branch represents the outcome of the test, and each leaf node represents a class label (for classification) or a numerical value (for regression).

*   **Concept:**
    *   The tree is built by recursively splitting the data based on features that best separate the data into homogeneous subsets.
    *   **Splitting Criteria:**
        *   **Classification:** Gini impurity or Entropy (Information Gain) are used to measure the "purity" of a node.
        *   **Regression:** Mean Squared Error (MSE) is often used.
    *   Decision trees are prone to overfitting, which can be mitigated by pruning or limiting tree depth.

### 2.4 Support Vector Machines (SVMs)

SVMs are powerful algorithms for classification, regression, and outlier detection. They work by finding an optimal hyperplane that best separates data points into different classes in a high-dimensional space.

*   **Concept:**
    *   **Hyperplane:** A decision boundary that separates data points.
    *   **Support Vectors:** The data points closest to the hyperplane. These points are critical in defining the hyperplane and the margin.
    *   **Margin:** The distance between the hyperplane and the nearest data point from either class. SVM aims to maximize this margin.
    *   **Kernel Trick:** For non-linearly separable data, SVMs use kernel functions (e.g., RBF, polynomial) to implicitly map the data into a higher-dimensional space where it becomes linearly separable.

## 3. Fundamental Concepts

### 3.1 Model Training

The process of teaching a machine learning model to make accurate predictions or decisions. This involves:
*   **Data Preparation:** Cleaning, scaling, encoding, and splitting data into training and testing sets.
*   **Algorithm Selection:** Choosing an appropriate algorithm based on the problem type and data characteristics.
*   **Parameter Tuning:** Adjusting hyperparameters to optimize model performance (e.g., `k` in KNN, `C` in SVM).
*   **Evaluation:** Assessing the model's performance on unseen data using metrics (e.g., accuracy, precision, recall, F1-score for classification; MSE, R-squared for regression).

### 3.2 Regularization (L1 and L2)

Regularization techniques are used to prevent overfitting by adding a penalty term to the loss function during model training. This discourages overly complex models with large coefficients.

*   **L1 Regularization (Lasso Regression):**
    *   Adds a penalty proportional to the *absolute value* of the coefficients.
    *   `Loss + λ * Σ|βᵢ|`
    *   Can shrink some coefficients to exactly zero, effectively performing feature selection.
*   **L2 Regularization (Ridge Regression):**
    *   Adds a penalty proportional to the *square* of the magnitude of the coefficients.
    *   `Loss + λ * Σ(βᵢ)²`
    *   Shrinks coefficients towards zero but rarely makes them exactly zero. It's good for reducing the impact of less important features and handling multicollinearity.
*   **Elastic Net:** Combines both L1 and L2 regularization.

### 3.3 Bias-Variance Tradeoff

A central concept in machine learning describing the conflict between a model's ability to fit the training data (low bias) and its ability to generalize to new, unseen data (low variance).

*   **Bias:** The error introduced by approximating a real-world problem, which may be complex, by a simplified model. High bias leads to **underfitting** (model is too simple, misses underlying trends).
*   **Variance:** The error introduced by the model's sensitivity to small fluctuations in the training data. High variance leads to **overfitting** (model learns noise in training data, performs poorly on new data).
*   **Tradeoff:** As model complexity increases, bias generally decreases (better fit to training data) but variance increases (more sensitive to training data fluctuations). The goal is to find a balance that minimizes total error on unseen data.

## 4. Ensemble Methods

Ensemble methods combine multiple machine learning models to achieve better predictive performance than any single model could.

### 4.1 Bagging (Bootstrap Aggregating)

*   **Concept:**
    *   Trains multiple models independently on different subsets of the training data (created by bootstrapping – sampling with replacement).
    *   Aggregates their predictions: Averages for regression, majority vote for classification.
    *   Reduces variance and helps to prevent overfitting.
*   **Random Forests:**
    *   An extension of bagging using Decision Trees as base learners.
    *   Introduces an additional layer of randomness: Each tree is trained on a bootstrapped sample of data, and at each split, only a random subset of features is considered. This further decorrelates the trees, leading to better generalization.

### 4.2 Boosting

*   **Concept:**
    *   Trains models sequentially, where each new model tries to correct the errors of the previous ones.
    *   Focuses on misclassified samples or samples with large errors from previous iterations.
    *   Increases model accuracy by combining many "weak" learners into a strong learner.
*   **Gradient Boosting Machines (GBM):**
    *   A type of boosting where new models are trained to predict the residuals (errors) of previous models.
    *   It iteratively builds an ensemble of weak prediction models (typically decision trees).
    *   Uses a gradient descent approach to minimize the loss function.
*   **Advanced Gradient Boosting Machines:**
    *   **XGBoost (eXtreme Gradient Boosting):** Highly optimized, scalable, and popular implementation of GBM. Known for speed and performance, includes regularization.
    *   **LightGBM (Light Gradient Boosting Machine):** Developed by Microsoft, faster training and lower memory consumption than XGBoost, especially on large datasets. Uses a leaf-wise tree growth algorithm.
    *   **CatBoost (Categorical Boosting):** Developed by Yandex, handles categorical features automatically and effectively, reducing the need for extensive preprocessing. Known for its robustness and good default parameters.

---

## Quick Checklist/Exercise:

1.  Explain the key difference in output and application between Linear Regression and Logistic Regression.
2.  Describe how L1 and L2 regularization differ in their effect on model coefficients and their utility in feature selection.
3.  You're building a model to predict house prices (a continuous value) and notice it performs very well on training data but poorly on unseen test data. Which term from the bias-variance tradeoff best describes this situation, and what ensemble technique would you consider to mitigate it?
