# Cloud & Container Forensics: Study Guide

## 1. Introduction to Cloud & Container Forensics

Cloud and container forensics delves into the specialized techniques required to investigate security incidents within highly dynamic and distributed cloud environments (AWS, Azure, GCP) and containerized infrastructures (Docker, Kubernetes). Unlike traditional on-premise forensics, cloud and container forensics faces unique challenges such as the ephemeral nature of resources, the shared responsibility model, the scale of operations, and the complexity of orchestration.

## 2. Cloud Forensics

Cloud forensics focuses on collecting and analyzing evidence from various cloud service models (IaaS, PaaS, SaaS) and deployment models (public, private, hybrid). The fundamental principles of digital forensics apply, but the methodologies and tools differ significantly.

### 2.1 Unique Challenges in Cloud Environments

*   **Shared Responsibility Model:** Cloud providers secure the *cloud itself* (infrastructure, hardware, global network), while customers are responsible for *security in the cloud* (guest OS, applications, data, network configuration). This blurs the lines of evidence ownership and access.
*   **Ephemeral Nature:** Cloud resources (VMs, containers, functions) can be created and destroyed rapidly, leading to volatile evidence that must be captured quickly.
*   **Scale & Distributed Systems:** Investigations span across multiple regions, availability zones, and services, generating vast amounts of logs and data.
*   **API-Driven Infrastructure:** Most cloud operations are performed via APIs, making API logs a critical source of evidence.

### 2.2 Key Techniques and Tools

#### 2.2.1 Logging and Monitoring Analysis

Centralized logging is paramount in cloud forensics. These logs provide an audit trail of activity, API calls, and resource changes.

*   **AWS:**
    *   **CloudTrail:** Logs all API calls made to AWS services, providing a record of actions taken by users, roles, or AWS services.
    *   **CloudWatch Logs:** Collects logs from various AWS resources (EC2 instances, Lambda functions, VPC Flow Logs).
    *   **VPC Flow Logs:** Captures IP traffic going to and from network interfaces in your VPC.
*   **Azure:**
    *   **Azure Activity Logs:** Records subscription-level events (resource creation, deletion, updates).
    *   **Azure Monitor:** Collects metric and log data from Azure resources, VMs, and custom sources.
    *   **Azure Sentinel:** A cloud-native SIEM that provides security analytics and threat intelligence.
*   **GCP:**
    *   **Cloud Logging:** Centralized logging service for GCP services, including audit logs for admin activity and data access.
    *   **Cloud Audit Logs:** Specifically records admin activity, data access, and system events.
    *   **Packet Mirroring:** Allows mirroring traffic from specified VM instances to another VM for inspection.

#### 2.2.2 Snapshotting and Disk Imaging

To preserve the state of a potentially compromised virtual machine, forensic snapshots or images of its associated storage volumes are crucial.

*   **Process:** Identify the compromised instance, create a snapshot of its attached storage (e.g., EBS volume in AWS, Azure Disk, GCP Persistent Disk), and then detach the original volume. The snapshot can then be used to create a new volume, attached to an isolated forensic analysis instance, and mounted for examination.
*   **Importance:** Ensures data integrity, prevents tampering, and allows for offline analysis without affecting the original system.

#### 2.2.3 API Analysis

Investigating suspicious API calls recorded in cloud audit logs (e.g., CloudTrail, Azure Activity Logs, GCP Cloud Audit Logs) is central to understanding attacker actions.

*   **Focus Areas:** Unauthorized resource creation/deletion, changes to security groups/firewall rules, privilege escalation attempts, data exfiltration through storage or network services, and unusual API call patterns.
*   **Correlation:** Link API calls to specific users, roles, source IPs, and timeframes to reconstruct the attack timeline.

#### 2.2.4 Cloud-Native Security Tools for Forensics

Cloud providers offer specialized tools that aid in detection and investigation.

*   **AWS:** GuardDuty (threat detection), Security Hub (security posture management), Macie (data discovery and classification), Inspector (vulnerability analysis).
*   **Azure:** Security Center (security posture and threat protection), Sentinel (SIEM), Network Watcher (network diagnostics).
*   **GCP:** Security Command Center (security management and risk assessment), Chronicle (security analytics platform).

### 2.3 Practical Example: AWS CloudTrail Query

Imagine you suspect an S3 bucket was improperly accessed or modified. You can query CloudTrail logs to find relevant events.

```json
{
  "eventSource": "s3.amazonaws.com",
  "eventName": ["PutObject", "DeleteObject", "GetObject", "ListBuckets", "UpdateBucketPolicy"],
  "requestParameters.bucketName": "your-sensitive-bucket"
}
```
This query would retrieve events related to putting, deleting, getting objects, listing buckets, or updating policies for a specific S3 bucket.

## 3. Container Forensics

Container forensics focuses on obtaining and analyzing evidence from Docker, Kubernetes, and other container runtimes. The challenges here stem from the transient nature of containers and the layered filesystem structure.

### 3.1 Unique Challenges in Container Environments

*   **Ephemeral Nature:** Containers are designed to be immutable and can be spun up and down rapidly, often deleting their state. Evidence must be collected from running containers or their host before they vanish.
*   **Layered Filesystems:** Container images are built from multiple read-only layers, with a thin read-write layer on top. This 