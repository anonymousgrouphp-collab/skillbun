# Database Monitoring, Logging & Alerting

## Introduction
Database monitoring, logging, and alerting are crucial components of maintaining healthy, performant, and reliable database systems. This guide will cover the essential aspects of setting up a robust monitoring infrastructure, understanding key metrics, utilizing logging for troubleshooting, and configuring intelligent alerts and insightful dashboards.

## Why Monitor Databases?
Proactive monitoring helps DBAs and developers:
*   **Identify Performance Bottlenecks:** Pinpoint slow queries, high resource utilization, or inefficient indexing.
*   **Ensure High Availability:** Detect issues like replication lag or connection saturation before they lead to outages.
*   **Optimize Resource Usage:** Understand how your database utilizes CPU, memory, and I/O.
*   **Troubleshoot Issues Faster:** Use logs and metrics to diagnose problems quickly.
*   **Plan Capacity:** Forecast future resource needs based on historical data.

## Key Database Metrics to Monitor
Effective monitoring focuses on a comprehensive set of metrics across different layers:

### System-Level Metrics
*   **CPU Utilization:** Total CPU usage, user, system, and I/O wait times.
*   **Memory Usage:** Total RAM used, free, cache, swap usage.
*   **Disk I/O:** Reads/writes per second, I/O wait time, disk latency.
*   **Network Throughput:** Inbound/outbound traffic.

### Database-Specific Metrics
*   **Connections:** Current active connections, max connections, connection attempts/failures.
*   **Query Performance:** Query execution times, slow query count, queries per second (QPS), transactions per second (TPS).
*   **Replication Lag:** Delay between primary and replica databases (critical for high availability setups).
*   **Table/Index Bloat:** Unused space in tables and indexes due to updates/deletes, impacting performance and storage.
*   **Buffer Cache Hit Ratio:** Efficiency of the database's memory cache.
*   **Deadlocks/Lock Contention:** Number and frequency of deadlocks or long-running locks.
*   **Error Logs:** Number of errors, warnings, critical events.

## Monitoring Tools Overview

### Prometheus
Prometheus is an open-source monitoring system with a dimensional data model, flexible query language (PromQL), and alert management. It scrapes metrics from configured targets (exporters).
*   **Exporters:** Agents that expose database-specific metrics in Prometheus format (e.g., `postgres_exporter`, `mysql_exporter`).

### Grafana
Grafana is an open-source analytics and interactive visualization web application. It connects to various data sources (like Prometheus, Datadog) and allows you to create highly customizable dashboards to visualize your metrics.

### Datadog
Datadog is a SaaS-based monitoring, security, and analytics platform for cloud-scale applications. It offers extensive integrations, powerful dashboards, and advanced alerting capabilities, often preferred for its comprehensive, all-in-one approach.

### Pgbadger (PostgreSQL Specific)
Pgbadger is a PostgreSQL log analyzer. It parses your PostgreSQL logs and generates comprehensive HTML reports, making it easy to spot performance issues, errors, and query statistics. While not a real-time monitoring tool, it's invaluable for historical log analysis and troubleshooting.

## Database Logging & Log Analysis
Database logs contain a wealth of information crucial for troubleshooting, auditing, and performance analysis.
*   **Error Logs:** Critical for identifying database crashes, configuration issues, or application errors.
*   **Slow Query Logs:** Records queries exceeding a defined execution time threshold, essential for performance tuning.
*   **General Logs:** Can log all client connections and statements (use with caution due to performance overhead and storage).
*   **Audit Logs:** Track who did what and when, important for security and compliance.

**Example: Analyzing PostgreSQL Logs with Pgbadger**
1.  **Ensure logging is enabled in `postgresql.conf`:**
    ```ini
    logging_collector = on
    log_destination = 'stderr'
    log_directory = 'pg_log'
    log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
    log_min_duration_statement = 1000  # Log statements running over 1 second
    ```
2.  **Run Pgbadger:**
    ```bash
    pgbadger -f stderr -o /var/www/html/pg_report.html /var/lib/postgresql/data/pg_log/postgresql-*.log
    ```
    This command processes all PostgreSQL log files and generates an HTML report.

## Setting Up Intelligent Alerts
Alerts notify you when predefined thresholds are breached or anomalies are detected.
*   **Configuration:** Define alert rules based on metrics (e.g., "CPU usage > 90% for 5 minutes", "Replication lag > 60 seconds", "Number of deadlocks > 0 in 1 minute").
*   **Notification Channels:** Integrate with communication tools like Slack, PagerDuty, email, or webhooks.
*   **Alert Severity:** Categorize alerts (e.g., critical, warning, informational) to prioritize responses.
*   **Actionable Alerts:** Ensure alerts provide enough context to understand the problem and suggest initial troubleshooting steps.

## Building Insightful Dashboards
Dashboards provide a visual overview of your database's health and performance.
*   **Key Metrics at a Glance:** Display critical metrics like CPU, Memory, I/O, active connections, QPS, and replication lag prominently.
*   **Historical Trends:** Visualize metric trends over time to identify patterns and anomalies.
*   **Granularity:** Allow drilling down from high-level overviews to detailed metric graphs.
*   **Customization:** Tailor dashboards to specific roles (e.g., DBA dashboard, application developer dashboard).

## Checklist / Exercises
1.  **Metric Identification:** List five database-specific metrics you would prioritize for monitoring in a production PostgreSQL database and explain why each is important.
2.  **Tool Selection:** If you needed a real-time monitoring solution for your MySQL database that integrates with Slack for alerts and allows custom dashboards, which two tools would you choose from Prometheus, Grafana, Datadog, and Pgbadger, and why?
3.  **Log Analysis Scenario:** Describe a scenario where analyzing a slow query log would be crucial for troubleshooting a database performance issue, and what specific information you'd look for.
