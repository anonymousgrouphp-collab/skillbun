# Practice Lab: RAG Retrieval and Grounding Debugging

Welcome to this practice lab focusing on the critical skill of debugging Retrieval Augmented Generation (RAG) systems. While RAG significantly enhances the reliability and factual accuracy of Large Language Models (LLMs) by grounding their responses in external knowledge, these systems are complex and prone to issues. This lab will provide hands-on insights into identifying and resolving common RAG problems related to retrieval and grounding.

## 1. Understanding RAG Debugging Fundamentals

Debugging a RAG system primarily involves ensuring two key stages work correctly:
1.  **Retrieval:** The system's ability to fetch *relevant* and *sufficient* context from a knowledge base.
2.  **Grounding:** The LLM's ability to *faithfully use* the provided context to generate an answer without hallucinating or introducing unsupported information.

## 2. Debugging Retrieval Issues

Poor retrieval is often the root cause of many RAG failures. If the LLM doesn't receive the correct information, it cannot generate an accurate grounded response.

### Core Concepts for Retrieval Debugging:

*   **Chunking Strategies:** How you break down your source documents into retrievable chunks (text units) dramatically impacts retrieval quality.
    *   **Chunk Size:** Too small might split critical context; too large might introduce irrelevant noise. Experiment with sizes (e.g., 256, 512, 1024 tokens) and overlap (e.g., 10-20% overlap).
    *   **Chunking Methods:** Simple character splitting, recursive character splitting, semantic chunking, code-aware chunking, markdown chunking.
    *   **Metadata:** Rich metadata (source, author, date, section) attached to chunks can be used for filtering and improving retrieval relevance.
*   **Identifying Retrieval Misses:** Occur when the query fails to retrieve the necessary information from the vector store.
    *   **Symptoms:** LLM responses like "I don't know," generic answers, or answers that seem to lack specific details from your knowledge base.
    *   **Debugging:** Manually inspect the retrieved documents for a given query. Is the information you expect present? Is it ranked highly?
*   **Impact of Embedding Models:** The choice of embedding model (e.g., OpenAI `text-embedding-ada-002`, `text-embedding-3-small`, `text-embedding-3-large`, various open-source models) directly influences how queries and chunks are vectorized and compared for similarity.
    *   **Debugging:** Different models produce different vector spaces. A model optimized for semantic similarity might perform better than a general-purpose one for specific domains. Test different models and observe retrieval results.
*   **Retrieval Augmentation Techniques:** Beyond simple similarity search, consider using:
    *   **Hybrid Search:** Combining vector similarity with keyword search (BM25, TF-IDF).
    *   **Re-ranking:** Using a separate model (e.g., a cross-encoder) to re-rank the top-K retrieved documents, prioritizing the most relevant ones.
    *   **Query Transformation:** Rewriting or expanding the user's query to improve search effectiveness.

### Example: Inspecting Retrieved Chunks (Python with LangChain)

```python
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain.docstore.document import Document

# Sample data
text = """
The Amazon rainforest is the largest rainforest in the world, covering an area of 5.5 million square kilometers.
It is home to an incredible diversity of wildlife, including jaguars, sloths, and anacondas.
The Amazon River, which flows through the rainforest, is the second-longest river in the world.
Deforestation is a major threat to the Amazon, primarily driven by agriculture and logging.
"""

# Create documents
docs = [Document(page_content=text, metadata={"source": "wikipedia", "date": "2023-01-01"})]

# Configure text splitter
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=100,
    chunk_overlap=20,
    length_function=len,
    is_separator_regex=False,
)
chunks = text_splitter.split_documents(docs)

# Create a vector store (using a dummy API key for illustration)
# Replace with actual API key or local embeddings for production
embeddings = OpenAIEmbeddings(openai_api_key="YOUR_OPENAI_API_KEY")
vectorstore = FAISS.from_documents(chunks, embeddings)

# Simulate a user query
query = "What are the main threats to the Amazon rainforest?"

# Perform retrieval
retrieved_docs = vectorstore.similarity_search(query, k=3)

print(f"Query: '{query}'")
print("\n--- Retrieved Documents ---")
for i, doc in enumerate(retrieved_docs):
    print(f"Document {i+1} (Score: {doc.metadata.get('score', 'N/A')}):") # Note: FAISS doesn't directly expose score in similarity_search
    print(f"Content: '{doc.page_content}'")
    print(f"Metadata: {doc.metadata}")
    print("---")
```
*(Note: For actual similarity scores in LangChain, you'd typically use `similarity_search_with_score` or an evaluation framework.)*

This code snippet shows how to manually inspect the content and metadata of documents retrieved for a specific query. This is the first step in identifying if relevant information is being fetched.

## 3. Debugging Grounding Issues

Even with perfect retrieval, the LLM might still produce incorrect or ungrounded answers. This is where grounding debugging comes in.

### Core Concepts for Grounding Debugging:

*   **Citation Accuracy:** Verifying that the LLM's generated response correctly attributes information to the provided source chunks and that the cited information truly exists within those chunks.
    *   **Debugging:** Manually cross-reference specific facts in the LLM's answer with the retrieved documents. Automated evaluation tools can help quantify this.
*   **Troubleshooting Hallucinations:** When the LLM generates information that is not supported by the provided context.
    *   **Symptoms:** Factual inaccuracies, invented details, or confident assertions not found in the retrieved documents.
    *   **Causes:** Weak grounding prompt, LLM's internal knowledge overriding context, insufficient or contradictory retrieved context.
*   **Impact of Prompt Engineering:** The system prompt plays a crucial role in instructing the LLM to *only* use the provided context and avoid making up information.
    *   **Debugging:** Experiment with different prompt instructions (e.g., "Answer based *only* on the provided context.", "If the answer is not in the context, state that you don't know.") and observe changes in grounding.
*   **Evaluation Metrics:**
    *   **Faithfulness:** Measures how much of the generated answer is supported by the retrieved context.
    *   **Answer Relevancy:** Measures how relevant the generated answer is to the user's query.
    *   **Context Relevancy:** Measures how relevant the retrieved context is to the user's query.

### Techniques for Improving Grounding:

*   **Strict Prompting:** Explicitly tell the LLM to stick to the provided context.
*   **Fact-Checking LLMs:** Use a separate LLM to verify facts in the generated answer against the source documents.
*   **Confidence Scores:** Some RAG frameworks can estimate the LLM's confidence in its answer, which can be used to flag potentially ungrounded responses.
*   **Iterative Testing:** Continuously refine chunking, retrieval methods, and prompts based on evaluation results.

## 4. Practice Lab Checklist/Exercise

1.  **Chunking Strategy Experiment:** Take a moderately sized document (e.g., a few paragraphs or a small article). Experiment with two different `chunk_size` and `chunk_overlap` values using `RecursiveCharacterTextSplitter`. For a specific query, perform retrieval with both strategies and compare the content of the top-3 retrieved chunks. Which strategy provides more coherent and relevant information for your query?
2.  **Identify a Retrieval Miss:** Design a simple RAG setup with a small corpus of documents. Craft a query that you suspect will lead to a retrieval miss (i.e., the most relevant information is not among the top-k retrieved documents). Use the `similarity_search` or `similarity_search_with_score` method to retrieve documents and verify if your suspicion is correct. How would you attempt to fix this (e.g., re-chunking, query rewriting)?
3.  **Prompt for Grounding:** Create a basic RAG system. First, use a permissive prompt (e.g., "Answer the question"). Then, modify the prompt to be very strict about grounding (e.g., "Answer the question based *only* on the provided context. If the context does not contain the answer, state 'I don't have enough information from the provided context.'"). Compare the LLM's answers for a query where the context is incomplete or ambiguous. Observe how the strict prompt helps prevent hallucinations.