# Database Migration Strategies to/from Cloud: Study Guide

Migrating databases between on-premise servers and the cloud (or between cloud providers) is a complex operation that must minimize data loss and downtime.

## 1. Key Concepts

### Concept 1: Homogeneous vs Heterogeneous Migration
Homogeneous (e.g., Postgres to Postgres) vs Heterogeneous (e.g., Oracle to PostgreSQL) migrations, requiring schema conversion tools.

### Concept 2: Change Data Capture (CDC)
Streaming real-time transaction updates from source to destination during migration to maintain data parity before final cutover.

### Concept 3: Migration Cutover Planning
Creating detailed step-by-step checklists, dry runs, and fallback procedures for the final migration cutover window.

## 2. Practical Example

### Database Migration Strategies to/from Cloud Example Setup
```javascript
AWS Database Migration Service (DMS) configuration concept where source engine logs are streamed to target database using logical replication.
```

## 3. Quick Check-Up

1. What is Schema Conversion and why is it required for heterogeneous migrations?
2. How does Change Data Capture (CDC) help in achieving near-zero downtime migrations?
3. Describe a database rollback/fallback plan in case a migration cutover fails.
