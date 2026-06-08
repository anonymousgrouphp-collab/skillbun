# Storage Services: Object, File & Archive in AWS

AWS offers a diverse range of storage services, each optimized for different use cases, access patterns, and cost requirements. Understanding these services is crucial for designing scalable, durable, and cost-effective cloud architectures. This guide will cover Amazon S3 (Object Storage), Amazon Glacier (Archive Storage), and Amazon EFS/FSx (File Storage).

## 1. Amazon S3 (Simple Storage Service) - Object Storage

Amazon S3 is a highly scalable, durable, and available object storage service. It's designed for 99.999999999% (11 nines) durability, meaning if you store 10,000,000 objects, you can expect to lose only one object once every 10,000 years.

### Core Concepts

*   **Buckets:** Containers for objects. S3 bucket names must be globally unique.
*   **Objects:** The fundamental entities stored in S3. An object consists of data, a key (name), and metadata.
*   **Keys:** The unique identifier for an object within a bucket.
*   **Regions:** Buckets are created in specific AWS regions.

### S3 Storage Classes

S3 offers various storage classes optimized for different access patterns:

*   **S3 Standard:** For general-purpose storage of frequently accessed data. Highly available and durable.
*   **S3 Intelligent-Tiering:** Automatically moves objects between two access tiers (frequently accessed and infrequently accessed) based on changing access patterns.
*   **S3 Standard-IA (Infrequent Access):** For data accessed less frequently but requires rapid access when needed. Lower storage cost but higher retrieval cost.
*   **S3 One Zone-IA:** Same as Standard-IA but stores data in a single Availability Zone. Lower cost but less resilient to AZ loss.
*   **S3 Glacier Instant Retrieval:** For archives that need immediate access. Millisecond retrieval.
*   **S3 Glacier Flexible Retrieval:** For archival data accessed infrequently, retrieval times from minutes to hours.
*   **S3 Glacier Deep Archive:** The lowest-cost storage class for long-term archiving, retrieval times from hours to days.

### Key Features

*   **Versioning:** Keep multiple versions of an object in the same bucket, protecting against accidental deletions or overwrites.
*   **Lifecycle Management:** Define rules to automatically transition objects between storage classes or expire them after a certain period, optimizing costs.
*   **Access Control:**
    *   **Bucket Policies:** JSON-based policies attached to a bucket to control access from IAM users/roles, other AWS accounts, or the public.
    *   **Access Control Lists (ACLs):** Legacy method for object-level permissions, now largely superseded by bucket policies and IAM.
    *   **IAM Policies:** Policies attached to IAM users or roles that grant permissions to interact with S3.
*   **Encryption:** Protect data at rest and in transit.
    *   **Server-Side Encryption with S3-managed keys (SSE-S3):** AWS manages the encryption keys.
    *   **Server-Side Encryption with KMS-managed keys (SSE-KMS):** Uses AWS Key Management Service (KMS) for encryption.
    *   **Server-Side Encryption with Customer-provided keys (SSE-C):** You provide and manage the encryption keys.
*   **Static Website Hosting:** Host static websites directly from an S3 bucket.

### S3 Bucket Policy Example

A common scenario is to grant public read access to a bucket for static website hosting.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::YOUR_BUCKET_NAME/*"]
    }
  ]
}
```
*Replace `YOUR_BUCKET_NAME` with your actual bucket name.*

## 2. Amazon Glacier - Archive Storage

Amazon Glacier (now often integrated as S3 Glacier storage classes) is a secure, durable, and extremely low-cost storage service for data archiving and long-term backup. It's optimized for data that is infrequently accessed and where retrieval times of several hours are acceptable.

### Core Concepts

*   **Vaults:** Containers for archives in Glacier.
*   **Archives:** Any object, such as a photo, video, or document, that you store in Glacier.

### Retrieval Options

*   **Expedited:** Typically 1-5 minutes (highest cost).
*   **Standard:** Typically 3-5 hours (moderate cost).
*   **Bulk:** Typically 5-12 hours (lowest cost).

You typically integrate Glacier through S3 Lifecycle policies, moving older, less frequently accessed S3 objects to Glacier storage classes.

## 3. Amazon EFS (Elastic File System) - Network File System

Amazon EFS provides simple, scalable, elastic file storage for use with AWS Cloud services and on-premises resources. It is a fully managed service that is compatible with the Network File System version 4 (NFSv4) protocol, making it easy to integrate with Linux-based EC2 instances.

### Key Features

*   **Scalability:** Automatically scales storage capacity up or down as you add or remove files.
*   **Shared Access:** Multiple EC2 instances can access the same EFS file system concurrently.
*   **Durability & Availability:** Designed for high durability and availability across multiple Availability Zones.
*   **Performance Modes:** General Purpose (default) and Max I/O (for highly parallel workloads).
*   **Throughput Modes:** Bursting (default) and Provisioned.

### Use Cases

*   Content management systems
*   Web serving
*   Application development and testing
*   Big data analytics workloads

## 4. Amazon FSx - Managed File Systems

Amazon FSx provides fully managed third-party and open-source file systems, giving you the native compatibility with features and performance of these file systems without the administrative overhead.

### Key FSx Offerings

*   **Amazon FSx for Windows File Server:** Provides a fully managed native Microsoft Windows file system, accessible via the Server Message Block (SMB) protocol. Ideal for Windows-based applications.
*   **Amazon FSx for Lustre:** A high-performance file system optimized for compute-intensive workloads like high-performance computing (HPC), machine learning, and media processing.
*   **Amazon FSx for OpenZFS:** High-performance, highly scalable shared file storage that's compatible with OpenZFS.
*   **Amazon FSx for NetApp ONTAP:** Fully managed shared storage built on NetApp ONTAP, offering enterprise data management features.

### Use Cases

*   **FSx for Windows File Server:** Lift-and-shift of Windows applications, home directories, shared file storage.
*   **FSx for Lustre:** HPC, EDA, scientific modeling, financial simulations.

---

## Quick Checklist/Exercise

1.  **Scenario:** You need to store large log files that are infrequently accessed but must be retained for 7 years for compliance. What S3 storage class would you recommend, and how would you automate the transition of old logs?
2.  **Difference:** Explain the primary difference between Amazon S3 and Amazon EFS in terms of how data is accessed and the types of workloads they are best suited for.
3.  **Use Case:** Your team has a legacy application running on EC2 Windows instances that requires a shared file system accessible via SMB. Which AWS storage service would be the most appropriate choice?