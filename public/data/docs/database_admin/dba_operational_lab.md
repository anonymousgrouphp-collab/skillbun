# Practice Lab: Operational Drill - Database Administrator

Database administrators (DBAs) are the guardians of data, and their ability to react swiftly and effectively to operational challenges is paramount. This practice lab focuses on critical operational drills that every DBA must master to ensure high availability, data integrity, and smooth system performance. Mastering these drills builds confidence and resilience in managing production environments.

## 1. Full Backup and Point-in-Time Restore

**Concept:** A full backup captures the entire state of your database at a specific moment. Point-in-time recovery (PITR) allows you to restore your database to any transactional state, up to a specific second, typically by applying transaction logs (WALs for PostgreSQL, binary logs for MySQL) to a full backup. This is crucial for recovering from data corruption, accidental deletions, or system failures.

**Steps & Example (PostgreSQL using `pg_basebackup` and WAL replay):**

1.  **Perform a Full Base Backup:**
    ```bash
    # On the primary server, create a base backup to a dedicated backup server/location
    pg_basebackup -h localhost -p 5432 -D /mnt/backups/pg_data_$(date +%Y%m%d%H%M%S) -F tar -X stream -C -v -P
    ```
    *   `-D`: Target directory for the backup.
    *   `-F tar`: Output in tar format.
    *   `-X stream`: Stream the WAL files during the backup.
    *   `-C`: Create a `recovery.signal` (or `recovery.conf` for older versions) file during backup for point-in-time recovery.
    *   `-v -P`: Verbose and show progress.

2.  **Simulate Data Loss:**
    ```sql
    -- Connect to your database and perform an accidental delete or update
    DELETE FROM public.important_table WHERE id = 123; -- Note the exact timestamp of this operation
    -- Or truncate a table:
    TRUNCATE TABLE public.audit_logs; 
    ```

3.  **Prepare for Point-in-Time Recovery:**
    *   Stop the PostgreSQL service on the machine where you want to restore.
    *   Delete or move the existing data directory.
    *   Extract your base backup to the new data directory.
    *   Ensure your `postgresql.conf` has `restore_command` configured to fetch WAL files from your WAL archive location.
        ```ini
        # Example restore_command in postgresql.conf or recovery.conf (for older versions)
        restore_command = 'cp /mnt/wal_archive/%f %p' # Adjust path to your WAL archive
        ```
    *   Create a `recovery.signal` file (or `recovery.conf`) in the data directory with the target recovery point:
        ```ini
        # For recovery.signal
        # Restore to a specific time
        restore_target_time = '2023-10-27 10:30:00 UTC'
        
        # Or to a specific transaction ID
        # restore_target_xid = '12345'
        
        # Or to a specific LSN
        # restore_target_lsn = '0/16B95F8'
        ```

4.  **Start PostgreSQL and Verify Recovery:**
    *   Start the PostgreSQL service. It will automatically enter recovery mode.
    *   Check logs for `recovery complete` messages.
    *   Verify that the data loss simulated in step 2 is no longer present, and data exists up to your specified `restore_target_time`.

**Lessons Learned:** Always test your backup and recovery procedures regularly. Understand your Recovery Point Objective (RPO) and Recovery Time Objective (RTO) for different data loss scenarios. A robust WAL archiving strategy is key for PITR.

## 2. Simulating a Failover to a Replica

**Concept:** Database replication involves maintaining multiple copies of data across different servers. In a high-availability setup, if the primary database fails, a replica (standby) can be promoted to become the new primary. Simulating this process ensures that your failover mechanisms work as expected and minimizes downtime.

**Steps & Example (PostgreSQL Streaming Replication):**

1.  **Identify Primary and Replica:**
    *   **Primary:** The active database instance accepting writes.
    *   **Replica (Standby):** The read-only instance receiving continuous updates from the primary.
    *   Verify replication status (e.g., `SELECT pg_is_in_recovery();` on replica should return `t`).

2.  **Simulate Primary Failure:**
    *   Gracefully stop the primary database service to simulate a controlled shutdown/failure:
        ```bash
        sudo systemctl stop postgresql
        ```
    *   (In a real scenario, this could be an unplanned crash, network partition, or power failure).

3.  **Promote the Replica:**
    *   On the chosen replica server, promote it to become the new primary:
        ```bash
        pg_ctl -D /path/to/your/pg_data promote
        ```
    *   Alternatively, create a `trigger_file` if configured for promotion:
        ```bash
        touch /path/to/your/pg_data/promote_me_now
        ```
    *   Monitor the PostgreSQL logs on the new primary for `database system is ready to accept connections`.

4.  **Update Application Connection (Conceptual):**
    *   In a production environment, applications would need to be reconfigured to connect to the new primary. This might involve updating DNS records, changing connection strings in configuration files, or relying on a connection pooler (e.g., PgBouncer) or a service discovery mechanism (e.g., Kubernetes services, Consul) that handles failover automatically.

5.  **Verify New Primary Functionality:**
    *   Connect to the newly promoted primary and confirm it can accept writes and read operations.
    *   `SELECT pg_is_in_recovery();` should now return `f`.

**Lessons Learned:** Failover procedures should be well-documented and practiced. Automated failover solutions (like Patroni for PostgreSQL or Orchestrator for MySQL) are highly recommended for production. Understand the implications of split-brain scenarios and how to prevent them.

## 3. Identifying and Resolving Replication Lag

**Concept:** Replication lag occurs when the replica database falls behind the primary, meaning it hasn't applied all the transactions committed on the primary. This can impact data consistency for read-heavy applications, complicate failovers, and lead to data loss if the primary fails and the replica is significantly behind.

**Identification (PostgreSQL):**

*   Use `pg_stat_replication` view on the primary server:
    ```sql
    SELECT 
        client_addr, 
        state, 
        sync_state, 
        pg_wal_lsn_diff(pg_current_wal_lsn(), replay_lsn) AS lag_bytes 
    FROM pg_stat_replication; 
    ```
    *   `lag_bytes` indicates the amount of WAL data (in bytes) that the replica still needs to apply. Non-zero values indicate lag.
*   Alternatively, monitor the `seconds_behind_master` metric (though not directly available in standard `pg_stat_replication` without custom tooling, it's common in MySQL).

**Common Causes & Resolution:**

1.  **Network Latency/Bandwidth:** Slow network between primary and replica can delay WAL shipping.
    *   **Resolution:** Optimize network infrastructure, consider colocating servers, or use compression for WAL transmission (if supported and beneficial).
2.  **Replica I/O Bottlenecks:** The replica's disk subsystem cannot keep up with applying WAL records.
    *   **Resolution:** Upgrade storage to faster SSDs/NVMe, ensure adequate disk I/O provisioning, optimize OS-level disk settings.
3.  **Long-Running Queries on Replica:** If the replica is used for read queries, a complex, long-running query can hold up WAL application.
    *   **Resolution:** Identify and optimize slow queries, offload intensive reporting to dedicated reporting replicas, or increase `max_standby_streaming_delay`/`max_standby_archive_delay` to allow queries to finish (at the cost of increased potential lag).
4.  **Primary Workload Spikes:** Bursts of writes on the primary generate a large volume of WALs that the replica struggles to process.
    *   **Resolution:** Distribute workload, optimize write-heavy operations, tune PostgreSQL parameters like `wal_buffers`, `checkpoint_timeout`, `max_wal_size` on primary and `wal_receiver_buffer_size` on replica.
5.  **Configuration Mismatches:** Inefficient replication settings or hardware differences.
    *   **Resolution:** Ensure similar hardware and consistent configuration across primary and replicas, especially regarding I/O and CPU.

**Lessons Learned:** Proactive monitoring of replication lag is essential. Integrate lag metrics into your monitoring dashboard. Understand that some lag is normal; define acceptable thresholds for your applications.

## 4. Minor Version Upgrade on a Test Cluster

**Concept:** Minor version upgrades (e.g., PostgreSQL 14.1 to 14.2) typically involve bug fixes, security patches, and minor enhancements, and are generally backward-compatible. Performing these on a test cluster first ensures that there are no unforeseen compatibility issues or regressions before deploying to production.

**Steps & Example (PostgreSQL using `apt` on Debian/Ubuntu):**

1.  **Backup the Test Cluster:**
    *   Even for minor upgrades, always take a full backup of your test cluster before proceeding. See Section 1.

2.  **Review Release Notes:**
    *   Read the official release notes for the target minor version to be aware of any specific upgrade considerations, new features, or deprecated items.

3.  **Stop Database Services:**
    *   Stop the PostgreSQL service on the test cluster gracefully.
    ```bash
    sudo systemctl stop postgresql
    ```

4.  **Apply Upgrade:**
    *   Use your system's package manager to upgrade (if installed via packages):
    ```bash
    sudo apt update
    sudo apt upgrade postgresql-14 # Replace 14 with your major version
    ```
    *   If you're using a different installation method (e.g., source compile, specific installer), follow the vendor's instructions.

5.  **Start Database Services:**
    *   Start the PostgreSQL service.
    ```bash
    sudo systemctl start postgresql
    ```

6.  **Verify Functionality:**
    *   Connect to the database and run a suite of tests:
        *   Check the database version: `SELECT version();`
        *   Run application-specific smoke tests: basic CRUD operations, complex queries, stored procedures, and triggers.
        *   Monitor logs for any errors or warnings during startup or operation.
        *   Verify extensions are still working correctly.

7.  **Document Rollback Plan:**
    *   Before upgrading production, ensure you have a clear rollback plan in case the upgrade fails or introduces critical issues. This typically involves restoring from the pre-upgrade backup.

**Lessons Learned:** A dedicated test environment that closely mirrors production is invaluable. Automate your test suite to quickly validate upgrades. Always have a rollback plan, and communicate clearly with stakeholders about maintenance windows.

## Runbook Format for Documentation

When documenting these operational drills, use a clear, structured runbook format. A good runbook includes:

*   **Objective:** What is the goal of this procedure?
*   **Prerequisites:** What needs to be in place before starting?
*   **Assumptions:** Any conditions that are assumed to be true.
*   **Steps:** Numbered, clear, and concise instructions, including commands and expected output.
*   **Verification:** How to confirm the procedure was successful.
*   **Rollback Plan:** Steps to revert if something goes wrong.
*   **Troubleshooting:** Common issues and their solutions.
*   **Lessons Learned:** Key takeaways and improvements for future iterations.
*   **Owner & Date:** Who created/last updated it and when.

## Checklist/Exercise

1.  **PITR Challenge:** On a test PostgreSQL instance, perform a full base backup, then simulate a `TRUNCATE TABLE` operation on a critical table. Execute a point-in-time restore to a moment *just before* the `TRUNCATE` occurred, and verify data integrity.
2.  **Replication Lag Identification:** Set up a PostgreSQL primary-replica pair. Introduce artificial load (e.g., a batch insert of millions of rows) on the primary and monitor the `pg_stat_replication` view to identify and quantify the replication lag in bytes. Suggest two potential solutions based on the observed lag pattern.
3.  **Upgrade Rollback Plan:** Draft a detailed, step-by-step rollback plan for a failed minor version upgrade of a MySQL server (e.g., from 8.0.30 to 8.0.31). Assume the upgrade process corrupted the data directory and specify exactly how you would revert to the previous working state.