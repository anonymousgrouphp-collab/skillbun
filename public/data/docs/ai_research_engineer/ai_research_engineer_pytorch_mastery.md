# PyTorch Mastery: A Comprehensive Study Guide

PyTorch has emerged as a dominant framework for deep learning research and development due to its flexibility, Pythonic nature, and dynamic computational graph. This guide will take you through the fundamental concepts of PyTorch, from tensors to building and training neural networks, enabling you to become proficient in its usage.

## 1. PyTorch Tensors

Tensors are the fundamental data structure in PyTorch, analogous to NumPy arrays but with the added capability to run on GPUs and track gradients for automatic differentiation.

### Core Concepts:
-   **Creation:** Tensors can be created from Python lists, NumPy arrays, or using built-in PyTorch functions (`torch.ones()`, `torch.zeros()`, `torch.rand()`).
-   **Data Types:** Supports various data types like `torch.float32` (default), `torch.int64`, `torch.bool`, etc.
-   **Operations:** Tensors support a wide range of mathematical operations (addition, multiplication, matrix multiplication, indexing, slicing) that can be performed on CPU or GPU.
-   **Device Placement:** Tensors can be seamlessly moved between CPU and GPU using `.to('cuda')` (for GPU) or `.to('cpu')` (for CPU).

### Example:
```python
import torch

# Create a tensor from a Python list
data = [[1, 2], [3, 4]]
x_data = torch.tensor(data)
print(f"Tensor from list:\n{x_data}")

# Create a tensor of ones with specific shape
ones = torch.ones(2, 2)
print(f"Tensor of ones:\n{ones}")

# Perform basic operations
y_data = torch.tensor([[5, 6], [7, 8]])
z_add = x_data + y_data # Element-wise addition
print(f"Addition:\n{z_add}")

# Matrix multiplication
z_mul = x_data.matmul(y_data)
print(f"Matrix Multiplication:\n{z_mul}")

# Move to GPU if available
if torch.cuda.is_available():
    x_data_gpu = x_data.to('cuda')
    print(f"Tensor on GPU:\n{x_data_gpu.device}")
```

## 2. Autograd: Automatic Differentiation

PyTorch's `autograd` engine automatically computes gradients for all operations on tensors with `requires_grad=True`. This is the cornerstone of training neural networks through backpropagation.

### Core Concepts:
-   `requires_grad`: A boolean flag on a tensor. If `True`, PyTorch tracks all operations on this tensor for gradient computation.
-   `backward()`: Called on a scalar tensor (usually the loss), this computes the gradients of that scalar with respect to all tensors in the computation graph that `requires_grad=True`.
-   `.grad`: After `backward()` is called, this attribute of a tensor that `requires_grad=True` holds the gradients.
-   `with torch.no_grad()`: A context manager that temporarily disables gradient tracking. This is useful during evaluation or inference to save memory and computations, as gradients are not needed.

### Example:
```python
import torch

# Create tensors with requires_grad=True to track operations
x = torch.tensor([2.0], requires_grad=True)
y = torch.tensor([3.0], requires_grad=True)

# Define a simple operation: z = x^2 + y^3
z = x**2 + y**3  # z = 2^2 + 3^3 = 4 + 27 = 31

# Compute gradients of z with respect to x and y
z.backward() # This will populate x.grad and y.grad

# Access the computed gradients
# dz/dx = 2x = 2*2 = 4
# dz/dy = 3y^2 = 3*3^2 = 27
print(f"Gradient of z with respect to x (dz/dx): {x.grad}")
print(f"Gradient of z with respect to y (dz/dy): {y.grad}")

# Operations within no_grad() context won't track gradients
with torch.no_grad():
    a = torch.tensor([1.0], requires_grad=True)
    b = a * 2
    print(f"'b.requires_grad' within no_grad(): {b.requires_grad}")
```

## 3. Building Neural Networks with `nn.Module`

The `torch.nn` module provides a powerful and convenient way to define and manage neural network architectures. The `nn.Module` class is the base class for all neural network modules (layers, custom networks).

### Core Concepts:
-   **Inheritance:** Your custom neural network class must inherit from `torch.nn.Module`.
-   `__init__()`: In the constructor, define the layers and components of your network (e.g., `nn.Linear`, `nn.Conv2d`, `nn.ReLU`, `nn.MaxPool2d`). Always call `super().__init__()`.
-   `forward(x)`: This method defines the forward pass of the network. It specifies how input data `x` flows through the layers defined in `__init__` to produce an output.
-   **Parameters:** All `nn.Module` subclasses automatically track parameters (weights and biases) defined within them, making them accessible via `model.parameters()` for optimizers.

### Example:
```python
import torch
import torch.nn as nn
import torch.nn.functional as F # Functional API for activation functions

class SimpleNN(nn.Module):
    def __init__(self):
        super(SimpleNN, self).__init__()
        # Define layers
        self.fc1 = nn.Linear(10, 5) # Input features = 10, Output features = 5
        self.fc2 = nn.Linear(5, 1)  # Input features = 5, Output features = 1 (e.g., for binary classification)

    def forward(self, x):
        # Define the forward pass logic
        x = self.fc1(x)
        x = F.relu(x) # Apply ReLU activation function
        x = self.fc2(x)
        return x

# Instantiate the model
model = SimpleNN()
print("\n--- Model Architecture ---")
print(model)

# Test with a dummy input tensor (e.g., a batch of 1 sample with 10 features)
dummy_input = torch.randn(1, 10)
output = model(dummy_input)
print(f"\nOutput shape for dummy input (1, 10): {output.shape}") # Expected output shape: (1, 1)
```

## 4. Custom Datasets and DataLoaders

For efficient and organized training of deep learning models, data needs to be structured, retrieved, and batched efficiently. PyTorch provides `Dataset` and `DataLoader` for this purpose.

### Core Concepts:
-   `torch.utils.data.Dataset`: An abstract class representing a dataset. Custom datasets must inherit from this class and override two methods:
    -   `__len__(self)`: Returns the total number of samples in the dataset.
    -   `__getitem__(self, idx)`: Returns a single sample (e.g., `(input, label)`) from the dataset at the given index `idx`.
-   `torch.utils.data.DataLoader`: Wraps an iterable `Dataset` to provide an iterator over the dataset. It handles batching, shuffling, multi-process data loading, and custom collating.

### Example:
```python
import torch
from torch.utils.data import Dataset, DataLoader

# Create a simple custom dataset for demonstration
class CustomTensorDataset(Dataset):
    def __init__(self, data, labels):
        self.data = data
        self.labels = labels

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        return self.data[idx], self.labels[idx]

# Generate some dummy data and labels
data_samples = torch.randn(100, 5) # 100 samples, 5 features each
labels_samples = torch.randint(0, 2, (100,)) # 100 binary labels (0 or 1)

# Instantiate the custom dataset
dataset = CustomTensorDataset(data_samples, labels_samples)

# Instantiate the DataLoader
# batch_size: Number of samples per batch
# shuffle: True to shuffle data at each epoch
# num_workers: Number of subprocesses to use for data loading (0 means main process)
dataloader = DataLoader(dataset, batch_size=10, shuffle=True, num_workers=0)

print("\n--- Iterating through DataLoader batches ---")
# Iterate through batches of data
for batch_idx, (batch_data, batch_labels) in enumerate(dataloader):
    print(f"Batch {batch_idx+1}: Data shape {batch_data.shape}, Labels shape {batch_labels.shape}")
    if batch_idx == 2: # Show first 3 batches
        break
```

## 5. Optimizers

Optimizers play a critical role in the training process by adjusting the model's parameters (weights and biases) iteratively to minimize the loss function. PyTorch's `torch.optim` module provides a collection of popular optimization algorithms.

### Core Concepts:
-   `torch.optim`: Contains various optimization algorithms such as `SGD` (Stochastic Gradient Descent), `Adam`, `RMSprop`, `Adagrad`, etc.
-   **Initialization:** An optimizer is initialized by passing it the model's parameters (typically obtained via `model.parameters()`) and specific hyperparameters like the learning rate (`lr`).
-   `optimizer.zero_grad()`: Before computing gradients in each training step, it's crucial to clear the gradients of all optimized `torch.Tensor`s. PyTorch accumulates gradients by default.
-   `loss.backward()`: Computes the gradients of the current loss with respect to all parameters that `requires_grad=True`.
-   `optimizer.step()`: Performs a single optimization step, updating the model's parameters based on the computed gradients and the chosen optimization algorithm.

### Example:
```python
import torch
import torch.nn as nn
import torch.optim as optim

# Define a simple neural network (reusing the SimpleNN from earlier)
class SimpleNN(nn.Module):
    def __init__(self):
        super(SimpleNN, self).__init__()
        self.fc1 = nn.Linear(10, 5)
        self.relu = nn.ReLU()
        self.fc2 = nn.Linear(5, 1)

    def forward(self, x):
        x = self.fc1(x)
        x = self.relu(x)
        x = self.fc2(x)
        return x

model = SimpleNN()

# Define a Loss Function (e.g., Mean Squared Error Loss for regression)
criterion = nn.MSELoss()

# Define an Optimizer (e.g., Adam optimizer with a learning rate of 0.01)
optimizer = optim.Adam(model.parameters(), lr=0.01)

# Dummy data for a single training step
inputs = torch.randn(1, 10) # One sample, 10 features
targets = torch.randn(1, 1) # One target value

print("\n--- Performing one training step ---")
# --- Training Step ---:
optimizer.zero_grad()       # 1. Clear existing gradients (important!)
outputs = model(inputs)     # 2. Perform a forward pass to get predictions
loss = criterion(outputs, targets) # 3. Compute the loss
loss.backward()             # 4. Compute gradients of loss with respect to model parameters
optimizer.step()            # 5. Update model parameters using the optimizer

print(f"Loss after one optimization step: {loss.item():.4f}")
```

## Checklist / Exercises:

1.  **Tensor Manipulation:** Create a 4x4 PyTorch tensor named `A` with random integer values between 0 and 10. Extract the elements from the first two rows and last two columns into a new tensor `B`. Compute the element-wise square root of `B` and print both `A` and `B`.
2.  **Autograd Application:** Define three tensors: `p = torch.tensor([1.0], requires_grad=True)`, `q = torch.tensor([2.0], requires_grad=True)`, and `r = torch.tensor([3.0], requires_grad=True)`. Calculate `s = p * q + r**2` and then `t = s.log()`. Call `t.backward()` and print `p.grad`, `q.grad`, and `r.grad`.
3.  **Basic NN Structure:** Implement a neural network using `nn.Module` that takes an input of size 128, has two hidden layers. The first hidden layer should have 64 neurons (using ReLU activation), the second hidden layer should have 32 neurons (using Tanh activation), and the output layer should have 5 neurons. Instantiate the model and print its structure and the total number of trainable parameters.