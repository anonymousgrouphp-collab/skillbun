# ACID, Transactions & Concurrency Control

Database transactions are fundamental units of work that access and possibly modify a database. To maintain data integrity and consistency, especially in multi-user environments, databases adhere to a set of principles known as ACID properties and employ sophisticated concurrency control mechanisms.

## 1. Understanding ACID Properties

ACID is an acronym representing four key properties that guarantee the reliability of database transactions.

### 1.1 Atomicity
*   **Definition:** A transaction is treated as a single, indivisible unit of work. Either all operations within it are completed successfully, or none are. If any part of the transaction fails, the entire transaction is rolled back, leaving the database in its state before the transaction began.
*   **Example:** Transferring money from Account A to Account B involves two steps: decrementing A and incrementing B. If the decrement succeeds but the increment fails, Atomicity ensures both operations are undone, and no money is lost or created.

### 1.2 Consistency
*   **Definition:** A transaction brings the database from one valid state to another. It ensures that all data integrity rules (e.g., primary key constraints, foreign key constraints, triggers, domain constraints) are upheld. If a transaction attempts to violate these rules, it is rolled back.
*   **Example:** If a rule states that `balance` must always be non-negative, a transaction attempting to set `balance` to `-100` would be rejected, ensuring consistency.

### 1.3 Isolation
*   **Definition:** Concurrent transactions execute independently and without interference from each other. The intermediate state of a transaction is not visible to other transactions until it is committed. It ensures that the final result of concurrent transactions is the same as if they were executed sequentially.
*   **Example:** If two transactions simultaneously try to update the same record, Isolation ensures that one transaction doesn't "see" or interfere with the uncommitted changes of the other.

### 1.4 Durability
*   **Definition:** Once a transaction has been committed, its changes are permanent and survive any subsequent system failures (e.g., power outages, crashes). This is typically achieved by writing changes to non-volatile storage (like disk) and using transaction logs.
*   **Example:** After a money transfer transaction is committed, even if the database server crashes immediately, the updated balances in Account A and Account B will persist when the system recovers.

## 2. Transaction Isolation Levels

While Isolation ensures concurrent transactions don't interfere, the degree of isolation can vary, impacting performance and the types of concurrency anomalies allowed. SQL standards define four main isolation levels:

*   **Concurrency Anomalies:**
    *   **Dirty Read:** A transaction reads data written by another uncommitted transaction.
    *   **Non-Repeatable Read:** A transaction reads the same data twice and gets different values because another committed transaction modified it between the reads.
    *   **Phantom Read:** A transaction re-executes a query returning a set of rows and gets a different set of rows (e.g., new rows inserted or existing rows deleted by another committed transaction) between the two executions.

### 2.1 Read Uncommitted
*   **Description:** The lowest isolation level. Transactions can see uncommitted changes made by other transactions.
*   **Anomalies Prevented:** None. Allows dirty reads, non-repeatable reads, and phantom reads.
*   **Use Case:** High concurrency, where approximate data is acceptable (rarely used in practice for critical data).

### 2.2 Read Committed
*   **Description:** Transactions can only read data that has been committed.
*   **Anomalies Prevented:** Dirty Reads.
*   **Anomalies Allowed:** Non-Repeatable Reads, Phantom Reads.
*   **Use Case:** Common default isolation level in many databases (e.g., PostgreSQL, Oracle), offering a good balance between concurrency and data consistency.

### 2.3 Repeatable Read
*   **Description:** Guarantees that if a transaction reads a row multiple times, it will always see the same value throughout the transaction's duration.
*   **Anomalies Prevented:** Dirty Reads, Non-Repeatable Reads.
*   **Anomalies Allowed:** Phantom Reads.
*   **Use Case:** Reporting or analytical tasks where consistent snapshots of data are needed. Default for MySQL's InnoDB.

### 2.4 Serializable
*   **Description:** The highest isolation level. Ensures that concurrent transactions execute in a way that produces the same result as if they had executed sequentially.
*   **Anomalies Prevented:** Dirty Reads, Non-Repeatable Reads, Phantom Reads.
*   **Anomalies Allowed:** None.
*   **Use Case:** Applications requiring extremely strict consistency, but at the cost of reduced concurrency.

### SQL Example: Setting Isolation Level
```sql
-- Start a transaction
START TRANSACTION;

-- Set the isolation level for the current transaction
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;

-- Perform database operations
SELECT balance FROM accounts WHERE account_id = 123;
UPDATE accounts SET balance = balance - 100 WHERE account_id = 123;

-- Commit or rollback
COMMIT;
-- OR
ROLLBACK;
```

## 3. Concurrency Control Mechanisms

To enforce isolation and manage concurrent access, databases use various mechanisms.

### 3.1 Locking Mechanisms
Locking is a traditional method where transactions acquire locks on data items before accessing them.

*   **Types of Locks:**
    *   **Shared (Read) Lock:** Allows multiple transactions to read the same data concurrently. A shared lock prevents any exclusive lock from being acquired on the data.
    *   **Exclusive (Write) Lock:** Grants exclusive access to a transaction for modifying data. No other transaction can read or write the data while an exclusive lock is held.

*   **Lock Granularity:**
    *   **Row-level Locking:** Locks individual rows. Offers high concurrency but incurs higher overhead (more locks to manage).
    *   **Page-level Locking:** Locks a physical page (block) of data, which might contain multiple rows. A compromise between row and table level.
    *   **Table-level Locking:** Locks the entire table. Simplest to implement, but severely reduces concurrency as only one transaction can modify the table at a time.

*   **Deadlocks:** Occur when two or more transactions are waiting indefinitely for each other to release a lock. Databases typically have deadlock detection and resolution mechanisms (e.g., aborting one of the transactions, usually the one that has done the least work).

### 3.2 MVCC (Multi-Version Concurrency Control)
MVCC is an optimistic concurrency control method that allows readers and writers to proceed without blocking each other, improving concurrency significantly.

*   **How it Works:** Instead of modifying data in place, MVCC systems create a new version of a row whenever it's updated. Each transaction sees a consistent snapshot of the database as it existed at the time the transaction started, by accessing the appropriate version of the data.
*   **Benefits:**
    *   **Reduced Blocking:** Readers do not block writers, and writers do not block readers. This is a major advantage over traditional locking.
    *   **Snapshot Isolation:** Provides a consistent view of the database for each transaction, which is critical for many applications.
*   **Implementation:** Databases like PostgreSQL and Oracle heavily rely on MVCC. When an `UPDATE` occurs, a new version of the row is created, and the old version is retained for any transactions that started before the update and are still active. A garbage collection process eventually removes old, unreferenced versions.

## Quick Checklist/Exercise

1.  **Question 1:** Explain the difference between "Non-Repeatable Read" and "Phantom Read" anomalies. Which ACID property do they violate?
2.  **Question 2:** Why might a database administrator choose to use `READ COMMITTED` isolation level over `SERIALIZABLE`? What trade-offs are involved?
3.  **Question 3:** Describe a scenario where Multi-Version Concurrency Control (MVCC) provides a significant advantage over traditional locking mechanisms.
