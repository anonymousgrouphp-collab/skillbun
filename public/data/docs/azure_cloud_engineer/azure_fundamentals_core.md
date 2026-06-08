# Azure Fundamentals & Core Concepts: Study Guide

This guide establishes a strong foundation in cloud computing principles, Azure's global infrastructure, core services, and foundational concepts essential for any Azure Cloud Engineer.

## 1. Introduction to Cloud Computing

Cloud computing is the on-demand delivery of compute power, database storage, applications, and other IT resources through a cloud services platform via the internet with pay-as-you-go pricing. Instead of owning your computing infrastructure or data centers, you can access computing services—like servers, storage, databases, networking, analytics, and intelligence—from a cloud provider like Microsoft Azure.

### Benefits of Cloud Computing
*   **High Availability:** Applications remain accessible, even if a server fails.
*   **Scalability:** Ability to increase or decrease resources as needed.
*   **Elasticity:** Automatically scale resources up or down based on demand.
*   **Agility:** Rapid development, testing, and deployment of applications.
*   **Geo-distribution:** Deploy applications and data to regions around the globe.
*   **Disaster Recovery:** Protect data and applications against disasters.
*   **Cost Savings:** Pay only for what you use, no large upfront investments.

### Cloud Service Models
*   **Infrastructure as a Service (IaaS):** You manage the operating system, applications, and data. The cloud provider manages the physical infrastructure (e.g., Virtual Machines, Storage, Networking).
*   **Platform as a Service (PaaS):** You manage your applications and data. The cloud provider manages the operating system, runtime, and underlying infrastructure (e.g., Azure App Services, Azure Functions).
*   **Software as a Service (SaaS):** The cloud provider manages all aspects of the application (e.g., Microsoft 365, Salesforce).

### Cloud Deployment Models
*   **Public Cloud:** Services offered over the public internet, owned and operated by a third-party cloud provider (e.g., Azure).
*   **Private Cloud:** Services offered on a private network, typically within an organization's own data center.
*   **Hybrid Cloud:** A combination of public and private clouds, allowing data and applications to be shared between them.

## 2. Azure Global Infrastructure

Azure's infrastructure is designed for scale, resilience, and global reach.

*   **Geographies:** Discrete market areas, usually containing one or more Azure Regions, that preserve data residency and compliance boundaries.
*   **Regions:** A set of datacenters deployed within a latency-defined perimeter and connected through a dedicated regional low-latency network. Examples: East US, West Europe.
*   **Availability Zones:** Physically separate data centers within an Azure region that are fault-isolated from each other. They provide protection against datacenter-level failures. Regions supporting Availability Zones have a minimum of three separate zones.
*   **Resource Groups:** A logical container for Azure resources (e.g., virtual machines, storage accounts, virtual networks). They help organize and manage resources.
*   **Subscriptions:** A billing boundary for Azure resources and a management boundary for services. All resources are deployed within a subscription.
*   **Management Groups:** Containers for subscriptions, allowing for hierarchical organization and policy application at a level above subscriptions.

## 3. Core Azure Services

Azure offers a vast array of services across various categories.

*   **Compute:**
    *   **Virtual Machines (VMs):** IaaS offering for running Windows or Linux virtual machines.
    *   **Azure App Services:** PaaS offering for building, deploying, and scaling web apps and APIs.
    *   **Azure Functions:** Serverless compute service for running event-driven code without provisioning or managing infrastructure.
    *   **Azure Kubernetes Service (AKS):** Managed Kubernetes for deploying and managing containerized applications.
*   **Networking:**
    *   **Virtual Network (VNet):** Logically isolated section of the Azure cloud for your resources.
    *   **Load Balancer:** Distributes incoming network traffic across multiple backend resources.
    *   **VPN Gateway:** Connects your on-premises networks to Azure VNets over a secure VPN tunnel.
    *   **Azure DNS:** Hosting service for DNS domains, providing name resolution.
*   **Storage:**
    *   **Blob Storage:** Object storage for massive amounts of unstructured data (text, binary data).
    *   **File Storage:** Managed file shares in the cloud, accessible via SMB protocol.
    *   **Queue Storage:** Store large numbers of messages, providing asynchronous messaging.
    *   **Table Storage:** NoSQL key-attribute store for schemaless structured data.
*   **Databases:**
    *   **Azure SQL Database:** Managed relational database as a service (PaaS) based on SQL Server.
    *   **Azure Cosmos DB:** Globally distributed, multi-model database service.
    *   **Azure Database for MySQL/PostgreSQL:** Fully managed relational database services.
*   **Identity & Security:**
    *   **Azure Active Directory (Azure AD):** Cloud-based identity and access management service.
    *   **Azure Security Center / Defender for Cloud:** Unified infrastructure security management system.
    *   **Azure Firewall:** Managed, cloud-based network security service that protects your Azure Virtual Network resources.

## 4. Azure Management Tools

Interact with and manage your Azure resources using various tools.

*   **Azure Portal:** A web-based, unified console that provides a graphical user interface to manage Azure resources.
*   **Azure CLI (Command-Line Interface):** A set of commands used to create and manage Azure resources via a command-line interface.
*   **Azure PowerShell:** A set of cmdlets for managing Azure resources directly from PowerShell.
*   **Azure Resource Manager (ARM) Templates:** JSON files that define the infrastructure and configuration for your Azure solution. Allows for Infrastructure as Code (IaC).

### Azure CLI Example
Here's how to create a resource group and list it using the Azure CLI:

```bash
# Log in to Azure (if not already logged in)
az login

# Create a new resource group named 'myFundamentalRG' in the 'eastus' region
az group create --name myFundamentalRG --location eastus

# List all resource groups in your subscription
az group list --output table

# Delete the resource group (optional cleanup)
az group delete --name myFundamentalRG --no-wait --yes
```

## 5. Cost Management & SLAs

Understanding costs and service guarantees is crucial.

*   **Azure Pricing Calculator:** Estimate the cost of Azure services.
*   **Total Cost of Ownership (TCO) Calculator:** Estimate potential cost savings by migrating workloads to Azure.
*   **Azure Cost Management + Billing:** Monitor cloud spend, identify trends, and optimize costs.
*   **Service Level Agreements (SLAs):** Documents that describe Microsoft's commitment for uptime and connectivity for Azure services. If an SLA is not met, customers may be eligible for service credits.

## Quick Check / Exercise

1.  Explain the difference between IaaS, PaaS, and SaaS, providing an Azure service example for each.
2.  Describe how Azure Regions and Availability Zones work together to provide high availability for applications.
3.  You need to deploy a set of virtual machines, storage accounts, and a virtual network. What Azure management construct would you use to logically group these resources for easier management and billing?
