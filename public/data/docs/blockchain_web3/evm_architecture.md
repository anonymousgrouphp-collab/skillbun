# EVM Architecture & Opcodes

The Ethereum Virtual Machine (EVM) is the decentralized, single-instance runtime environment that executes smart contract code on the Ethereum blockchain. Understanding its intricate architecture and the low-level opcodes it processes is paramount for any Web3 developer aiming to build efficient, secure, and gas-optimized decentralized applications.

## 1. EVM's Stack-Based Architecture

The EVM is designed as a stack-based machine. All computations within the EVM are performed by manipulating 32-byte (256-bit) words on a stack. When an opcode executes, it typically pops elements from the top of the stack, performs an operation, and pushes the result back onto the stack.

*   **Stack:** A volatile, transient area that stores up to 1024 32-byte words. It's where all arithmetic, logical, and cryptographic operations take place. Data is added (pushed) and removed (popped) from the top.

## 2. Data Locations in the EVM

The EVM defines several distinct areas for data management, each with unique characteristics regarding persistence, cost, and accessibility.

### 2.1 Memory
*   **Volatile & Transient:** Data in memory exists only for the duration of a single message call (internal or external). It is erased between external contract calls.
*   **Byte-Addressable:** Memory can be read from and written to at the byte level.
*   **Cost:** Accessing memory costs gas, and the cost increases as memory usage expands, in chunks of 32 bytes.
*   **Usage:** Ideal for temporary variables, function arguments for internal calls, and storing data that needs to be manipulated during the current execution context.

### 2.2 Storage
*   **Persistent & Stateful:** Storage is the permanent data store for a contract, analogous to a database. It's part of the blockchain's state and persists across transactions and function calls.
*   **Key-Value Store:** Logically, it's a mapping from `uint256` (slot) to `uint256` (value), where each slot holds a 32-byte word.
*   **Expensive:** Writing to storage (using `SSTORE` opcode) is the most expensive operation due to its permanence and impact on the global state size.
*   **Usage:** Stores all state variables declared in a Solidity contract.

### 2.3 Calldata
*   **Immutable & Read-Only:** Calldata is a special read-only byte array that holds the input parameters of an **external** function call.
*   **Non-Modifiable:** Its contents cannot be changed by the contract during execution.
*   **Gas-Efficient:** Cheaper than memory for reading data, especially for large inputs, as it's not copied to memory unless explicitly requested.
*   **Usage:** Contains the 4-byte function selector and the encoded arguments passed to an external function. 

### 2.4 Return Data
*   **Volatile & Transient:** Holds the return value of the most recently executed external contract call.
*   **Access:** Not directly accessible; its size can be queried using `RETURNDATASIZE`, and its contents can be copied to memory using `RETURNDATACOPY`.
*   **Usage:** The output data from an external contract's function execution.

## 3. Execution Environment

The EVM provides access to various environmental parameters specific to the current transaction and block. These parameters are crucial for writing context-aware smart contracts:

*   `msg.sender`: The address of the account that initiated the current external call.
*   `msg.value`: The amount of Ether (in Wei) sent with the current call.
*   `gasprice`: The gas price of the transaction.
*   `block.timestamp`: The Unix timestamp of the current block.
*   `block.number`: The number of the current block.
*   `tx.origin`: The address of the original externally owned account (EOA) that started the transaction chain.

## 4. EVM Opcodes

Opcodes are the atomic instructions that the EVM executes. Each opcode has a specific gas cost and performs a singular operation. They are 1-byte instructions.

### Key Categories & Examples:

1.  **Stack Operations:** Push (`PUSH1` to `PUSH32`), Pop (`POP`), Duplicate (`DUP1` to `DUP16`), Swap (`SWAP1` to `SWAP16`).
2.  **Arithmetic & Logic:** Add (`ADD`), Subtract (`SUB`), Multiply (`MUL`), Divide (`DIV`), Modulo (`MOD`), Exponentiation (`EXP`), Bitwise operations (`AND`, `OR`, `XOR`, `NOT`).
3.  **Memory Operations:** Load from memory (`MLOAD`), Store to memory (`MSTORE`, `MSTORE8`).
4.  **Storage Operations:** Load from storage (`SLOAD`), Store to storage (`SSTORE`). These interact directly with the contract's persistent state.
5.  **Calldata & Return Data:** Get calldata size (`CALLDATASIZE`), Load from calldata (`CALLDATALOAD`), Copy calldata to memory (`CALLDATACOPY`), Get return data size (`RETURNDATASIZE`), Copy return data to memory (`RETURNDATACOPY`).
6.  **Control Flow:** Unconditional jump (`JUMP`), Conditional jump (`JUMPI`), Halt execution (`STOP`), Return data and halt (`RETURN`), Revert state changes and return data (`REVERT`).
7.  **Environmental Information:** Get current contract address (`ADDRESS`), Caller address (`CALLER`), Value sent (`CALLVALUE`), Gas price (`GASPRICE`), Block timestamp (`TIMESTAMP`), Block number (`NUMBER`), Remaining gas (`GAS`), Chain ID (`CHAINID`).

## Simple Solidity Example to EVM Concepts

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DataLocations {
    uint256 public storedNumber; // Stored in contract storage
    string public storedString;  // Stored in contract storage

    // _value comes in via calldata for external calls
    // storedNumber is updated in storage (SSTORE)
    function setNumber(uint256 _value) public {
        storedNumber = _value; 
    }

    // _text comes in via calldata for external calls
    // storedString is updated in storage (SSTORE) after _text is copied to memory
    function setString(string calldata _text) public {
        storedString = _text; 
    }

    // This function demonstrates memory usage for temporary variables
    function concatAndStore(string memory _a, string memory _b) public {
        // abi.encodePacked creates a new bytes array in memory
        bytes memory tempBytes = abi.encodePacked(_a, _b); 
        storedString = string(tempBytes); // Copy from memory to storage
    }

    // This function returns a value, which would become return data for an external caller
    function getSum(uint256 a, uint256 b) public pure returns (uint256) {
        // a and b are internal function parameters, typically handled on the stack or in memory
        return a + b; // Uses ADD opcode
    }
}
```

*   `storedNumber` and `storedString` are state variables, permanently residing in the contract's `storage`. Any modification (`SSTORE`) is costly.
*   The `_value` and `_text` parameters in `setNumber` and `setString` respectively, arrive in `calldata` when these functions are called externally.
*   In `concatAndStore`, `_a`, `_b`, and `tempBytes` are all handled in `memory` for the duration of the function call, providing efficient temporary storage before the result is copied to `storage`.
*   The return value of `getSum` would be placed into the `return data` area for the calling contract or client.

## Checklist/Exercise

1.  **Differentiate Data Persistence:** Explain the key differences in terms of persistence and gas cost between EVM `memory` and `storage`. Provide an example scenario where you would use each.
2.  **Opcode Functionality:** What are the primary functions of the `MLOAD`, `SSTORE`, and `CALLDATACOPY` opcodes? Briefly describe how each interacts with its respective data location.
3.  **Environmental Parameters:** Name three environmental parameters accessible via opcodes or Solidity globals. How can a contract use `msg.sender` and `msg.value` to implement a simple payable function? (e.g., a basic withdrawal mechanism).
