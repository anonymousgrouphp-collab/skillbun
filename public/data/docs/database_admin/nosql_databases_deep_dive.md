# NoSQL Databases Deep Dive: Study Guide

NoSQL databases address constraints of traditional relational systems by trading off certain SQL features (like joins or immediate consistency) for high write speeds and horizontal scalability.

## 1. Key Concepts

### Concept 1: Document Stores (MongoDB)
Storing data in JSON/BSON document formats, enabling nested schemas, dynamic attributes, and distributed sharding.

### Concept 2: Key-Value Stores (Redis)
In-memory database engines optimized for microsecond read/write access, primarily used for session caching and pub/sub messaging.

### Concept 3: Wide-Column Stores (Cassandra)
Highly distributed masterless architectures optimized for massive write throughput across multiple commodity nodes.

## 2. Practical Example

### NoSQL Databases Deep Dive Example Setup
```javascript
MongoDB sharding architecture outline where queries go through mongos router, routed to config servers and shards.
```

## 3. Quick Check-Up

1. Explain the CAP theorem and how it applies to choosing between MongoDB and Cassandra.
2. What is sharding and how does it enable horizontal scalability?
3. Why is indexing critical in document databases if they don't support SQL schemas?
