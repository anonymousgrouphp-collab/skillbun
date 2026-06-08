# Azure Monitoring & Cost Management Study Guide

## Introduction
In today's cloud-first world, managing the performance, health, and expenditure of your cloud resources is paramount. This guide will walk you through the essential concepts of Azure Monitoring to ensure optimal resource performance and health, and Azure Cost Management to control and optimize your cloud spend, leading to a more efficient and cost-effective Azure environment.

## Part 1: Azure Monitoring
Azure Monitoring provides a comprehensive solution for collecting, analyzing, and acting on telemetry data from your cloud and on-premises environments. It helps you understand how your applications and infrastructure are performing and proactively identify issues.

### Core Concepts:
*   **Azure Monitor:** The foundational service that provides full observability into your applications, infrastructure, and network.
*   **Metrics:** Numerical values that describe some aspect of a system at a particular point in time (e.g., CPU utilization, network I/O, storage latency). Metrics are lightweight and support near real-time scenarios.
*   **Logs:** Event data that captures operational activities, resource health, security events, and diagnostic information. Logs are typically structured as records with different properties and are useful for in-depth analysis and troubleshooting.
*   **Alerts:** Notifications triggered when specific conditions are met based on metrics, logs, or activity log events. Alerts can initiate automated actions.
*   **Dashboards & Workbooks:** Tools for visualizing your monitoring data. Dashboards offer a quick overview, while Workbooks provide flexible, interactive reports for deeper insights.
*   **Log Analytics Workspace:** A unique environment for storing Azure Monitor logs. It provides advanced querying capabilities (Kusto Query Language - KQL) and serves as the central hub for log data from various Azure resources and even on-premises servers.
*   **Application Insights:** An extension of Azure Monitor for monitoring live web applications and services. It helps detect performance anomalies, diagnose issues, and understand user behavior.

### Monitoring Scenarios:
*   **Infrastructure Monitoring:** Tracking VMs, Storage Accounts, Virtual Networks for performance and availability.
*   **Application Monitoring:** Using Application Insights to monitor web apps, APIs, and other application components for performance, errors, and user load.
*   **Security Monitoring:** Integrating with Azure Security Center and Azure Sentinel to monitor security logs and incidents.

### Simple Configuration Example: Setting up a Basic CPU Alert for an Azure VM
Let's configure an alert that notifies you if a VM's CPU usage exceeds 90% for 5 minutes.

1.  **Navigate to your Virtual Machine:** In the Azure portal, find and select your VM.
2.  **Access Alerts:** In the VM's left-hand menu, under "Monitoring," select "Alerts."
3.  **Create New Alert Rule:** Click "Create alert rule."
4.  **Define Condition:**
    *   Click "Add condition."
    *   For "Monitor service," select "Platform." (It should be default)
    *   For "Signal name," search and select "Percentage CPU." (Metric)
    *   **Threshold:** Static
    *   **Operator:** Greater than
    *   **Aggregation type:** Average
    *   **Threshold value:** 90
    *   **Units:** Percent
    *   **Aggregation granularity (Period):** 5 minutes
    *   **Frequency of evaluation:** 1 minute
    *   Click "Done."
5.  **Define Actions (Action Group):**
    *   Click "Add action group." If you don't have one, create a new one, defining how you want to be notified (e.g., email, SMS).
6.  **Details:**
    *   **Alert rule name:** `vm-high-cpu-alert`
    *   **Description:** Notifies if VM CPU exceeds 90% for 5 mins.
    *   **Severity:** 2 (Warning)
7.  **Review and Create:** Click "Review + create," then "Create."

```json
{
  "properties": {
    "description": "Alerts when VM CPU exceeds 90% for 5 minutes.",
    "severity": "2",
    "enabled": true,
    "scopes": [
      "/subscriptions/<your-subscription-id>/resourceGroups/<your-resource-group>/providers/Microsoft.Compute/virtualMachines/<your-vm-name>"
    ],
    "condition": {
      "allOf": [
        {
          "threshold": 90,
          "metricName": "Percentage CPU",
          "metricNamespace": "Microsoft.Compute/virtualMachines",
          "operator": "GreaterThan",
          "timeAggregation": "Average",
          "windowSize": "PT5M",
          "criterionType": "StaticThresholdCriterion"
        }
      ]
    },
    "actions": [
      {
        "actionGroupId": "/subscriptions/<your-subscription-id>/resourceGroups/<your-action-group-rg>/providers/microsoft.insights/actiongroups/<your-action-group-name>"
      }
    ]
  },
  "type": "Microsoft.Insights/metricAlerts",
  "location": "Global"
}
```

## Part 2: Azure Cost Management
Azure Cost Management + Billing provides tools to help you analyze, manage, and optimize your Azure costs. It's crucial for controlling cloud spend and ensuring resource efficiency.

### Core Features:
*   **Cost Analysis:** Visualize your spending over time, by resource, resource group, service, and more. Apply filters and group data to gain detailed insights.
*   **Budgets:** Create budgets to track resource utilization and spending. Budgets can trigger alerts when your spend approaches or exceeds a predefined threshold.
*   **Cost Alerts:** Automated notifications when actual or forecasted spending exceeds a budget threshold.
*   **Recommendations:** Azure Advisor provides cost optimization recommendations, such as identifying idle resources, suggesting right-sizing VMs, or recommending Reserved Instance purchases.
*   **Exports:** Schedule regular exports of your cost data to a storage account for detailed analysis in external tools.

### Cost Optimization Strategies:
*   **Right-sizing Resources:** Ensure your VMs, databases, and other services are appropriately sized for their workload, avoiding over-provisioning.
*   **Reserved Instances (RIs):** Commit to a one-year or three-year term for certain services (VMs, SQL Database, Cosmos DB) to receive significant discounts compared to pay-as-you-go rates.
*   **Azure Hybrid Benefit:** Reuse your existing on-premises Windows Server and SQL Server licenses with Software Assurance on Azure to save costs.
*   **Auto-shutdown:** Configure auto-shutdown schedules for development/test VMs to ensure they are not running when not in use.
*   **Deleting Unused Resources:** Regularly identify and delete resources that are no longer needed.
*   **Monitoring Inactive Resources:** Use Azure Advisor to find and act on recommendations for underutilized or idle resources.

### Simple Configuration Example: Creating a Cost Budget
Let's create a monthly budget of $100 for a specific resource group.

1.  **Navigate to Cost Management + Billing:** In the Azure portal, search for and select "Cost Management + Billing."
2.  **Access Budgets:** In the left-hand menu, under "Cost Management," select "Budgets."
3.  **Add a Budget:** Click "Add" or "+ Add" to create a new budget.
4.  **Scope:** Select the scope for your budget (e.g., a specific subscription or a resource group). Click "Select."
5.  **Budget Details:**
    *   **Budget name:** `monthly-dev-rg-budget`
    *   **Reset period:** Monthly
    *   **Creation date:** (Auto-populated)
    *   **Expiration date:** (Set a future date, e.g., 1 year from now)
    *   **Budget amount:** 100
6.  **Set Alert Conditions:**
    *   Add an alert for 90% of your budget (`Actual` or `Forecasted` as type, `90` as `% of budget`). Define an action group for notifications (e.g., email to billing admin).
    *   Add another alert for 100% of your budget.
7.  **Create:** Click "Create."

## Checklist/Exercise
1.  **Monitoring:** You notice an application hosted on an Azure VM is experiencing intermittent slowness. Describe the steps you would take using Azure Monitor to diagnose the root cause, focusing on both metrics and logs.
2.  **Cost Management:** Your team has several development/test VMs that are often left running overnight and on weekends. Propose three different cost optimization strategies you could implement to reduce the spend on these specific VMs.
3.  **Integration:** Explain how Azure Monitor and Azure Cost Management can work together to provide a holistic view of your Azure environment's performance, health, and financial efficiency.
