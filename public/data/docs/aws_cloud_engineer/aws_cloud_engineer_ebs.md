# Elastic Block Store (EBS) Study Guide

## Introduction to Amazon EBS

Amazon Elastic Block Store (EBS) provides persistent block storage volumes for use with Amazon EC2 instances. EBS volumes are highly available and reliable, offering the consistent performance required by demanding workloads. They are network-attached volumes that can be attached to any EC2 instance in the same Availability Zone.

### Key Characteristics:
*   **Persistent:** Data persists independently of the life of the EC2 instance.
*   **Network-attached:** Accessed over the network, not directly attached like local instance store.
*   **High Availability:** Automatically replicated within its Availability Zone to protect against component failure.
*   **Scalable:** You can easily increase the size of an EBS volume and, for some types, modify IOPS and throughput.
*   **Snapshots:** Point-in-time backups that can be stored in Amazon S3.

## EBS Volume Types

AWS offers various EBS volume types, each optimized for specific workloads based on performance characteristics (IOPS, throughput) and cost.

### 1. General Purpose SSD (gp2 and gp3)

These volumes balance price and performance for a wide variety of transactional workloads.

*   **gp2:**
    *   Cost-effective for a broad range of workloads.
    *   Volume size determines performance: IOPS scale linearly with size (3 IOPS/GB), with a baseline of 100 IOPS up to 16,000 IOPS. Can burst to 3,000 IOPS for volumes under 1 TB.
    *   Maximum throughput of 250 MB/s.
    *   Suitable for boot volumes, development/test environments, and low-latency interactive applications.

*   **gp3:**
    *   **Next-generation General Purpose SSD.**
    *   Provides a baseline performance of 3,000 IOPS and 125 MB/s throughput, *independent* of volume size.
    *   You can provision additional IOPS (up to 16,000) and throughput (up to 1,000 MB/s) independently for an additional cost.
    *   Often more cost-effective than `gp2` for workloads requiring higher IOPS or throughput without a large volume size.
    *   Recommended for most workloads that don't require the extreme performance of Provisioned IOPS SSDs.

### 2. Provisioned IOPS SSD (io1 and io2 Block Express)

Designed for I/O-intensive workloads that require consistent high performance and low latency.

*   **io1:**
    *   High-performance SSD for critical business applications.
    *   Allows you to provision a specific IOPS rate (up to 64,000 IOPS per volume).
    *   Throughput scales with IOPS, up to 1,000 MB/s.
    *   Excellent for large relational or NoSQL databases and other high-demand applications.

*   **io2 Block Express:**
    *   **Next-generation Provisioned IOPS SSD,** built on the EBS Block Express architecture.
    *   Offers **higher durability (99.999%)** compared to `io1` (99.8%-99.9%).
    *   Supports significantly **higher IOPS (up to 256,000)** and throughput (up to 4,000 MB/s) per volume.
    *   Ideal for the most demanding, mission-critical applications and large database deployments.

### 3. Throughput Optimized HDD (st1)

Designed for frequently accessed, throughput-intensive workloads with large, sequential I/O operations.

*   **st1:**
    *   Cost-effective magnetic storage.
    *   Throughput-oriented, not IOPS-oriented.
    *   Ideal for big data workloads (e.g., Apache Kafka, MapReduce), log processing, and data warehouses.
    *   Performance scales with volume size (40 MB/s per TB, with a maximum of 500 MB/s and 500 IOPS).

### 4. Cold HDD (sc1)

Lowest cost HDD volume type for less frequently accessed workloads.

*   **sc1:**
    *   Lowest cost per GB of all EBS volume types.
    *   Suitable for large, cold data sets where data is accessed infrequently (e.g., file servers, archival storage).
    *   Performance scales with volume size (12 MB/s per TB, with a maximum of 250 MB/s and 250 IOPS).

## EBS Snapshots

EBS snapshots are point-in-time backups of your EBS volumes. They are stored in Amazon S3 and are incremental, meaning only the blocks that have changed since the last snapshot are saved, significantly reducing storage costs.

### Key Features:
*   **Incremental Backups:** Only changed blocks are stored.
*   **Point-in-Time:** Captures the state of the volume at the moment the snapshot is created.
*   **Cross-Region Copy:** Snapshots can be copied to other AWS regions for disaster recovery.
*   **Volume Creation:** New EBS volumes can be created from snapshots, which can be larger or smaller than the original volume (within limits).
*   **Archiving:** Snapshots can be moved to a lower-cost archive tier for long-term retention.

## Managing EBS Volumes

### Creating an EBS Volume

You can create EBS volumes directly from the AWS Management Console, CLI, or SDK. You specify the volume type, size, IOPS/throughput (if applicable), and Availability Zone.

### Attaching/Detaching Volumes

EBS volumes can be attached to or detached from EC2 instances. A volume can only be attached to one instance at a time in the same Availability Zone. The instance must be running or stopped to attach/detach a root volume, but data volumes can often be attached/detached while the instance is running.

### Modifying Volumes

One of the powerful features of EBS is the ability to modify volume types, sizes, and performance characteristics (IOPS/throughput) without detaching them from a running EC2 instance. This is done 