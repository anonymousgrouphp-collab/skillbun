# Managed Database Services Deep Dive: Study Guide

Modern organizations lean heavily on managed database services (e.g., AWS RDS, Cloud SQL, Azure SQL). A DBA's role shifts from OS management to database engine optimization, schema design, and scaling.

## 1. Key Concepts

### Concept 1: Shared Responsibility Model
Understanding what the cloud vendor manages (OS, physical hardware, backups) vs. what the customer manages (indexing, schemas, query tuning).

### Concept 2: Performance Insights
Using built-in monitoring tools (like AWS Performance Insights) to profile locks, CPU load, and long-running queries.

### Concept 3: Read Replicas & Scaling
Creating read replicas to offload read traffic from the primary write database, managing replication lag constraints.

## 2. Practical Example

### Managed Database Services Deep Dive Example Setup
```javascript
Adding read replicas and configuring connection pooling (e.g., PgBouncer) in managed environments to handle spikes in traffic.
```

## 3. Quick Check-Up

1. Under what conditions does read replica replication lag become a business logic issue?
2. What are the limitations of managed database services compared to self-hosted engines?
3. How do you perform database parameter tuning on a managed instance?
