# Core Prompt Engineering Techniques: Study Guide

Prompt engineering is the art and science of communicating effectively with large language models (LLMs) to achieve desired outcomes. It involves designing and refining inputs (prompts) to guide the model's behavior, ensuring it generates relevant, accurate, and high-quality responses. Mastering prompt engineering is crucial for building reliable and powerful generative AI applications.

## 1. Fundamental Prompting Techniques

### A. Zero-Shot Prompting

*   **Concept**: The model is asked to perform a task without any examples. It relies solely on its pre-trained knowledge to understand the instruction and generate a response.
*   **Use Case**: Simple, straightforward tasks where the model's general understanding is sufficient, such as answering factual questions or basic summarization.

*   **Example**:
    ```
    Prompt: What is the capital of Japan?
    ```

### B. Few-Shot Prompting

*   **Concept**: The model is provided with a few input-output examples that demonstrate the desired task or format. This helps the model infer the pattern, style, or specific instruction required.
*   **Use Case**: Tasks requiring a specific output format, tone, style, or when the model needs to learn a new pattern that isn't explicitly part of its pre-training.

*   **Example**:
    ```
    Prompt:
    Translate the following English words to German:
    Apple: Apfel
    House: Haus
    Cat: Katze
    Dog:
    ```

### C. Chain-of-Thought (CoT) Prompting

*   **Concept**: CoT prompting encourages the model to break down complex problems into intermediate reasoning steps before arriving at the final answer. This mimics human thought processes and improves the model's ability to tackle complex reasoning tasks.
*   **Use Case**: Mathematical word problems, multi-step reasoning, complex logical deductions, or any task where the final answer benefits from explicit intermediate steps.

*   **Example**:
    ```
    Prompt:
    Q: Roger has 5 tennis balls. He buys 2 more cans of tennis balls. Each can has 3 tennis balls. How many tennis balls does he have now?
    A: Roger started with 5 balls. He bought 2 cans, and each can has 3 tennis balls, so he bought 2 * 3 = 6 balls. In total, he has 5 + 6 = 11 balls.
    ```
    (The model learns to show its reasoning before giving the final answer.)

## 2. Advanced Prompting Strategies

### A. Crafting Effective System Messages

*   **Concept**: System messages are instructions provided to the model *before* the user's turn. They define the model's role, personality, constraints, and overall behavior, establishing the context for the entire conversation.
*   **Use Case**: Setting up conversational AI agents, enforcing safety guidelines, defining the AI's identity (e.g., a helpful assistant, a code reviewer), or providing specific instructions for interaction.

*   **Example**:
    ```
    System: You are a friendly chatbot designed to provide concise summaries of news articles. Always keep responses under 50 words and maintain a neutral tone.
    User: Summarize the latest developments in AI ethics.
    ```

### B. Persona-Based Prompting

*   **Concept**: Assigning a specific persona or role to the model within the prompt itself. This allows the model to adopt a particular style, tone, and knowledge base, making its responses more tailored and contextually appropriate.
*   **Use Case**: Simulating experts (e.g., a doctor, a software engineer, a poet), generating creative content in a specific voice, or adapting to different user needs.

*   **Example**:
    ```
    Prompt: Act as a seasoned travel agent specializing in eco-tourism. Recommend three sustainable travel destinations in South America, highlighting their unique features.
    ```

### C. Output Format Specification

*   **Concept**: Explicitly instructing the model to generate output in a predefined structured format, such as JSON, Markdown, XML, or a specific delimited string. This is crucial for integrating LLM outputs into applications or for ensuring consistency.
*   **Use Case**: API integrations, data parsing, generating configuration files, creating structured reports, or ensuring consistent formatting for human readability.

*   **Examples**:
    *   **JSON Output**:
        ```
        Prompt:
        Generate a JSON object for a product named "Wireless Headphones" with a price of 99.99 and a stock quantity of 50. Include keys for "product_name", "price", and "stock".
        ```
    *   **Markdown Output**:
        ```
        Prompt:
        Summarize the key benefits of cloud computing in Markdown format, using a level 2 heading for the title and an unordered list for the benefits.
        ```

## 3. Prompt Iteration for Improved Performance

Prompt engineering is an iterative process. Rarely will your first prompt yield the perfect result. Iteration involves systematically refining your prompts based on the model's output to achieve optimal performance and reliability.

*   **Steps for Iteration**:
    1.  **Define Objective**: Clearly state what you want the model to achieve.
    2.  **Draft Initial Prompt**: Start with a clear and concise instruction.
    3.  **Test with Model**: Run the prompt and observe the output.
    4.  **Analyze and Identify Issues**: Look for inaccuracies, hallucinations, incorrect formats, missing information, or undesired behaviors.
    5.  **Refine Prompt**: Adjust the prompt based on your observations. This might involve:
        *   Adding more specific instructions or constraints.
        *   Providing few-shot examples.
        *   Incorporating system messages.
        *   Requesting chain-of-thought reasoning.
        *   Specifying output formats.
        *   Changing the persona.
    6.  **Repeat**: Continue testing and refining until the desired performance is consistently met.

## 4. Checklist/Exercise

1.  **Identify**: You need an LLM to extract specific entities (e.g., person names, dates) from unstructured text in a consistent JSON format. Which prompting technique, alongside clear instructions, would be most effective for ensuring the output adheres to the JSON structure? Briefly explain why.
2.  **Formulate**: Write a prompt that instructs an AI to act as a stoic philosopher, answering questions concisely and without expressing emotion. The AI should also include a relevant quote from a historical stoic philosopher in its response.
3.  **Refine**: You've asked an LLM to write a short story, but it consistently ignores the specific plot points you provided and generates generic narratives. Describe two prompt engineering techniques you could use to guide the model more effectively towards your desired plot points, and give a brief example for each.
