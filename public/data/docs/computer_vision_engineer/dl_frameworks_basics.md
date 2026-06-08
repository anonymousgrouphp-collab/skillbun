# Deep Learning Frameworks: PyTorch & TensorFlow

Deep learning frameworks are essential tools for building, training, and deploying neural networks. PyTorch and TensorFlow are two of the most popular, offering robust ecosystems for research and production. This guide covers fundamental operations common to both frameworks, focusing on PyTorch for practical code examples to illustrate concepts clearly.

## 1. Data Loading with Custom Datasets and DataLoaders

Efficient data handling is crucial. Frameworks provide utilities to load and preprocess data, batch it, and manage it for training.

*   **Custom Datasets:** You often need to handle data that doesn't fit standard formats. Custom datasets abstract the data source, providing an interface to access individual samples.
    *   In **PyTorch**, you typically subclass `torch.utils.data.Dataset` and implement `__len__` (returns dataset size) and `__getitem__` (returns the i-th sample).
*   **DataLoaders:** DataLoaders wrap Datasets and provide an iterable over the dataset, handling batching, shuffling, and multi-process data loading.

**PyTorch Example: Custom Dataset & DataLoader**

```python
import torch
from torch.utils.data import Dataset, DataLoader

# 1. Define a Custom Dataset
class CustomTensorDataset(Dataset):
    def __init__(self, data, labels):
        self.data = data
        self.labels = labels

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        sample = self.data[idx]
        label = self.labels[idx]
        return sample, label

# Create some dummy data
dummy_data = torch.randn(100, 10) # 100 samples, 10 features
dummy_labels = torch.randint(0, 2, (100,)) # 100 labels, 0 or 1

# Instantiate the custom dataset
my_dataset = CustomTensorDataset(dummy_data, dummy_labels)

# 2. Create a DataLoader
# batch_size: number of samples per batch
# shuffle: True for training, False for validation/testing
# num_workers: how many subprocesses to use for data loading
my_dataloader = DataLoader(my_dataset, batch_size=32, shuffle=True, num_workers=0)

# Example of iterating through the DataLoader (uncomment to run):
# for batch_idx, (data, labels) in enumerate(my_dataloader):
#     print(f"Batch {batch_idx}: Data shape {data.shape}, Labels shape {labels.shape}")
#     break # Just show the first batch
```

## 2. Model Definition

Defining the neural network architecture is a core task.

*   In **PyTorch**, you typically subclass `torch.nn.Module` and define layers in `__init__` and the forward pass logic in the `forward` method.
*   In **TensorFlow/Keras**, you can use `tf.keras.Sequential` for simple stacked layers or subclass `tf.keras.Model` for more complex architectures.

**PyTorch Example: Simple Model Definition**

```python
import torch.nn as nn
import torch.nn.functional as F

class SimpleMLP(nn.Module):
    def __init__(self, input_size, num_classes):
        super(SimpleMLP, self).__init__()
        self.fc1 = nn.Linear(input_size, 128)
        self.relu = nn.ReLU()
        self.fc2 = nn.Linear(128, num_classes)

    def forward(self, x):
        x = self.fc1(x)
        x = self.relu(x)
        x = self.fc2(x)
        return x

# Instantiate the model
input_dim = 10 # Matches our dummy_data features
output_dim = 2 # Matches our dummy_labels classes
model = SimpleMLP(input_dim, output_dim)
# print(model) # Uncomment to view model architecture
```

## 3. Building Training Loops

The training loop orchestrates the learning process. It involves iterating over batches, making predictions, calculating loss, computing gradients, and updating model weights.

**Key Steps:**
1.  **Forward Pass:** Feed input data through the model to get predictions.
2.  **Loss Calculation:** Compare predictions with true labels using a loss function (e.g., `CrossEntropyLoss`, `MSELoss`).
3.  **Backward Pass (Gradient Computation):** Calculate gradients of the loss with respect to model parameters using backpropagation.
4.  **Optimizer Step:** Update model parameters using an optimizer (e.g., SGD, Adam) based on the computed gradients.
5.  **Zero Grads:** Clear gradients after each optimization step to prevent accumulation.

**PyTorch Example: Basic Training Loop Structure**

```python
import torch.optim as optim

# Assume model, my_dataloader are defined as above
# Assume a loss function (CrossEntropyLoss for classification)
criterion = nn.CrossEntropyLoss()
# Assume an optimizer (Adam is a good general-purpose choice)
optimizer = optim.Adam(model.parameters(), lr=0.001)

num_epochs = 5

for epoch in range(num_epochs):
    model.train() # Set model to training mode
    for batch_idx, (data, labels) in enumerate(my_dataloader):
        # 1. Zero gradients
        optimizer.zero_grad()

        # 2. Forward pass
        outputs = model(data)

        # 3. Calculate loss
        loss = criterion(outputs, labels)

        # 4. Backward pass
        loss.backward()

        # 5. Optimizer step
        optimizer.step()

    # print(f"Epoch [{epoch+1}/{num_epochs}], Loss: {loss.item():.4f}") # Uncomment to print loss per epoch
```

## 4. Managing Device Allocation (CPU/GPU)

Leveraging hardware accelerators like GPUs is critical for deep learning performance.

*   **Check Availability:** Detect if a GPU (CUDA for NVIDIA, MPS for Apple Silicon) is available.
*   **Move Data & Model:** Transfer your model and data to the appropriate device (CPU or GPU).

**PyTorch Example: Device Allocation**

```python
# Check for GPU
if torch.cuda.is_available():
    device = torch.device("cuda")
    # print("Using GPU: CUDA")
elif torch.backends.mps.is_available(): # For Apple Silicon Macs
    device = torch.device("mps")
    # print("Using GPU: MPS")
else:
    device = torch.device("cpu")
    # print("Using CPU")

# Move model to device
model.to(device)

# In the training loop, move data and labels to device:
# for batch_idx, (data, labels) in enumerate(my_dataloader):
#     data = data.to(device)
#     labels = labels.to(device)
#     # ... rest of the training loop ...
```

## 5. Basic Model Saving and Loading

Saving trained models allows you to reuse them without retraining and deploy them for inference.

*   In **PyTorch**, the recommended way to save a model is to save its `state_dict` (parameters and buffers). You can also save the entire model.
*   In **TensorFlow/Keras**, you can save the entire model (architecture, weights, optimizer state) using `model.save()`.

**PyTorch Example: Saving and Loading a Model**

```python
# Save the model's state_dict
PATH = "simple_mlp_model.pth"
torch.save(model.state_dict(), PATH)
# print(f"Model saved to {PATH}")

# Load the model
loaded_model = SimpleMLP(input_dim, output_dim) # Re-instantiate the model with the same architecture
loaded_model.load_state_dict(torch.load(PATH))
loaded_model.eval() # Set to evaluation mode for inference
# print("Model loaded successfully.")
```

## Quick Checklist/Exercise

1.  **Data Preparation:** Create a `CustomTensorDataset` with 500 samples, 20 features, and 5 classes. Then, create a `DataLoader` for it with a batch size of 64.
2.  **Model Adaptation:** Modify the `SimpleMLP` model to accept the new input size (20 features) and output the correct number of classes (5).
3.  **GPU Utilization:** Integrate device allocation logic into a minimal training loop, ensuring both your model and your data batches are moved to the available GPU (or CPU if no GPU) before processing.