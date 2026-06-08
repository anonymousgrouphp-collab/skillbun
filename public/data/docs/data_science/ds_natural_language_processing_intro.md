# Introduction to Natural Language Processing (NLP)

Natural Language Processing (NLP) is a subfield of artificial intelligence that enables computers to understand, interpret, and generate human language. It combines computational linguistics—rule-based modeling of human language—with statistical, machine learning, and deep learning models.

## 1. Fundamentals of NLP

At its core, NLP aims to bridge the gap between human communication and computer understanding. It involves processing raw text data to extract meaningful information, enabling tasks like translation, summarization, sentiment analysis, and question answering.

## 2. Text Preprocessing

Before any advanced NLP task, text data must be cleaned and prepared. This stage is crucial for reducing noise and standardizing the text.

*   **Tokenization:** Breaking down text into smaller units (tokens), which can be words, subwords, or characters. For example, "Hello, world!" becomes ["Hello", ",", "world", "!"]
*   **Stemming:** Reducing words to their root or stem form. This is a heuristic process that often chops off suffixes. For instance, "running", "runs", "runner" might all become "run". It's often less accurate than lemmatization.
*   **Lemmatization:** Reducing words to their base or dictionary form (lemma). This process considers the word's morphological analysis and typically requires a vocabulary and morphological analyzer. For example, "better" becomes "good", and "running" becomes "run".

### Code Example: Text Preprocessing with NLTK

```python
import nltk
from nltk.tokenize import word_tokenize
from nltk.stem import PorterStemmer, WordNetLemmatizer
from nltk.corpus import stopwords

# Download necessary NLTK data (run once)
# nltk.download('punkt')
# nltk.download('wordnet')
# nltk.download('stopwords')

text = "NLP is fascinating. It's helping computers understand human languages better than ever before."

# 1. Tokenization
tokens = word_tokenize(text.lower())
print(f"Tokens: {tokens}")

# 2. Stopword Removal
stop_words = set(stopwords.words('english'))
filtered_tokens = [word for word in tokens if word.isalpha() and word not in stop_words]
print(f"Filtered Tokens (no stopwords): {filtered_tokens}")

# 3. Stemming
stemmer = PorterStemmer()
stemmed_words = [stemmer.stem(word) for word in filtered_tokens]
print(f"Stemmed Words: {stemmed_words}")

# 4. Lemmatization
lemmatizer = WordNetLemmatizer()
lemmatized_words = [lemmatizer.lemmatize(word) for word in filtered_tokens]
print(f"Lemmatized Words: {lemmatized_words}")
```

## 3. Text Representation

Computers cannot directly understand text; they need numerical representations.

*   **Bag-of-Words (BoW):** Represents a document as an unordered collection of words, disregarding grammar and word order but keeping multiplicity. Each unique word in the corpus becomes a feature, and the value is its frequency in the document.
*   **TF-IDF (Term Frequency-Inverse Document Frequency):** A statistical measure that evaluates how relevant a word is to a document in a collection of documents. It's the product of two terms: Term Frequency (TF) and Inverse Document Frequency (IDF).
    *   **TF:** How often a word appears in a document.
    *   **IDF:** Measures how important a word is. Words that are common across many documents (like "the", "is") get a lower IDF score.

## 4. Sentiment Analysis

Sentiment analysis (or opinion mining) is the process of computationally identifying and categorizing opinions expressed in a piece of text, especially to determine whether the writer's attitude towards a particular topic, product, etc., is positive, negative, or neutral.

*   **Lexicon-based approaches:** Use predefined dictionaries of words with associated sentiment scores.
*   **Machine learning approaches:** Train classification models (e.g., Naive Bayes, SVM, neural networks) on labeled datasets of text with sentiment labels.

## 5. Topic Modeling (LDA)

Topic modeling is a type of statistical model for discovering the abstract "topics" that occur in a collection of documents. It's a method for unsupervised classification of documents.

*   **Latent Dirichlet Allocation (LDA):** One of the most popular topic modeling algorithms. LDA assumes that documents are a mixture of various topics, and each topic is a mixture of words. It finds the probability distribution of topics in documents and words in topics.

## 6. Introduction to Word Embeddings

Word embeddings are dense vector representations of words that capture semantic and syntactic relationships. Words with similar meanings have similar vector representations.

*   **Word2Vec:** A popular technique to learn word embeddings. It comes in two main architectures:
    *   **Skip-gram:** Predicts context words given a target word.
    *   **CBOW (Continuous Bag-of-Words):** Predicts a target word given its context words.
*   **GloVe (Global Vectors for Word Representation):** An unsupervised learning algorithm for obtaining vector representations for words. It builds upon both global matrix factorization and local context window methods.

## 7. Transformer Models (BERT, GPT basics)

Transformer models revolutionized NLP by introducing the attention mechanism, allowing the model to weigh the importance of different words in a sequence when processing a specific word.

*   **BERT (Bidirectional Encoder Representations from Transformers):** Developed by Google, BERT is a pre-trained transformer-based model that can understand the context of a word based on all its surrounding words (bidirectionally). It excels at tasks like question answering and sentiment classification.
*   **GPT (Generative Pre-trained Transformer):** Developed by OpenAI, GPT models are decoder-only transformer architectures primarily used for text generation. They predict the next word in a sequence based on the preceding words, exhibiting remarkable capabilities in creative writing, summarization, and conversation.

## Quick Understanding Checklist/Exercise:

1.  Explain the key difference between stemming and lemmatization, and provide an example where one might be preferred over the other.
2.  Describe how TF-IDF helps identify important words in a document within a larger corpus, contrasting it with simple word count (Bag-of-Words frequency).
3.  Briefly summarize the core concept of word embeddings and how they differ from traditional text representation methods like BoW or TF-IDF in capturing semantic meaning.
