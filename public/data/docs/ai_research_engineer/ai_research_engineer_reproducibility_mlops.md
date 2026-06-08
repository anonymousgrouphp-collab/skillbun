# Reproducibility & Research MLOps

## Introduction
Reproducibility in Machine Learning (ML) research refers to the ability to obtain consistent results using the same data, code, and computational environment. It's a cornerstone of scientific integrity, allowing others (and your future self!) to verify findings, build upon existing work, debug issues, and ensure models can be reliably deployed. Research MLOps extends this by integrating best practices into the entire ML lifecycle, ensuring that research outputs are not just theoretical but also operational and maintainable.

## Core Concepts

### 1. Code and Environment Management

#### 1.1 Version Control with Git
*   **Purpose:** Track changes to your codebase, collaborate effectively, and revert to previous states.
*   **Best Practices:**
    *   Commit small, logical changes with descriptive messages.
    *   Use branches for features, experiments, or bug fixes.
    *   Tag stable versions (e.g., `v1.0.0`) of your code alongside trained models.
    *   Store `requirements.txt` or `environment.yml` in your repository.

#### 1.2 Dependency Management
Ensuring that all required libraries and their specific versions are identical across different environments is crucial.
*   **Tools:**
    *   **`pip` & `requirements.txt`:** For Python packages, `pip freeze > requirements.txt` and `pip install -r requirements.txt`.
    *   **Conda & `environment.yml`:** For more complex environments, including non-Python dependencies: `conda env export > environment.yml` and `conda env create -f environment.yml`.
    *   **Poetry/Rye:** More advanced tools for dependency resolution and package management.

#### 1.3 Containerization with Docker
*   **Purpose:** Package your application with all its dependencies into a standardized unit for development, testing, and deployment. Docker images guarantee that your code runs in an identical environment every time, regardless of the host system.
*   **Key Idea:** Define your environment in a `Dockerfile`, build an image, and run containers from it. This isolates your ML experiments from system-level variations.

### 2. Data Versioning with DVC (Data Version Control)
*   **Challenge:** Large datasets are often not stored directly in Git repositories due to their size. Changes to data are also critical to track, as different experiments might use different versions of the dataset.
*   **Solution:** DVC works alongside Git to version large files and directories. It stores metadata about your data (like checksums) in Git, while the actual data resides in remote storage (S3, GCS, local, etc.).
*   **Benefits:**
    *   Tracks data changes over time.
    *   Enables specific dataset versions to be checked out with specific code versions.
    *   Facilitates reproducibility by ensuring consistent data inputs.

### 3. Experiment Tracking Platforms

These platforms provide a centralized system to log, visualize, and compare ML experiments, making it easy to see which model performed best with which parameters and data.

#### 3.1 Weights & Biases (W&B)
*   **Purpose:** A comprehensive platform for experiment tracking, model optimization, and dataset versioning.
*   **Key Features:**
    *   Logs hyperparameters, metrics, gradients, and media (images, videos).
    *   Visualizes performance over training runs.
    *   Artifacts management for models, datasets, and other files.
    *   Sweeps for hyperparameter optimization.

#### 3.2 MLflow
*   **Purpose:** An open-source platform for managing the end-to-end machine learning lifecycle.
*   **Key Components:**
    *   **MLflow Tracking:** Records and queries experiments: code, data, config, and results.
    *   **MLflow Projects:** Packages ML code in a reusable and reproducible format.
    *   **MLflow Models:** Manages and deploys ML models from various libraries.
    *   **MLflow Model Registry:** Central repository for collaborative model management.

## Practical Example: Tracking an Experiment with W&B

Let's consider a simple training script for a deep learning model. We can integrate W&B to track its performance.

```python
import wandb
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset

# 1. Initialize W&B run
wandb.init(project="mnist-repro-example", config={
    "learning_rate": 0.01,
    "epochs": 10,
    "batch_size": 32,
    "optimizer": "Adam"
})
config = wandb.config

# Dummy data for demonstration
X_train = torch.randn(1000, 784)
y_train = torch.randint(0, 10, (1000,))
X_test = torch.randn(200, 784)
y_test = torch.randint(0, 10, (200,))

train_dataset = TensorDataset(X_train, y_train)
train_loader = DataLoader(train_dataset, batch_size=config.batch_size, shuffle=True)

# Define a simple model
class SimpleNN(nn.Module):
    def __init__(self):
        super(SimpleNN, self).__init__()
        self.fc1 = nn.Linear(784, 128)
        self.relu = nn.ReLU()
        self.fc2 = nn.Linear(128, 10)

    def forward(self, x):
        return self.fc2(self.relu(self.fc1(x)))

model = SimpleNN()
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=config.learning_rate)

# 2. Training loop with W&B logging
for epoch in range(config.epochs):
    model.train()
    running_loss = 0.0
    for inputs, labels in train_loader:
        optimizer.zero_grad()
        outputs = model(inputs)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()
        running_loss += loss.item()

    avg_loss = running_loss / len(train_loader)
    print(f"Epoch {epoch+1}, Loss: {avg_loss:.4f}")

    # Log metrics to W&B
    wandb.log({"epoch": epoch + 1, "loss": avg_loss})

# 3. Save model as W&B artifact
artifact = wandb.Artifact("model", type="model")
torch.save(model.state_dict(), "model.pth")
artifact.add_file("model.pth")
wandb.log_artifact(artifact)

wandb.finish()
```

This snippet demonstrates how W&B `wandb.init()` captures configuration, `wandb.log()` tracks metrics during training, and `wandb.Artifact()` helps version and store the trained model.

## Quick Checklist/Exercise

1.  **Environment Check:** You've developed an ML model on your local machine. How would you ensure a colleague can run your code with the exact same dependencies without manually installing each package? (Hint: think about a specific file type and command).
2.  **Data Consistency:** You've trained a model using a dataset `data_v1.csv`. A month later, the data team provides an updated `data_v2.csv`. How would you ensure that if you re-run your old `data_v1.csv` experiment, you use the correct dataset version, and how would you track the new dataset version for future experiments?
3.  **Experiment Comparison:** You've run five different experiments, each with slightly different hyperparameters. What kind of platform would you use to easily compare the accuracy and loss curves of all five runs side-by-side without manually collating results from log files?