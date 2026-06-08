# Error Handling & Assertions in Solidity

Robust error handling is crucial for developing secure and reliable smart contracts. In Solidity, you primarily use `require()`, `revert()`, and `assert()` to manage errors and enforce contract invariants. Understanding when and how to use each is fundamental for effective smart contract development.

## 1. `require()` for Input Validation and Preconditions

`require()` is used to validate conditions that should be true *before* a function's execution proceeds. It's ideal for input validation, checking state variables, or verifying conditions that are expected to be met under normal operation.

### When to use `require()`:
*   **Input Validation:** Ensure that function parameters meet specific criteria (e.g., `amount > 0`).
*   **State Preconditions:** Verify that the contract is in an expected state before executing logic (e.g., `msg.sender == owner`).
*   **Security Checks:** Prevent unauthorized access or operations.

### Behavior:
If the condition inside `require()` evaluates to `false`, the transaction immediately reverts. This means all changes made to the state are undone, and any remaining gas is refunded to the caller. You can include an optional error message string that will be returned with the revert.

### Gas Implications:
`require()` consumes gas up to the point of failure and then refunds the remaining gas. This makes it gas-efficient for expected error conditions.

### Example:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Wallet {
    mapping(address => uint) public balances;

    constructor() {
        balances[msg.sender] = 100 ether; // Initial balance for deployer
    }

    function deposit() public payable {
        require(msg.value > 0, "Deposit amount must be greater than zero.");
        balances[msg.sender] += msg.value;
    }

    function withdraw(uint _amount) public {
        require(_amount > 0, "Withdraw amount must be greater than zero.");
        require(balances[msg.sender] >= _amount, "Insufficient balance.");
        
        balances[msg.sender] -= _amount;
        payable(msg.sender).transfer(_amount);
    }
}
```

## 2. `revert()` for Custom Error Handling

`revert()` is a low-level function that explicitly stops execution and reverts all state changes. It is functionally similar to `require()` in terms of reverting the transaction and refunding gas, but it offers more flexibility, especially when combined with [custom errors](https://docs.soliditylang.org/en/latest/control-structures.html#custom-errors) (introduced in Solidity 0.8.4).

### When to use `revert()`:
*   **Complex Conditions:** When conditions are too complex for a single `require()` statement or involve multiple branches.
*   **Custom Error Types:** To define and use named custom errors, which are more gas-efficient than string messages and provide clearer error identification programmatically.

### Behavior:
Like `require()`, `revert()` stops execution, reverts state changes, and refunds unused gas. Custom errors help reduce transaction costs compared to string messages.

### Gas Implications:
`revert()` with custom errors generally consumes less gas than `require()` with string messages for the same logic, especially when the error is not triggered. When triggered, it refunds unused gas.

### Example (with Custom Errors):

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract MyContract {
    address public owner;

    // Define custom errors
    error UnauthorizedAccess(address caller, address expectedOwner);
    error InvalidAmount(uint provided, uint expectedMin);

    constructor() {
        owner = msg.sender;
    }

    function doSomethingOnlyOwnerCan(uint _value) public {
        if (msg.sender != owner) {
            revert UnauthorizedAccess(msg.sender, owner);
        }
        if (_value == 0) {
            revert InvalidAmount(_value, 1);
        }
        // ... logic only owner can execute
    }
}
```

## 3. `assert()` for Internal State Consistency

`assert()` is used to check for conditions that *should never be false* if the contract logic is sound. It's typically used to catch internal errors and guarantee invariants. If an `assert()` fails, it indicates a serious bug in your contract's code, or potentially a storage corruption.

### When to use `assert()`:
*   **Invariant Checking:** Verify that core contract properties remain true after operations (e.g., `totalBalance == sumOfAllBalances`).
*   **Preventing Overflow/Underflow:** (Less common since Solidity 0.8.0 introduced default checked arithmetic, but still relevant for unchecked blocks or older versions).
*   **Detecting Compiler/Hardware Bugs:** As a last resort, to catch extremely unlikely but critical failures.

### Behavior:
If the condition inside `assert()` evaluates to `false`, the transaction also reverts, but it consumes *all* remaining gas. This is a key difference from `require()` and `revert()`. The EVM instruction used by `assert()` on failure is `0xfe` (invalid opcode), which consumes all gas.

### Gas Implications:
`assert()` consumes all remaining gas upon failure. This is designed to signal a critical, unrecoverable error and help identify bugs during development and testing, rather than being part of expected control flow.

### Example:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Bank {
    mapping(address => uint) public balances;
    uint public totalDeposits;

    constructor() {
        totalDeposits = 0;
    }

    function deposit() public payable {
        require(msg.value > 0, "Deposit amount must be greater than zero.");
        balances[msg.sender] += msg.value;
        totalDeposits += msg.value;
        // This invariant should always hold true assuming no external factors
        assert(totalDeposits >= balances[msg.sender]); 
    }

    function transfer(address _to, uint _amount) public {
        require(balances[msg.sender] >= _amount, "Insufficient balance.");
        require(_to != address(0), "Cannot transfer to zero address.");

        balances[msg.sender] -= _amount;
        balances[_to] += _amount;
        
        // Invariant: The sum of all balances should always equal totalDeposits
        // This assert statement helps catch internal logic errors if the calculation goes wrong.
        // In a real contract, you'd likely track the sum of *all* balances more robustly.
        // For simplicity, let's assume totalDeposits represents the total money in the contract.
        // A more complex assert would verify the sum of all 'balances' map entries.
        assert(totalDeposits == balances[msg.sender] + balances[_to] + (totalDeposits - (balances[msg.sender] + balances[_to])));
    }
}
```

### Key Differences and Best Practices:

| Feature           | `require()`                                     | `revert()` (with custom error)                        | `assert()`                                      |
| :---------------- | :---------------------------------------------- | :---------------------------------------------------- | :---------------------------------------------- |
| **Purpose**       | Input validation, preconditions, expected errors | Custom error handling, complex conditions, gas optimization | Internal errors, state invariants, 