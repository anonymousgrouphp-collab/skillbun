# Azure Alerts, Action Groups & Dashboards: A Study Guide

Azure's monitoring capabilities are essential for maintaining the health, performance, and security of your cloud resources. This guide covers how to configure alerts, automate responses using action groups, and visualize monitoring data with custom Azure dashboards.

## 1. Introduction to Azure Monitoring

Azure Monitor collects and analyzes telemetry from your cloud and on-premises environments. It helps you understand how your applications and infrastructure are performing and proactively identifies issues that might affect them. The core components for actionable insights are Alerts, Action Groups, and Dashboards.

## 2. Azure Alerts

Azure Alerts notify you when specific conditions are met in your monitoring data. They are crucial for responding quickly to operational issues.

### Core Concepts:

*   **Alert Rule**: The definition of the condition that triggers an alert. It specifies the target resource, the signal (metric or log), the condition logic (e.g., CPU > 80%), and the action group to be fired.
*   **Signal**: The type of data an alert rule monitors. Common signals include:
    *   **Metrics**: Numerical values that describe a system at a particular point in time (e.g., CPU utilization, network in/out).
    *   **Logs**: Data organized into records, typically collected from diagnostic logs, activity logs, or application insights (e.g., HTTP 500 errors).
*   **Condition**: The logic applied to the signal (e.g., 