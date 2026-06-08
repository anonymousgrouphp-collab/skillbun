# Cloud Databases & Advanced Incident Management: Study Guide

DBAs operating in cloud environments must understand how cloud infrastructures handle database state, scaling, backups, and failovers during outages.

## 1. Key Concepts

### Concept 1: Multi-Region Failover
Designing active-passive or active-active multi-region databases to ensure high availability during complete cloud provider region outages.

### Concept 2: Database Service Level Objectives (SLOs)
Defining and monitoring metrics like RTO (Recovery Time Objective) and RPO (Recovery Point Objective) for critical database systems.

### Concept 3: Infrastructure Alerts
Setting up telemetry alerts for storage exhaustion, connection spikes, CPU throttling, and high replication lag.

## 2. Practical Example

### Cloud Databases & Advanced Incident Management Example Setup
```javascript
AWS RDS Multi-AZ Failover mechanism diagram / setup where primary replica syncs to standby, triggering automatic DNS failover if primary fails.
```

## 3. Quick Check-Up

1. What is the difference between RTO and RPO in database disaster recovery?
2. How does a multi-AZ failover affect client connection timeout configurations?
3. Explain how you would handle storage autoscaling under sudden write-heavy workloads.
