# Project: Data Quality Audit and Preprocessing for Computer Vision

High-quality data is the backbone of robust computer vision models. Without a thorough understanding and preparation of your dataset, even the most sophisticated models can underperform or learn incorrect patterns. This guide will walk you through the essential steps of conducting a data quality audit, applying effective preprocessing, implementing data augmentation, and strategizing data splits.

## 1. The Importance of Data Quality in Computer Vision

In computer vision, data quality refers to the accuracy, consistency, and representativeness of your image dataset and its associated annotations. Issues suchs as incorrect labels, inconsistent bounding boxes, or imbalanced classes can significantly degrade model performance and lead to biased predictions.

## 2. Data Quality Audit

A data quality audit is a systematic process of inspecting your dataset to identify and rectify errors and inconsistencies. Key areas to inspect include:

*   **Label Errors (Misannotations):**
    *   **Incorrect Class Labels:** An image of a cat labeled as a dog.
    *   **Missing Labels:** Objects in an image that are not annotated.
    *   **Inaccurate Bounding Boxes/Segmentation Masks:** Bounding boxes that do not tightly encompass the object, or segmentation masks that are imprecise.
    *   **Overlapping/Redundant Labels:** Multiple labels for the same object.
*   **Inconsistencies:**
    *   **Annotation Format:** Variations in how bounding boxes (e.g., `[x_min, y_min, x_max, y_max]` vs. `[x_center, y_center, width, height]`) or class names are stored.
    *   **Image Properties:** Varying image dimensions, color spaces, or file formats within the same dataset that could affect processing.
*   **Class Imbalance:**
    *   When some classes have significantly more instances than others. This can lead to models biased towards the majority classes.
*   **Duplicate Data:**
    *   Identical or near-identical images in the dataset, which can lead to overfitting and inflated performance metrics.
*   **Outliers and Anomalies:**
    *   Images that are significantly different from the rest of the dataset (e.g., extremely noisy, blurry, or misrepresentative).

**Audit Techniques:**
*   **Manual Inspection:** Visually reviewing a subset of images and annotations.
*   **Statistical Analysis:** Analyzing class distribution, image dimensions, and other metadata.
*   **Visualization Tools:** Using tools to overlay annotations on images to quickly spot errors.
*   **Automated Checks:** Scripting checks for common errors (e.g., bounding box coordinates outside image bounds).

## 3. Data Preprocessing

Preprocessing transforms raw image data into a format suitable for model training. Common steps include:

*   **Image Resizing and Normalization:**
    *   **Resizing:** Uniformly scaling images to a fixed dimension (e.g., 224x224) required by most CNN architectures.
    *   **Normalization:** Scaling pixel values to a standard range (e.g., `[0, 1]` or `[-1, 1]`) to aid convergence during training.
    ```python
    import cv2
    import numpy as np

    # Example of resizing and normalization
    def preprocess_image(image_path, target_size=(224, 224)):
        image = cv2.imread(image_path)
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB) # Convert BGR to RGB
        image = cv2.resize(image, target_size) # Resize image
        image = image.astype('float32') / 255.0 # Normalize to [0, 1]
        return image

    # Usage
    # preprocessed_img = preprocess_image('path/to/your/image.jpg')
    ```
*   **Color Space Conversion:** Converting images to grayscale or other color spaces (e.g., HSV) if beneficial for the task.
*   **Noise Reduction:** Applying filters (e.g., Gaussian blur) to reduce image noise, though often done as augmentation.
*   **Correction of Label Errors:** Manually or semi-automatically fixing identified annotation errors.

## 4. Data Augmentation

Data augmentation is a technique to artificially expand the training dataset by applying various transformations to the existing images. This helps to improve model generalization, reduce overfitting, and make the model more robust to variations in real-world data.

**Common Augmentation Techniques:**
*   **Geometric Transformations:**
    *   **Flips:** Horizontal and vertical mirroring.
    *   **Rotations:** Rotating images by various angles.
    *   **Scaling:** Zooming in or out.
    *   **Translations:** Shifting images horizontally or vertically.
    *   **Shearing:** Tilting the image.
    *   **Random Crops:** Taking random crops of the image.
*   **Photometric (Color) Transformations:**
    *   **Brightness, Contrast, Saturation, Hue Adjustments:** Varying color properties.
    *   **Gaussian Noise:** Adding random noise to pixels.
    *   **Blurring:** Applying various blur filters (e.g., Gaussian, Motion Blur).
    *   **Cutout/CoarseDropout:** Removing rectangular regions to force the model to look at other features.

**Popular Libraries:**
*   **Albumentations:** A fast and flexible library for image augmentations, especially for object detection and segmentation.
*   **imgaug:** Another powerful library for various augmentation techniques.

**Albumentations Example:**
```python
import albumentations as A
import cv2
import matplotlib.pyplot as plt

# Load an example image (assuming you have one, e.g., 'sample_image.jpg')
# For demonstration, let's create a dummy image if file not found
try:
    image = cv2.imread('sample_image.jpg')
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
except AttributeError: # If image is None due to file not found
    print("Sample image not found, creating a dummy image.")
    image = np.zeros((300, 300, 3), dtype=np.uint8) # Create a black image
    cv2.putText(image, "SkillBun", (50, 150), cv2.FONT_HERSHEY_SIMPLEX, 2, (255, 255, 255), 3)

# Define an augmentation pipeline
transform = A.Compose([
    A.HorizontalFlip(p=0.5), # Apply horizontal flip 50% of the time
    A.ShiftScaleRotate(shift_limit=0.0625, scale_limit=0.1, rotate_limit=15, p=0.5), # Shift, scale, rotate
    A.RandomBrightnessContrast(brightness_limit=0.2, contrast_limit=0.2, p=0.5), # Adjust brightness/contrast
    A.GaussNoise(var_limit=(10.0, 50.0), p=0.5), # Add Gaussian noise
    A.CoarseDropout(max_holes=8, max_height=8, max_width=8, fill_value=0, p=0.5) # Cutout regions
])

# Apply the transformation to the image
augmented_image = transform(image=image)['image']

# Display original and augmented image (requires matplotlib)
# plt.figure(figsize=(10, 5))
# plt.subplot(1, 2, 1)
# plt.imshow(image)
# plt.title('Original Image')
# plt.subplot(1, 2, 2)
# plt.imshow(augmented_image)
# plt.title('Augmented Image')
# plt.show()
```

## 5. Data Splitting Strategies

Properly splitting your dataset into training, validation, and test sets is crucial for unbiased model evaluation.

*   **Training Set:** Used to train the model and learn parameters.
*   **Validation Set:** Used to tune hyperparameters, select models, and monitor overfitting during training. It provides an unbiased evaluation of a model fit on the training dataset while tuning model hyperparameters.
*   **Test Set:** Used for the final, unbiased evaluation of the model's performance after training and hyperparameter tuning are complete. This set should ideally be unseen during any part of the model development process.

**Common Splitting Ratios:**
*   **70/15/15 (Train/Validation/Test):** A balanced approach.
*   **80/10/10 (Train/Validation/Test):** More data for training, suitable for larger datasets.

**Important Considerations:**
*   **Random Splitting:** Ensure samples are randomly assigned to sets to avoid bias. However, simple random splitting might not be sufficient for imbalanced datasets.
*   **Stratified Splitting:** When dealing with class imbalance, stratified splitting ensures that the proportion of each class is approximately the same in the training, validation, and test sets. This prevents a situation where one set has very few or no samples of a minority class.
    ```python
    from sklearn.model_selection import train_test_split
    import pandas as pd

    # Using a dummy DataFrame for demonstration with imbalanced classes
    data = {'image_path': [f'img_{i}.jpg' for i in range(100)],
            'label': ['cat'] * 70 + ['dog'] * 20 + ['bird'] * 10}
    df = pd.DataFrame(data)

    # First split: 80% for training+validation, 20% for test
    train_val_df, test_df = train_test_split(df, test_size=0.2, stratify=df['label'], random_state=42)

    # Second split: 75% of train_val_df for training, 25% for validation (0.75 * 0.8 = 0.6; 0.25 * 0.8 = 0.2)
    train_df, val_df = train_test_split(train_val_df, test_size=0.25, stratify=train_val_df['label'], random_state=42)

    # Now, train_df is ~60%, val_df is ~20%, test_df is ~20% of original, with preserved class ratios
    print("Original class distribution:\n", df['label'].value_counts(normalize=True))
    print("\nTrain class distribution:\n", train_df['label'].value_counts(normalize=True))
    print("\nValidation class distribution:\n", val_df['label'].value_counts(normalize=True))
    print("\nTest class distribution:\n", test_df['label'].value_counts(normalize=True))
    ```
*   **Avoiding Data Leakage:** Ensure no information from the validation or test sets is used during training or hyperparameter tuning. This includes not applying transformations (like normalization statistics) derived from the test set to the training data.

## Quick Check / Exercise

1.  **Scenario:** You're working on a medical imaging dataset for tumor detection. You find that 98% of your images show healthy tissue, and only 2% show tumors. Which data quality issue is this, and what specific data splitting strategy would you prioritize?
2.  **Task:** Briefly explain why applying data augmentation only to the training set and not to the validation or test sets is crucial.
3.  **Code Challenge:** Using `albumentations`, create a transformation pipeline that performs a random crop of 200x200 pixels, followed by a random rotation (up to 30 degrees), and then adds either Gaussian noise or a motion blur effect (with 50% probability for each image).
