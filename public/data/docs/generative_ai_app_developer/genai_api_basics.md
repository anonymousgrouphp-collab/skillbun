## LLM API Integration and Management

Integrating Large Language Models (LLMs) into applications is a cornerstone skill for Generative AI App Developers. This module focuses on the practical aspects of interacting with LLMs via their APIs, covering everything from making basic requests to advanced error handling and cost management.

### Introduction

LLM APIs provide programmatic access to powerful AI models, enabling developers to build intelligent applications that leverage natural language understanding and generation. Whether it's crafting chatbots, content generators, or complex reasoning engines, mastering API integration is essential for leveraging models from providers like OpenAI, Anthropic, and Google Gemini.

### Core Concepts

#### 1. Choosing an LLM Provider

Different providers offer various models with unique strengths, pricing, and API structures. While the core concepts remain similar, specific API calls and parameters will vary.
*   **OpenAI**: Known for GPT series (e.g., GPT-3.5 Turbo, GPT-4). Widely adopted, excellent documentation.
*   **Anthropic**: Offers Claude models, focused on safety and helpfulness.
*   **Google Gemini**: Google's suite of models, often integrated with GCP ecosystem.

#### 2. Making API Requests (Chat Completions)

Modern LLMs primarily use a 'chat completion' paradigm, where you provide a list of messages representing a conversation. Each message has a `role` (e.g., `system`, `user`, `assistant`) and `content`.

**Example structure (conceptual):**
```json
{
  "model": "gpt-4o",
  "messages": [
    {"role": "system", "content": "You are a helpful assistant."}, 
    {"role": "user", "content": "What is the capital of France?"}
  ],
  "temperature": 0.7
}
```

#### 3. Secure API Key Management

API keys are credentials that authenticate your requests and grant access to paid services. Protecting them is paramount to prevent unauthorized usage and billing.
*   **Environment Variables**: The most common and recommended approach for local development. Load keys from `.env` files or directly from system environment variables.
*   **Cloud Secret Managers**: For production deployments (e.g., AWS Secrets Manager, Google Secret Manager, Azure Key Vault), securely store and retrieve API keys.
*   **Avoid Hardcoding**: Never embed API keys directly in your source code.

#### 4. Real-time Responses with Streaming

For improved user experience, especially with longer responses, LLM APIs support streaming. Instead of waiting for the entire response, tokens are sent as they are generated, allowing your application to display content incrementally.
*   Set a `stream` parameter (e.g., `stream=True`) in your API request.
*   Process incoming chunks of data, typically in a loop.

#### 5. Managing Rate Limits

API providers impose rate limits (e.g., requests per minute, tokens per minute) to ensure fair usage and system stability. Exceeding these limits results in errors.
*   **Identify Limits**: Consult the provider's documentation for specific limits.
*   **Exponential Backoff**: A common strategy for handling `429 Too Many Requests` errors. If a request fails due to a rate limit, wait for an exponentially increasing amount of time before retrying (e.g., 1s, 2s, 4s, 8s...). Implement a maximum number of retries.

#### 6. Robust Error Handling and Retry Mechanisms

API calls can fail for various reasons (network issues, invalid requests, server errors, rate limits). Robust error handling is crucial for resilient applications.
*   **Common Error Types**: `400 Bad Request`, `401 Unauthorized`, `429 Too Many Requests` (rate limit), `500 Internal Server Error`.
*   **`try-except` Blocks**: Catch specific exceptions raised by the API client library.
*   **Retry Logic**: For transient errors (like `429` or some `5xx` errors), implement retries, often combined with exponential backoff.

#### 7. Estimating Token Usage for Cost Control

LLM usage is typically billed based on the number of tokens processed (input + output). Understanding token estimation is vital for managing costs.
*   **Tokenizers**: Each model has a specific tokenizer. Libraries (like `tiktoken` for OpenAI) can estimate token counts.
*   **Monitoring Usage**: Most API clients provide usage information in the response, allowing you to log and analyze consumption.

#### 8. Parsing Structured Model Outputs (JSON, YAML)

LLMs can be prompted to generate structured data, which is incredibly useful for integrating their output into application logic. Common formats include JSON and YAML.
*   **Prompt Engineering**: Instruct the LLM explicitly to output JSON or YAML, often providing a schema or example.
*   **Validation**: Always validate the parsed output against an expected schema, as LLMs can sometimes deviate.
*   **Libraries**: Use standard libraries like Python's `json` or `PyYAML` to parse the output.

### Practical Example: OpenAI Chat Completion

Here's a Python example demonstrating key concepts with the OpenAI API.

```python
import os
import json
import time
from openai import OpenAI, APIError, RateLimitError, APIConnectionError

# 1. Secure API Key Management (using environment variable)
# Ensure OPENAI_API_KEY is set in your environment
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

def get_chat_completion_with_retries(
    messages: list,
    model: str = "gpt-3.5-turbo",
    max_retries: int = 5,
    initial_delay: float = 1.0
):
    delay = initial_delay
    for i in range(max_retries):
        try:
            print(f"Attempt {i+1}/{max_retries}...")
            # 2. Making API Requests & 4. Streaming Responses
            response_stream = client.chat.completions.create(
                model=model,
                messages=messages,
                stream=True,
                response_format={"type": "json_object"} # 8. Structured Output
            )
            
            full_response_content = ""
            print("\nAssistant (streaming): ", end="")
            for chunk in response_stream:
                if chunk.choices[0].delta.content:
                    content_part = chunk.choices[0].delta.content
                    print(content_part, end="", flush=True)
                    full_response_content += content_part
            print("\n")

            # 7. Estimating Token Usage (after full response if stream is handled)
            # Note: For streamed responses, `usage` might not be available on chunks.
            # You'd typically calculate tokens client-side or check final response if non-streaming.
            # For this example, we will parse the streamed JSON output.

            # 8. Parsing Structured Model Outputs (JSON)
            try:
                parsed_output = json.loads(full_response_content)
                print(f"Parsed JSON Output: {parsed_output}")
                if 'name' in parsed_output and 'age' in parsed_output:
                    print(f"Hello, {parsed_output['name']}! You are {parsed_output['age']} years old.")
                return parsed_output
            except json.JSONDecodeError:
                print(f"Warning: Could not decode JSON from response: {full_response_content}")
                return full_response_content # Return raw if parsing fails

        # 6. Robust Error Handling and Retry Mechanisms
        except RateLimitError as e:
            print(f"Rate limit exceeded. Retrying in {delay:.2f} seconds...")
            time.sleep(delay)
            delay *= 2 # Exponential backoff
        except APIConnectionError as e:
            print(f"Connection error: {e}. Retrying in {delay:.2f} seconds...")
            time.sleep(delay)
            delay *= 2
        except APIError as e:
            print(f"API Error: {e.status_code} - {e.response} - {e.message}")
            if e.status_code >= 500: # Server-side errors, often transient
                print(f"Server error, retrying in {delay:.2f} seconds...")
                time.sleep(delay)
                delay *= 2
            else: # Client-side errors (e.g., 400, 401, 403), likely not retryable
                print("Non-retryable API error. Exiting.")
                raise
        except Exception as e:
            print(f"An unexpected error occurred: {e}")
            raise

    print("Max retries reached. Failed to get a successful response.")
    return None

if __name__ == "__main__":
    # Example 1: Simple chat with structured output request
    user_prompt = "Generate a JSON object with my name as 'Alice' and age as '30'."
    messages = [
        {"role": "system", "content": "You are an AI assistant designed to output JSON."}, # Important for JSON output
        {"role": "user", "content": user_prompt}
    ]
    print("\n--- Running Chat Completion Example ---")
    get_chat_completion_with_retries(messages)

    # Example 2: Another structured output request
    user_prompt_2 = "Describe a brief summary of Python in 2-3 sentences as a JSON object with keys 'language' and 'summary'."
    messages_2 = [
        {"role": "system", "content": "You are a concise JSON generator."}, 
        {"role": "user", "content": user_prompt_2}
    ]
    print("\n--- Running Another Structured Output Example ---")
    get_chat_completion_with_retries(messages_2)
```

***Note on Token Usage Calculation for Streaming:*** While `tiktoken` can estimate input tokens, calculating *output* tokens for a streamed response typically involves tracking the characters/words received and then converting them to tokens using the tokenizer, or relying on `usage` statistics if provided in a final summary chunk (which is not always the case for all streaming implementations).

### Checklist/Exercise

1.  **API Key Security**: Describe at least two secure methods for managing LLM API keys in a production environment, explaining why hardcoding is dangerous.
2.  **Streaming Implementation**: Explain the primary benefit of implementing streaming responses for LLM applications. How would you modify the provided Python example to *not* stream and instead wait for the full response?
3.  **Error Handling & Retries**: You receive a `429 Too Many Requests` error from an LLM API. Outline the steps you would take in your code to handle this robustly, including specific techniques or libraries you might use.