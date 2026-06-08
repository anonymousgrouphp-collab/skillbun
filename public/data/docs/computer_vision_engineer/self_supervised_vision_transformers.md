# Self-Supervised Learning and Vision Transformers

This study guide delves into two pivotal advancements in modern computer vision: **Self-Supervised Learning (SSL)**, a paradigm for pre-training models without explicit human labels, and **Vision Transformers (ViT)**, an architectural shift bringing the power of Transformers from NLP to image tasks.

## 1. Self-Supervised Learning (SSL)

Self-Supervised Learning is a machine learning paradigm that leverages the data itself to generate supervisory signals, enabling models to learn rich, generalizable representations without relying on large, human-annotated datasets. It typically involves defining a "pretext task" where the input data is manipulated, and the model learns to predict some missing or transformed part of the input.

### Why SSL?
*   **Data Scarcity for Annotation:** Manual labeling is expensive, time-consuming, and requires domain expertise.
*   **Scalability:** Allows pre-training on vast amounts of unlabeled data, potentially leading to better generalization.
*   **Transfer Learning:** Pre-trained SSL models often serve as excellent feature extractors for downstream supervised tasks, even with limited labeled data.

### Key Self-Supervised Learning Methods

#### a) Contrastive Learning (e.g., SimCLR)
Contrastive learning aims to learn representations by pulling "anchor" samples closer to their "positive" counterparts (augmented versions of themselves) and pushing them away from "negative" samples (other samples in the batch).

*   **SimCLR (A Simple Framework for Contrastive Learning of Visual Representations):**
    *   **Core Idea:** Maximize agreement between different augmented views of the same data example via a contrastive loss.
    *   **Mechanism:**
        1.  **Data Augmentation:** Apply two different stochastic augmentations (e.g., random crop, color jitter, blur) to an image to create two correlated views.
        2.  **Encoder:** Pass both views through a shared neural network encoder (e.g., ResNet) to obtain their representations.
        3.  **Projection Head:** A small MLP projects these representations into a lower-dimensional space where the contrastive loss is applied.
        4.  **NT-Xent Loss (Normalized Temperature-scaled Cross-Entropy Loss):** For each positive pair (augmented views of the same image), it treats other `2(N-1)` samples in the batch as negative examples. The goal is to maximize the similarity of positive pairs and minimize the similarity of negative pairs.
    *   **Key Insight:** The quality of data augmentations and a large batch size are crucial for effective learning.

#### b) Non-Contrastive Learning (e.g., BYOL)
While effective, contrastive learning requires careful management of negative samples (e.g., large batch sizes). Non-contrastive methods achieve competitive performance without explicit negative pairs.

*   **BYOL (Bootstrap Your Own Latent):**
    *   **Core Idea:** Learn representations by predicting the output of a "target" network with a "prediction" network.
    *   **Mechanism:**
        1.  **Online Network:** An encoder (`f_theta`) and a projection head (`g_theta`), followed by a prediction MLP (`q_theta`).
        2.  **Target Network:** Another encoder (`f_xi`) and projection head (`g_xi`). Its weights (`xi`) are an exponential moving average of the online network's weights (`theta`), rather than being trained directly by backpropagation.
        3.  **Loss:** The online network predicts the target network's representation for an augmented view of an image, given another augmented view. The loss minimizes the similarity (e.g., cosine similarity) between the predicted and target representations.
    *   **Key Insight:** The momentum encoder (`f_xi`, `g_xi`) prevents "collapse" (where the model learns trivial, constant representations) without needing negative samples.

#### c) Masked Autoencoders (MAE)
Inspired by BERT in NLP, MAE applies a masking strategy to image patches.

*   **MAE (Masked Autoencoders Are Scalable Vision Learners):**
    *   **Core Idea:** Reconstruct the missing pixel values of masked-out image patches.
    *   **Mechanism:**
        1.  **Patching & Masking:** Divide an image into non-overlapping patches. Randomly mask a high percentage (e.g., 75%) of these patches.
        2.  **Encoder:** A Vision Transformer (ViT) encoder processes only the *visible* (unmasked) patches. This is a key efficiency gain.
        3.  **Decoder:** A much shallower Transformer decoder takes the encoded visible patches *and* learned mask tokens (placeholders for masked patches) as input. Its task is to reconstruct the original pixel values for *all* patches, especially the masked ones.
        4.  **Loss:** Mean Squared Error (MSE) only on the reconstructed masked patches.
    *   **Key Insight:** By processing only a small fraction of patches, MAE trains very efficiently. The simple reconstruction task forces the model to learn meaningful semantic information from limited context.

## 2. Vision Transformers (ViT)

Vision Transformers extend the highly successful Transformer architecture (originally from NLP) to computer vision tasks, revolutionizing how models process images.

### From CNNs to Transformers in Vision
Traditionally, Convolutional Neural Networks (CNNs) dominated computer vision due to their ability to capture local patterns and hierarchical features. Transformers, with their global self-attention mechanisms, offer a different paradigm: they can model long-range dependencies across the entire image directly.

### a) Vision Transformer (ViT) Architecture
The seminal paper "An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale" introduced ViT.

*   **Core Idea:** Treat an image as a sequence of fixed-size patches, similar to how words form a sequence in NLP.
*   **Architecture Components:**
    1.  **Image Patching & Linear Embedding:**
        *   An input image is divided into a grid of fixed-size, non-overlapping patches (e.g., 16x16 pixels).
        *   Each patch is flattened into a 1D vector.
        *   These flattened patches are then linearly projected (embedded) into a higher-dimensional space to form "patch embeddings."
    2.  **Class Token:** A learnable `[CLS]` token (similar to BERT) is prepended to the sequence of patch embeddings. The state of this token at the encoder's output serves as the image's overall representation for classification.
    3.  **Positional Encoding:** Since Transformers are permutation-invariant (don't inherently understand sequence order), positional embeddings are added to the patch embeddings. This informs the model about the spatial location of each patch.
    4.  **Transformer Encoder:** The combined sequence (class token + patch embeddings + positional embeddings) is fed into a standard Transformer Encoder.
        *   **Multi-Head Self-Attention (MHSA):** Allows each patch to attend to all other patches (and the class token), capturing global relationships.
        *   **Multi-Layer Perceptron (MLP):** A feed-forward network applied independently to each token's representation.
        *   **Layer Normalization and Residual Connections:** Applied throughout the encoder blocks.
    5.  **Classification Head:** The final output of the `[CLS]` token from the Transformer encoder is passed through an MLP head for classification.

### b) Advanced Vision Transformer Architectures

*   **DETR (DEtection TRansformer):**
    *   **Core Idea:** An end-to-end object detection model that simplifies the pipeline by directly predicting a set of bounding boxes and class labels, eliminating the need for anchor boxes, NMS (Non-Maximum Suppression), and RPNs (Region Proposal Networks).
    *   **Mechanism:** Uses a CNN backbone for feature extraction, followed by an encoder-decoder Transformer. The decoder uses learned object queries, and a bipartite matching loss matches predicted boxes to ground truth boxes.
*   **Swin Transformers:**
    *   **Core Idea:** Introduce hierarchy and shifted windowing to make Transformers more efficient and suitable for dense prediction tasks (like segmentation) by overcoming the quadratic complexity of global self-attention.
    *   **Mechanism:**
        1.  **Hierarchical Feature Representation:** Builds representations at different scales, similar to CNNs.
        2.  **Shifted Windows:** Self-attention is computed only within local, non-overlapping windows. To allow cross-window connections (and global modeling), the windows are shifted between successive layers. This limits the computational cost while still enabling information flow across the entire image.
    *   **Benefits:** Achieves linear complexity with respect to image size, making it more practical for high-resolution images and dense prediction tasks.

### Attention Mechanisms and Scalability

*   **Self-Attention:** At its core, self-attention calculates a weighted sum of values, where the weights are determined by the similarity between a query and keys. For an input sequence `X`, it computes three matrices: Query `Q`, Key `K`, and Value `V`. The attention output is `softmax(QK^T / sqrt(d_k))V`. This allows each token to weigh the importance of every other token in the sequence.
*   **Multi-Head Attention:** Instead of a single attention function, MHSA performs `h` independent attention calculations (heads) in parallel. The outputs from these heads are concatenated and linearly projected, allowing the model to jointly attend to information from different representation subspaces at different positions.
*   **Scalability Challenges:** Standard self-attention has a computational complexity of `O(N^2 * D)` where `N` is the sequence length (number of patches) and `D` is the embedding dimension. For high-resolution images, `N` can be very large, leading to significant computational and memory costs.
*   **Addressing Scalability:**
    *   **Hierarchical Transformers (e.g., Swin):** Compute attention only within local windows, reducing `N` for each attention calculation.
    *   **Pooling/Downsampling:** Reduce the sequence length `N` in deeper layers.
    *   **Sparse Attention:** Only attend to a subset of other tokens.

### Code Example: Vision Transformer Patch Embedding (Conceptual)

This pseudo-code illustrates how an image is broken into patches and embedded for a ViT.

```python
import torch
import torch.nn as nn

class PatchEmbedding(nn.Module):
    def __init__(self, img_size, patch_size, in_channels, embed_dim):
        super().__init__()
        # Calculate number of patches in height and width
        self.num_patches = (img_size // patch_size) ** 2
        self.patch_size = patch_size
        self.embed_dim = embed_dim

        # Convolutional layer to convert patches to embeddings
        # kernel_size = patch_size, stride = patch_size
        # This effectively extracts non-overlapping patches and projects them
        self.proj = nn.Conv2d(in_channels, embed_dim, kernel_size=patch_size, stride=patch_size)

    def forward(self, x):
        # x: (batch_size, in_channels, img_height, img_width)
        
        # Apply convolution to get patch embeddings
        # Output: (batch_size, embed_dim, num_patches_h, num_patches_w)
        x = self.proj(x) 
        
        # Flatten the spatial dimensions to get a sequence of embeddings
        # Output: (batch_size, embed_dim, num_patches)
        x = x.flatten(2) 
        
        # Transpose to get (batch_size, num_patches, embed_dim)
        # This is the expected sequence format for Transformer encoders
        x = x.transpose(1, 2) 
        return x

# Example Usage:
# img_size = 224 (e.g., 224x224 image)
# patch_size = 16 (e.g., 16x16 patches)
# in_channels = 3 (RGB image)
# embed_dim = 768 (standard embedding dimension for ViT-B/16)

# patch_embedder = PatchEmbedding(img_size=224, patch_size=16, in_channels=3, embed_dim=768)
# dummy_image = torch.randn(1, 3, 224, 224) # Batch size 1, 3 channels, 224x224
# patch_embeddings = patch_embedder(dummy_image)
# print(patch_embeddings.shape) 
# Expected output: torch.Size([1, 196, 768]) 
# (1 batch, 196 patches (14x14), 768 embedding dimension)
```

### Checklist / Exercise

1.  **Compare & Contrast:** Explain the fundamental difference between how SimCLR and MAE generate their "self-supervisory" signals. What are the advantages of each?
2.  **ViT vs. CNN:** Describe how a Vision Transformer processes an image differently from a traditional Convolutional Neural Network (at a high level), particularly focusing on how ViT handles spatial information.
3.  **Scalability in Transformers:** What is the primary computational bottleneck for applying standard self-attention to high-resolution images, and how do architectures like Swin Transformers mitigate this issue?