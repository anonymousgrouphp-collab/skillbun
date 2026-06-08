# Azure Automation & Infrastructure as Code (IaC)

This study guide explores the critical concepts of Azure Automation and Infrastructure as Code (IaC), essential for efficient, consistent, and scalable cloud management. You'll learn how to automate routine tasks and provision Azure resources reliably using IaC principles and tools.

## 1. Introduction to Azure Automation & IaC

**Azure Automation** is a cloud-based automation service that allows you to automate routine, repeatable, and common management tasks in Azure and hybrid environments. It helps reduce manual effort, improve operational efficiency, and maintain system consistency.

**Infrastructure as Code (IaC)** is the practice of managing and provisioning infrastructure through code instead of manual processes. It treats infrastructure configuration files as software source code, allowing for version control, continuous integration, and consistent deployment.

## 2. Azure Automation Deep Dive

Azure Automation provides a suite of capabilities:

*   **Runbooks**: Automate tasks using PowerShell, Python, or Graphical runbooks. They can manage Azure resources, on-premises systems, and other cloud environments.
    *   **PowerShell Runbooks**: Scripting based on PowerShell.
    *   **Python Runbooks**: Scripting based on Python.
    *   **Graphical Runbooks**: Visual editor for drag-and-drop automation.
*   **Desired State Configuration (DSC)**: Define and deploy a consistent configuration for your servers. Azure Automation DSC can automatically configure and maintain server states.
*   **Update Management**: Manage operating system updates for machines across your Azure, on-premises, and other cloud environments.
*   **Change Tracking & Inventory**: Track changes to software, files, daemons, and services on your virtual machines to help diagnose operational issues.

**Use Cases for Azure Automation:**
*   Starting/stopping VMs on a schedule.
*   Automating data backups.
*   Applying security patches.
*   Orchestrating complex deployment workflows.

## 3. Infrastructure as Code (IaC) Principles & Benefits

**Core Principles of IaC:**
*   **Version Control**: Infrastructure definitions are stored in source control (e.g., Git), allowing tracking changes, collaboration, and rollbacks.
*   **Idempotency**: Applying the same code multiple times should always result in the same infrastructure state without unintended side effects.
*   **Declarative vs. Imperative**: You define *what* the infrastructure should look like (declarative) rather than *how* to achieve it (imperative). IaC tools generally favor declarative approaches.

**Benefits of IaC:**
*   **Consistency**: Eliminates "configuration drift" and ensures environments are identical.
*   **Repeatability**: Easily provision identical environments (dev, test, prod).
*   **Speed**: Automates provisioning, speeding up deployment cycles.
*   **Reduced Errors**: Minimizes human error associated with manual configuration.
*   **Cost Savings**: Optimize resource usage by quickly scaling up or down.
*   **Compliance & Auditability**: Infrastructure state is documented and auditable through code.

## 4. IaC Tools in Azure

Azure supports several powerful IaC tools:

### 4.1. Azure Resource Manager (ARM) Templates

ARM Templates are JSON-based files that define the infrastructure and configuration for your Azure solution. They are native to Azure and allow you to deploy, update, or delete resources in a declarative way.

**Structure of an ARM Template:**
*   `$schema`: The JSON schema for the template.
*   `contentVersion`: Version of the template.
*   `parameters`: Values provided at deployment time.
*   `variables`: Values used within the template for readability and reusability.
*   `resources`: The actual Azure resources to be deployed (VMs, storage accounts, etc.).
*   `outputs`: Values returned from the deployment.

**Simple ARM Template Example (Storage Account):**

```json
{
  "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
  "contentVersion": "1.0.0.0",
  "parameters": {
    "storageAccountName": {
      "type": "string",
      "metadata": {
        "description": "Name of the Storage Account"
      }
    },
    "location": {
      "type": "string",
      "defaultValue": "[resourceGroup().location]",
      "metadata": {
        "description": "Location for the Storage Account"
      }
    }
  },
  "resources": [
    {
      "type": "Microsoft.Storage/storageAccounts",
      "apiVersion": "2021-09-01",
      "name": "[parameters('storageAccountName')]",
      "location": "[parameters('location')]",
      "sku": {
        "name": "Standard_LRS"
      },
      "kind": "StorageV2"
    }
  ],
  "outputs": {
    "storageAccountResourceId": {
      "type": "string",
      "value": "[resourceId('Microsoft.Storage/storageAccounts', parameters('storageAccountName'))]"
    }
  }
}
```

### 4.2. Bicep

Bicep is a domain-specific language (DSL) for deploying Azure resources declaratively. It's a transparent abstraction over ARM JSON and offers a cleaner, more concise syntax, better modularity, and strong type validation. Bicep files compile directly to ARM JSON templates.

**Simple Bicep Example (Storage Account):**

```bicep
param storageAccountName string
param location string = resourceGroup().location

resource storage 'Microsoft.Storage/storageAccounts@2021-09-01' = {
  name: storageAccountName
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
}

output storageAccountResourceId string = storage.id
```

### 4.3. Terraform by HashiCorp

Terraform is an open-source IaC tool that allows you to define and provision cloud and on-premises resources using a consistent command-line interface. It's cloud-agnostic, supporting Azure, AWS, GCP, and many other providers. Terraform uses HashiCorp Configuration Language (HCL).

**Key Concepts:**
*   **Providers**: Plugins that allow Terraform to interact with different cloud platforms.
*   **Resources**: Declarations of infrastructure objects.
*   **State File**: Terraform maintains a state file (usually `terraform.tfstate`) that maps real-world resources to your configuration, preventing accidental changes and enabling updates.

**Simple Terraform Example (Azure Storage Account):**

```terraform
# Configure the Azure provider
provider "azurerm" {
  features {}
}

# Create a resource group
resource "azurerm_resource_group" "rg" {
  name     = "my-terraform-rg"
  location = "East US"
}

# Create a storage account
resource "azurerm_storage_account" "sa" {
  name                     = "myskillbunsa001" # Must be globally unique
  resource_group_name      = azurerm_resource_group.rg.name
  location                 = azurerm_resource_group.rg.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
}

output "storage_account_name" {
  value = azurerm_storage_account.sa.name
}
```

## 5. Integrating Azure Automation with IaC

Azure Automation can complement IaC in several ways:
*   **Post-Deployment Configuration**: After IaC provisions the core infrastructure, Automation runbooks can perform final configurations, application deployments, or health checks.
*   **Hybrid Management**: Automation can extend IaC deployments to on-premises resources that IaC tools might not directly manage.
*   **Scheduled IaC Deployments**: While less common for initial provisioning, Automation could trigger IaC deployments for routine infrastructure drift remediation or environment refreshes.
*   **DSC with IaC**: IaC can provision VMs, and then Azure Automation DSC can ensure those VMs maintain a desired software configuration.

## Quick Checklist/Exercises

1.  **Differentiate IaC tools**: Explain the core differences and ideal use cases for ARM Templates, Bicep, and Terraform when deploying resources in Azure.
2.  **Azure Automation Use Case**: Describe a scenario where Azure Automation would be beneficial for managing an Azure environment, distinct from initial resource provisioning.
3.  **Idempotency in IaC**: In your own words, explain what idempotency means in the context of Infrastructure as Code and why it's a crucial principle.
