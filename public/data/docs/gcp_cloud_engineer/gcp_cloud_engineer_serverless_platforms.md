# Serverless Platforms on GCP: Cloud Run, Functions, App Engine

This guide explores Google Cloud Platform's powerful serverless offerings: Cloud Functions, Cloud Run, and App Engine. These platforms enable developers to build and deploy applications without managing underlying infrastructure, focusing purely on code.

## 1. Introduction to Serverless on GCP

Serverless computing abstracts away server management, allowing developers to deploy code that automatically scales and only incurs costs when executed. GCP provides a rich suite of serverless services:

*   **No Server Management**: Developers don't provision, patch, or maintain servers.
*   **Automatic Scaling**: Resources scale up or down based on demand, even to zero instances.
*   **Pay-per-Use**: You only pay for the compute time and resources your code actually consumes.

## 2. Cloud Functions: Event-Driven Serverless Functions

Cloud Functions is GCP's Functions-as-a-Service (FaaS) offering, ideal for event-driven microservices. It allows you to run small, single-purpose functions in response to various events.

*   **Concept**: Execute ephemeral code snippets in response to specific triggers without provisioning or managing servers.
*   **Key Features**:
    *   **Event-driven**: Triggered by HTTP requests, Pub/Sub messages, Cloud Storage events, Firestore changes, and more.
    *   **Stateless**: Functions are designed to be stateless, processing one event at a time.
    *   **Supported Runtimes**: Node.js, Python, Go, Java, .NET, Ruby, PHP, and custom runtimes.
*   **Use Cases**: Webhooks, data transformations, IoT backend processing, lightweight APIs, real-time file processing.

### Simple Code Example (Node.js HTTP Function)

This example demonstrates a basic HTTP-triggered Cloud Function that responds with a greeting.

**`index.js`**
```javascript
exports.helloHttp = (req, res) => {
  const name = req.query.name || req.body.name || 'World';
  res.status(200).send(`Hello, ${name}!`);
};
```

**Deployment Command**
```bash
gcloud functions deploy helloHttp \
  --runtime nodejs16 \
  --trigger-http \
  --allow-unauthenticated
```

## 3. Cloud Run: Containerized Serverless Applications

Cloud Run is a fully managed platform that enables you to run stateless containers via web requests or Pub/Sub events. It combines the benefits of serverless with the flexibility of containers.

*   **Concept**: Deploy containerized applications (Docker images) that scale automatically from zero to millions of requests.
*   **Key Features**:
    *   **Container-based**: Supports any language, library, or binary that can be packaged into a Docker image.
    *   **Scales to Zero**: No cost when not serving requests.
    *   **Custom Domains & Traffic Management**: Easily map custom domains and split traffic between revisions.
    *   **HTTP/1 and HTTP/2**: Supports both protocols.
*   **Use Cases**: Web services, APIs, microservices, frontends, internal tools, long-running batch jobs (with Cloud Run Jobs).

### Simple Deployment Example (Python Flask App)

**`main.py`**
```python
from flask import Flask
app = Flask(__name__)

@app.route('/')
def hello():
    return 'Hello from Cloud Run!'

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
```

**`Dockerfile`**
```dockerfile
FROM python:3.9-slim-buster
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD [