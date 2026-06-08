# ML System Design & Architecture Study Guide

## 1. Introduction to ML System Design

Designing Machine Learning (ML) systems involves more than just training models. It encompasses building robust, scalable, and reliable infrastructure to bring models into production and maintain them throughout their lifecycle. Effective ML system design ensures efficiency, low latency, high throughput, and seamless integration with existing software ecosystems.

**Key Principles:**
*   **Scalability:** Ability to handle increasing data volume, number of users, and model complexity.
*   **Reliability:** System's ability to operate consistently and correctly, handling failures gracefully.
*   **Efficiency:** Optimal use of computational resources (CPU, GPU, memory, network).
*   **Maintainability:** Ease of understanding, modifying, and troubleshooting the system.
*   **Reproducibility:** Ability to reproduce experimental results and model deployments.

## 2. Core Components of an ML System

A typical ML system architecture comprises several interconnected components:

### 2.1. Data Ingestion Pipelines

These pipelines are responsible for collecting raw data, cleaning, transforming, and loading it into storage systems suitable for ML training and inference.

*   **Purpose:** Extract, Transform, Load (ETL) or Extract, Load, Transform (ELT) data.
*   **Patterns:**
    *   **Batch Processing:** For large volumes of data processed periodically (e.g., daily, hourly). Tools: Apache Spark, Apache Airflow.
    *   **Stream Processing:** For real-time data ingestion and processing. Tools: Apache Kafka, Apache Flink, Apache Storm.
*   **Considerations:** Data quality, schema evolution, data versioning, fault tolerance.

### 2.2. Feature Stores

A feature store is a centralized service for managing and serving machine learning features consistently across training and inference environments.

*   **Benefits:**
    *   **Consistency:** Prevents training-serving skew by ensuring features used in training are identical to those used in production inference.
    *   **Reusability:** Allows teams to share and reuse features, reducing redundant work.
    *   **Timeliness:** Provides low-latency access to pre-computed features for online inference.
*   **Components:**
    *   **Offline Store:** For batch feature computation and storage (e.g., S3, HDFS, data warehouses). Used for training.
    *   **Online Store:** For low-latency feature retrieval during real-time inference (e.g., Redis, DynamoDB, Cassandra). Also known as low-latency store.
    *   **Feature Serving API:** Interface for retrieving features from both online and offline stores.

### 2.3. Model Registries

A model registry is a centralized repository for tracking, versioning, and managing ML models throughout their lifecycle.

*   **Purpose:** Store model artifacts, metadata (hyperparameters, metrics), and deployment history.
*   **Benefits:**
    *   **Reproducibility:** Track model lineage from data to deployment.
    *   **Governance:** Manage model versions, approvals, and rollback capabilities.
    *   **Collaboration:** Facilitate sharing and deployment of models across teams.
*   **Examples:** MLflow Model Registry, Kubeflow Metadata, SageMaker Model Registry.

### 2.4. Online vs. Batch Inference Patterns

The choice between online and batch inference depends on the application's latency requirements and data characteristics.

*   **Batch Inference:**
    *   **Use Cases:** Predictions on large datasets where low latency is not critical (e.g., daily recommendations, risk scoring for a portfolio, offline analytics).
    *   **Characteristics:** High throughput, can tolerate higher latency, cost-effective for large volumes.
    *   **Architecture:** Often involves scheduled jobs that process data, generate predictions, and store them for later retrieval.
*   **Online Inference:**
    *   **Use Cases:** Real-time predictions for individual requests where low latency is critical (e.g., fraud detection, personalized recommendations, ad bidding).
    *   **Characteristics:** Low latency (milliseconds), high availability, often served via APIs.
    *   **Architecture:** Requires fast access to features (via feature store), efficient model serving infrastructure (e.g., FastAPI, Flask, TensorFlow Serving, TorchServe), and robust API design.

### 2.5. API Design for Model Serving

Serving ML models typically involves exposing them via an API endpoint.

*   **Common Protocols:**
    *   **RESTful APIs:** Widely used, human-readable, flexible JSON/HTTP.
    *   **gRPC:** High-performance, low-latency, uses Protocol Buffers for structured data.
*   **Considerations:**
    *   **Request/Response Format:** Standardized input/output schemas (e.g., JSON).
    *   **Authentication/Authorization:** Secure access to the model endpoint.
    *   **Error Handling:** Clear error messages and status codes.
    *   **Versioning:** Allow for deployment of new model versions without breaking existing clients.
    *   **Monitoring:** Track request rates, latency, error rates, and model performance.

## 3. System Architecture Considerations for Different Use Cases

### 3.1. Real-time Predictions (e.g., Fraud Detection)

*   **Data Ingestion:** Real-time streams (Kafka) for event data.
*   **Feature Store:** Online feature store for low-latency feature lookup.
*   **Model Serving:** High-performance model server (e.g., FastAPI, custom service in Go/Java) behind an API Gateway.
*   **Monitoring:** Real-time dashboards for latency, error rates, and model drift.

### 3.2. Recommendation Engines

*   **Candidate Generation (Batch):** Offline processing using Spark or similar to generate a large pool of relevant items.
*   **Feature Engineering (Both):** Batch for historical user/item features, online for real-time contextual features.
*   **Ranking (Online):** Real-time model inference to rank candidates based on current user context and learned preferences.
*   **A/B Testing:** Infrastructure to test different model versions and strategies in production.
*   **Data Storage:** Graph databases for relationships, key-value stores for user profiles.

## 4. Conceptual Architecture Example

Consider a simplified architecture for an online fraud detection system:

```
+----------------+       +-------------------+       +-------------------+    
|   User Action  | ----> |  Event Stream     | ----> |  Feature Store    |
| (e.g., purchase)|       |    (Kafka)        |       |    (Online)       |
+----------------+       +-------------------+       +-------------------+
        |                               ^                  |              
        |           Real-time events    |                  | Retrieve     
        |           for fraud model     |                  | Features     
        V                               |                  V              
+----------------+       +-------------------+       +-------------------+
|  API Gateway   | <---- |   Prediction API  | <---- |  Model Serving    |
| (Load Balancer)|       | (e.g., FastAPI)   |       | (e.g., TorchServe)|
+----------------+       +-------------------+       +-------------------+
        |                                                        ^          
        |                                                        |          
        | Request for prediction                                 | Load model
        V                                                        |          
+---------------------+       +---------------------------+      |
|  MLOps Platform     | <---- |    Model Registry         |------+
| (Deployment, Monitoring) |       | (e.g., MLflow)            |
+---------------------+       +---------------------------+
```
**Explanation:**
1.  **User Action:** An event (e.g., a credit card transaction) triggers the system.
2.  **Event Stream (Kafka):** The event is ingested into a real-time stream. This can also feed an offline store for training data.
3.  **Feature Store (Online):** The prediction API queries the online feature store to retrieve relevant features (e.g., user's recent transaction history, IP reputation).
4.  **Model Serving (TorchServe/TensorFlow Serving):** The pre-trained fraud detection model is loaded and served by a high-performance model server.
5.  **Prediction API (FastAPI):** A custom API built with FastAPI orchestrates the feature retrieval and model inference.
6.  **API Gateway:** Routes incoming requests to the prediction API, handles load balancing and security.
7.  **Model Registry:** Stores and versions the fraud detection model. MLOps platform uses this for deployment.
8.  **MLOps Platform:** Manages deployment, scaling, monitoring, and retraining of the model.

## 5. Checklist / Exercise

1.  **Scenario Analysis:** You need to design a system for real-time anomaly detection in network traffic. Would you prioritize batch or online inference, and why? Name two core ML system components that would be crucial for this.
2.  **Feature Store Benefits:** Explain how a feature store helps prevent "training-serving skew" and promotes feature reusability.
3.  **Model Lifecycle:** Describe the role of a "model registry" in the ML model lifecycle.
