# Secure Contract Design Best Practices

Designing secure smart contracts is paramount in the blockchain space, where vulnerabilities can lead to significant financial losses and erode user trust. This guide covers essential secure design patterns and practices to mitigate common risks in Solidity contracts.

## 1. Checks-Effects-Interactions (CEI) Pattern

The Checks-Effects-Interactions (CEI) pattern is a fundamental security principle used to prevent reentrancy attacks and other unexpected behaviors. It dictates a strict order of operations within a function that interacts with external contracts or sends Ether:

1.  **Checks:** Verify all preconditions and inputs (e.g., `require` statements for sender, amount, permissions, contract state).
2.  **Effects:** Make all state changes (e.g., update balances, modify ownership, set flags) that result from the transaction.
3.  **Interactions:** Perform any external calls (e.g., sending Ether to another address, calling another contract's function).

By ensuring all state changes occur *before* any external calls, you prevent external calls from re-entering your contract and manipulating its state before the original transaction fully completes and the state is updated.

```solidity
pragma solidity ^0.8.0;

contract VulnerableWithdraw {
    mapping(address => uint) public balances;

    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }

    // Vulnerable to reentrancy due to state update AFTER external call
    function withdrawVulnerable(uint _amount) public {
        require(balances[msg.sender] >= _amount, "Insufficient balance");
        (bool success, ) = msg.sender.call{value: _amount}(""); // External call
        require(success, "Transfer failed");
        balances[msg.sender] -= _amount; // State update after interaction
    }

    // Secure using CEI pattern
    function withdrawSecure(uint _amount) public {
        // 1. Checks
        require(balances[msg.sender] >= _amount, "Insufficient balance");

        // 2. Effects
        balances[msg.sender] -= _amount; // State update before external call

        // 3. Interactions
        (bool success, ) = msg.sender.call{value: _amount}("");
        require(success, "Transfer failed");
    }
}
```

## 2. Pull vs. Push Payments

When designing systems for distributing Ether, contracts can either 