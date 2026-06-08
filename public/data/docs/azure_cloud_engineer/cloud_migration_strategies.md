# Cloud Migration Strategies & Tools

Cloud migration is the process of moving digital assets, applications, and IT workloads from an on-premises data center to the cloud, or from one cloud environment to another. This study guide explores key migration strategies and how Azure tools facilitate this transition.

## 1. Understanding Cloud Migration Strategies (The 6 Rs)

The "6 Rs" framework provides a common classification for migration strategies, each with different implications for effort, cost, and agility.

### 1.1 Rehost (Lift-and-Shift)
*   **Description:** Moving applications without significant changes. It involves "lifting" servers, VMs, or databases from on-premises and "shifting" them to the cloud.
*   **Best for:** Rapid migration, early-stage cloud adoption, applications with minimal interdependencies.
*   **Azure Example:** Migrating an on-premises SQL Server VM directly to an Azure IaaS VM.

### 1.2 Refactor (Re-platform)
*   **Description:** Making minor optimizations to an application to take advantage of cloud capabilities, without fundamentally changing its core architecture.
*   **Best for:** Gaining some cloud benefits (e.g., managed services) with moderate effort, improving operational efficiency.
*   **Azure Example:** Migrating an on-premises SQL Server database to Azure SQL Database (PaaS) instead of an IaaS VM.

### 1.3 Re-architect
*   **Description:** Modifying or extending an application's architecture to fully leverage cloud-native features and optimize for scalability, resilience, and cost.
*   **Best for:** Modernizing critical applications, achieving significant long-term benefits, improving developer agility.
*   **Azure Example:** Breaking down a monolithic application into microservices using Azure Kubernetes Service (AKS) or Azure Container Apps, and leveraging Azure Functions for serverless components.

### 1.4 Rebuild
*   **Description:** Rebuilding an application from scratch on a cloud-native platform, discarding the existing code base.
*   **Best for:** When the existing application is no longer fit for purpose, heavily outdated, or difficult to maintain. High cost but potentially high long-term ROI.
*   **Azure Example:** Replacing an old custom CRM system with a new application built entirely on Azure PaaS services like Azure App Service, Azure Cosmos DB, and Azure Functions.

### 1.5 Replace
*   **Description:** Discarding an existing application and replacing it with a new, off-the-shelf SaaS solution.
*   **Best for:** When a suitable commercial solution exists that meets business needs, reducing operational burden of custom applications.
*   **Azure Example:** Replacing an on-premises Exchange server with Microsoft 365 (SaaS).

### 1.6 Retain (Revisit)
*   **Description:** Keeping certain applications on-premises, often due to regulatory requirements, latency sensitivity, or recent investments.
*   **Best for:** Applications not suitable for cloud migration in the short term.

### 1.7 Retire
*   **Description:** Decommissioning applications that are no longer needed or used. This saves resources and reduces the migration scope.

## 2. Leveraging Azure Tools for Migration

Azure provides a comprehensive suite of tools and services to assist with cloud migration, with Azure Migrate being the primary hub.

### 2.1 Azure Migrate

Azure Migrate is a centralized hub for assessment and migration of on-premises servers, infrastructure, applications, and data to Azure. It provides a unified platform to discover, assess, and migrate.

#### Key Capabilities:
*   **Discovery & Assessment:**
    *   Discover servers, databases, web apps, and virtual desktops.
    *   Assess readiness for Azure, get cost estimates, and identify dependencies.
    *   Provides right-sizing recommendations.
*   **Migration:**
    *   Server migration (VMware, Hyper-V, physical servers, other clouds).
    *   Database migration (SQL, MySQL, PostgreSQL, Oracle).
    *   Web app migration.
    *   Data Box for large-scale data transfer.

#### Azure Migrate Workflow (Conceptual Steps):

1.  **Set up an Azure Migrate Project:** In the Azure portal, create a new Azure Migrate project.
2.  **Discover On-Premises Assets:**
    *   Deploy an Azure Migrate appliance (VM) in your on-premises environment.
    *   The appliance discovers servers, databases, and web apps.
    *   Collects performance data, configuration information, and dependencies.
3.  **Perform Assessment:**
    *   Use the collected data to create assessments (e.g., "Server Assessment", "Database Assessment").
    *   Review readiness (e.g., Azure VM suitability, SQL database compatibility).
    *   Analyze cost estimates for running in Azure.
    *   Identify inter-server dependencies.
4.  **Plan Migration Wave:** Group interdependent applications and servers into migration waves based on assessment insights.
5.  **Execute Migration:**
    *   **Replicate:** Use Azure Migrate Server Migration to replicate on-premises VMs to Azure.
    *   **Test Migration:** Perform a test migration to ensure the migrated workload functions correctly in Azure without impacting production.
    *   **Cutover:** Once satisfied with the test, perform a planned cutover to switch production traffic to the Azure-migrated resources.
6.  **Decommission On-Premises:** After successful cutover, decommission the original on-premises resources.

### 2.2 Other Relevant Azure Tools

*   **Azure Database Migration Service (DMS):** Specialized service for migrating databases to Azure with minimal downtime.
*   **Azure Site Recovery (ASR):** Primarily for disaster recovery, but can also be used for server migration (especially for scenarios involving continuous replication).
*   **Azure Data Box:** Physical appliance for transferring large amounts of offline data into Azure.
*   **Azure App Service Migration Assistant:** Tool to assess and migrate .NET and PHP web applications to Azure App Service.

## 3. Quick Checklist/Exercise

1.  **Scenario Mapping:** You need to move an on-premises application that has a legacy SQL Server database. The business wants to leverage Azure's managed database services but doesn't want to rewrite the application's data access layer. Which migration strategy (from the 6 Rs) would be most suitable, and why?
2.  **Azure Migrate Purpose:** Describe the primary role of the Azure Migrate appliance in the discovery and assessment phase.
3.  **Migration Strategy Choice:** A company decides to replace its entire on-premises CRM system with Salesforce (a SaaS solution). Which "R" strategy does this represent?
