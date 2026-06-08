# IPFS & Decentralized Storage: Study Guide

## 1. Introduction to Decentralized Storage and IPFS

### The Need for Decentralized Storage
Traditional Web2 storage systems (like AWS S3 or Google Cloud Storage) are centralized. While efficient, they present several vulnerabilities:
*   **Single Points of Failure**: An outage at a data center can make content inaccessible.
*   **Censorship Risks**: Centralized entities have the power to remove or alter content.
*   **Data Control**: Users often lack full sovereignty over their data, which resides on company-owned servers.

Decentralized storage, a cornerstone of Web3, addresses these issues by distributing data across a network of participants, offering enhanced resilience, censorship resistance, and true user data ownership.

### What is IPFS?
**IPFS (InterPlanetary File System)** is a peer-to-peer network protocol designed to store and share data in a distributed file system. Its ambition is to connect all computing devices with the same system of files, making the web more resilient, open, and user-controlled.

## 2. Core Concepts of IPFS

### Content Addressing (CIDs)
Unlike traditional web where resources are located by *where* they are (location addressing via URLs), IPFS locates content by *what* it is. Every piece of data (file, directory, or even a piece of text) added to IPFS is cryptographically hashed, resulting in a unique **Content Identifier (CID)**. If the content changes, its CID changes. This fundamental principle ensures data immutability and verifiable integrity.

### Merkle DAG
IPFS uses a **Merkle Directed Acyclic Graph (Merkle DAG)** to structure all data. Files are broken into smaller chunks, each hashed. These hashes are then used as pointers in a graph, creating a dependency tree. Directories are also represented as a Merkle DAG, linking to their contents. This structure enables:
*   **Data Deduplication**: Identical files or chunks only need to be stored once.
*   **Content Verification**: The integrity of any data can be verified by re-hashing its chunks and comparing them against the CID.
*   **Immutable Links**: CIDs serve as immutable links within the graph.

### Distributed Hash Table (DHT)
The **Distributed Hash Table (DHT)** is a decentralized lookup system that helps IPFS nodes find data. When you want to retrieve data using a CID, your IPFS node queries the DHT to find which other nodes in the network are currently storing or can provide that content.

### Immutability
Once data is added to IPFS and a CID is generated, the content associated with that CID cannot be altered. To 