# Project: Advanced Cloud Database Operations Lab: Study Guide

This project project-based lab guides you through configuring high availability, replication, alerts, and performing a failover test on a cloud database.

## 1. Key Concepts

### Concept 1: High Availability Setup
Setting up a primary database instance with a hot standby using physical stream replication.

### Concept 2: Chaos Engineering (Failover Testing)
Simulating a hard database failure (killing database process or network isolation) and verifying automatic failover and client recovery.

### Concept 3: Monitoring and Alarm Integration
Deploying prometheus/grafana dashboards or cloud-native monitors to alert on replica health.

## 2. Practical Example

### Project: Advanced Cloud Database Operations Lab Example Setup
```javascript
Bash script to simulate failover testing by gracefully stopping primary server to trigger standby promotion:
# Simulate failure
pg_ctl -D /var/lib/postgresql/data stop -m immediate
# Verify replica becomes primary
pg_controldata /var/lib/postgresql/replica_data | grep "Database cluster state"
```

## 3. Quick Check-Up

1. What is split-brain scenario in database clustering and how do you prevent it?
2. How do client application connection pools handle database failovers?
3. Why is failover testing critical to perform periodically in staging environments?
