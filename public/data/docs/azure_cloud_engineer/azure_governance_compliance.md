# Azure Governance & Compliance Study Guide

Azure Governance & Compliance involves establishing strategies and tools to manage and ensure the adherence of your Azure resources to organizational standards, regulatory requirements, and cost controls. It's crucial for maintaining security, managing costs, and enabling consistent deployment practices across your cloud estate.

## Core Concepts

### 1. Azure Policy

Azure Policy is a service that you use to create, assign, and manage policies. These policies enforce different rules and effects over your resources, so those resources stay compliant with your corporate standards and service level agreements.

*   **Policy Definitions:** Express what to audit or what action to take. Examples:
    *   Enforcing specific regions for resource deployment.
    *   Requiring specific tags on resources.
    *   Auditing non-compliant resources.
*   **Policy Assignments:** Apply a policy definition to a specific scope (management group, subscription, resource group).
*   **Effects:** Determine what happens when a policy rule is evaluated:
    *   `Deny`: Prevents resource creation/update if it doesn't meet the policy.
    *   `Audit`: Flags non-compliant resources without stopping deployment.
    *   `Append`: Adds a defined set of fields to the request during creation or update.
    *   `Modify`: Adds or updates tags or properties on resources during creation or update.
    *   `DeployIfNotExists`: Deploys a related resource if a condition is met.
    *   `AuditIfNotExists`: Audits if a related resource does not exist.
    *   `Disabled`: Turns off the policy.

### 2. Azure Blueprints

Azure Blueprints allow you to define a repeatable set of Azure resources that implement and adhere to an organization's standards, patterns, and requirements. Blueprints orchestrate the deployment of various resource templates and other artifacts like:

*   **Role Assignments:** Assign Azure roles to users or groups.
*   **Policy Assignments:** Apply Azure Policies to control resource configurations.
*   **ARM Templates:** Deploy various Azure resources.
*   **Resource Groups:** Create new resource groups.

Blueprints are used for large-scale deployments, ensuring consistency and compliance from the start.

### 3. Resource Locks

Resource locks prevent accidental deletion or modification of critical Azure resources. They can be applied to subscriptions, resource groups, or individual resources.

*   **`CanNotDelete`:** Authorized users can still read and modify a resource, but they can't delete it.
*   **`ReadOnly`:** Authorized users can only read a resource; they cannot delete or update it.

### 4. Management Groups

Management Groups are containers that help you manage access, policies, and compliance across multiple Azure subscriptions. They form a hierarchy where subscriptions inherit policies and permissions from their parent management group, allowing for governance at scale. The hierarchy can extend up to six levels deep.

### 5. Azure Cost Management

While not a direct governance *tool* like Policy, Cost Management is a critical aspect of governance. It provides tools to monitor, allocate, and optimize your Azure spending, ensuring resources are used efficiently and within budget.

### 6. Azure Security Center / Defender for Cloud

Defender for Cloud continuously assesses the security posture of your cloud environments, identifies vulnerabilities, and provides recommendations. Its regulatory compliance dashboard helps you track your compliance against various industry benchmarks and regulatory standards (e.g., ISO 27001, PCI DSS, HIPAA).

## Configuration Sample: Azure Policy (Require a Specific Tag)

Here's a simple Azure Policy definition in JSON that requires all new resources within a scope to have a specific tag named "Environment". If the tag is missing, the resource creation will be denied.

```json
{
  "properties": {
    "displayName": "Require 'Environment' tag on resources",
    "description": "Requires all resources to have an 'Environment' tag.",
    "policyRule": {
      "if": {
        "allOf": [
          {
            "field": "type",
            "notIn": [
              "Microsoft.Resources/subscriptions",
              "Microsoft.Resources/resourceGroups"
            ]
          },
          {
            "field": "[concat('tags[', parameters('tagName'), ']')]",
            "exists": "false"
          }
        ]
      },
      "then": {
        "effect": "Deny"
      }
    },
    "parameters": {
      "tagName": {
        "type": "String",
        "metadata": {
          "displayName": "Tag Name",
          "description": "Name of the tag to enforce"
        },
        "defaultValue": "Environment"
      }
    }
  }
}
```
*Note: This simplified example denies if the tag doesn't exist. A more robust policy could also check for allowed values using the `in` operator.*

## Quick Checklist/Exercise

1.  **Identify the right tool:** For preventing the accidental deletion of a critical production database, which Azure governance feature would you use, and what level of lock would you apply?
2.  **Scale your policies:** If you need to apply a consistent set of security policies and deploy a standard networking setup across 10 different Azure subscriptions owned by different departments, which two Azure governance services would be most effective for achieving this efficiently and at scale?
3.  **Policy vs. Blueprint:** Explain the primary difference between Azure Policy and Azure Blueprints, considering their purpose in maintaining compliance and consistency.