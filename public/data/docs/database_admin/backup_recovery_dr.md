# Backup, Recovery & Disaster Recovery Strategies for PostgreSQL

Effective backup, recovery, and disaster recovery strategies are paramount for any production database system, especially PostgreSQL. They ensure data integrity, availability, and business continuity in the face of data corruption, hardware failures, or catastrophic events. This guide covers fundamental concepts, tools, and best practices for implementing robust strategies in PostgreSQL.

## 1. Backup Strategies

PostgreSQL offers several methods for creating backups, each suitable for different use cases and recovery objectives.

### 1.1 Logical Backups with `pg_dump`

Logical backups capture the database schema and data as SQL statements or an archive file. They are flexible, cross-version compatible (to some extent), and allow for selective restoration.

*   **`pg_dump`**: Backs up a single database.
    *   **SQL Format (Plain-text)**: Generates a script with SQL commands to recreate the database.
        ```sql
        pg_dump -h localhost -p 5432 -U postgres -d mydatabase > mydatabase_backup.sql
        ```
    *   **Custom Format (Compressed Binary)**: An archive file optimized for `pg_restore`. It allows for reordering of items and parallel restoration.
        ```bash
        pg_dump -h localhost -p 5432 -U postgres -d mydatabase -Fc -f mydatabase_backup.dump
        ```
*   **`pg_dumpall`**: Backs up all databases, including global objects like roles and tablespaces.
    ```bash
    pg_dumpall -h localhost -p 5432 -U postgres > full_cluster_backup.sql
    ```
*   **Advantages**: Easy to use, portable, allows selective restores, human-readable (SQL format).
*   **Disadvantages**: Can be slow for large databases, requires database downtime for consistency if not using replication, recovery can be slow due to re-execution of SQL.

### 1.2 Physical Backups with `pg_basebackup`

Physical backups involve copying the actual data files (data directory) of a running PostgreSQL cluster. These backups are byte-for-byte copies, faster for very large databases, and essential for Point-in-Time Recovery (PITR).

*   **`pg_basebackup`**: Creates a consistent binary backup of a running PostgreSQL cluster. It uses the streaming replication protocol.
    ```bash
    pg_basebackup -h localhost -p 5432 -U replicator -D /var/lib/postgresql/data/backup_dir -F tar -X stream -P -v
    ```
    *   `-D`: Target directory for the backup.
    *   `-F tar`: Output in tar format (recommended).
    *   `-X stream`: Include required WAL files in the backup by streaming them.
    *   `-P`: Show progress.
    *   `-v`: Verbose output.
    *   A `replicator` user with `REPLICATION` privilege is required.
*   **Advantages**: Fastest backup method for large databases, crucial for PITR, faster recovery than logical backups.
*   **Disadvantages**: Less flexible (all or nothing), not cross-version compatible, requires storage matching the data directory size.

### 1.3 Advanced Physical Backups with `pgBackRest`

`pgBackRest` is a sophisticated backup and restore utility that offers features like:
*   Full, incremental, and differential backups.
*   Parallel backup and restore.
*   Asynchronous archiving of WAL segments.
*   Built-in retention policies and validation.
It's an industry-standard tool for robust PostgreSQL backup solutions.

## 2. Recovery Procedures

Recovering a database involves restoring from a backup and potentially applying transaction logs (WAL files) to bring it to a desired state.

### 2.1 Full Restore (from `pg_dump`)

To restore a logical backup, use `psql` for SQL format or `pg_restore` for custom format.

*   **SQL Format**:
    ```bash
    psql -h localhost -p 5432 -U postgres -d new_database < mydatabase_backup.sql
    ```
*   **Custom Format**:
    ```bash
    pg_restore -h localhost -p 5432 -U postgres -d new_database mydatabase_backup.dump
    ```

### 2.2 Point-in-Time Recovery (PITR)

PITR allows restoring a physical backup to any specific point in time, even to a transaction boundary. This is achieved by restoring a `pg_basebackup` and then replaying archived WAL files up to the desired recovery target.

*   **Prerequisites**:
    1.  A base backup created with `pg_basebackup`.
    2.  Continuous archiving of WAL segments must be configured and active.
*   **Configuration for WAL Archiving (in `postgresql.conf`)**:
    ```ini
    wal_level = replica # or higher (minimal, replica, logical)
    archive_mode = on
    archive_command = 'cp %p /var/lib/postgresql/wal_archive/%f' # Example: copy WAL segments to a safe location
    ```
*   **Recovery Steps**:
    1.  Stop the PostgreSQL server.
    2.  Clear the existing data directory (or restore to a new location).
    3.  Restore the most recent `pg_basebackup` into the data directory.
    4.  Create a `recovery.signal` file (PostgreSQL 12+) in the data directory.
    5.  Configure `postgresql.conf` with `restore_command` and `recovery_target_*` parameters.
        ```ini
        # In postgresql.conf or a separate recovery.conf (for older versions)
        restore_command = 'cp /var/lib/postgresql/wal_archive/%f %p' # Example: retrieve WALs from archive
        recovery_target_time = '2023-10-27 10:00:00 UTC' # Recover to a specific time
        # Or: recovery_target_xid = '12345'
        # Or: recovery_target_name = 'my_recovery_point'
        # Or: recovery_target = 'immediate' # Recover to the end of available WAL
        ```
    6.  Start the PostgreSQL server. It will automatically enter recovery mode.

## 3. Disaster Recovery Concepts

Disaster recovery focuses on recovering business operations after a major disaster. Key metrics define the goals.

### 3.1 Recovery Point Objective (RPO)

*   **Definition**: The maximum tolerable amount of data loss, measured in time.
*   **Impact**: An RPO of 1 hour means you can afford to lose 1 hour of data. Achieved through frequent backups and continuous WAL archiving.

### 3.2 Recovery Time Objective (RTO)

*   **Definition**: The maximum tolerable duration of time allowed to restore business operations after a disaster.
*   **Impact**: An RTO of 4 hours means the system must be fully operational within 4 hours of an incident. Influenced by recovery procedures, hardware availability, and automation.

### 3.3 Continuous Archiving (WAL Shipping)

WAL (Write-Ahead Log) shipping is the foundation for high availability and low RPO. It involves continuously sending WAL segments from the primary server to a safe, independent archive location and/or standby servers.

*   **Mechanism**:
    *   Primary server writes transaction logs to WAL files.
    *   `archive_command` copies completed WAL files to the archive storage.
    *   Standby servers can retrieve these WAL files (or stream them directly) to stay updated.
*   **Benefits**: Enables PITR, provides a stream of changes for standby servers, reduces RPO.

## 4. Developing a Robust Disaster Recovery Plan

A comprehensive DR plan goes beyond just backups and includes:
1.  **Risk Assessment**: Identify potential threats and their impact.
2.  **RPO/RTO Definition**: Clearly define your business requirements for data loss and downtime.
3.  **Backup Strategy**: Implement a mix of logical and physical backups, ensuring offsite storage.
4.  **WAL Archiving/Replication**: Configure continuous WAL archiving and potentially streaming replication to standby servers for minimal data loss.
5.  **Recovery Procedures**: Document and regularly test recovery steps for various scenarios (e.g., full server failure, accidental data deletion).
6.  **Monitoring and Alerting**: Monitor backup jobs, WAL archiving status, and replication lag.
7.  **Documentation**: Keep detailed records of configuration, procedures, and contact information.
8.  **Regular Testing**: Crucially, *regularly test your entire DR plan* to ensure it works as expected and to identify bottlenecks.

---

### Quick Checklist/Exercise:

1.  Explain the key difference between a logical backup created with `pg_dump` and a physical backup created with `pg_basebackup`, and when you would choose one over the other.
2.  Your PostgreSQL database crashes, and you need to restore it to exactly 30 minutes before the crash. What PostgreSQL feature is essential for this, and what two main prerequisites must be in place for it to work?
3.  Define RPO and RTO in your own words, and describe how continuous WAL archiving helps in achieving a low RPO.