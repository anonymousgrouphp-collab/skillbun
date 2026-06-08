# Azure Managed Disks & Snapshots: Study Guide

## 1. Introduction to Azure Managed Disks

Azure Managed Disks are persistent, highly performant, and durable block storage volumes designed to be used with Azure Virtual Machines (VMs). They simplify disk management by abstracting away the underlying storage accounts, allowing you to focus on your VMs. When you use Managed Disks, Azure handles the complexities of storage accounts, including managing storage account limits and ensuring high availability.

### Key Benefits:
- **Simplicity:** Azure manages storage accounts for you, reducing administrative overhead.
- **Scalability:** Easily scale up or down disk sizes and types without needing to re-provision.
- **Durability:** Data is automatically replicated for high availability and resilience within an Azure region.
- **Security:** Integrated with Azure security features, including comprehensive encryption options.
- **Snapshot Support:** Easy creation of point-in-time backups for recovery or VM templating.

### OS Disks vs. Data Disks:
- **OS Disks:** Each Azure VM has one attached OS disk, which contains the operating system. It's typically a Managed Disk and is where the operating system files reside.
- **Data Disks:** Additional Managed Disks attached to a VM for storing application data, databases, user files, and other non-OS specific information. You can attach multiple data disks to a single VM, depending on the VM size.

## 2. Managed Disk Types

Azure offers various types of Managed Disks, each optimized for different performance and cost requirements:

- **Standard HDD (Hard Disk Drive):**
    - **Best For:** Infrequently accessed workloads, backup, and archival storage, development/test environments where performance isn't critical.
    - **Characteristics:** Lowest cost per GB, suitable for non-critical workloads where latency is not a primary concern. Utilizes traditional spinning hard drives.

- **Standard SSD (Solid State Drive):**
    - **Best For:** Web servers, lightly used enterprise applications, development/testing environments, and workloads requiring consistent low-latency performance.
    - **Characteristics:** Offers better performance and significantly lower latency than HDDs, providing a good balance of cost and performance for many common workloads.

- **Premium SSD:**
    - **Best For:** Production I/O-intensive applications, SQL Server, Oracle, SAP, high-performance databases, and other mission-critical workloads requiring very low latency and high throughput.
    - **Characteristics:** Provides high performance, very low latency, high throughput, and high IOPS (Input/Output Operations Per Second). Designed for enterprise-grade applications.

- **Ultra Disks:**
    - **Best For:** Most demanding enterprise-grade applications, large databases (e.g., SAP HANA, SQL, Oracle), transaction-heavy workloads, and applications requiring extreme performance.
    - **Characteristics:** The highest performance and lowest latency disk type. Offers unique flexibility to configure IOPS and throughput independently and dynamically without downtime, providing granular control over disk performance. Can scale up to 160,000 IOPS and 2,000 MBps per disk.

## 3. Azure Disk Snapshots

An Azure disk snapshot is a read-only, point-in-time copy of a Managed Disk. Snapshots are incremental, meaning they only store the changes since the last snapshot, making them cost-effective for backup purposes.

### Key Use Cases:
- **Backup and Recovery:** Create regular snapshots for disaster recovery, enabling you to revert to a previous state in case of data corruption or accidental deletion.
- **VM Creation:** Use a snapshot as a base to create new managed disks, which can then be used to create new VMs with the same configuration as the source VM's disk.
- **Troubleshooting:** Capture the state of a disk before making significant changes, allowing for easy rollback if issues arise.

## 4. Disk Encryption

Azure provides several robust options to encrypt your Managed Disks, protecting your data at rest and in transit:

- **Azure Disk Encryption (ADE):**
    - Encrypts the OS and data volumes of Azure IaaS VMs. It uses industry-standard encryption technology (BitLocker for Windows and dm-crypt for Linux).
    - Integrates with Azure Key Vault to manage disk encryption keys and secrets, giving you control over the key lifecycle.

- **Server-Side Encryption (SSE):**
    - **Platform-managed keys:** All managed disks are encrypted by default using platform-managed encryption keys. This provides encryption at rest with no additional cost or management required from you.
    - **Customer-managed keys (CMK):** You can use your own encryption keys stored in Azure Key Vault to encrypt your managed disks. This provides an additional layer of control and satisfies specific compliance requirements by managing your own encryption keys.

- **Encryption at Host (optional):**
    - Enables end-to-end encryption for your VM's temporary disk and OS/data disk caches. This encryption is applied at the VM host level, ensuring data is encrypted even before it is persisted to Azure Storage.

## 5. Configuration Example: Create a Managed Disk and Snapshot (Azure CLI)

This example demonstrates how to create a new Managed Disk and then take a snapshot of it using the Azure CLI.

```bash
# 1. Set variables for your resources
RESOURCE_GROUP_NAME="skillbun-disk-rg"
LOCATION="eastus"
DISK_NAME="mySkillbunDataDisk"
DISK_SIZE_GB=128 # Size in GB for the new data disk
SNAPSHOT_NAME="mySkillbunDataDiskSnapshot"

# 2. Create a resource group if it doesn't exist
echo "Creating resource group: $RESOURCE_GROUP_NAME..."
az group create --name $RESOURCE_GROUP_NAME --location $LOCATION --output none

# 3. Create a new Managed Disk (Standard SSD for balanced performance)
echo "Creating Managed Disk: $DISK_NAME..."
az disk create \
  --resource-group $RESOURCE_GROUP_NAME \
  --name $DISK_NAME \
  --location $LOCATION \
  --sku Standard_LRS \
  --size-gb $DISK_SIZE_GB \
  --output none

echo "Managed Disk '$DISK_NAME' created successfully."

# 4. Create a snapshot of the newly created Managed Disk
echo "Creating Snapshot: $SNAPSHOT_NAME..."
az snapshot create \
  --resource-group $RESOURCE_GROUP_NAME \
  --name $SNAPSHOT_NAME \
  --source $(az disk show --resource-group $RESOURCE_GROUP_NAME --name $DISK_NAME --query id -o tsv) \
  --location $LOCATION \
  --output none

echo "Snapshot '$SNAPSHOT_NAME' created successfully."

# To verify the created disk and snapshot (optional):
# az disk show --resource-group $RESOURCE_GROUP_NAME --name $DISK_NAME --output table
# az snapshot show --resource-group $RESOURCE_GROUP_NAME --name $SNAPSHOT_NAME --output table

# To clean up resources after verification (optional):
# az group delete --name $RESOURCE_GROUP_NAME --yes --no-wait
```

## 6. Understanding Check

1.  **Question:** What is the primary advantage of using Ultra Disks over Premium SSDs, and in what type of workload would this advantage be most beneficial?
2.  **Task:** Describe a practical scenario where you would use an Azure disk snapshot to recover or provision a new virtual machine.
3.  **Concept:** Explain the difference between Server-Side Encryption with platform-managed keys and Customer-managed keys, focusing on who controls the encryption keys in each scenario.