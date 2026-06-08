# Polyglot Persistence & Data Strategy: Study Guide

Enterprise data architectures rarely rely on a single database. DBAs must design data strategies that combine relational, cache, NoSQL, and analytical engines to meet modern application demands.

## 1. Key Concepts

### Concept 1: Polyglot Persistence
Using different database engines for different microservices based on data access patterns (e.g., PostgreSQL for orders, Redis for cache, Elasticsearch for catalog).

### Concept 2: Data Synchronization (Outbox Pattern)
Synchronizing data across multiple databases reliably using transactional outbox patterns and message brokers (e.g., Kafka).

### Concept 3: Master Data Management (MDM)
Maintaining a single source of truth for core business entities across multiple distributed database instances.

## 2. Practical Example

### Polyglot Persistence & Data Strategy Example Setup
```javascript
Outbox pattern design flow where application writes to DB and Outbox table in a single transaction, and an exporter relays it to Kafka / consumers.
```

## 3. Quick Check-Up

1. What is the Transactional Outbox pattern and how does it prevent dual-write failures?
2. Describe how you would design a data sync strategy between an OLTP database and an Elasticsearch cluster.
3. What are the operational overheads of managing a polyglot persistence architecture?
