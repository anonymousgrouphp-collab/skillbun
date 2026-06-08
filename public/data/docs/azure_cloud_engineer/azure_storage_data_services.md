# Azure Storage & Data Services

Welcome to the Azure Storage & Data Services module! This topic explores the extensive range of data storage solutions and database offerings available in Azure. As a cloud engineer, understanding these services is crucial for designing and implementing scalable, performant, and cost-effective data solutions that meet diverse application requirements. We'll cover everything from simple file storage to globally distributed NoSQL databases.

## 1. Azure Storage Accounts: The Foundation

An Azure Storage Account is a single object that encapsulates all your Azure storage data objects: blobs, files, queues, tables, and disks. It provides a unique namespace for your data and is the base for managing access, security, and replication.

### Key Concepts:

*   **Storage Account Types**:
    *   **General-purpose v2 (GPv2)**: Recommended for most scenarios, offering the latest features and supporting blobs, files, queues, tables, and Data Lake Storage Gen2.
    *   **Blob storage accounts**: Specialized for block blobs and append blobs, offering lower prices per GB.
*   **Access Tiers (for Blob Storage)**:
    *   **Hot**: Optimized for frequently accessed data.
    *   **Cool**: Optimized for infrequently accessed data (stored for at least 30 days).
    *   **Archive**: Optimized for rarely accessed data with flexible latency requirements (stored for at least 180 days).
*   **Redundancy Options**: Azure automatically replicates your data to protect against hardware failures.
    *   **Locally Redundant Storage (LRS)**: Data is replicated three times within a single data center.
    *   **Zone-Redundant Storage (ZRS)**: Data is replicated across three availability zones within a single region.
    *   **Geo-Redundant Storage (GRS)**: Data is replicated to a secondary region hundreds of miles away, providing protection against regional disasters.
    *   **Read-Access Geo-Redundant Storage (RA-GRS)**: Similar to GRS, but allows read access to the data in the secondary region.
    *   Newer options like GZRS (Geo-Zone Redundant Storage) and RA-GZRS combine ZRS and GRS for maximum resilience.

## 2. Azure Blob Storage

Azure Blob Storage is Microsoft's object storage solution for the cloud. It's optimized for storing massive amounts of unstructured data, such as text or binary data.

### Use Cases:

*   Serving images or documents directly to a web browser.
*   Storing files for distributed access.
*   Streaming video and audio.
*   Storing data for backup, disaster recovery, and archiving.
*   Storing data for analysis by an on-premises or Azure-hosted service.

### Blob Types:

*   **Block blobs**: Optimized for uploading large amounts of data efficiently. Ideal for documents, media files, backups.
*   **Page blobs**: Optimized for random read/write operations. Used for virtual hard drive (VHD) files for Azure VMs.
*   **Append blobs**: Optimized for append operations. Ideal for logging data.

### Example: Uploading a Blob using Azure CLI

To upload a local file to an Azure Blob Storage container:

```bash
az storage blob upload \
    --account-name "yourstorageaccount" \
    --container-name "yourcontainer" \
    --name "mytestfile.txt" \
    --file "./localfile.txt" \
    --auth-mode login # Use your logged-in Azure identity
```

## 3. Azure File Storage

Azure Files provides fully managed file shares in the cloud that are accessible via the industry-standard Server Message Block (SMB) protocol or Network File System (NFS) protocol. These file shares can be mounted concurrently by cloud or on-premises deployments.

### Use Cases:

*   Lift and shift applications that expect a file share to the cloud.
*   Sharing configuration files or logs.
*   Diagnostic logs, tools, and utilities shareable across multiple VMs.
*   **Azure File Sync**: Caches Azure file shares on Windows Server for fast local access, while also replicating changes to the cloud.

## 4. Azure SQL Database

Azure SQL Database is a fully managed platform-as-a-service (PaaS) relational database engine based on the latest stable version of Microsoft SQL Server. It handles most of the database management functions like patching, backups, and monitoring without user involvement.

### Deployment Options:

*   **Single Database**: Manages a single database with its own set of resources.
*   **Elastic Pools**: Manages a group of single databases with a shared set of resources, ideal for SaaS applications.
*   **SQL Managed Instance**: Provides near 100% compatibility with the latest on-premises SQL Server (Enterprise Edition), useful for migrating existing SQL Server applications with minimal changes.

### Service Tiers:

*   **vCore model**: Offers granular control over compute, memory, and storage, and flexible scalability.
*   **DTU (Database Transaction Unit) model**: Bundles compute, memory, and I/O resources for simpler sizing.

## 5. Azure Cosmos DB

Azure Cosmos DB is Microsoft's globally distributed, multi-model database service. It offers turnkey global distribution, elastic scalability of throughput and storage, and guarantees of low latency and high availability.

### Key Features:

*   **Multi-model**: Supports various data models and APIs, including:
    *   **SQL API (DocumentDB)**: JSON documents.
    *   **MongoDB API**: Compatible with MongoDB applications.
    *   **Cassandra API**: Compatible with Apache Cassandra.
    *   **Gremlin API**: Graph database.
    *   **Table API**: Key-value database compatible with Azure Table Storage.
*   **Globally Distributed**: Easily distribute your data across any number of Azure regions with a click of a button.
*   **Consistency Models**: Offers five well-defined consistency models: Strong, Bounded-staleness, Session, Consistent-prefix, and Eventual.
*   **Guaranteed Latency**: Offers single-digit millisecond latencies at the 99th percentile, backed by SLAs.

## 6. Azure Data Lake Storage Gen2

Azure Data Lake Storage Gen2 is a highly scalable and secure data lake solution built on Azure Blob Storage. It is designed for big data analytics workloads and offers a hierarchical file system, making it optimized for data lake scenarios.

### Key Benefits:

*   **Hadoop Compatible**: Fully compatible with Hadoop Distributed File System (HDFS) APIs.
*   **Optimized for Analytics**: Designed for large-scale data processing and analytics.
*   **Security**: Integrates with Azure Active Directory and provides POSIX-compliant access control lists (ACLs).

---

## Quick Checklist/Exercise:

1.  **Scenario Mapping**: You need to store millions of small, frequently accessed documents (less than 1MB each) that require low-latency reads. Which Azure Storage service and access tier would you primarily consider, and why?
2.  **Redundancy Choice**: Your company requires a database solution that can withstand a regional outage with minimal data loss and downtime, while also providing read access to the replicated data during such an event. Which Azure Storage redundancy option (if applicable to a relational database like Azure SQL DB) or Cosmos DB feature would best address this?
3.  **Tooling**: You have an on-premises application that needs to migrate its file share dependencies to the cloud without rewriting significant parts of the application. What Azure service would you use, and what feature would you consider for optimizing local access?
