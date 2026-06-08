# High Availability & Disaster Recovery Strategies in Azure

## Introduction

In cloud computing, ensuring that applications and services remain operational and accessible is paramount. This module explores High Availability (HA) and Disaster Recovery (DR) strategies within Microsoft Azure.

*   **High Availability (HA)**: Focuses on minimizing downtime for services due to localized failures (e.g., hardware failure, network outage within a datacenter). It ensures continuous operation by distributing workloads and having redundant components.
*   **Disaster Recovery (DR)**: Focuses on recovering services after a catastrophic regional or widespread outage (e.g., natural disaster, large-scale power failure impacting an entire Azure region). It involves replicating data and applications to a geographically distant location and orchestrating a failover.

## High Availability (HA) in Azure

Azure offers several features to build highly available solutions:

### 1. Azure Availability Sets

Availability Sets are a logical grouping capability for virtual machines (VMs) that provides fault isolation within an Azure datacenter. When you place VMs in an Availability Set, Azure distributes them across different physical hardware, including racks, power units, and network switches.

*   **Fault Domains (FDs)**: Each FD represents a physical rack, power supply, and network switch. VMs in different FDs are isolated from single points of failure in the physical infrastructure. Azure typically assigns 2 or 3 FDs per Availability Set.
*   **Update Domains (UDs)**: UDs are logical groups of VMs that can be rebooted at the same time during planned maintenance. Azure ensures that only one UD is updated at a time, minimizing application downtime. Azure typically assigns 5 UDs by default.

**Use Cases**: Suitable for IaaS workloads requiring high availability within a single datacenter, especially for legacy applications or applications that can't leverage Availability Zones.

**Conceptual Configuration Example (Azure CLI)**:
```bash
az vm availability-set create \
  --resource-group myResourceGroup \
  --name myAvailabilitySet \
  --location eastus \
  --platform-fault-domain-count 2 \
  --platform-update-domain-count 5

az vm create \
  --resource-group myResourceGroup \
  --name myVM1 \
  --availability-set myAvailabilitySet \
  --image UbuntuLTS \
  --admin-username azureuser \
  --generate-ssh-keys

az vm create \
  --resource-group myResourceGroup \
  --name myVM2 \
  --availability-set myAvailabilitySet \
  --image UbuntuLTS \
  --admin-username azureuser \
  --generate-ssh-keys
```
This example creates an Availability Set and then deploys two VMs into it, ensuring they are distributed across fault and update domains.

### 2. Azure Availability Zones

Availability Zones are unique physical locations within an Azure region. Each zone is comprised of one or more datacenters equipped with independent power, cooling, and networking. They are physically separate from other zones and designed to be isolated from failures in other zones.

*   **Regional Resiliency**: By deploying applications and data across multiple zones, you protect against failures affecting an entire datacenter or a subset of datacenters within a region.
*   **Synchronous Replication**: Data and services can be synchronously replicated between zones within the same region, providing near-real-time consistency.

**Use Cases**: Mission-critical applications requiring maximum uptime and protection against datacenter-level failures. This is the preferred method for achieving HA for most modern cloud-native applications. Services that support Availability Zones include VMs, Managed Disks, Load Balancers, and various PaaS services like Azure SQL Database and Cosmos DB.

**Conceptual Configuration Example (Azure PowerShell)**:
```powershell
# Create a Resource Group
New-AzResourceGroup -Name "myZoneRG" -Location "EastUS2"

# Deploying a VM into Availability Zone 1
New-AzVm `
    -ResourceGroupName "myZoneRG" `
    -Name "myVM_Zone1" `
    -Location "EastUS2" `
    -Zone "1" ` # Deploy into Zone 1
    -Image "UbuntuLTS" `
    -Size "Standard_DS1_v2" `
    -AdminUsername "azureuser" `
    -GenerateSshKey

# Deploying another VM into Availability Zone 2
New-AzVm `
    -ResourceGroupName "myZoneRG" `
    -Name "myVM_Zone2" `
    -Location "EastUS2" `
    -Zone "2" ` # Deploy into Zone 2
    -Image "UbuntuLTS" `
    -Size "Standard_DS1_v2" `
    -AdminUsername "azureuser" `
    -GenerateSshKey
```
This example demonstrates deploying two VMs into separate Availability Zones within the `EastUS2` region.

## Disaster Recovery (DR) in Azure

When an entire Azure region becomes unavailable, DR strategies come into play:

### 1. Cross-Region Replication

Azure offers built-in capabilities for replicating data and services across geographically separate Azure regions. This protects against region-wide outages.

*   **Azure Storage (GRS/GZRS)**: Geo-Redundant Storage (GRS) and Geo-Zone-Redundant Storage (GZRS) automatically replicate your data to a secondary region hundreds of miles away. In the event of a regional outage, Microsoft can initiate a failover to the secondary region.
*   **Azure SQL Database Geo-Replication**: Provides continuous, asynchronous replication of transactions from a primary database to a configurable secondary database in a different Azure region. This allows for rapid recovery with minimal data loss.
*   **Azure Cosmos DB Multi-Region Writes**: Cosmos DB inherently supports global distribution and multi-region writes, allowing for highly available and disaster-resilient databases.

**Use Cases**: Essential for critical data and applications that must withstand regional disasters.

### 2. Azure Site Recovery (ASR)

Azure Site Recovery (ASR) is a comprehensive disaster recovery as a service (DRaaS) solution that orchestrates replication, failover, and failback of various workloads (Azure VMs, VMware VMs, Hyper-V VMs, physical servers) to Azure or a secondary site.

*   **Replication**: Continuously replicates your workloads (VMs, physical servers) from a primary site to a secondary site (typically Azure).
*   **Recovery Point Objective (RPO)**: ASR aims for low RPOs, meaning minimal data loss during a disaster.
*   **Recovery Time Objective (RTO)**: ASR helps achieve low RTOs by orchestrating automated failover and bringing services online quickly.
*   **Test Failover**: Allows you to perform non-disruptive DR drills to validate your recovery strategy without impacting your production environment.
*   **Failover and Failback**: In a disaster, you can initiate a failover to the secondary region. Once the primary region recovers, you can failback your workloads.

**Use Cases**: Providing DR capabilities for IaaS workloads, both on-premises and within Azure, with fine-grained control over recovery processes.

**Conceptual ASR Workflow**:
1.  **Prepare**: Configure source (e.g., on-premises vCenter, Azure VMs) and target (Azure region).
2.  **Replicate**: Enable replication for selected VMs/servers.
3.  **Monitor**: Track replication health and RPO.
4.  **Test Failover**: Regularly perform non-disruptive drills.
5.  **Failover**: In a disaster, execute a planned or unplanned failover to Azure.
6.  **Reprotect & Failback**: After primary site recovery, re-protect workloads from Azure back to the primary site and initiate failback.

## Choosing the Right Strategy

The choice between HA and DR strategies (and which Azure features to use) depends on your application's specific requirements for RPO (Recovery Point Objective - how much data loss is acceptable) and RTO (Recovery Time Objective - how much downtime is acceptable), as well as budget and complexity.

*   **Within a single region (HA)**: Use Availability Sets for basic VM fault isolation, or Availability Zones for datacenter-level fault isolation for critical applications.
*   **Across regions (DR)**: Use cross-region replication for data (GRS/GZRS, geo-replication) and Azure Site Recovery for orchestrating VM/server failover.

## Exercises & Checklist

1.  **Scenario**: You have a critical SQL Server running on an an Azure VM. How would you configure this VM for high availability within a single Azure region to protect against physical hardware failures?
2.  **Comparison**: Explain the primary difference between Azure Availability Sets and Azure Availability Zones in terms of their scope of failure protection. When would you choose one over the other?
3.  **Disaster Recovery Planning**: Your company's primary application runs on several Azure VMs in the "East US" region. A new compliance requirement states that the application must be recoverable within 4 hours with no more than 1 hour of data loss in case of a regional disaster. Which Azure DR service would you leverage, and what key steps would be involved?