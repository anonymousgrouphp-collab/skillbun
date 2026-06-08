# Azure App Service (Web Apps, API Apps) Study Guide

Azure App Service is a fully managed Platform-as-a-Service (PaaS) offering from Microsoft Azure that enables developers to build, deploy, and scale web applications, REST APIs, and mobile backends with ease. It supports multiple languages and frameworks, including .NET, .NET Core, Java, Node.js, PHP, Python, and Ruby. App Service abstracts away the underlying infrastructure, allowing developers to focus solely on their code.

## 1. Core Concepts

### 1.1 App Service Plan

The App Service Plan is the core of Azure App Service. It defines the set of compute resources (VMs) that your App Services run on. It dictates:
*   **Pricing Tier:** (e.g., Free, Basic, Standard, Premium, Isolated) which determines available features, CPU, memory, and autoscaling capabilities.
*   **Region:** The Azure datacenter where your resources are located.
*   **Operating System:** Windows or Linux.

Multiple App Services can share the same App Service Plan, optimizing cost and resource utilization.

### 1.2 App Service Types

Azure App Service supports various application types, all running on the same underlying platform:
*   **Web Apps:** Ideal for hosting traditional web applications (e.g., front-end web apps, marketing sites, e-commerce platforms). Supports popular web frameworks.
*   **API Apps:** Specifically designed for hosting RESTful APIs, providing features like Cross-Origin Resource Sharing (CORS) support and easy integration with API Management.
*   **Mobile Backends:** Offers features to power mobile applications, including push notifications, user authentication, and offline data synchronization capabilities.

## 2. Key Features and Capabilities

### 2.1 Deployment Slots

Deployment slots are live apps with their own hostnames. They allow you to deploy different versions of your application to separate slots (e.g., `staging`, `production`). Key benefits include:
*   **Zero-Downtime Deployments:** Deploy new versions to a staging slot, test it thoroughly, and then "swap" it into the production slot without application downtime.
*   **A/B Testing:** Direct a percentage of user traffic to a specific slot to test new features.
*   **Rollback:** Quickly revert to a previous stable version by swapping back if issues arise after a deployment.

### 2.2 Custom Domains and SSL

*   **Custom Domains:** Map your own domain name (e.g., `www.yourcompany.com`) to your Azure App Service, replacing the default Azure URL (`yourapp.azurewebsites.net`).
*   **SSL Certificates:** Secure your application with SSL/TLS encryption. You can use free App Service Managed Certificates, import your own, or purchase one through Azure.

### 2.3 Scaling

App Service provides robust scaling options to handle varying traffic loads:
*   **Scale Up (Vertical Scaling):** Increase the computing power (CPU, memory, disk space) of your App Service Plan by upgrading to a higher pricing tier (e.g., from Basic to Standard).
*   **Scale Out (Horizontal Scaling):** Increase the number of instances (VMs) that run your application to handle increased traffic. This can be configured manually or through **Autoscaling**, which automatically adjusts the instance count based on metrics like CPU usage, HTTP queue length, or predefined schedules.

### 2.4 Deployment Methods

Azure App Service supports various deployment strategies:
*   **Continuous Deployment:** Integrate with source control systems like Azure DevOps, GitHub, Bitbucket, or local Git repositories. Changes pushed to the repository automatically trigger deployments.
*   **Manual Deployment:** Deploy using FTP, Web Deploy, or Azure CLI/PowerShell.
*   **Containerization:** Deploy Docker images directly to App Service, supporting single-container or multi-container (Docker Compose) applications.

### 2.5 Monitoring and Diagnostics

Integrates seamlessly with Azure Monitor and Application Insights for comprehensive monitoring, logging, performance tracking, and diagnostics of your applications, providing insights into their health and performance.

## 3. Simple Deployment Example (Azure CLI)

This example demonstrates how to create an App Service Plan and a Web App using Azure CLI. This forms the foundational structure before deploying your application code.

```bash
# Ensure you are logged into Azure CLI (az login)

# 1. Create a Resource Group (if you don't have one already)
# Resource groups are logical containers for your Azure resources.
az group create --name MyWebAppResourceGroup --location eastus

# 2. Create an App Service Plan
# This defines the compute resources (e.g., pricing tier, OS) for your app.
# --sku F1 is the Free tier (for development/testing).
# --is-linux specifies a Linux plan. Omit for Windows.
az appservice plan create \
  --name MyWebAppPlan \
  --resource-group MyWebAppResourceGroup \
  --sku F1 \
  --is-linux

# 3. Create a Web App within the App Service Plan
# The --name must be globally unique.
# --runtime specifies the language stack (e.g., 