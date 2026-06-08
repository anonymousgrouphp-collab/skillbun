# Deep Learning Core & Frameworks Study Guide

This guide will walk you through the foundational principles of deep learning, popular neural network architectures, and provide hands-on exposure to PyTorch, a leading deep learning framework.

## 1. Introduction to Deep Learning

Deep Learning is a subset of machine learning inspired by the structure and function of the human brain, specifically artificial neural networks. It enables computational models to learn representations of data with multiple levels of abstraction. This allows models to discover intricate structures in large datasets, which is particularly effective for tasks like image recognition, natural language processing, and speech recognition.

## 2. Fundamentals of Neural Networks

### The Neuron
The basic computational unit of a neural network, a 'perceptron' or 'node,' receives input, applies a weight to each input, sums them up, and then passes the sum through an activation function to produce an output.

### Activation Functions
Non-linear functions applied to the output of a neuron. They introduce non-linearity, allowing neural networks to learn complex patterns. Common types include:
*   **ReLU (Rectified Linear Unit):** `f(x) = max(0, x)`. Popular for its computational efficiency and mitigating vanishing gradients.
*   **Sigmoid:** `f(x) = 1 / (1 + e^(-x))`. Squashes output between 0 and 1, often used for binary classification output layers.
*   **Tanh (Hyperbolic Tangent):** `f(x) = (e^x - e^(-x)) / (e^x + e^(-x))`. Squashes output between -1 and 1.
*   **Softmax:** Used in the output layer for multi-class classification, converting raw scores into probabilities that sum to 1.

### Network Architecture
Neural networks are typically organized into layers:
*   **Input Layer:** Receives the raw data.
*   **Hidden Layers:** One or more layers that perform computations and learn features from the input.
*   **Output Layer:** Produces the final prediction or classification.

### Forward Pass
The process where input data travels through the network, from the input layer, through hidden layers, to the output layer, generating a prediction.

### Loss Functions
Measures the discrepancy between the network's predictions and the actual target values. The goal during training is to minimize this loss. Examples:
*   **Mean Squared Error (MSE):** For regression tasks.
*   **Cross-Entropy Loss (Binary/Categorical):** For classification tasks.

### Backpropagation
An algorithm used to efficiently calculate the gradients of the loss function with respect to the network's weights. It's the engine that enables neural networks to learn by iteratively adjusting weights. It works by propagating the error backwards through the network, layer by layer, starting from the output layer.

### Optimizers
Algorithms that adjust the network's weights during training to minimize the loss function, guided by the gradients calculated during backpropagation. Common optimizers include:
*   **Stochastic Gradient Descent (SGD):** Updates weights based on the gradient of a randomly chosen subset (mini-batch) of data.
*   **Adam (Adaptive Moment Estimation):** Combines the advantages of AdaGrad and RMSprop, often a good default choice.
*   **RMSprop:** Addresses vanishing/exploding gradients in RNNs.

## 3. Key Deep Learning Architectures

### Feedforward Neural Networks (FNNs / MLPs)
*   **Description:** The simplest form, where information moves in one direction (forward) from input to output. Each neuron in one layer is connected to every neuron in the next layer.
*   **Use Cases:** Simple classification and regression tasks, tabular data analysis.

### Convolutional Neural Networks (CNNs)
*   **Description:** Specialized for processing grid-like data, such as images. Key components include:
    *   **Convolutional Layers:** Apply filters (kernels) to input to detect features (edges, textures).
    *   **Pooling Layers (e.g., Max Pooling):** Downsample the feature maps, reducing dimensionality and making the model more robust to minor shifts.
    *   **Fully Connected Layers:** Typically at the end, perform classification based on the extracted features.
*   **Use Cases:** Image classification, object detection, facial recognition.

### Recurrent Neural Networks (RNNs)
*   **Description:** Designed to process sequential data by maintaining an internal state (memory) that allows them to remember information from previous steps in the sequence.
    *   **LSTMs (Long Short-Term Memory) and GRUs (Gated Recurrent Units):** Variants of RNNs that address the vanishing gradient problem, allowing them to capture long-range dependencies in sequences more effectively.
*   **Use Cases:** Natural Language Processing (NLP) tasks like language translation, speech recognition, time series prediction.

### Transformers
*   **Description:** A more recent architecture, primarily using self-attention mechanisms to weigh the importance of different parts of the input sequence. Revolutionized NLP and increasingly used in computer vision.
*   **Use Cases:** Machine translation, text generation, large language models (LLMs).

## 4. Deep Learning Frameworks: PyTorch

PyTorch is an open-source machine learning framework known for its flexibility, Pythonic interface, and dynamic computational graph. It's widely used in research and production.

### Introduction to PyTorch
*   **Tensors:** The fundamental data structure in PyTorch. Similar to NumPy arrays, but can run on GPUs for accelerated computation. `torch.tensor`.
*   **Autograd:** PyTorch's automatic differentiation engine. It records operations performed on tensors and automatically computes gradients, which is crucial for backpropagation.

### Building a Neural Network with PyTorch (`nn.Module`)
Models in PyTorch are built by inheriting from `torch.nn.Module`. You define the network's layers in the `__init__` method and specify the forward pass (how data flows through the layers) in the `forward` method.

### Training Loop Essentials
A typical PyTorch training loop involves:
1.  **Data Loading:** Using `torch.utils.data.Dataset` and `torch.utils.data.DataLoader` to efficiently load and batch data.
2.  **Model Instantiation:** Creating an instance of your `nn.Module` model.
3.  **Loss Function & Optimizer:** Defining the criterion (e.g., `nn.BCELoss`) and optimizer (e.g., `optim.Adam`).
4.  **Epoch Iteration:** Looping through the dataset multiple times (epochs).
    *   **Forward Pass:** Pass input data through the model to get predictions.
    *   **Compute Loss:** Calculate the loss between predictions and true labels.
    *   **Backward Pass:** Call `loss.backward()` to compute gradients.
    *   **Optimizer Step:** Call `optimizer.step()` to update model weights.
    *   **Zero Gradients:** Call `optimizer.zero_grad()` to clear previous gradients before the next iteration.

## 5. Practical Considerations & Best Practices
*   **Data Preparation:** Normalization/standardization of features, data augmentation (especially for images) to increase dataset size and variability.
*   **Overfitting & Regularization:**
    *   **Overfitting:** When a model learns the training data too well, performing poorly on unseen data.
    *   **Regularization:** Techniques to prevent overfitting. `Dropout` (randomly setting a fraction of neurons to zero during training) and L1/L2 regularization (adding penalties to the loss function based on weight magnitudes) are common methods.
*   **Hyperparameter Tuning:** Adjusting parameters that are not learned by the model (e.g., learning rate, batch size, number of layers, number of neurons) to optimize performance.

## Code Example: Simple PyTorch MLP for Binary Classification

```python
import torch
import torch.nn as nn
import torch.optim as optim
from sklearn.model_selection import train_test_split
from sklearn.datasets import make_classification

# 1. Generate synthetic data for binary classification
X, y = make_classification(n_samples=1000, n_features=20, n_classes=2, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Convert to PyTorch tensors
X_train_tensor = torch.tensor(X_train, dtype=torch.float32)
y_train_tensor = torch.tensor(y_train, dtype=torch.float32).unsqueeze(1) # Add a dimension for binary classification
X_test_tensor = torch.tensor(X_test, dtype=torch.float32)
y_test_tensor = torch.tensor(y_test, dtype=torch.float32).unsqueeze(1)

# 2. Define the Neural Network (Multi-Layer Perceptron)
class SimpleMLP(nn.Module):
    def __init__(self, input_size):
        super(SimpleMLP, self).__init__()
        self.layer1 = nn.Linear(input_size, 64) # Input to first hidden layer
        self.relu = nn.ReLU()
        self.layer2 = nn.Linear(64, 1)        # Hidden layer to output layer
        self.sigmoid = nn.Sigmoid()            # For binary classification output

    def forward(self, x):
        x = self.layer1(x)
        x = self.relu(x)
        x = self.layer2(x)
        x = self.sigmoid(x)
        return x

input_size = X_train.shape[1]
model = SimpleMLP(input_size)

# 3. Define Loss Function and Optimizer
criterion = nn.BCELoss() # Binary Cross-Entropy Loss for binary classification
optimizer = optim.Adam(model.parameters(), lr=0.001) # Adam optimizer with a learning rate

# 4. Training Loop
num_epochs = 100
for epoch in range(num_epochs):
    # Forward pass: Compute predicted outputs by passing inputs to the model
    outputs = model(X_train_tensor)
    loss = criterion(outputs, y_train_tensor)

    # Backward and optimize: Backpropagation and weight update
    optimizer.zero_grad() # Clear previous gradients
    loss.backward()       # Compute gradients of the loss with respect to model parameters
    optimizer.step()      # Update model parameters using the computed gradients

    if (epoch+1) % 10 == 0:
        print(f'Epoch [{epoch+1}/{num_epochs}], Loss: {loss.item():.4f}')

# 5. Evaluation (simple accuracy on test set)
model.eval() # Set the model to evaluation mode
with torch.no_grad(): # Disable gradient calculation for inference
    predicted = (model(X_test_tensor) > 0.5).float() # Threshold at 0.5 for binary output
    accuracy = (predicted == y_test_tensor).sum().item() / y_test_tensor.size(0)
    print(f'Test Accuracy: {accuracy:.4f}')
```

## Quick Check & Exercises

1.  Explain the core purpose of the backpropagation algorithm in neural network training, specifically how it contributes to learning.
2.  What is the primary difference in typical use cases between Convolutional Neural Networks (CNNs) and Recurrent Neural Networks (RNNs)? Provide one example for each.
3.  Modify the provided PyTorch `SimpleMLP` example to include an additional hidden layer with 32 neurons. Experiment with using `nn.Tanh()` as the activation function for this new layer (and potentially the existing one) and observe if the test accuracy changes.
