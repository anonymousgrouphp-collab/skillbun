# Azure Resource Tags & Locks

This study guide delves into two crucial aspects of Azure resource management: **Resource Tags** for organization and cost management, and **Resource Locks** for protecting critical infrastructure from accidental changes. Mastering these concepts is fundamental for effective cloud governance in Azure.

## 1. Azure Resource Tags

Azure Resource Tags are metadata elements that you apply to your Azure resources. They are key-value pairs that allow you to categorize resources logically.

### 1.1 Core Concepts

*   **Key-Value Pairs:** Each tag consists of a `name` (key) and a `value`. For example, `Environment: Production`, `CostCenter: IT-DevOps`, `Project: Alpha`.
*   **Purpose:**
    *   **Organization:** Grouping and identifying resources based on criteria like department, environment, or project.
    *   **Cost Management:** Allocating costs to specific departments, projects, or environments by filtering billing reports using tags.
    *   **Automation:** Using tags to drive automation scripts (e.g., stopping all "Dev" environment VMs at night).
    *   **Reporting:** Creating custom reports on resource usage and compliance.
    *   **Policy Enforcement:** Using Azure Policy to enforce tagging standards.

### 1.2 Implementing Resource Tags

Tags can be applied at various scopes: resource, resource group, or subscription. Tags applied at a higher scope are not inherited by default but can be enforced via Azure Policy.

#### Example: Applying Tags using Azure CLI

To tag an existing Virtual Machine:

```bash
az resource tag --tags Environment=Development Project=WebApp Owner=JohnDoe --resource-group myResourceGroup --name myVM --resource-type "Microsoft.Compute/virtualMachines"
```

To view tags on a resource group:

```bash
az group show --name myResourceGroup --query tags
```

### 1.3 Best Practices for Tagging

*   **Consistent Naming:** Establish clear and consistent naming conventions for your tag keys and values across your organization.
*   **Tag Governance:** Use Azure Policy to enforce required tags and their values, ensuring compliance.
*   **Critical Tags:** Define a set of mandatory tags (e.g., `Environment`, `CostCenter`, `Owner`) for all resources.
*   **Automation:** Integrate tagging into your infrastructure-as-code (IaC) deployments using ARM templates, Terraform, or Bicep.

## 2. Azure Resource Locks

Azure Resource Locks prevent users from accidentally deleting or modifying critical resources, resource groups, or even subscriptions. They provide an additional layer of protection beyond Role-Based Access Control (RBAC).

### 2.1 Core Concepts

*   **Protection Mechanism:** Locks apply to all users and roles, even those with owner permissions, preventing specific actions unless the lock is explicitly removed.
*   **Types of Locks:**
    *   **`CanNotDelete` (Delete):** Authorized users can still read and modify a resource, but they cannot delete it.
    *   **`ReadOnly`:** Authorized users can only read a resource. They cannot delete or modify it. This is more restrictive.
*   **Scope:** Locks can be applied to:
    *   Individual resources (e.g., a specific storage account).
    *   Resource groups (all resources within that group are affected).
    *   Subscriptions (all resources and resource groups within the subscription are affected).

### 2.2 Implementing Resource Locks

Resource locks are typically applied to critical resources like production databases, core networking components, or critical resource groups.

#### Example: Applying a Resource Lock using Azure CLI

To apply a `CanNotDelete` lock to a storage account:

```bash
az lock create --name myStorageAccountDeleteLock --resource-group myResourceGroup --resource myStorageAccount --resource-type Microsoft.Storage/storageAccounts --lock-type CanNotDelete --notes "Prevent accidental deletion of production storage account"
```

To apply a `ReadOnly` lock to a resource group:

```bash
az lock create --name myProdRGReadOnlyLock --resource-group myProdResourceGroup --lock-type ReadOnly --notes "Prevent any modifications to production resource group"
```

To delete a lock (requires `Microsoft.Authorization/*/Delete` permissions, typically Owner or User Access Administrator):

```bash
az lock delete --name myStorageAccountDeleteLock --resource-group myResourceGroup --resource myStorageAccount --resource-type Microsoft.Storage/storageAccounts
```

### 2.3 Important Considerations for Locks

*   **Permissions:** Users need `Microsoft.Authorization/locks/*` permissions to create or delete locks. Typically, this is granted to roles like Owner or User Access Administrator.
*   **Automation Impact:** `ReadOnly` locks can break automation that attempts to modify resources. Ensure your automation accounts or service principals have exceptions or that locks are temporarily removed during maintenance windows.
*   **Hierarchy:** Locks applied at a higher scope (e.g., resource group) are inherited by resources within that scope. A child resource cannot have a less restrictive lock than its parent.

## 3. Combining Tags and Locks

Tags and locks are complementary. Tags help you organize and manage resources effectively, including identifying critical resources. Locks then provide the necessary protection for those identified critical resources, ensuring their integrity and availability.

---

## Quick Checklist/Exercise

1.  **Scenario:** You have a new Azure SQL Database named `mydb-prod` in `rg-production`. You want to ensure it's categorized as `Environment: Production` and `CostCenter: 001`. Additionally, you want to prevent its accidental deletion.
    *   How would you apply these tags using Azure CLI?
    *   How would you apply a `CanNotDelete` lock to this database using Azure CLI?
2.  **Question:** Explain the difference between a `CanNotDelete` lock and a `ReadOnly` lock. When would you use each?
3.  **Action:** Imagine you have a resource group `rg-dev` with multiple VMs. You want to tag all VMs within this group as `Environment: Development`. Which Azure feature could help you enforce this tagging automatically for newly created VMs in `rg-dev`?
