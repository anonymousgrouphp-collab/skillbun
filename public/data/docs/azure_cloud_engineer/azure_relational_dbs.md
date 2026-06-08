# Azure Relational Databases (SQL DB, MySQL, PostgreSQL)

## Introduction
As an Azure Cloud Engineer, understanding how to deploy and manage fully managed relational databases is crucial. Azure provides robust Platform-as-a-Service (PaaS) offerings for various relational database engines, significantly reducing administrative overhead, ensuring high availability, and offering built-in scalability and security. This study guide covers the core concepts and use cases for Azure SQL Database, Azure SQL Managed Instance, Azure Database for PostgreSQL, and Azure Database for MySQL.

## Azure SQL Database
**Azure SQL Database** is a fully managed, intelligent, and scalable relational database service built on the latest stable version of the Microsoft SQL Server database engine. It provides a PaaS offering, meaning Microsoft handles the underlying infrastructure, patching, backups, and more.

*   **Key Features:**
    *   **Fully Managed:** Automated backups, patching, updates, and built-in high availability (up to 99.995%).
    *   **Scalability:** Independently scale compute and storage resources.
    *   **Advanced Security:** Threat detection, vulnerability assessment, transparent data encryption (TDE), and Azure Active Directory authentication.
    *   **Deployment Models:** Single database (for standalone applications), Elastic pools (for SaaS applications with many databases), and Hyperscale (for highly scalable workloads).
*   **Use Cases:** Cloud-native applications, modern web applications, microservices, and SaaS solutions requiring high performance, scalability, and minimal administration.

## Azure SQL Managed Instance
**Azure SQL Managed Instance** is a fully managed PaaS offering that provides near 100% compatibility with the latest SQL Server Enterprise edition database engine. It's designed to make migrating existing SQL Server databases to Azure as seamless as possible.

*   **Key Features:**
    *   **High Compatibility:** Supports most SQL Server features, including SQL Server Agent, cross-database queries, CLR, and database mail.
    *   **VNet Integration:** Deployed within your Azure Virtual Network (VNet) for enhanced security and isolation.
    *   **Migration-Friendly:** Ideal for 