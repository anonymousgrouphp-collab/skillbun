# Database Operations & Reliability Engineering Study Guide

## 1. Introduction
Database Operations & Reliability Engineering is a critical discipline for any Database Administrator (DBA) or SRE. It encompasses the practices and processes required to ensure databases are continuously available, data remains intact and consistent, and operations are performed with maximum efficiency and minimal downtime. This guide covers key areas essential for building robust and resilient database systems.

## 2. Core Concepts

### 2.1. Backup and Recovery
**Concept**: The cornerstone of data integrity and disaster recovery. It involves creating copies of data (backups) and having strategies to restore that data in the event of loss, corruption, or disaster.

*   **Recovery Point Objective (RPO)**: The maximum acceptable amount of data loss measured in time (e.g., 1 hour means you can lose up to 1 hour of data).
*   **Recovery Time Objective (RTO)**: The maximum acceptable time it takes to restore a database to operational status after a disaster.
*   **Backup Types**: 
    *   **Full Backup**: A complete copy of the entire database.
    *   **Differential Backup**: Copies all data that has changed since the last full backup.
    *   **Incremental Backup**: Copies all data that has changed since the last *any* backup (full or incremental).
*   **Strategies**: Implement a robust backup schedule, store backups off-site, regularly test recovery procedures.

### 2.2. Database Replication & High Availability (HA)
**Concept**: Duplicating data across multiple database servers to provide redundancy, improve read performance, and ensure continuous availability even if one server fails.

*   **Replication Types**:
    *   **Master-Slave (Primary-Standby)**: One database (master/primary) handles writes, and data is asynchronously or synchronously copied to one or more slave/standby databases. Slaves can serve read requests and act as failover targets.
    *   **Multi-Master**: Multiple databases can accept writes, requiring complex conflict resolution mechanisms.
*   **High Availability**: A system's ability to remain operational despite component failures. In databases, this often involves:
    *   **Failover**: Automatically switching to a standby server when the primary fails.
    *   **Load Balancing**: Distributing read requests across multiple replicas to improve performance and scalability.

### 2.3. Database Monitoring & Alerting
**Concept**: Continuously tracking the health, performance, and resource utilization of database systems to proactively identify and address potential issues before they impact users.

*   **Key Metrics to Monitor**:
    *   **CPU Usage**: Overall server load.
    *   **Memory Usage**: Paging, buffer pool hit ratios.
    *   **Disk I/O**: Read/write latency, throughput, queue depth.
    *   **Active Connections**: Number of open sessions.
    *   **Query Performance**: Slow queries, execution times, transaction rates.
    *   **Error Logs**: Database errors, warnings, and critical events.
    *   **Replication Lag**: Delay between primary and standby databases.
*   **Tools**: Database-native tools (e.g., `pg_stat_activity` for PostgreSQL, Performance Schema for MySQL), external monitoring solutions (e.g., Prometheus/Grafana, Datadog, Zabbix), cloud provider monitoring services.
*   **Alerting**: Setting thresholds for critical metrics and configuring notifications (email, SMS, Slack) to alert DBAs when issues arise.

### 2.4. Database Maintenance
**Concept**: Regular tasks performed to optimize database performance, ensure data integrity, and manage storage resources efficiently.

*   **Common Tasks**:
    *   **Index Management**: Rebuilding or reorganizing indexes to improve query performance.
    *   **Statistics Updates**: Ensuring the database optimizer has up-to-date information for generating efficient query plans.
    *   **Vacuuming/Compacting**: Reclaiming space occupied by deleted/updated rows (e.g., `VACUUM` in PostgreSQL).
    *   **Log File Management**: Archiving, rotating, and purging old log files.
    *   **Patching & Upgrades**: Applying security patches and version upgrades to database software.
    *   **Health Checks**: Running routine checks for data corruption or inconsistencies.

### 2.5. Database Automation
**Concept**: Scripting and automating repetitive or complex database tasks to reduce manual effort, minimize human error, and ensure consistent execution.

*   **Examples of Automation**:
    *   Scheduled backups and integrity checks.
    *   Automated patching and configuration management.
    *   Proactive health monitoring and simple self-healing scripts.
    *   Deployment of schema changes and migrations.
    *   User and permission management.
*   **Tools**: Shell scripts (Bash, PowerShell), Python scripts, configuration management tools (Ansible, Chef, Puppet), specialized database automation platforms.

### 2.6. Capacity Planning
**Concept**: Forecasting future resource requirements (storage, CPU, memory, network I/O) based on current usage, historical trends, and anticipated growth, to ensure the database can scale to meet demand.

*   **Process**:
    *   **Data Collection**: Gather historical performance metrics.
    *   **Trend Analysis**: Identify growth patterns and peak usage times.
    *   **Forecasting**: Project future needs based on business growth and application usage.
    *   **Stress Testing**: Simulate future load to validate current infrastructure and identify bottlenecks.
    *   **Provisioning**: Plan for hardware upgrades or cloud resource adjustments.

## 3. Code/Configuration Example (PostgreSQL Backup)

### Simple `pg_dump` and `pg_restore` example

```bash
# --- Backup a database ---
# Export the database 'mydb' to a plain-text SQL file
pg_dump -U username -h localhost -p 5432 mydb > mydb_backup.sql

# Export the database 'mydb' to a custom format archive (more flexible for restore)
pg_dump -U username -h localhost -p 5432 -Fc mydb > mydb_backup.dump

# --- Restore a database ---
# Create a new empty database first (if not already existing)
# createdb -U username -h localhost -p 5432 new_mydb

# Restore from a plain-text SQL file
psql -U username -h localhost -p 5432 new_mydb < mydb_backup.sql

# Restore from a custom format archive
pg_restore -U username -h localhost -p 5432 -d new_mydb mydb_backup.dump
```

## 4. Quick Checklist/Exercise
1.  Explain the primary difference between RPO and RTO in the context of database disaster recovery.
2.  List three critical database metrics you would monitor to detect potential performance bottlenecks or system instability.
3.  Describe how automating routine maintenance tasks (like index rebuilding or statistics updates) contributes to overall database reliability.