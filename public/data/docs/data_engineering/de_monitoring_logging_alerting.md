# Monitoring, Logging & Alerting for Data Engineers

In the world of data engineering, ensuring the reliability, performance, and integrity of data pipelines and infrastructure is paramount. This is where robust Monitoring, Logging, and Alerting (MLA) practices come into play. They provide the necessary visibility and responsiveness to maintain healthy data operations.

## 1. Monitoring

Monitoring is the systematic collection and analysis of metrics and data related to your systems' performance and health. For data engineers, monitoring helps answer critical questions like: Is my pipeline running? Is data flowing correctly? Are there any bottlenecks?

### Core Concepts:

*   **Metrics Collection:** Gathering numerical data over time (e.g., CPU utilization, memory usage, job completion times, rows processed, error counts).
*   **Dashboards:** Visualizing metrics through charts and graphs for quick operational oversight (e.g., Grafana).
*   **Key Monitoring Areas for Data Pipelines:**
    *   **Pipeline Health:** Success/failure rates, run duration, latency.
    *   **Data Quality:** Row counts, schema drift, data freshness, null rates for critical fields.
    *   **Resource Utilization:** CPU, memory, disk I/O, network for compute instances (e.g., Spark clusters, Flink jobs).
    *   **Cost Management:** Tracking resource consumption to optimize spending.

### Tools:

*   **Prometheus:** An open-source monitoring system with a time-series database. It pulls metrics from configured targets.
*   **Grafana:** An open-source visualization and dashboarding tool that integrates with various data sources, including Prometheus.
*   **Datadog, New Relic, Splunk:** Commercial, comprehensive monitoring platforms offering SaaS solutions.

### Example: Prometheus Scrape Configuration

A simple `prometheus.yml` configuration to scrape metrics from an application exposing them on port 8080:

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'my-data-app'
    static_configs:
      - targets: ['localhost:8080']
```

## 2. Logging

Logging is the practice of recording events that occur within a system or application. These logs are invaluable for debugging, auditing, understanding application behavior, and forensics.

### Core Concepts:

*   **Log Levels:** Categorizing log messages by severity (e.g., `DEBUG`, `INFO`, `WARNING`, `ERROR`, `CRITICAL`).
*   **Structured Logging:** Emitting logs in a machine-readable format (e.g., JSON) with key-value pairs, making them easier to parse and query.
*   **Centralized Logging:** Aggregating logs from multiple sources into a central system for unified search, analysis, and archiving.

### Best Practices:

*   **Contextual Information:** Include relevant IDs (e.g., `pipeline_run_id`, `user_id`, `record_id`) in log messages.
*   **Avoid Sensitive Data:** Do not log personally identifiable information (PII) or other sensitive data.
*   **Asynchronous Logging:** Prevent logging operations from blocking the main application thread.

### Tools:

*   **ELK Stack:**
    *   **Elasticsearch:** A distributed search and analytics engine.
    *   **Logstash:** A server-side data processing pipeline that ingests, transforms, and sends logs to Elasticsearch.
    *   **Kibana:** A visualization layer for Elasticsearch data.
*   **Cloud Logging Services:** AWS CloudWatch Logs, Google Cloud Logging (formerly Stackdriver Logging), Azure Monitor Logs.
*   **Fluentd/Fluent Bit:** Lightweight log processors/forwarders.

### Example: Python Structured Logging

```python
import logging
import json

class JsonFormatter(logging.Formatter):
    def format(self, record):
        log_record = {
            "timestamp": self.formatTime(record, self.datefmt),
            "level": record.levelname,
            "message": record.getMessage(),
            "logger": record.name,
            "pipeline_id": getattr(record, 'pipeline_id', 'N/A'),
            "task_id": getattr(record, 'task_id', 'N/A')
        }
        return json.dumps(log_record)

# Configure logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

handler = logging.StreamHandler()
handler.setFormatter(JsonFormatter())
logger.addHandler(handler)

# Example usage
extra_info = {"pipeline_id": "data_ingestion_001", "task_id": "extract_source_A"}
logger.info("Starting data extraction process", extra=extra_info)
try:
    # Simulate an error
    1 / 0
except ZeroDivisionError:
    logger.exception("Failed to process data", extra=extra_info)
```

## 3. Alerting

Alerting involves notifying appropriate personnel when specific conditions or thresholds are met, indicating a potential problem or anomaly requiring attention. Proactive alerting is critical for minimizing downtime and data integrity issues.

### Core Concepts:

*   **Threshold-based Alerts:** Triggered when a metric exceeds or falls below a predefined value (e.g., "CPU usage > 90% for 5 minutes").
*   **Anomaly Detection:** Alerts based on deviations from normal behavior patterns, often using machine learning.
*   **Escalation Policies:** Defining who gets alerted and when, with fallback mechanisms if initial contacts don't respond.
*   **Deduplication & Grouping:** Preventing alert storms by grouping similar alerts and suppressing redundant notifications.

### Tools:

*   **Prometheus Alertmanager:** Handles alerts sent by Prometheus, deduping, grouping, and routing them to notification channels.
*   **Grafana Alerting:** Allows setting up alerts directly from Grafana dashboards and sending them to various endpoints.
*   **PagerDuty, Opsgenie:** On-call management and incident response platforms.

### Example: Alertmanager Configuration

A simple `alertmanager.yml` to send critical alerts to Slack:

```yaml
route:
  receiver: 'slack-critical'
  group_by: ['alertname', 'instance']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h
  # Send all alerts to slack-critical
  # If an alert has severity=critical, it will be handled by the 'critical' route
  # Otherwise, it falls through to 'slack-critical'
  routes:
    - match:
        severity: 'critical'
      receiver: 'slack-critical'

receivers:
  - name: 'slack-critical'
    slack_configs:
      - channel: '#data-ops-alerts-critical'
        api_url: 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX' # Replace with your Slack webhook URL
        text: '{{ .CommonLabels.alertname }} on {{ .CommonLabels.instance }} is {{ .Status }}! Summary: {{ .CommonAnnotations.summary }}'
```

## Integration and Best Practices

*   **Unified View:** Combine metrics, logs, and alerts in a single pane of glass (e.g., Grafana with Loki/Prometheus or Datadog).
*   **Automate Everything:** Use Infrastructure as Code (IaC) to define monitoring, logging, and alerting configurations.
*   **Start Simple, Iterate:** Begin with basic monitoring and alerting, then expand as your understanding of system behavior grows.
*   **Test Your Alerts:** Regularly test alerting mechanisms to ensure they function as expected.
*   **Runbooks:** Create clear runbooks for common alerts, outlining steps for diagnosis and resolution.

## Quick Check / Exercise

1.  **Scenario:** Your data pipeline processes hourly batches, but lately, the processing time has doubled. What monitoring metrics would you check first, and what kind of alert would you set up to detect this automatically?
2.  **Debugging:** An Airflow task sporadically fails. How would you leverage structured logging to quickly pinpoint the root cause without sifting through unstructured text files?
3.  **Tooling:** If you're building a new data platform on AWS, what specific cloud services would you consider for monitoring, logging, and alerting, respectively?