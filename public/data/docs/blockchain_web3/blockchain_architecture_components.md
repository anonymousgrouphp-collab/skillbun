# Blockchain Architecture & Components

Blockchain technology is a decentralized, distributed ledger system that underpins cryptocurrencies and many other Web3 applications. Understanding its fundamental architecture is crucial for any Web3 developer. This guide will break down the core components that make up a blockchain.

## 1. Block Structure

A blockchain is, at its core, a chain of blocks. Each block is a container for data, primarily transactions, and is cryptographically linked to the previous block.

### Components of a Block:

*   **Block Header**: Contains metadata about the block.
    *   `Version`: Software version of the block.
    *   `Timestamp`: The time the block was mined/created.
    *   `Merkle Root`: A hash of all the transactions in the block, allowing efficient verification that a transaction is included without processing all transactions.
    *   `Previous Block Hash`: The cryptographic hash of the preceding block, creating the "chain." This is the key to immutability.
    *   `Nonce`: A number that miners/validators adjust to find a valid hash for the block (especially in Proof-of-Work).
    *   `Difficulty Target`: A number that dictates how difficult it is to find a valid hash for the block.
*   **Block Body (Transaction Data)**: A list of transactions confirmed and batched together in this block.

**Conceptual Block Structure (Pseudo-code):**

```python
import hashlib

class Block:
    def __init__(self, index, previous_hash, timestamp, transactions, nonce=0):
        self.index = index
        self.previous_hash = previous_hash
        self.timestamp = timestamp
        self.transactions = transactions # List of transaction data
        self.nonce = nonce
        self.hash = self.calculate_hash() 

    def calculate_hash(self):
        # Concatenate relevant header fields and hash them
        block_string = str(self.index) + str(self.previous_hash) + str(self.timestamp) + str(self.transactions) + str(self.nonce)
        return hashlib.sha256(block_string.encode()).hexdigest()
```

## 2. Transaction Structure

Transactions are the fundamental units of activity on a blockchain, representing a transfer of value or data.

### Components of a Transaction:

*   **Inputs**: References to previous unspent transaction outputs (UTXOs) that are being spent. Each input typically includes:
    *   `Transaction ID` of the previous transaction.
    *   `Output Index` from that transaction.
    *   `Signature` proving ownership of the funds/data.
*   **Outputs**: New UTXOs that define where the value is going. Each output typically includes:
    *   `Value`: The amount being transferred.
    *   `Recipient Address`: The public key hash of the new owner.
*   **Transaction ID (TxID)**: A unique identifier for the transaction, typically the hash of the entire transaction data.

## 3. Chain Data Structure

The blockchain is a linked list of blocks, where each block refers to its predecessor using its hash.

*   **Genesis Block**: The very first block in the chain, which has no `previous_block_hash`. It's the foundation upon which the entire chain is built.
*   **Immutability**: Once a block is added to the chain, it's extremely difficult to alter. Because each block's hash depends on its previous block's hash, changing an old block would invalidate all subsequent blocks, making the change detectable and rejectable by the network.
*   **Forks**: When two miners/validators simultaneously create the next valid block, or when different parts of the network disagree, the chain can temporarily split into multiple branches. Consensus rules (e.g., "longest chain wins" in Proof-of-Work) resolve these forks.

## 4. Network Nodes

Blockchain networks are made up of numerous nodes, each playing a role in maintaining and securing the ledger.

*   **Full Nodes**: Store a complete copy of the entire blockchain ledger, validate all transactions and blocks, and propagate them across the network. They provide the highest level of security and decentralization.
*   **Light Nodes (SPV Nodes)**: Store only block headers and request specific information (like transaction verification) from full nodes. They are faster and require less storage, suitable for mobile devices.
*   **Miners/Validators**: Nodes actively participating in the consensus mechanism to create new blocks.
    *   **Miners (Proof-of-Work)**: Compete to solve cryptographic puzzles to add new blocks.
    *   **Validators (Proof-of-Stake)**: Are selected based on their stake to propose and validate new blocks.

## 5. Peer-to-Peer (P2P) Communication

Blockchain networks operate as decentralized P2P networks.

*   **Node Discovery**: Nodes discover each other using various mechanisms, often starting with a list of "seed nodes" or through existing connections.
*   **Gossip Protocol**: Once connected, nodes communicate by "gossiping" information (new transactions, new blocks) to their peers. Each node validates the received information and then passes it on to its own peers.
*   **Broadcasting**: When a user creates a transaction, they broadcast it to the network. Nodes validate it and relay it until it reaches a miner/validator who includes it in a block. Similarly, new blocks are broadcast once found.

## 6. Consensus Mechanisms Overview

Consensus mechanisms are algorithms that ensure all distributed nodes in the network agree on the current state of the ledger, preventing double-spending and maintaining security.

### Proof-of-Work (PoW)

*   **Concept**: Participants (miners) compete to solve a computationally intensive mathematical puzzle (finding a `nonce` that, when hashed with the block data, results in a hash below a certain `difficulty target`). The first to find it gets to add the new block and receives a reward.
*   **Security**: Relies on the significant computational work required, making it extremely expensive and difficult to attack (e.g., a 51% attack).
*   **Characteristics**:
    *   Energy-intensive.
    *   Often leads to specialized mining hardware (ASICs).
    *   Examples: Bitcoin, older Ethereum.

### Proof-of-Stake (PoS)

*   **Concept**: Participants (validators) "stake" a certain amount of the network's native cryptocurrency as collateral. Instead of competing computationally, a validator is pseudo-randomly selected to create the next block based on the amount they've staked and other factors. If they propose an invalid block, they risk losing their stake.
*   **Security**: Relies on economic incentives; attacking the network would require owning a significant portion of the total supply and risking its loss.
*   **Characteristics**:
    *   Energy-efficient.
    *   Lower hardware requirements for participation.
    *   Examples: Ethereum 2.0, Solana, Cardano.

---

### Checklist/Exercise:

1.  Explain how the `previous_block_hash` in a block's header contributes to a blockchain's immutability.
2.  Differentiate between the roles of a "Full Node" and a "Light Node" in a blockchain network.
3.  Describe the primary trade-off between Proof-of-Work (PoW) and Proof-of-Stake (PoS) consensus mechanisms.