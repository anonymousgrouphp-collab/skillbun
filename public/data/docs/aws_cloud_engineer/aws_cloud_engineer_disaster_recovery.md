# High Availability & Disaster Recovery on AWS

Designing resilient cloud architectures is paramount in the AWS Cloud Engineer roadmap. This guide covers the core concepts and AWS services used to achieve both High Availability (HA) and Disaster Recovery (DR).

## 1. Introduction to HA and DR

*   **High Availability (HA):** Ensures that a system or application remains operational and accessible for a high percentage of time, minimizing downtime. It focuses on preventing service interruptions due to component failures within a single region or Availability Zone (AZ).
*   **Disaster Recovery (DR):** Focuses on restoring functionality and data after a catastrophic event (e.g., region-wide outage, natural disaster) that impacts an entire data center or region. DR aims to minimize data loss and downtime during large-scale failures.

Key metrics for DR:
*   **Recovery Point Objective (RPO):** The maximum acceptable amount of data loss, measured in time (e.g., 5 minutes, 1 hour). How far back in time your data must be recoverable.
*   **Recovery Time Objective (RTO):** The maximum acceptable delay before a system or application is fully restored after a disaster, measured in time (e.g., 15 minutes, 4 hours). How quickly your application must be available after a disaster.

## 2. High Availability Strategies in AWS

AWS offers several built-in features to achieve high availability:

*   **Multi-AZ Deployments:**
    *   **Availability Zones (AZs):** Isolated locations within a single AWS Region, designed to be independent (power, networking, connectivity). Deploying resources across multiple AZs protects against failures of a single AZ.
    *   **EC2:** Distribute EC2 instances across multiple AZs within an Auto Scaling Group.
    *   **RDS:** Multi-AZ deployments for relational databases automatically replicate data to a standby instance in a different AZ, providing automatic failover.
    *   **VPC Subnets:** Create public and private subnets in multiple AZs for fault tolerance.

*   **Load Balancers (ELB/ALB/NLB):** Distribute incoming application traffic across multiple targets (e.g., EC2 instances) in multiple AZs, ensuring that if one target or AZ fails, traffic is rerouted.

*   **Auto Scaling Groups (ASG):** Automatically adjust the number of EC2 instances based on demand and health. ASGs can replace unhealthy instances and launch new instances across multiple AZs to maintain desired capacity and availability.

*   **Amazon Route 53:** DNS service that can route traffic to healthy endpoints and perform DNS failover across regions or AZs.

## 3. Disaster Recovery Strategies in AWS

DR strategies vary based on RPO and RTO requirements and cost tolerance. AWS provides services to implement different DR approaches:

*   **Backup and Restore:**
    *   **Concept:** Data is regularly backed up to a different region or S3, and applications are restored from these backups after a disaster.
    *   **AWS Services:** Amazon S3 (for backup storage, cross-region replication), EBS Snapshots (for EC2 volumes), RDS Snapshots (for databases), AWS Backup (centralized backup service).
    *   **RPO/RTO:** Highest RPO/RTO (can be hours to days) due to data transfer and restoration time.

*   **Pilot Light:**
    *   **Concept:** A minimal set of core resources are always running in the DR region (the 