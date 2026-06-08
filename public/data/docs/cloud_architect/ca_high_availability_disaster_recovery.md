# High Availability & Disaster Recovery: Study Guide

## 1. Introduction
In cloud architecture, **High Availability (HA)** and **Disaster Recovery (DR)** are paramount for ensuring business continuity and maintaining user trust. They define how resilient your systems are to failures and how quickly they can recover from disruptive events. Understanding and implementing robust HA/DR strategies is a core competency for any cloud architect.

## 2. Core Concepts

### 2.1. High Availability (HA)
High Availability refers to the ability of a system to operate continuously without failure for a long period. It's about designing systems to minimize downtime and ensure services remain accessible even if individual components fail. This is achieved through redundancy, failover mechanisms, and robust monitoring.

### 2.2. Disaster Recovery (DR)
Disaster Recovery focuses on an organization's ability to recover and restore access to IT infrastructure and applications after a catastrophic event, such as a regional power outage, natural disaster, or major cyber attack. DR strategies aim to minimize the impact of such events and get operations back to normal within acceptable timeframes. While HA addresses local component failures, DR addresses widespread, large-scale outages.

### 2.3. Recovery Time Objective (RTO)
**RTO** defines the maximum acceptable delay between the interruption of service and the restoration of service. It specifies how quickly you need to restore your applications after a disaster. A low RTO means a faster recovery and typically incurs higher costs.

### 2.4. Recovery Point Objective (RPO)
**RPO** defines the maximum acceptable amount of data loss measured in time. It specifies the point in time to which data must be recovered. A low RPO means less data loss and usually requires more frequent data replication or backups, which can be more expensive.

## 3. Design Strategies for Resilient Systems

### 3.1. Multi-AZ (Availability Zone) Design
Availability Zones (AZs) are isolated locations within a geographic region, designed to be independent (power, network, cooling). Deploying applications across multiple AZs within the same region protects against failures of a single AZ. If one AZ experiences an outage, traffic can be seamlessly routed to instances in healthy AZs.

### 3.2. Multi-Region Design
For ultimate resilience against widespread regional disasters (e.g., natural disasters, major network outages affecting an entire cloud region), a multi-region strategy is employed.
-   **Active-Passive:** One region serves all traffic, while the other acts as a warm or cold standby, ready to take over if the primary fails.
-   **Active-Active:** Both regions actively serve traffic, offering continuous availability and often improved performance for globally distributed users. This requires complex data synchronization.

## 4. Implementation Techniques

### 4.1. Auto-Scaling
Auto-scaling automatically adjusts the number of compute resources (e.g., EC2 instances, containers) in response to demand or predefined schedules. This ensures performance during peak loads and cost optimization during low loads, while also replacing unhealthy instances, contributing to HA.

```yaml
# Conceptual AWS Auto Scaling Group configuration snippet
AutoScalingGroup:
  Type: AWS::AutoScaling::AutoScalingGroup
  Properties:
    VPCZoneIdentifier:
      - !Ref SubnetA
      - !Ref SubnetB
    LaunchTemplate:
      LaunchTemplateId: !Ref MyLaunchTemplate
      Version: !GetAtt MyLaunchTemplate.LatestVersionNumber
    MinSize: '2' # Minimum instances for HA
    MaxSize: '10'
    DesiredCapacity: '2'
    HealthCheckType: ELB # Use Load Balancer health checks
    HealthCheckGracePeriod: 300
    TargetGroupARNs:
      - !Ref MyTargetGroup
```

### 4.2. Load Balancing
Load balancers distribute incoming application traffic across multiple targets (e.g., EC2 instances, containers) in one or more Availability Zones. They also perform health checks on registered targets and route traffic only to healthy instances, removing unhealthy ones, which is crucial for HA.

### 4.3. Backups & Snapshotting
-   **Backups:** Copies of data taken at specific points in time, typically stored off-site or in a separate storage system. Essential for long-term data retention and recovery from data corruption or accidental deletion.
-   **Snapshotting:** Point-in-time copies of entire volumes or datasets. Snapshots are incremental, meaning only changed blocks are saved, making them efficient for frequent data protection and quick restoration of entire environments.

### 4.4. Replication Strategies
Replication involves copying data between multiple databases or storage systems to ensure data consistency and availability.
-   **Synchronous Replication:** Data is written to all replicas simultaneously. This ensures zero data loss (RPO=0) but introduces latency.
-   **Asynchronous Replication:** Data is written to the primary, and then replicated to secondaries with a slight delay. Faster writes, but potential for minimal data loss during failover.
-   **Database-specific Replication:** Examples include AWS DynamoDB Global Tables, Aurora Global Database, or self-managed PostgreSQL/MySQL replication.

## 5. Operational Strategies

### 5.1. Failover and Failback Strategies
-   **Failover:** The process of switching to a redundant or standby system upon the failure of the primary system. It can be automated (preferred for RTO-sensitive applications) or manual.
-   **Failback:** The process of restoring the primary system to operation and returning workloads to it after the original issue is resolved. This needs careful planning to avoid service disruption during the cutover.

### 5.2. Graceful Degradation
Graceful degradation is a design principle where a system can continue to operate, albeit with reduced functionality or performance, even when some components fail. For example, a social media app might disable non-critical features like "trending topics" during a database issue to keep core functionalities (like posting and viewing feeds) alive.

### 5.3. Chaos Engineering
Chaos Engineering is the practice of intentionally injecting failures into a system to identify weaknesses and build confidence in the system's resilience. By proactively breaking things in a controlled environment, teams can uncover hidden issues, validate failover mechanisms, and improve their HA/DR preparedness before real outages occur. Tools like Netflix's Chaos Monkey or Gremlin are used for this.

## 6. Checklist / Exercise

1.  **Differentiate between RTO and RPO with a practical example.**
    *   *Hint: Consider an e-commerce website during a peak sales event versus a static blog.*
2.  **Explain how a multi-AZ architecture contributes specifically to High Availability, rather than just Disaster Recovery.**
    *   *Hint: Focus on the scope of failure addressed.*
3.  **Why is Chaos Engineering considered a proactive measure, and how does it improve a system's Disaster Recovery posture?**
    *   *Hint: Think about what it aims to discover.*