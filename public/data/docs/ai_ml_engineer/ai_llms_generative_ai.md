# Large Language Models (LLMs) & Generative AI: A Study Guide

This guide explores the foundational concepts, architectures, and advanced techniques related to Large Language Models (LLMs) and the broader field of Generative AI. We'll cover everything from prompt engineering to advanced fine-tuning and evaluation strategies.

## 1. Introduction to Generative AI & LLMs

**Generative AI** refers to artificial intelligence systems capable of generating new content, rather than merely analyzing or classifying existing data. This content can include text, images, audio, video, and more. Generative AI models learn patterns and structures from large datasets and then use that knowledge to create novel outputs that resemble the training data but are not identical to it.

**Large Language Models (LLMs)** are a specific class of generative AI models primarily focused on understanding and generating human-like text. They are typically built on the Transformer architecture and trained on vast amounts of text data, allowing them to perform a wide range of natural language tasks, including text generation, translation, summarization, and question answering.

## 2. Foundational LLM Architectures

The dominant architecture for modern LLMs is the **Transformer**, introduced by Google in 2017. Transformers leverage a mechanism called **self-attention** to weigh the importance of different words in the input sequence when processing each word, allowing them to capture long-range dependencies efficiently.

Transformers come in two main flavors relevant to LLMs:
*   **Encoder-Decoder Transformers:** Used for sequence-to-sequence tasks (e.g., translation, summarization) where an encoder processes the input and a decoder generates the output. (e.g., T5)
*   **Decoder-only Transformers:** Predominantly used for LLMs focused on text generation. These models predict the next token in a sequence based on all previous tokens. (e.g., GPT series)

## 3. Pretraining Objectives

LLMs are pretrained on massive text corpora using various objectives to learn language patterns:
*   **Causal Language Modeling (CLM):** The most common objective for decoder-only models. The model is trained to predict the next word in a sequence given the preceding words. This forces the model to learn the structure and flow of language.
*   **Masked Language Modeling (MLM):** Used by encoder-decoder models (like BERT). A certain percentage of tokens in the input sequence are masked, and the model is trained to predict the original masked tokens based on their surrounding context.
*   **Next-Token Prediction:** A specific instantiation of CLM, where the model's primary goal is to accurately predict the subsequent token, iteratively building up a coherent text sequence.

## 4. Prompt Engineering Techniques

**Prompt engineering** is the art and science of crafting effective inputs (prompts) to guide LLMs to produce desired outputs. Key techniques include:

*   **Zero-Shot Prompting:** Providing a prompt to the LLM without any examples. The model relies solely on its pre-trained knowledge to generate a response.
    ```
    Prompt: "Classify the sentiment of the following text as positive, negative, or neutral: 'I loved the movie, it was fantastic!'"
    ```
*   **Few-Shot Prompting:** Including a few input-output examples directly within the prompt to demonstrate the desired task and format, allowing the model to learn in-context.
    ```
    Prompt:
    "Translate the following English sentences to French:
    English: Hello, how are you?
    French: Bonjour, comment allez-vous?
    English: Thank you very much.
    French: Merci beaucoup.
    English: What is your name?
    French: "
    ```
*   **Chain-of-Thought (CoT) Prompting:** Encouraging the LLM to explain its reasoning process step-by-step before arriving at the final answer. This often leads to more accurate and coherent results, especially for complex reasoning tasks.
    ```
    Prompt: "Q: The odd numbers in this group add up to an even number: 4, 8, 9, 15, 12, 2, 1. Explain your reasoning and then provide the answer."
    ```
*   **Self-Consistency:** A technique that generates multiple Chain-of-Thought explanations for a given problem and then selects the most consistent answer by taking a majority vote among the different reasoning paths. This improves robustness and accuracy.

## 5. Advanced Fine-tuning Techniques

While pretraining builds a general language understanding, fine-tuning adapts LLMs to specific downstream tasks or domains.

*   **LoRA (Low-Rank Adaptation):** An efficient fine-tuning method that injects trainable low-rank matrices into the Transformer layers of a pre-trained model. Instead of fine-tuning all model parameters, LoRA only updates these much smaller rank decomposition matrices, significantly reducing the number of trainable parameters and computational cost.
*   **QLoRA (Quantized LoRA):** An extension of LoRA that quantizes the pre-trained LLM weights to 4-bit precision. This drastically reduces memory usage during fine-tuning, allowing larger models to be fine-tuned on consumer GPUs, while still applying LoRA for parameter-efficient updates.
*   **Reinforcement Learning from Human Feedback (RLHF):** A crucial technique for aligning LLMs with human values, preferences, and instructions. It involves:
    1.  **Collecting human preferences:** Humans rank or compare different model outputs.
    2.  **Training a reward model:** A separate model is trained to predict human preferences based on these rankings.
    3.  **Fine-tuning the LLM with RL:** The LLM is then fine-tuned using reinforcement learning (e.g., Proximal Policy Optimization - PPO) to maximize the reward predicted by the reward model, effectively making the LLM's outputs more aligned with human expectations.

## 6. Retrieval Augmented Generation (RAG)

**Retrieval Augmented Generation (RAG)** is a technique that enhances LLMs by allowing them to retrieve relevant information from an external knowledge base before generating a response. This addresses common LLM limitations like hallucination (generating factually incorrect information) and outdated knowledge.

**How RAG works:**
1.  **User Query:** A user asks a question or provides a prompt.
2.  **Retrieval:** The system searches a database (e.g., vector database of documents, articles, internal knowledge base) for information relevant to the query.
3.  **Augmentation:** The retrieved documents are then provided to the LLM along with the original query as additional context.
4.  **Generation:** The LLM generates a response using both its internal knowledge and the provided external context, leading to more accurate, up-to-date, and grounded answers.

## 7. Robust Evaluation Strategies for Generative AI

Evaluating generative models, especially LLMs, is challenging due to the open-ended nature of their outputs. Evaluation can be broadly categorized:

*   **Qualitative Evaluation (Human Evaluation):** Subjective assessment by human annotators who judge aspects like coherence, relevance, factual accuracy, fluency, toxicity, and helpfulness. This is often the gold standard but can be slow and expensive.
*   **Quantitative Evaluation (Automated Metrics):**
    *   **For LLMs (text generation):**
        *   **Perplexity:** Measures how well a probability model predicts a sample. Lower perplexity generally indicates a better model.
        *   **ROUGE (Recall-Oriented Understudy for Gisting Evaluation):** Compares an automatically produced summary or translation against a set of reference summaries. Measures overlap of n-grams.
        *   **BLEU (Bilingual Evaluation Understudy):** Primarily for machine translation. Measures the similarity between the machine-generated text and a set of high-quality reference translations.
        *   **BERTScore:** A more advanced metric that uses contextual embeddings (from BERT) to calculate a similarity score between generated and reference sentences, addressing some limitations of n-gram overlap metrics.
        *   **Factual Consistency Metrics:** Specialized metrics or LLM-based evaluators designed to check if generated text aligns with factual information from source documents.
    *   **For other generative models (e.g., images):**
        *   **FID (Frechet Inception Distance):** Measures the similarity between the distributions of real and generated images. Lower FID is better.
        *   **Inception Score (IS):** Evaluates the quality and diversity of generated images using a pre-trained Inception model. Higher IS is better.

## 8. Other Generative Models

While LLMs dominate text generation, other architectures have been pivotal in different domains:

*   **Generative Adversarial Networks (GANs):** Composed of two neural networks, a **Generator** and a **Discriminator**, that compete in a zero-sum game. The Generator tries to create realistic data (e.g., images) to fool the Discriminator, while the Discriminator tries to distinguish between real and fake data. GANs are renowned for generating highly realistic images and data.
*   **Variational Autoencoders (VAEs):** A type of generative model that learns a compressed, continuous **latent space** representation of the input data. It consists of an **Encoder** (maps input to latent space distribution) and a **Decoder** (reconstructs input from latent space samples). VAEs are good for generating diverse data, learning disentangled representations, and interpolating between data points.

### Quick Checklist/Exercise:
1.  Describe the primary difference between zero-shot and few-shot prompting, providing a brief example for each.
2.  Explain the core problem that Retrieval Augmented Generation (RAG) aims to solve for LLMs and how it achieves this.
3.  In your own words, outline the three main steps involved in Reinforcement Learning from Human Feedback (RLHF).
