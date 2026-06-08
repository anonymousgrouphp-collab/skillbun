# Monitoring & Logging Fundamentals

Welcome to the foundational guide on Monitoring & Logging, a crucial aspect of maintaining healthy and performant cloud systems. In this module, you will learn to configure essential metrics, manage logs, set up alarms, design effective dashboards, and implement basic alerting strategies using cloud-native tools.

## 1. Introduction to Observability

Observability is the ability to understand the internal state of a system by examining its external outputs. Monitoring and logging are two pillars of achieving observability.

*   **Monitoring:** The act of collecting and analyzing data about the performance and health of a system over time. This typically involves metrics and dashboards.
*   **Logging:** The process of recording events that occur within an application or system. Logs provide detailed context for debugging and auditing.
*   **Alerting:** Proactive notification of issues or anomalies detected through monitoring or logging, allowing for timely intervention.

## 2. Essential Monitoring Components

### 2.1 Metrics Configuration

Metrics are numerical data points that represent the state or performance of a system component over time. They are crucial for understanding trends, capacity planning, and detecting anomalies.

**Common Metrics to Monitor:**

*   **Compute:** CPU Utilization, Memory Utilization, Disk I/O, Network In/Out.
*   **Application:** Request Latency, Error Rates (e.g., HTTP 5xx errors), Throughput, Active Users.
*   **Database:** Connection Count, Query Latency, Disk Queue Depth.

**Cloud-Native Tools for Metrics:**

*   **AWS CloudWatch:** Collects monitoring and operational data in the form of logs, metrics, and events.
*   **Azure Monitor:** Provides comprehensive monitoring for applications, infrastructure, and network.
*   **Google Cloud Monitoring:** Gathers metrics, events, and metadata from Google Cloud, AWS, and on-premises resources.

**Example: Configuring an EC2 CPU Utilization Metric (AWS CloudWatch Concept)**

While direct JSON for a CloudWatch metric setup is complex, conceptually, you would define:

*   **Namespace:** `AWS/EC2`
*   **Metric Name:** `CPUUtilization`
*   **Dimensions:** `InstanceId` (to specify a particular EC2 instance)
*   **Statistic:** `Average`, `Maximum`, `Minimum`
*   **Period:** `60` seconds (how often data points are aggregated)

### 2.2 Log Management

Logs provide granular insights into system behavior, application events, and potential issues. Effective log management involves collecting, storing, parsing, and analyzing logs.

**Structured vs. Unstructured Logs:**

*   **Unstructured Logs:** Free-form text, difficult to parse and query programmatically. Example: `2023-10-27 10:30:00 INFO User 'john.doe' logged in from 192.168.1.100`
*   **Structured Logs:** Logs formatted in a consistent, machine-readable format (e.g., JSON). They are easier to search, filter, and analyze. Example below.

**Why Structured Logging?**

*   **Parseability:** Fields are clearly defined, making automated parsing straightforward.
*   **Searchability:** Easily query specific fields (e.g., all errors for a specific `request_id`).
*   **Integration:** Compatible with log aggregation and analysis tools.

**Example: Structured Log Snippet (JSON)**

```json
{
  