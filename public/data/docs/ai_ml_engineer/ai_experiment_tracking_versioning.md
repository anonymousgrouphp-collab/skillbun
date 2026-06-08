# Experiment Tracking & Versioning: A Study Guide

## Introduction
In the rapidly evolving field of Machine Learning, developing models is only part of the journey. To ensure reliability, reproducibility, and collaborative efficiency, AI/ML Engineers must master **Experiment Tracking & Versioning**. This involves meticulously recording every aspect of an ML experiment, from data and code to hyper-parameters and model outputs, and systematically managing their versions. This guide delves into the core concepts and essential tools that enable these critical practices.

## Core Concepts

### 1. Experiment Tracking
Experiment tracking is the process of recording metadata about your machine learning experiments. This includes:
*   **Parameters**: Hyper-parameters, model configurations.
*   **Metrics**: Loss, accuracy, F1-score, AUC, etc.
*   **Artifacts**: Trained models, plots, reports, feature importance files.
*   **Source Code**: The exact version of the code that produced the experiment's results.
*   **Environment**: Dependencies, library versions.

**Why is it crucial?** To compare different runs, debug issues, understand model behavior, and reproduce past results.

### 2. Data Versioning
Just like code, data changes over time. New data comes in, old data is cleaned, and features are engineered differently. Data versioning tracks these changes, allowing you to:
*   Reproduce models trained on specific datasets.
*   Roll back to previous data versions if issues arise.
*   Understand the impact of data changes on model performance.

### 3. Model Versioning
As models are trained, refined, and deployed, they undergo various iterations. Model versioning involves:
*   Storing different versions of trained models.
*   Associating models with the data, code, and parameters used to train them.
*   Managing their lifecycle from staging to production.

### 4. Reproducibility
The ultimate goal of tracking and versioning is **reproducibility**. An experiment is reproducible if someone else (or even your future self) can obtain the same results by following the same steps, using the same code, data, and environment.

## Key Tools and Technologies

### 1. MLflow
MLflow is an open-source platform for managing the end-to-end machine learning lifecycle. It has four primary components:
*   **MLflow Tracking**: Records and queries experiments (code, data, config, results).
*   **MLflow Projects**: Packages ML code in a reusable and reproducible format.
*   **MLflow Models**: Manages ML models in a standard format for various deployment tools.
*   **MLflow Model Registry**: A centralized model store for collaborative lifecycle management.

**Simple MLflow Tracking Example:**
```python
import mlflow
import mlflow.sklearn
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
import pandas as pd

# For demonstration, creating dummy data
X = pd.DataFrame({'feature1': range(100), 'feature2': [i*2 for i in range(100)]})
y = pd.Series([i + (i%10)*2 for i in range(100)])
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

with mlflow.start_run():
    n_estimators = 100
    max_depth = 10

    # Log parameters
    mlflow.log_param("n_estimators", n_estimators)
    mlflow.log_param("max_depth", max_depth)

    # Train model
    model = RandomForestRegressor(n_estimators=n_estimators, max_depth=max_depth, random_state=42)
    model.fit(X_train, y_train)
    predictions = model.predict(X_test)

    # Log metrics
    rmse = mean_squared_error(y_test, predictions, squared=False)
    mlflow.log_metric("rmse", rmse)

    # Log model
    mlflow.sklearn.log_model(model, "random_forest_model")

    print(f"Logged Random Forest model with RMSE: {rmse}")
```

### 2. DVC (Data Version Control)
DVC is an open-source tool for data science and machine learning projects that brings Git-like version control to data and models. It integrates with Git to track large files and directories by storing them in remote storage (S3, GCS, Azure Blob, etc.) and keeping small metadata files in Git.
*   **Git-like workflow**: `dvc add`, `dvc push`, `dvc pull`.
*   **Reproducibility**: Defines data pipelines and ensures all dependencies are tracked.
*   **Large file handling**: Efficiently manages large datasets and models without bloating your Git repository.

### 3. Weights & Biases (W&B)
W&B is a platform for MLOps that provides tools for experiment tracking, model optimization, dataset versioning, and collaboration. It offers a rich UI to visualize metrics, compare runs, and debug models.
*   **Experiment Dashboard**: Visualizes and compares runs, hyper-parameter sweeps.
*   **Artifacts**: Tracks datasets, models, and other files.
*   **Reports**: Share insights and findings with collaborators.

### 4. Git for Code Version Control
Git is fundamental for managing source code versions. In an ML context, it's crucial for:
*   **Tracking ML script changes**: Ensuring reproducibility by associating experiment results with specific code versions.
*   **Collaboration**: Facilitating teamwork through branching, merging, and pull requests.
*   **Branching Strategy**: Using feature branches for new models or experiments, merging to `develop` or `main` after validation.
*   **Pull Requests (PRs)**: For code review and ensuring quality before integration.

### 5. Integration with CI/CD Systems
Continuous Integration/Continuous Delivery (CI/CD) pipelines automate the testing, building, and deployment of code. In ML, this extends to:
*   **CI for ML Code**: Running unit tests, linting, and potentially basic model training/evaluation on every code commit.
*   **CD for ML Models**: Automating model retraining, validation, and deployment to production environments based on performance metrics or data drifts.
*   Tools like Jenkins, GitLab CI, GitHub Actions, or Azure DevOps can orchestrate MLflow runs, DVC data synchronization, and W&B logging as part of the pipeline.

## Checklist/Exercise

1.  **Identify the problem**: You've trained several models with different hyper-parameters, but can't remember which combination yielded the best result. How would **MLflow Tracking** help you resolve this efficiently?
2.  **Data Dependency**: Your training dataset gets updated weekly. You need to ensure that when you retrain your model, you can always link the model to the *exact version* of the dataset it was trained on. Which tool, **DVC** or **W&B Artifacts**, is best suited for this specific task and why?
3.  **Reproducibility Scenario**: A colleague needs to replicate your entire experiment, including the specific Python environment, code, and trained model. Besides **Git** for code, what other practices/tools discussed would be essential to ensure full reproducibility?