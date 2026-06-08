# Retrieval Augmented Generation (RAG) Systems

Retrieval Augmented Generation (RAG) is a powerful technique that enhances the capabilities of Large Language Models (LLMs) by grounding them in external, up-to-date, and domain-specific knowledge. Unlike fine-tuning, RAG allows LLMs to access and incorporate information from a vast corpus of documents, reducing hallucinations and providing more accurate, attributable, and relevant responses without altering the LLM's core weights.

## 1. Core Components of a RAG System

A typical RAG system involves several key steps:

### 1.1 Document Loading

The first step is to ingest data from various sources (PDFs, websites, databases, Markdown files, etc.). Libraries like LangChain's `DocumentLoader` interface provide a unified way to load diverse document types into a standardized format (e.g., `Document` objects).

### 1.2 Text Chunking Strategies

Once documents are loaded, they are broken down into smaller, manageable "chunks." This is crucial because LLMs have token limits, and smaller chunks lead to more precise retrieval.

*   **Fixed Size Chunking:** Divides text into chunks of a predefined character/token count, often with an overlap to maintain context.
    *   *Pros:* Simple to implement.
    *   *Cons:* Can cut sentences or paragraphs mid-way, losing semantic coherence.
*   **Recursive Chunking:** Attempts to preserve semantic units by splitting text using a list of separators (e.g., paragraph, sentence, word). It tries the first separator; if the chunk is still too large, it tries the next, and so on.
    *   *Pros:* Better preserves context.
    *   *Cons:* Can still break semantically related text if separators are not chosen carefully.
*   **Semantic Chunking:** Uses embedding models to identify semantic boundaries, grouping sentences or paragraphs that are semantically similar into chunks.
    *   *Pros:* Creates highly coherent chunks, leading to better retrieval.
    *   *Cons:* More complex to implement, computationally more intensive.

### 1.3 Embedding Models

Embedding models convert text chunks into numerical representations called "embeddings" (dense vector representations). These vectors capture the semantic meaning of the text, allowing for efficient similarity comparisons.

*   **Types:**
    *   **Open-source:** Hugging Face models (e.g., `all-MiniLM-L6-v2`, `BAAI/bge-small-en-v1.5`).
    *   **Proprietary/Commercial:** OpenAI's `text-embedding-ada-002` or `text-embedding-3-small/large`, Cohere Embed.

Choosing an appropriate embedding model significantly impacts retrieval quality.

### 1.4 Vector Databases

Vector databases are specialized databases designed to store, index, and query these high-dimensional embedding vectors efficiently. They enable fast similarity searches (e.g., nearest neighbor search) to find the most relevant chunks based on a query's embedding.

*   **Examples:**
    *   **Chroma:** Open-source, lightweight, in-memory or persistent. Good for local development and smaller-scale applications.
    *   **Pinecone:** Managed service, highly scalable, optimized for production workloads with large datasets.
    *   **Weaviate:** Open-source, cloud-native, supports various data types, and has built-in features for semantic search.
    *   Others: Milvus, Qdrant, Faiss (library, not full DB).

### 1.5 Advanced Retrieval Techniques

*   **Semantic Search:** Queries the vector database to find chunks whose embeddings are most similar to the query's embedding. This identifies documents that are conceptually related, even if they don't share exact keywords.
*   **Hybrid Search:** Combines semantic search with keyword-based search (e.g., BM25 or TF-IDF). This captures both semantic relevance and exact keyword matches, often leading to more robust retrieval.
*   **Multi-query/HyDE:** Generate multiple hypothetical queries or a hypothetical document from the user's initial query to retrieve more diverse results.
*   **Contextual Compression/Parent Document Retriever:** Retrieve a small, relevant chunk, but then retrieve the larger "parent" document or surrounding context of that chunk to provide more comprehensive information to the LLM.

### 1.6 Re-ranking Algorithms

After initial retrieval, a re-ranking step can further refine the relevance of the retrieved chunks. A re-ranker (often a smaller, specialized language model) takes the user query and the retrieved chunks, and re-orders them based on a more nuanced understanding of relevance. This helps discard less relevant chunks and prioritize the most pertinent ones, improving the quality of the final LLM response.

### 1.7 Integrating Citations for Source Attribution

A critical aspect of RAG is transparency. By linking generated answers back to the specific source documents or chunks used, users can verify the information. This involves including metadata (like page numbers, document titles, or URLs) with the retrieved chunks and presenting them alongside the LLM's answer.

## 2. Implementing a Basic RAG Pipeline (Conceptual Example)

Here's a conceptual overview of a RAG pipeline using Python-like pseudocode:

```python
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from langchain_openai import ChatOpenAI # Or any other LLM

# 1. Load Documents
loader = PyPDFLoader("your_document.pdf")
documents = loader.load()

# 2. Chunk Documents
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200
)
chunks = text_splitter.split_documents(documents)

# 3. Create Embeddings & Store in Vector DB
embeddings_model = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
vector_db = Chroma.from_documents(chunks, embeddings_model, persist_directory="./chroma_db")
retriever = vector_db.as_retriever()

# 4. Define LLM and Prompt
llm = ChatOpenAI(model="gpt-4", temperature=0)
prompt_template = """
You are an AI assistant that answers questions based on the provided context.
If you cannot find the answer in the context, state that you don't know.
Context: {context}
Question: {question}
Answer:
"""
prompt = ChatPromptTemplate.from_template(prompt_template)

# 5. Build the RAG Chain
rag_chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)

# 6. Query the RAG System
user_query = "What is the main topic discussed in the document?"
response = rag_chain.invoke(user_query)
print(response)

# Example to get sources (requires modification to the chain to return context)
# You'd typically modify the chain to return source metadata along with the answer.
# for doc in retriever.get_relevant_documents(user_query):
#     print(f"Source: {doc.metadata.get('source')}, Page: {doc.metadata.get('page')}")
```

## 3. Debugging Retrieval Quality and Minimizing Hallucinations

*   **Retrieval Quality:** The most common source of RAG issues.
    *   **Chunk Size & Strategy:** Experiment with different chunk sizes, overlaps, and chunking methods (fixed, recursive, semantic). Too large, and LLM gets irrelevant info; too small, and context is lost.
    *   **Embedding Model Choice:** Use a high-quality embedding model relevant to your domain.
    *   **Vector Database Tuning:** Understand indexing parameters and similarity metrics.
    *   **Advanced Retrieval:** Implement hybrid search, re-ranking, or parent document retrieval if simple semantic search is insufficient.
*   **Minimizing Hallucinations:**
    *   **Prompt Engineering:** Clearly instruct the LLM to only answer based on the provided context and to state if the answer is not found.
    *   **Re-ranking:** Ensure only the most relevant chunks reach the LLM.
    *   **Context Window Management:** Ensure the retrieved context fits within the LLM's context window.
    *   **Evaluation Metrics:** Use RAG-specific evaluation metrics (e.g., RAGAS, faithfulness, answer relevance, context precision/recall) to systematically test and improve your system.

## Quick Check for Understanding

1.  Explain why text chunking is a critical step in building an effective RAG system.
2.  Name at least three different vector databases and briefly describe their primary use cases.
3.  How does integrating re-ranking algorithms help improve the quality of responses generated by a RAG system?