# Unsupervised Learning & Dimensionality Reduction

Unsupervised learning is a branch of machine learning that deals with finding patterns and structures within data without the need for explicit labels. Unlike supervised learning, where models are trained on labeled datasets, unsupervised methods are adept at discovering hidden insights, grouping similar data points, and reducing the complexity of high-dimensional data. This topic explores key algorithms for clustering, dimensionality reduction, and introduces anomaly detection.

## 1. Clustering Algorithms

Clustering is the task of grouping a set of objects in such a way that objects in the same group (called a cluster) are more similar to each other than to those in other groups.

### 1.1 K-Means Clustering

*   **Concept:** An iterative algorithm that partitions `n` observations into `k` predefined clusters, where each observation belongs to the cluster with the nearest mean (centroid).
*   **How it Works:**
    1.  Initialize `k` cluster centroids randomly or using a specific strategy (e.g., K-Means++).
    2.  **Assignment Step:** Assign each data point to its closest centroid based on a distance metric (commonly Euclidean distance).
    3.  **Update Step:** Recalculate the centroids as the mean of all data points assigned to that cluster.
    4.  Repeat steps 2 and 3 until the centroids no longer move significantly or a maximum number of iterations is reached.
*   **Use Cases:** Customer segmentation, image quantization, document clustering.
*   **Limitations:** Requires specifying the number of clusters (`k`) beforehand, sensitive to initial centroid placement, struggles with non-spherical clusters.

### 1.2 Hierarchical Clustering

*   **Concept:** Builds a hierarchy of clusters, represented by a tree-like diagram called a dendrogram. It can be either:
    *   **Agglomerative (Bottom-Up):** Starts with each data point as its own cluster and progressively merges the closest pairs of clusters until only one cluster remains.
    *   **Divisive (Top-Down):** Starts with all data points in one cluster and recursively splits the clusters until each data point is its own cluster.
*   **Dendrogram:** Visualizes the merging or splitting process, where the height of the merge/split indicates the dissimilarity between clusters.
*   **Use Cases:** Biological classification, phylogenetic trees, market research.
*   **Limitations:** Can be computationally expensive for large datasets, difficult to define a clear cut-off point for clusters without prior knowledge.

### 1.3 DBSCAN (Density-Based Spatial Clustering of Applications with Noise)

*   **Concept:** A density-based clustering algorithm that groups together points that are closely packed together, marking as outliers points that lie alone in low-density regions.
*   **Key Parameters:**
    *   `eps` (epsilon): The maximum radius distance to search for neighbors.
    *   `min_samples`: The minimum number of points required to form a dense region (a cluster).
*   **Point Types:**
    *   **Core Point:** A point with at least `min_samples` within its `eps` radius.
    *   **Border Point:** A point that is within the `eps` radius of a core point but has fewer than `min_samples` within its own `eps` radius.
    *   **Noise Point:** A point that is neither a core nor a border point.
*   **Advantages:** Can discover arbitrarily shaped clusters, robust to outliers (labels them as noise), does not require specifying the number of clusters.
*   **Limitations:** Struggles with varying densities, sensitive to parameter tuning, difficulties with high-dimensional data.

### 1.4 Gaussian Mixture Models (GMM)

*   **Concept:** A probabilistic model that assumes data points are generated from a mixture of a finite number of Gaussian distributions with unknown parameters (mean, covariance, and mixing weights).
*   **How it Works:** Uses the Expectation-Maximization (EM) algorithm to iteratively estimate the parameters of the underlying Gaussian components. Instead of assigning points to hard clusters, GMMs provide a probability that each point belongs to each cluster (soft assignment).
*   **Advantages:** Provides a measure of uncertainty for each data point's cluster assignment, can model elliptical clusters, more flexible than K-Means.
*   **Limitations:** Can be computationally intensive, susceptible to local optima, assumes underlying Gaussian distributions.

## 2. Dimensionality Reduction Techniques

Dimensionality reduction is the process of reducing the number of random variables under consideration. This helps in data compression, noise reduction, improved model performance, and data visualization.

### 2.1 PCA (Principal Component Analysis)

*   **Concept:** A linear dimensionality reduction technique that transforms the data into a new coordinate system where the new axes (principal components) capture the maximum variance in the data. The first principal component accounts for the largest possible variance, and each succeeding component accounts for the remaining variance.
*   **How it Works:**
    1.  Standardize the data.
    2.  Compute the covariance matrix of the data.
    3.  Calculate the eigenvalues and eigenvectors of the covariance matrix.
    4.  Select the top `k` eigenvectors (corresponding to the largest eigenvalues) to form a projection matrix.
    5.  Transform the original data onto this new `k`-dimensional subspace.
*   **Use Cases:** Feature extraction, noise filtering, data visualization (especially for reducing to 2-3 dimensions).
*   **Limitations:** Assumes linear relationships in the data, sensitive to feature scaling, principal components can be hard to interpret.

### 2.2 t-SNE (t-distributed Stochastic Neighbor Embedding)

*   **Concept:** A non-linear dimensionality reduction technique particularly well-suited for visualizing high-dimensional datasets. It maps high-dimensional data points to a low-dimensional space (typically 2D or 3D) while attempting to preserve the local structure (i.e., points that are close in the high-dimensional space remain close in the low-dimensional space).
*   **How it Works:** Converts similarities between data points into joint probabilities and minimizes the Kullback-Leibler divergence between the joint probabilities of the high-dimensional data and the low-dimensional map.
*   **Use Cases:** Visualizing complex datasets, exploring intrinsic clusters in data.
*   **Limitations:** Computationally intensive for large datasets, results can be sensitive to parameter tuning (e.g., perplexity), does not preserve global structure as well as UMAP.

### 2.3 UMAP (Uniform Manifold Approximation and Projection)

*   **Concept:** A general-purpose manifold learning and dimensionality reduction algorithm. Like t-SNE, it constructs a high-dimensional graph representation of the data and then optimizes a low-dimensional graph to be as structurally similar as possible.
*   **Advantages over t-SNE:** Faster computation (especially for large datasets), better at preserving both local and global data structure, more flexible for embedding into higher dimensions than 2D/3D.
*   **Use Cases:** Data visualization, feature engineering, general dimension reduction.

## 3. Anomaly Detection

Anomaly detection (also known as outlier detection) is the process of identifying data points that deviate significantly from the normal behavior of the data. In an unsupervised context, this often involves models learning the 'normal' distribution or patterns of the data and then flagging points that fall outside these learned norms. Techniques like DBSCAN inherently identify noise points, and GMMs can assign low probabilities to anomalous observations, making them useful in unsupervised anomaly detection.

## Simple Code Example: K-Means Clustering

This example demonstrates how to apply K-Means clustering to a synthetic dataset using `scikit-learn` in Python.

```python
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import matplotlib.pyplot as plt

# 1. Generate some synthetic 2D data
np.random.seed(42)
X = np.random.rand(150, 2) * 10 # Base random points

# Add offsets to create three distinct clusters
X[:50] += [1, 1] # Cluster 1
X[50:100] += [8, 2] # Cluster 2
X[100:] += [3, 9] # Cluster 3

# 2. Standardize the data (important for distance-based algorithms like K-Means)
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# 3. Apply K-Means clustering (assuming we know k=3 clusters)
kmeans = KMeans(n_clusters=3, random_state=42, n_init=10) # n_init for robustness
kmeans.fit(X_scaled)

# 4. Get cluster labels and centroid coordinates
labels = kmeans.labels_
centroids = kmeans.cluster_centers_

# 5. Visualize the results
plt.figure(figsize=(9, 7))
plt.scatter(X_scaled[:, 0], X_scaled[:, 1], c=labels, cmap='viridis', s=60, alpha=0.8)
plt.scatter(centroids[:, 0], centroids[:, 1], c='red', marker='X', s=250, label='Centroids', edgecolor='black')
plt.title('K-Means Clustering on Scaled Data', fontsize=16)
plt.xlabel('Feature 1 (scaled)', fontsize=12)
plt.ylabel('Feature 2 (scaled)', fontsize=12)
plt.legend(fontsize=12)
plt.grid(True, linestyle='--', alpha=0.6)
plt.show()

print("\nFirst 10 data points and their assigned cluster labels:\n", list(zip(X_scaled[:10].round(2), labels[:10])))
print("\nFinal Centroids (scaled coordinates):\n", centroids.round(2))
```

## Quick Understanding Checklist/Exercise

1.  Describe the main advantage of DBSCAN over K-Means when dealing with arbitrarily shaped clusters or noisy data.
2.  When would you prefer using PCA for dimensionality reduction, and when might t-SNE or UMAP be more appropriate?
3.  How do the 'soft' assignments of GMMs differ from the 'hard' assignments typically made by K-Means, and what benefit does this offer?