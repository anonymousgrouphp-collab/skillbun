# DLT & Cryptography Basics: A Foundational Study Guide

Welcome to the foundational module on Distributed Ledger Technology (DLT) and Cryptography! These concepts are the bedrock of Web3 and blockchain applications, providing the security, integrity, and trustless nature that defines this revolutionary technology. Understanding these primitives is crucial for any aspiring blockchain developer.

## 1. Cryptographic Hashing

A cryptographic hash function is a mathematical algorithm that maps data of arbitrary size to a bit array of a fixed size. It's a fundamental primitive for ensuring data integrity and creating unique identifiers.

### Core Properties of Cryptographic Hash Functions:
*   **Deterministic**: The same input will always produce the same output hash.
*   **Fixed-size Output**: Regardless of the input size (a single character or an entire movie), the output hash will always be of a fixed length.
*   **One-way (Pre-image Resistance)**: It is computationally infeasible to reverse the process; that is, to find the original input data given only the hash output.
*   **Collision Resistance**: It is computationally infeasible to find two different inputs that produce the exact same output hash.
*   **Avalanche Effect**: A tiny change in the input data (even a single bit) results in a drastically different output hash.

### Common Hash Functions in DLT:
*   **SHA-256 (Secure Hash Algorithm 256-bit)**: Widely used in Bitcoin for proof-of-work, block header hashes, and transaction IDs. It produces a 256-bit (64 hexadecimal characters) hash.
*   **Keccak-256**: Used extensively in Ethereum for various purposes, including generating addresses from public keys, transaction hashes, and block headers. While often colloquially referred to as `SHA-3` in Ethereum contexts, it's technically a distinct member of the Keccak family.

## 2. Public-Key Cryptography (Asymmetric Cryptography)

Public-key cryptography uses a pair of mathematically linked keys: a **private key** and a **public key**. This system enables secure communication and digital signatures without the need for a shared secret.

*   **Private Key**: A secret number that only the owner knows. It's used to create digital signatures or decrypt data meant for the owner. Its security is paramount.
*   **Public Key**: Derived from the private key, but cannot be used to deduce the private key. It can be openly shared and is used to verify signatures created by the corresponding private key or to encrypt data intended for the private key holder.

**How it works in DLT:**
*   **Wallet Addresses**: In many blockchains, your public key (or a hash of it) serves as your public address, where others can send you funds.
*   **Transaction Signing**: You use your private key to 