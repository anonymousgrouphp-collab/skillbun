# Neural Networks and CNN Architectures

## 1. Introduction to Neural Networks

Neural Networks (NNs) are a subset of machine learning inspired by the human brain. They are composed of interconnected nodes (neurons) organized in layers, designed to identify complex patterns in data.

### 1.1 Perceptrons: The Building Blocks

A perceptron is the simplest form of a neural network, a single neuron that takes multiple binary inputs and produces a single binary output. It computes a weighted sum of its inputs and applies an activation function.

-   **Inputs (xᵢ):** Features of the data.
-   **Weights (wᵢ):** Parameters that determine the importance of each input.
-   **Bias (b):** An offset that allows the activation function to be shifted.
-   **Weighted Sum (z):** `z = Σ(xᵢ * wᵢ) + b`
-   **Output (y):** `y = activation(z)`

### 1.2 Activation Functions

Activation functions introduce non-linearity into the network, enabling it to learn complex patterns. Without them, a neural network would simply be a linear regression model.

-   **Sigmoid:** `f(x) = 1 / (1 + e⁻ˣ)`. Outputs values between 0 and 1. Good for binary classification output layers.
-   **Tanh (Hyperbolic Tangent):** `f(x) = (eˣ - e⁻ˣ) / (eˣ + e⁻ˣ)`. Outputs values between -1 and 1. Often performs better than Sigmoid in hidden layers.
-   **ReLU (Rectified Linear Unit):** `f(x) = max(0, x)`. Simple, computationally efficient, and helps mitigate vanishing gradient problems. Most common choice for hidden layers.
-   **Leaky ReLU:** `f(x) = max(0.01x, x)`. Addresses the "dying ReLU" problem by allowing a small, non-zero gradient when x < 0.
-   **Softmax:** `f(xᵢ) = eˣᵢ / Σ(eˣⱼ)`. Converts a vector of numbers into a probability distribution, where the sum of probabilities is 1. Ideal for multi-class classification output layers.

### 1.3 Loss Functions

A loss function (or cost function) quantifies the discrepancy between the predicted output of the network and the actual target values. The goal during training is to minimize this loss.

-   **Mean Squared Error (MSE):** `MSE = (1/N) * Σ(yᵢ - ŷᵢ)²`. Commonly used for regression tasks.
-   **Cross-Entropy Loss (Log Loss):**
    -   **Binary Cross-Entropy:** Used for binary classification. `Loss = - [y log(ŷ) + (1-y) log(1-ŷ)]`.
    -   **Categorical Cross-Entropy:** Used for multi-class classification when target labels are one-hot encoded.
    -   **Sparse Categorical Cross-Entropy:** Used for multi-class classification when target labels are integers.

### 1.4 Forward Propagation

Forward propagation is the process of feeding input data through the neural network to generate an output prediction. Data moves from the input layer, through hidden layers, to the output layer, with each neuron performing its weighted sum and activation.

### 1.5 Backpropagation

Backpropagation is the algorithm used to efficiently train neural networks by calculating the gradient of the loss function with respect to the network's weights. It works by:
1.  **Forward Pass:** Compute the output and the loss.
2.  **Backward Pass:** Propagate the error backward through the network, layer by layer, calculating how much each weight contributed to the error.
3.  **Weight Update:** Use an optimization algorithm (e.g., Gradient Descent) to adjust the weights in the direction that minimizes the loss.

## 2. Convolutional Neural Networks (CNNs)

Convolutional Neural Networks (CNNs) are a specialized type of neural network primarily designed for processing data with a grid-like topology, such as images. They excel at learning hierarchical features directly from raw pixel data.

### Key Components:

-   **Convolutional Layers:** Apply learnable filters (kernels) to input features, creating feature maps that highlight specific patterns (edges, textures, etc.).
-   **Pooling Layers (e.g., Max Pooling, Average Pooling):** Downsample feature maps, reducing spatial dimensions and computational load while retaining important information and achieving translational invariance.
-   **Fully Connected Layers:** Traditional neural network layers that interpret the high-level features learned by the convolutional and pooling layers to make final predictions.

## 3. Key CNN Architectures

Understanding the evolution of CNN architectures reveals key innovations that led to breakthroughs in computer vision.

### 3.1 LeNet-5 (1998)

-   **Contribution:** One of the earliest successful CNNs, pioneering convolutional layers, pooling (subsampling), and fully connected layers for handwritten digit recognition.
-   **Key Idea:** Hierarchical feature extraction with local receptive fields and shared weights.
-   **Structure:** Two convolutional layers, two pooling layers, and three fully connected layers.

### 3.2 AlexNet (2012)

-   **Contribution:** Won the ImageNet Large Scale Visual Recognition Challenge (ILSVRC) 2012, significantly outperforming traditional methods and kickstarting the deep learning era.
-   **Key Idea:** Deeper network, ReLU activation (faster training), dropout (regularization), data augmentation, and GPU parallelization.
-   **Structure:** Five convolutional layers (some followed by max-pooling), three fully connected layers.

### 3.3 VGG (Visual Geometry Group) (2014)

-   **Contribution:** Explored the effect of network depth on accuracy, demonstrating that deeper networks with very small (3x3) convolutional filters could achieve state-of-the-art results.
-   **Key Idea:** Simplicity and uniformity in architecture, using only 3x3 convolutional filters stacked multiple times. Increased depth by adding more layers.
-   **Structure:** Configurations like VGG16 and VGG19 (16 and 19 weight layers, respectively), consisting of stacks of 3x3 conv layers followed by max-pooling, then fully connected layers.

### 3.4 ResNet (Residual Networks) (2015)

-   **Contribution:** Won ILSVRC 2015, introducing "residual blocks" to train extremely deep networks (up to 1000+ layers) without performance degradation (vanishing/exploding gradients).
-   **Key Idea:** **Skip connections (or shortcut connections)** that allow gradients to flow directly through the network, enabling the learning of "residual mappings" instead of direct mappings.
-   **Structure:** Composed of multiple residual blocks, each containing convolutional layers and a shortcut connection that bypasses these layers.

### 3.5 Inception (GoogLeNet) (2014)

-   **Contribution:** Won ILSVRC 2014. Introduced the "Inception module" to efficiently capture features at multiple scales.
-   **Key Idea:** Process input through multiple convolutional filter sizes (1x1, 3x3, 5x5) and pooling operations *in parallel* within the same module, then concatenate their outputs. Uses 1x1 convolutions for dimension reduction to manage computational cost.
-   **Structure:** Stacked Inception modules, often featuring auxiliary classifiers for regularization during training.

## 4. Simple Code Example (Keras/TensorFlow)

Here's a basic example of defining a simple feedforward neural network and a convolutional layer using Keras:

```python
from tensorflow.keras import Sequential
from tensorflow.keras.layers import Dense, Conv2D, Flatten, MaxPooling2D

# --- Simple Feedforward Neural Network ---
# This network could be used for tabular data or flattened image data
model_ffnn = Sequential([
    Dense(64, activation='relu', input_shape=(784,)), # Input layer + 1st hidden layer
    Dense(32, activation='relu'),                     # 2nd hidden layer
    Dense(10, activation='softmax')                   # Output layer for 10 classes
])
model_ffnn.summary()

# --- Simple Convolutional Layer Example ---
# This demonstrates a single Conv2D layer followed by pooling
model_cnn_part = Sequential([
    Conv2D(32, (3, 3), activation='relu', input_shape=(64, 64, 3)), # 32 filters, 3x3 kernel, RGB image input
    MaxPooling2D((2, 2)),                                           # Reduce spatial dimensions by 2
    Flatten(),                                                      # Flatten for a fully connected layer
    Dense(10, activation='softmax')                                 # Example output layer
])
model_cnn_part.summary()
```

## 5. Checklist / Exercises

1.  Explain the primary purpose of an activation function in a neural network and name two common types.
2.  Describe the key innovation introduced by ResNet that allowed for the training of much deeper networks.
3.  How does an Inception module (as used in GoogLeNet) differ from a traditional sequence of convolutional layers, and what problem does it aim to solve?