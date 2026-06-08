# Serverless Computing: Lambda & API Gateway

Serverless computing is a cloud-native development model that allows you to build and run applications and services without having to manage servers. AWS takes care of provisioning, scaling, and maintaining the underlying infrastructure. You only pay for the compute time you consume, making it highly cost-efficient and scalable.

## 1. AWS Lambda: Your Code, No Servers

AWS Lambda is a serverless, event-driven compute service that lets you run code for virtually any type of application or backend service without provisioning or managing servers. It's a 'Function as a Service' (FaaS) offering.

### Core Concepts:
*   **Function:** Your application code (e.g., Node.js, Python, Java, Go, C#, Ruby, PowerShell) uploaded to Lambda.
*   **Event:** A JSON document that triggers a Lambda function. Events can originate from various AWS services (e.g., S3 object uploads, DynamoDB stream updates, API Gateway requests, SQS messages).
*   **Runtime:** The execution environment provided by Lambda for your chosen language.
*   **Handler:** The specific method or function in your code that Lambda invokes when the function is triggered.
*   **Memory & Timeout:** Configurable resources (RAM, max execution time) for your function. More memory can also allocate more CPU.
*   **Concurrency:** The number of simultaneous executions your function can handle at any given time.
*   **IAM Role:** Defines the permissions that your Lambda function has to interact with other AWS services.

### How Lambda Works:
1.  **Code Upload:** You package your code (and dependencies) into a .zip file and upload it to Lambda, or use the in-console editor for simple functions.
2.  **Configuration:** You configure your function's runtime, handler, memory, timeout, environment variables, and associate an IAM role.
3.  **Trigger Definition:** You specify an event source (a trigger) that will invoke your function.
4.  **Execution:** When an event from the configured trigger occurs, Lambda automatically executes your function, scales it as needed, and manages the underlying infrastructure.

### Simple Python Lambda Function Example:

This function demonstrates a basic Lambda function designed to be invoked by API Gateway (proxy integration). It takes an optional `name` query parameter and returns a greeting.

```python
import json

def lambda_handler(event, context):
    """
    Sample Lambda function that processes an API Gateway proxy event
    and returns a personalized greeting.
    """
    print(f"Received event: {json.dumps(event)}")

    # Default name
    name = "Guest"

    # Extract name from query string parameters if present
    if 'queryStringParameters' in event and event['queryStringParameters']:
        if 'name' in event['queryStringParameters']:
            name = event['queryStringParameters']['name']

    message = f"Hello, {name}! This is your serverless greeting from Lambda."

    # API Gateway expects a specific response structure
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json'
        },
        'body': json.dumps({'message': message})
    }
```
**Explanation:**
*   `lambda_handler(event, context)`: This is the entry point. `event` contains the input data from the trigger (e.g., API Gateway request details), and `context` provides runtime information about the invocation, function, and execution environment.
*   The function checks `event['queryStringParameters']` for a `name` parameter.
*   It returns a dictionary matching API Gateway's expected proxy integration format, including `statusCode`, `headers`, and a `body` that must be a JSON string.

## 2. AWS API Gateway: The Front Door for Your Applications

Amazon API Gateway is a fully managed service that makes it easy for developers to create, publish, maintain, monitor, and secure APIs at any scale. It acts as the 