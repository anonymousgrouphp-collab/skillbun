# Blockchain & Web3 Fundamentals: A Study Guide

## 1. Introduction to Blockchain & Web3

*   **Blockchain:** A decentralized, distributed ledger technology that securely records transactions across many computers, ensuring data integrity and immutability. It's the underlying technology for cryptocurrencies and many Web3 applications.
*   **Web3:** The next generation of the internet, built on decentralized blockchain technology, aiming to give users more control over their data and identity. It shifts power from large centralized entities to individual users through concepts like decentralization, openness, and greater user utility.

## 2. Core Concepts of Blockchain Technology

### 2.1 Decentralization
*   **Principle:** No single entity, authority, or server controls the network. Instead, participants (nodes) collectively maintain and validate the ledger.
*   **Benefit:** Reduces single points of failure, enhances censorship resistance, and fosters trust among participants without needing intermediaries.

### 2.2 Immutability
*   **Principle:** Once a transaction (or a block of transactions) is added to the blockchain and validated, it cannot be altered, removed, or reversed. It becomes a permanent record.
*   **Mechanism:** Achieved through cryptographic linking of blocks. Each new block contains a cryptographic hash of the previous block, creating an unbreakable chain.

### 2.3 Transparency
*   **Principle:** All transactions on a public blockchain are visible to everyone on the network. Anyone can inspect the ledger.
*   **Identity:** While transactions are transparent, participants typically remain pseudonymous, identified only by their wallet addresses, not personal names.

### 2.4 Security
*   **Cryptographic Hashing:** Each block contains a unique hash (a fixed-size alphanumeric string) of the previous block's data. Any alteration in a previous block would change its hash, making it invalid and breaking the chain's integrity. Example: `Hash(Block N) = SHA256(Timestamp + Transactions + Previous Block Hash + Nonce)`
*   **Digital Signatures:** Transactions are digitally signed by the sender using their private key, proving ownership of the assets and preventing unauthorized tampering.
*   **Consensus Mechanisms:** Protocols that ensure all nodes in the network agree on the validity of new transactions and the current state of the ledger, preventing fraudulent activity.

### 2.5 Distributed Ledger Technology (DLT)
*   **Principle:** The ledger (database) is replicated and synchronized across all participating nodes in the network. Every node maintains an identical copy of the entire ledger.
*   **Benefit:** Enhances redundancy and resilience, as there is no single point of failure for data storage.

### 2.6 Blocks and Chains
*   **Blocks:** Data structures that contain a set of validated transactions, a timestamp, a reference to the previous block's hash, and a nonce (a number used once). They are akin to pages in a ledger.
*   **Chain:** Blocks are cryptographically linked together in chronological order, forming an unbroken, tamper-proof chain of records.

## 3. Consensus Mechanisms

Consensus mechanisms are algorithms that allow a distributed network to agree on the single truth of the ledger.

*   **Proof of Work (PoW):** Nodes (miners) compete to solve a complex mathematical puzzle. The first to solve it gets to add the next block to the chain and earns a reward. This process consumes significant computational power.
    *   **Examples:** Bitcoin, older Ethereum (prior to The Merge).
*   **Proof of Stake (PoS):** Validators are chosen to create new blocks based on the amount of cryptocurrency they 