# Unsupervised Learning and Dimensionality Reduction Study Guide

Unsupervised learning is a branch of machine learning that deals with finding patterns in data without explicit labels. Unlike supervised learning, where models learn from labeled input-output pairs, unsupervised methods work with unlabeled data to discover hidden structures, groupings, or representations. Dimensionality reduction is a crucial component of this, aiming to reduce the number of random variables under consideration by obtaining a set of principal variables.

## 1. Clustering Algorithms
Clustering is the task of grouping a set of objects in such a way that objects in the same group (called a cluster) are more similar to each other than to those in other groups.

### a. K-Means Clustering
*   **Concept:** Partitions `n` observations into `k` clusters, where each observation belongs to the cluster with the nearest mean (centroid).
*   **How it works:**
    1.  Initialize `k` centroids randomly.
    2.  Assign each data point to the closest centroid.
    3.  Recalculate the centroids based on the mean of the points assigned to each cluster.
    4.  Repeat steps 2 and 3 until centroids no longer change significantly or a maximum number of iterations is reached.
*   **Use Cases:** Customer segmentation, document clustering, image compression.
*   **Limitations:** Requires pre-defining `k`, sensitive to initial centroid placement, assumes spherical clusters of similar size.

### b. DBSCAN (Density-Based Spatial Clustering of Applications with Noise)
*   **Concept:** Groups together points that are closely packed together, marking as outliers points that lie alone in low-density regions.
*   **How it works:** Uses two parameters: `epsilon` (maximum distance between two samples for one to be considered as in the neighborhood of the other) and `min_samples` (the number of samples in a neighborhood for a point to be considered as a core point).
*   **Use Cases:** Spatial data clustering, anomaly detection, handling arbitrary shapes of clusters.
*   **Advantages over K-Means:** Does not require pre-defining the number of clusters, can discover arbitrarily shaped clusters, robust to outliers.

### c. Hierarchical Clustering
*   **Concept:** Builds a hierarchy of clusters. It can be agglomerative (bottom-up, starting with individual points and merging them) or divisive (top-down, starting with all points in one cluster and splitting them).
*   **Dendrograms:** A tree-like diagram that records the sequences of merges or splits.
*   **Use Cases:** Biology (phylogenetic trees), financial market analysis, image segmentation.

### d. Gaussian Mixture Models (GMM)
*   **Concept:** A probabilistic model that assumes data points are generated from a mixture of a finite number of Gaussian distributions with unknown parameters. Unlike K-Means, GMM provides soft assignments (probabilities of belonging to each cluster).
*   **How it works:** Uses the Expectation-Maximization (EM) algorithm to estimate the parameters of the Gaussian components.
*   **Use Cases:** Density estimation, anomaly detection, soft clustering.
*   **Advantages:** Can model clusters with different sizes and correlations, provides probabilistic assignments.

## 2. Dimensionality Reduction Techniques
Dimensionality reduction aims to reduce the number of features in a dataset while retaining as much critical information as possible. This helps combat the curse of dimensionality, improves model performance, and aids visualization.

### a. PCA (Principal Component Analysis)
*   **Concept:** A linear dimensionality reduction technique that transforms data into a new coordinate system where the greatest variance by any projection lies on the first principal component, the second greatest variance on the second, and so on.
*   **How it works:** Finds orthogonal axes (principal components) that capture the maximum variance in the data.
*   **Use Cases:** Feature extraction, noise reduction, data visualization (when reducing to 2 or 3 components).
*   **Limitations:** Assumes linearity, sensitive to scaling of features, loses interpretability of original features.

### b. t-SNE (t-distributed Stochastic Neighbor Embedding)
*   **Concept:** A non-linear dimensionality reduction technique particularly well-suited for visualizing high-dimensional datasets. It focuses on preserving local structures (distances between nearby points) in the low-dimensional space.
*   **Use Cases:** Data visualization, exploring high-dimensional data relationships.
*   **Limitations:** Computationally expensive for large datasets, results can be sensitive to hyperparameters, primarily for visualization, not feature extraction.

### c. UMAP (Uniform Manifold Approximation and Projection)
*   **Concept:** Another non-linear dimensionality reduction technique, often faster and scales better than t-SNE. It aims to preserve both local and global data structures based on manifold learning principles.
*   **Use Cases:** Data visualization, faster alternative to t-SNE for large datasets, exploratory data analysis.

### d. LDA (Linear Discriminant Analysis)
*   **Concept:** A supervised dimensionality reduction technique used to find a linear combination of features that best separates two or more classes. Unlike PCA, LDA maximizes the separation between different classes while minimizing the variance within each class.
*   **Use Cases:** Preprocessing for classification tasks, facial recognition, medical diagnosis.
*   **Comparison with PCA:** LDA is supervised and aims to maximize class separability; PCA is unsupervised and aims to maximize variance.

## 3. Anomaly Detection Algorithms
Anomaly detection (or outlier detection) identifies items, events, or observations that deviate significantly from the majority of the data, indicating a potential problem or rare event.

### a. Isolation Forest
*   **Concept:** An ensemble tree-based method that 