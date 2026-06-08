# Recurrent Neural Networks (RNNs) & Sequence Models

## 1. Introduction to Sequential Data and Recurrent Neural Networks (RNNs)

Sequential data is data where the order matters. Examples include:
*   **Text:** Words in a sentence.
*   **Time Series:** Stock prices over time, sensor readings.
*   **Audio:** Speech waveforms.
*   **Video:** Frames in a video.

Traditional Neural Networks (like MLPs or CNNs) are not ideal for sequential data because:
1.  They assume fixed-size inputs.
2.  They lack a "memory" of past inputs in a sequence.

**Recurrent Neural Networks (RNNs)** are designed to process sequential data by maintaining an internal memory (hidden state) that captures information from previous time steps.

### Core Concept of RNNs
At each time step `t`:
*   The RNN takes the current input `Xt` and the previous hidden state `Ht-1`.
*   It computes the current hidden state `Ht` (which is passed to the next time step).
*   It can optionally produce an output `Ot`.

The key idea is that the same set of weights is applied at each time step, allowing the network to "remember" patterns over time.

## 2. Types of Recurrent Neural Networks

### 2.1 Simple RNNs
*   **Architecture:** Consists of an input layer, a hidden layer with recurrent connections, and an output layer.
*   **Limitations:**
    *   **Vanishing/Exploding Gradients:** Due to the repeated multiplication of weights over many time steps, gradients can either shrink to zero (vanishing) or grow exponentially (exploding), making it difficult to learn long-term dependencies.
    *   **Short-term Memory:** Effectively, simple RNNs struggle to connect information if the gap between relevant data points is large.

### 2.2 Long Short-Term Memory (LSTMs)
LSTMs were introduced to address the vanishing gradient problem and capture long-range dependencies. They achieve this through a "cell state" and several "gates" that control the flow of information.

*   **Cell State (Ct):** Acts as a "memory conveyor belt" that runs straight through the entire chain, allowing information to be carried forward with minimal alteration.
*   **Gates:** Sigmoid neural network layers and element-wise multiplication operations.
    *   **Forget Gate (ft):** Decides what information from the previous cell state `Ct-1` should be thrown away.
    *   **Input Gate (it):** Decides what new information from the current input `Xt` and previous hidden state `Ht-1` should be stored in the cell state. It also creates a candidate new value `C̃t` for the cell state.
    *   **Output Gate (ot):** Decides what part of the cell state `Ct` should be outputted as the hidden state `Ht`.

### 2.3 Gated Recurrent Units (GRUs)
GRUs are a simpler variant of LSTMs, often offering comparable performance with fewer parameters. They combine the forget and input gates into a single "update gate" and also merge the cell state and hidden state.

*   **Update Gate (zt):** Determines how much of the past information (from `Ht-1`) to carry forward and how much new information (from `Xt`) to add.
*   **Reset Gate (rt):** Decides how much of the past hidden state `Ht-1` to forget for calculating the new candidate hidden state.

## 3. Word Embedding Techniques

Word embeddings represent words as dense, real-valued vectors in a continuous vector space, capturing semantic and syntactic relationships.

### 3.1 Word2Vec
An unsupervised learning model that learns word embeddings by predicting context from a target word or vice-versa.
*   **Skip-gram:** Predicts surrounding words given a central word.
*   **Continuous Bag-of-Words (CBOW):** Predicts a central word given its surrounding context words.

### 3.2 GloVe (Global Vectors for Word Representation)
Combines count-based matrix factorization methods (like Latent Semantic Analysis) with local context window methods (like Word2Vec). It uses global word-word co-occurrence statistics from a corpus to learn embeddings.

### 3.3 FastText
An extension of Word2Vec developed by Facebook. It represents words as bags of character n-grams.
*   **Advantage:** Can generate embeddings for out-of-vocabulary (OOV) words by summing its character n-grams. Also effective for morphologically rich languages.

## 4. Encoder-Decoder Architectures (Sequence-to-Sequence Models)

Sequence-to-sequence (seq2seq) models are designed for tasks where the input and output are both sequences, and their lengths can differ (e.g., machine translation).

*   **Encoder:** Typically an RNN (LSTM or GRU) that reads the input sequence one element at a time, compressing all the information into a fixed-size context vector (the final hidden state).
*   **Decoder:** Another RNN that takes the context vector from the encoder as its initial hidden state and generates the output sequence one element at a time.

**Applications:**
*   Machine Translation
*   Text Summarization
*   Chatbots

Often, an **Attention Mechanism** is integrated into seq2seq models to allow the decoder to focus on different parts of the input sequence at each decoding step, improving performance, especially for longer sequences.

## 5. Practical Applications

*   **Sentiment Analysis:** Classifying the emotional tone of text (positive, negative, neutral) using LSTMs/GRUs with word embeddings.
*   **Machine Translation:** Translating text from one language to another using encoder-decoder architectures.
*   **Time Series Prediction:** Forecasting future values in sequential data (e.g., stock prices, weather) using LSTMs/GRUs.
*   **Text Generation:** Generating new text character by character or word by word.

## 6. Code Example: Basic LSTM for Sequence Classification (Keras)

Here's a simple example of how to define an LSTM layer in Keras for a hypothetical sequence classification task.

```python
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Embedding, LSTM, Dense
from tensorflow.keras.preprocessing.sequence import pad_sequences
import numpy as np

# 1. Prepare some dummy sequence data
vocab_size = 10000
max_sequence_length = 200
embedding_dim = 128
num_classes = 2

# Simulate some input sequences (e.g., movie review indices)
X_train = [np.random.randint(1, vocab_size, size=np.random.randint(50, max_sequence_length))
           for _ in range(1000)]
y_train = np.random.randint(0, num_classes, size=1000)

# Pad sequences to ensure uniform length
X_train_padded = pad_sequences(X_train, maxlen=max_sequence_length, padding='post', value=0)

# 2. Build the LSTM model
model = Sequential([
    # Embedding layer converts word indices to dense vectors
    Embedding(vocab_size, embedding_dim, input_length=max_sequence_length),
    # LSTM layer processes the sequence
    LSTM(128, return_sequences=False), # return_sequences=False for classification (last hidden state)
    # Output dense layer for classification
    Dense(num_classes, activation='softmax')
])

# 3. Compile the model
model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])

# 4. Print model summary
model.summary()

# (Optional) You would then train the model:
# model.fit(X_train_padded, y_train, epochs=5, batch_size=32, validation_split=0.2)
```

## 7. Quick Understanding Checklist/Exercise

1.  **Distinguish:** Explain the primary limitation of a simple RNN and how LSTMs (or GRUs) overcome it.
2.  **Apply:** If you were building a system to translate speech to text, which core architectural component (RNN, LSTM, GRU, Encoder-Decoder) would be most suitable for processing the audio sequence into a context representation? Why?
3.  **Compare:** What is the key advantage of FastText over Word2Vec when dealing with rare words or languages with complex morphology?