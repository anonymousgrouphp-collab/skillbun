# Messaging & Streaming: SQS, SNS & Kinesis

Asynchronous communication is a fundamental pattern in modern distributed systems, enabling applications to be decoupled, scalable, and resilient. AWS offers powerful managed services for implementing these patterns: Amazon Simple Queue Service (SQS) for message queues, Amazon Simple Notification Service (SNS) for publish/subscribe messaging, and Amazon Kinesis for real-time data streaming.

## 1. Amazon SQS (Simple Queue Service)

Amazon SQS is a fully managed message queuing service that enables you to decouple and scale microservices, distributed systems, and serverless applications.

### Core Concepts

*   **Queue:** A temporary repository for messages.
*   **Producer:** An application or service that sends messages to an SQS queue.
*   **Consumer:** An application or service that retrieves and processes messages from an SQS queue.
*   **Message:** The data unit sent to and retrieved from the queue.
*   **Visibility Timeout:** The period during which SQS prevents other consumers from processing the message after one consumer has received it. This allows the consumer time to process and delete the message.
*   **Dead-Letter Queue (DLQ):** A queue where SQS sends messages that a source queue is unable to process successfully. This helps in isolating problematic messages for later analysis.

### Queue Types

1.  **Standard Queues:**
    *   Offer "at-least-once" message delivery.
    *   Best-effort ordering (messages are delivered in no guaranteed order).
    *   High throughput.
    *   Default choice for most use cases.
2.  **FIFO (First-In-First-Out) Queues:**
    *   Ensure "exactly-once" message processing.
    *   Guaranteed message ordering (messages are delivered exactly in the order they were sent).
    *   Lower throughput compared to Standard queues.
    *   Ideal for scenarios where the order of operations and preventing duplicates is critical (e.g., bank transactions).

### Use Cases

*   Decoupling microservices.
*   Buffering requests.
*   Asynchronous task processing.
*   Order processing systems.

### Simple SQS Interaction Example (Python Boto3)

```python
import boto3

# Create an SQS client
sqs = boto3.client('sqs', region_name='us-east-1')

# Replace with your queue URL
queue_url = 'YOUR_SQS_QUEUE_URL'

# 1. Send a message
response_send = sqs.send_message(
    QueueUrl=queue_url,
    MessageBody='Hello from SkillBun!',
    MessageAttributes={
        'Author': {
            'StringValue': 'SkillBunBot',
            'DataType': 'String'
        }
    }
)
print(f"Sent message ID: {response_send['MessageId']}")

# 2. Receive messages
response_receive = sqs.receive_message(
    QueueUrl=queue_url,
    AttributeNames=['All'],
    MessageAttributeNames=['All'],
    MaxNumberOfMessages=1,
    VisibilityTimeout=20 # Make message invisible for 20 seconds
)

if 'Messages' in response_receive:
    for message in response_receive['Messages']:
        print(f"Received message: {message['Body']}")
        print(f"Message attributes: {message['MessageAttributes']}")

        # 3. Delete the message after processing
        sqs.delete_message(
            QueueUrl=queue_url,
            ReceiptHandle=message['ReceiptHandle']
        )
        print(f"Deleted message with ReceiptHandle: {message['ReceiptHandle']}")
else:
    print("No messages to receive.")
```

## 2. Amazon SNS (Simple Notification Service)

Amazon SNS is a fully managed messaging service for both application-to-application (A2A) and application-to-person (A2P) communication. It follows a publish/subscribe (pub/sub) pattern.

### Core Concepts

*   **Topic:** A logical access point that acts as a communication channel. Publishers send messages to topics.
*   **Publisher:** The application or service that sends messages to an SNS topic.
*   **Subscriber:** An endpoint or client that receives messages from a topic. Subscribers can be diverse:
    *   **A2A:** SQS queues, AWS Lambda functions, HTTP/S endpoints, Kinesis Data Firehose.
    *   **A2P:** Email, SMS, Mobile Push Notifications.
*   **Message Filtering:** Subscribers can filter messages based on attributes, ensuring they only receive messages relevant to them.

### Use Cases

*   Fan-out messaging to multiple consumers (e.g., new order event triggers multiple microservices).
*   Sending notifications to users (email, SMS).
*   Microservice communication.
*   Triggering Lambda functions.

### Simple SNS Topic Configuration (Conceptual)

1.  **Create an SNS Topic:** Define a new topic in the AWS console or via CLI/SDK.
2.  **Add Subscriptions:**
    *   Subscribe an SQS queue to the topic.
    *   Subscribe an email address to the topic.
    *   Subscribe a Lambda function to the topic.
3.  **Publish a Message:** Send a message to the SNS topic. All subscribed endpoints will receive a copy of the message (subject to filtering policies).

```bash
# AWS CLI Example: Publishing a message to an SNS topic
# Replace ARN with your topic ARN
aws sns publish \
    --topic-arn "arn:aws:sns:us-east-1:123456789012:MyNotificationTopic" \
    --message "This is a test notification from SkillBun!" \
    --subject "SkillBun Test Alert"
```

## 3. Amazon Kinesis

Amazon Kinesis is a platform for collecting, processing, and analyzing real-time, streaming data. It offers several services tailored for different streaming data needs.

### Key Kinesis Services

1.  **Kinesis Data Streams:**
    *   Captures, processes, and stores large streams of data records in real-time.
    *   **Core Concepts:**
        *   **Shards:** The base throughput unit of a Kinesis data stream. Each shard provides a fixed capacity for data ingress and egress.
        *   **Record:** A data unit stored in a Kinesis data stream, consisting of a partition key, sequence number, and data blob.
        *   **Producers:** Applications that put data records into a stream.
        *   **Consumers:** Applications that process data records from a stream.
        *   **Retention Period:** The duration for which records are accessible in the stream (default 24 hours, up to 365 days).
    *   **Use Cases:** Real-time dashboards, log and event data aggregation, IoT telemetry processing.

2.  **Kinesis Firehose:**
    *   Delivers real-time streaming data to data lakes, data stores, and analytics services (e.g., Amazon S3, Amazon Redshift, Amazon OpenSearch Service, Splunk).
    *   Fully managed, automatically scales.
    *   **Use Cases:** Loading data into data warehouses, archiving streaming data.

3.  **Kinesis Data Analytics:**
    *   Analyzes streaming data in real-time using SQL or Apache Flink.
    *   Allows you to build applications that continuously read and process data from Kinesis Data Streams or Kinesis Firehose.
    *   **Use Cases:** Real-time anomaly detection, complex event processing, generating real-time metrics.

### Use Cases for Kinesis (General)

*   Real-time analytics and dashboards.
*   Real-time monitoring.
*   Log and event data collection.
*   IoT data ingestion and processing.
*   Clickstream analysis.

## SQS vs. SNS vs. Kinesis: Quick Comparison

| Feature             | SQS (Queues)                                   | SNS (Pub/Sub)                                      | Kinesis (Data Streams)                                |
| :------------------ | :--------------------------------------------- | :------------------------------------------------- | :---------------------------------------------------- |
| **Pattern**         | Message Queuing (Point-to-Point/Polling)       | Publish/Subscribe (Push-based)                     | Real-time Data Streaming                              |
| **Primary Use**     | Decoupling microservices, task queues          | Fan-out notifications, A2A/A2P communication       | High-throughput real-time data ingestion & processing |
| **Delivery**        | Poll-based, consumers pull messages            | Push-based, messages pushed to subscribers         | Pull-based for consumers, Push-based for Firehose     |
| **Message Ordering**| FIFO queues guarantee order; Standard is best-effort | Not guaranteed across subscribers                  | Shard-level ordering guaranteed                       |
| **Message Size**    | Up to 256 KB                                   | Up to 256 KB                                       | Up to 1 MB per record (with partition key)            |
| **Retention**       | 1 minute to 14 days                            | No retention (messages delivered instantly)        | 24 hours to 365 days                                  |

## Quick Understanding Checklist/Exercise

1.  **Scenario:** You have an e-commerce application where a new order needs to trigger three different microservices: Inventory, Shipping, and Customer Notifications. Which AWS messaging service would be most suitable for this "fan-out" pattern?
2.  **Challenge:** You need to process a stream of IoT sensor data (temperature, humidity) from thousands of devices in real-time, store it in an S3 data lake, and also monitor for anomalies. Which Kinesis services would you combine to achieve this?
3.  **Debug:** A consumer application is repeatedly processing the same message from an SQS Standard queue. What SQS concept should you investigate to prevent this, assuming the processing time is consistent?
