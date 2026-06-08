# DAOs & On-Chain Governance

Decentralized Autonomous Organizations (DAOs) represent a paradigm shift in how organizations can be structured and operated. Built on blockchain technology, DAOs leverage smart contracts to automate governance rules and ensure transparency, immutability, and decentralization. This study guide explores their core structure, functionality, and the mechanisms of on-chain governance.

## 1. Understanding Decentralized Autonomous Organizations (DAOs)

A DAO is an organization represented by rules encoded as a transparent computer program, controlled by the organization's members, and not influenced by a central government. They are often compared to a company without a CEO, governed by code and community.

**Core Principles:**
*   **Decentralization:** No single point of control; decision-making is distributed among members.
*   **Transparency:** All transactions, rules, and proposals are recorded on a public blockchain.
*   **Immutability:** Once rules are set in smart contracts, they are difficult to change without community consensus.
*   **Community-driven:** Members actively participate in decision-making and project direction.

## 2. Structure and Components of a DAO

DAOs are complex systems composed of several key elements:

*   **Smart Contracts:** The foundational layer. These self-executing contracts define the DAO's rules, voting procedures, treasury management, and how proposals are created and enacted.
*   **Governance Tokens:** Digital assets that grant holders voting rights and often a share in the DAO's treasury or future revenue. The number of tokens typically dictates a member's voting power.
*   **Treasury:** A blockchain-based wallet or smart contract that holds the DAO's funds (cryptocurrencies, NFTs, etc.). Funds are managed collectively through governance proposals.
*   **Community:** The members who hold governance tokens, create proposals, vote, and contribute to the DAO's mission.

## 3. On-Chain Governance Mechanisms

On-chain governance refers to the process where decisions are made and executed directly on a blockchain through smart contracts.

### a. Proposal Creation
Any token holder (often subject to a minimum token threshold) can create a proposal. Proposals typically outline changes, funding requests, or strategic decisions.

### b. Voting Mechanisms
The method by which members cast their votes and how those votes are tallied is crucial.

*   **Token-Weighted Voting (1 token = 1 vote):** The most common method. The more governance tokens a member holds, the more voting power they have. While simple, it can lead to plutocracy (control by wealthy token holders).
*   **Quadratic Voting:** Aims to reduce the influence of large token holders. The cost of additional votes increases quadratically (e.g., 1 vote costs 1 token, 2 votes cost 4 tokens, 3 votes cost 9 tokens). This encourages broader participation and signals intensity of preference.
*   **Delegated Voting (Liquid Democracy):** Token holders can delegate their voting power to another member (a "delegate" or "representative") who they trust to vote on their behalf. This allows for more informed decision-making without requiring every member to be constantly engaged.

### c. Execution
Once a proposal passes the voting threshold (e.g., majority vote, minimum quorum), the associated smart contract automatically executes the proposed action. This could be sending funds from the treasury, upgrading a protocol, or changing a parameter.

## 4. Treasury Management

A DAO's treasury holds its collective assets, which are critical for funding operations, development, and community initiatives. Funds in the treasury are not controlled by any single individual but are managed collectively through passed governance proposals. This ensures that expenditures align with the community's consensus. Multi-signature wallets or specific treasury smart contracts are often used to secure and manage these funds.

## 5. Popular DAO Platforms

Several platforms facilitate the creation and management of DAOs, abstracting away much of the underlying smart contract complexity.

*   **Aragon:** A comprehensive framework for building DAOs with customizable governance modules. It provides tools for creating voting mechanisms, managing treasuries, and even dispute resolution.
*   **Snapshot:** A widely used platform for **off-chain, gas-less voting**. While votes are recorded off-chain, they are cryptographically signed and verified using IPFS, offering transparency without transaction fees. Snapshots can be integrated with on-chain execution mechanisms via relayers or other smart contracts.
*   **Tally:** A governance aggregator and explorer. Tally allows users to discover DAOs, track governance proposals, review voting histories, and participate in voting across various protocols. It provides a transparent view into the on-chain governance landscape.

## 6. Simple Voting Smart Contract (Conceptual Example)

This is a simplified Solidity pseudo-code demonstrating a basic voting contract. Real-world DAO contracts are far more complex.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleDAO {
    struct Proposal {
        uint id;
        string description;
        uint voteCount;
        mapping(address => bool) hasVoted; // Check if an address has voted
        bool executed;
    }

    mapping(uint => Proposal) public proposals;
    uint public nextProposalId;
    address public owner; // For simplicity, assume owner creates proposals
    uint public totalTokenSupply; // Simplified: in a real DAO, this would be a governance token contract

    constructor(uint _initialSupply) {
        owner = msg.sender;
        totalTokenSupply = _initialSupply; // Represents total tokens in circulation for simplicity
        nextProposalId = 0;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    function createProposal(string memory _description) public onlyOwner {
        proposals[nextProposalId] = Proposal(nextProposalId, _description, 0, false); // hasVoted not relevant here, mapping initialized implicitly
        nextProposalId++;
    }

    // Simplified voting: 1 address = 1 vote for now. In a real DAO, it's token-weighted.
    function vote(uint _proposalId) public {
        require(_proposalId < nextProposalId, "Proposal does not exist");
        Proposal storage proposal = proposals[_proposalId];
        require(!proposal.hasVoted[msg.sender], "Already voted on this proposal");
        require(!proposal.executed, "Proposal already executed");

        proposal.voteCount++;
        proposal.hasVoted[msg.sender] = true;
    }

    function executeProposal(uint _proposalId) public onlyOwner {
        require(_proposalId < nextProposalId, "Proposal does not exist");
        Proposal storage proposal = proposals[_proposalId];
        require(!proposal.executed, "Proposal already executed");
        // Simplified condition: 50% + 1 of total token supply (conceptual for 1 address = 1 token)
        // In a real DAO, it would be based on actual token balances of voters
        require(proposal.voteCount > (totalTokenSupply / 2), "Proposal did not pass");

        // Logic to execute the proposal (e.g., transfer funds, call another contract)
        // For this example, we just mark it as executed.
        proposal.executed = true;
        // event ProposalExecuted(_proposalId);
    }
}
```

## 7. Checklist / Exercises

1.  **Define DAO:** Explain in your own words what a DAO is and list two core principles that distinguish it from traditional organizations.
2.  **Compare Voting:** Describe the key difference between token-weighted voting and quadratic voting in a DAO context, and explain why one might be preferred over the other in certain situations.
3.  **Platform Purpose:** Identify the primary use case for Snapshot in DAO governance and how it differs from platforms like Aragon.