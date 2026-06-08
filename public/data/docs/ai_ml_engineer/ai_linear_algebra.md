# Linear Algebra for Machine Learning: Study Guide

Linear Algebra is the mathematics of data. In Machine Learning, virtually every algorithm, from simple linear regression to complex deep neural networks, relies heavily on linear algebraic principles for data representation, manipulation, and optimization. Mastering these concepts is fundamental for understanding how ML models work, interpreting their results, and developing new algorithms.

## 1. Core Concepts

### 1.1. Vectors
A vector is a fundamental mathematical object that represents magnitude and direction. In ML, vectors often represent data points or features.
*   **Definition:** An ordered list of numbers.
*   **Representation:**
    *   Column Vector: $ \mathbf{v} = \begin{pmatrix} v_1 \\ v_2 \\ \vdots \\ v_n \end{pmatrix} $
    *   Row Vector: $ \mathbf{v}^T = \begin{pmatrix} v_1 & v_2 & \dots & v_n \end{pmatrix} $
*   **Operations:**
    *   **Addition:** Element-wise sum of two vectors of the same dimension.
    *   **Scalar Multiplication:** Multiplying each element of a vector by a scalar.
    *   **Dot Product (Inner Product):** $ \mathbf{u} \cdot \mathbf{v} = \sum_{i=1}^n u_i v_i $. Results in a scalar, measuring similarity or projection.

### 1.2. Matrices
A matrix is a rectangular array of numbers, symbols, or expressions arranged in rows and columns. In ML, matrices are used to store datasets (rows as samples, columns as features), represent transformations, or define neural network weights.
*   **Definition:** A 2-dimensional array of numbers.
*   **Dimensions:** An $m \times n$ matrix has $m$ rows and $n$ columns.
*   **Special Matrices:**
    *   **Identity Matrix ($I$):** Square matrix with ones on the main diagonal and zeros elsewhere. Acts as a multiplicative identity.
    *   **Zero Matrix:** All elements are zero.
    *   **Diagonal Matrix:** Non-zero elements only on the main diagonal.
*   **Operations:**
    *   **Addition:** Element-wise sum of two matrices of the same dimension.
    *   **Scalar Multiplication:** Multiplying each element of a matrix by a scalar.
    *   **Matrix Multiplication:** If $A$ is $m \times n$ and $B$ is $n \times p$, then $C = AB$ is $m \times p$. The element $C_{ij}$ is the dot product of the $i$-th row of $A$ and the $j$-th column of $B$. Not commutative ($AB \neq BA$).

### 1.3. Determinants
The determinant is a scalar value that can be computed from the elements of a square matrix.
*   **Purpose:**
    *   Indicates whether a matrix is invertible (non-zero determinant).
    *   Measures how much a linear transformation scales or shrinks space.
    *   $det(A) = 0$ implies the transformation flattens space, making it non-invertible.

### 1.4. Inverse Matrices
For a square matrix $A$, its inverse $A^{-1}$ (if it exists) is a matrix such that $AA^{-1} = A^{-1}A = I$.
*   **Existence:** A matrix is invertible if and only if its determinant is non-zero.
*   **Applications:** Solving systems of linear equations ($Ax = b \Rightarrow x = A^{-1}b$).

### 1.5. Eigenvalues and Eigenvectors
Eigenvalues and eigenvectors are special values and vectors that characterize the properties of a linear transformation.
*   **Definition:** For a square matrix $A$, if $A\mathbf{v} = \lambda\mathbf{v}$, where $ \mathbf{v} $ is a non-zero vector, then $ \mathbf{v} $ is an eigenvector of $A$, and $ \lambda $ is its corresponding eigenvalue.
*   **Significance:**
    *   Eigenvectors represent directions along which a linear transformation acts by simply scaling (not rotating or shearing).
    *   Eigenvalues indicate the factor by which the eigenvectors are scaled.
    *   Crucial for Principal Component Analysis (PCA) for dimensionality reduction, spectral clustering, and understanding stability in dynamical systems.

## 2. Matrix Decompositions

Matrix decompositions (or factorizations) break down a matrix into a product of simpler matrices. This often reveals properties of the original matrix and simplifies computations.

### 2.1. Singular Value Decomposition (SVD)
SVD is a powerful factorization that generalizes the concept of diagonalization to any $m \times n$ matrix.
*   **Formula:** Any matrix $A$ can be decomposed as $A = U \Sigma V^T$, where:
    *   $U$: $m \times m$ orthogonal matrix (left singular vectors).
    *   $\Sigma$: $m \times n$ diagonal matrix containing singular values (non-negative, ordered by magnitude).
    *   $V^T$: $n \times n$ orthogonal matrix (transpose of right singular vectors).
*   **Applications in ML:**
    *   **Dimensionality Reduction:** Truncated SVD is the basis for PCA. By keeping only the largest singular values and their corresponding vectors, we capture the most significant variance in the data.
    *   **Recommender Systems:** Latent factor models often use SVD to find underlying features from user-item interaction matrices.
    *   **Image Compression, Noise Reduction.**

### 2.2. QR Decomposition
QR decomposition factors a matrix $A$ into an orthogonal matrix $Q$ and an upper triangular matrix $R$.
*   **Formula:** $A = QR$, where:
    *   $Q$: $m \times m$ orthogonal matrix ($Q^TQ = QQ^T = I$).
    *   $R$: $m \times n$ upper triangular matrix.
*   **Applications in ML:**
    *   **Solving Linear Least Squares Problems:** More stable numerically than using the normal equations ($A^TAx = A^Tb$).
    *   **Eigenvalue Algorithms:** Used in the QR algorithm for computing eigenvalues.

## 3. Python Code Example (NumPy)

NumPy is the cornerstone for numerical computing in Python and provides efficient implementations of linear algebra operations.

```python
import numpy as np

# 1. Vectors and Matrices
vector_a = np.array([1, 2, 3])
matrix_A = np.array([[1, 2, 3],
                     [4, 5, 6],
                     [7, 8, 9]])

print("Vector a:", vector_a)
print("Matrix A:\n", matrix_A)

# 2. Basic Operations
vector_b = np.array([9, 8, 7])
sum_vectors = vector_a + vector_b
dot_product = np.dot(vector_a, vector_b) # or vector_a @ vector_b

matrix_B = np.array([[9, 8, 7],
                     [6, 5, 4],
                     [3, 2, 1]])
matrix_product = np.dot(matrix_A, matrix_B) # or matrix_A @ matrix_B

print("\nSum of vectors:", sum_vectors)
print("Dot product (a.b):", dot_product)
print("Matrix Product (A.B):\n", matrix_product)

# 3. Determinant and Inverse
determinant_A = np.linalg.det(matrix_A)
print("\nDeterminant of A:", determinant_A)

# If determinant is non-zero, calculate inverse
if round(determinant_A, 5) != 0: # Use round for floating point comparison
    try:
        inverse_A = np.linalg.inv(matrix_A)
        print("Inverse of A:\n", inverse_A)
    except np.linalg.LinAlgError:
        print("Matrix A is singular (no inverse).")
else:
    print("Matrix A is singular (no inverse).")

# For a matrix with a non-zero determinant for demonstration
matrix_C = np.array([[1, 2], [3, 4]])
det_C = np.linalg.det(matrix_C)
print("\nDeterminant of C:", det_C)
if round(det_C, 5) != 0:
    inverse_C = np.linalg.inv(matrix_C)
    print("Inverse of C:\n", inverse_C)
    print("C @ inv(C):\n", matrix_C @ inverse_C) # Should be identity matrix

# 4. Eigenvalues and Eigenvectors
# Using a symmetric matrix for simpler demonstration
symmetric_matrix = np.array([[4, 2], [2, 4]])
eigenvalues, eigenvectors = np.linalg.eig(symmetric_matrix)

print("\nEigenvalues of symmetric matrix:", eigenvalues)
print("Eigenvectors of symmetric matrix:\n", eigenvectors)

# Verify: A v = lambda v
# For the first eigenvector
v1 = eigenvectors[:, 0]
lambda1 = eigenvalues[0]
print(f"\nA * v1:\n{symmetric_matrix @ v1}")
print(f"lambda1 * v1:\n{lambda1 * v1}")

# 5. Singular Value Decomposition (SVD)
U, s, Vt = np.linalg.svd(matrix_A) # Note: matrix_A from earlier has det=0
# Let's use a non-singular matrix for a more clear SVD demonstration
matrix_D = np.array([[1, 1], [0, 1], [1, 0]]) # A non-square matrix
U_d, s_d, Vt_d = np.linalg.svd(matrix_D)

print("\nSVD of matrix D:")
print("U:\n", U_d)
print("Singular Values (s):", s_d)
print("Vt:\n", Vt_d)

# Reconstruct matrix D from SVD components
# Create a diagonal matrix from singular values
Sigma = np.zeros((matrix_D.shape[0], matrix_D.shape[1]))
Sigma[:matrix_D.shape[1], :matrix_D.shape[1]] = np.diag(s_d)
D_reconstructed = U_d @ Sigma @ Vt_d
print("D Reconstructed:\n", D_reconstructed)

# 6. QR Decomposition
Q_mat, R_mat = np.linalg.qr(matrix_A)
print("\nQR Decomposition of A:")
print("Q:\n", Q_mat)
print("R:\n", R_mat)
print("Q @ R:\n", Q_mat @ R_mat) # Should reconstruct matrix_A
```

## 4. Quick Checklist / Exercise

1.  **Vectors & Matrices:** Given vector $ \mathbf{u} = \begin{pmatrix} 1 \\ 2 \end{pmatrix} $ and $ \mathbf{v} = \begin{pmatrix} 3 \\ 4 \end{pmatrix} $, calculate their dot product $ \mathbf{u} \cdot \mathbf{v} $. If matrix $ A = \begin{pmatrix} 1 & 2 \\ 3 & 4 \end{pmatrix} $ and $ B = \begin{pmatrix} 5 & 6 \\ 7 & 8 \end{pmatrix} $, compute $ AB $.
2.  **Determinant & Inverse:** What does a determinant of zero imply about a square matrix? Explain its significance for finding the inverse.
3.  **Eigen-Decomposition & SVD:** Briefly explain the primary difference between Eigenvalue Decomposition and Singular Value Decomposition in terms of applicable matrices and their general use cases in Machine Learning.