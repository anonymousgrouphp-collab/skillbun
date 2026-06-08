# Azure Compliance & Auditing Study Guide

## Introduction to Azure Compliance & Auditing

In today's regulatory landscape, ensuring that your cloud resources comply with industry standards and legal requirements is paramount. Azure offers a robust suite of tools and services to help organizations achieve and maintain compliance, manage risks, and respond to audit requests effectively. This module will delve into Azure's key compliance offerings, mechanisms for auditing activity, and the importance of security baselines.

## Azure Compliance Offerings

Azure provides several services designed to help you meet various compliance requirements:

*   **Azure Policy**: A service used to create, assign, and manage policies that enforce rules and effects over your resources. Policies ensure that resources stay compliant with corporate standards and service level agreements.
    *   **Use Cases**: Enforcing specific tag requirements, restricting resource types or locations, ensuring encryption is enabled on storage accounts.
*   **Azure Blueprints**: Allows you to define a repeatable set of Azure resources that implement and adhere to standards, patterns, and requirements. Blueprints can include Policy assignments, Role assignments, ARM templates, and Resource Groups.
    *   **Benefit**: Streamlines environment setup for compliance, ensuring consistency across deployments.
*   **Microsoft Purview**: A unified data governance solution that helps you manage and govern your on-premises, multi-cloud, and SaaS data. It enables data discovery, sensitive data identification, and data lineage tracking, crucial for compliance and risk management.
*   **Service Trust Portal (STP)**: Provides access to Microsoft's audit reports, compliance guides, and privacy information, helping customers understand how Microsoft protects data and complies with standards.

## Audit Logs in Azure

Audit logs are critical for security monitoring, forensics, and compliance. Azure provides various types of logs to track activity within your environment:

*   **Azure Activity Log**: Records control-plane events (operations on resources like creating a VM, deleting a storage account, assigning a role). It provides insights into subscriptions, resource groups, and tenant-level events.
    *   **Retention**: By default, events are retained for 90 days.
*   **Azure Diagnostic Logs**: Emitted by Azure resources themselves, providing rich, frequent data about the operation of a resource. Examples include network security group flow logs, Key Vault audit logs, and SQL Database audit logs.
*   **Azure Active Directory (Azure AD) Audit Logs**: Records every audit event related to identity and access management operations in your Azure AD tenant, such as user provisioning, group management, and application activity.
*   **Using Azure Monitor and Log Analytics**: These services are fundamental for collecting, consolidating, and analyzing logs from various Azure resources. You can create custom queries, alerts, and dashboards to monitor compliance and security events.

## Security Baselines

A security baseline defines the minimum security configuration requirements for a system or application. Adhering to security baselines helps reduce attack surface and maintain a secure posture.

*   **Microsoft Defender for Cloud**: Provides continuous security assessment, security recommendations based on industry benchmarks (like CIS, NIST), and regulatory compliance dashboards. It automatically discovers and assesses your Azure resources against recommended security controls.
*   **Industry Standards**: Organizations often align their security baselines with widely accepted standards such as:
    *   **CIS Benchmarks**: Center for Internet Security provides prescriptive guidance for securely configuring IT systems.
    *   **NIST Framework**: National Institute of Standards and Technology Cybersecurity Framework offers guidelines for managing cybersecurity risks.
    *   **ISO 27001**: An international standard for information security management systems.

## Configuration Example: Azure Policy

Here's a simple Azure Policy definition that enforces all newly created storage accounts must have HTTPS enabled.

```json
{
  "if": {
    "allOf": [
      {
        "field": "type",
        "equals": "Microsoft.Storage/storageAccounts"
      },
      {
        "field": "Microsoft.Storage/storageAccounts/supportsHttpsTrafficOnly",
        "equals": false
      }
    ]
  },
  "then": {
    "effect": "Deny"
  }
}
```
This policy uses the `Deny` effect, meaning if a user tries to create a storage account without HTTPS enforcement, the operation will be blocked.

## Compliance & Auditing Checklist/Exercise

1.  **Identify a Compliance Standard**: Choose an industry standard (e.g., PCI DSS, HIPAA, ISO 27001) relevant to a hypothetical application deployed in Azure. How would Azure Policy help you enforce aspects of this standard?
2.  **Monitor Resource Creation**: Describe how you would use Azure Activity Logs and Azure Monitor to track and alert on the creation of new virtual machines within a specific resource group.
3.  **Evaluate a Security Recommendation**: Imagine Microsoft Defender for Cloud recommends enabling encryption on all SQL databases. What steps would you take to assess this recommendation and implement it while ensuring minimal impact on existing services?
