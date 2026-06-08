# Distributed SQL Databases: Study Guide

Distributed SQL databases (e.g., CockroachDB, Google Spanner) combine the horizontal scalability of NoSQL with the strict ACID transactions of traditional relational databases.

## 1. Key Concepts

### Concept 1: Consensus Protocols (Raft/Paxos)
Distributed engines use consensus algorithms to agree on data updates across multiple replicas to avoid split-brain.

### Concept 2: Distributed Transactions
Executing transactions across multiple geographically separated nodes while maintaining serializability and isolation.

### Concept 3: Geographic Partitioning
Pinning data to specific geographical regions to respect local data residency laws and minimize network latency.

## 2. Practical Example

### Distributed SQL Databases Example Setup
```javascript
Raft consensus diagram indicating Leader election and Log replication across follower nodes to confirm commit.
```

## 3. Quick Check-Up

1. How do distributed SQL databases achieve global consensus without a single master bottleneck?
2. What is data pinning and how does it optimize latency for multi-continent deployments?
3. Compare two-phase commit (2PC) with Raft consensus log replication.
