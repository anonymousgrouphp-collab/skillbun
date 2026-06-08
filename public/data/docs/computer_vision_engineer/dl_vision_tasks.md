# Deep Learning for Core Computer Vision Tasks

Welcome to the study guide for Deep Learning in Computer Vision! This topic is crucial for anyone looking to build robust and intelligent visual systems. We'll explore how modern deep learning models tackle fundamental computer vision problems like classifying images, detecting objects, and understanding scenes at a pixel level.

## 1. Foundations of Deep Learning in Computer Vision

Deep learning, particularly Convolutional Neural Networks (CNNs), has revolutionized computer vision by automatically learning hierarchical features directly from data, surpassing traditional handcrafted features.

### 1.1. Convolutional Neural Networks (CNNs)

CNNs are the workhorse of modern computer vision. They are designed to process pixel data by using a series of convolutional layers, pooling layers, and fully connected layers.

*   **Convolutional Layer**: Applies filters (kernels) to input images to detect specific features like edges, textures, or patterns. Each filter produces a feature map.
*   **Activation Function (ReLU)**: Introduces non-linearity to the model, allowing it to learn more complex patterns.
*   **Pooling Layer (Max Pooling)**: Reduces the spatial dimensions of the feature maps, thereby decreasing the number of parameters and computations in the network, and helping to achieve spatial invariance.
*   **Fully Connected Layer**: Traditional neural network layers that interpret the high-level features learned by the convolutional layers for tasks like classification.

### 1.2. Transfer Learning

Instead of training deep models from scratch, which requires vast amounts of data and computational power, transfer learning involves using pre-trained models (trained on large datasets like ImageNet) as a starting point. This is highly effective for computer vision tasks, especially when dealing with limited datasets.

*   **Feature Extraction**: Using a pre-trained CNN as a fixed feature extractor by removing its last classification layer and using the output of the previous layer as input to a new classifier.
*   **Fine-tuning**: Unfreezing some of the top layers of a pre-trained model and re-training them along with the new classification layers on the new dataset, often with a very low learning rate.

## 2. Image Classification

Image classification is the task of assigning a single class label to an entire image from a predefined set of categories.

### 2.1. Concept

Given an input image, the model outputs a probability distribution over the possible classes. For example, classifying an image as `cat`, `dog`, or `bird`.

### 2.2. Key Architectures

*   **VGG**: Known for its simplicity, using 3x3 convolutional layers stacked together.
*   **ResNet (Residual Networks)**: Introduces skip connections (residual connections) to allow gradients to flow more easily through very deep networks, mitigating the vanishing gradient problem.
*   **Inception (GoogleNet)**: Uses inception modules that perform convolutions with multiple filter sizes (1x1, 3x3, 5x5) and max pooling in parallel, concatenating their results.

### 2.3. Training

*   **Loss Function**: Categorical Cross-Entropy (for multi-class classification) measures the difference between predicted and true probability distributions.
*   **Optimizer**: Algorithms like Adam or SGD update model weights to minimize the loss function.

#### Simple Keras Code Example for Image Classification Architecture:

```python
import tensorflow as tf
from tensorflow.keras import layers, models

# Define a simple Convolutional Neural Network (CNN)
model = models.Sequential([
    layers.Conv2D(32, (3, 3), activation='relu', input_shape=(32, 32, 3)),
    layers.MaxPooling2D((2, 2)),
    layers.Conv2D(64, (3, 3), activation='relu'),
    layers.MaxPooling2D((2, 2)),
    layers.Conv2D(64, (3, 3), activation='relu'),
    layers.Flatten(),
    layers.Dense(64, activation='relu'),
    layers.Dense(10, activation='softmax') # Output layer for 10 classes
])

# Compile the model
model.compile(optimizer='adam',
              loss='sparse_categorical_crossentropy', # Use if labels are integers
              metrics=['accuracy'])

# Display model summary
model.summary()

# This snippet defines the architecture and compilation. 
# Training would involve model.fit(x_train, y_train, epochs=...). 
```

## 3. Object Detection

Object detection involves not only classifying objects within an image but also localizing them by drawing bounding boxes around each instance.

### 3.1. Concept

The model outputs bounding box coordinates (e.g., `[x_min, y_min, x_max, y_max]`) and a class label for each detected object.

### 3.2. Architectures

Object detection models generally fall into two categories:

*   **Two-Stage Detectors (e.g., Faster R-CNN)**:
    1.  **Region Proposal Network (RPN)**: Proposes potential object regions (Regions of Interest or RoIs).
    2.  **Classifier/Regressor**: Classifies each RoI and refines its bounding box.
    *   *Pros*: High accuracy.
    *   *Cons*: Slower inference speed.

*   **One-Stage Detectors (e.g., YOLO - You Only Look Once, SSD - Single Shot Detector)**:
    *   Directly predict bounding boxes and class probabilities in a single pass over the image.
    *   *Pros*: Much faster inference, suitable for real-time applications.
    *   *Cons*: Historically less accurate than two-stage detectors, though the gap is closing.

### 3.3. Key Components

*   **Anchor Boxes**: Predefined bounding box shapes and sizes at different scales and aspect ratios that help the model predict object locations more effectively.
*   **Non-Maximum Suppression (NMS)**: An algorithm used to eliminate redundant overlapping bounding boxes, ensuring only the most confident detection for each object remains.

### 3.4. Metrics

*   **Mean Average Precision (mAP)**: The standard metric for object detection, which averages precision values across different Intersection over Union (IoU) thresholds and object classes.

## 4. Image Segmentation

Image segmentation takes object localization a step further by classifying each pixel in an image, providing a much more granular understanding of the scene.

### 4.1. Semantic Segmentation

*   **Concept**: Classifies every pixel in an image into a predefined category (e.g., `road`, `car`, `person`, `sky`). All instances of the same class are treated as a single entity.
*   **Architectures**:
    *   **Fully Convolutional Networks (FCN)**: Replaces fully connected layers with convolutional layers, allowing the network to output a spatial map rather than a single vector.
    *   **U-Net**: An encoder-decoder architecture with skip connections that combine high-level semantic features from the decoder path with fine-grained information from the encoder path, crucial for precise localization.

### 4.2. Instance Segmentation

*   **Concept**: Combines object detection with semantic segmentation. It not only classifies each pixel but also distinguishes between individual instances of the same object class (e.g., separating `car_1` from `car_2`).
*   **Architectures**:
    *   **Mask R-CNN**: Extends Faster R-CNN by adding a branch for predicting an object mask in parallel with the existing bounding box regression and classification branches.

## 5. Practical Considerations

*   **Data Augmentation**: Techniques like rotation, flipping, cropping, and color jittering are applied to training images to increase the diversity of the dataset and improve model generalization.
*   **Fine-tuning Pre-trained Models**: A common and effective strategy to achieve high performance on new datasets, especially when data is limited.

## Checklist/Exercises to Test Understanding

1.  **Explain the core difference between image classification, object detection, and instance segmentation.** Provide a real-world application scenario for each.
2.  **Describe the role of transfer learning in deep learning for computer vision.** When would you choose feature extraction over fine-tuning, and vice-versa?
3.  **Outline the key components of a YOLO-like object detector.** How does it differ fundamentally from a Faster R-CNN in terms of its detection process?
