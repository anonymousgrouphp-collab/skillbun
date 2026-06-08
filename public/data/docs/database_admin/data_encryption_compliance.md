# Data Encryption, Masking & Compliance: Study Guide

Security is a core pillar of database administration. DBA security strategies must protect data both at rest and in transit, while ensuring compliance with global regulatory standards like GDPR, HIPAA, and PCI-DSS.

## 1. Key Concepts

### Concept 1: Transparent Data Encryption (TDE)
TDE encrypts the database files at the storage level, protecting data from offline access or physical disk theft without requiring application changes.

### Concept 2: Dynamic Data Masking (DDM)
DDM limits sensitive data exposure by masking it on-the-fly for non-privileged database users (e.g., masking credit cards as XXXX-XXXX-XXXX-1234).

### Concept 3: Encryption in Transit
Forcing SSL/TLS connections between database hosts, clients, and replication nodes to protect packets from network sniffing.

## 2. Practical Example

### Data Encryption, Masking & Compliance Example Setup
```javascript
Enabling TDE in PostgreSQL using pgclean or pgcrypto extensions, or forcing TLS connections in postgresql.conf:
ssl = on
ssl_cert_file = 'server.crt'
ssl_key_file = 'server.key'
```

## 3. Quick Check-Up

1. Explain the difference between Symmetric and Asymmetric encryption in databases.
2. What is database hashing and when should it be used instead of encryption?
3. How does Dynamic Data Masking protect user privacy without altering the physical data?
