# Azure Cloud Engineer Capstone Project Study Guide

A Capstone Project in the Azure Cloud Engineer roadmap is your opportunity to synthesize all learned concepts into a tangible, production-ready solution. It involves designing, implementing, deploying, and monitoring a multi-service Azure solution for a realistic scenario, with a strong emphasis on documenting every stage.

## 1. Project Scoping and Requirements Gathering

*   **Define the Problem:** Start with a clear problem statement. What business need or technical challenge does your solution address?
*   **Realistic Scenario:** Choose a scenario that mirrors real-world use cases. Examples:
    *   Web application with a backend API and database.
    *   Data processing pipeline.
    *   IoT data ingestion and analysis.
    *   Serverless workflow automation.
*   **Functional & Non-Functional Requirements:** List what the system *must do* (functional) and qualities like performance, security, scalability, availability, and cost (non-functional).

## 2. Architectural Design

This is the blueprint of your solution.

*   **Service Selection:** Choose appropriate Azure services for different layers:
    *   **Compute:** Azure App Service, Azure Functions, Azure Kubernetes Service (AKS), Azure Virtual Machines.
    *   **Storage:** Azure Blob Storage, Azure Files, Azure SQL Database, Cosmos DB, Azure Table Storage.
    *   **Networking:** Azure Virtual Network, Load Balancer, Application Gateway, Azure Firewall.
    *   **Identity & Security:** Azure Active Directory, Azure Key Vault, Managed Identities, RBAC.
    *   **Monitoring & Logging:** Azure Monitor, Application Insights, Log Analytics Workspace.
    *   **Integration:** Azure Service Bus, Azure Event Hubs, Logic Apps, API Management.
*   **High-Level Design:** Diagram showing major components and their interactions.
*   **Detailed Design:** Specify configurations, security considerations, and data flow.
*   **Scalability & Resiliency:** Design for fault tolerance, disaster recovery, and ability to scale horizontally/vertically.

## 3. Infrastructure as Code (IaC)

IaC is critical for repeatable and consistent deployments. You *must* use an IaC tool.

*   **Tools:**
    *   **Azure Resource Manager (ARM) templates:** Native to Azure. JSON-based.
    *   **Bicep:** A declarative language that is a transparent abstraction over ARM JSON. Easier to read and write.
    *   **Terraform:** An open-source tool that allows you to define and provision infrastructure across various cloud providers.
*   **Key Principles:**
    *   **Idempotence:** Applying the same configuration multiple times yields the same result.
    *   **Version Control:** Store IaC files in Git.
    *   **Modularity:** Break down infrastructure into reusable modules.

### Simple Bicep Example: Web App with Storage Account

```bicep
param appServiceName string = 'myCapstoneWebApp'
param storageAccountName string = 'mycapstonestorage${uniqueString(resourceGroup().id)}'
param location string = resourceGroup().location
param skuName string = 'F1' // Free tier for App Service Plan

resource storage 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: storageAccountName
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    accessTier: 'Hot'
  }
}

resource appServicePlan 'Microsoft.Web/serverfarms@2022-09-01' = {
  name: '${appServiceName}-plan'
  location: location
  sku: {
    name: skuName
  }
}

resource webApp 'Microsoft.Web/sites@2022-09-01' = {
  name: appServiceName
  location: location
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      appSettings: [
        {
          name: 'STORAGE_ACCOUNT_NAME'
          value: storage.name
        }
      ]
    }
  }
}

output webAppHostName string = webApp.properties.defaultHostName
output storageAccountEndpoint string = storage.properties.primaryEndpoints.blob
```

## 4. Implementation and Deployment

*   **Application Development:** Write the code for your application components.
*   **CI/CD Pipeline:** Automate building, testing, and deploying your solution.
    *   **Azure DevOps:** Comprehensive platform for CI/CD.
    *   **GitHub Actions:** Integrate CI/CD directly with your GitHub repositories.
*   **Deployment Strategies:** Consider blue/green, canary deployments for zero-downtime updates.

## 5. Monitoring, Logging, and Alerts

*   **Azure Monitor:** Collects and analyzes telemetry from your Azure resources.
*   **Application Insights:** Application Performance Management (APM) for web apps.
*   **Log Analytics Workspace:** Centralized log collection and querying.
*   **Alerts:** Configure alerts for critical metrics (CPU usage, error rates, etc.) and logs.
*   **Dashboards:** Create custom dashboards to visualize the health and performance of your solution.

## 6. Security and Compliance

*   **Network Security:** Use Network Security Groups (NSGs), Azure Firewall, and Private Endpoints.
*   **Identity Management:** Implement Azure AD for authentication, Managed Identities for Azure service authentication, and RBAC for authorization.
*   **Secrets Management:** Store sensitive information (connection strings, API keys) securely using Azure Key Vault.
*   **Compliance:** Adhere to relevant industry standards and regulations (if applicable to your scenario).

## 7. Cost Management

*   **Estimate Costs:** Use the Azure Pricing Calculator.
*   **Cost Optimization:**
    *   Right-sizing resources.
    *   Utilizing serverless options.
    *   Implementing auto-scaling.
    *   Choosing appropriate pricing tiers (e.g., consumption vs. dedicated plans).
    *   Leveraging Azure Reserved Instances or Azure Hybrid Benefit.

## 8. Documentation

Comprehensive documentation is as crucial as the code itself.

*   **Architectural Document:** Detailed explanation of your design choices, service selection, and a logical/physical architecture diagram.
*   **IaC Readme:** Instructions on how to deploy your infrastructure.
*   **Application Readme:** How to run, configure, and troubleshoot your application.
*   **Operational Procedures/Runbooks:** Steps for common operational tasks, troubleshooting guides.
*   **Monitoring Plan:** What metrics are tracked, alert configurations, dashboard links.

---

### Quick Capstone Project Checklist/Exercise

1.  **Question:** You need to provision a new Azure Web App, an Azure SQL Database, and an Azure Key Vault for your capstone project. Which Azure IaC tool would you primarily choose and why?
2.  **Question:** Your web application is experiencing high CPU usage spikes. Which Azure monitoring service would you use to diagnose the issue, and what specific feature within it would help you visualize the trend over time?
3.  **Question:** What are three crucial aspects you must document for your capstone project, beyond just the code itself?
