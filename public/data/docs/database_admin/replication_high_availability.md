# Replication, High Availability (HA) & Load Balancing

This study guide covers the essential concepts and practical implementations of database replication, high availability (HA), and load balancing, crucial for robust and scalable database systems, especially focusing on PostgreSQL.

## 1. Database Replication

Replication is the process of creating and maintaining multiple copies of a database. It serves several critical purposes: data redundancy, read scaling, disaster recovery, and analytics.

### 1.1. Replication Methods

*   **Streaming Physical Replication (e.g., PostgreSQL WAL Shipping)**
    *   **Concept:** This method involves transferring the Write-Ahead Log (WAL) records from the primary (master) server to one or more standby (replica) servers. The standbys then replay these WAL records to stay in sync with the primary.
    *   **Characteristics:** Byte-for-byte exact copy, high consistency, good for disaster recovery and read-only queries.
    *   **Implementation:** `pg_basebackup` for initial base copy, `primary_conninfo` in `postgresql.conf` for continuous streaming.
*   **Logical Replication**
    *   **Concept:** Replicates data changes (INSERT, UPDATE, DELETE, TRUNCATE) at the logical level, allowing for more flexibility. It uses a publication/subscription model, where a primary publishes changes and standbys subscribe.
    *   **Characteristics:** Can replicate specific tables/databases, allows different schemas/versions (with care), supports upgrades and migrations.
    *   **Use Cases:** Selective replication, inter-version upgrades, data distribution, combining data from multiple sources.

### 1.2. Master-Replica Topologies

*   **Single Primary, Multiple Standbys:** The most common setup, where one primary server handles all writes, and multiple standby servers serve read queries or act as failover candidates.
*   **Cascading Replication:** A standby server can itself be a primary for other standbys, creating a tree-like structure, useful for distributing load or reducing network traffic to the primary.

### 1.3. Basic Streaming Replication Configuration Example (PostgreSQL)

**On Primary Server:**
1.  Edit `postgresql.conf`:
    ```sql
    listen_addresses = '*'
    wal_level = replica
    max_wal_senders = 10
    wal_keep_segments = 64
    hot_standby = on -- (Important for read-only queries on standby)
    ```
2.  Edit `pg_hba.conf` to allow replication connections from standby:
    ```sql
    host    replication     all             <standby_ip>/32         md5
    ```
3.  Restart PostgreSQL.
4.  Create a replication user:
    ```sql
    CREATE USER replica_user REPLICATION LOGIN CONNECTION LIMIT -1 ENCRYPTED PASSWORD 'your_password';
    ```

**On Standby Server:**
1.  Stop PostgreSQL.
2.  Perform a base backup from the primary:
    ```bash
    pg_basebackup -h <primary_ip> -D /var/lib/postgresql/14/main -U replica_user -P -v
    ```
    (Replace `/var/lib/postgresql/14/main` with your data directory path)
3.  Create/Edit `standby.signal` (for PostgreSQL 12+) or `recovery.conf` (for older versions) in the data directory.
    For PostgreSQL 12+: `standby.signal` (empty file) and `postgresql.conf`:
    ```sql
    primary_conninfo = 'host=<primary_ip> port=5432 user=replica_user password=your_password'
    restore_command = 'cp /path/to/archive/%f %p' -- If using WAL archiving
    hot_standby = on
    ```
4.  Start PostgreSQL on standby.

## 2. High Availability (HA)

High Availability ensures that a system remains operational and accessible for a high percentage of the time, minimizing downtime during failures.

### 2.1. Automatic Failover with Quorum-Based Solutions

*   **Concept:** In an HA setup, if the primary server fails, a standby server must be promoted to become the new primary. Automatic failover systems use a "quorum" (a majority vote among cluster members) to elect a new primary and ensure data consistency, preventing "split-brain" scenarios where two servers mistakenly believe they are the primary.
*   **Components:** Typically involves a cluster manager, a distributed consensus store (e.g., etcd, ZooKeeper, Consul), and agents on each database server.

### 2.2. HA Tools for PostgreSQL

*   **Patroni:**
    *   **Purpose:** A robust HA solution that uses a distributed consensus store (etcd, Consul, ZooKeeper) to manage PostgreSQL clusters. It automates primary election, failover, and replica management.
    *   **Key Features:** Automatic failover, switchover, replication management, REST API for cluster status, integrates with various monitoring tools.
*   **Pgpool-II:**
    *   **Purpose:** Not just a connection pooler, Pgpool-II also offers HA features, including automatic failover (though typically less sophisticated than Patroni) and replication management.
    *   **HA Role:** Can detect primary failure and promote a standby, but often works best in conjunction with other tools for robust HA.
*   **repmgr (Replication Manager):**
    *   **Purpose:** A comprehensive suite of tools for managing replication and failover in PostgreSQL. It simplifies setting up, monitoring, and managing replication.
    *   **Key Features:** Clone standbys, monitor replication, perform switchovers and failovers, handle standby registration. It uses `ssh` for communication and requires a separate fencing mechanism or a wrapper for fully automatic failover.

## 3. Load Balancing & Connection Pooling

### 3.1. Load Balancing

*   **Purpose:** Distributes incoming read queries across multiple standby servers, preventing any single server from becoming a bottleneck and improving overall application performance and responsiveness.
*   **How it works:** A load balancer (e.g., Pgpool-II, HAProxy, Nginx) sits in front of the database cluster, directing client connections to available servers based on defined algorithms (round-robin, least connections, etc.).
*   **Benefit:** Enables horizontal scaling of read operations.

### 3.2. Connection Pooling

*   **Purpose:** Reduces the overhead associated with establishing new database connections. Creating a new connection is resource-intensive. A connection pooler maintains a set of open connections that applications can reuse.
*   **Benefits:** Faster response times for applications, reduced load on the database server (especially under high connection rates).
*   **Tools:** Pgpool-II, PgBouncer are popular choices for PostgreSQL.

### 3.3. Pgpool-II in a Distributed Environment

Pgpool-II is a versatile tool that can provide:
*   **Connection Pooling:** Efficiently manages and reuses database connections.
*   **Load Balancing:** Distributes read queries among multiple standby servers.
*   **Replication:** Can manage and monitor replication between primary and standbys.
*   **HA/Failover:** Can detect primary failures and initiate failover to a standby.

## Quick Knowledge Check

1.  What is the primary difference between streaming physical replication and logical replication in PostgreSQL, and when would you choose one over the other?
2.  Explain the concept of "quorum" in the context of automatic failover for High Availability.
3.  Name two different tools used for PostgreSQL High Availability and briefly describe their primary function.