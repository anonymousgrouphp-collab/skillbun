## Common Smart Contract Design Patterns

Smart contract design patterns are reusable, proven solutions to common problems encountered when developing decentralized applications (dApps) on the blockchain. They help developers write more secure, efficient, and maintainable code, addressing unique challenges and vulnerabilities inherent in blockchain environments, such as reentrancy attacks, upgradeability, and off-chain data integration.

### 1. Withdrawal Pattern

*   **Concept**: The Withdrawal Pattern is a security-focused approach to safely manage the transfer of Ether or tokens from a smart contract. Instead of sending funds directly from the contract (which can be susceptible to reentrancy attacks if not handled with extreme care), this pattern separates the deposit logic from the withdrawal logic. Users claim their funds by initiating a withdrawal, and the contract updates their balance *before* attempting the external transfer.
*   **Why it's crucial**: Primarily prevents reentrancy attacks by ensuring that state changes (e.g., zeroing out a user's balance) occur *before* any external calls are made, thus eliminating the window for re-entry.
*   **Implementation**: A common approach involves maintaining a mapping of user addresses to their withdrawable balances. A `deposit()` function adds to the balance, and a `withdraw()` function first sets the user's balance to zero, then attempts to send the Ether using `call{value: amount}("")`.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract WithdrawalPattern {
    mapping(address => uint256) public balances;

    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw() public {
        uint256 amount = balances[msg.sender];
        require(amount > 0, "No funds to withdraw");

        balances[msg.sender] = 0; // Crucial: State change before external call

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Withdrawal failed");
    }
}
```

### 2. Emergency Stop (Pausable) Pattern

*   **Concept**: This pattern provides a 