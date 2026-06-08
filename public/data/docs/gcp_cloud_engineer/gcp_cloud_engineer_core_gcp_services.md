# Core GCP Services: Compute, Networking, Storage, and Identity Study Guide

This guide introduces the fundamental Google Cloud Platform (GCP) services essential for building robust cloud solutions. We'll cover key offerings in Compute, Networking, Storage, and Identity & Access Management (IAM), providing a practical foundation for aspiring Cloud Engineers.

## 1. Compute Services

Compute services provide the processing power for your applications, ranging from virtual machines to serverless functions.

### Core Concepts
*   **Virtual Machines (VMs):** On-demand, scalable virtual servers. Equivalent to physical servers but running in the cloud.
*   **Containers:** Lightweight, portable, and self-sufficient packages for applications, often managed by orchestration tools like Kubernetes.
*   **Serverless:** An execution model where the cloud provider dynamically manages the allocation and provisioning of servers. You only pay for the actual compute time consumed by your code.

### Key GCP Services
*   **Compute Engine:** Infrastructure as a Service (IaaS) offering for creating and managing VMs. Provides granular control over machine types, operating systems, and storage.
*   **Google Kubernetes Engine (GKE):** Managed service for deploying, managing, and scaling containerized applications using Kubernetes.
*   **Cloud Run:** Serverless platform for containerized applications. Automatically scales up and down, and you only pay for compute used.
*   **Cloud Functions:** Serverless execution environment for event-driven functions. Ideal for small, single-purpose code snippets.

### Example: Creating a Compute Engine VM
```bash
gcloud compute instances create my-first-vm \
    --project=your-gcp-project-id \
    --zone=us-central1-a \
    --machine-type=e2-medium \
    --image-family=debian-11 \
    --image-project=debian-cloud
```
This command creates a Debian 11 VM named `my-first-vm` in `us-central1-a` with an `e2-medium` machine type.

## 2. Networking Services

GCP's networking services enable secure, scalable, and high-performance connectivity for your resources and users.

### Core Concepts
*   **Virtual Private Cloud (VPC):** A logically isolated section of the Google Cloud network where you can launch your GCP resources.
*   **Load Balancing:** Distributes incoming application traffic across multiple instances to ensure high availability and scalability.
*   **DNS (Domain Name System):** Translates human-readable domain names (e.g., example.com) into machine-readable IP addresses.

### Key GCP Services
*   **VPC Network:** Defines your network topology, including IP ranges, subnets, routes, and firewall rules.
*   **Cloud Load Balancing:** High-performance, scalable load balancing for global, regional, or internal traffic.
*   **Cloud DNS:** Scalable, reliable, and managed authoritative domain name system.
*   **Cloud CDN (Content Delivery Network):** Caches content at edge locations close to users, reducing latency and origin server load.
*   **Cloud Interconnect/VPN:** Securely connects your on-premises network to your GCP VPC network.

### Example: Creating a Custom VPC Network
```bash
gcloud compute networks create my-custom-vpc \
    --project=your-gcp-project-id \
    --subnet-mode=custom

gcloud compute networks subnets create my-subnet-us-east1 \
    --project=your-gcp-project-id \
    --network=my-custom-vpc \
    --range=10.0.1.0/24 \
    --region=us-east1
```
This creates a custom VPC network and a subnet within it in `us-east1`.

## 3. Storage Services

GCP offers a diverse range of storage options for various data types, access patterns, and performance requirements.

### Core Concepts
*   **Object Storage:** Unstructured data storage (files, images, videos) accessed via API. Highly durable and scalable.
*   **Block Storage:** Disk volumes attached to VMs, suitable for operating systems, databases, and general-purpose storage.
*   **File Storage:** Network file system (NFS) for shared file access across multiple instances.
*   **Databases:** Managed relational (SQL) and NoSQL databases.

### Key GCP Services
*   **Cloud Storage:** Object storage for any data type, offering different storage classes (Standard, Nearline, Coldline, Archive) for cost optimization.
*   **Persistent Disk:** Block storage for Compute Engine VMs, available as standard HDD, balanced persistent disk, or SSD persistent disk.
*   **Filestore:** Managed file storage for applications requiring a shared file system interface.
*   **Cloud SQL:** Fully managed relational database service for MySQL, PostgreSQL, and SQL Server.
*   **Cloud Spanner:** Horizontally scalable, globally-distributed, strongly consistent relational database service.
*   **Firestore:** NoSQL document database for mobile, web, and server development.

### Example: Uploading an Object to Cloud Storage
```bash
gsutil cp my-local-file.txt gs://your-unique-bucket-name/data/my-remote-file.txt
```
This command uploads `my-local-file.txt` to a Cloud Storage bucket named `your-unique-bucket-name`.

## 4. Identity & Access Management (IAM)

IAM allows you to define who (identity) has what access (role) to which resources within your GCP project.

### Core Concepts
*   **Members:** Individuals, groups, domains, or service accounts that can be granted access.
*   **Roles:** Collections of permissions. GCP offers primitive roles (Owner, Editor, Viewer), predefined roles (e.g., `compute.instanceAdmin`), and custom roles.
*   **Policy:** A set of role bindings that define who has what access on a resource.
*   **Service Accounts:** Special Google accounts used by applications or VMs to make authorized API calls.

### Key GCP Services
*   **Cloud IAM:** The central service for managing access control across all GCP resources.
*   **Resource Hierarchy:** Projects, folders, and organizations allow for hierarchical application of IAM policies.

### Example: Granting an IAM Role to a User
```bash
gcloud projects add-iam-policy-binding your-gcp-project-id \
    --member='user:user@example.com' \
    --role='roles/compute.viewer'
```
This grants the `user@example.com` the `Compute Viewer` role on `your-gcp-project-id`, allowing them to view Compute Engine resources.

## Exercises & Checklist

1.  **Identify the right compute service:** If you need to run a legacy application requiring full OS control, which GCP compute service would you choose? What if you have a stateless microservice packaged in a Docker container and want serverless scaling?
2.  **Network Isolation:** Explain the purpose of a VPC network and how subnets contribute to network segmentation within GCP.
3.  **Storage Solution:** You need to store large amounts of unstructured data (e.g., images, backups) that are accessed infrequently for archival purposes. Which GCP storage service and storage class would be most cost-effective and appropriate?
